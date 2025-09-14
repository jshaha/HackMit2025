import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

// Create Supabase client only if environment variables are available
export const supabase = env.SUPABASE_URL && env.SUPABASE_ANON_KEY 
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      nodes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Type exports for convenience
export type Node = Database['public']['Tables']['nodes']['Row'];
export type InsertNode = Database['public']['Tables']['nodes']['Insert'];
export type UpdateNode = Database['public']['Tables']['nodes']['Update'];
