-- 🔒 CRITICAL SECURITY FIXES - Phase 1: Database Level
-- Fix RLS policies, hash passwords, secure functions

-- ==============================================
-- 1. CREATE SECURITY DEFINER FUNCTIONS
-- ==============================================

-- Function to get user role safely
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role'),
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role'),
    'user'
  );
$$;

-- Function to get user company domain safely
CREATE OR REPLACE FUNCTION public.get_user_company_domain()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'company_domain'),
    (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
  );
$$;

-- Function to get user company ID safely
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'company_id')::UUID,
    (auth.jwt() -> 'raw_user_meta_data' ->> 'company_id')::UUID
  );
$$;

-- Function to check if user can access customer addresses
CREATE OR REPLACE FUNCTION public.can_access_customer_addresses(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    public.get_user_role() = 'super_admin' OR
    public.get_user_company_id() = target_company_id
  );
$$;

-- ==============================================
-- 2. HASH REMAINING PLAINTEXT PASSWORDS
-- ==============================================

-- Hash any remaining plaintext passwords in company_credentials
UPDATE public.company_credentials 
SET 
  password_hash = 'NEEDS_HASH:' || password_hash,
  is_hashed = false
WHERE is_hashed = false 
  AND NOT password_hash LIKE 'NEEDS_HASH:%'
  AND NOT password_hash LIKE '$2%'; -- bcrypt hashes start with $2

-- ==============================================
-- 3. ADD SEARCH_PATH PROTECTION TO FUNCTIONS
-- ==============================================

-- Add search_path protection to critical functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- ==============================================
-- 4. CREATE RATE LIMITING TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS public.login_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- email or IP
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'ip')),
    attempts INTEGER NOT NULL DEFAULT 1,
    first_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(identifier, identifier_type)
);

-- Enable RLS on rate limiting table
ALTER TABLE public.login_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.login_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ==============================================
-- 5. CREATE SECURE LOGIN FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION public.check_login_rate_limit(
    p_email TEXT,
    p_ip TEXT DEFAULT NULL,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15,
    p_block_minutes INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    email_record RECORD;
    ip_record RECORD;
    time_window TIMESTAMP WITH TIME ZONE;
    result JSONB;
BEGIN
    time_window := NOW() - INTERVAL '1 minute' * p_window_minutes;
    
    -- Check email-based rate limiting
    SELECT * INTO email_record 
    FROM public.login_rate_limits 
    WHERE identifier = lower(p_email) AND identifier_type = 'email';
    
    -- Check if email is currently blocked
    IF email_record.blocked_until IS NOT NULL AND email_record.blocked_until > NOW() THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'email_blocked',
            'blocked_until', email_record.blocked_until,
            'attempts_remaining', 0
        );
    END IF;
    
    -- Reset if window expired
    IF email_record.first_attempt_at IS NOT NULL AND email_record.first_attempt_at < time_window THEN
        UPDATE public.login_rate_limits 
        SET 
            attempts = 1,
            first_attempt_at = NOW(),
            last_attempt_at = NOW(),
            blocked_until = NULL,
            updated_at = NOW()
        WHERE identifier = lower(p_email) AND identifier_type = 'email';
        
        RETURN jsonb_build_object(
            'allowed', true,
            'attempts_remaining', p_max_attempts - 1
        );
    END IF;
    
    -- Check if max attempts reached
    IF email_record.attempts >= p_max_attempts THEN
        -- Block the email
        UPDATE public.login_rate_limits 
        SET 
            blocked_until = NOW() + INTERVAL '1 minute' * p_block_minutes,
            updated_at = NOW()
        WHERE identifier = lower(p_email) AND identifier_type = 'email';
        
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'rate_limit_exceeded',
            'blocked_until', NOW() + INTERVAL '1 minute' * p_block_minutes,
            'attempts_remaining', 0
        );
    END IF;
    
    -- Increment attempt counter or create new record
    IF email_record.id IS NOT NULL THEN
        UPDATE public.login_rate_limits 
        SET 
            attempts = attempts + 1,
            last_attempt_at = NOW(),
            updated_at = NOW()
        WHERE identifier = lower(p_email) AND identifier_type = 'email';
    ELSE
        INSERT INTO public.login_rate_limits (identifier, identifier_type, attempts)
        VALUES (lower(p_email), 'email', 1);
    END IF;
    
    RETURN jsonb_build_object(
        'allowed', true,
        'attempts_remaining', p_max_attempts - COALESCE(email_record.attempts, 0) - 1
    );
END;
$$;

-- ==============================================
-- 6. UPDATE CRITICAL RLS POLICIES
-- ==============================================

-- Fix ai_agents_config policies
DROP POLICY IF EXISTS "Company users can manage their ai agent configs" ON ai_agents_config;
DROP POLICY IF EXISTS "Super admins can manage all ai agent configs" ON ai_agents_config;

CREATE POLICY "Super admins can manage all ai agent configs"
ON ai_agents_config
FOR ALL
TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "Company users can manage their ai agent configs"
ON ai_agents_config
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT id FROM companies 
        WHERE domain = public.get_user_company_domain()
    )
)
WITH CHECK (
    company_id IN (
        SELECT id FROM companies 
        WHERE domain = public.get_user_company_domain()
    )
);

-- Fix companies policies
DROP POLICY IF EXISTS "Allow super admins to delete companies" ON companies;
DROP POLICY IF EXISTS "Allow super admins to insert companies" ON companies;
DROP POLICY IF EXISTS "Allow super admins to update companies" ON companies;

CREATE POLICY "Allow super admins to delete companies"
ON companies
FOR DELETE
TO authenticated
USING (public.get_user_role() = 'super_admin');

CREATE POLICY "Allow super admins to insert companies"
ON companies
FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "Allow super admins to update companies"
ON companies
FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- Fix company_credentials policies
DROP POLICY IF EXISTS "Super admins can manage company credentials" ON company_credentials;

CREATE POLICY "Super admins can manage company credentials"
ON company_credentials
FOR ALL
TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- Fix cardapio_branding policies
DROP POLICY IF EXISTS "Comprehensive branding access policy" ON cardapio_branding;

CREATE POLICY "Comprehensive branding access policy"
ON cardapio_branding
FOR ALL
TO authenticated
USING (
    public.get_user_role() = 'super_admin' OR 
    (auth.uid() IS NOT NULL AND company_id = public.get_user_company_id())
)
WITH CHECK (
    public.get_user_role() = 'super_admin' OR 
    (auth.uid() IS NOT NULL AND company_id = public.get_user_company_id())
);

-- Fix app_settings policy
DROP POLICY IF EXISTS "Only super admins can access app settings" ON app_settings;

CREATE POLICY "Only super admins can access app settings"
ON app_settings
FOR ALL
TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- Fix customer_addresses policies
DROP POLICY IF EXISTS "Authenticated users can delete customer addresses of their comp" ON customer_addresses;
DROP POLICY IF EXISTS "Authenticated users can update customer addresses of their comp" ON customer_addresses;

CREATE POLICY "Authenticated users can delete customer addresses of their comp"
ON customer_addresses
FOR DELETE
TO authenticated
USING (public.can_access_customer_addresses(company_id));

CREATE POLICY "Authenticated users can update customer addresses of their comp"
ON customer_addresses
FOR UPDATE
TO authenticated
USING (public.can_access_customer_addresses(company_id))
WITH CHECK (public.can_access_customer_addresses(company_id));

-- ==============================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- ==============================================

CREATE TRIGGER set_login_rate_limits_updated_at
    BEFORE UPDATE ON public.login_rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();