import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useCaixa } from '@/hooks/useCaixa';

interface CaixaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CaixaModal({ open, onOpenChange }: CaixaModalProps) {
  const { caixaAtual, loading, abrirCaixa, fecharCaixa, saldoAtual } = useCaixa();
  const [valorAbertura, setValorAbertura] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const temCaixaAberto = caixaAtual && caixaAtual.status === 'aberto';

  const handleAbrirCaixa = async () => {
    const valor = parseFloat(valorAbertura.replace(',', '.')) || 0;
    await abrirCaixa(valor);
    setValorAbertura('');
    setObservacoes('');
    onOpenChange(false);
  };

  const handleFecharCaixa = async () => {
    await fecharCaixa(observacoes);
    setObservacoes('');
    onOpenChange(false);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {temCaixaAberto ? 'Fechar Caixa' : 'Abrir Caixa'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status atual */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              {temCaixaAberto ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                Status: {temCaixaAberto ? 'Caixa Aberto' : 'Caixa Fechado'}
              </span>
            </div>
            
            {caixaAtual && temCaixaAberto && (
              <div className="text-sm text-gray-600">
                <p>Valor de abertura: {formatCurrency(caixaAtual.valor_abertura)}</p>
                <p>Saldo atual: {formatCurrency(saldoAtual)}</p>
                <p>Aberto em: {new Date(caixaAtual.data_abertura).toLocaleString('pt-BR')}</p>
                {caixaAtual.usuario_abertura && (
                  <p>Por: {caixaAtual.usuario_abertura}</p>
                )}
              </div>
            )}
          </div>

          {/* Campos específicos */}
          {!temCaixaAberto && (
            <div className="space-y-2">
              <Label htmlFor="valor_abertura">Valor de Abertura</Label>
              <Input
                id="valor_abertura"
                type="text"
                placeholder="0,00"
                value={valorAbertura}
                onChange={(e) => setValorAbertura(e.target.value)}
              />
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações {temCaixaAberto ? '(Fechamento)' : '(Abertura)'}
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Digite observações sobre o caixa..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            {temCaixaAberto ? (
              <Button
                onClick={handleFecharCaixa}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Fechando...' : 'Fechar Caixa'}
              </Button>
            ) : (
              <Button
                onClick={handleAbrirCaixa}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Abrindo...' : 'Abrir Caixa'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}