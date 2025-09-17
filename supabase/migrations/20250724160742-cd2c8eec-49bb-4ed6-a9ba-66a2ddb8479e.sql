-- Criar tabela para associar usuários às empresas
CREATE TABLE public.user_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT true,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, company_id)
);

-- Habilitar RLS
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_companies
CREATE POLICY "Super admins can manage all user companies"
ON public.user_companies FOR ALL
USING (get_user_role() = 'super_admin')
WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Users can view their own company associations"
ON public.user_companies FOR SELECT
USING (auth.uid() = user_id);

-- Criar tabela para convites pendentes
CREATE TABLE public.user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(email, company_id)
);

-- Habilitar RLS para convites
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para convites
CREATE POLICY "Super admins can manage all invitations"
ON public.user_invitations FOR ALL
USING (get_user_role() = 'super_admin')
WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Public can view valid invitations by token"
ON public.user_invitations FOR SELECT
USING (expires_at > now() AND accepted_at IS NULL);

-- Função para criar convite
CREATE OR REPLACE FUNCTION public.create_user_invitation(
    p_email TEXT,
    p_company_id UUID,
    p_role TEXT DEFAULT 'admin'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_token TEXT;
    invitation_id UUID;
BEGIN
    -- Verificar se usuário tem permissão (super admin)
    IF get_user_role() != 'super_admin' THEN
        RAISE EXCEPTION 'Sem permissão para criar convites';
    END IF;
    
    -- Gerar token único
    invitation_token := encode(gen_random_bytes(32), 'hex');
    
    -- Inserir convite (substituir se já existir)
    INSERT INTO public.user_invitations (
        email, 
        company_id, 
        role, 
        token, 
        invited_by
    ) VALUES (
        p_email, 
        p_company_id, 
        p_role, 
        invitation_token, 
        auth.uid()
    )
    ON CONFLICT (email, company_id) 
    DO UPDATE SET
        token = invitation_token,
        expires_at = now() + INTERVAL '7 days',
        invited_by = auth.uid(),
        created_at = now(),
        accepted_at = NULL
    RETURNING id INTO invitation_id;
    
    RETURN invitation_id;
END;
$$;

-- Função para aceitar convite
CREATE OR REPLACE FUNCTION public.accept_user_invitation(
    p_token TEXT,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Buscar convite válido
    SELECT * INTO invitation_record
    FROM public.user_invitations
    WHERE token = p_token 
    AND expires_at > now() 
    AND accepted_at IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite inválido ou expirado';
    END IF;
    
    -- Criar associação usuário-empresa
    INSERT INTO public.user_companies (
        user_id, 
        company_id, 
        role, 
        invited_by
    ) VALUES (
        p_user_id, 
        invitation_record.company_id, 
        invitation_record.role, 
        invitation_record.invited_by
    )
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET
        role = invitation_record.role,
        is_active = true,
        updated_at = now();
    
    -- Marcar convite como aceito
    UPDATE public.user_invitations
    SET accepted_at = now()
    WHERE id = invitation_record.id;
    
    RETURN true;
END;
$$;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_user_companies_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_companies_updated_at
    BEFORE UPDATE ON public.user_companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_companies_updated_at();