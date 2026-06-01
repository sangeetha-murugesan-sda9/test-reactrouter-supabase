import { createBrowserClient } from '@supabase/ssr';

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
    );
  }

  const client = createBrowserClient(supabaseUrl, supabasePublishableKey);

  // Listen for auth errors and clear invalid tokens
  client.auth.onAuthStateChange(event => {
    if (event === 'TOKEN_REFRESHED') {
      // Auth token refreshed
    } else if (event === 'SIGNED_OUT') {
      // User signed out
    }
  });

  return client;
};

// For backward compatibility - create client lazily to avoid immediate errors
let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = new Proxy(
  {} as ReturnType<typeof createBrowserClient>,
  {
    get(target, prop) {
      if (!_supabaseClient) {
        _supabaseClient = createSupabaseBrowserClient();
      }
      return (_supabaseClient as Record<string, unknown>)[prop as string];
    },
  }
);
