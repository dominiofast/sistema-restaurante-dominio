import React, { useEffect, useState } from 'react';
import { X, MessageCircle, Phone } from 'lucide-react';
import { ContactAvatar } from './ContactAvatar';

interface NewMessageNotificationProps {
  message?: {
    id: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    chatId: string;
    timestamp: Date;
  };
  onClose: () => void;
  onChatSelect: (chatId: string) => void;
  isVisible: boolean;
}

export const NewMessageNotification: React.FC<NewMessageNotificationProps> = ({
  message,
  onClose,
  onChatSelect,
  isVisible
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible && message) {
      setShow(true);
      
      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timeout);
    } else {
      setShow(false);
    }
  }, [isVisible, message]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation
  };

  const handleClick = () => {
    if (message) {
      onChatSelect(message.chatId);
      handleClose();
    }
  };

  const truncateMessage = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!message || !isVisible) return null;

  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4 
      transition-all duration-300 ease-out
      ${show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'}
    `}>
      <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Nova mensagem</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div 
          onClick={handleClick}
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <ContactAvatar
              name={message.senderName}
              avatar={message.senderAvatar}
              size="md"
              showOnlineIndicator={true}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-foreground truncate">
                  {message.senderName}
                </h4>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {truncateMessage(message.content)}
              </p>
            </div>
          </div>

          {/* Action hint */}
          <div className="mt-3 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Clique para abrir conversa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};