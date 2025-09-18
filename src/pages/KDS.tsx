import React, { useState, useEffect } from 'react';
import { usePedidosRealTime } from '@/hooks/usePedidosRealTime';
import { KDSHeader } from '@/components/kds/KDSHeader';
import { KDSFiltersModal } from '@/components/kds/KDSFiltersModal';
import { KDSGrid } from '@/components/kds/KDSGrid';
import { ProBadge } from '@/components/ui/pro-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const KDS = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [visualizacao, setVisualizacao] = useState(1)
  const [telaInteira, setTelaInteira] = useState(false)
  const [larguraTela, setLarguraTela] = useState(1200)
  const [paginaAtual, setPaginaAtual] = useState(0)

  // Hook para buscar pedidos reais
  const { pedidos, loading, error, atualizarStatus } = usePedidosRealTime()

  // Configurações de filtros - agora usando status reais
  const [filtros, setFiltros] = useState({
    statusAtivos: {
      'analise': true,
      'producao': true,
      'pronto': true
    },
    tiposAtivos: {
      'delivery': true,
      'balcao': true,
      'retirada': true,
      'mesa': true,
      'autoatendimento': true  // ✅ Adicionar autoatendimento

  })

  // Converter pedidos para formato de balcões
  const convertPedidosParaBalcoes = () => {
    console.log('🏪 KDS - Convertendo pedidos para balcões:', pedidos?.length || 0)
    console.log('🏪 KDS - Pedidos brutos:', pedidos)
    
    if (!pedidos || pedidos.length === 0) {
      console.log('❌ KDS - Nenhum pedido encontrado')
      return [];


    return pedidos
      .filter(pedido => filtros.statusAtivos[pedido.status] && filtros.tiposAtivos[pedido.tipo])
      .map((pedido) => {
        console.log('🔄 KDS - Processando pedido:', pedido.id, pedido.itens?.length || 0, 'itens')
        console.log('🔄 KDS - Detalhes do pedido:', pedido)
        
        // Formatar itens do pedido
        const itensFormatados = [];

        // Adicionar itens do pedido
        pedido.itens.forEach(item => {
          itensFormatados.push(`${item.qtd} × ${item.nome.toUpperCase()}`)
          
          // Adicionar adicionais se existirem, agrupados por categoria
          if (item.adicionais && Array.isArray(item.adicionais) && item.adicionais.length > 0) {
            // Agrupar adicionais por categoria
            const adicionaisPorCategoria = {};
            
            item.adicionais.forEach(adicional => {
              const categoria = adicional.categoria || 'EXTRAS';
              if (!adicionaisPorCategoria[categoria]) {
                adicionaisPorCategoria[categoria] = [];
              }
              adicionaisPorCategoria[categoria].push(adicional)
            })
            
            // Exibir por categoria
            Object.keys(adicionaisPorCategoria).forEach(categoria => {
              itensFormatados.push(`  ${categoria.toUpperCase()}:`)
              adicionaisPorCategoria[categoria].forEach(adicional => {
                itensFormatados.push(`    + ${adicional.qtd || 1} ${adicional.nome.toUpperCase()}`)
              })
            })

          
          // Adicionar observações do item se existirem
          if (item.observacoes) {
            itensFormatados.push(`  💬 ${item.observacoes}`)

          
          // Adicionar linha em branco entre itens
          itensFormatados.push('')
        })

        // Adicionar observações gerais do pedido
        if (pedido.observacoes) {
          itensFormatados.push('')
          itensFormatados.push(`💬 OBS: ${pedido.observacoes}`)


        return {
          id: pedido.id,
          nome: `${pedido.tipo.toUpperCase()}: ${pedido.numero}`,
          tempo: pedido.tempo * 60, // converter minutos para segundos para manter compatibilidade
          local: getLocalFromStatus(pedido.status),
          itens: itensFormatados,
          status: pedido.status,
          pedidoOriginal: pedido
        };
      })
  };

  // Mapear status para locais
  const getLocalFromStatus = (status: string) => {
    switch (status) {
      case 'analise':;
        return 'COZINHA 1';
      case 'producao':
        return 'COZINHA 2';
      case 'pronto':
        return 'COPA';
      default:
        return 'CAIXA';

  };

  // Gerar balcões a partir dos pedidos reais
  const todosBalcoes = convertPedidosParaBalcoes()

  // Filtros aplicados (agora baseado nos balcões reais)
  const balcoesFiltrados = todosBalcoes;

  useEffect(() => {
    const handleResize = () => {
      setLarguraTela(window.innerWidth - 32)
    };
    
    // Inicialização
    if (typeof window !== 'undefined') {
      setLarguraTela(window.innerWidth - 32)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)

  }, [])

  // Reset página quando mudar visualização
  useEffect(() => {
    setPaginaAtual(0)
  }, [visualizacao])

  const toggleStatus = (status: string) => {
    setFiltros(prev => ({
      ...prev,
      statusAtivos: {
        ...prev.statusAtivos,
        [status]: !prev.statusAtivos[status]
      };
    }))
  };

  const toggleTipo = (tipo: string) => {
    setFiltros(prev => ({
      ...prev,
      tiposAtivos: {
        ...prev.tiposAtivos,
        [tipo]: !prev.tiposAtivos[tipo]
      };
    }))
  };

  // Função para avançar status do pedido
  const avancarPedido = async (balcao: any) => {
    if (!balcao.pedidoOriginal) return;
    
    try {
      const pedido = balcao.pedidoOriginal;
      let novoStatus = pedido.status;
      
      if (pedido.status === 'analise') {
        novoStatus = 'producao';
      }  catch (error) { console.error('Error:', error) }else if (pedido.status === 'producao') {
        novoStatus = 'pronto';
      } else if (pedido.status === 'pronto') {
        novoStatus = 'entregue'; // Remove do KDS
      }
      
      await atualizarStatus(pedido.id, novoStatus)
    } catch (error) {
      console.error('Erro ao avançar pedido:', error)

  };

  const toggleTelaInteira = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setTelaInteira(true)
    } else {
      document.exitFullscreen()
      setTelaInteira(false)

  };

  const fecharKDS = () => {
    if (window.confirm('Tem certeza que deseja fechar o KDS?')) {
      window.close()

  };

  return (
    <div className="fixed inset-0 top-16 bg-background overflow-hidden">
      <KDSHeader
        filtros={filtros}
        totalPedidos={balcoesFiltrados.length}
        loading={loading}
        error={error}
        visualizacao={visualizacao}
        onVisualizacaoChange={setVisualizacao}
        onOpenFilters={() => setShowFilters(true)}
        onToggleFullscreen={toggleTelaInteira}
        onClose={fecharKDS}
      />

      <KDSFiltersModal
        open={showFilters}
        onOpenChange={setShowFilters}
        filtros={filtros}
        onToggleStatus={toggleStatus}
        onToggleTipo={toggleTipo}
      />

      {balcoesFiltrados.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full p-8">
          <Card className="max-w-md border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <ProBadge size="lg" />
              </div>
              <h3 className="font-semibold text-amber-900 mb-2">Kitchen Display System</h3>
              <p className="text-sm text-amber-800 mb-4">
                O KDS é uma funcionalidade premium que permite visualizar e gerenciar 
                pedidos em tempo real na cozinha, otimizando o fluxo de produção.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="text-xs">🍳 Gestão de cozinha</Badge>
                <Badge variant="secondary" className="text-xs">⏱️ Tempo real</Badge>
                <Badge variant="secondary" className="text-xs">📱 Interface otimizada</Badge>
                <Badge variant="secondary" className="text-xs">🔄 Status automático</Badge>
              </div>
              {balcoesFiltrados.length === 0 && (
                <p className="text-xs text-amber-700 mt-4">
                  Nenhum pedido ativo no momento.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <KDSGrid
        pedidos={balcoesFiltrados}
        visualizacao={visualizacao}
        larguraTela={larguraTela}
        paginaAtual={paginaAtual}
        onAdvancePedido={avancarPedido}
        onPaginaChange={setPaginaAtual}
      />
    </div>
  )
};

export default KDS;
