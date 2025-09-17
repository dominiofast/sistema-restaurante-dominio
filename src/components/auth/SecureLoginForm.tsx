import React, { useState } from 'react';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';

interface SecureLoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export const SecureLoginForm: React.FC<SecureLoginFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const { 
    validateEmail, 
    checkRateLimit, 
    resetRateLimit,
    sanitizeInput 
  } = useSecurityValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Verificar rate limiting
    const rateLimitKey = `login_${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, 5)) {
      setIsBlocked(true);
      setErrors(['Muitas tentativas de login. Aguarde alguns minutos.']);
      return;
    }

    // Validação de email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setErrors(emailValidation.errors);
      return;
    }

    // Validação básica de senha (não aplicar regras rigorosas para login)
    if (!password) {
      setErrors(['Senha é obrigatória']);
      return;
    }

    try {
      // Sanitizar inputs
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
      
      await onSubmit(sanitizedEmail, password);
      
      // Reset rate limit em caso de sucesso
      resetRateLimit(rateLimitKey);
      setIsBlocked(false);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      setErrors([errorMessage]);
      
      // Se erro de credenciais, não resetar rate limit
      if (errorMessage.includes('bloqueado') || errorMessage.includes('tentativas')) {
        setIsBlocked(true);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Security Badge */}
      <div className="flex items-center justify-center mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Shield className="w-5 h-5 text-green-600 mr-2" />
        <span className="text-sm text-green-700 font-medium">
          Login Protegido com Rate Limiting
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="seu@email.com"
            disabled={isLoading || isBlocked}
            autoComplete="email"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              disabled={isLoading || isBlocked}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading || isBlocked}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blocked Warning */}
        {isBlocked && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-sm text-yellow-700">
                Login temporariamente bloqueado por segurança. Aguarde alguns minutos.
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isBlocked}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading || isBlocked
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Entrando...
            </div>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">Proteções de Segurança:</div>
          <ul className="space-y-1">
            <li>• Rate limiting: máximo 5 tentativas por 15 minutos</li>
            <li>• Senhas hashadas com bcrypt (salt rounds: 12)</li>
            <li>• Logs de segurança para auditoria</li>
            <li>• Validação de entrada sanitizada</li>
          </ul>
        </div>
      </div>
    </div>
  );
};