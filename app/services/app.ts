// App Service for centralized UI strings and configuration
// import packageJson from '../../package.json';

export interface AppStrings {
  app: {
    title: string;
    subtitle: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
  };
}

export const appStrings: AppStrings = {
  app: {
    title: 'Blenda Test Project',
    subtitle: 'Manage your AI automation workflows',
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Operation completed successfully',
  },
};

export function getString(key: string): string {
  const keys = key.split('.');
  let value: unknown = appStrings;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Key not found
      return key; // Return the key as fallback
    }
  }

  return typeof value === 'string' ? value : key;
}

export const appService = {
  strings: appStrings,
  getString,
};
