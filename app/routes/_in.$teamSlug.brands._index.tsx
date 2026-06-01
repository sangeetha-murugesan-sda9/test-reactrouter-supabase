import {
  Link,
  redirect,
  useLoaderData,
  useNavigation,
  type MetaFunction,
} from 'react-router';
import { Plus } from 'lucide-react';

import { requireAuthWithClient, ensureUserProfile } from '~/lib/auth.server';
import { slugify } from '~/lib/slug';
import { appService } from '~/services/app';
import { BrandDialog } from '~/components/brands/BrandDialog';
import { BrandTable } from '~/components/brands/BrandTable';
import { Button } from '~/components/ui/button';
import type { Brand } from '~/types/global';

interface SupabaseMutationError {
  code?: string;
  message?: string;
}

function formatBrandMutationError(error: SupabaseMutationError): string {
  if (
    error.code === '23505' ||
    error.message?.includes('brands_team_id_slug_key')
  ) {
    return 'A brand with this slug already exists for this team.';
  }

  return error.message ?? 'Something went wrong. Please try again.';
}

export const meta: MetaFunction = () => {
  return [{ title: `Brands - ${appService.strings.app.title}` }];
};

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { teamSlug: string };
}) {
  const { user, supabaseClient } = await requireAuthWithClient(request);

  try {
    await ensureUserProfile(user, request);
  } catch {
    // Continue if profile creation fails
  }

  const { data: team, error: teamError } = await supabaseClient
    .from('teams')
    .select('id, name, slug')
    .eq('slug', params.teamSlug)
    .single();

  if (teamError || !team) {
    throw new Error('Team not found');
  }

  const { data: teamMember, error: memberError } = await supabaseClient
    .from('team_members')
    .select('role')
    .eq('team_id', team.id)
    .eq('user_id', user.id)
    .single();

  if (memberError || !teamMember) {
    throw new Error('Access denied: You are not a member of this team');
  }

  const { data: brands, error } = await supabaseClient
    .from('brands')
    .select('*')
    .eq('team_id', team.id)
    .order('name', { ascending: true });

  if (error) {
    throw new Error('Failed to load brands');
  }

  return { team, brands: (brands ?? []) as Brand[] };
}

export default function BrandsPage() {
  const { team, brands } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brands</h1>
          <p className="text-muted-foreground">Manage brands for {team.name}</p>
        </div>

        <Button asChild>
          <Link to={`/${team.slug}/brands?dialog=create`}>
            <Plus className="h-4 w-4" />
            New brand
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading brands...</p>
      ) : (
        <BrandTable brands={brands} teamSlug={team.slug} />
      )}

      <BrandDialog brands={brands} teamSlug={team.slug} />
    </div>
  );
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { teamSlug: string };
}) {
  const { user, supabaseClient } = await requireAuthWithClient(request);

  const { data: team, error: teamError } = await supabaseClient
    .from('teams')
    .select('id, slug')
    .eq('slug', params.teamSlug)
    .single();

  if (teamError || !team) {
    return { error: 'Team not found' };
  }

  const { data: teamMember, error: memberError } = await supabaseClient
    .from('team_members')
    .select('role')
    .eq('team_id', team.id)
    .eq('user_id', user.id)
    .single();

  if (memberError || !teamMember) {
    return { error: 'Access denied' };
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const name = String(formData.get('name') ?? '').trim();
    const slug = slugify(String(formData.get('slug') ?? ''));
    const logoUrl = String(formData.get('logo_url') ?? '').trim() || null;

    if (!name || !slug) {
      return { error: 'Name and slug are required.' };
    }

    const { error } = await supabaseClient.from('brands').insert({
      team_id: team.id,
      name,
      slug,
      logo_url: logoUrl,
    });

    if (error) {
      return { error: formatBrandMutationError(error) };
    }

    return redirect(`/${team.slug}/brands`);
  }

  if (intent === 'update') {
    const id = String(formData.get('id') ?? '');
    const name = String(formData.get('name') ?? '').trim();
    const slug = slugify(String(formData.get('slug') ?? ''));
    const logoUrl = String(formData.get('logo_url') ?? '').trim() || null;

    if (!id || !name || !slug) {
      return { error: 'Brand id, name, and slug are required.' };
    }

    const { error } = await supabaseClient
      .from('brands')
      .update({ name, slug, logo_url: logoUrl })
      .eq('id', id)
      .eq('team_id', team.id);

    if (error) {
      return { error: formatBrandMutationError(error) };
    }

    return redirect(`/${team.slug}/brands`);
  }

  if (intent === 'delete') {
    const id = String(formData.get('id') ?? '');

    if (!id) {
      return { error: 'Brand id is required.' };
    }

    const { error } = await supabaseClient
      .from('brands')
      .delete()
      .eq('id', id)
      .eq('team_id', team.id);

    if (error) {
      return { error: formatBrandMutationError(error) };
    }

    return { ok: true };
  }

  return { error: 'Invalid action.' };
}
