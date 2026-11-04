import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export const getSupabaseUrl = (): string | undefined => {
  const url =
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined) ||
    (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : undefined);
  return typeof url === 'string' ? url.trim() : undefined;
};

export const getSupabaseAnonKey = (): string | undefined => {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined;
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : undefined;

  const key =
    metaEnv?.VITE_SUPABASE_ANON_KEY ||
    metaEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    procEnv?.VITE_SUPABASE_ANON_KEY ||
    procEnv?.VITE_SUPABASE_PUBLISHABLE_KEY;

  return typeof key === 'string' ? key.trim() : undefined;
};

export const getSupabaseProjectRef = (): string | null => {
  const url = getSupabaseUrl();
  if (!url) return null;
  const match = url.match(/^https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
};

export const isStagingEnvironment = (): boolean => {
  return getSupabaseProjectRef() === 'tbwtxnszyddvpgqvxwow';
};

const PLACEHOLDER_URLS = new Set([
  'https://your-project.supabase.co',
  'https://your-project-ref.supabase.co',
]);

const PLACEHOLDER_KEYS = new Set([
  'your-supabase-publishable-key-here',
  'your-supabase-publishable-anon-key-here',
  'your-anon-key-here',
]);

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    !PLACEHOLDER_URLS.has(url) &&
    !PLACEHOLDER_KEYS.has(key) &&
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
