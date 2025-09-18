import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// SUPABASE REMOVIDO
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface InvitationData {
  email: string;
  company_name: string;
  role: string;
  expires_at: string;
}

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Token de convite não encontrado');
      navigate('/login');
      return;
    }

    loadInvitation();
  }, [token, navigate]);

  const loadInvitation = async () => {
    try {
      console.log('🔍 Loading invitation with token:', token);
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'user_invitations')
        /* .select\( REMOVIDO */ ; //`
          email,
          role,
          expires_at,
          companies:company_id(name)
        `)
        /* .eq\( REMOVIDO */ ; //'token', token)
        /* .eq\( REMOVIDO */ ; //'accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        /* .maybeSingle\( REMOVIDO */ ; //);

      console.log('📊 Query result:', { data, error });

      if (error || !data) {
        toast.error('Convite inválido ou expirado');
        navigate('/login');
        return;
      }

      setInvitation({
        email: data.email,
        company_name: (data.companies as any)?.name || 'Empresa',
        role: data.role,
        expires_at: data.expires_at
      });
    } catch (error) {
      console.error('Erro ao carregar convite:', error);
      toast.error('Erro ao carregar convite');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await /* supabase REMOVIDO */ null; //auth.signUp({
        email: invitation!.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      // 2. Aceitar convite (criar associação usuário-empresa)
      const { data: acceptResult, error: acceptError } = await /* supabase REMOVIDO */ null; //rpc(
        'accept_user_invitation',
        {
          p_token: token,
          p_user_id: authData.user.id
        }
      );

      if (acceptError || !(acceptResult as any)?.success) {
        throw new Error((acceptResult as any)?.error || 'Erro ao aceitar convite');
      }

      toast.success('Convite aceito com sucesso! Faça login para continuar.');
      
      // Redirecionar para o login
      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao aceitar convite:', error);
      
      if (error.message?.includes('User already registered')) {
        toast.error('Este email já está cadastrado. Faça login normalmente.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Erro ao aceitar convite');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando convite...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const expiresAt = new Date(invitation.expires_at);
  const isExpired = expiresAt < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Convite Expirado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Este convite expirou em {expiresAt.toLocaleDateString()}.
            </p>
            <Button onClick={() => navigate('/login')} variant="outline">
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Aceitar Convite</CardTitle>
          <div className="text-center text-sm text-gray-600">
            <p>Você foi convidado para:</p>
            <p className="font-semibold text-blue-600">{invitation.company_name}</p>
            <p className="text-xs mt-1">Cargo: {invitation.role}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                type="email" 
                value={invitation.email} 
                disabled 
                className="bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nova Senha *</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Senha *</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            <div className="text-xs text-gray-500">
              Expira em: {expiresAt.toLocaleDateString()} às {expiresAt.toLocaleTimeString()}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
            >
              {submitting ? 'Processando...' : 'Aceitar Convite'}
            </Button>

            <Button 
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
              disabled={submitting}
            >
              Cancelar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}