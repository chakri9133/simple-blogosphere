
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type { Database };

// Define Post type for use in components
export type Post = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  likes_count: number;
  author?: {
    username: string | null;
    email: string | null;
  };
};

// Define Comment type for use in components
export type Comment = {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  author?: {
    username: string | null;
    email: string | null;
  };
};

export { supabase };
