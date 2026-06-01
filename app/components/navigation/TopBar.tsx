import { useEffect } from 'react';
import { Bell, LogOut, Settings } from 'lucide-react';
import {
  useLocation,
  useNavigate,
  useParams,
  useRouteLoaderData,
} from 'react-router';

import { BrandSelector } from '~/components/brands/BrandSelector';
import { Button } from '~/components/ui/button';
import { createSupabaseBrowserClient } from '~/services/supabase.client';
import type { loader as templatesLoader } from '~/routes/_in.$teamSlug.templates._index';

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isTemplatesIndex = /\/templates\/?$/.test(location.pathname);
  const templatesData = useRouteLoaderData<typeof templatesLoader>(
    'routes/_in.$teamSlug.templates._index'
  );

  // Fetch user's teams
  useEffect(() => {
    async function fetchTeams() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch teams where user is a member
        await supabase
          .from('team_members')
          .select(
            `
            team_id,
            role,
            teams (
              id,
              slug,
              name,
              description,
              created_at,
              updated_at,
              creator_user_id
            )
          `
          )
          .eq('user_id', user.id);
      } catch {
        // Error fetching teams
      }
    }

    fetchTeams();
  }, [params.teamSlug]);

  const handleSignOut = async () => {
    // For now, just redirect to login
    // In a real app, you'd call a server action to sign out
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4" />

      <div className="flex items-center gap-3">
        {isTemplatesIndex && templatesData && (
          <BrandSelector
            brands={templatesData.brands}
            selectedBrandSlug={templatesData.selectedBrandSlug}
          />
        )}
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="gap-2 transition-all duration-200 hover:scale-105"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
