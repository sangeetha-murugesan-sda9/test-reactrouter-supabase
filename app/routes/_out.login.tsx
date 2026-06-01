import {
  Form,
  useActionData,
  useNavigation,
  redirect,
  type MetaFunction,
} from 'react-router';
import { createSupabaseServerClient } from '../services/supabase.server';
import { appService } from '~/services/app';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

export const meta: MetaFunction = () => {
  return [{ title: `Sign In - ${appService.strings.app.title}` }];
};

export async function action({ request }: { request: Request }) {
  const { supabaseClient, headers } = createSupabaseServerClient(request);
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const intent = formData.get('intent') as string;

  if (intent === 'signin') {
    const { data: authData, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return { error: error.message };
    }

    if (authData.user) {
      // Find the user's first team
      const { data: teamMembers, error: teamError } = await supabaseClient
        .from('team_members')
        .select(
          `
          teams (
            slug
          )
        `
        )
        .eq('user_id', authData.user.id)
        .limit(1);

      if (teamError || !teamMembers || teamMembers.length === 0) {
        // If user has no teams, show error message
        return {
          error: teamError?.message,
        };
      }

      const firstTeamSlug = teamMembers[0].teams?.slug;
      if (firstTeamSlug) {
        return redirect(`/${firstTeamSlug}/templates`, { headers });
      }
    }

    // Fallback error
    return { error: 'Login failed. Please try again.' };
  }

  if (intent === 'signup') {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: true,
      message: 'Check your email for a confirmation link!',
    };
  }

  return { error: 'Invalid action' };
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <img
              src="/blenda_logo_horizontal.svg"
              alt="Blenda Labs"
              className="h-12 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to {appService.strings.app.title}
          </h2>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                defaultValue="dev@blendalabs.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                defaultValue="video"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm text-center">
              {actionData.error}
            </div>
          )}

          {actionData?.message && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-700 text-sm text-center">
              {actionData.message}
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              name="intent"
              value="signin"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            {/*
            <button
              type="submit"
              name="intent"
              value="signup"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing up...' : 'Sign up'}
            </button>
            */}
          </div>
        </Form>
      </div>
    </div>
  );
}
