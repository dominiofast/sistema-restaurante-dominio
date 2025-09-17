import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useInvitation = () => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendInvitation = async (email: string, companyId: string, role = 'admin') => {
    if (!email || !companyId) {
      toast({
        title: 'Erro',
        description: 'Email e ID da empresa são obrigatórios',
        variant: 'destructive',
      });
      return false;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email,
          companyId,
          role
        }
      });

      if (error) throw error;

      toast({
        title: 'Convite enviado!',
        description: `Convite enviado para ${email}. O usuário receberá um email para criar sua conta.`,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: 'Erro ao enviar convite',
        description: error.message || 'Não foi possível enviar o convite. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const fetchExistingEmail = async (companyId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('user_companies')
        .select('user_id')
        .eq('company_id', companyId)
        .limit(1)
        .maybeSingle();

      if (data?.user_id) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.user_id);
        if (userData?.user?.email) {
          return userData.user.email;
        }
      }
      return null;
    } catch (error) {
      console.log('Nenhum usuário encontrado para esta empresa');
      return null;
    }
  };

  return {
    sendInvitation,
    fetchExistingEmail,
    isSending,
  };
};