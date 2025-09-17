import { useState, useCallback } from 'react';

interface NotificationMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  chatId: string;
  timestamp: Date;
}

export const useNewMessageNotification = () => {
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback((message: any) => {
    // Only show notifications for received messages (not sent by me)
    if (message.is_from_me) return;
    
    // Create notification object
    const notificationData: NotificationMessage = {
      id: message.message_id || message.id,
      senderName: message.contact_name || 'Contato',
      senderAvatar: message.contact_avatar,
      content: message.message_content || message.content,
      chatId: message.chat_id,
      timestamp: new Date(message.timestamp || Date.now())
    };
    
    setNotification(notificationData);
    setIsVisible(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsVisible(false);
    // Clear notification after animation
    setTimeout(() => {
      setNotification(null);
    }, 300);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
    setIsVisible(false);
  }, []);

  return {
    notification,
    isVisible,
    showNotification,
    hideNotification,
    clearNotification
  };
};