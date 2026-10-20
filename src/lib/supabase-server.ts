import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

function getServerEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
}

const supabaseUrl =
  getServerEnv('VITE_SUPABASE_URL') ||
  getServerEnv('SUPABASE_URL') ||
  (import.meta.env['VITE_SUPABASE_URL'] as string) ||
  '';

const serviceRoleKey =
  getServerEnv('SUPABASE_SERVICE_ROLE_KEY') ||
  getServerEnv('VITE_SUPABASE_ANON_KEY') ||
  (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string) ||
  '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
  serviceRoleKey &&
  !supabaseUrl.includes('your-project-id')
);

const safeUrl = isServerSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isServerSupabaseConfigured ? serviceRoleKey : 'placeholder-service-key';

export const supabaseServer = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
