import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWhatsAppRealtime } from '@/hooks/useWhatsAppRealtime';
import { useGlobalWhatsAppNotification } from '@/contexts/GlobalWhatsAppNotificationContext';

/**
 * Componente que monitora mensagens WhatsApp globalmente
 * Separado do provider para evitar dependências circulares
 */
export const WhatsAppGlobalMonitor: React.FC = () => {
  const { currentCompany } = useAuth()
  const { showNotification, isEnabled } = useGlobalWhatsAppNotification()

  // Monitor WhatsApp messages globally
  useWhatsAppRealtime({
    companyId: currentCompany?.id,
    onNewMessage: (message) => {
      // Only show notifications for received messages (not sent by current user)
      if (message.is_from_me || !isEnabled) return;

      const notification = {
        id: message.message_id || message.id,
        senderName: message.contact_name || 'Contato',
        senderAvatar: message.contact_avatar,
        content: message.message_content || message.content,
        chatId: message.chat_id,
        companyName: currentCompany?.name || 'WhatsApp',
        timestamp: new Date(message.timestamp || Date.now())
      };

      showNotification(notification)

  })

  return null; // Este componente não renderiza nada
};
