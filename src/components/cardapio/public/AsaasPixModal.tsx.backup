import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock, QrCode, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
interface AsaasPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  companyId: string;
  amount: number;
  description: string;
  customerName?: string;
  customerPhone?: string;
  externalReference?: string;
  primaryColor?: string;
}

interface AsaasPayment {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  amount: number;
  expires_at: string;
}

export const AsaasPixModal: React.FC<AsaasPixModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  companyId,
  amount,
  description,
  customerName,
  customerPhone,
  externalReference,
  primaryColor = '#16a34a'
}) => {
  const [payment, setPayment] = useState<AsaasPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [customerCpf, setCustomerCpf] = useState<string>('');
  const [showCpfForm, setShowCpfForm] = useState<boolean>(true);
  const { toast } = useToast();
  
  // ANTI-DUPLICAÇÃO: Flag para evitar múltiplas execuções de onPaymentSuccess
  const paymentSuccessTriggered = React.useRef(false);

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Format time left
  const formatTimeLeft = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Validate and format CPF
  const formatCpf = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateCpf = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11 || /^(\d)\1{10}$/.test(numbers)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(numbers.charAt(10));
  };

  // Calculate time left
  const calculateTimeLeft = (expirationDate: string): number => {
    const now = new Date().getTime();
    const expiry = new Date(expirationDate).getTime();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  };

  // Create PIX payment via Asaas
  const createPixPayment = async () => {
    setLoading(true);
    setError(null);

    try {


      // Usar edge function em vez da função do banco
      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('create-asaas-payment', {
        body: {
          companyId,
          amount,
          description,
          customerName: customerName || 'Cliente',
          customerPhone,
          customerCpf: customerCpf.replace(/\D/g, '')
        }
      });



      if (error) {
        console.error('❌ Erro na função Asaas:', error);
        throw new Error(error.message || 'Erro ao criar pagamento PIX');
      }

      const response = data as any;
      if (!response?.success || !response?.payment) {
        console.error('❌ Resposta inválida:', data);
        throw new Error(response?.error || 'Resposta inválida do servidor');
      }

      const asaasPayment = response.payment;

      // Usar dados do Asaas da função oficial
      const pixPayment: AsaasPayment = {
        id: asaasPayment.id,
        status: asaasPayment.status,
        qr_code: asaasPayment.qr_code,
        qr_code_base64: asaasPayment.qr_code_base64,
        amount: asaasPayment.amount,
        expires_at: asaasPayment.expires_at
      };

      setPayment(pixPayment);
      setTimeLeft(calculateTimeLeft(pixPayment.expires_at));

      // Start checking payment status
      startPaymentCheck(asaasPayment.id);

      toast({
        title: 'PIX gerado com sucesso!',
        description: 'Escaneie o QR Code ou copie o código',
      });

    } catch (err: any) {
      console.error('❌ Erro ao criar pagamento:', err);
      setError(err.message);
      toast({
        title: 'Erro ao gerar PIX',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check payment status with retry logic
  const checkPaymentStatus = async (paymentId: string, retryCount = 0) => {
    try {
      setChecking(true);
      
      console.log(`🔍 Verificando status do pagamento Asaas (tentativa ${retryCount + 1}):`, paymentId);

      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('check-asaas-payment', {
        body: {
          paymentId
        }
      });

      if (error) {
        console.error('❌ Erro ao verificar status:', error);
        
        // Retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`🔄 Tentando novamente em ${delay}ms...`);
          setTimeout(() => {
            checkPaymentStatus(paymentId, retryCount + 1);
          }, delay);
        }
        return false;
      }

      const response = data;
      if (response?.success && response?.payment) {
        const payment = response.payment;
        console.log('📊 Status Asaas:', payment.status);

        if (payment.status === 'CONFIRMED' || payment.status === 'RECEIVED') {
          console.log('✅ Pagamento confirmado via Asaas!');
          
          toast({
            title: 'Pagamento confirmado!',
            description: 'Seu pedido foi aprovado com sucesso',
          });

          // CRÍTICO: Evitar múltiplas chamadas de sucesso
          if (!paymentSuccessTriggered.current) {
            paymentSuccessTriggered.current = true;
            console.log('✅ [ANTI-DUPLICATE] Pagamento aprovado - Chamando onPaymentSuccess pela primeira vez');
            
            setTimeout(() => {
              onPaymentSuccess();
            }, 1500);
          } else {
            console.warn('⚠️ [ANTI-DUPLICATE] onPaymentSuccess já foi chamado - Ignorando chamada duplicada');
          }
          
          return true; // Stop checking
        }
      }
    } catch (err) {
      console.error('❌ Erro ao verificar pagamento:', err);
      
      // Retry on network errors
      if (retryCount < 2) {
        setTimeout(() => {
          checkPaymentStatus(paymentId, retryCount + 1);
        }, 2000);
      }
    } finally {
      setChecking(false);
    }
    
    return false; // Continue checking
  };

  // Start payment checking with more aggressive polling
  const startPaymentCheck = (paymentId: string) => {
    console.log('🔄 Iniciando verificação de pagamento:', paymentId);
    
    // Check immediately
    checkPaymentStatus(paymentId);
    
    // Check every 3 seconds for the first 5 minutes (more frequent for fresh payments)
    const frequentInterval = setInterval(async () => {
      // ANTI-DUPLICAÇÃO: Parar verificação se já houve sucesso
      if (paymentSuccessTriggered.current) {
        console.log('🛑 [ANTI-DUPLICATE] Parando verificação: pagamento já processado');
        clearInterval(frequentInterval);
        clearInterval(normalInterval);
        return;
      }
      
      const shouldStop = await checkPaymentStatus(paymentId);
      if (shouldStop) {
        clearInterval(frequentInterval);
        clearInterval(normalInterval);
      }
    }, 3000);

    // After 5 minutes, switch to every 10 seconds
    const normalInterval = setInterval(async () => {
      // ANTI-DUPLICAÇÃO: Parar verificação se já houve sucesso
      if (paymentSuccessTriggered.current) {
        console.log('🛑 [ANTI-DUPLICATE] Parando verificação: pagamento já processado');
        clearInterval(frequentInterval);
        clearInterval(normalInterval);
        return;
      }
      
      const shouldStop = await checkPaymentStatus(paymentId);
      if (shouldStop) {
        clearInterval(frequentInterval);
        clearInterval(normalInterval);
      }
    }, 10000);

    // Stop frequent checking after 5 minutes
    setTimeout(() => {
      clearInterval(frequentInterval);
      console.log('🔄 Mudando para verificação normal (10s)');
    }, 5 * 60 * 1000);

    // Stop all checking after 24 hours
    setTimeout(() => {
      clearInterval(frequentInterval);
      clearInterval(normalInterval);
      console.log('⏰ Parando verificação automática após 24h');
    }, 24 * 60 * 60 * 1000);
  };

  // Copy PIX code
  const copyPixCode = async () => {
    if (!payment?.qr_code) return;

    try {
      await navigator.clipboard.writeText(payment.qr_code);
      toast({
        title: 'Código copiado!',
        description: 'Cole no seu app do banco para pagar',
      });
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Tente selecionar e copiar manualmente',
        variant: 'destructive',
      });
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!payment || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [payment, timeLeft]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowCpfForm(true);
      setCustomerCpf('');
      setPayment(null);
      setError(null);
      // RESET: Limpar flag de sucesso ao abrir modal
      paymentSuccessTriggered.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">PIX Online</h2>
              <p className="text-sm text-gray-600">Asaas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* CPF Form */}
          {showCpfForm && !payment && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(amount)}
                </div>
                <p className="text-gray-600">
                  Para gerar o PIX, precisamos do seu CPF
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF do pagador
                  </label>
                  <input
                    type="text"
                    value={customerCpf}
                    onChange={(e) => {
                      const formatted = formatCpf(e.target.value);
                      if (formatted.replace(/\D/g, '').length <= 11) {
                        setCustomerCpf(formatted);
                      }
                    }}
                    placeholder="000.000.000-00"
                    className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      customerCpf && !validateCpf(customerCpf) 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {customerCpf && !validateCpf(customerCpf) && (
                    <p className="text-red-600 text-sm mt-1">
                      CPF inválido
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => {
                    if (validateCpf(customerCpf)) {
                      setShowCpfForm(false);
                      createPixPayment();
                    } else {
                      toast({
                        title: 'CPF inválido',
                        description: 'Por favor, digite um CPF válido',
                        variant: 'destructive',
                      });
                    }
                  }}
                  disabled={!validateCpf(customerCpf)}
                  className="w-full py-4 text-lg font-semibold"
                  style={{ 
                    backgroundColor: validateCpf(customerCpf) ? primaryColor : '#9CA3AF',
                    color: 'white'
                  }}
                >
                  Gerar PIX
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: primaryColor }}></div>
              <p className="text-gray-600">Gerando QR Code PIX via Asaas...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Erro</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <Button
                onClick={createPixPayment}
                className="mt-3"
                size="sm"
                style={{ backgroundColor: primaryColor }}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {payment && !error && (
            <>
              {/* Amount and Timer */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(amount)}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Expira em: </span>
                  <span 
                    className="font-mono font-bold"
                    style={{ color: timeLeft < 3600 ? '#ef4444' : primaryColor }}
                  >
                    {formatTimeLeft(timeLeft)}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
                <div className="text-center">
                  {payment.qr_code_base64 ? (
                    <div>
                      <img
                        src={`data:image/png;base64,${payment.qr_code_base64.replace(/\s+/g, '')}`}
                        alt="QR Code PIX Asaas"
                        className="w-48 h-48 mx-auto mb-4 border rounded-lg"

                      />

                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 text-center px-4">
                        QR Code PIX via Asaas<br/>
                        Carregando...
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>QR Code oficial do Asaas</strong><br/>
                    Escaneie com seu app bancário
                  </p>
                </div>
              </div>

              {/* PIX Code */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Código PIX</span>
                  <Button
                    onClick={copyPixCode}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar
                  </Button>
                </div>
                <div className="bg-white border rounded p-2">
                  <code className="text-xs text-gray-800 break-all font-mono">
                    {payment.qr_code}
                  </code>
                </div>
              </div>

              {/* Status com feedback mais detalhado */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  {checking ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  ) : (
                    <Smartphone className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-green-800 font-medium text-sm">
                    {checking ? 'Verificando pagamento...' : 'Aguardando pagamento...'}
                  </span>
                </div>
                <p className="text-green-700 text-xs mt-1">
                  {checking 
                    ? 'Consultando status no Asaas...' 
                    : 'Seu pagamento será confirmado automaticamente'
                  }
                </p>
                
                {/* Indicador de progresso */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-green-600 mb-1">
                    <span>Progresso da verificação</span>
                    <span>{checking ? 'Verificando...' : 'Aguardando'}</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        checking ? 'bg-green-500 animate-pulse' : 'bg-green-400'
                      }`}
                      style={{ width: checking ? '70%' : '30%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p>Abra o app do seu banco ou carteira digital</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p>Escolha PIX e escaneie o código ou cole o código copiado</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p>Confirme o pagamento de {formatCurrency(amount)}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <p>Aguarde a confirmação automática (até 5 segundos)</p>
                </div>
              </div>

              {/* Botão para verificação manual */}
              <div className="mt-4">
                <Button
                  onClick={() => checkPaymentStatus(payment.id)}
                  disabled={checking}
                  variant="outline"
                  className="w-full"
                >
                  {checking ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Verificar Status Agora
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Clique para verificar o status manualmente
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
