-- Corrigir a tabela user_invitations para permitir invited_by NULL
ALTER TABLE user_invitations ALTER COLUMN invited_by DROP NOT NULL;