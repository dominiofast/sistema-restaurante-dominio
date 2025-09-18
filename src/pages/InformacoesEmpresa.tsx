import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useCompanyFiscalConfig } from '@/hooks/useCompanyFiscalConfig';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Upload, Eye, EyeOff, Download } from 'lucide-react';
// SUPABASE REMOVIDO
const InformacoesEmpresa = () => {
  const { currentCompany } = useAuth();
  const { companyInfo, loading, saveCompanyInfo } = useCompanyInfo();
  const { fiscalConfig, loading: fiscalLoading, saveFiscalConfig } = useCompanyFiscalConfig();
  const [activeTab, setActiveTab] = useState('loja');
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    // Informações da Loja
    codigo: currentCompany?.store_code?.toString() || '',
    razao_social: '',
    nome_fantasia: '',
    cnae: '',
    cnpj_cpf: '',
    inscricao_estadual: '',
    telefone1: '',
    telefone2: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    
    // Informações Fiscais
    regime_tributario: 'simples_nacional',
    email_xmls: '',
    certificado_status: 'ativo',
    certificado_validade: '18/07/2025',
    certificado_senha: '',
    focus_nfe_token: '',
    focus_nfe_ambiente: 'homologacao',
    nfce_token: '',
    nfce_id_token: '1',
    nfce_serie: 2,
    nfce_proxima_numeracao: 36603,
    nfe_serie: 1,
    nfe_proxima_numeracao: 2,
    info_complementar_nfce: ''
  });

  // Atualizar form quando dados carregarem
  useEffect(() => {
    if (companyInfo) {
      setFormData(prev => ({
        ...prev,
        razao_social: companyInfo.razao_social || '',
        nome_fantasia: companyInfo.nome_estabelecimento || '',
        cnpj_cpf: companyInfo.cnpj_cpf || '',
        inscricao_estadual: companyInfo.inscricao_estadual || '',
        telefone1: companyInfo.contato || '',
        telefone2: companyInfo.telefone2 || '',
        cep: companyInfo.cep || '',
        endereco: companyInfo.endereco || '',
        numero: companyInfo.numero || '',
        complemento: companyInfo.complemento || '',
        bairro: companyInfo.bairro || '',
        cidade: companyInfo.cidade || '',
        estado: companyInfo.estado || '',
        cnae: companyInfo.cnae || '',
      }));
    }
  }, [companyInfo]);

  // Atualizar código da empresa quando currentCompany carrega
  useEffect(() => {
    if (currentCompany?.store_code) {
      setFormData(prev => ({
        ...prev,
        codigo: currentCompany.store_code.toString(),
      }));
    }
  }, [currentCompany]);

  useEffect(() => {
    console.log('InformacoesEmpresa: fiscalConfig updated:', fiscalConfig);
    if (fiscalConfig) {
      setFormData(prev => ({
        ...prev,
        // CPF/CNPJ e Inscrição Estadual vêm de company_info, não de fiscal_config
        // cnpj_cpf: fiscalConfig.cnpj || '',
        // inscricao_estadual: fiscalConfig.inscricao_estadual || '',
        regime_tributario: fiscalConfig.regime_tributario || 'simples_nacional',
        email_xmls: fiscalConfig.email_xmls || '',
        certificado_senha: fiscalConfig.certificado_senha || '',
        focus_nfe_token: fiscalConfig.focus_nfe_token || '',
        focus_nfe_ambiente: fiscalConfig.focus_nfe_ambiente || 'homologacao',
        nfce_token: fiscalConfig.nfce_token || '',
        nfce_id_token: fiscalConfig.nfce_id_token || '1',
        nfce_serie: fiscalConfig.nfce_serie || 2,
        nfce_proxima_numeracao: fiscalConfig.nfce_proxima_numeracao || 36603,
        nfe_serie: fiscalConfig.nfe_serie || 1,
        nfe_proxima_numeracao: fiscalConfig.nfe_proxima_numeracao || 2,
        info_complementar_nfce: fiscalConfig.informacao_complementar_nfce || ''
      }));
    }
  }, [fiscalConfig]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: string, value: string, defaultValue: number) => {
    const numValue = parseInt(value) || defaultValue;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentCompany?.id) {
      console.log('handleCertificateUpload: Missing file or company ID', { file: !!file, companyId: currentCompany?.id });
      return;
    }

    console.log('handleCertificateUpload: Starting upload', { fileName: file.name, fileSize: file.size, companyId: currentCompany.id });

    // Validar tipo de arquivo (apenas .p12 ou .pfx)
    const allowedTypes = ['.p12', '.pfx'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      console.error('handleCertificateUpload: Invalid file type', { fileExtension, allowedTypes });
      toast.error('Apenas arquivos .p12 ou .pfx são permitidos');
      return;
    }

    try {
      setUploadingCertificate(true);
      
      const fileExt = fileExtension;
      const fileName = `certificado_${currentCompany.id}_${Date.now()}${fileExt}`;
      const filePath = `${currentCompany.id}/${fileName}`;

      console.log('handleCertificateUpload: Uploading to storage', { filePath, bucketId: 'certificados' });

      const { data, error: uploadError } = await /* supabase REMOVIDO */ null; //storage
        /* .from REMOVIDO */ ; //'certificados')
        .upload(filePath, file);

      if (uploadError) {
        console.error('handleCertificateUpload: Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('handleCertificateUpload: Upload successful', { data });

      // Atualizar o caminho do certificado na configuração fiscal
      console.log('handleCertificateUpload: Updating fiscal config with certificate path');
      const result = await saveFiscalConfig({
        certificado_path: filePath,
        certificado_status: 'ativo',
        certificado_validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano de validade padrão
      });

      console.log('handleCertificateUpload: Fiscal config update result:', result);

      if (result) {
        toast.success('Certificado enviado com sucesso!');
      } else {
        toast.error('Erro ao salvar configuração do certificado');
      }
    } catch (error) {
      console.error('handleCertificateUpload: Error:', error);
      toast.error(`Erro ao enviar certificado: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setUploadingCertificate(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCertificateDownload = async () => {
    if (!fiscalConfig?.certificado_path || !currentCompany?.id) {
      toast.error('Nenhum certificado encontrado');
      return;
    }

    try {
      const { data, error } = await /* supabase REMOVIDO */ null; //storage
        /* .from REMOVIDO */ ; //'certificados')
        .download(fiscalConfig.certificado_path);

      if (error) throw error;

      // Criar URL para download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado_${currentCompany.name}.p12`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Download iniciado');
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
      toast.error('Erro ao baixar certificado');
    }
  };

  const handleSave = async () => {
    console.log('handleSave: Starting save operation for tab:', activeTab);
    console.log('handleSave: Form data:', formData);
    
    try {
      if (activeTab === 'loja') {
        console.log('handleSave: Saving company info');
        await saveCompanyInfo({
          razao_social: formData.razao_social,
          nome_estabelecimento: formData.nome_fantasia,
          cnpj_cpf: formData.cnpj_cpf,
          inscricao_estadual: formData.inscricao_estadual,
          contato: formData.telefone1,
          telefone2: formData.telefone2,
          cep: formData.cep,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          cnae: formData.cnae,
        });
        
        // Salvar também a inscrição estadual na configuração fiscal
        if (formData.inscricao_estadual) {
          console.log('handleSave: Also saving inscricao_estadual to fiscal config');
          await saveFiscalConfig({
            cnpj: formData.cnpj_cpf,
            inscricao_estadual: formData.inscricao_estadual,
          });
        }
      } else if (activeTab === 'fiscais') {
        console.log('handleSave: Saving fiscal config');
        console.log('handleSave: CNPJ/CPF value:', formData.cnpj_cpf);
        console.log('handleSave: Inscrição Estadual value:', formData.inscricao_estadual);
        
        const fiscalData = {
          cnpj: formData.cnpj_cpf,
          inscricao_estadual: formData.inscricao_estadual,
          regime_tributario: formData.regime_tributario,
          email_xmls: formData.email_xmls,
          certificado_senha: formData.certificado_senha,
          focus_nfe_token: formData.focus_nfe_token,
          focus_nfe_ambiente: formData.focus_nfe_ambiente,
          nfce_token: formData.nfce_token,
          nfce_id_token: formData.nfce_id_token,
          nfce_serie: formData.nfce_serie,
          nfce_proxima_numeracao: formData.nfce_proxima_numeracao,
          nfe_serie: formData.nfe_serie,
          nfe_proxima_numeracao: formData.nfe_proxima_numeracao,
          informacao_complementar_nfce: formData.info_complementar_nfce
        };
        
        console.log('handleSave: Fiscal data to save:', fiscalData);
        const result = await saveFiscalConfig(fiscalData);
        console.log('handleSave: Fiscal config save result:', result);
      }
      toast.success('Informações salvas com sucesso!');
    } catch (error) {
      console.error('handleSave: Error saving information:', error);
      toast.error('Erro ao salvar informações');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Informações da Empresa</h1>
        <p className="text-gray-600">
          Configure as informações básicas e fiscais da sua empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="loja">INFORMAÇÕES DA LOJA</TabsTrigger>
              <TabsTrigger value="fiscais">INFORMAÇÕES FISCAIS</TabsTrigger>
            </TabsList>

            <TabsContent value="loja" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Primeira coluna */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => handleInputChange('codigo', e.target.value)}
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="razao_social">Razão Social *</Label>
                    <Input
                      id="razao_social"
                      value={formData.razao_social}
                      onChange={(e) => handleInputChange('razao_social', e.target.value)}
                      placeholder="Razão social da empresa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpj_cpf">CPF/CNPJ *</Label>
                    <Input
                      id="cnpj_cpf"
                      value={formData.cnpj_cpf}
                      onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone1">Telefone 1 *</Label>
                    <Input
                      id="telefone1"
                      value={formData.telefone1}
                      onChange={(e) => handleInputChange('telefone1', e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endereco">Endereço *</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      placeholder="Nome da rua/avenida"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange('bairro', e.target.value)}
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">Acre</SelectItem>
                        <SelectItem value="AL">Alagoas</SelectItem>
                        <SelectItem value="AP">Amapá</SelectItem>
                        <SelectItem value="AM">Amazonas</SelectItem>
                        <SelectItem value="BA">Bahia</SelectItem>
                        <SelectItem value="CE">Ceará</SelectItem>
                        <SelectItem value="DF">Distrito Federal</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="GO">Goiás</SelectItem>
                        <SelectItem value="MA">Maranhão</SelectItem>
                        <SelectItem value="MT">Mato Grosso</SelectItem>
                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PA">Pará</SelectItem>
                        <SelectItem value="PB">Paraíba</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="PE">Pernambuco</SelectItem>
                        <SelectItem value="PI">Piauí</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="RO">Rondônia</SelectItem>
                        <SelectItem value="RR">Roraima</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="SE">Sergipe</SelectItem>
                        <SelectItem value="TO">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda coluna */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                    <Input
                      id="nome_fantasia"
                      value={formData.nome_fantasia}
                      onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                      placeholder="Nome fantasia da empresa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="inscricao_estadual">Inscrição Estadual *</Label>
                    <Input
                      id="inscricao_estadual"
                      value={formData.inscricao_estadual}
                      onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
                      placeholder="000000000000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone2">Telefone 2</Label>
                    <Input
                      id="telefone2"
                      value={formData.telefone2}
                      onChange={(e) => handleInputChange('telefone2', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleInputChange('numero', e.target.value)}
                      placeholder="Número do estabelecimento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleInputChange('complemento', e.target.value)}
                      placeholder="Apartamento, sala, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>

                {/* Terceira coluna */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cnae">CNAE</Label>
                    <Select value={formData.cnae} onValueChange={(value) => handleInputChange('cnae', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an Option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5620-1">5620-1/04 - Fornecimento de alimentos preparados preponderantemente para consumo domiciliar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-sm font-medium">PADRÃO/DESCRIÇÃO CNAE</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="cnae_5620" name="cnae_padrao" defaultChecked />
                        <label htmlFor="cnae_5620" className="text-sm">
                          5620-1/04 - Fornecimento de alimentos preparados preponderantemente para consumo domiciliar
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="px-8">
                  SALVAR
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="fiscais" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Geral */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Geral</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="regime_tributario">Regime Tributário</Label>
                      <Select 
                        value={formData.regime_tributario} 
                        onValueChange={(value) => handleInputChange('regime_tributario', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o regime tributário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regime_normal">Regime Normal</SelectItem>
                          <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                          <SelectItem value="simples_nacional_excesso">Simples Nacional - excesso de sublimite da receita bruta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="email_xmls">
                        E-mails para envio mensal dos XMLs de cupons fiscais e notas fiscais de entrada (compras):
                      </Label>
                      <Input
                        id="email_xmls"
                        value={formData.email_xmls}
                        onChange={(e) => handleInputChange('email_xmls', e.target.value)}
                        placeholder="Digite sua pesquisa"
                      />
                    </div>
                  </div>
                </div>

                {/* Certificado digital */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Certificado digital</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                        {fiscalConfig?.certificado_path ? 'Certificado já salvo' : 'Nenhum certificado'}
                      </div>
                    </div>
                    <div>
                      <Label>Validade</Label>
                      <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                        {fiscalConfig?.certificado_validade || 'Não informado'}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="senha_certificado">Senha 🔒</Label>
                      <div className="relative">
                        <Input
                          id="senha_certificado"
                          type={showPassword ? "text" : "password"}
                          value={formData.certificado_senha}
                          onChange={(e) => handleInputChange('certificado_senha', e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleCertificateUpload}
                      accept=".p12,.pfx"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingCertificate}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingCertificate ? 'ENVIANDO...' : 'SELECIONAR'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCertificateDownload}
                      disabled={!fiscalConfig?.certificado_path}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      BAIXAR
                    </Button>
                  </div>
                </div>

                {/* Focus NFe API */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Configuração Focus NFe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="focus_nfe_token">Token da API Focus NFe</Label>
                      <Input
                        id="focus_nfe_token"
                        value={formData.focus_nfe_token}
                        onChange={(e) => handleInputChange('focus_nfe_token', e.target.value)}
                        placeholder="Digite o token da Focus NFe"
                        type="password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="focus_nfe_ambiente">Ambiente</Label>
                      <Select 
                        value={formData.focus_nfe_ambiente} 
                        onValueChange={(value) => handleInputChange('focus_nfe_ambiente', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="homologacao">Homologação</SelectItem>
                          <SelectItem value="producao">Produção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Cupom fiscal eletrônico (NFCe) */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cupom fiscal eletrônico (NFCe)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nfce_token">Token NFCe</Label>
                      <Input
                        id="nfce_token"
                        value={formData.nfce_token}
                        onChange={(e) => handleInputChange('nfce_token', e.target.value)}
                        placeholder="Token da NFCe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nfce_id_token">ID Token</Label>
                      <Input
                        id="nfce_id_token"
                        value={formData.nfce_id_token}
                        onChange={(e) => handleInputChange('nfce_id_token', e.target.value)}
                        placeholder="ID do Token"
                      />
                    </div>
                  </div>
                </div>

                {/* Controle de numeração */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Controle de numeração</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="block mb-2">Numeração para o ambiente de Produção</Label>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Modelo</Label>
                          <div className="mt-1 p-2 bg-gray-100 rounded text-sm">65</div>
                        </div>
                        <div>
                          <Label htmlFor="nfce_serie">Série</Label>
                          <Input
                            id="nfce_serie"
                            type="number"
                            value={formData.nfce_serie}
                            onChange={(e) => handleNumberChange('nfce_serie', e.target.value, 2)}
                            placeholder="2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nfce_proxima_numeracao">Próxima numeração</Label>
                          <Input
                            id="nfce_proxima_numeracao"
                            type="number"
                            value={formData.nfce_proxima_numeracao}
                            onChange={(e) => handleNumberChange('nfce_proxima_numeracao', e.target.value, 1)}
                            placeholder="36603"
                          />
                        </div>
                        <div></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Modelo</Label>
                        <div className="mt-1 p-2 bg-gray-100 rounded text-sm">55</div>
                      </div>
                      <div>
                        <Label htmlFor="nfe_serie">Série</Label>
                        <Input
                          id="nfe_serie"
                          type="number"
                          value={formData.nfe_serie}
                          onChange={(e) => handleNumberChange('nfe_serie', e.target.value, 1)}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nfe_proxima_numeracao">Próxima numeração</Label>
                        <Input
                          id="nfe_proxima_numeracao"
                          type="number"
                          value={formData.nfe_proxima_numeracao}
                          onChange={(e) => handleNumberChange('nfe_proxima_numeracao', e.target.value, 2)}
                          placeholder="2"
                        />
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>

                {/* Informação complementar NFCe */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informação complementar NFCe</h3>
                  <Textarea
                    value={formData.info_complementar_nfce}
                    onChange={(e) => handleInputChange('info_complementar_nfce', e.target.value)}
                    placeholder="Informações complementares..."
                    rows={4}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="px-8">
                  SALVAR
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InformacoesEmpresa;