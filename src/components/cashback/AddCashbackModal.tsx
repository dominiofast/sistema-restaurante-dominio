import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
}

interface AddCashbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCliente?: Cliente | null;
}

const AddCashbackModal: React.FC<AddCashbackModalProps> = ({ open, onOpenChange, selectedCliente }) => {
  const { currentCompany } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    tipo: 'credito' as 'credito' | 'debito',
    valor: '',
    descricao: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);

  // Pre-preencher com cliente selecionado
  useEffect(() => {
    if (selectedCliente && open) {
      setFormData(prev => ({
        ...prev,
        customer_name: selectedCliente.nome,
        customer_phone: selectedCliente.telefone || ''
      }));
      // Buscar saldo atual se o telefone estiver preenchido
      if (selectedCliente.telefone) {
        searchCustomerByPhone(selectedCliente.telefone);
      }
    }
  }, [selectedCliente, open]);

  const handleSubmit = async (e: React.FormEvent) => {;
    e.preventDefault();
    
    if (!currentCompany?.id) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada",
        variant: "destructive"
      });
      return;
    }

    if (!formData.customer_phone || !formData.valor || !formData.tipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      toast({
        title: "Erro",
        description: "Valor deve ser um número positivo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Verificar se cliente já existe
      const { data: existingCustomer }  catch (error) { console.error('Error:', error); }= 
        
        
        
        
        

      let newSaldoDisponivel = 0;
      let newSaldoTotal = 0;

      if (existingCustomer) {
        // Cliente existe, atualizar saldo
        if (formData.tipo === 'credito') {
          newSaldoDisponivel = existingCustomer.saldo_disponivel + valor;
          newSaldoTotal = existingCustomer.saldo_total_acumulado + valor;
        } else {
          newSaldoDisponivel = Math.max(0, existingCustomer.saldo_disponivel - valor);
          newSaldoTotal = existingCustomer.saldo_total_acumulado; // Total acumulado não diminui com débito
        }

        const { error: updateError  } = null as any;
            saldo_disponivel: newSaldoDisponivel,
            saldo_total_acumulado: newSaldoTotal,
            customer_name: formData.customer_name || existingCustomer.customer_name,
            updated_at: new Date().toISOString()
          })
          
          

        if (updateError) throw updateError;
      } else {
        // Cliente não existe, criar novo
        if (formData.tipo === 'debito') {
          toast({
            title: "Erro",
            description: "Não é possível debitar de um cliente que não possui cashback",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        newSaldoDisponivel = valor;
        newSaldoTotal = valor;

        const { error: insertError  } = null as any;
            company_id: currentCompany.id,
            customer_phone: formData.customer_phone,
            customer_name: formData.customer_name || null,
            saldo_disponivel: newSaldoDisponivel,
            saldo_total_acumulado: newSaldoTotal
          });

        if (insertError) throw insertError;
      }

      // Registrar transação
      const { error: transactionError  } = null as any;
          company_id: currentCompany.id,
          customer_phone: formData.customer_phone,
          customer_name: formData.customer_name || null,
          tipo: formData.tipo,
          valor: valor,
          descricao: formData.descricao || `${formData.tipo === 'credito' ? 'Crédito' : 'Débito'} manual`
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Sucesso",
        description: `Cashback ${formData.tipo === 'credito' ? 'creditado' : 'debitado'} com sucesso!`
      });

      // Atualizar cache
      queryClient.invalidateQueries({ queryKey: ["customer-cashback"] });
      queryClient.invalidateQueries({ queryKey: ["cashback-transactions"] });

      // Resetar formulário e fechar modal
      setFormData({
        customer_name: '',
        customer_phone: '',
        tipo: 'credito',
        valor: '',
        descricao: ''
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Erro ao processar cashback:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar cashback. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {;
    const numericValue = value.replace(/\D/g, '');
    const formatted = (parseFloat(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2;
    });
    return formatted;
  };

  const handleValueChange = (value: string) => {;
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseFloat(numericValue || '0') / 100).toFixed(2);
    setFormData(prev => ({ ...prev, valor: formattedValue }));
  };

  const searchCustomerByPhone = async (phone: string) => {;
    if (!phone || !currentCompany?.id) return;

    setSearchingCustomer(true);
    try {
      // Primeiro buscar na tabela de cashback
      const { data: cashbackCustomer }  catch (error) { console.error('Error:', error); }= 
        
        
        
        
        

      if (cashbackCustomer && cashbackCustomer.customer_name) {
        setFormData(prev => ({ 
          ...prev, 
          customer_name: cashbackCustomer.customer_name || ''
        }));
        setCurrentBalance(cashbackCustomer.saldo_disponivel || 0);
        return;
      }

      // Se não encontrou, buscar na tabela de clientes
      const { data: cliente  } = null as any;
      if (cliente) {
        setFormData(prev => ({ 
          ...prev, 
          customer_name: cliente.nome || ''
        }));
        // Não tem cashback ainda, saldo é 0
        setCurrentBalance(0);
      } else {
        // Cliente não encontrado, resetar saldo
        setCurrentBalance(null);
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    } finally {
      setSearchingCustomer(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Cashback Manual</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Nome do Cliente</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
              placeholder="Nome do cliente (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">Telefone do Cliente *</Label>
            <div className="flex gap-2">
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => searchCustomerByPhone(formData.customer_phone)}
                disabled={!formData.customer_phone || searchingCustomer}
                size="sm"
              >
                {searchingCustomer ? "..." : "Buscar"}
              </Button>
            </div>
          </div>

          {/* Exibir saldo atual do cliente */}
          {currentBalance !== null && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Saldo Atual:</span>
                <span className="text-lg font-bold text-blue-900">
                  R$ {currentBalance.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Operação *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'credito' | 'debito' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credito">Crédito (+)</SelectItem>
                <SelectItem value="debito">Débito (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              value={`R$ ${formatCurrency(formData.valor)}`}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Motivo do ajuste (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCashbackModal;