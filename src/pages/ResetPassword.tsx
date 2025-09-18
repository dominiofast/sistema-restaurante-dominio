import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
// SUPABASE REMOVIDO
export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ResetPassword page loaded');
    console.log('Search params:', Object.fromEntries(searchParams));
    
    // Verificar se temos os tokens necessários
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    console.log('Access token present:', !!accessToken);
    console.log('Refresh token present:', !!refreshToken);
    
    if (accessToken && refreshToken) {
      console.log('Setting session with tokens...');
      // Configurar a sessão automaticamente
      /* supabase REMOVIDO */ null; //auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error setting session:', error);
          setError('Link de recuperação inválido ou expirado.');
        } else {
          console.log('Session set successfully:', data);
        }
      });
    } else {
      console.log('No tokens found, checking current session...');
      // Verificar se já temos uma sessão ativa
      /* supabase REMOVIDO */ null; //auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error getting session:', error);
        }
        if (!session) {
          console.log('No active session, redirecting to login...');
          setError('Link de recuperação inválido. Solicite um novo link.');
        } else {
          console.log('Active session found:', session);
        }
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await /* supabase REMOVIDO */ null; //auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess('Senha alterada com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-orange-400/5 to-yellow-400/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        {/* Logo e Cabeçalho */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <img 
                src="/lovable-uploads/9327fc92-01c9-4fbf-aea3-181231cb4c3c.png" 
                alt="Domínio Tech" 
                className="h-20 w-auto transition-transform duration-300 hover:scale-105 filter brightness-0 invert"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <p className="text-blue-100 text-lg font-medium">Redefinir Senha</p>
        </div>

        {/* Formulário de Nova Senha */}
        <Card className="bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl overflow-hidden">
          <CardHeader className="text-center p-8 pb-6">
            <CardTitle className="text-2xl font-bold text-white mb-2">Nova Senha</CardTitle>
            <CardDescription className="text-blue-100 text-base">
              Digite sua nova senha para acessar a plataforma
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 pt-2">
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-500/10 border-green-500/20 backdrop-blur-sm">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 bg-white/90 border-white/30 text-slate-800 placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20 focus:bg-white rounded-xl text-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white font-medium">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 bg-white/90 border-white/30 text-slate-800 placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20 focus:bg-white rounded-xl text-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Alterando Senha...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </form>

            {/* Voltar ao Login */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 text-blue-300 hover:text-blue-200 transition-colors duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};