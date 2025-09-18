import React, { useEffect, useState } from 'react';
import { X, MessageCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  chatId: string;
  companyName: string;
  timestamp: Date;
}

interface WhatsAppGlobalNotificationProps {
  notification: NotificationMessage | null;
  onClose: () => void;
  onNavigate: (chatId: string) => void;
}

export const WhatsAppGlobalNotification: React.FC<WhatsAppGlobalNotificationProps> = ({
  notification,
  onClose,
  onNavigate
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (notification) {
      setIsVisible(true)
      setIsAnimating(true)
      
      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      setIsAnimating(false)

  }, [notification])

  if (!notification || !isVisible) return null;

  const handleClick = () => {
    onNavigate(notification.chatId)
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity duration-300 md:hidden ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Notification - POSICIONADA NO CANTO INFERIOR DIREITO */}
      <div 
        className={`
          fixed bottom-6 right-6 z-[9999] w-96 max-w-[calc(100vw-2rem)]
          bg-white border border-gray-200 rounded-lg shadow-2xl
          transform transition-all duration-300 ease-out
          ${isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-full opacity-0 scale-95'
          }
          ${isAnimating ? 'animate-bounce' : ''}
          hover:shadow-3xl cursor-pointer group
        `}
        onClick={handleClick}
      >
        {/* Header com gradiente WhatsApp */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Nova mensagem - {notification.companyName}</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0">
              {notification.senderAvatar ? (
                <AvatarImage 
                  src={notification.senderAvatar} 
                  alt={notification.senderName}
                />
              ) : (
                <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
                  {notification.senderName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Message content */}
            <div className="flex-1 min-w-0">
              {/* Sender name */}
              <div className="font-semibold text-gray-900 text-sm mb-1">
                {notification.senderName}
              </div>
              
              {/* Message text */}
              <div className="text-gray-700 text-sm leading-relaxed mb-2">
                {truncateContent(notification.content)}
              </div>
              
              {/* Timestamp */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(notification.timestamp, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action hint */}
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-500 group-hover:text-green-600 transition-colors">
            👆 Clique para abrir conversa
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-b-lg"></div>
      </div>
    </>
  )
};
