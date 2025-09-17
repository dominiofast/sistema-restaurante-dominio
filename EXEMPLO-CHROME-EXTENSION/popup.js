// POPUP SCRIPT PARA WHATSAPP IA CONTROLLER

class PopupController {
  constructor() {
    this.apiUrl = 'https://conta.dominio.tech/api';
    this.init();
  }

  async init() {
    console.log('🚀 Popup iniciado');
    
    // Carregar configurações salvas
    await this.loadConfig();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Verificar status da conexão
    await this.checkConnection();
    
    // Carregar informações do chat atual
    await this.loadCurrentChatInfo();
    
    // Atualizar estatísticas
    await this.updateStats();
  }

  setupEventListeners() {
    // Salvar configurações
    document.getElementById('saveConfig').addEventListener('click', () => {
      this.saveConfig();
    });

    // Testar conexão
    document.getElementById('testConnection').addEventListener('click', () => {
      this.testConnection();
    });

    // Atualizar dados
    document.getElementById('refreshData').addEventListener('click', () => {
      this.refreshData();
    });

    // Limpar cache
    document.getElementById('clearCache').addEventListener('click', () => {
      this.clearCache();
    });
  }

  async loadConfig() {
    try {
      const config = await chrome.storage.sync.get([
        'companyId', 
        'companySlug', 
        'apiUrl'
      ]);

      document.getElementById('companyId').value = config.companyId || '';
      document.getElementById('companySlug').value = config.companySlug || '';
      document.getElementById('apiUrl').value = config.apiUrl || this.apiUrl;
      
      this.apiUrl = config.apiUrl || this.apiUrl;
      
      console.log('⚙️ Configurações carregadas:', config);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.showAlert('Erro ao carregar configurações', 'error');
    }
  }

  async saveConfig() {
    try {
      const config = {
        companyId: document.getElementById('companyId').value.trim(),
        companySlug: document.getElementById('companySlug').value.trim(),
        apiUrl: document.getElementById('apiUrl').value.trim() || this.apiUrl
      };

      // Validações básicas
      if (!config.companyId || !config.companySlug) {
        this.showAlert('Preencha todos os campos obrigatórios', 'warning');
        return;
      }

      await chrome.storage.sync.set(config);
      this.apiUrl = config.apiUrl;
      
      this.showAlert('Configurações salvas com sucesso!', 'success');
      console.log('💾 Configurações salvas:', config);
      
      // Verificar conexão após salvar
      setTimeout(() => this.checkConnection(), 1000);
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      this.showAlert('Erro ao salvar configurações', 'error');
    }
  }

  async checkConnection() {
    const statusDot = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');
    const statusDetails = document.getElementById('connectionDetails');

    try {
      // Verificar se configurações estão definidas
      const config = await chrome.storage.sync.get(['companyId', 'apiUrl']);
      
      if (!config.companyId || !config.apiUrl) {
        statusDot.className = 'status-dot disconnected';
        statusText.textContent = 'Configuração Incompleta';
        statusDetails.textContent = 'Configure o ID da empresa e URL da API';
        return;
      }

      // Testar conexão com a API
      const response = await fetch(`${this.apiUrl}/health-check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        statusDot.className = 'status-dot connected';
        statusText.textContent = 'Conectado';
        statusDetails.textContent = `API respondendo • ${new Date().toLocaleTimeString()}`;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro na verificação de conexão:', error);
      statusDot.className = 'status-dot disconnected';
      statusText.textContent = 'Desconectado';
      statusDetails.textContent = `Erro: ${error.message}`;
    }
  }

  async testConnection() {
    const btn = document.getElementById('testConnection');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = '🔍 Testando...';

    try {
      await this.checkConnection();
      this.showAlert('Teste de conexão concluído', 'success');
    } catch (error) {
      this.showAlert('Falha no teste de conexão', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  async loadCurrentChatInfo() {
    try {
      // Obter informações da aba ativa do WhatsApp
      const [tab] = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true, 
        url: "*://web.whatsapp.com/*" 
      });

      if (!tab) {
        document.getElementById('currentChatInfo').style.display = 'none';
        return;
      }

      // Executar script na aba para obter informações do chat
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // Extrair número do telefone da URL
          const match = location.href.match(/\/([0-9]+@[cs]\.us|[0-9]+-[0-9]+@g\.us)/);
          const phone = match ? match[1] : null;
          
          // Extrair nome do chat
          const chatName = document.querySelector('header[data-testid="conversation-header"] span[title]')?.textContent || 'Desconhecido';
          
          return { phone, chatName };
        }
      });

      const chatInfo = results[0]?.result;
      
      if (chatInfo && chatInfo.phone) {
        document.getElementById('currentChatInfo').style.display = 'block';
        
        // Buscar status do assistente para este chat
        const config = await chrome.storage.sync.get(['companyId']);
        const statusResponse = await fetch(
          `${this.apiUrl}/assistant-status?phone=${chatInfo.phone}&company_id=${config.companyId}`
        );
        const status = await statusResponse.json();
        
        document.getElementById('currentChatDetails').innerHTML = `
          <div style="font-size: 12px; line-height: 1.4;">
            <p><strong>👤 Contato:</strong> ${chatInfo.chatName}</p>
            <p><strong>📱 Telefone:</strong> ${chatInfo.phone}</p>
            <p><strong>🤖 Status IA:</strong> 
              <span style="color: ${status.is_paused ? '#ff3333' : '#00a884'}">
                ${status.is_paused ? '⏸️ Pausada' : '▶️ Ativa'}
              </span>
            </p>
            ${status.paused_by ? `<p><strong>⏸️ Pausada por:</strong> ${status.paused_by}</p>` : ''}
          </div>
        `;
      } else {
        document.getElementById('currentChatInfo').style.display = 'none';
      }
      
    } catch (error) {
      console.error('Erro ao carregar info do chat:', error);
      document.getElementById('currentChatInfo').style.display = 'none';
    }
  }

  async updateStats() {
    try {
      const config = await chrome.storage.sync.get(['companyId']);
      if (!config.companyId) return;

      // Buscar estatísticas de assistentes pausados/ativos
      const response = await fetch(`${this.apiUrl}/assistant-stats?company_id=${config.companyId}`);
      
      if (response.ok) {
        const stats = await response.json();
        
        document.getElementById('pausedCount').textContent = stats.paused || 0;
        document.getElementById('activeCount').textContent = stats.active || 0;
      }
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      document.getElementById('pausedCount').textContent = '-';
      document.getElementById('activeCount').textContent = '-';
    }
  }

  async refreshData() {
    const btn = document.getElementById('refreshData');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = '🔄 Atualizando...';

    try {
      await Promise.all([
        this.checkConnection(),
        this.loadCurrentChatInfo(),
        this.updateStats()
      ]);
      
      this.showAlert('Dados atualizados com sucesso', 'success');
    } catch (error) {
      this.showAlert('Erro ao atualizar dados', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  async clearCache() {
    const btn = document.getElementById('clearCache');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = '🗑️ Limpando...';

    try {
      // Limpar storage local
      await chrome.storage.local.clear();
      
      // Notificar content script para limpar cache
      const [tab] = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true, 
        url: "*://web.whatsapp.com/*" 
      });

      if (tab) {
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'clearCache' 
        });
      }
      
      this.showAlert('Cache limpo com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      this.showAlert('Erro ao limpar cache', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    // Limpar alertas anteriores
    container.innerHTML = '';
    container.appendChild(alert);
    
    // Remover após 3 segundos
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 3000);
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// Atualizar dados quando popup for focado
window.addEventListener('focus', async () => {
  // Pequeno delay para evitar múltiplas chamadas
  setTimeout(async () => {
    const popup = window.popupController || new PopupController();
    await popup.refreshData();
  }, 500);
});
