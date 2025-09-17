-- Add PrintNode fields to company_settings for per-store configuration
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS printnode_child_account_id INTEGER,
ADD COLUMN IF NOT EXISTS printnode_child_email TEXT,
ADD COLUMN IF NOT EXISTS printnode_default_printer_id INTEGER,
ADD COLUMN IF NOT EXISTS printnode_default_printer_name TEXT,
ADD COLUMN IF NOT EXISTS printnode_enabled BOOLEAN DEFAULT false;

-- Index to speed up queries by company
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON public.company_settings(company_id);
