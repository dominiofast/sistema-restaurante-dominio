import React, { useState } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCaixa } from '@/hooks/useCaixa';
import { format } from 'date-fns';

const categorias = ['Venda', 'Sangria', 'Suprimento', 'Pagamento', 'Outros'];
const formas = ['Dinheiro', 'Cartão', 'Pix', 'Outros'];

interface NovoLancamento {
  tipo: 'entrada' | 'saida';
  valor: number;
  categoria: string;
  forma_pagamento: string;
  descricao: string;
  observacoes?: string;
}

export default function Caixa() {
  const {
    caixaAtual,
    lancamentos,
    loading,
    saldoAtual,
    totalEntradas,
    totalSaidas,
    abrirCaixa,
    fecharCaixa,
    adicionarLancamento
  } = useCaixa()

  const [valorAbertura, setValorAbertura] = useState(0)
  const [modal, setModal] = useState(false)
  const [modalFechar, setModalFechar] = useState(false)
  const [observacoesFechamento, setObservacoesFechamento] = useState('')
  const [novo, setNovo] = useState<NovoLancamento>({
    tipo: 'entrada',
    valor: 0,
    categoria: '',
    forma_pagamento: '',
    descricao: '',
    observacoes: ''
  })
  const [filtros, setFiltros] = useState({ data: '', tipo: 'todos', busca: '' })

  const handleAbrirCaixa = async () => {
    if (valorAbertura <= 0) {
      return;
    }
    
    const sucesso = await abrirCaixa(valorAbertura)
    if (sucesso) {
      setValorAbertura(0)
    }
  };

  const handleFecharCaixa = async () => {
    const sucesso = await fecharCaixa(observacoesFechamento)
    if (sucesso) {
      setModalFechar(false)
      setObservacoesFechamento('')
    }
  };

  const handleSalvarLancamento = async () => {
    if (!novo.descricao || !novo.categoria || !novo.forma_pagamento || novo.valor <= 0) {
      return;
    }

    const lancamentoData = {
      ...novo,
      data_lancamento: new Date().toISOString().split('T')[0],
      hora_lancamento: new Date().toTimeString().split(' ')[0].slice(0, 5)
    };

    const sucesso = await adicionarLancamento(lancamentoData)
    if (sucesso) {
      setModal(false)
      setNovo({
        tipo: 'entrada',
        valor: 0,
        categoria: '',
        forma_pagamento: '',
        descricao: '',
        observacoes: ''
      })
    }
  };

  // Filtrar lançamentos
  const lancamentosFiltrados = lancamentos.filter(l => {
    if (filtros.data && l.data_lancamento !== filtros.data) return false;
    if (filtros.tipo && filtros.tipo !== 'todos' && l.tipo !== filtros.tipo) return false;
    if (filtros.busca && !l.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) && 
        !l.categoria.toLowerCase().includes(filtros.busca.toLowerCase())) return false;
    return true;
  })

  return (
    <div className="px-2 py-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-l-4 border-blue-600 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-blue-800 font-semibold mb-1">Saldo Atual</div>
            <div className="text-3xl font-bold text-blue-900">R$ {saldoAtual.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 border-l-4 border-green-600 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-green-800 font-semibold mb-1">Entradas</div>
            <div className="text-2xl font-bold text-green-900">R$ {totalEntradas.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-red-100 to-red-50 border-l-4 border-red-500 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-red-700 font-semibold mb-1">Saídas</div>
            <div className="text-2xl font-bold text-red-900">R$ {totalSaidas.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-end min-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              caixaAtual ? 'bg-green-100 text-green-800 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'
            }`}>
              {caixaAtual ? 'Caixa Aberto' : 'Caixa Fechado'}
            </span>
          </div>
          {!caixaAtual ? (
            <div className="flex gap-2 items-end">
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="Valor de abertura"
                value={valorAbertura || ''}
                onChange={e => setValorAbertura(Number(e.target.value))}
                className="w-32"
              />
              <Button
                onClick={handleAbrirCaixa}
                disabled={valorAbertura <= 0 || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Abrindo...' : 'Abrir Caixa'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setModalFechar(true)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              Fechar Caixa
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Input
          type="date"
          className="w-auto"
          value={filtros.data}
          onChange={e => setFiltros(f => ({...f, data: e.target.value}))}
        />
        <Select
          value={filtros.tipo}
          onValueChange={value => setFiltros(f => ({...f, tipo: value}))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          className="flex-1 min-w-[200px]"
          placeholder="Buscar descrição/categoria..."
          value={filtros.busca}
          onChange={e => setFiltros(f => ({...f, busca: e.target.value}))}
        />
        <Button
          onClick={() => setModal(true)}
          disabled={!caixaAtual || loading}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Novo Lançamento
        </Button>
      </div>

      {/* Tabela responsiva */}
      <div className="overflow-x-auto rounded-xl shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">Data</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Hora</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Descrição</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Categoria</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Tipo</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Valor</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Forma</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Usuário</th>
            </tr>
          </thead>
          <tbody>
            {lancamentosFiltrados.map(l => (
              <tr key={l.id} className="border-b last:border-0 hover:bg-blue-50/30 transition">
                <td className="px-4 py-2 whitespace-nowrap">
                  {format(new Date(l.data_lancamento), 'dd/MM/yyyy')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{l.hora_lancamento}</td>
                <td className="px-4 py-2 min-w-[120px]">{l.descricao}</td>
                <td className="px-4 py-2">{l.categoria}</td>
                <td className="px-4 py-2 capitalize">{l.tipo}</td>
                <td className={`px-4 py-2 font-bold ${l.tipo === 'entrada' ? 'text-green-700' : 'text-red-700'}`}>
                  R$ {l.valor.toFixed(2)}
                </td>
                <td className="px-4 py-2">{l.forma_pagamento}</td>
                <td className="px-4 py-2">{l.usuario}</td>
              </tr>
            ))}
            {lancamentosFiltrados.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  {caixaAtual ? 'Nenhum lançamento encontrado' : 'Abra o caixa para começar a registrar lançamentos'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal novo lançamento */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-2xl font-bold"
              onClick={() => setModal(false)}
              aria-label="Fechar"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Novo Lançamento</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 flex-col sm:flex-row">
                <Select
                  value={novo.tipo}
                  onValueChange={(value: 'entrada' | 'saida') => setNovo(n => ({...n, tipo: value}))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Valor"
                  value={novo.valor || ''}
                  onChange={e => setNovo(n => ({...n, valor: Number(e.target.value)}))}
                  className="flex-1"
                />
              </div>
              <Select
                value={novo.categoria}
                onValueChange={value => setNovo(n => ({...n, categoria: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Descrição"
                value={novo.descricao}
                onChange={e => setNovo(n => ({...n, descricao: e.target.value}))}
              />
              <Select
                value={novo.forma_pagamento}
                onValueChange={value => setNovo(n => ({...n, forma_pagamento: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {formas.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSalvarLancamento}
                disabled={loading || !novo.descricao || !novo.categoria || !novo.forma_pagamento || novo.valor <= 0}
                className="mt-4"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal fechar caixa */}
      {modalFechar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
              onClick={() => setModalFechar(false)}
              aria-label="Fechar"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4 text-red-700">Fechar Caixa</h2>
            <div className="mb-4">
              <p className="mb-2 text-gray-700">
                Valor final: <strong>R$ {saldoAtual.toFixed(2)}</strong>
              </p>
              <p className="mb-4 text-gray-600">
                Tem certeza que deseja fechar o caixa? Esta ação não pode ser desfeita.
              </p>
              <div>
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações sobre o fechamento..."
                  value={observacoesFechamento}
                  onChange={e => setObservacoesFechamento(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setModalFechar(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleFecharCaixa}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Fechando...' : 'Fechar Caixa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
