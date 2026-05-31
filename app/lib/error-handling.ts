import { toast } from 'sonner';

export interface ErrorResponse {
  error: string;
  status?: number;
}

/**
 * Creates an error response that can be returned from actions/loaders
 */
export function createErrorResponse(
  message: string,
  status: number = 400
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Shows an error toast notification
 */
export function showErrorToast(error: string | Error, title?: string) {
  const message = typeof error === 'string' ? error : error.message;
  toast.error(title || 'Error', {
    description: message,
    duration: 5000,
  });
}

/**
 * Shows a success toast notification
 */
export function showSuccessToast(message: string, title?: string) {
  toast.success(title || 'Success', {
    description: message,
    duration: 3000,
  });
}

/**
 * Shows an info toast notification
 */
export function showInfoToast(message: string, title?: string) {
  toast.info(title || 'Info', {
    description: message,
    duration: 3000,
  });
}

/**
 * Handles errors from actions/loaders and shows appropriate toasts
 */
export function handleActionError(error: unknown): ErrorResponse {
  // Log action error
  let message = 'An unexpected error occurred';
  let status = 500;

  if (error instanceof Response) {
    try {
      const errorData = JSON.parse(error.body as string);
      message = errorData.error || error.statusText || message;
      status = error.status;
    } catch {
      message = error.statusText || message;
      status = error.status;
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Show toast for non-404 errors
  if (status !== 404) {
    showErrorToast(message);
  }

  return { error: message, status };
}

/**
 * Extracts error message from various error formats
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string')
      return error.message;
    if ('error' in error && typeof error.error === 'string') return error.error;
    if ('statusText' in error && typeof error.statusText === 'string')
      return error.statusText;
  }
  return 'An unexpected error occurred';
}
