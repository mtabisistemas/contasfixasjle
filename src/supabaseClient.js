import { createClient } from '@supabase/supabase-js';

// Usando as credenciais do Supabase Unificado (App JLE / mtabi)
const SUPABASE_URL = 'https://dmwefcngefeonxuukwdl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_j3AShmEr6aEWjqBv2rruhw_5EE4NnOt';

export const isSupabaseConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
