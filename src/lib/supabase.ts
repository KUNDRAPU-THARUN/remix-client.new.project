import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export const getSupabaseUrl = (): string | undefined =>
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined) ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : undefined);

export const getSupabaseAnonKey = (): string | undefined =>
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY : undefined) ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_PUBLISHABLE_KEY : undefined);

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    url !== 'https://your-project.supabase.co' &&
    key !== 'your-supabase-publishable-key-here' &&
    url.startsWith('https://')
  );
};

let clientInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!clientInstance && url && key) {
    clientInstance = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'kaaryan_multi_city_auth_session',
      },
    });
  }
  return clientInstance;
};

// Singleton export
export const supabase = getSupabaseClient();

