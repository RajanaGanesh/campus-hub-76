import { createClient } from '@supabase/supabase-js';
export type { Database } from '../types/database.types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  !supabaseAnonKey.includes('placeholder');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing or set to placeholders. Campus Hub is operating in LOCAL/MOCK database mode.'
  );
} else {
  console.log('Campus Hub connected to Supabase database successfully.');
}
