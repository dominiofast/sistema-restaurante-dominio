import React from 'react';
import { User, Phone, MapPin, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { CustomerAddress } from '@/hooks/useCustomerAddresses';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CustomerAddressManagerProps {
  cliente: {
    id: number;
    nome: string;
    telefone: string;
    endereco?: string;
  };
  enderecos: CustomerAddress[];
  onNovoPedido: (tipo: 'delivery' | 'balcao', enderecoId?: string) => void;
  onNovoEndereco: () => void;
  onFechar: () => void;
  onDeleteAddress: (addressId: string) => Promise<boolean>;


export const CustomerAddressManager: React.FC<CustomerAddressManagerProps> = ({
  cliente,
  enderecos,
  onNovoPedido,
  onNovoEndereco,
  onFechar,
  onDeleteAddress
}) => {
  const { toast } = useToast()
  const { currentCompany } = useAuth()
  const { validateAddress } = useAddressValidator(currentCompany?.id)
  const [validatingAddressId, setValidatingAddressId] = React.useState<string | null>(null)
  const [deletingAddressId, setDeletingAddressId] = React.useState<string | null>(null)

  const handleDeliveryClick = async (endereco: CustomerAddress) => {
    if (!endereco.id) return;
    
    setValidatingAddressId(endereco.id)
    
    try {
      console.log('🔍 Validando endereço existente:', endereco)
      
      const validation = await validateAddress(endereco)
      
      if (!validation.isValid) {
        toast({
          title: "Endereço fora da área de atendimento",
          description: validation.message || "Este endereço não está mais dentro da nossa área de entrega.",
          variant: "destructive"
        } catch (error) { console.error('Error:', error) })
        return;
      }
      
      console.log('✅ Endereço validado - Criando pedido delivery')
      onNovoPedido('delivery', endereco.id)
      
    } catch (error) {
      console.error('❌ Erro na validação do endereço:', error)
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar o endereço. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setValidatingAddressId(null)

  };

  const handleDeleteAddress = async (addressId: string) => {
    setDeletingAddressId(addressId)
    
    try {
      const success = await onDeleteAddress(addressId)
      
      if (success) {
        toast({
          title: "Endereço excluído",
          description: "O endereço foi removido com sucesso.",
        } catch (error) { console.error('Error:', error) })
      } else {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o endereço. Tente novamente.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setDeletingAddressId(null)

  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
        </div>
        <button
          onClick={onFechar}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <Phone className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">{cliente.telefone}</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-800 text-sm">Endereços cadastrados:</h4>
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle size={12} />
            <span>Verificamos se está na área de entrega</span>
          </div>
        </div>
        {enderecos.length > 0 ? (
          enderecos.map((endereco) => (
            <div key={endereco.id} className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm flex-1">
                    <div className="text-gray-800">
                      {endereco.logradouro}, {endereco.numero}
                    </div>
                    <div className="text-gray-600">
                      {endereco.bairro}, {endereco.cidade}
                      {endereco.complemento && ` - ${endereco.complemento}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => handleDeliveryClick(endereco)}
                    disabled={validatingAddressId === endereco.id}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {validatingAddressId === endereco.id ? 'Validando...' : 'Delivery'}
                  </button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 px-2 py-1"
                        disabled={deletingAddressId === endereco.id}
                      >
                        {deletingAddressId === endereco.id ? (
                          '...'
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir endereço</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este endereço?
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>{endereco.logradouro}, {endereco.numero}</strong><br />
                            {endereco.bairro}, {endereco.cidade}
                          </div>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAddress(endereco.id!)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm py-2">Nenhum endereço cadastrado</div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onNovoEndereco}
          className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-2 rounded text-sm hover:bg-orange-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Endereço
        </button>
        <button
          onClick={() => onNovoPedido('balcao')}
          className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Balcão
        </button>
      </div>
    </div>
  )
};
