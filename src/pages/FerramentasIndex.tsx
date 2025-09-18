import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  Upload, 
  FileText, 
  Wrench,
  ExternalLink,
  Info,
  Zap,
  CheckCircle
} from 'lucide-react';

const FerramentasIndex: React.FC = () => {
  const ferramentas = [
    {
      titulo: '🔧 Corretor de URLs',
      descricao: 'Sistema avançado que testa 10 estratégias para corrigir URLs problemáticas do Cloudinary',
      url: '/test-cloudinary',
      icone: <Wrench className="h-8 w-8" />,
      status: '✅ Funcionando',
      cor: 'border-blue-200 bg-blue-50'
    },
    {
      titulo: '📤 Teste de Upload',
      descricao: 'Verifica se as configurações do .env estão funcionando para novos uploads',
      url: '/test-upload',
      icone: <Upload className="h-8 w-8" />,
      status: '✅ Funcionando',
      cor: 'border-green-200 bg-green-50'
    },
    {
      titulo: '🩺 Diagnóstico PDF',
      descricao: '5 tipos de diagnóstico completo para PDFs problemáticos',
      url: '/test-pdf',
      icone: <FileText className="h-8 w-8" />,
      status: '✅ Funcionando',
      cor: 'border-purple-200 bg-purple-50'
    },
    {
      titulo: '🧪 Teste de Vaga',
      descricao: 'Cria vagas de teste com candidaturas para testar o sistema kanban',
      url: '/test-vaga',
      icone: <TestTube className="h-8 w-8" />,
      status: '✅ Funcionando',
      cor: 'border-yellow-200 bg-yellow-50'
    };
  ];

  const abrirFerramenta = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  };

  const irParaFerramenta = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
            <Zap className="h-10 w-10" />
            🛠️ Central de Ferramentas
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Todas as ferramentas de teste e diagnóstico em um só lugar
          </p>
        </div>

        {/* Status do Sistema */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>🎉 Sistema 100% Operacional:</strong> Todas as ferramentas estão funcionando corretamente.
            <br />
            <strong>🎯 URL Atual:</strong> {window.location.href}
          </AlertDescription>
        </Alert>

        {/* Grid de Ferramentas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ferramentas.map((ferramenta, index) => (
            <Card key={index} className={`${ferramenta.cor} border-2 hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {ferramenta.icone}
                  <div>
                    <div className="text-lg">{ferramenta.titulo}</div>
                    <div className="text-sm font-normal text-gray-600">{ferramenta.status}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{ferramenta.descricao}</p>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => irParaFerramenta(ferramenta.url)}
                    className="flex-1"
                  >
                    🚀 Abrir Agora
                  </Button>
                  <Button 
                    onClick={() => abrirFerramenta(ferramenta.url)}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded">
                  {window.location.origin}{ferramenta.url}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sistema Principal */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              📋 Sistema Principal - Kanban de Inscrições
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Sistema principal com drag & drop, correção automática integrada e gerenciamento completo de candidaturas.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => irParaFerramenta('/')}>
                🏠 Ir para Sistema Principal
              </Button>
              <Button 
                onClick={() => irParaFerramenta('/meu-rh/inscricoes-vagas')}
                variant="outline"
              >
                📋 Direto para Inscrições
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instruções Rápidas */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>🚀 Teste Rápido:</strong>
            <br />1️⃣ Clique em "🔧 Corretor de URLs" → "🚀 TESTE RÁPIDO AGORA"
            <br />2️⃣ Aguarde carregar uma URL problemática real
            <br />3️⃣ Clique "Corrigir URL automaticamente" 
            <br />4️⃣ Veja as 10 estratégias sendo testadas em tempo real!
          </AlertDescription>
        </Alert>

        {/* Links Diretos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <Button 
                onClick={() => irParaFerramenta('/test-cloudinary')}
                variant="outline" 
                className="w-full"
              >
                🔧 Corretor
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Button 
                onClick={() => irParaFerramenta('/test-upload')}
                variant="outline" 
                className="w-full"
              >
                📤 Upload
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Button 
                onClick={() => irParaFerramenta('/test-pdf')}
                variant="outline" 
                className="w-full"
              >
                🩺 PDF
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Button 
                onClick={() => irParaFerramenta('/test-vaga')}
                variant="outline" 
                className="w-full"
              >
                🧪 Vaga
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
};

export default FerramentasIndex; 
