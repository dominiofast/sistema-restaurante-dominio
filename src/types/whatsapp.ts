
export interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
}

export type WhatsappPurpose = 'primary' | 'marketing';

export interface WhatsappIntegration {
  id?: string;
  company_id: string;
  control_id: string;
  host: string;
  instance_key: string;
  token: string;
  webhook?: string;
  purpose?: WhatsappPurpose;
}

export interface CompanyIntegrations {
  primary?: WhatsappIntegration | null;
  marketing?: WhatsappIntegration | null;
}
