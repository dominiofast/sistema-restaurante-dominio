
import React from 'react';
import { Settings, Grid, Columns2, Check, Rows, MoreHorizontal, Square } from 'lucide-react';
import { useKDSConfig } from '@/hooks/useKDSConfig';

const STATUS_OPTIONS = [
  { key: 'analise', label: 'Novos', color: 'text-orange-600' },
  { key: 'producao', label: 'Em Preparação', color: 'text-blue-600' },
  { key: 'pronto', label: 'Em Finalização', color: 'text-green-600' }
];

const LAYOUT_OPTIONS = [
  {
    key: 'horizontal-single',
    label: '1 Fileira Horizontal',
    icon: Rows,
    description: 'Pedidos em 1 fileira horizontal com paginação',
    preview: '―――'
  },
  {
    key: 'horizontal-double',
    label: '2 Fileiras Horizontais',
    icon: Grid,
    description: 'Pedidos em 2 fileiras horizontais com paginação',
    preview: '═══'
  }
];

interface KDSConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KDSConfigPanel: React.FC<KDSConfigPanelProps> = ({ isOpen, onClose }) => {
  const { config, toggleStatus, setLayout } = useKDSConfig();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20} />
            Configurações do KDS
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Layout Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de Layout</h3>
          <div className="space-y-3">
            {LAYOUT_OPTIONS.map((layoutOption) => {
              const Icon = layoutOption.icon;
              const isSelected = config.layout === layoutOption.key;
              return (
                <button
                  key={layoutOption.key}
                  onClick={() => setLayout(layoutOption.key as any)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span className="text-lg font-mono">{layoutOption.preview}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{layoutOption.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{layoutOption.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Status Visíveis</h3>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status.key}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.visibleStatuses.includes(status.key)}
                    onChange={() => toggleStatus(status.key)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    config.visibleStatuses.includes(status.key)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {config.visibleStatuses.includes(status.key) && (
                      <Check size={12} />
                    )}
                  </div>
                </div>
                <span className={`text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Aplicar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};
