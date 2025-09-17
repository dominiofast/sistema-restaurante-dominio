-- Criar função para criação direta de usuários pelo admin
CREATE OR REPLACE FUNCTION public.create_user_directly(
    p_email TEXT,
    p_password TEXT,
    p_company_id UUID,
    p_role TEXT DEFAULT 'user',
    p_created_by UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    result JSON;
BEGIN
    -- Verificar se o email já existe
    IF EXISTS (
        SELECT 1 FROM auth.users WHERE email = p_email
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Email já está em uso');
    END IF;
    
    -- Criar usuário no Supabase Auth usando admin API
    -- Nota: Esta função será chamada via edge function que tem acesso ao admin
    -- Por enquanto, apenas registramos a intenção
    
    -- Inserir na tabela de usuários pendentes para processamento
    INSERT INTO pending_user_creation (
        email, 
        password_hash, 
        company_id, 
        role, 
        created_by,
        status
    ) VALUES (
        p_email,
        'PENDING_HASH:' || p_password, -- Será processado pela edge function
        p_company_id,
        p_role,
        p_created_by,
        'pending'
    );
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Usuário será criado em instantes',
        'email', p_email
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Criar tabela para usuários pendentes de criação
CREATE TABLE IF NOT EXISTS pending_user_creation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    company_id UUID NOT NULL,
    role TEXT DEFAULT 'user',
    created_by UUID,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    error_message TEXT
);

-- RLS para tabela pending_user_creation
ALTER TABLE pending_user_creation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage pending users" 
ON pending_user_creation 
FOR ALL 
USING (get_user_role() = 'super_admin');

CREATE POLICY "Admins can create users for their company" 
ON pending_user_creation 
FOR INSERT 
WITH CHECK (
    company_id IN (
        SELECT id FROM companies 
        WHERE domain = get_user_company_domain()
    )
);