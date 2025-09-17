import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusToggle } from '@/components/cardapio/StatusToggle';
import { 
  GripVertical,
  Upload,
  Check,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { Adicional } from '@/types/cardapio';

interface AdicionalCardProps {
  adicional: Adicional;
  editandoAdicional: string | null;
  adicionalEditado: any;
  setAdicionalEditado: any;
  handleSaveAdicional: () => void;
  setEditandoAdicional: any;
  handleEditAdicional: (adicional: Adicional) => void;
  handleDeleteAdicional: (adicionalId: string) => void;
  handleImageUpload: (file: File, adicionalId: string) => void;
  onToggleStatus: (adicionalId: string, isActive: boolean) => void;
  loading: boolean;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const AdicionalCard: React.FC<AdicionalCardProps> = ({
  adicional,
  editandoAdicional,
  adicionalEditado,
  setAdicionalEditado,
  handleSaveAdicional,
  setEditandoAdicional,
  handleEditAdicional,
  handleDeleteAdicional,
  handleImageUpload,
  onToggleStatus,
  loading,
  dragHandleProps,
  isDragging
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 transition-all hover:border-gray-300">
      <div className="flex items-center gap-3">
        <div 
          className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
        </div>
         
        {/* Imagem do adicional */}
        {adicional.image && (
          <div className="relative w-16 h-16 flex-shrink-0">
            <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={adicional.image} 
                alt={adicional.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Botão de upload */}
            <input
              id={`image-upload-${adicional.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, adicional.id);
              }}
            />
            <label
              htmlFor={`image-upload-${adicional.id}`}
              className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100"
            >
              <Upload className="h-4 w-4 text-white" />
            </label>
          </div>
        )}

        {editandoAdicional === adicional.id ? (
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600">Nome</Label>
                <Input
                  value={adicionalEditado.name || ''}
                  onChange={(e) => setAdicionalEditado((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={adicionalEditado.price || 0}
                  onChange={(e) => setAdicionalEditado((prev: any) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Descrição</Label>
              <Input
                value={adicionalEditado.description || ''}
                onChange={(e) => setAdicionalEditado((prev: any) => ({ ...prev, description: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveAdicional}
                disabled={loading || !adicionalEditado.name}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-3 w-3 mr-1" />
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditandoAdicional(null)}
                disabled={loading}
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex justify-between items-center">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900">{adicional.name}</h5>
              <p className="text-sm text-gray-600">
                R$ {adicional.price.toLocaleString('pt-BR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
              {adicional.description && (
                <p className="text-xs text-gray-500 mt-1">{adicional.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <StatusToggle
                isActive={adicional.is_active}
                onToggle={(isActive) => onToggleStatus(adicional.id, isActive)}
                size="sm"
                showLabel={true}
                loading={loading}
              />
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAdicional(adicional)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  disabled={editandoAdicional !== null}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAdicional(adicional.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  disabled={editandoAdicional !== null}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};