import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { WhatsAppGlobalMonitor } from '@/components/whatsapp/WhatsAppGlobalMonitor';
import { WhatsAppGlobalNotification } from '@/components/whatsapp/WhatsAppGlobalNotification';

interface NotificationMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  chatId: string;
  companyName: string;
  timestamp: Date;
}

interface GlobalWhatsAppNotificationContextType {
  currentNotification: NotificationMessage | null;
  showNotification: (message: NotificationMessage) => void;
  hideNotification: () => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  browserNotificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

const GlobalWhatsAppNotificationContext = createContext<GlobalWhatsAppNotificationContextType | undefined>(undefined);

export const useGlobalWhatsAppNotification = () => {
  const context = useContext(GlobalWhatsAppNotificationContext);
  if (!context) {
    throw new Error('useGlobalWhatsAppNotification deve ser usado dentro de GlobalWhatsAppNotificationProvider');
  }
  return context;
};

interface GlobalWhatsAppNotificationProviderProps {
  children: React.ReactNode;
}

export const GlobalWhatsAppNotificationProvider: React.FC<GlobalWhatsAppNotificationProviderProps> = ({ 
  children 
}) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationMessage | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>('default');
  const notificationTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Auto-hide notification after 5 seconds
  const scheduleAutoHide = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setCurrentNotification(null);
    }, 5000);
  }, []);

  const showNotification = useCallback((message: NotificationMessage) => {
    if (!isEnabled) return;
    
    // Se a página está visível, mostrar popup personalizado
    if (!document.hidden) {
      setCurrentNotification(message);
      scheduleAutoHide();
    }
    // Se a página não está visível e tem permissão, mostrar notificação do navegador
    else if (browserNotificationPermission === 'granted' && 'Notification' in window) {
      try {
        const browserNotification = new Notification(`${message.companyName} - ${message.senderName}`, {
          body: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content,
          icon: message.senderAvatar || '/whatsapp-icon.png',
          badge: '/whatsapp-badge.png',
          tag: message.chatId, // Prevent duplicate notifications for same chat
          // requireInteraction: false,
          silent: false
        });

        // Auto-close browser notification after 10 seconds
        setTimeout(() => {
          browserNotification.close();
        }, 10000);

        // Navigate to chat when browser notification is clicked
        browserNotification.onclick = () => {
          window.focus();
          const url = `/whatsapp?chatId=${message.chatId}`;
          if (window.location.pathname !== '/whatsapp') {
            window.location.href = url;
          } else {
            window.history.pushState({}, '', url);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
          browserNotification.close();
        };
      } catch (error) {
        console.warn('Erro ao mostrar notificação do navegador:', error);
        // Fallback: se falhar a notificação do navegador, mostra popup
        setCurrentNotification(message);
        scheduleAutoHide();
      }
    } else if (document.hidden) {
      // Se não tem permissão e página inativa, mostrar popup quando voltar
      // Aguardar usuário voltar à aba para mostrar popup
      const showWhenVisible = () => {
        if (!document.hidden) {
          setCurrentNotification(message);
          scheduleAutoHide();
          document.removeEventListener('visibilitychange', showWhenVisible);
        }
      };
      document.addEventListener('visibilitychange', showWhenVisible);
    }
  }, [isEnabled, scheduleAutoHide, browserNotificationPermission]);

  const hideNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setCurrentNotification(null);
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotificationPermission(permission);
        return permission;
      } catch (error) {
        console.warn('Erro ao solicitar permissão de notificação:', error);
        return 'denied';
      }
    }
    return 'denied';
  }, []);

  const setEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      // Request permission when enabling notifications
      const permission = await requestNotificationPermission();
      if (permission === 'denied') {
        // If permission denied, show warning but still enable popup notifications
        console.warn('Permissão de notificação negada. Apenas popups serão exibidos.');
      }
    }
    
    setIsEnabled(enabled);
    // Persist preference
    localStorage.setItem('whatsapp_global_notifications', JSON.stringify(enabled));
  }, [requestNotificationPermission]);

  // Check browser notification permission on load
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserNotificationPermission(Notification.permission);
    }
  }, []);

  // Load notification preference
  useEffect(() => {
    const stored = localStorage.getItem('whatsapp_global_notifications');
    if (stored !== null) {
      try {
        setIsEnabled(JSON.parse(stored));
      } catch {
        // Invalid JSON, keep default
      }
    }

    // Auto-request permission if notifications are enabled
    if (stored === 'true' || stored === null) {
      requestNotificationPermission();
    }
  }, [requestNotificationPermission]);

  // Effects serão movidos para um componente separado

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <GlobalWhatsAppNotificationContext.Provider 
      value={{
        currentNotification,
        showNotification,
        hideNotification,
        isEnabled,
        setEnabled,
        browserNotificationPermission,
        requestNotificationPermission
      }}
    >
      {children}
      
      {/* Monitor de mensagens WhatsApp */}
      <WhatsAppGlobalMonitor />
      
      {/* Notificação verde (antes no topo) agora no canto inferior direito */}
      <WhatsAppGlobalNotification 
        notification={currentNotification}
        onClose={hideNotification}
        onNavigate={(chatId) => {
          // Navigate to WhatsApp chat (SPA navigation)
          const url = `/whatsapp?chatId=${chatId}`;
          if (window.location.pathname !== '/whatsapp') {
            window.location.href = url;
          } else {
            // Se já está na página do WhatsApp, só atualiza a URL
            window.history.pushState({}, '', url);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
          hideNotification();
        }}
      />
    </GlobalWhatsAppNotificationContext.Provider>
  );
};