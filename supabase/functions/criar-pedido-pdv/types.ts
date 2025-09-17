export interface PedidoPDVData {
  nome: string
  telefone: string
  endereco?: string
  tipo: 'delivery' | 'retirada' | 'balcao'
  pagamento?: string
  observacoes?: string
  taxaEntrega?: number
  itens: Array<{
    produto_id: string
    nome_produto: string
    quantidade: number
    preco_unitario: number
    adicionais?: Array<{
      nome: string
      preco: number
      quantidade: number
    }>
  }>
}