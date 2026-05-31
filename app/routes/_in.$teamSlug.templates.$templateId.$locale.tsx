import {
  useParams,
  useNavigate,
  useLoaderData,
  Outlet,
  type MetaFunction,
} from 'react-router';
import { requireAuth } from '../lib/auth.server';
import { createSupabaseServerClient } from '../services/supabase.server';
import MenuBar from '~/components/MenuBar';
import LocaleTabs from '~/components/LocaleTabs';
import { appService } from '../services/app';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.template
        ? `${data.template.title} - ${appService.strings.app.title}`
        : `Template - ${appService.strings.app.title}`,
    },
  ];
};

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { templateId: string; locale: string; teamSlug: string };
}) {
  const user = await requireAuth(request);
  const { supabaseClient } = createSupabaseServerClient(request);

  const templateId = params.templateId;
  const locale = params.locale;

  // Fetch template and its locales
  const { data: template, error: templateError } = await supabaseClient
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError || !template) {
    throw new Response('Template not found', { status: 404 });
  }

  // For now, just return empty locales array since we removed template_locales table
  const availableLocales: string[] = [];

  return {
    user,
    template,
    availableLocales,
    currentLocale: locale,
  };
}

export default function ProjectLayout() {
  const params = useParams();
  const navigate = useNavigate();
  const { template, availableLocales, currentLocale } =
    useLoaderData<typeof loader>();
  const templateId = params.templateId as string;

  const { locale: activeLocale, teamSlug } = useParams();
  const safeActiveLocale = activeLocale || currentLocale;

  const handleBackClick = () => {
    navigate(`/${teamSlug}/templates`);
  };

  const handleLocaleChange = (locale: string) => {
    navigate(`/${teamSlug}/templates/${templateId}/${locale}/edit`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Menu Bar */}
      <MenuBar
        templateTitle={template.title}
        onBackClick={handleBackClick}
        templateId={template.id}
        thumbnailUrl={template.thumbnail_url}
      />

      {/* Locale Tabs */}
      <LocaleTabs
        locales={availableLocales}
        activeLocale={safeActiveLocale}
        onLocaleChange={handleLocaleChange}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Nested Route Content */}
        <Outlet context={{ template, currentLocale, availableLocales }} />

        {/* Template Content Placeholder */}
        <div className="flex-1 bg-muted/30 flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">{template.title}</h2>
            <p className="text-muted-foreground">
              {template.description || 'No description provided'}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Template editor coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
