import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabaseUrl = (import.meta.env['VITE_SUPABASE_URL'] as string) || '';
const supabaseAnonKey = (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string) || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

// Fallback placeholder client if keys are not set up yet
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
