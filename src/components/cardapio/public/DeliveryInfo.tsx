import React from 'react';
import { Truck, DollarSign } from 'lucide-react';

interface DeliveryInfoProps {
  showEstimatedTime?: boolean;
  estimatedDeliveryTime?: number;
  showMinimumOrder?: boolean;
  minimumOrderValue?: number;
  primaryColor: string;
}

export const DeliveryInfo: React.FC<DeliveryInfoProps> = ({
  showEstimatedTime = true,
  estimatedDeliveryTime = 30,
  showMinimumOrder = true,
  minimumOrderValue = 0,
  primaryColor
}) => {
  const hasDeliveryInfo = (showEstimatedTime && estimatedDeliveryTime) || 
                         (showMinimumOrder && minimumOrderValue && minimumOrderValue > 0);

  if (!hasDeliveryInfo) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-1">
      {/* Estimated Delivery Time */}
      {showEstimatedTime && estimatedDeliveryTime && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg flex-1">
          <Truck className="h-4 w-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-700">
              Entrega em {estimatedDeliveryTime} min
            </span>
            <span className="text-xs text-blue-600">
              Tempo estimado
            </span>
          </div>
        </div>
      )}

      {/* Minimum Order */}
      {showMinimumOrder && minimumOrderValue && minimumOrderValue > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg flex-1">
          <DollarSign className="h-4 w-4 text-purple-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-purple-700">
              Pedido mín. R$ {minimumOrderValue.toFixed(2)}
            </span>
            <span className="text-xs text-purple-600">
              Para delivery
            </span>
          </div>
        </div>
      )}
    </div>
  );
};