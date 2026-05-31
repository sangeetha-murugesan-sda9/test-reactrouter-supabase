import { createSupabaseServerClient } from '../services/supabase.server';
import { redirect } from 'react-router';

export async function requireAuth(request: Request) {
  const { supabaseClient } = createSupabaseServerClient(request);

  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    throw redirect('/login');
  }

  return user;
}

export async function requireAuthWithClient(request: Request) {
  const { supabaseClient } = createSupabaseServerClient(request);

  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    throw redirect('/login');
  }

  return { user, supabaseClient };
}

export async function getAuthUser(request: Request) {
  try {
    const { supabaseClient } = createSupabaseServerClient(request);

    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error) {
      // Silently handle auth errors (expired tokens, etc.)
      if (
        error.message.includes('refresh_token_not_found') ||
        error.message.includes('Invalid Refresh Token')
      ) {
        // This is expected when tokens expire or are invalid
        return null;
      }
      // Auth error occurred
      return null;
    }

    if (!user) {
      return null;
    }

    return user;
  } catch {
    // Catch any unexpected errors
    return null;
  }
}

export async function ensureUserProfile(
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  request: Request
) {
  const { supabaseClient } = createSupabaseServerClient(request);

  // Check if user has a profile
  const { data: existingProfile } = await supabaseClient
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existingProfile) {
    // Create profile if it doesn't exist
    const { error: profileError } = await supabaseClient
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      });

    if (profileError) {
      // Don't throw error, just continue
      // The profile creation might fail due to RLS, but we can still proceed
    }
  }

  return user;
}
