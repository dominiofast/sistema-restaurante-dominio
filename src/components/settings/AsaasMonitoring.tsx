import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// SUPABASE REMOVIDO
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';

interface AsaasMonitoringProps {
  companyId: string;
}

interface PaymentStats {
  total_payments: number;
  confirmed_payments: number;
  pending_payments: number;
  orphan_payments: number;
  total_amount: number;
  success_rate: number;
}

export const AsaasMonitoring: React.FC<AsaasMonitoringProps> = ({ companyId }) => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [orphanPayments, setOrphanPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas gerais
      const { data: paymentsData, error: paymentsError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'asaas_payments')
        /* .select\( REMOVIDO */ ; //'status, amount, confirmed_at')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (paymentsError) throw paymentsError;

      const totalPayments = paymentsData.length;
      const confirmedPayments = paymentsData.filter(p => p.status === 'CONFIRMED' || p.status === 'RECEIVED').length;
      const pendingPayments = paymentsData.filter(p => p.status === 'PENDING').length;
      const totalAmount = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
      const successRate = totalPayments > 0 ? (confirmedPayments / totalPayments) * 100 : 0;

      // Buscar pagamentos órfãos
      const { data: orphanData, error: orphanError } = /* await supabase REMOVIDO */ null
        .rpc('identify_orphan_payments');

      if (orphanError) throw orphanError;

      const orphans = orphanData.filter((p: any) => !p.has_matching_order && p.days_since_payment <= 7);

      setStats({
        total_payments: totalPayments,
        confirmed_payments: confirmedPayments,
        pending_payments: pendingPayments,
        orphan_payments: orphans.length,
        total_amount: totalAmount,
        success_rate: successRate
      });

      setOrphanPayments(orphans);

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as estatísticas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverOrphans = async () => {
    try {
      setRecovering(true);

      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('recover-orphan-payments');

      if (error) throw error;

      const result = data;
      
      toast({
        title: 'Recuperação concluída',
        description: `${result.summary.recovered} pedidos recuperados de ${result.summary.total_orphans} órfãos`,
      });

      // Recarregar dados
      loadStats();

    } catch (error) {
      console.error('❌ Erro na recuperação:', error);
      toast({
        title: 'Erro na recuperação',
        description: 'Não foi possível recuperar os pagamentos órfãos',
        variant: 'destructive',
      });
    } finally {
      setRecovering(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [companyId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Carregando estatísticas...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Monitoramento Asaas</h3>
        <Button onClick={loadStats} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total (7 dias)</p>
                <p className="text-2xl font-bold">{stats?.total_payments || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{stats?.confirmed_payments || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending_payments || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.success_rate?.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Volume Financeiro (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(stats?.total_amount || 0)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {stats?.confirmed_payments || 0} pagamentos confirmados
          </p>
        </CardContent>
      </Card>

      {/* Pagamentos órfãos */}
      {(stats?.orphan_payments || 0) > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              Pagamentos Órfãos Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {stats?.orphan_payments} pagamento(s) pago(s) sem pedido correspondente
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clientes que pagaram mas podem não ter recebido confirmação do pedido
                  </p>
                </div>
                <Button 
                  onClick={handleRecoverOrphans}
                  disabled={recovering}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {recovering ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Recuperando...
                    </>
                  ) : (
                    'Recuperar Automaticamente'
                  )}
                </Button>
              </div>

              {/* Lista de órfãos */}
              {orphanPayments.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium">Pagamentos órfãos:</p>
                  {orphanPayments.slice(0, 5).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="text-sm">
                        <p className="font-medium">{payment.customer_phone}</p>
                        <p className="text-muted-foreground">
                          {formatCurrency(payment.amount)} - {payment.days_since_payment} dia(s) atrás
                        </p>
                      </div>
                      <Badge variant="secondary">{payment.payment_id.slice(-8)}</Badge>
                    </div>
                  ))}
                  {orphanPayments.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      E mais {orphanPayments.length - 5} pagamentos...
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status saudável */}
      {(stats?.orphan_payments || 0) === 0 && stats?.success_rate && stats.success_rate >= 90 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Integração funcionando perfeitamente!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Sem pagamentos órfãos e alta taxa de sucesso
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};