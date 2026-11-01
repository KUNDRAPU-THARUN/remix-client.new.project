import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(url, key);

async function testInsert() {
  // Test direct insert into public.user_profiles with anon key
  const { data: pData, error: pErr } = await supabase.from('user_profiles').insert({
    id: '00000000-0000-0000-0000-000000000099',
    display_name: 'Test',
    email: 'test@example.com',
    city_id: 'chittoor'
  }).select();
  console.log('user_profiles insert result:', { pData, error: pErr?.message, code: pErr?.code });

  // Test direct insert into public.user_roles with anon key
  const { data: rData, error: rErr } = await supabase.from('user_roles').insert({
    user_id: '00000000-0000-0000-0000-000000000099',
    role: 'customer',
    city_id: 'chittoor'
  }).select();
  console.log('user_roles insert result:', { rData, error: rErr?.message, code: rErr?.code });
}

testInsert();

