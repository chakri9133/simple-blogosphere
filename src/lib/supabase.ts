
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

export type User = {
  id: string;
  email: string;
  username?: string;
  created_at?: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  author?: {
    username?: string;
    email?: string;
  };
};

export type Comment = {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  author?: {
    username?: string;
    email?: string;
  };
};

export type Like = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};
