
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle } from 'lucide-react';

const bandeirasPadrao = [
  'Visa', 'Mastercard', 'Elo', 'Hipercard', 'Diners Club', 'American Express', 'Maestro', 'Visa Electron',
  'Pix Maquininha', 'Alelo', 'Sodexo Alimentação', 'VR Refeição', 'VR Benefícios', 'Ben Alimentação', 'Ben Refeição'
];

export interface PagamentoEntregaConfigData {
  accept_cash: boolean;
  accept_card: boolean;
  accept_pix: boolean;
  ask_card_brand: boolean;
  card_brands: string[];
  pix_key: string;
}

export const PagamentoEntregaConfig: React.FC<{
  config: PagamentoEntregaConfigData;
  onChange: (newConfig: PagamentoEntregaConfigData) => void;
  onSave?: (config: PagamentoEntregaConfigData) => Promise<boolean>;
  saving?: boolean;
}> = ({ config, onChange, onSave, saving = false }) => {
  const [input, setInput] = useState('');
  const [localConfig, setLocalConfig] = useState(config);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(true);

  const updateConfig = (newConfig: PagamentoEntregaConfigData) => {
    setLocalConfig(newConfig);
    onChange(newConfig);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (onSave) {
      const success = await onSave(localConfig);
      if (success) {
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  const addBandeira = (b: string) => {
    if (b && !localConfig.card_brands.includes(b)) {
      updateConfig({ ...localConfig, card_brands: [...localConfig.card_brands, b] });
    }
    setInput('');
  };

  // Sincronizar com config externo quando ele mudar
  React.useEffect(() => {
    setLocalConfig(config);
    // Não resetar hasChanges aqui para permitir salvamento inicial
  }, [config]);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-2">Pagamento na entrega</h2>
      <p className="mb-4 text-gray-700">Formas de pagamento na entrega e na retirada</p>
      
      <div className="flex flex-col gap-2 mb-4">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={localConfig.accept_cash} 
            onChange={e => updateConfig({ ...localConfig, accept_cash: e.target.checked })}
            className="mr-2"
          />
          <span className="font-semibold">Dinheiro</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={localConfig.accept_card} 
            onChange={e => updateConfig({ ...localConfig, accept_card: e.target.checked })}
            className="mr-2"
          />
          <span className="font-semibold">Cartão</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={localConfig.accept_pix} 
            onChange={e => updateConfig({ ...localConfig, accept_pix: e.target.checked })}
            className="mr-2"
          />
          <span className="font-semibold">Pix</span>
        </label>
      </div>

      {/* Opção mais clara para perguntar sobre bandeiras */}
      {localConfig.accept_card && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border">
          <h3 className="font-semibold text-blue-900 mb-2">Configuração do Cartão</h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={localConfig.ask_card_brand} 
              onChange={e => updateConfig({ ...localConfig, ask_card_brand: e.target.checked })}
              className="mt-1"
            />
            <div>
              <span className="font-semibold text-blue-800">Perguntar qual a bandeira do cartão?</span>
              <div className="text-sm text-blue-600 mt-1">
                {localConfig.ask_card_brand 
                  ? "✅ O cliente será questionado sobre qual bandeira usar (Visa, Mastercard, etc.)"
                  : "❌ Não será perguntado sobre a bandeira - apenas 'Cartão' genérico"
                }
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Seção para chave PIX se aceitar PIX */}
      {localConfig.accept_pix && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border">
          <div className="mb-2 text-green-900 font-semibold">Chave PIX</div>
          <input
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="Digite sua chave PIX (CPF, e-mail, telefone ou chave aleatória)"
            value={localConfig.pix_key || ''}
            onChange={e => updateConfig({ ...localConfig, pix_key: e.target.value })}
          />
        </div>
      )}

      {/* Seção de bandeiras apenas se aceitar cartão E perguntar bandeira */}
      {localConfig.accept_card && localConfig.ask_card_brand && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border">
          <div className="mb-2 text-purple-900 font-semibold">Com quais bandeiras você trabalha?</div>
          <input
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="Digite o nome da bandeira e pressione Enter..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                addBandeira(input.trim());
                e.preventDefault();
              }
            }}
          />
          
          {/* Bandeiras configuradas */}
          {localConfig.card_brands.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-purple-700 mb-2">Bandeiras configuradas:</div>
              <div className="flex flex-wrap gap-2">
                {localConfig.card_brands.map(b => (
                  <span key={b} className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    {b}
                    <button 
                      type="button" 
                      onClick={() => updateConfig({ ...localConfig, card_brands: localConfig.card_brands.filter(x => x !== b) })}
                      className="hover:bg-purple-500 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bandeiras sugeridas */}
          <div className="mb-4">
            <div className="text-sm text-purple-600 mb-2">Bandeiras mais usadas:</div>
            <div className="flex flex-wrap gap-2">
              {bandeirasPadrao.filter(b => !localConfig.card_brands.includes(b)).slice(0, 8).map(bandeira => (
                <button
                  key={bandeira}
                  type="button"
                  onClick={() => addBandeira(bandeira)}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                >
                  + {bandeira}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botão de salvar */}
      <div className="flex justify-end items-center gap-4">
        {saveSuccess && (
          <div className="flex items-center text-green-600 font-semibold">
            <CheckCircle className="h-4 w-4 mr-1" />
            Configurações salvas!
          </div>
        )}
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
