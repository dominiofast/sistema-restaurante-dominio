import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useRealtimePedidosNotification } from '@/hooks/useRealtimePedidosNotification';
import { useAuth } from '@/contexts/AuthContext';

interface PedidosNotificationBadgeProps {
  className?: string;
}

export const PedidosNotificationBadge: React.FC<PedidosNotificationBadgeProps> = ({ 
  className = "" 
}) => {
  const { currentCompany } = useAuth();
  const { pedidosPendentes, resetarContador } = useRealtimePedidosNotification(currentCompany?.id);

  if (pedidosPendentes === 0) {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <Bell className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-flex items-center cursor-pointer ${className}`}
      onClick={resetarContador}
      title={`${pedidosPendentes} pedidos pendentes`}
    >
      <Bell className="h-5 w-5" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
      >
        {pedidosPendentes > 99 ? '99+' : pedidosPendentes}
      </Badge>
    </div>
  );
};