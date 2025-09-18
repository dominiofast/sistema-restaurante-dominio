import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KDSFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filtros: {
    statusAtivos: Record<string, boolean>;
    tiposAtivos: Record<string, boolean>;
  };
  onToggleStatus: (status: string) => void;
  onToggleTipo: (tipo: string) => void;
}

export const KDSFiltersModal: React.FC<KDSFiltersModalProps> = ({
  open,
  onOpenChange,
  filtros,
  onToggleStatus,
  onToggleTipo
}) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'analise':;
        return '🔍 EM ANÁLISE';
      case 'producao':
        return '🍳 EM PRODUÇÃO';
      case 'pronto':
        return '✅ PRONTO';
      default:
        return status.toUpperCase()
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'delivery':;
        return '🚚 DELIVERY';
      case 'balcao':
        return '🏪 BALCÃO';
      case 'retirada':
        return '🚶 RETIRADA';
      case 'mesa':
        return '🍽️ MESA';
      default:
        return tipo.toUpperCase()
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros de Pedidos</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-semibold mb-3">STATUS DOS PEDIDOS</h3>
            <div className="space-y-2">
              {Object.entries(filtros.statusAtivos).map(([status, ativo]) => (
                <Button
                  key={status}
                  onClick={() => onToggleStatus(status)}
                  variant={ativo ? "secondary" : "outline"}
                  className={`w-full justify-start ${ativo ? 'bg-brand-coral-100 text-brand-coral-700 border-brand-coral-200' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                >
                  {getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-3">TIPOS DE PEDIDO</h3>
            <div className="space-y-2">
              {Object.entries(filtros.tiposAtivos).map(([tipo, ativo]) => (
                <Button
                  key={tipo}
                  onClick={() => onToggleTipo(tipo)}
                  variant={ativo ? "secondary" : "outline"}
                  className={`w-full justify-start ${ativo ? 'bg-brand-coral-100 text-brand-coral-700 border-brand-coral-200' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                >
                  {getTipoLabel(tipo)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-background text-foreground border-border hover:bg-muted"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
};
