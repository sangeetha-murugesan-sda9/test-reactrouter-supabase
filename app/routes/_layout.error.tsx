import { useRouteError } from 'react-router';
import { useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { showErrorToast, extractErrorMessage } from '~/lib/error-handling';

export default function ErrorBoundary() {
  const error = useRouteError() as {
    status?: number;
    message?: string;
    statusText?: string;
  };

  // Show error toast when component mounts
  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error);
      showErrorToast(errorMessage, 'Something went wrong');
    }
  }, [error]);

  // Handle authentication errors
  if (error?.status === 401 || error?.status === 403) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <p className="text-muted-foreground">
              Please sign in to access this page.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <a href="/login">
                <Home className="mr-2 h-4 w-4" />
                Go to Login
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle other errors
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <p className="text-muted-foreground">
            {error?.message || 'An unexpected error occurred.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => window.location.reload()} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
