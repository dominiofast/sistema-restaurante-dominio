
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCompanyFiscalConfig, CompanyFiscalConfig } from '@/hooks/useCompanyFiscalConfig';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Save } from 'lucide-react';

// Estados brasileiros completos
const ESTADOS_BRASILEIROS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' };
];

// CNAEs mais comuns para restaurantes e estabelecimentos comerciais
const CNAES_COMUNS = [
  { codigo: '5611-2/01', descricao: 'Restaurantes e similares' },
  { codigo: '5611-2/02', descricao: 'Bares e outros estabelecimentos especializados em servir bebidas' },
  { codigo: '5611-2/03', descricao: 'Lanchonetes, casas de chá, de sucos e similares' },
  { codigo: '5620-1/04', descricao: 'Fornecimento de alimentos preparados preponderantemente para consumo domiciliar' },
  { codigo: '4721-1/02', descricao: 'Comércio varejista de carnes e pescados - açougues e peixarias' },
  { codigo: '4711-3/01', descricao: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - hipermercados' },
  { codigo: '4712-1/00', descricao: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados' },
  { codigo: '4713-0/01', descricao: 'Lojas de departamentos ou magazines' },
  { codigo: '4729-6/99', descricao: 'Comércio varejista de produtos alimentícios em geral ou especializado em produtos alimentícios não especificados anteriormente' };
];

export function ConfiguracaoFiscalCompleta() {
  const { fiscalConfig, loading, saveFiscalConfig, validarConfiguracao } = useCompanyFiscalConfig()
  const [formData, setFormData] = useState<Partial<CompanyFiscalConfig>>({})
  const [validation, setValidation] = useState({ valid: false, errors: [] })

  useEffect(() => {
    if (fiscalConfig) {
      console.log('Setting form data from fiscalConfig:', fiscalConfig)
      setFormData(fiscalConfig)
    } else {
      // Inicializar com valores padrão quando não há configuração
      console.log('Initializing with default values')
      setFormData({
        cnpj: '',
        inscricao_estadual: '',
        razao_social: '',
        nome_fantasia: '',
        telefone: '',
        regime_tributario: 'simples_nacional',
        cep: '',
        uf: '',
        cidade: '',
        bairro: '',
        logradouro: '',
        numero: '',
        cnae_principal: '',
        natureza_operacao: 'Venda',
        nfce_serie: 1,
        nfce_proxima_numeracao: 1,
        informacao_complementar_nfce: '',
        focus_nfe_token: '',
        focus_nfe_ambiente: 'homologacao',
        email_xmls: ''
      })

  }, [fiscalConfig])

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      const result = validarConfiguracao()
      setValidation(result)

  }, [formData, validarConfiguracao])

  const handleInputChange = (field: keyof CompanyFiscalConfig, value: any) => {
    console.log(`Changing field ${field} to:`, value)
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  };

  const handleSave = async () => {
    try {
      console.log('Attempting to save formData:', formData)
      const success = await saveFiscalConfig(formData)
      if (success) {
        toast.success('Configuração fiscal salva com sucesso!')
      }  catch (error) { console.error('Error:', error) }else {
        throw new Error('Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Error saving fiscal config:', error)
      toast.error('Erro ao salvar configuração fiscal')

  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Carregando configuração fiscal...</p>
      </div>
    )


  return (
    <div className="space-y-6">
      {/* Status da Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validation.valid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            )}
            Status da Configuração Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validation.valid ? (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Configuração fiscal está completa e válida para emissão de NFCe.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <div>
                  <p className="font-medium mb-2">Pendências encontradas:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Configuração */}
      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="fiscal">Dados Fiscais</TabsTrigger>
          <TabsTrigger value="focus">Focus NFe</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj || ''}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricao_estadual"
                    value={formData.inscricao_estadual || ''}
                    onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
                    placeholder="000.000.000.000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social *</Label>
                  <Input
                    id="razao_social"
                    value={formData.razao_social || ''}
                    onChange={(e) => handleInputChange('razao_social', e.target.value)}
                    placeholder="Razão Social da Empresa Ltda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                  <Input
                    id="nome_fantasia"
                    value={formData.nome_fantasia || ''}
                    onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                    placeholder="Nome Fantasia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone || ''}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regime_tributario">Regime Tributário</Label>
                  <Select 
                    value={formData.regime_tributario || 'simples_nacional'} 
                    onValueChange={(value) => handleInputChange('regime_tributario', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                      <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="lucro_real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CNAE Section */}
              <div className="space-y-2">
                <Label htmlFor="cnae_principal">CNAE Principal *</Label>
                <Select 
                  value={formData.cnae_principal || ''} 
                  onValueChange={(value) => handleInputChange('cnae_principal', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o CNAE principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {CNAES_COMUNS.map((cnae) => (
                      <SelectItem key={cnae.codigo} value={cnae.codigo}>
                        {cnae.codigo} - {cnae.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endereco">
          <Card>
            <CardHeader>
              <CardTitle>Endereço da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={formData.cep || ''}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf">UF *</Label>
                  <Select 
                    value={formData.uf || ''} 
                    onValueChange={(value) => handleInputChange('uf', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASILEIROS.map((estado) => (
                        <SelectItem key={estado.sigla} value={estado.sigla}>
                          {estado.sigla} - {estado.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade || ''}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro || ''}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    placeholder="Nome do bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro *</Label>
                  <Input
                    id="logradouro"
                    value={formData.logradouro || ''}
                    onChange={(e) => handleInputChange('logradouro', e.target.value)}
                    placeholder="Nome da rua"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    value={formData.numero || ''}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="natureza_operacao">Natureza da Operação</Label>
                  <Input
                    id="natureza_operacao"
                    value={formData.natureza_operacao || 'Venda'}
                    onChange={(e) => handleInputChange('natureza_operacao', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nfce_serie">Série NFCe</Label>
                  <Input
                    id="nfce_serie"
                    type="number"
                    value={formData.nfce_serie || 1}
                    onChange={(e) => handleInputChange('nfce_serie', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nfce_proxima_numeracao">Próxima Numeração NFCe</Label>
                  <Input
                    id="nfce_proxima_numeracao"
                    type="number"
                    value={formData.nfce_proxima_numeracao || 1}
                    onChange={(e) => handleInputChange('nfce_proxima_numeracao', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="informacao_complementar_nfce">Informação Complementar</Label>
                  <Input
                    id="informacao_complementar_nfce"
                    value={formData.informacao_complementar_nfce || ''}
                    onChange={(e) => handleInputChange('informacao_complementar_nfce', e.target.value)}
                    placeholder="Informações adicionais para a NFCe"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Focus NFe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="focus_nfe_token">Token Focus NFe *</Label>
                  <Input
                    id="focus_nfe_token"
                    type="password"
                    value={formData.focus_nfe_token || ''}
                    onChange={(e) => handleInputChange('focus_nfe_token', e.target.value)}
                    placeholder="Seu token da Focus NFe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focus_nfe_ambiente">Ambiente</Label>
                  <Select 
                    value={formData.focus_nfe_ambiente || 'homologacao'} 
                    onValueChange={(value) => handleInputChange('focus_nfe_ambiente', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homologacao">Homologação</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_xmls">Email para XMLs</Label>
                  <Input
                    id="email_xmls"
                    type="email"
                    value={formData.email_xmls || ''}
                    onChange={(e) => handleInputChange('email_xmls', e.target.value)}
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Importante sobre o Certificado Digital</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Para usar a Focus NFe, você deve fazer upload do seu certificado digital (.p12/.pfx) 
                  diretamente no painel da Focus NFe, não aqui na aplicação. Isso é mais seguro e prático.
                </p>
                <div className="mt-2">
                  <p className="text-sm text-blue-700">
                    <strong>Como fazer:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 list-decimal list-inside mt-1">
                    <li>Acesse o painel da Focus NFe</li>
                    <li>Vá em "Certificados"</li>
                    <li>Faça upload do seu certificado</li>
                    <li>Configure a senha do certificado lá</li>
                    <li>Aqui você só precisa configurar o token</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Salvar Configuração Fiscal
        </Button>
      </div>
    </div>
  )

