
import { createClient } from '@supabase/supabase-js';

// For development purposes, provide fallback URLs if environment variables are not set
// In production, you would use your actual Supabase URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImZha2VrZXkiLCJ0eXAiOiJKV1QifQ.e30.fake-key-for-development';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not set. Using fallback values for development. Please set up your .env file based on .env.example for production use.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
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
