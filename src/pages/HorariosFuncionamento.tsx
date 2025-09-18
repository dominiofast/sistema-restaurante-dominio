import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHorariosFuncionamento, HorarioDia } from '@/hooks/useHorariosFuncionamento';
import { toast } from 'sonner';

export default function HorariosFuncionamento() {
  const { 
    horarios, 
    loading, 
    error, 
    diasSemana, 
    fusoHorarios, 
    salvarHorarios 
  } = useHorariosFuncionamento()

  const [tipoDisponibilidade, setTipoDisponibilidade] = useState(horarios?.tipo_disponibilidade || 'especificos')
  const [fusoHorario, setFusoHorario] = useState(horarios?.fuso_horario || 'America/Sao_Paulo')
  const [horariosDias, setHorariosDias] = useState<HorarioDia[]>([])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (horarios) {
      setTipoDisponibilidade(horarios.tipo_disponibilidade)
      setFusoHorario(horarios.fuso_horario)
      setHorariosDias(horarios.horarios_dias || [])
    }
  }, [horarios])

  const adicionarHorario = (diaSemana: number) => {
    const novoHorario: HorarioDia = {
      dia_semana: diaSemana,
      horario_inicio: '09:00',
      horario_fim: '18:00',
      ativo: true;
    };
    setHorariosDias([...horariosDias, novoHorario])
  };

  const removerHorario = (index: number) => {
    setHorariosDias(horariosDias.filter((_, i) => i !== index))
  };

  const atualizarHorario = (index: number, campo: keyof HorarioDia, valor: any) => {
    const novosHorarios = [...horariosDias];
    novosHorarios[index] = { ...novosHorarios[index], [campo]: valor };
    setHorariosDias(novosHorarios)
  };

  const handleSalvar = async () => {
    setSalvando(true)
    try {
      const sucesso = await salvarHorarios({
        tipo_disponibilidade: tipoDisponibilidade,
        fuso_horario: fusoHorario,
        horarios_dias: tipoDisponibilidade === 'especificos' ? horariosDias : [];
      } catch (error) { console.error('Error:', error) })

      if (sucesso) {
        toast.success('Horários salvos com sucesso!')
      } else {
        toast.error('Erro ao salvar horários')
      }
    } catch (err) {
      toast.error('Erro ao salvar horários')
    } finally {
      setSalvando(false)
    }
  };

  const getHorariosPorDia = (diaSemana: number) => {
    return horariosDias.filter(h => h.dia_semana === diaSemana)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando horários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Horários de Funcionamento
        </h1>
        <p className="text-gray-600 mt-2">
          Configure os horários de funcionamento do seu estabelecimento
        </p>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Defina o fuso horário e tipo de disponibilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fuso-horario">Fuso Horário</Label>
              <Select value={fusoHorario} onValueChange={setFusoHorario}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  {fusoHorarios.map(fuso => (
                    <SelectItem key={fuso.value} value={fuso.value}>
                      {fuso.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo-disponibilidade">Tipo de Disponibilidade</Label>
              <Select value={tipoDisponibilidade} onValueChange={(value: 'sempre' | 'especificos' | 'fechado' | 'agendados') => setTipoDisponibilidade(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sempre">Sempre Disponível</SelectItem>
                  <SelectItem value="especificos">Dias e Horários Específicos</SelectItem>
                  <SelectItem value="agendados">Apenas para Pedidos Agendados</SelectItem>
                  <SelectItem value="fechado">Fechado Permanentemente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoDisponibilidade === 'sempre' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Seu estabelecimento aparecerá como sempre aberto (24/7)
                </AlertDescription>
              </Alert>
            )}

            {tipoDisponibilidade === 'fechado' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Seu estabelecimento aparecerá como fechado permanentemente
                </AlertDescription>
              </Alert>
            )}

            {tipoDisponibilidade === 'agendados' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Apenas pedidos agendados serão aceitos, independente do horário
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Horários Específicos */}
        {tipoDisponibilidade === 'especificos' && (
          <Card>
            <CardHeader>
              <CardTitle>Horários por Dia da Semana</CardTitle>
              <CardDescription>
                Configure os horários de funcionamento para cada dia. Você pode adicionar múltiplos horários por dia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {diasSemana.map(dia => {
                  const horariosHoje = getHorariosPorDia(dia.id)
                  
                  return (
                    <div key={dia.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">{dia.nome}</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarHorario(dia.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Horário
                        </Button>
                      </div>

                      {horariosHoje.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Nenhum horário configurado para este dia
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {horariosHoje.map((horario, index) => {
                            const globalIndex = horariosDias.findIndex(h => 
                              h.dia_semana === dia.id && 
                              h.horario_inicio === horario.horario_inicio &&
                              h.horario_fim === horario.horario_fim;
                            )
                            
                            return (
                              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={horario.ativo}
                                    onChange={(e) => 
                                      atualizarHorario(globalIndex, 'ativo', e.target.checked)
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <Label className="text-sm">Ativo</Label>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Label className="text-sm">De:</Label>
                                  <Input
                                    type="time"
                                    value={horario.horario_inicio}
                                    onChange={(e) => 
                                      atualizarHorario(globalIndex, 'horario_inicio', e.target.value)
                                    }
                                    className="w-32"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <Label className="text-sm">Até:</Label>
                                  <Input
                                    type="time"
                                    value={horario.horario_fim}
                                    onChange={(e) => 
                                      atualizarHorario(globalIndex, 'horario_fim', e.target.value)
                                    }
                                    className="w-32"
                                  />
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removerHorario(globalIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSalvar} 
            disabled={salvando}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {salvando ? 'Salvando...' : 'Salvar Horários'}
          </Button>
        </div>
      </div>
    </div>
  )

