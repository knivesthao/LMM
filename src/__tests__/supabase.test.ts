import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

import { supabase } from '@/lib/supabase';

describe('supabase client', () => {
  it('creates a client with auth methods', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth.signInWithOtp).toBeDefined();
    expect(supabase.from('content').select).toBeDefined();
  });
});
