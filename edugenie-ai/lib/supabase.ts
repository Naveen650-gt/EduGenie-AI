import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ytzskfaeevhotviurven.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_NayaVgHtwLLDTHpr7DYqew_LYRm6497';

export const supabase = createClient(supabaseUrl, supabaseKey);
