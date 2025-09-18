import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KDSOrderCard } from './KDSOrderCard';

interface KDSGridProps {
  pedidos: any[];
  visualizacao: number;
  larguraTela: number;
  paginaAtual: number;
  onAdvancePedido: (pedido: any) => void;
  onPaginaChange: (pagina: number) => void;
}

export const KDSGrid: React.FC<KDSGridProps> = ({
  pedidos,
  visualizacao,
  larguraTela,
  paginaAtual,
  onAdvancePedido,
  onPaginaChange
}) => {
  // Cálculos responsivos para paginação
  const balcoesPorLinha = Math.max(1, Math.floor(larguraTela / 280));
  const balcoesPorPagina = visualizacao === 2 ? balcoesPorLinha * 2 : balcoesPorLinha;
  
  // Pedidos da página atual
  const pedidosPaginaAtual = pedidos.slice(
    paginaAtual * balcoesPorPagina,
    (paginaAtual + 1) * balcoesPorPagina
  );

  // Para modo 2 fileiras: distribuir entre linha 1 e linha 2
  const primeiraLinha = pedidosPaginaAtual.slice(0, balcoesPorLinha);
  const segundaLinha = pedidosPaginaAtual.slice(balcoesPorLinha);

  // Cálculos para paginação
  const totalPaginas = Math.ceil(pedidos.length / balcoesPorPagina);
  const temMaisPaginas = totalPaginas > 1;

  if (visualizacao === 2) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col">
        {/* Grid - duas fileiras */}
        <div className="flex-1 min-h-0 grid grid-rows-2 gap-4 px-4 pb-4">
          {/* Primeira fileira */}
          <div className="bg-gradient-to-br from-muted/40 to-muted/60 border rounded-lg p-4 shadow-sm">
            <div className="flex h-full justify-between items-stretch gap-4">
              {primeiraLinha.map(pedido => (
                <KDSOrderCard
                  key={pedido.id}
                  pedido={pedido}
                  onAdvance={onAdvancePedido}
                />
              ))}
              {/* Preenche espaços vazios se necessário */}
              {Array/* .from REMOVIDO */ ; //{ length: balcoesPorLinha - primeiraLinha.length }).map((_, index) => (
                <div key={`empty-top-${index}`} className="flex-1"></div>
              ))}
            </div>
          </div>

          {/* Segunda fileira */}
          <div className="bg-gradient-to-br from-muted/40 to-muted/60 border rounded-lg p-4 shadow-sm">
            <div className="flex h-full justify-between items-stretch gap-4">
              {segundaLinha.length > 0 ? (
                <>
                  {segundaLinha.map(pedido => (
                    <KDSOrderCard
                      key={pedido.id}
                      pedido={pedido}
                      onAdvance={onAdvancePedido}
                    />
                  ))}
                  {/* Preenche espaços vazios se necessário */}
                  {Array/* .from REMOVIDO */ ; //{ length: balcoesPorLinha - segundaLinha.length }).map((_, index) => (
                    <div key={`empty-bottom-${index}`} className="flex-1"></div>
                  ))}
                </>
              ) : (
                <div className="w-full flex items-center justify-center text-muted-foreground text-sm bg-background/50 rounded-lg border-2 border-dashed">
                  Segunda fileira disponível para novos pedidos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé fixo - colado na parte inferior */}
        <div className="flex-shrink-0 h-16 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mx-4 rounded-lg shadow-xl flex items-center px-4">
          <div className="flex justify-between items-center w-full text-gray-900 dark:text-gray-100">
            <Button
              variant="default"
              size="sm"
              onClick={() => onPaginaChange(Math.max(0, paginaAtual - 1))}
              disabled={paginaAtual === 0}
              className="flex items-center gap-2 bg-brand-coral-500 hover:bg-brand-coral-600 text-white border-0"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
              Anterior
            </Button>
            
            <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 rounded">
              Página {paginaAtual + 1} de {Math.max(1, totalPaginas)}
            </span>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => onPaginaChange(Math.min(totalPaginas - 1, paginaAtual + 1))}
              disabled={paginaAtual >= totalPaginas - 1}
              className="flex items-center gap-2 bg-brand-coral-500 hover:bg-brand-coral-600 text-white border-0"
            >
              Próxima
              <ChevronRight className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Grid - uma fileira */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <div className="flex h-full justify-between items-stretch gap-4 bg-gradient-to-br from-muted/40 to-muted/60 border rounded-lg p-4 shadow-sm">
          {pedidosPaginaAtual.length > 0 ? (
            <>
              {pedidosPaginaAtual.map(pedido => (
                <KDSOrderCard
                  key={pedido.id}
                  pedido={pedido}
                  onAdvance={onAdvancePedido}
                  altura="min-h-[500px]"
                />
              ))}
              {/* Preenche espaços vazios se necessário */}
              {Array/* .from REMOVIDO */ ; //{ length: balcoesPorLinha - pedidosPaginaAtual.length }).map((_, index) => (
                <div key={`empty-${index}`} className="flex-1"></div>
              ))}
            </>
          ) : (
            <div className="w-full flex items-center justify-center text-muted-foreground text-lg bg-background/50 rounded-lg border-2 border-dashed py-12">
              Nenhum pedido encontrado
            </div>
          )}
        </div>
      </div>

      {/* Rodapé fixo - colado na parte inferior */}
      <div className="flex-shrink-0 h-16 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mx-4 rounded-lg shadow-xl flex items-center px-4">
        <div className="flex justify-between items-center w-full text-gray-900 dark:text-gray-100">
          <Button
            variant="default"
            size="sm"
            onClick={() => onPaginaChange(Math.max(0, paginaAtual - 1))}
            disabled={paginaAtual === 0}
            className="flex items-center gap-2 bg-brand-coral-500 hover:bg-brand-coral-600 text-white border-0"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
            Anterior
          </Button>
          
          <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 rounded">
            Página {paginaAtual + 1} de {Math.max(1, totalPaginas)}
          </span>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => onPaginaChange(Math.min(totalPaginas - 1, paginaAtual + 1))}
            disabled={paginaAtual >= totalPaginas - 1}
            className="flex items-center gap-2 bg-brand-coral-500 hover:bg-brand-coral-600 text-white border-0"
          >
            Próxima
            <ChevronRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};