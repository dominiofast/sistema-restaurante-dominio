
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClientePublico } from '@/hooks/useClientePublico';

interface IdentificacaoModalProps {
  onComplete: (nome: string, telefone: string) => void;
  onCancel: () => void;
  companyId?: string;
  dadosIniciais?: { nome: string; telefone: string };
}

// Cores alinhadas à marca: usaremos a cor primária da UI (Tailwind via style) como base
const brandPrimary = '#16a34a'; // verde (padrão já usado nos CTAs do cardápio)
const brandPrimaryDark = '#15803d';
const neutralText = '#222';

const IdentificacaoModal: React.FC<IdentificacaoModalProps> = ({ onComplete, onCancel, companyId, dadosIniciais }) => {
  const [telefone, setTelefone] = useState(dadosIniciais?.telefone || '');
  const [nome, setNome] = useState(dadosIniciais?.nome || '');
  const [loading, setLoading] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  const { buscarPorTelefone, cadastrarCliente } = useClientePublico();

  const podeAvancar = telefone.length >= 10 && nome.length > 3;

  const handleBuscarCliente = async () => {
    const telefoneNumeros = telefone.replace(/\D/g, '');
    if (telefoneNumeros.length < 10) return;

    setLoading(true);
    try {
      console.log('🔍 Buscando cliente com telefone:', telefoneNumeros, 'na empresa:', companyId);
      const cliente = await buscarPorTelefone(telefoneNumeros, companyId);
      
      if (cliente) {
        console.log('✅ Cliente encontrado:', cliente);
        setNome(cliente.nome);
        setClienteEncontrado(true);
        setMostrarFormulario(false);
      } else {
        console.log('❌ Cliente não encontrado, mostrar formulário');
        setClienteEncontrado(false);
        setMostrarFormulario(true);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar cliente:', error);
      setClienteEncontrado(false);
      setMostrarFormulario(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const telefoneNumeros = telefone.replace(/\D/g, '');
      
      if (!clienteEncontrado && nome) {
        console.log('📝 Cadastrando novo cliente', { nome, telefone: telefoneNumeros, companyId });
        const novoCliente = await cadastrarCliente(nome, telefoneNumeros, companyId);
        if (!novoCliente) {
          console.error('❌ Falha ao cadastrar cliente');
          return;
        }
        console.log('✅ Cliente cadastrado com sucesso:', novoCliente);
      }
      
      console.log('✅ Finalizando identificação com:', { nome, telefone: telefoneNumeros });
      onComplete(nome, telefoneNumeros);
    } catch (error) {
      console.error('❌ Erro ao processar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const telefoneFormatado = formatarTelefone(valor);
    setTelefone(telefoneFormatado);
    
    // Reset states quando telefone mudar
    if (clienteEncontrado) {
      setClienteEncontrado(false);
      setMostrarFormulario(true);
      setNome('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      {/* Bottom sheet responsivo em mobile, modal central no desktop */}
      <div className="w-full sm:w-auto sm:max-w-md bg-white sm:rounded-2xl shadow-2xl sm:my-8 rounded-t-2xl">
        <Card className="border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="sm:hidden mx-auto mt-2 mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{color: neutralText}}>Identifique-se</h2>
            
            <div className="mb-4">
              <label className="block mb-1 text-sm sm:text-base font-medium" style={{color: neutralText}}>Seu número de WhatsApp:</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(99) 99999-9999"
                  value={telefone}
                  onChange={handleTelefoneChange}
                  onBlur={handleBuscarCliente}
                  className="flex-1 border rounded-lg px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{borderColor: brandPrimary, color: neutralText}}
                />
                <Button
                  size="sm"
                  onClick={handleBuscarCliente}
                  disabled={telefone.replace(/\D/g, '').length < 10 || loading}
                  style={{backgroundColor: brandPrimary}}
                  className="px-4 sm:px-3"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>

            {clienteEncontrado && !mostrarFormulario && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">Cliente encontrado!</p>
                <p className="text-green-600">Olá, {nome}!</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMostrarFormulario(true);
                    setClienteEncontrado(false);
                  }}
                  className="mt-2"
                >
                  Alterar dados
                </Button>
              </div>
            )}

            {mostrarFormulario && (
              <div className="mb-4 sm:mb-6">
                <label className="block mb-1 text-sm sm:text-base font-medium" style={{color: neutralText}}>Seu nome e sobrenome:</label>
                <input
                  type="text"
                  placeholder="Nome e sobrenome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full border rounded-lg px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{borderColor: brandPrimary, color: neutralText}}
                />
              </div>
            )}

            <div className="space-y-2 sm:space-y-3">
              <Button
                className="w-full font-semibold text-white h-12 sm:h-11 rounded-xl"
                style={{background: podeAvancar ? brandPrimary : brandPrimaryDark, borderColor: brandPrimary}}
                disabled={!podeAvancar || loading}
                onClick={handleFinalizar}
              >
                {loading ? 'Processando...' : 'Avançar'}
              </Button>
              <Button
                className="w-full h-12 sm:h-11 rounded-xl"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            </div>
            <p className="text-[10px] sm:text-xs text-center mt-3 sm:mt-4" style={{color: neutralText, opacity: 0.6}}>
              Para realizar seu pedido vamos precisar de suas informações, este é um ambiente protegido.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdentificacaoModal;
