'use client';

import { Button } from '~/components/ui/button';
import {
  getSupportedLocaleFlag,
  getSupportedLocaleName,
} from '~/services/locales';

interface LocaleTabsProps {
  locales: string[];
  activeLocale: string;
  onLocaleChange: (locale: string) => void;
}

// Locale data is now provided by the locales service

export default function LocaleTabs({
  locales,
  activeLocale,
  onLocaleChange,
}: LocaleTabsProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {locales.map((locale, index) => (
            <Button
              key={locale}
              variant={activeLocale === locale ? 'default' : 'ghost'}
              onClick={() => onLocaleChange(locale)}
              className={`gap-2 whitespace-nowrap transition-all duration-200 animate-in slide-in-from-top-2 ${
                activeLocale === locale
                  ? 'shadow-sm'
                  : 'hover:bg-muted/80 hover:scale-105'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="transition-transform duration-200 hover:scale-110">
                {getSupportedLocaleFlag(locale)}
              </span>
              {getSupportedLocaleName(locale)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
