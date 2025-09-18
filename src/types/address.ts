
export interface CustomerAddress {
  id?: string;
  customer_name?: string;
  customer_phone?: string;
  company_id?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  deliveryFee?: number;


export interface AddressSuggestion {
  id: string;
  formatted_address: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  latitude?: number;
  longitude?: number;


export interface AddressFormFieldsProps {
  address: Partial<CustomerAddress>;
  loading: boolean;
  onCepChange: (cep: string) => void;
  onChange: (field: string, value: string) => void;

