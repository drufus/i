import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
function validateConfig() {
  const errors: string[] = [];
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not defined');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  }
  
  if (!supabaseKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not defined');
  } else if (supabaseKey.length < 30) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid');
  }
  
  if (errors.length > 0) {
    throw new Error(`Supabase configuration error:\n${errors.join('\n')}`);
  }
}

validateConfig();

export const supabase = createClient(supabaseUrl!, supabaseKey!);