import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      content: {
        Row: {
          id: string;
          title: string;
          creator_name: string;
          language: 'lao' | 'english';
          reading_level: 'beginner' | 'intermediate' | 'advanced';
          cover_image_url: string;
          price_kip: number;
          description: string;
          created_at: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          purchased_at: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          amount_kip: number;
          status: 'pending' | 'confirmed' | 'rejected';
          created_at: string;
        };
      };
      projects: {
        Row: {
          id: string;
          creator_id: string;
          type: 'comic' | 'book';
          title: string;
          description: string;
          language: 'lao' | 'english';
          reading_level: 'beginner' | 'intermediate' | 'advanced';
          price_kip: number;
          status: 'draft' | 'published';
          created_at: string;
        };
      };
      scenes: {
        Row: {
          id: string;
          project_id: string;
          scene_number: number;
          narration_text: string;
          rendered_image_url: string | null;
          created_at: string;
        };
      };
    };
  };
}
