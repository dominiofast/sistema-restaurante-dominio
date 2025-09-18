import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomerAddress } from '@/types/address';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import { useAuth } from '@/contexts/AuthContext';

interface AddressDetailsStepProps {
  address: CustomerAddress;
  customerName?: string;
  customerPhone?: string;
  onConfirm: (address: CustomerAddress) => void;
  onBack: () => void;
  onClose: () => void;
  primaryColor?: string;
  isFullscreen?: boolean;
}

export const AddressDetailsStep: React.FC<AddressDetailsStepProps> = ({
  address,
  customerName,
  customerPhone,
  onConfirm,
  onBack,
  onClose,
  primaryColor,
  isFullscreen = false
}) => {
  const { toast } = useToast()
  const { currentCompany } = useAuth()
  const { validateAddress } = useAddressValidator(currentCompany?.id)
  const [formData, setFormData] = useState<CustomerAddress>(address)
  const [isValidating, setIsValidating] = useState(false)

  const handleInputChange = (field: keyof CustomerAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value;
    }))
  };

  const handleConfirm = async () => {
    if (!formData.numero || !formData.bairro) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o número e bairro",
        variant: "destructive";
      })
      return;
    }

    setIsValidating(true)

    try {
      // Validar se o endereço está dentro da área de atendimento
      const validation = await validateAddress(formData)
      
      if (!validation.isValid) {
        toast({
          title: "Endereço fora da área de atendimento",
          description: validation.message || "Este endereço não está dentro da nossa área de entrega.",
          variant: "destructive"
        } catch (error) { console.error('Error:', error) })
        setIsValidating(false)
        return;
      }

      console.log('✅ Endereço validado - Taxa:', validation.fee)
      onConfirm({ ...formData, deliveryFee: validation.fee })
    } catch (error) {
      console.error('❌ Erro na validação:', error)
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar o endereço. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsValidating(false)
    }
  };

  // Layout para fullscreen (sem header próprio)
  if (isFullscreen) {
    return (
      <div className="space-y-6">
        {/* Informações do cliente */}
        {customerName && customerPhone && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2">Dados do Cliente</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Nome:</strong> {customerName}</div>
              <div><strong>Telefone:</strong> {customerPhone}</div>
            </div>
          </div>
        )}

        {/* Endereço selecionado */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <MapPin size={20} className="text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-orange-900">Endereço Selecionado</h4>
              <p className="text-sm text-orange-700">Confirme os dados abaixo</p>
            </div>
          </div>
          <div className="text-orange-800 font-medium">
            {formData.logradouro}
            {formData.cidade && formData.estado && (
              <span>, {formData.cidade}/{formData.estado}</span>
            )}
          </div>
        </div>

        {/* Campos do formulário - mais espaçosos */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="cep" className="text-base font-medium">CEP</Label>
            <Input
              id="cep"
              placeholder="00000-000"
              value={formData.cep}
              onChange={(e) => handleInputChange('cep', e.target.value)}
              maxLength={9}
              className="h-12 text-lg mt-2"
            />
          </div>

          <div>
            <Label htmlFor="logradouro" className="text-base font-medium">Rua/Logradouro</Label>
            <Input
              id="logradouro"
              placeholder="Nome da rua"
              value={formData.logradouro}
              onChange={(e) => handleInputChange('logradouro', e.target.value)}
              className="h-12 text-lg mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero" className="text-base font-medium">Número *</Label>
              <Input
                id="numero"
                placeholder="123"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                required
                className="h-12 text-lg mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bairro" className="text-base font-medium">Bairro</Label>
              <Input
                id="bairro"
                placeholder="Bairro"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                className="h-12 text-lg mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="complemento" className="text-base font-medium">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Apto, Casa, Bloco, Ponto de referência..."
              value={formData.complemento || ''}
              onChange={(e) => handleInputChange('complemento', e.target.value)}
              className="h-12 text-lg mt-2"
            />
          </div>
        </div>

        {/* Aviso importante sobre área de atendimento */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Verificação de área de atendimento</p>
              <p>Ao confirmar, validaremos se este endereço está dentro da nossa área de entrega.</p>
            </div>
          </div>
        </div>

        {/* Botão de confirmação - fixo na parte inferior */}
        <div className="pt-6">
          <Button 
            onClick={handleConfirm} 
            disabled={isValidating}
            className="w-full h-14 text-lg font-semibold text-white"
            style={primaryColor ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
          >
            {isValidating ? 'Validando endereço...' : 'Confirmar Endereço'}
          </Button>
        </div>
      </div>
    )


  // Layout para modal tradicional
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          Detalhes do Endereço
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="p-6">
        {/* Informações do cliente */}
        <div className="text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
          <strong>Cliente:</strong> {customerName}<br />
          <strong>Telefone:</strong> {customerPhone}
        </div>

        {/* Endereço selecionado */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-blue-500" />
            <span className="text-sm font-medium text-blue-800">Endereço selecionado:</span>
          </div>
          <div className="text-sm text-blue-700">
            {formData.logradouro}
            {formData.cidade && formData.estado && (
              <span>, {formData.cidade}/{formData.estado}</span>
            )}
          </div>
        </div>

        {/* Campos do formulário */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              placeholder="00000-000"
              value={formData.cep}
              onChange={(e) => handleInputChange('cep', e.target.value)}
              maxLength={9}
            />
          </div>

          <div>
            <Label htmlFor="logradouro">Rua/Logradouro</Label>
            <Input
              id="logradouro"
              placeholder="Nome da rua"
              value={formData.logradouro}
              onChange={(e) => handleInputChange('logradouro', e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="numero">Número *</Label>
              <Input
                id="numero"
                placeholder="123"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                placeholder="Bairro"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Apto, Casa, Bloco..."
              value={formData.complemento || ''}
              onChange={(e) => handleInputChange('complemento', e.target.value)}
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-6 border-t mt-6">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex-1"
            style={primaryColor ? { borderColor: primaryColor, color: primaryColor } : undefined}
          >
            Voltar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isValidating}
            className="flex-1 text-white font-semibold"
            style={primaryColor ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
          >
            {isValidating ? 'Validando...' : 'Confirmar Endereço'}
          </Button>
        </div>
      </div>
    </>
  )
};
