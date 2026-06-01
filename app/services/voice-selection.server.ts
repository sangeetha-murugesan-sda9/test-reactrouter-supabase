// Voice selection service for ElevenLabs voice selection
// Implements the priority system for voice selection

import { getDefaultVoiceForLocale } from './locales';

export interface VoiceSelectionResult {
  voiceName: string;
  source: 'template_locale' | 'template_default' | 'app_default';
  templateId?: string;
}

/**
 * Selects the appropriate ElevenLabs voice for a locale based on:
 * Default voices set in app/services/locales.ts
 */
export async function selectVoiceForLocale(
  templateId: string,
  targetLocale: string
): Promise<VoiceSelectionResult> {
  try {
    // Use app default voice for locale (template integration removed)
    const appDefaultVoice = getDefaultVoiceForLocale(targetLocale) || 'Rachel';

    return {
      voiceName: appDefaultVoice,
      source: 'app_default',
    };
  } catch {
    // Fallback to app default
    const fallbackVoice = getDefaultVoiceForLocale(targetLocale) || 'Rachel';
    return {
      voiceName: fallbackVoice,
      source: 'app_default',
    };
  }
}

/**
 * Selects voices for multiple locales at once
 */
export async function selectVoicesForLocales(
  templateId: string,
  targetLocales: string[]
): Promise<Record<string, VoiceSelectionResult>> {
  const results: Record<string, VoiceSelectionResult> = {};

  for (const locale of targetLocales) {
    results[locale] = await selectVoiceForLocale(templateId, locale);
  }

  return results;
}
