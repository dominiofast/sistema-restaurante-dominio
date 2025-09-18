import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// SUPABASE DESABILITADO - Sistema migrado para PostgreSQL
const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseKey = 'placeholder-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  };
})
