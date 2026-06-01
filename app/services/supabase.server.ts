import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import ws from 'ws';

import type { Database } from '~/types/supabase';

export const createSupabaseServerClient = (
  request: Request,
  useServiceRoleKey?: boolean
) => {
  const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');
  const headers = new Headers();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = useServiceRoleKey
    ? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    : process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
    );
  }

  const supabaseClient = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookies.filter(cookie => cookie.value !== undefined) as {
            name: string;
            value: string;
          }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append(
              'Set-Cookie',
              serializeCookieHeader(name, value, options)
            );
          });
        },
      },
      auth: {
        // Suppress console errors for refresh token issues
        debug: false,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      realtime: {
        transport: ws,
      },
    }
  );

  return { supabaseClient, headers };
};
