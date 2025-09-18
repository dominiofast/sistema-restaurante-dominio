import React from 'react';
import { AddressSearchFlow } from './AddressSearchFlow';
import { CustomerAddress } from '@/types/address';

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: CustomerAddress) => void;
  customerName?: string;
  customerPhone?: string;
  primaryColor?: string;
}

export const DeliveryAddressModal: React.FC<DeliveryAddressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  customerPhone,
  primaryColor
}) => {
  return (
    <AddressSearchFlow
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      customerName={customerName}
      customerPhone={customerPhone}
      primaryColor={primaryColor}
    />
  )
};
