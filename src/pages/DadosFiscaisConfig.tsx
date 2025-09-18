import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DadosFiscaisForm } from '@/components/fiscal/DadosFiscaisForm';
import { useDadosFiscais } from '@/hooks/useDadosFiscais';

export default function DadosFiscaisConfig() {
  const { tipoId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const tipoNome = location.state?.tipoNome || 'Tipo Fiscal';
  const { dadosFiscais, loading, buscarDadosFiscais, salvarDadosFiscais } = useDadosFiscais()

  useEffect(() => {
    if (tipoId) {
      buscarDadosFiscais(tipoId)
    }
  }, [tipoId, buscarDadosFiscais])

  const handleSubmit = async (data: any) => {
    console.log('=== SUBMIT DADOS FISCAIS ===')
    console.log('TipoId:', tipoId)
    console.log('Data recebida:', data)
    console.log('Campos principais:', {
      descricao: data.descricao,
      ncm: data.ncm,
      cfop: data.cfop,
      origem_mercadoria: data.origem_mercadoria
    })
    
    if (!tipoId) {
      toast.error('ID do tipo fiscal não encontrado')
      return;
    }

    try {
      const resultado = await salvarDadosFiscais(tipoId, data)
      console.log('Resultado do salvamento:', resultado)
      toast.success('Dados fiscais salvos com sucesso!')
      navigate('/opcoes-loja/dados-fiscais')
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar dados fiscais: ' + error.message)
    }
  };

  const handleCancel = () => {
    navigate('/opcoes-loja/dados-fiscais')
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/opcoes-loja/dados-fiscais')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configurar Dados Fiscais</h1>
          <p className="text-muted-foreground">
            Configurando dados fiscais para: <strong>{tipoNome}</strong>
          </p>
        </div>
      </div>

      <DadosFiscaisForm
        initialData={dadosFiscais}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
