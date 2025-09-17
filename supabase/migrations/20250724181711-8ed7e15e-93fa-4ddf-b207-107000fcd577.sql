-- Adicionar coluna accepted_by na tabela user_invitations
ALTER TABLE user_invitations 
ADD COLUMN IF NOT EXISTS accepted_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();