import React, { useState, useMemo } from 'react';
import { Search, MessageCircle, Archive, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ContactAvatar } from './ContactAvatar';

interface Chat {
  id: string;
  chatId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  phoneNumber: string;
  messages: any[];
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading?: boolean;
  companyName?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChat,
  onChatSelect,
  searchTerm,
  onSearchChange,
  isLoading = false,
  companyName = 'Minha Loja'
}) => {
  const [archiveMode, setArchiveMode] = useState(false)

  // Filtrar chats baseado na busca
  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    
    const searchLower = searchTerm.toLowerCase()
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchLower) ||
      chat.phoneNumber.toLowerCase().includes(searchLower) ||
      chat.lastMessage.toLowerCase().includes(searchLower)
    )
  }, [chats, searchTerm])

  // Separar chats com mensagens não lidas e ordenar por timestamp mais recente
  const { unreadChats, readChats } = useMemo(() => {
    const unread = filteredChats
      .filter(chat => chat.unreadCount > 0)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    const read = filteredChats
      .filter(chat => chat.unreadCount === 0)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return { unreadChats: unread, readChats: read };
  }, [filteredChats])

  const totalUnreadCount = unreadChats.reduce((sum, chat) => sum + chat.unreadCount, 0)

  // Truncar mensagem longa com melhor controle
  const truncateMessage = (message: string, maxLength = 50) => {
    if (!message || message.length <= maxLength) return message;
    return message.substring(0, maxLength).trim() + '...';
  };

  // Formatação de tempo relativa melhorada
  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) {
      return 'Agora';
    } else if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return `${days}d`;
    } else {
      return format(timestamp, 'dd/MM')

  };

  const ChatItem: React.FC<{ chat: Chat }> = ({ chat }) => (
    <div
      onClick={() => onChatSelect(chat)}
      className={`
        px-4 py-3 cursor-pointer transition-all duration-200 relative group
        ${selectedChat?.id === chat.id 
          ? 'bg-blue-50 border-r-2 border-blue-500 shadow-sm' 
          : 'hover:bg-gray-50'
        }
        ${chat.unreadCount > 0 ? 'bg-green-50/50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <ContactAvatar
          name={chat.name}
          avatar={chat.avatar}
          size="lg"
          showOnlineIndicator={chat.unreadCount > 0}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold truncate text-sm ${
              chat.unreadCount > 0 ? 'text-gray-900' : 'text-gray-800'
            }`}>
              {chat.name}
            </h3>
            <span className={`text-xs flex-shrink-0 ml-2 ${
              chat.unreadCount > 0 ? 'text-green-600 font-bold' : 'text-gray-500'
            }`}>
              {formatTime(chat.timestamp)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm truncate flex-1 ${
              chat.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-600'
            }`}>
              {truncateMessage(chat.lastMessage)}
            </p>
            
            {chat.unreadCount > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold shadow-sm">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </div>

          {/* Número de telefone (apenas quando hover no desktop) */}
          <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
            {chat.phoneNumber}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm" style={{ marginTop: '0' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">Conversas</h1>
            <p className="text-sm text-gray-600 font-medium truncate">{companyName}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {totalUnreadCount > 0 && (
              <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                {totalUnreadCount} nova{totalUnreadCount !== 1 ? 's' : ''}
              </div>
            )}
            <button
              onClick={() => setArchiveMode(!archiveMode)}
              className={`p-2 rounded-full transition-colors ${
                archiveMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title="Conversas arquivadas"
            >
              <Archive className="h-5 w-5" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-800"
              title="Mais opções"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar conversas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 border-0"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="text-center py-12 px-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm font-medium">Carregando conversas...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-sm font-medium">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            {searchTerm && (
              <p className="text-gray-500 text-xs mt-2">
                Tente ajustar sua busca
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white">
            {/* Conversas não lidas primeiro */}
            {unreadChats.length > 0 && (
              <>
                <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider">
                    Não lidas ({unreadChats.length})
                  </p>
                </div>
                {unreadChats.map((chat) => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
              </>
            )}

            {/* Conversas lidas */}
            {readChats.length > 0 && (
              <>
                {unreadChats.length > 0 && (
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lidas
                    </p>
                  </div>
                )}
                {readChats.map((chat) => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer com estatísticas */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium truncate">
            {filteredChats.length} conversa{filteredChats.length !== 1 ? 's' : ''}
          </span>
          {totalUnreadCount > 0 && (
            <span className="text-green-600 font-bold flex-shrink-0">
              {totalUnreadCount} não lida{totalUnreadCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
};
