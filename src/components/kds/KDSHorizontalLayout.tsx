import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PedidoCard } from './PedidoCard';
import { PedidoKDS } from '@/hooks/usePedidosRealTime';

interface KDSHorizontalLayoutProps {
  pedidos: PedidoKDS[];
  onAvancar: (id: number) => void;
  onVoltar: (id: number) => void;
  getNextActionLabel: (status: string) => string;
  canGoBack: (pedido: PedidoKDS) => boolean;
  rows: 1 | 2;
  isFullscreen?: boolean;
}

export const KDSHorizontalLayout: React.FC<KDSHorizontalLayoutProps> = ({
  pedidos,
  onAvancar,
  onVoltar,
  getNextActionLabel,
  canGoBack,
  rows,
  isFullscreen = false
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  
  // Calcular quantos pedidos cabem por página baseado no número de fileiras
  const getItemsPerPage = () => {
    // Para telas grandes: 6 colunas por fileira
    // Para telas médias: 4 colunas por fileira
    // Para telas pequenas: 3 colunas por fileira;
    const columnsPerRow = window.innerWidth >= 1280 ? 6 : window.innerWidth >= 768 ? 4 : 3;
    return columnsPerRow * rows;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage())

  // Atualizar itens por página quando a tela redimensionar
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage())
      // Resetar para primeira página se necessário
      const newTotalPages = Math.ceil(pedidos.length / getItemsPerPage())
      if (currentPage >= newTotalPages && newTotalPages > 0) {
        setCurrentPage(0)
      }
    };

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [rows, pedidos.length, currentPage])

  // Resetar página quando pedidos mudarem drasticamente
  useEffect(() => {
    const totalPages = Math.ceil(pedidos.length / itemsPerPage)
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0)
    }
  }, [pedidos.length, itemsPerPage])

  const totalPages = Math.ceil(pedidos.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPedidos = pedidos.slice(startIndex, endIndex)

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  };

  const getGridClasses = () => {
    const baseClasses = 'grid gap-4';
    const rowClasses = rows === 1 ? 'grid-rows-1' : 'grid-rows-2';
    const colClasses = 'grid-cols-3 md:grid-cols-4 xl:grid-cols-6';
    return `${baseClasses} ${rowClasses} ${colClasses} grid-flow-col`;
  };

  if (pedidos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-lg font-medium">Nenhum pedido encontrado</p>
          <p className="text-sm">Aguardando novos pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={{ paddingBottom: isFullscreen ? 0 : totalPages > 1 ? 80 : 0 }}>
      {/* Área dos pedidos */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className={getGridClasses()} style={{ height: rows === 1 ? 'calc(100vh - 200px)' : 'calc(100vh - 200px)' }}>
          {currentPedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onAvancar={onAvancar}
              onVoltar={onVoltar}
              canGoBack={canGoBack(pedido)}
              canAdvance={true}
              nextActionLabel={getNextActionLabel(pedido.status)}
            />
          ))}
        </div>
      </div>

      {/* Controles de paginação FIXOS no rodapé */}
      {totalPages > 1 && (
        <div className="fixed bottom-0 left-0 w-full z-30 bg-white border-t border-gray-200 px-6 py-4 shadow-md">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="text-sm text-gray-600">
              Página {currentPage + 1} de {totalPages} • {pedidos.length} pedidos total
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentPage === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                }`}
              >
                <ChevronLeft size={20} />
                Anterior
              </button>
              
              <div className="flex items-center gap-1 mx-4">
                {Array
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      i === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentPage === totalPages - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                }`}
              >
                Próxima
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};
