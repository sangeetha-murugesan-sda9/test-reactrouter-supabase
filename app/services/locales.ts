export interface SupportedLocale {
  code: string;
  name: string;
  flag: string;
  defaultVoice?: string; // ElevenLabs voice name for this locale
}

export const supportedLocales: SupportedLocale[] = [
  { name: 'English', code: 'en', flag: '🇺🇸', defaultVoice: 'Rachel' },
  { name: 'Arabic', code: 'ar', flag: '🇸🇦', defaultVoice: 'Rachel' },
  { name: 'Danish', code: 'da', flag: '🇩🇰', defaultVoice: 'Rachel' },
  { name: 'Dutch', code: 'nl', flag: '🇳🇱', defaultVoice: 'Rachel' },
  { name: 'Finnish', code: 'fi', flag: '🇫🇮', defaultVoice: 'Rachel' },
  { name: 'French', code: 'fr', flag: '🇫🇷', defaultVoice: 'Rachel' },
  { name: 'German', code: 'de', flag: '🇩🇪', defaultVoice: 'Rachel' },
  { name: 'Italian', code: 'it', flag: '🇮🇹', defaultVoice: 'Rachel' },
  { name: 'Japanese', code: 'ja', flag: '🇯🇵', defaultVoice: 'Rachel' },
  { name: 'Korean', code: 'ko', flag: '🇰🇷', defaultVoice: 'Rachel' },
  { name: 'Norwegian', code: 'no', flag: '🇳🇴', defaultVoice: 'Rachel' },
  { name: 'Portuguese', code: 'pt', flag: '🇵🇹', defaultVoice: 'Rachel' },
  { name: 'Spanish', code: 'es', flag: '🇪🇸', defaultVoice: 'Rachel' },
  { name: 'Swedish', code: 'sv', flag: '🇸🇪', defaultVoice: 'Rachel' },
];

export function getSupportedLocale(code: string): SupportedLocale | undefined {
  return supportedLocales.find(locale => locale.code === code);
}

export function getSupportedLocaleName(code: string): string {
  const locale = getSupportedLocale(code);
  return locale ? locale.name : code.toUpperCase();
}

export function getSupportedLocaleFlag(code: string): string {
  const locale = getSupportedLocale(code);
  return locale ? locale.flag : '🌐';
}

export function getDefaultVoiceForLocale(code: string): string | undefined {
  const locale = getSupportedLocale(code);
  return locale?.defaultVoice;
}
