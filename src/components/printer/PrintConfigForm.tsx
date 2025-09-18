import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

interface PrintConfig {
  width: number;
  removeAccents: boolean;
  marginLeft: number;
}

interface PrintConfigFormProps {
  config: PrintConfig;
  onConfigChange: (config: PrintConfig) => void;
}

export function PrintConfigForm({ config, onConfigChange }: PrintConfigFormProps) {
  const [localConfig, setLocalConfig] = useState<PrintConfig>(config)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { currentCompany } = useAuth()

  const handleChange = (field: keyof PrintConfig, value: any) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig)
    onConfigChange(newConfig)
  };

  const loadSavedConfig = async () => {
    if (!currentCompany?.id) return;

    setIsLoading(true)
    try {
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        
        

      if (error) {
        console.error('Erro ao carregar configuração:', error)
        return;
      }

      if (data) {
        // Extrair configurações de formatação do header/footer se existirem
        const savedConfig = {
          width: data.largura_papel || 48,
          removeAccents: data.texto_header?.includes('removeAccents:true') || true,
          marginLeft: parseInt(data.texto_footer?.match(/marginLeft:(\d+)/)?.[1] || '0')
        };
        setLocalConfig(savedConfig)
        onConfigChange(savedConfig)
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    } finally {
      setIsLoading(false)

  };

  const saveConfig = async () => {
    if (!currentCompany?.id) {
      toast.error('Empresa não encontrada')
      return;


    setIsSaving(true)
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } catch (error) { console.error('Error:', error) }, error: authError } = await Promise.resolve()
      if (authError || !user) {
        toast.error('Usuário não autenticado')
        return;
      }

      // Salvar as configurações de formatação nos campos texto_header e texto_footer
      const headerConfig = `removeAccents:${localConfig.removeAccents}`;
      const footerConfig = `marginLeft:${localConfig.marginLeft}`;

      // Primeiro, verificar se já existe uma configuração para a empresa
      const { data: existingConfig  } = null as any;
      let error;
      if (existingConfig) {
        // Atualizar configuração existente
        const { error: updateError  } = null as any;
            largura_papel: localConfig.width,
            texto_header: headerConfig,
            texto_footer: footerConfig,
            is_active: true,
            is_default: true,
            impressao_automatica: false
          })
          
        error = updateError;
      } else {
        // Criar nova configuração
        const { error: insertError  } = null as any;
            company_id: currentCompany.id,
            printer_name: 'Configuração de Formatação',
            largura_papel: localConfig.width,
            texto_header: headerConfig,
            texto_footer: footerConfig,
            is_active: true,
            is_default: true,
            impressao_automatica: false
          })
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar configuração:', error)
        toast.error(`Erro ao salvar configuração: ${error.message}`)
        return;
      }

      toast.success('Configuração de formatação salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      toast.error('Erro ao salvar configuração')
    } finally {
      setIsSaving(false)

  };

  useEffect(() => {
    loadSavedConfig()
  }, [currentCompany?.id])

  const presets = [
    { name: 'Cupom Fiscal (48)', width: 48, removeAccents: true, marginLeft: 0 },
    { name: 'Cupom Pequeno (32)', width: 32, removeAccents: true, marginLeft: 0 },
    { name: 'Etiqueta (24)', width: 24, removeAccents: false, marginLeft: 2 },
    { name: 'Recibo (40)', width: 40, removeAccents: true, marginLeft: 1 };
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Impressão</CardTitle>
        <CardDescription>
          Configure a largura e formatação do texto para impressão
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Presets rápidos */}
        <div>
          <Label className="text-sm font-medium">Presets Rápidos</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="secondary"
                size="sm"
                onClick={() => setLocalConfig(preset)}
                className="text-xs bg-brand-blue-500 text-white hover:bg-brand-blue-600"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Configurações manuais */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="width">Largura (caracteres)</Label>
            <Input
              id="width"
              type="number"
              min="20"
              max="80"
              value={localConfig.width}
              onChange={(e) => handleChange('width', parseInt(e.target.value) || 48)}
            />
          </div>
          
          <div>
            <Label htmlFor="marginLeft">Margem Esquerda</Label>
            <Input
              id="marginLeft"
              type="number"
              min="0"
              max="10"
              value={localConfig.marginLeft}
              onChange={(e) => handleChange('marginLeft', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="removeAccents"
            checked={localConfig.removeAccents}
            onCheckedChange={(checked) => handleChange('removeAccents', checked)}
          />
          <Label htmlFor="removeAccents">Remover acentos</Label>
        </div>

        {/* Preview */}
        <div>
          <Label className="text-sm font-medium">Preview</Label>
          <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs">
            <div style={{ maxWidth: `${localConfig.width}ch` }}>
              {' '.repeat(localConfig.marginLeft)}{'='.repeat(Math.max(0, localConfig.width - localConfig.marginLeft))}
              <br />
              {' '.repeat(localConfig.marginLeft)}EXEMPLO DE CUPOM
              <br />
              {' '.repeat(localConfig.marginLeft)}2x Produto Teste ............ 10.00
              <br />
              {' '.repeat(localConfig.marginLeft)}TOTAL: R$ 10,00
              <br />
              {' '.repeat(localConfig.marginLeft)}{'='.repeat(Math.max(0, localConfig.width - localConfig.marginLeft))}
            </div>
          </div>
        </div>

        {/* Botão Salvar Configuração */}
        <div className="pt-4">
          <Button 
            onClick={saveConfig}
            disabled={isSaving || isLoading}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
