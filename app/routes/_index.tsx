import { redirect, type MetaFunction } from 'react-router';
import { getAuthUser } from '../lib/auth.server';
import { createSupabaseServerClient } from '../services/supabase.server';
import { appService } from '../services/app';

export const meta: MetaFunction = () => {
  return [{ title: appService.strings.app.title }];
};

export async function loader({ request }: { request: Request }) {
  const user = await getAuthUser(request);

  if (user) {
    // Find the user's first team and redirect to that team's templates
    const { supabaseClient } = createSupabaseServerClient(request);

    const { data: teamMembers, error: teamError } = await supabaseClient
      .from('team_members')
      .select(
        `
        teams (
          slug
        )
      `
      )
      .eq('user_id', user.id)
      .limit(1);

    if (teamError || !teamMembers || teamMembers.length === 0) {
      // If user has no teams, redirect to login (they need to be invited to a team)
      return redirect('/login');
    }

    const firstTeamSlug = teamMembers[0].teams?.slug;
    if (firstTeamSlug) {
      return redirect(`/${firstTeamSlug}/templates`);
    }

    // Fallback redirect
    return redirect('/login');
  } else {
    return redirect('/login');
  }
}
