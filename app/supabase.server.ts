import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import type { Database } from '~/types/supabase';

export const createSupabaseServerClient = (
  request: Request,
  useServiceRoleKey?: boolean
) => {
  const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');
  const headers = new Headers();

  const supabaseClient = createServerClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    useServiceRoleKey
      ? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
      : process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
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
    }
  );

  return { supabaseClient, headers };
};
