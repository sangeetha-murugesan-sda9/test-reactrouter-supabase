import {
  useNavigate,
  useLoaderData,
  useNavigation,
  type MetaFunction,
} from 'react-router';
import { Clock, Globe, Play } from 'lucide-react';

import { requireAuthWithClient, ensureUserProfile } from '~/lib/auth.server';
import {
  getSupportedLocaleFlag,
  getSupportedLocaleName,
} from '~/services/locales';
import { appService } from '~/services/app';
import { BrandSelector } from '~/components/brands/BrandSelector';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { BrandSummary, TemplateWithLocalesAndBrand } from '~/types/global';

export const meta: MetaFunction = () => {
  return [{ title: `Video Templates - ${appService.strings.app.title}` }];
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

  const url = new URL(request.url);
  const brandSlug = url.searchParams.get('brand');

  const { data: brands, error: brandsError } = await supabaseClient
    .from('brands')
    .select('id, name, slug, logo_url')
    .eq('team_id', team.id)
    .order('name', { ascending: true });

  if (brandsError) {
    throw new Error('Failed to load brands');
  }

  const brandList = (brands ?? []) as BrandSummary[];

  const templateSelect = `
    *,
    template_locales (
      id,
      locale,
      last_render_url,
      thumbnail_url,
      created_at,
      template_id,
      updated_at
    ),
    brands (
      id,
      name,
      slug,
      logo_url
    )
  `;

  if (brandSlug) {
    const selectedBrand = brandList.find(brand => brand.slug === brandSlug);

    if (!selectedBrand) {
      return {
        user,
        team,
        brands: brandList,
        selectedBrandSlug: brandSlug,
        templates: [] as TemplateWithLocalesAndBrand[],
      };
    }

    const { data: templates, error } = await supabaseClient
      .from('templates')
      .select(templateSelect)
      .eq('team_id', team.id)
      .eq('brand_id', selectedBrand.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to load templates');
    }

    return {
      user,
      team,
      brands: brandList,
      selectedBrandSlug: brandSlug,
      templates: (templates ?? []) as TemplateWithLocalesAndBrand[],
    };
  }

  const { data: templates, error } = await supabaseClient
    .from('templates')
    .select(templateSelect)
    .eq('team_id', team.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to load templates');
  }

  return {
    user,
    team,
    brands: brandList,
    selectedBrandSlug: null,
    templates: (templates ?? []) as TemplateWithLocalesAndBrand[],
  };
}

function getTemplateStatus(
  template: TemplateWithLocalesAndBrand
): 'completed' | 'in-progress' | 'draft' {
  const locales = template.template_locales ?? [];
  if (locales.length === 0) return 'draft';
  if (locales.some(locale => locale.last_render_url)) return 'completed';
  return 'in-progress';
}

function formatTemplateDuration(template: TemplateWithLocalesAndBrand) {
  if (!template.duration || template.duration === 0) return '--:--';

  const totalSeconds = Math.floor(template.duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  function pad(n: number) {
    return n.toString().padStart(2, '0');
  }

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${minutes}:${pad(seconds)}`;
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { user, team, brands, selectedBrandSlug, templates } =
    useLoaderData<typeof loader>();

  const isLoading = navigation.state === 'loading';

  function handleTemplateClick(templateId: string) {
    const template = templates.find(item => item.id === templateId);

    if (template?.template_locales?.[0]) {
      navigate(
        `/${team.slug}/templates/${templateId}/${template.template_locales[0].locale}/edit`
      );
      return;
    }

    navigate(`/${team.slug}/templates/${templateId}/en/edit`);
  }

  return (
    <div className="space-y-6">
      <BrandSelector brands={brands} selectedBrandSlug={selectedBrandSlug} />

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading templates...</p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template, index) => (
          <Card
            key={template.id}
            className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => handleTemplateClick(template.id)}
          >
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={template.thumbnail_url ?? '/video_placeholder.svg'}
                  alt={template.title}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                  <Play className="h-12 w-12 scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-90" />
                </div>
                <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-sm text-white backdrop-blur-sm">
                  {formatTemplateDuration(template)}
                </div>
                <Badge
                  className="absolute top-2 left-2 backdrop-blur-sm"
                  variant="secondary"
                >
                  {getTemplateStatus(template).replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <CardTitle className="mb-2 line-clamp-2 text-lg transition-colors duration-200 group-hover:text-primary">
                {template.title}
              </CardTitle>

              {template.brands && (
                <p className="mb-2 text-sm text-muted-foreground">
                  Brand: {template.brands.name}
                </p>
              )}

              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span suppressHydrationWarning>
                  Created {new Date(template.created_at).toLocaleDateString()}
                </span>
                {template.creator_user_id !== user.id && (
                  <span className="rounded bg-muted px-2 py-1 text-xs">
                    Shared
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.template_locales?.map(locale => (
                    <Badge
                      key={locale.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      <span className="mr-1">
                        {getSupportedLocaleFlag(locale.locale)}
                      </span>
                      {getSupportedLocaleName(locale.locale)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="py-12 text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mb-2 text-lg text-foreground">No templates found</p>
          <p className="text-muted-foreground">
            {selectedBrandSlug
              ? 'Try a different brand filter or clear the filter.'
              : 'Create a new template to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
