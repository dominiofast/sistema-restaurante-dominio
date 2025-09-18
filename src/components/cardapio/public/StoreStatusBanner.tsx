import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { StoreStatus } from '@/hooks/useStoreStatus';

interface StoreStatusBannerProps {
  status: StoreStatus;
  loading: boolean;
  primaryColor: string;
  textColor: string;
}

export const StoreStatusBanner: React.FC<StoreStatusBannerProps> = ({
  status,
  loading,
  primaryColor,
  textColor
}) => {
  if (loading) {
    return null;
  }

  if (status.isOpen) {
    return (
      <div 
        className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 border"
        style={{ 
          backgroundColor: `${primaryColor}15`,
          borderColor: `${primaryColor}30`,
          color: textColor
        }}
      >
        <Clock size={16} style={{ color: primaryColor }} />
        <span className="text-sm font-medium">{status.message}</span>
      </div>
    )
  }

  return (
    <div 
      className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 border border-red-200 bg-red-50"
      style={{ color: '#DC2626' }}
    >
      <AlertCircle size={16} className="text-red-500" />
      <span className="text-sm font-medium">🔒 {status.message}</span>
    </div>
  )
};
