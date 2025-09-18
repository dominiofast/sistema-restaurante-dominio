import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Truck, Home, Phone, MapPin, CreditCard } from 'lucide-react';
// SUPABASE REMOVIDO
import { Button } from '@/components/ui/button';

interface PedidoData {
  id: number;
  numero_pedido: number;
  nome: string;
  telefone: string;
  endereco?: string;
  tipo: string;
  pagamento: string;
  total: number;
  status: string;
  created_at: string;
  company_id: string;


interface ItemPedido {
  id: string;
  nome_produto: string;
  quantidade: number;
  valor_total: number;
  observacoes?: string;


interface AdicionalItem {
  nome_adicional: string;
  quantidade: number;
  valor_total: number;


const getStatusInfo = (status: string, tipoPedido?: string) => {
  // Usar o status exato do banco de dados
  switch (status) {
    case 'confirmado':
    case 'aceito':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Pedido Confirmado',
        description: 'Seu pedido foi aceito e está sendo preparado';
      };
    
    case 'analise':
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        text: 'Em Análise',
        description: 'Analisando seu pedido'
      };
    
    case 'producao':
    case 'em_producao':
    case 'em producao':
    case 'preparando':
    case 'em_preparo':
    case 'em preparo':
      return {
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        text: 'Em Produção',
        description: 'Estamos preparando seu pedido com carinho'
      };
    
    case 'pronto':
    case 'pronto_entrega':
    case 'ready':
      // Descrição específica baseada no tipo de pedido
      const descricaoPronto = tipoPedido === 'delivery' 
        ? 'Pedido pronto, logo sairá para entrega';
        : 'Pedido pronto, pode vir retirar';
      
      return {
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        text: 'Pedido Pronto',
        description: descricaoPronto
      };
    
    case 'saiu_entrega':
    case 'saiu para entrega':
    case 'a_caminho':
    case 'enviado':
      return {
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        text: 'Saiu para Entrega',
        description: 'Seu pedido está a caminho'
      };
    
    case 'entregue':
    case 'delivered':
    case 'finalizado':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Entregue',
        description: 'Pedido entregue com sucesso!'
      };
    
    case 'cancelado':
    case 'cancelled':
      return {
        icon: CheckCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: 'Cancelado',
        description: 'Pedido foi cancelado'
      };
    
    // Status padrão para novos pedidos ou status não mapeados
    default:
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        text: status || 'Status não identificado',
        description: 'Verificando status do pedido'
      };

};

export const AcompanharPedido: React.FC = () => {
  const { numero_pedido } = useParams<{ numero_pedido: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [adicionais, setAdicionais] = useState<{ [itemId: string]: AdicionalItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companySlug, setCompanySlug] = useState<string>('');

  useEffect(() => {
    console.log('🚀 TESTE: useEffect executou, numero_pedido:', numero_pedido);
    if (!numero_pedido) return;

    const fetchPedido = async () => {
      try {
        // Extrair company_slug da URL (formato: /company-slug/pedido/numero);
        const urlPath = window.location.pathname;
        console.log('🔍 URL atual:', urlPath);
        const pathSegments = urlPath.split('/').filter(segment => segment.length > 0);
        console.log('🔍 Segmentos da URL:', pathSegments);
        const extractedCompanySlug = pathSegments[0]; // Primeiro segmento é o company slug
        console.log('🔍 Company slug extraído:', extractedCompanySlug);
        setCompanySlug(extractedCompanySlug); // Salvar para usar no botão "Voltar ao Cardápio"
        console.log('🔍 Número do pedido:', numero_pedido);
        
        // SOLUÇÃO REAL: Usar o valor extraído diretamente, não o state
        const companySlugToUse = extractedCompanySlug;
        console.log('🔍 Buscando company_id para slug/domain:', companySlugToUse);
        
        console.log('🔍 === DEBUG CONSULTA COMPLETA ===');
        console.log('🔍 Company slug extraído:', companySlugToUse);
        console.log('🔍 Company slug state:', companySlug);
        console.log('🔍 Supabase client:', !!supabase);
        
        // SOLUÇÃO DEFINITIVA: Usar APENAS a lógica que FUNCIONA
        console.log('🔍 === EXECUTANDO QUERY QUE FUNCIONA ===');
        const todasEmpresas = null as any; const erroTodas = null as any;
        console.log('🔍 Erro ao buscar todas:', erroTodas);
        
        // Filtrar manualmente como na query que FUNCIONA
        const empresaEncontrada = todasEmpresas?.find(empresa => 
          empresa.slug === companySlugToUse || empresa.domain === companySlugToUse;
        );
        
        console.log('🔍 Empresa filtrada:', empresaEncontrada);
        
        if (!empresaEncontrada) {
          console.error('❌ Empresa não encontrada para slug/domain:', companySlug);
          setError('Empresa não encontrada');
          return;
        }
        
         catch (error) { console.error('Error:', error); }const companyId = empresaEncontrada.id;
        console.log('✅ Empresa encontrada com sucesso! ID:', companyId);
        
        // Buscar pedido por numero_pedido + company_id
        let pedidoData = null;
        let pedidoError = null;
        
        // Primeiro tentar buscar por numero_pedido
        const numeroInteiro = parseInt(numero_pedido);
        console.log('🔍 Buscando pedido...', { numeroInteiro, companyId });
        const dadosPorNumero = null as any; const erroPorNumero = null as any;
        console.log('🔍 Erro detalhado:', erroPorNumero?.message, erroPorNumero?.details, erroPorNumero?.code);
        
        if (dadosPorNumero) {
          pedidoData = dadosPorNumero;
        } else {
          // Se não encontrou por numero_pedido, NÃO tentar por id
          // Apenas retornar erro
          pedidoError = erroPorNumero;
        }

        if (pedidoError) {
          setError('Pedido não encontrado');
          return;
        }

        setPedido(pedidoData);

        // Buscar itens
        const itensData = null as any; const itensError = null as any;

          // Buscar adicionais para cada item
          const adicionaisMap: { [itemId: string]: AdicionalItem[] } = {};
          
          for (const item of itensData) {
            const { data: adicionaisData  } = null as any;
            if (adicionaisData && adicionaisData.length > 0) {
              adicionaisMap[item.id] = adicionaisData;
            }
          }
          
          setAdicionais(adicionaisMap);
        }

      } catch (err) {
        setError('Erro ao carregar pedido');
        console.error(err);
      } finally {
        setLoading(false);

    };

    fetchPedido();

    // Configurar realtime para atualizações de status
    const channel = supabase
      
      
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `numero_pedido=eq.${numero_pedido}`
        },
        (payload) => {
          if (payload.new) {;
            setPedido(payload.new as PedidoData);
          }
        }
      )
      

    return () => {
      
    };
  }, [numero_pedido]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pedido...</p>
        </div>
      </div>
    );


  if (error || !pedido) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Pedido não encontrado</h1>
            <p className="text-muted-foreground mb-6">{error || 'Verifique o número do pedido'}</p>
            <Button onClick={() => navigate(`/${companySlug}`)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Cardápio
            </Button>
          </div>
        </div>
    );


  const statusInfo = getStatusInfo(pedido.status, pedido.tipo);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/${companySlug}`)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Pedido #{pedido.numero_pedido}
              </h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu pedido em tempo real
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Status Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
              <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {statusInfo.text}
              </h2>
              <p className="text-muted-foreground">{statusInfo.description}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Pedido realizado em {new Date(pedido.created_at).toLocaleString('pt-BR', {
                  timeZone: 'America/Porto_Velho',
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Informações do Pedido</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <Phone className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium text-foreground">{pedido.nome}</p>
                <p className="text-sm text-muted-foreground">{pedido.telefone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                {pedido.tipo === 'delivery' ? (
                  <Truck className="w-4 h-4 text-accent-foreground" />
                ) : (
                  <Home className="w-4 h-4 text-accent-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium text-foreground">
                  {pedido.tipo === 'delivery' ? 'Entrega' : 'Retirada'}
                </p>
              </div>
            </div>

            {pedido.endereco && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <MapPin className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium text-foreground">{pedido.endereco}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <CreditCard className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagamento</p>
                <p className="font-medium text-foreground capitalize">{pedido.pagamento}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Itens do Pedido */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Itens do Pedido</h3>
          
          <div className="space-y-4">
            {itens.map((item) => (
              <div key={item.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {item.quantidade}x {item.nome_produto}
                    </h4>
                    
                    {adicionais[item.id] && adicionais[item.id].length > 0 && (
                      <div className="mt-2 pl-4">
                        <p className="text-sm font-medium text-primary mb-1">Adicionais:</p>
                        {adicionais[item.id].map((adicional, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex justify-between">
                            <span>+ {adicional.quantidade}x {adicional.nome_adicional}</span>
                            <span>+R$ {adicional.valor_total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {item.observacoes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Obs:</span> {item.observacoes}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-foreground ml-4">
                    R$ {item.valor_total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">Total:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {pedido.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Botão para voltar */}
        <div className="text-center pb-6">
          <Button onClick={() => navigate(`/${companySlug}`)} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Cardápio
          </Button>
        </div>
      </div>
    </div>
  );
};