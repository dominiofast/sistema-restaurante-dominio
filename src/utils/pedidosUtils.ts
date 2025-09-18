
import { Pedido, PedidoCompleto } from '@/types/pedidos';

export function filtrarPorIntervalo(pedidos: Pedido[], horas: number): Pedido[] {
  const agora = new Date()
  return pedidos.filter(p => {
    const criado = new Date(p.created_at)
    const diffMs = agora.getTime() - criado.getTime()
    const diffHoras = diffMs / (1000 * 60 * 60)
    return diffHoras <= horas;
  })
}

export function filtrarCanceladosPorIntervalo(pedidos: Pedido[], horas: number): Pedido[] {
  const agora = new Date()
  return pedidos.filter(p => {
    // Para pedidos cancelados, usar updated_at (quando foi cancelado)
    const dataCancelamento = new Date(p.updated_at || p.created_at)
    const diffMs = agora.getTime() - dataCancelamento.getTime()
    const diffHoras = diffMs / (1000 * 60 * 60)
    return diffHoras <= horas;
  })
}

export function getPedidoWithItens(pedido: Pedido): PedidoCompleto {
  return {
    ...pedido,
    nome: pedido.nome || 'Cliente não informado',
    telefone: pedido.telefone || 'N/A',
    endereco: pedido.endereco || '',
    pagamento: pedido.pagamento || 'N/A',
    horario: pedido.horario || 'N/A',
    origem: pedido.origem,
    itens: pedido.itens || []
  };
}
