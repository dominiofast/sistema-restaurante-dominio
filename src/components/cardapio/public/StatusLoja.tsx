
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface StatusLojaProps {
  status: 'open' | 'closed' | 'soon';
  message: string;
  nextChange?: string;
}

export const StatusLoja: React.FC<StatusLojaProps> = ({ status, message, nextChange }) => {
  let color = 'bg-green-100 text-green-800';
  let icon = <CheckCircle className="w-3 h-3 mr-1" />;

  if (status === 'closed') {
    color = 'bg-red-100 text-red-700';
    icon = <XCircle className="w-3 h-3 mr-1" />;
  } else if (status === 'soon') {
    color = 'bg-yellow-100 text-yellow-800';
    icon = <Clock className="w-3 h-3 mr-1" />;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${color}`}>
        {icon}
        {message}
      </span>
      {nextChange && status !== 'open' && (
        <span className="text-xs text-gray-500">
          Próxima mudança: {nextChange}
        </span>
      )}
    </div>
  );
};
