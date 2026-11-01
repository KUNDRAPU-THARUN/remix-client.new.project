import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(url, key);

async function checkStorageObjects() {
  // Try querying storage.objects directly via postgrest if exposed, or check error message
  const { data, error } = await supabase.from('objects').select('*').limit(1);
  console.log('from objects:', { data, error });
}

checkStorageObjects();

