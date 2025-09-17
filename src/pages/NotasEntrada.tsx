
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, PlusCircle, Download, Search, ChevronDown, Trash2, Pencil, DollarSign, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotaEntrada {
  id: string;
  numero: string;
  fornecedor_id: string | null;
  valor_total: number;
  data_entrada: Date;
  data_emissao: Date;
  created_at: Date;
  conciliacao_financeira: boolean;
  conciliacao_estoque: boolean;
  observacoes: string | null;
  company_id: string;
}

const NotasEntradaPage: React.FC = () => {
  const [notas, setNotas] = useState<NotaEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notas_entrada')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      const formattedData = data.map(nota => ({
        ...nota,
        data_entrada: new Date(nota.data_entrada),
        data_emissao: new Date(nota.data_emissao),
        created_at: new Date(nota.created_at),
      })) as NotaEntrada[];

      setNotas(formattedData);
    } catch (error: any) {
      console.error('Erro ao buscar notas de entrada:', error);
      toast.error('Falha ao buscar as notas de entrada.', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const DatePicker = ({ date, setDate }: { date: Date | undefined, setDate: (date: Date | undefined) => void }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal bg-white">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
      </PopoverContent>
    </Popover>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Carregando notas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full h-12 w-12 p-0">
            <PlusCircle className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Notas de entrada</h1>
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            NOVOS CAMPOS NA NOTA DE ENTRADA
          </Button>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          EXPORTAR XML
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <RadioGroup defaultValue="data_entrada" className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="data_entrada" id="data_entrada" />
              <label htmlFor="data_entrada">Data Entrada</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="data_emissao" id="data_emissao" />
              <label htmlFor="data_emissao">Data Emissão</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="data_cadastro" id="data_cadastro" />
              <label htmlFor="data_cadastro">Data Cadastro</label>
            </div>
          </RadioGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7 gap-4 items-end">
            <div className="space-y-1"><label className="text-sm">De</label><DatePicker date={dateFrom} setDate={setDateFrom} /></div>
            <div className="space-y-1"><label className="text-sm">Até</label><DatePicker date={dateTo} setDate={setDateTo} /></div>
            <div className="space-y-1"><label className="text-sm">Número</label><Input placeholder="Número" className="bg-white" /></div>
            <div className="space-y-1"><label className="text-sm">Fornecedor</label><Select><SelectTrigger className="bg-white"><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-sm">Conciliação Financeira</label><Select><SelectTrigger className="bg-white"><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-sm">Conciliação Estoque</label><Select><SelectTrigger className="bg-white"><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-sm">Tipo de entrada</label><Select><SelectTrigger className="bg-white"><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full xl:w-auto"><Search className="mr-2 h-4 w-4" />BUSCAR</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>NÚMERO</TableHead>
                <TableHead>FORNECEDOR ID</TableHead>
                <TableHead>VALOR TOTAL</TableHead>
                <TableHead>ENTRADA</TableHead>
                <TableHead>EMISSÃO</TableHead>
                <TableHead className="flex items-center gap-1">CADASTRO <ChevronDown className="h-4 w-4" /></TableHead>
                <TableHead>CONC. FIN.</TableHead>
                <TableHead>CONC. ESTOQ.</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Nenhuma nota de entrada encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                notas.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell>{nota.numero}</TableCell>
                    <TableCell>{nota.fornecedor_id || 'N/A'}</TableCell>
                    <TableCell>R$ {nota.valor_total.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>{format(nota.data_entrada, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(nota.data_emissao, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(nota.created_at, 'dd/MM/yyyy')}</TableCell>
                    <TableCell className={nota.conciliacao_financeira ? 'text-green-600' : 'text-red-600'}>{nota.conciliacao_financeira ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className={nota.conciliacao_estoque ? 'text-green-600' : 'text-red-600'}>{nota.conciliacao_estoque ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon"><DollarSign className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon"><ShoppingCart className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotasEntradaPage;
