-- Add UI customization fields to company_settings for enhanced menu UX
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#FF6B35',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#4A90E2',
ADD COLUMN IF NOT EXISTS show_cashback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cashback_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS show_loyalty_program BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_estimated_time BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_minimum_order BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS minimum_order_value DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS estimated_delivery_time INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS product_card_style TEXT DEFAULT 'detailed' CHECK (product_card_style IN ('compact', 'detailed')),
ADD COLUMN IF NOT EXISTS navigation_style TEXT DEFAULT 'tabs' CHECK (navigation_style IN ('tabs', 'dropdown')),
ADD COLUMN IF NOT EXISTS promotional_banner_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ui_customization JSONB DEFAULT '{}';

-- Add operating hours as JSONB for flexible schedule configuration
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{
  "monday": {"open": "08:00", "close": "22:00", "closed": false},
  "tuesday": {"open": "08:00", "close": "22:00", "closed": false},
  "wednesday": {"open": "08:00", "close": "22:00", "closed": false},
  "thursday": {"open": "08:00", "close": "22:00", "closed": false},
  "friday": {"open": "08:00", "close": "22:00", "closed": false},
  "saturday": {"open": "08:00", "close": "22:00", "closed": false},
  "sunday": {"open": "08:00", "close": "22:00", "closed": false}
}';

-- Add loyalty program configuration
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS loyalty_program_config JSONB DEFAULT '{
  "points_per_real": 1,
  "points_to_redeem": 100,
  "reward_value": 10.00,
  "enabled": false
}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_settings_primary_color ON public.company_settings(primary_color);
CREATE INDEX IF NOT EXISTS idx_company_settings_ui_features ON public.company_settings USING GIN (ui_customization);

-- Add comments for documentation
COMMENT ON COLUMN public.company_settings.primary_color IS 'Primary brand color for UI theming (hex format)';
COMMENT ON COLUMN public.company_settings.secondary_color IS 'Secondary brand color for UI theming (hex format)';
COMMENT ON COLUMN public.company_settings.show_cashback IS 'Whether to display cashback information in the menu';
COMMENT ON COLUMN public.company_settings.cashback_rate IS 'Cashback percentage rate (0.00 to 100.00)';
COMMENT ON COLUMN public.company_settings.show_loyalty_program IS 'Whether to display loyalty program information';
COMMENT ON COLUMN public.company_settings.operating_hours IS 'Weekly operating hours schedule in JSON format';
COMMENT ON COLUMN public.company_settings.loyalty_program_config IS 'Loyalty program configuration in JSON format';
COMMENT ON COLUMN public.company_settings.ui_customization IS 'Additional UI customization options in JSON format';