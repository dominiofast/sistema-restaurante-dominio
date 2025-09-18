import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ClockIcon, CheckCircle, XCircle } from 'lucide-react';
import { useTurnos } from '@/hooks/useTurnos';

interface TurnoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TurnoModal({ open, onOpenChange }: TurnoModalProps) {
  const { turnoAtual, loading, abrirTurno, fecharTurno, temTurnoAtivo } = useTurnos()
  const [observacoes, setObservacoes] = useState('')

  const handleAbrirTurno = async () => {
    await abrirTurno(observacoes)
    setObservacoes('')
    onOpenChange(false)
  };

  const handleFecharTurno = async () => {
    if (turnoAtual) {
      await fecharTurno(turnoAtual.id, observacoes)
      setObservacoes('')
      onOpenChange(false)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            {temTurnoAtivo() ? 'Fechar Turno' : 'Abrir Turno'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status atual */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              {temTurnoAtivo() ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                Status: {temTurnoAtivo() ? 'Turno Ativo' : 'Nenhum Turno Ativo'}
              </span>
            </div>
            
            {turnoAtual && (
              <div className="text-sm text-gray-600">
                <p>Turno #{turnoAtual.numero_turno}</p>
                <p>Aberto em: {new Date(turnoAtual.data_abertura).toLocaleString('pt-BR')}</p>
                {turnoAtual.usuario_abertura && (
                  <p>Por: {turnoAtual.usuario_abertura}</p>
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações {temTurnoAtivo() ? '(Fechamento)' : '(Abertura)'}
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Digite observações sobre o turno..."
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
            
            {temTurnoAtivo() ? (
              <Button
                onClick={handleFecharTurno}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Fechando...' : 'Fechar Turno'}
              </Button>
            ) : (
              <Button
                onClick={handleAbrirTurno}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Abrindo...' : 'Abrir Turno'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
