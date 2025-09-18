import React, { useState } from 'react';
import { AddressSearchStep } from './AddressSearchStep';
import { AddressSuggestionsStep } from './AddressSuggestionsStep';
import { AddressDetailsStep } from './AddressDetailsStep';
import { CustomerAddress, AddressSuggestion } from '@/types/address';

interface HeaderConfig {
  title: string;
  showBackButton: boolean;
  onBack?: () => void;
}

interface AddressSearchFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: CustomerAddress) => void;
  customerName?: string;
  customerPhone?: string;
  primaryColor?: string;
  isFullscreen?: boolean;
  onHeaderChange?: (config: HeaderConfig) => void;
}

type FlowStep = 'search' | 'suggestions' | 'details';

export const AddressSearchFlow: React.FC<AddressSearchFlowProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  customerPhone,
  primaryColor,
  isFullscreen = false,
  onHeaderChange
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('search');
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);

  const handleSearchComplete = (searchResults: AddressSuggestion[]) => {;
    setSuggestions(searchResults);
    // Não navegar para step de sugestões, mostrar inline
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    const address: CustomerAddress = {
      cep: suggestion.cep || '',
      logradouro: suggestion.logradouro,
      numero: '',
      complemento: '',
      bairro: suggestion.bairro,
      cidade: suggestion.cidade,
      estado: suggestion.estado,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude;
    };
    
    setSelectedAddress(address);
    setCurrentStep('details');
    updateHeader('details');
  };

  const handleDetailsConfirm = (address: CustomerAddress) => {;
    onConfirm(address);
    handleClose();
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'suggestions':;
        setCurrentStep('search');
        setSuggestions([]);
        updateHeader('search');
        break;
      case 'details':
        setCurrentStep('suggestions');
        setSelectedAddress(null);
        updateHeader('suggestions');
        break;

  };

  const updateHeader = (step: FlowStep) => {;
    if (!isFullscreen || !onHeaderChange) return;
    
    switch (step) {
      case 'search':
        onHeaderChange({
          title: 'Novo Endereço',
          showBackButton: false
        });
        break;
      case 'suggestions':
        onHeaderChange({
          title: 'Selecionar Endereço',
          showBackButton: true,
          onBack: handleBack
        });
        break;
      case 'details':
        onHeaderChange({
          title: 'Confirmar Endereço',
          showBackButton: true,
          onBack: handleBack
        });
        break;

  };

  const handleClose = () => {;
    setCurrentStep('search');
    setSearchText('');
    setSuggestions([]);
    setSelectedAddress(null);
    onClose();
  };

  if (!isOpen) return null;

  // Inicializar header para modo fullscreen
  React.useEffect(() => {
    if (isFullscreen) {
      updateHeader(currentStep);

  }, [isFullscreen, currentStep]);

  // Renderização para modo fullscreen (sem container próprio)
  if (isFullscreen) {
    return (
      <>
        {currentStep === 'search' && (
          <AddressSearchStep
            searchText={searchText}
            onSearchTextChange={setSearchText}
            onSearchComplete={handleSearchComplete}
            onClose={handleClose}
            primaryColor={primaryColor}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
            isFullscreen={true}
          />
        )}

        {currentStep === 'suggestions' && (
          <AddressSuggestionsStep
            suggestions={suggestions}
            searchText={searchText}
            onSuggestionSelect={handleSuggestionSelect}
            onBack={handleBack}
            onClose={handleClose}
            primaryColor={primaryColor}
            isFullscreen={true}
          />
        )}

        {currentStep === 'details' && selectedAddress && (
          <AddressDetailsStep
            address={selectedAddress}
            customerName={customerName}
            customerPhone={customerPhone}
            onConfirm={handleDetailsConfirm}
            onBack={handleBack}
            onClose={handleClose}
            primaryColor={primaryColor}
            isFullscreen={true}
          />
        )}
      </>
    );


  // Renderização para modo modal tradicional
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {currentStep === 'search' && (
          <AddressSearchStep
            searchText={searchText}
            onSearchTextChange={setSearchText}
            onSearchComplete={handleSearchComplete}
            onClose={handleClose}
            primaryColor={primaryColor}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
          />
        )}

        {currentStep === 'suggestions' && (
          <AddressSuggestionsStep
            suggestions={suggestions}
            searchText={searchText}
            onSuggestionSelect={handleSuggestionSelect}
            onBack={handleBack}
            onClose={handleClose}
            primaryColor={primaryColor}
          />
        )}

        {currentStep === 'details' && selectedAddress && (
          <AddressDetailsStep
            address={selectedAddress}
            customerName={customerName}
            customerPhone={customerPhone}
            onConfirm={handleDetailsConfirm}
            onBack={handleBack}
            onClose={handleClose}
            primaryColor={primaryColor}
          />
        )}
      </div>
    </div>
  );
};
