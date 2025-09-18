import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, Copy, Loader2, AlertCircle } from 'lucide-react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';

interface AutoatendimentoPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pixData?: any) => void;
  paymentData: {
    companyId: string;
    amount: number;
    description: string;
    customerName: string;
    customerPhone: string;
    externalReference: string;
  };
  primaryColor: string;


export const AutoatendimentoPixModal: React.FC<AutoatendimentoPixModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  paymentData,
  primaryColor
}) => {
  const [pixData, setPixData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerCpf, setCustomerCpf] = useState<string>('');
  const [showCpfForm, setShowCpfForm] = useState<boolean>(true);

  // Format CPF
  const formatCpf = (value: string): string => {;
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateCpf = (cpf: string): boolean => {;
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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowCpfForm(true);
      setCustomerCpf('');
      setPixData(null);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (pixData && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            toast.error('PIX expirado. Tente novamente.');
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pixData, timeLeft, onClose]);

  // Verificar status do pagamento a cada 5 segundos
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
    if (pixData?.id) {
      checkInterval = setInterval(() => {
        checkPaymentStatus();
      }, 5000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [pixData]);

  const createPixPayment = async () => {;
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Criando PIX via função Asaas oficial...');

      // Usar função oficial que já funciona no cardápio
      const { data, error }  catch (error) { console.error('Error:', error); }= await Promise.resolve();
        p_company_id: paymentData.companyId,
        p_amount: paymentData.amount,
        p_description: paymentData.description,
        p_customer_name: paymentData.customerName || 'Cliente',
        p_customer_phone: paymentData.customerPhone,
        p_customer_cpf: customerCpf.replace(/\D/g, '')
      });

      if (error) {
        console.error('❌ Erro na função Asaas:', error);
        throw new Error(error.message || 'Erro ao criar pagamento PIX');


      const response = data as any;
      if (!response?.success || !response?.payment) {
        console.error('❌ Resposta inválida:', data);
        throw new Error(response?.error || 'Resposta inválida do servidor');


      const asaasPayment = response.payment;

      // Usar dados do Asaas da função oficial
      const pixPayment = {
        id: asaasPayment.id,
        status: asaasPayment.status,
        qr_code: asaasPayment.qr_code,
        qr_code_base64: asaasPayment.qr_code_base64,
        amount: asaasPayment.amount,
        expires_at: asaasPayment.expires_at;
      };

      setPixData(pixPayment);
      
      // Calcular tempo de expiração baseado na resposta
      const calculateTimeLeft = (expirationDate: string): number => {;
        const now = new Date().getTime();
        const expiry = new Date(expirationDate).getTime();
        return Math.max(0, Math.floor((expiry - now) / 1000));
      };
      
      setTimeLeft(calculateTimeLeft(pixPayment.expires_at));

      // Start checking payment status
      startPaymentCheck(asaasPayment.id);

      toast.success('PIX gerado com sucesso!');

    } catch (err: any) {
      console.error('❌ Erro ao criar pagamento:', err);
      setError(err.message);
      toast.error('Erro ao gerar PIX: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId?: string) => {;
    const idToCheck = paymentId || pixData?.id;
    if (!idToCheck || isChecking) return false;
    
    setIsChecking(true);
    try {
      console.log('🔍 Verificando status do pagamento Asaas:', idToCheck);

      const { data, error }  catch (error) { console.error('Error:', error); }= await Promise.resolve();
        p_payment_id: idToCheck
      });

      if (error) {
        console.error('❌ Erro ao verificar status:', error);
        return false;


      const response = data as any;
      if (response?.success && response?.payment) {
        const payment = response.payment;
        console.log('📊 Status Asaas:', payment.status);

        if (payment.status === 'CONFIRMED' || payment.status === 'RECEIVED') {
          console.log('✅ Pagamento confirmado via Asaas!');
          
          toast.success('Pagamento confirmado!');

          setTimeout(() => {
            onSuccess();
          }, 1500);
          
          return true; // Stop checking
        }
      }
    } catch (err) {
      console.error('❌ Erro ao verificar pagamento:', err);
    } finally {
      setIsChecking(false);
    }
    
    return false; // Continue checking
  };

  // Start payment checking
  const startPaymentCheck = (paymentId: string) => {
    // Check immediately;
    checkPaymentStatus(paymentId);
    
    // Then check every 5 seconds
    const interval = setInterval(async () => {;
      const shouldStop = await checkPaymentStatus(paymentId);
      if (shouldStop) {
        clearInterval(interval);

    }, 5000);

    // Stop after 24 hours
    setTimeout(() => {
      clearInterval(interval);
    }, 24 * 60 * 60 * 1000);
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {;
      navigator.clipboard.writeText(pixData.qr_code);
      toast.success('Código PIX copiado!');
    }
  };

  const formatTime = (seconds: number) => {;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold" style={{ color: primaryColor }}>
            Pagamento PIX - Asaas
          </DialogTitle>
        </DialogHeader>

        {/* CPF Form */}
        {showCpfForm && !pixData && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                R$ {paymentData.amount.toFixed(2)}
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
                    toast.error('Por favor, digite um CPF válido');
                  }
                }}
                disabled={!validateCpf(customerCpf)}
                className="w-full py-4 text-lg font-semibold text-white"
                style={{ 
                  backgroundColor: validateCpf(customerCpf) ? primaryColor : '#9CA3AF'
                }}
              >
                Gerar PIX
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
            <p className="text-lg">Gerando QR Code PIX via Asaas...</p>
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
              onClick={() => {
                setShowCpfForm(true);
                setError(null);
              }}
              className="mt-3"
              size="sm"
              style={{ backgroundColor: primaryColor }}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {pixData && !error && (
          <div className="space-y-4">
            {/* Valor */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                  R$ {paymentData.amount.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">{paymentData.description}</p>
              </CardContent>
            </Card>

            {/* Tempo restante */}
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Expira em: {formatTime(timeLeft)}
              </span>
            </div>

            {/* QR Code */}
            {pixData.qr_code_base64 && (
              <div className="text-center">
                <img
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="mx-auto max-w-full h-auto border rounded-lg"
                  style={{ maxWidth: '250px', maxHeight: '250px' }}
                />
              </div>
            )}

            {/* Código PIX */}
            {pixData.qr_code && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Código PIX:</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">
                        {pixData.qr_code}
                      </code>
                      <Button
                        onClick={copyPixCode}
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status */}
            <div className="text-center space-y-2">
              {isChecking ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Verificando pagamento...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Aguardando pagamento...</span>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                O status será atualizado automaticamente
              </p>
            </div>

            {/* Botões */}
            <div className="flex space-x-2">
              <Button 
                onClick={onClose}
                variant="outline" 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => checkPaymentStatus()}
                disabled={isChecking}
                className="flex-1 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Verificar Status'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};