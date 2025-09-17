-- Create Stripe configuration table
CREATE TABLE public.stripe_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    publishable_key TEXT,
    secret_key TEXT,
    pix_enabled BOOLEAN DEFAULT false,
    card_enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT false,
    test_mode BOOLEAN DEFAULT true,
    webhook_endpoint_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their company Stripe config" 
ON public.stripe_config 
FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert their company Stripe config" 
ON public.stripe_config 
FOR INSERT 
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update their company Stripe config" 
ON public.stripe_config 
FOR UPDATE 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete their company Stripe config" 
ON public.stripe_config 
FOR DELETE 
USING (company_id = get_user_company_id());

-- Create trigger for updated_at
CREATE TRIGGER update_stripe_config_updated_at
    BEFORE UPDATE ON public.stripe_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();