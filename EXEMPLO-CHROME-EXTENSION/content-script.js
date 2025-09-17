// CONTENT SCRIPT PARA WHATSAPP WEB
// Este arquivo é injetado no WhatsApp Web

class WhatsAppIAController {
  constructor() {
    this.currentPhone = null;
    this.companyId = null;
    this.isIAActive = true;
    this.apiBase = 'https://conta.dominio.tech/api';
    
    this.init();
  }

  async init() {
    console.log('🚀 WhatsApp IA Controller iniciado');
    
    // Aguardar WhatsApp carregar
    await this.waitForWhatsApp();
    
    // Configurar observadores
    this.setupObservers();
    
    // Criar interface
    this.createInterface();
    
    // Carregar configurações
    await this.loadConfig();
  }

  async waitForWhatsApp() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const chatList = document.querySelector('[data-testid="chat-list"]');
        if (chatList) {
          clearInterval(checkInterval);
          console.log('✅ WhatsApp Web carregado');
          resolve();
        }
      }, 1000);
    });
  }

  setupObservers() {
    // Observar mudanças de chat
    const chatHeader = document.querySelector('header[data-testid="conversation-header"]');
    if (chatHeader) {
      const observer = new MutationObserver(() => {
        this.onChatChange();
      });
      
      observer.observe(chatHeader, { 
        childList: true, 
        subtree: true 
      });
    }

    // Observar mudanças na URL
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        this.onChatChange();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  async onChatChange() {
    const newPhone = this.extractPhoneFromUrl();
    if (newPhone && newPhone !== this.currentPhone) {
      this.currentPhone = newPhone;
      console.log('📱 Chat mudou para:', newPhone);
      
      // Atualizar status da IA
      await this.updateIAStatus();
      
      // Carregar dados do cliente
      await this.loadCustomerData();
    }
  }

  extractPhoneFromUrl() {
    const match = location.href.match(/\/([0-9]+@[cs]\.us|[0-9]+-[0-9]+@g\.us)/);
    return match ? match[1] : null;
  }

  createInterface() {
    // Criar botão de controle
    this.createControlButton();
    
    // Criar sidebar
    this.createSidebar();
    
    // Criar templates
    this.createTemplates();
  }

  createControlButton() {
    const button = document.createElement('div');
    button.id = 'ia-control-button';
    button.className = 'ia-control-button';
    button.innerHTML = `
      <div class="ia-status-indicator ${this.isIAActive ? 'active' : 'paused'}">
        <span class="ia-icon">${this.isIAActive ? '🤖' : '👤'}</span>
        <span class="ia-text">${this.isIAActive ? 'IA' : 'MANUAL'}</span>
      </div>
    `;
    
    button.addEventListener('click', () => this.toggleIA());
    document.body.appendChild(button);
  }

  createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'customer-sidebar';
    sidebar.className = 'customer-sidebar hidden';
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h3>Informações do Cliente</h3>
        <button id="close-sidebar">×</button>
      </div>
      <div class="sidebar-content">
        <div class="customer-info">
          <div class="loading">Carregando...</div>
        </div>
        <div class="customer-orders">
          <h4>Pedidos Recentes</h4>
          <div class="orders-list"></div>
        </div>
        <div class="customer-cashback">
          <h4>Cashback</h4>
          <div class="cashback-info"></div>
        </div>
      </div>
    `;
    
    // Adicionar eventos
    sidebar.querySelector('#close-sidebar').addEventListener('click', () => {
      sidebar.classList.add('hidden');
    });
    
    document.body.appendChild(sidebar);
  }

  createTemplates() {
    const templatesDiv = document.createElement('div');
    templatesDiv.id = 'quick-templates';
    templatesDiv.className = 'quick-templates';
    templatesDiv.innerHTML = `
      <div class="templates-header">Templates Rápidos</div>
      <div class="templates-buttons">
        <button class="template-btn" data-template="cardapio">🍕 Cardápio</button>
        <button class="template-btn" data-template="horario">⏰ Horário</button>
        <button class="template-btn" data-template="entrega">🚚 Entrega</button>
        <button class="template-btn" data-template="cashback">💰 Cashback</button>
      </div>
    `;
    
    // Adicionar eventos aos templates
    templatesDiv.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.insertTemplate(e.target.dataset.template);
      });
    });
    
    // Inserir próximo à área de digitação
    const footer = document.querySelector('footer[data-testid="conversation-compose"]');
    if (footer) {
      footer.parentNode.insertBefore(templatesDiv, footer);
    }
  }

  async toggleIA() {
    if (!this.currentPhone) {
      alert('Selecione uma conversa primeiro');
      return;
    }

    try {
      const endpoint = this.isIAActive ? '/pause-assistant' : '/resume-assistant';
      const body = {
        phone: this.currentPhone,
        company_id: this.companyId,
        paused_by: 'extension@user'
      };

      const response = await fetch(`${this.apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      
      if (result.success) {
        this.isIAActive = !this.isIAActive;
        this.updateButtonVisual();
        console.log(`${this.isIAActive ? '✅ IA ativada' : '🔴 IA pausada'} para ${this.currentPhone}`);
      }
    } catch (error) {
      console.error('Erro ao alterar status da IA:', error);
      alert('Erro ao alterar status da IA');
    }
  }

  updateButtonVisual() {
    const button = document.querySelector('#ia-control-button');
    if (button) {
      const indicator = button.querySelector('.ia-status-indicator');
      indicator.className = `ia-status-indicator ${this.isIAActive ? 'active' : 'paused'}`;
      
      const icon = button.querySelector('.ia-icon');
      const text = button.querySelector('.ia-text');
      
      icon.textContent = this.isIAActive ? '🤖' : '👤';
      text.textContent = this.isIAActive ? 'IA' : 'MANUAL';
    }
  }

  async updateIAStatus() {
    if (!this.currentPhone) return;

    try {
      const response = await fetch(
        `${this.apiBase}/assistant-status?phone=${this.currentPhone}&company_id=${this.companyId}`
      );
      const status = await response.json();
      
      this.isIAActive = !status.is_paused;
      this.updateButtonVisual();
    } catch (error) {
      console.error('Erro ao verificar status da IA:', error);
    }
  }

  async loadCustomerData() {
    if (!this.currentPhone) return;

    try {
      const response = await fetch(
        `${this.apiBase}/customer-info?phone=${this.currentPhone}&company_id=${this.companyId}`
      );
      const data = await response.json();
      
      this.updateCustomerSidebar(data);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    }
  }

  updateCustomerSidebar(data) {
    const sidebar = document.querySelector('#customer-sidebar');
    if (!sidebar) return;

    // Atualizar informações do cliente
    const customerInfo = sidebar.querySelector('.customer-info');
    customerInfo.innerHTML = `
      <div class="customer-details">
        <h4>${data.customer.nome}</h4>
        <p>📱 ${data.customer.telefone}</p>
        <p>📦 ${data.customer.total_pedidos || 0} pedidos</p>
        <p>📅 ${data.customer.dias_sem_comprar || 0} dias sem comprar</p>
      </div>
    `;

    // Atualizar pedidos
    const ordersList = sidebar.querySelector('.orders-list');
    if (data.recent_orders && data.recent_orders.length > 0) {
      ordersList.innerHTML = data.recent_orders.map(order => `
        <div class="order-item">
          <span class="order-number">#${order.numero_pedido}</span>
          <span class="order-status status-${order.status}">${order.status}</span>
          <span class="order-value">R$ ${order.valor_total}</span>
        </div>
      `).join('');
    } else {
      ordersList.innerHTML = '<p>Nenhum pedido encontrado</p>';
    }

    // Atualizar cashback
    const cashbackInfo = sidebar.querySelector('.cashback-info');
    cashbackInfo.innerHTML = `
      <div class="cashback-details">
        <p><strong>Disponível:</strong> R$ ${data.cashback.saldo_disponivel.toFixed(2)}</p>
        <p><strong>Total Acumulado:</strong> R$ ${data.cashback.saldo_total_acumulado.toFixed(2)}</p>
      </div>
    `;

    // Mostrar sidebar
    sidebar.classList.remove('hidden');
  }

  async insertTemplate(templateType) {
    // Encontrar caixa de texto
    const textBox = document.querySelector('[data-testid="conversation-compose-box-input"]');
    if (!textBox) return;

    let templateText = '';
    
    switch (templateType) {
      case 'cardapio':
        templateText = `🍕 Confira nosso cardápio completo: https://pedido.dominio.tech/${this.companySlug}`;
        break;
      case 'horario':
        templateText = `⏰ Nosso horário de funcionamento: Segunda a Domingo das 18h às 23h`;
        break;
      case 'entrega':
        templateText = `🚚 Fazemos entrega em toda a cidade. Taxa: R$ 5,00`;
        break;
      case 'cashback':
        templateText = `💰 Você possui cashback disponível! Verifique seu saldo.`;
        break;
    }

    // Inserir texto
    textBox.textContent = templateText;
    
    // Disparar eventos para que o WhatsApp reconheça o texto
    textBox.dispatchEvent(new Event('input', { bubbles: true }));
    textBox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async loadConfig() {
    // Carregar configurações do Chrome Storage
    const config = await chrome.storage.sync.get(['companyId', 'companySlug']);
    
    this.companyId = config.companyId || 'default-company-id';
    this.companySlug = config.companySlug || 'default-slug';
    
    console.log('⚙️ Configurações carregadas:', config);
  }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppIAController();
  });
} else {
  new WhatsAppIAController();
}
