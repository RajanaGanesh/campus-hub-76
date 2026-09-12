import { createClient } from '@supabase/supabase-js';
export type { Database } from '../types/database.types';

let rawUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

// Auto-correct Dashboard URLs to standard API gateway URL if user pasted the dashboard URL
if (rawUrl.includes('supabase.com/dashboard/project/')) {
  const parts = rawUrl.split('supabase.com/dashboard/project/');
  const projectRef = parts[1]?.split('/')[0]?.split('?')[0];
  if (projectRef) {
    rawUrl = `https://${projectRef}.supabase.co`;
  }
}

const isSupabaseConfigured =
  Boolean(rawUrl) &&
  Boolean(supabaseAnonKey) &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('your-project-id') &&
  !rawUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('your_anon_key');

export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing or set to placeholders. Campus Hub is operating in LOCAL/MOCK database mode.'
  );
} else {
  console.log('Campus Hub connected to Supabase database successfully at:', rawUrl);
}
