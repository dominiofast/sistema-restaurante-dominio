import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, Settings, Users, History } from "lucide-react";
import { useCashbackConfig, useSaveCashbackConfig, useCustomerCashback, useCashbackTransactions } from "@/hooks/useCashbackConfig";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import AddCashbackModal from "@/components/cashback/AddCashbackModal";

const Cashback: React.FC = () => {
  const { currentCompany } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showAddCashbackModal, setShowAddCashbackModal] = useState(false);

  const { data: config, isLoading: configLoading } = useCashbackConfig(currentCompany?.id);
  const { data: customers, isLoading: customersLoading } = useCustomerCashback(currentCompany?.id);
  const { data: transactions, isLoading: transactionsLoading } = useCashbackTransactions(currentCompany?.id, selectedCustomer || undefined);
  const saveCashbackConfig = useSaveCashbackConfig();

  const [formData, setFormData] = useState({
    percentual_cashback: config?.percentual_cashback || 0,
    valor_minimo_compra: config?.valor_minimo_compra || 0,
    is_active: config?.is_active ?? true,
  });

  React.useEffect(() => {
    if (config) {
      setFormData({
        percentual_cashback: config.percentual_cashback,
        valor_minimo_compra: config.valor_minimo_compra,
        is_active: config.is_active,
      });
    }
  }, [config]);

  const handleSaveConfig = () => {
    if (!currentCompany?.id) {;
      console.error('Company ID não encontrado');
      return;
    }

    saveCashbackConfig.mutate({
      ...formData,
      company_id: currentCompany.id,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL';
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ArrowUpCircle className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold">Cashback</h1>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Cashback</CardTitle>
              <CardDescription>
                Configure o percentual e regras do cashback para seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Ativar cashback</Label>
                </div>
                
                {config?.is_active && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm text-green-700">
                        <strong>Cashback ativo</strong>
                      </p>
                    </div>
                    <p className="text-xs text-green-600 mt-1 ml-4">
                      Apenas pedidos criados após esta data receberão cashback
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percentual">Percentual do Cashback (%)</Label>
                  <Input
                    id="percentual"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.percentual_cashback}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      percentual_cashback: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="Ex: 5.5"
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentual que será creditado como cashback
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_minimo">Valor Mínimo da Compra (R$)</Label>
                  <Input
                    id="valor_minimo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_minimo_compra}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      valor_minimo_compra: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="Ex: 50.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Valor mínimo para gerar cashback
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Exemplo de Cálculo:</h4>
                <p className="text-sm text-muted-foreground">
                  Compra de {formatCurrency(100)} com {formData.percentual_cashback}% = {formatCurrency(100 * formData.percentual_cashback / 100)} de cashback
                </p>
              </div>

              <Button 
                onClick={handleSaveConfig} 
                disabled={saveCashbackConfig.isPending}
                className="w-full"
              >
                {saveCashbackConfig.isPending ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Clientes com Cashback</CardTitle>
                  <CardDescription>
                    Visualize o saldo de cashback dos seus clientes
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddCashbackModal(true)}>
                  Adicionar Cashback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <p>Carregando clientes...</p>
              ) : (
                <div className="space-y-4">
                  {customers?.map((customer) => (
                    <div 
                      key={customer.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedCustomer(customer.customer_phone)}
                    >
                      <div>
                        <h4 className="font-medium">{customer.customer_name || "Cliente sem nome"}</h4>
                        <p className="text-sm text-muted-foreground">{customer.customer_phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(customer.saldo_disponivel)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total acumulado: {formatCurrency(customer.saldo_total_acumulado)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {customers?.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum cliente com cashback ainda
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                {selectedCustomer ? `Transações do cliente ${selectedCustomer}` : "Todas as transações de cashback"}
              </CardDescription>
              {selectedCustomer && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Ver todas as transações
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <p>Carregando transações...</p>
              ) : (
                <div className="space-y-3">
                  {transactions?.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {transaction.tipo === 'credito' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{transaction.customer_name || transaction.customer_phone}</p>
                          <p className="text-sm text-muted-foreground">{transaction.descricao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.tipo === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.tipo === 'credito' ? '+' : '-'}{formatCurrency(transaction.valor)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transactions?.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma transação encontrada
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddCashbackModal
        open={showAddCashbackModal}
        onOpenChange={setShowAddCashbackModal}
      />
    </div>
  );
};

export default Cashback;