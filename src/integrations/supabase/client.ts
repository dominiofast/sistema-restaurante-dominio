// MOCK CLIENT - Sistema migrado para PostgreSQL
// Este arquivo foi mantido apenas para compatibilidade

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Cliente DESABILITADO - todas as operações foram migradas para PostgreSQL
const MOCK_URL = "https://localhost";
const MOCK_KEY = "mock-key-postgresql-migration";

console.warn('⚠️ Supabase client está desabilitado - sistema usa PostgreSQL direto');

export const supabase = createClient<Database>(MOCK_URL, MOCK_KEY, {
  auth: {
    storage: localStorage,
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Sobrescrever métodos críticos para evitar chamadas reais
supabase.from = () => {
  console.warn('⚠️ supabase.from() chamado - use PostgreSQL API em /api/orders');
  return {
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  } as any;
};