// BACKGROUND SERVICE WORKER PARA WHATSAPP IA CONTROLLER

class BackgroundController {
  constructor() {
    this.init();
  }

  init() {
    console.log('🔧 Background service worker iniciado');
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Configurar alarmes periódicos
    this.setupPeriodicTasks();
  }

  setupEventListeners() {
    // Quando extensão é instalada/atualizada
    chrome.runtime.onInstalled.addListener((details) => {
      this.onInstalled(details);
    });

    // Mensagens do content script ou popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Indica que a resposta será assíncrona
    });

    // Quando aba é atualizada
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.onTabUpdated(tabId, changeInfo, tab);
    });

    // Quando aba é ativada
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.onTabActivated(activeInfo);
    });

    // Alarmes periódicos
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });
  }

  onInstalled(details) {
    console.log('📦 Extensão instalada/atualizada:', details);
    
    if (details.reason === 'install') {
      // Primeira instalação - configurações iniciais
      this.setDefaultConfig();
      
      // Mostrar página de boas-vindas (opcional)
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html')
      });
    }
    
    if (details.reason === 'update') {
      // Atualização - limpar cache se necessário
      console.log('🔄 Extensão atualizada para versão:', chrome.runtime.getManifest().version);
    }
  }

  async setDefaultConfig() {
    const defaultConfig = {
      apiUrl: 'https://conta.dominio.tech/api',
      companyId: '',
      companySlug: '',
      notifications: true,
      autoRefresh: true,
      refreshInterval: 30000 // 30 segundos
    };

    await chrome.storage.sync.set(defaultConfig);
    console.log('⚙️ Configurações padrão definidas');
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('📨 Mensagem recebida:', request);

      switch (request.action) {
        case 'pauseAssistant':
          const pauseResult = await this.pauseAssistant(request.data);
          sendResponse({ success: true, data: pauseResult });
          break;

        case 'resumeAssistant':
          const resumeResult = await this.resumeAssistant(request.data);
          sendResponse({ success: true, data: resumeResult });
          break;

        case 'getAssistantStatus':
          const status = await this.getAssistantStatus(request.data);
          sendResponse({ success: true, data: status });
          break;

        case 'getCustomerInfo':
          const customerInfo = await this.getCustomerInfo(request.data);
          sendResponse({ success: true, data: customerInfo });
          break;

        case 'clearCache':
          await this.clearCache();
          sendResponse({ success: true });
          break;

        case 'showNotification':
          this.showNotification(request.data);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Ação não reconhecida' });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  onTabUpdated(tabId, changeInfo, tab) {
    // Verificar se é uma aba do WhatsApp Web
    if (changeInfo.status === 'complete' && 
        tab.url && 
        tab.url.includes('web.whatsapp.com')) {
      
      console.log('🌐 WhatsApp Web carregado:', tab.url);
      
      // Notificar content script se necessário
      chrome.tabs.sendMessage(tabId, {
        action: 'whatsappLoaded'
      }).catch(() => {
        // Ignorar erro se content script ainda não estiver pronto
      });
    }
  }

  onTabActivated(activeInfo) {
    // Verificar se a aba ativa é do WhatsApp Web
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url && tab.url.includes('web.whatsapp.com')) {
        console.log('👁️ WhatsApp Web focado');
        
        // Atualizar badge se necessário
        this.updateBadge(activeInfo.tabId);
      }
    });
  }

  setupPeriodicTasks() {
    // Criar alarme para verificações periódicas
    chrome.alarms.create('healthCheck', {
      delayInMinutes: 1,
      periodInMinutes: 5 // A cada 5 minutos
    });

    // Criar alarme para limpeza de cache
    chrome.alarms.create('cacheCleanup', {
      delayInMinutes: 60,
      periodInMinutes: 60 // A cada hora
    });
  }

  async handleAlarm(alarm) {
    console.log('⏰ Alarme disparado:', alarm.name);

    switch (alarm.name) {
      case 'healthCheck':
        await this.performHealthCheck();
        break;

      case 'cacheCleanup':
        await this.performCacheCleanup();
        break;
    }
  }

  async performHealthCheck() {
    try {
      const config = await chrome.storage.sync.get(['apiUrl', 'companyId']);
      
      if (!config.apiUrl || !config.companyId) {
        return;
      }

      // Verificar se API está respondendo
      const response = await fetch(`${config.apiUrl}/health-check`, {
        method: 'GET',
        timeout: 5000
      });

      if (!response.ok) {
        console.warn('⚠️ API não está respondendo adequadamente');
        
        // Mostrar notificação se configurado
        const { notifications } = await chrome.storage.sync.get(['notifications']);
        if (notifications) {
          this.showNotification({
            title: 'WhatsApp IA Controller',
            message: 'Problema de conectividade com a API',
            type: 'warning'
          });
        }
      } else {
        console.log('✅ Health check OK');
      }
    } catch (error) {
      console.error('Erro no health check:', error);
    }
  }

  async performCacheCleanup() {
    try {
      // Limpar dados antigos do storage local
      const storage = await chrome.storage.local.get();
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas

      for (const [key, value] of Object.entries(storage)) {
        if (value && 
            typeof value === 'object' && 
            value.timestamp && 
            (now - value.timestamp) > maxAge) {
          
          await chrome.storage.local.remove(key);
          console.log('🗑️ Removido cache antigo:', key);
        }
      }
    } catch (error) {
      console.error('Erro na limpeza de cache:', error);
    }
  }

  async pauseAssistant(data) {
    const config = await chrome.storage.sync.get(['apiUrl']);
    
    const response = await fetch(`${config.apiUrl}/pause-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Log da ação
    console.log('⏸️ Assistente pausado:', data.phone);
    
    // Mostrar notificação
    this.showNotification({
      title: 'Assistente Pausado',
      message: `IA pausada para ${data.phone}`,
      type: 'info'
    });

    return result;
  }

  async resumeAssistant(data) {
    const config = await chrome.storage.sync.get(['apiUrl']);
    
    const response = await fetch(`${config.apiUrl}/resume-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Log da ação
    console.log('▶️ Assistente retomado:', data.phone);
    
    // Mostrar notificação
    this.showNotification({
      title: 'Assistente Retomado',
      message: `IA reativada para ${data.phone}`,
      type: 'success'
    });

    return result;
  }

  async getAssistantStatus(data) {
    const config = await chrome.storage.sync.get(['apiUrl']);
    
    const response = await fetch(
      `${config.apiUrl}/assistant-status?phone=${data.phone}&company_id=${data.company_id}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  async getCustomerInfo(data) {
    const config = await chrome.storage.sync.get(['apiUrl']);
    
    const response = await fetch(
      `${config.apiUrl}/customer-info?phone=${data.phone}&company_id=${data.company_id}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  async clearCache() {
    // Limpar storage local
    await chrome.storage.local.clear();
    
    // Notificar todas as abas do WhatsApp Web
    const tabs = await chrome.tabs.query({
      url: "*://web.whatsapp.com/*"
    });

    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'cacheCleared'
        });
      } catch (error) {
        // Ignorar se content script não estiver ativo
      }
    }

    console.log('🗑️ Cache limpo');
  }

  showNotification(data) {
    const { title, message, type = 'info' } = data;
    
    // Definir ícone baseado no tipo
    const iconMap = {
      success: 'icons/success-48.png',
      error: 'icons/error-48.png',
      warning: 'icons/warning-48.png',
      info: 'icons/icon-48.png'
    };

    chrome.notifications.create({
      type: 'basic',
      iconUrl: iconMap[type] || iconMap.info,
      title: title || 'WhatsApp IA Controller',
      message: message || '',
      priority: type === 'error' ? 2 : 1
    });
  }

  async updateBadge(tabId) {
    try {
      // Contar quantos assistentes estão pausados
      const config = await chrome.storage.sync.get(['apiUrl', 'companyId']);
      
      if (!config.apiUrl || !config.companyId) {
        return;
      }

      const response = await fetch(
        `${config.apiUrl}/assistant-stats?company_id=${config.companyId}`
      );

      if (response.ok) {
        const stats = await response.json();
        const pausedCount = stats.paused || 0;

        if (pausedCount > 0) {
          chrome.action.setBadgeText({
            text: pausedCount.toString(),
            tabId: tabId
          });
          chrome.action.setBadgeBackgroundColor({
            color: '#FF6B6B',
            tabId: tabId
          });
        } else {
          chrome.action.setBadgeText({
            text: '',
            tabId: tabId
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar badge:', error);
    }
  }
}

// Inicializar background controller
new BackgroundController();
