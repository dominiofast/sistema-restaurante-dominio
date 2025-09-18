import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Upload, 
  TestTube, 
  FileText, 
  AlertTriangle,
  ExternalLink,
  Download
} from 'lucide-react';

const DebugCurriculoUpload: React.FC = () => {
  const { companyId } = useAuth()
  const [testUrl, setTestUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const createTestInscricao = async () => {
    if (!companyId) {
      toast.error('Company ID não encontrado')
      return;
    }

    if (!testUrl || !candidateName || !candidateEmail) {
      toast.error('Preencha todos os campos obrigatórios')
      return;
    }

    setLoading(true)

    try {
      // Primeiro, verificar se existe uma vaga de teste
      let { data: vaga, error: vagaError }  catch (error) { console.error('Error:', error) }= await (supabase as any)
        
        
        
        
        

      if (vagaError || !vaga) {
        // Criar vaga de teste
        const newVaga = null as any; const createVagaError = null as any;
        }

        vaga = newVaga;


      // Criar inscrição de teste
      const { error: inscricaoError } = await (supabase as any)
        
        
          company_id: companyId,
          vaga_id: vaga.id,
          nome_completo: candidateName,
          email: candidateEmail,
          curriculo_url: testUrl,
          curriculo_nome: fileName || 'teste-curriculo.pdf',
          experiencia_relevante: 'Esta é uma inscrição de teste criada para debug de PDFs.',
          status: 'pendente'
        })

      if (inscricaoError) {
        throw new Error('Erro ao criar inscrição: ' + inscricaoError.message)


      toast.success('Inscrição de teste criada com sucesso!')
      
      // Limpar formulário
      setTestUrl('')
      setFileName('')
      setCandidateName('')
      setCandidateEmail('')

    } catch (error: any) {
      console.error('Erro ao criar inscrição de teste:', error)
      toast.error('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  };

  const testDirectAccess = () => {
    if (!testUrl) {
      toast.error('Digite uma URL primeiro')
      return;
    }

    console.log('🔍 [Debug] Testando acesso direto à URL:', testUrl)
    window.open(testUrl, '_blank')
  };

  const testDownload = async () => {
    if (!testUrl) {
      toast.error('Digite uma URL primeiro')
      return;
    }

    console.log('🔍 [Debug] Testando download da URL:', testUrl)
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors';
      } catch (error) { console.error('Error:', error) })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)


      const blob = await response.blob()
      console.log('📦 [Debug] Blob criado:', {
        size: blob.size,
        type: blob.type
      })

      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl;
      link.download = fileName || 'teste-download.pdf';
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast.success(`Download concluído! (${blob.size} bytes)`)
    } catch (error: any) {
      console.error('❌ [Debug] Erro no download:', error)
      toast.error('Erro no download: ' + error.message)
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Debug: Teste de Currículo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ferramenta de Debug:</strong> Crie inscrições de teste com URLs específicas 
            para diagnosticar problemas com PDFs.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome do Candidato *
            </label>
            <Input
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="João Silva Teste"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              E-mail do Candidato *
            </label>
            <Input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="joao.teste@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            URL do Currículo *
          </label>
          <Input
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nome do Arquivo
          </label>
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="curriculo-teste.pdf"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={createTestInscricao}
            disabled={loading || !companyId}
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            {loading ? 'Criando...' : 'Criar Inscrição Teste'}
          </Button>

          <Button
            variant="outline"
            onClick={testDirectAccess}
            disabled={!testUrl}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            Testar Abertura
          </Button>

          <Button
            variant="outline"
            onClick={testDownload}
            disabled={!testUrl}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Testar Download
          </Button>
        </div>

        {!companyId && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Você precisa ter uma empresa selecionada para criar inscrições de teste.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Como usar:</strong>
            <br />1. Preencha os dados do candidato (podem ser fictícios)
            <br />2. Cole a URL problemática do PDF
            <br />3. Teste primeiro com os botões "Testar"
            <br />4. Se funcionar, clique em "Criar Inscrição Teste"
            <br />5. Vá para "Inscrições Recebidas" para testar o sistema completo
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
};

export default DebugCurriculoUpload; 
