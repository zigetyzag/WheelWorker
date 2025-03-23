import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for user profiles and verification
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  job_title?: string;
  experience?: string;
  location?: string;
  phone?: string;
  license_number?: string;
  join_date: string;
  is_verified: boolean;
  rating?: number;
  created_at: string;
  updated_at: string;
}

// Auth context and hooks will be implemented in authContext.tsx