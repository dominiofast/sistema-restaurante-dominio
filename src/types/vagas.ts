
export interface Vaga {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  company_id: string;
  salary_range?: string;
  requirements?: string;
  benefits?: string;
  created_at: string;
}

export interface PageConfig {
  page_title: string;
  logo_url: string;
  banner_url: string;
  primary_color: string;
  company_name: string;
  title_color: string;
  company_id: string;
}
