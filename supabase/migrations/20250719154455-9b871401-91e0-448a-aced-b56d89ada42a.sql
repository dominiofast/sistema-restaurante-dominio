-- Tabela de Roles (Papéis)
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Permissões
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL, -- users, stores, products, reports, etc
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, manage
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Relacionamento Role-Permission (Muitos para Muitos)
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (role_id, permission_id)
);

-- Permissões específicas por contexto (usuário pode ter permissões específicas para certas lojas)
CREATE TABLE public.user_store_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID NULL REFERENCES public.companies(id) ON DELETE CASCADE, -- NULL = todas as lojas
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NULL
);

-- Adicionar role_id aos metadados dos usuários (usando auth.users)
-- Como não podemos modificar auth.users diretamente, usaremos raw_user_meta_data

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_store_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Roles: Super admins podem gerenciar, outros podem apenas visualizar
CREATE POLICY "Super admins can manage roles" ON public.roles
    FOR ALL USING (
        (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
    );

CREATE POLICY "Authenticated users can view roles" ON public.roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permissions: Super admins podem gerenciar, outros podem apenas visualizar
CREATE POLICY "Super admins can manage permissions" ON public.permissions
    FOR ALL USING (
        (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
    );

CREATE POLICY "Authenticated users can view permissions" ON public.permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Role Permissions: Super admins podem gerenciar
CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
    FOR ALL USING (
        (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
    );

CREATE POLICY "Authenticated users can view role permissions" ON public.role_permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- User Store Permissions: Usuários com permissões adequadas podem gerenciar
CREATE POLICY "Users can manage store permissions" ON public.user_store_permissions
    FOR ALL USING (
        (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin' OR
        user_id = auth.uid()
    );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_roles_updated_at();

-- Inserir Roles iniciais
INSERT INTO public.roles (name, slug, description) VALUES
('Super Administrador', 'super_admin', 'Acesso total ao sistema'),
('Suporte', 'support', 'Suporte técnico com acesso limitado'),
('Administrador de Lojas', 'store_admin', 'Gerencia múltiplas lojas'),
('Loja', 'store', 'Acesso apenas à própria loja');

-- Inserir Permissões
INSERT INTO public.permissions (name, slug, module, action, description) VALUES
-- Usuários
('Visualizar Usuários', 'users.read', 'users', 'read', 'Ver lista de usuários'),
('Criar Usuários', 'users.create', 'users', 'create', 'Criar novos usuários'),
('Editar Usuários', 'users.update', 'users', 'update', 'Editar dados de usuários'),
('Deletar Usuários', 'users.delete', 'users', 'delete', 'Remover usuários'),
('Resetar Senhas', 'users.reset_password', 'users', 'manage', 'Resetar senhas de usuários'),

-- Lojas/Empresas
('Visualizar Lojas', 'stores.read', 'stores', 'read', 'Ver dados das lojas'),
('Criar Lojas', 'stores.create', 'stores', 'create', 'Criar novas lojas'),
('Editar Lojas', 'stores.update', 'stores', 'update', 'Editar configurações das lojas'),
('Deletar Lojas', 'stores.delete', 'stores', 'delete', 'Remover lojas'),

-- Pedidos
('Visualizar Pedidos', 'orders.read', 'orders', 'read', 'Ver pedidos'),
('Criar Pedidos', 'orders.create', 'orders', 'create', 'Criar novos pedidos'),
('Editar Pedidos', 'orders.update', 'orders', 'update', 'Editar pedidos'),
('Deletar Pedidos', 'orders.delete', 'orders', 'delete', 'Remover pedidos'),

-- Produtos
('Visualizar Produtos', 'products.read', 'products', 'read', 'Ver produtos'),
('Criar Produtos', 'products.create', 'products', 'create', 'Criar novos produtos'),
('Editar Produtos', 'products.update', 'products', 'update', 'Editar produtos'),
('Deletar Produtos', 'products.delete', 'products', 'delete', 'Remover produtos'),

-- Relatórios
('Visualizar Relatórios', 'reports.read', 'reports', 'read', 'Acessar relatórios'),
('Exportar Relatórios', 'reports.export', 'reports', 'manage', 'Exportar dados'),

-- Logs
('Visualizar Logs', 'logs.read', 'logs', 'read', 'Acessar logs do sistema'),

-- Configurações
('Gerenciar Configurações', 'settings.manage', 'settings', 'manage', 'Alterar configurações do sistema'),

-- Caixa
('Visualizar Caixa', 'cashier.read', 'cashier', 'read', 'Ver dados do caixa'),
('Gerenciar Caixa', 'cashier.manage', 'cashier', 'manage', 'Abrir/fechar caixa');

-- Atribuir Permissões aos Roles
-- Super Admin: Todas as permissões
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'super_admin';

-- Suporte: Permissões limitadas
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'support' AND p.slug IN (
    'users.read', 'users.reset_password',
    'stores.read',
    'reports.read', 'reports.export',
    'logs.read'
);

-- Store Admin: Gerenciamento de lojas
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'store_admin' AND p.slug IN (
    'users.read', 'users.create', 'users.update',
    'stores.read', 'stores.update',
    'orders.read', 'orders.create', 'orders.update',
    'products.read', 'products.create', 'products.update',
    'reports.read', 'reports.export',
    'cashier.read', 'cashier.manage'
);

-- Store: Apenas sua loja
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'store' AND p.slug IN (
    'stores.read', 'stores.update',
    'orders.read', 'orders.create', 'orders.update',
    'products.read', 'products.update',
    'reports.read',
    'cashier.read', 'cashier.manage'
);

-- Função para verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_id UUID,
    permission_slug TEXT,
    store_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    has_role_permission BOOLEAN := FALSE;
    has_context_permission BOOLEAN := FALSE;
BEGIN
    -- Buscar role do usuário
    SELECT raw_user_meta_data->>'role' INTO user_role
    FROM auth.users 
    WHERE id = user_id;
    
    -- Verificar permissão via role
    SELECT EXISTS(
        SELECT 1
        FROM public.roles r
        JOIN public.role_permissions rp ON r.id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE r.slug = user_role 
        AND p.slug = permission_slug 
        AND r.is_active = TRUE
    ) INTO has_role_permission;
    
    -- Verificar permissão específica por contexto (se store_id fornecido)
    IF store_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1
            FROM public.user_store_permissions usp
            JOIN public.permissions p ON usp.permission_id = p.id
            WHERE usp.user_id = user_id
            AND p.slug = permission_slug
            AND (usp.store_id = store_id OR usp.store_id IS NULL)
            AND (usp.expires_at IS NULL OR usp.expires_at > NOW())
        ) INTO has_context_permission;
        
        RETURN has_role_permission OR has_context_permission;
    END IF;
    
    RETURN has_role_permission;
END;
$$;