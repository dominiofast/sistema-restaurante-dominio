import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface Endereco {
  id?: string;
  company_id: string;
  cep?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  latitude?: number;
  longitude?: number;
  hide_from_customers?: boolean;
  manual_coordinates?: boolean;
  created_at?: string;
  updated_at?: string;
  is_principal?: boolean;
  mostrarEndereco?: string;
  informarLatLng?: string;


export function useEstabelecimentoEndereco(companyId: string | undefined) {
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [loading, setLoading] = useState(false);

  // Temporariamente desabilitado até que os tipos sejam atualizados
  useEffect(() => {
    setLoading(false);
  }, [companyId]);

  return { endereco, loading, setEndereco };


export async function salvarEndereco(endereco: Partial<Endereco>) {
  // Temporariamente desabilitado até que os tipos sejam atualizados
  console.log('Salvamento de endereço temporariamente desabilitado', endereco);
  return endereco as Endereco;

