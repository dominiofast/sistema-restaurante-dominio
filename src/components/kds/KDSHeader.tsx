import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';

interface KDSHeaderProps {
  filtros: {
    statusAtivos: Record<string, boolean>;
    tiposAtivos: Record<string, boolean>;
  };
  totalPedidos: number;
  loading: boolean;
  error: string | null;
  visualizacao: number;
  onVisualizacaoChange: (viz: number) => void;
  onOpenFilters: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;


export const KDSHeader: React.FC<KDSHeaderProps> = ({
  filtros,
  totalPedidos,
  loading,
  error,
  visualizacao,
  onVisualizacaoChange,
  onOpenFilters,
  onToggleFullscreen,
  onClose
}) => {
  return (
    <div className="bg-muted border-b shadow-sm p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">KDS</span>
          <ProBadge size="sm" />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilters}
          className="h-9 w-9 p-0 bg-background hover:bg-accent text-foreground"
        >
          <span className="text-base text-foreground">≡</span>
        </Button>
        
        <div className="bg-background rounded-lg px-3 py-1.5 border">
          <span className="text-sm font-medium text-foreground">
            {Object.entries(filtros.statusAtivos)
              .filter(([_, ativo]) => ativo)
              .map(([status, _]) => status.toUpperCase())
              .join(', ')}
          </span>
        </div>
        
        {loading && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md border border-yellow-200">
            Carregando...
          </span>
        )}
        
        {error && (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-md border border-red-200">
            Erro: {error}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">
            {totalPedidos} pedidos
          </span>
        </div>
        
        <div className="flex bg-background rounded-lg border overflow-hidden">
          <Button
            variant={visualizacao === 1 ? "default" : "ghost"}
            size="sm"
            onClick={() => onVisualizacaoChange(1)}
            className="px-4 py-2 text-sm h-9 min-w-[40px] rounded-none"
          >
            1
          </Button>
          <Button
            variant={visualizacao === 2 ? "default" : "ghost"}
            size="sm"
            onClick={() => onVisualizacaoChange(2)}
            className="px-4 py-2 text-sm h-9 min-w-[40px] rounded-none border-l"
          >
            2
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullscreen}
          className="px-3 py-2 text-sm h-9 bg-background hover:bg-accent text-foreground"
        >
          <span className="text-foreground">⛶</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="px-3 py-2 text-sm h-9 bg-background hover:bg-destructive hover:text-destructive-foreground text-foreground"
        >
          <span className="text-current">✕</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilters}
          className="p-2 h-9 w-9 bg-background hover:bg-accent text-foreground"
        >
          <Settings className="w-4 h-4 text-foreground" />
        </Button>
      </div>
    </div>
  )
};
