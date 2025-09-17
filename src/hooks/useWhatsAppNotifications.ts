import { useGlobalWhatsAppNotification } from '@/contexts/GlobalWhatsAppNotificationContext';

/**
 * Hook utilitário para usar notificações WhatsApp globais
 * 
 * @returns {object} Objeto com funções e estado das notificações
 */
export const useWhatsAppNotifications = () => {
  return useGlobalWhatsAppNotification();
};

/**
 * Hook para mostrar notificação manual (para casos especiais)
 */
export const useManualNotification = () => {
  const { showNotification } = useGlobalWhatsAppNotification();
  
  const notify = (message: {
    senderName: string;
    content: string;
    chatId: string;
    companyName: string;
    senderAvatar?: string;
  }) => {
    showNotification({
      id: `manual_${Date.now()}`,
      senderName: message.senderName,
      senderAvatar: message.senderAvatar,
      content: message.content,
      chatId: message.chatId,
      companyName: message.companyName,
      timestamp: new Date()
    });
  };

  return { notify };
};
