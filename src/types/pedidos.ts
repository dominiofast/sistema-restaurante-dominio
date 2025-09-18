
export interface Pedido {
  id: number;
  numero_pedido?: number;
  company_id: string;
  nome?: string;
  telefone?: string;
  endereco?: string;
  endereco_entrega?: string; // Adicionando propriedade faltante
  observacoes?: string; // Adicionando propriedade faltante
  status: string;
  tipo: string;
  total: number;
  pagamento?: string;
  horario?: string;
  origem?: string;
  created_at: string;
  updated_at: string;
  itens?: Array<{
    nome: string;
    qtd: number;
    valor: number;
    adicionais?: {
      [categoria: string]: Array<{
        nome: string;
        quantidade: number;
        valor: number;
      }>;
    };
  }>;


export interface PedidoItem {
  id: string;
  pedido_id: number;
  produto_id: string;
  nome_produto: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  observacoes: string;
  created_at: string;


export interface AdicionalItem {
  id?: number;
  pedido_item_id?: number;
  nome_adicional: string;
  quantidade: number;
  valor_total: number;


export interface PedidoCompleto {
  id: number;
  numero_pedido?: number;
  company_id: string;
  nome: string;
  telefone: string;
  endereco: string;
  endereco_entrega?: string; // Adicionando propriedade faltante
  observacoes?: string; // Adicionando propriedade faltante
  status: string;
  tipo: string;
  total: number;
  pagamento: string;
  horario: string;
  origem?: string;
  created_at: string;
  updated_at: string;
  itens: Array<{
    nome: string;
    qtd: number;
    valor: number;
    adicionais?: {
      [categoria: string]: Array<{
        nome: string;
        quantidade: number;
        valor: number;
      }>;
    };
  }>;

