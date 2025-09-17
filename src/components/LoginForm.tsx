import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Digite um e-mail válido');
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      setSuccess('Autenticando...');
      
      // Timeout para detectar se o login travou
      const loginTimeout = setTimeout(() => {
        setError('Login está demorando muito. Tente novamente.');
        setSuccess(null);
      }, 20000); // 20 segundos
      
      await login(email.trim(), password);
      clearTimeout(loginTimeout);
      
      setSuccess('Login realizado com sucesso! Redirecionando...');
      
      // Forçar refresh da página para garantir estado limpo
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
        } else if (error.message.includes('Senha incorreta para a empresa')) {
          errorMessage = 'Senha incorreta. Verifique a senha da empresa.';
        } else if (error.message.includes('No rows')) {
          errorMessage = 'Email não encontrado. Verifique suas credenciais.';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setSuccess(null);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Digite seu email para recuperar a senha.');
      return;
    }

    setIsResettingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email,
          resetLink: `${window.location.origin}/reset-password`
        }
      });

      if (error) throw error;

      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      try {
        const { error: fallbackError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (fallbackError) throw fallbackError;
        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      } catch (fallbackError: any) {
        setError('Erro ao enviar email de recuperação. Tente novamente.');
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Iniciando autenticação Google...');
    // Implementar integração com Google OAuth
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden" style={{ backgroundColor: '#F7FAFC' }}>
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen">
        {/* Form Section */}
        <div className="flex-1 flex flex-col justify-center px-5 py-8 bg-white lg:px-10 lg:py-8 min-h-screen lg:min-h-0"
             style={{ boxShadow: '0 4px 20px rgba(34, 66, 118, 0.08)' }}>
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/057589e1-6783-40ef-af0b-474b1e4c1d6b.png" 
                alt="dominio.tech" 
                className="h-12 w-auto"
                style={{ filter: 'brightness(0) saturate(100%) invert(21%) sepia(77%) saturate(1084%) hue-rotate(202deg) brightness(95%) contrast(95%)' }}
              />
            </div>

            <h1 className="text-xl font-bold mb-2 leading-tight lg:text-3xl" style={{ color: '#224276' }}>
              Entre na sua conta dominio.tech
            </h1>
            <p className="mb-4 lg:text-base" style={{ color: '#6B7C93' }}>
              Acesse sua plataforma empresarial de gestão.
            </p>

            {/* Success Message */}
            {success && (
              <div className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                ✓ {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-semibold" style={{ color: '#224276' }}>
                  Email <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-colors focus:outline-none"
                  style={{ 
                    borderColor: '#E3E8EF',
                    color: '#2D3748'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#224276'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E3E8EF'}
                  placeholder="Seu email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-semibold" style={{ color: '#224276' }}>
                  Senha <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 rounded-lg text-sm transition-colors focus:outline-none"
                    style={{ 
                      borderColor: '#E3E8EF',
                      color: '#2D3748'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#224276'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E3E8EF'}
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-80 transition-opacity"
                    style={{ color: '#6B7C93' }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded focus:ring-2"
                    style={{ 
                      accentColor: '#224276',
                      borderColor: '#E3E8EF'
                    }}
                  />
                  <label htmlFor="remember" className="ml-2 cursor-pointer" style={{ color: '#2D3748' }}>
                    Lembrar-me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isResettingPassword}
                  className="transition-colors disabled:opacity-50"
                  style={{ color: '#224276' }}
                  onMouseEnter={(e) => !isResettingPassword && (e.currentTarget.style.color = '#00D4FF')}
                  onMouseLeave={(e) => !isResettingPassword && (e.currentTarget.style.color = '#224276')}
                >
                  {isResettingPassword ? 'Enviando...' : 'Esqueci minha senha'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-white rounded-lg text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                style={{ backgroundColor: '#224276' }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
              
              <div className="text-center text-sm mt-6" style={{ color: '#6B7C93' }}>
                Não tem uma conta?{' '}
                <a href="/cadastro" className="transition-colors" style={{ color: '#224276' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = '#00D4FF'}
                   onMouseLeave={(e) => e.currentTarget.style.color = '#224276'}>
                  Cadastre-se
                </a>
              </div>
            </form>
          </div>
        </div>


        {/* Image Section - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 lg:h-screen order-first lg:order-last relative">
          <img
            src="/lovable-uploads/0e4e69d8-c0b2-4e4a-80e7-38dbe237d5a7.png"
            alt="Mulher empreendedora com tablet"
            className="w-full h-full object-cover"
          />
          
          {/* Benefits Overlay */}
          <div className="absolute inset-0 flex items-end justify-start p-8 lg:p-12" style={{ backgroundColor: 'rgba(26, 53, 86, 0.6)' }}>
            <div className="max-w-md">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Crie seu menu digital</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Receba pedidos diretamente pelo WhatsApp</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Ferramentas avançadas de gestão e análise</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Automatize seu atendimento com agente de ia</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Controle seu inventário em tempo real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
