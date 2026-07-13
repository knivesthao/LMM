import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isConfigured(): boolean {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('http') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 0
  );
}

// Stub — returns mock data per table when Supabase isn't configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockData: Record<string, any> = {
  content: [
    {
      id: '1',
      title: 'The Brave Buffalo',
      creator_name: 'Somsack',
      language: 'lao',
      reading_level: 'beginner',
      cover_image_url: '/mock/cover-placeholder.png',
      price_kip: 5000,
      description: 'A story about a brave buffalo.',
    },
  ],
};

function makeBuilder(table: string) {
  const data = mockData[table] ?? [];
  const builder: Record<string, any> = {
    select: () => builder,
    eq: () => builder,
    in: () => builder,
    order: () => builder,
    single: () => {
      const item = Array.isArray(data) && data.length > 0 ? data[0] : data;
      builder.then = (resolve: (v: unknown) => void) =>
        Promise.resolve(resolve({ data: item, error: null }));
      return builder;
    },
    insert: () => {
      builder.then = (resolve: (v: unknown) => void) =>
        Promise.resolve(resolve({ data: null, error: null }));
      return builder;
    },
    then: (resolve: (v: unknown) => void) =>
      Promise.resolve(resolve({ data, error: null })),
  };
  return builder;
}

function createStubClient() {
  return {
    from: (table: string) => makeBuilder(table),
    rpc: () => makeBuilder(''),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithOtp: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null }),
      admin: { getUserById: () => Promise.resolve({ data: null }) },
    },
  } as ReturnType<typeof createClient>;
}

export const supabase = isConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : createStubClient();
