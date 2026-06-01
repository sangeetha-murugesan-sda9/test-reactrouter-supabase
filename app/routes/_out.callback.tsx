import { useEffect } from 'react';
import { useNavigate, type MetaFunction } from 'react-router';
import { supabase } from '../services/supabase.client';
import { appService } from '../services/app';

export const meta: MetaFunction = () => {
  return [{ title: `Signing In - ${appService.strings.app.title}` }];
};

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        // Auth callback error
        navigate('/login');
        return;
      }

      if (data.session) {
        navigate('/templates');
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
