import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey, getSupabaseProjectRef } from '../src/lib/supabase';

async function testConnection() {
  console.log('--- SUPABASE CONFIGURATION DIAGNOSTICS ---');
  const configured = isSupabaseConfigured();
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  const ref = getSupabaseProjectRef();

  console.log('isSupabaseConfigured:', configured);
  console.log('Supabase URL:', url ? url.replace(/([^:]+:\/\/[^/]+).*/, '$1') : 'NONE');
  console.log('Project Ref:', ref || 'NONE');
  console.log('Anon Key Present:', Boolean(key));
  console.log('Anon Key Prefix:', key ? `${key.substring(0, 10)}...` : 'NONE');

  if (!url || !key) {
    console.log('RESULT: Supabase credentials missing.');
    return;
  }

  console.log('\n--- NETWORK CONNECTIVITY PROBE ---');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const startTime = Date.now();
    const resp = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const duration = Date.now() - startTime;
    console.log(`HTTP Status: ${resp.status} ${resp.statusText} (${duration}ms)`);
    if (resp.ok) {
      console.log('STATUS: Live Supabase endpoint REACHABLE');
    } else {
      console.log(`STATUS: Live Supabase responded with status ${resp.status}`);
    }
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.log('STATUS: Network request TIMED OUT (4000ms). Egress blocked or host unreachable.');
    } else {
      console.log(`STATUS: Network request FAILED: ${err.message}`, err.cause ? `(Cause: ${err.cause})` : '');
    }
  }
}

testConnection().catch(console.error);
