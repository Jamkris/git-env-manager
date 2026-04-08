import type { Locale, Messages } from './types.js';
import { DEFAULT_LOCALE } from './types.js';
import { en } from './locales/en.js';
import { ko } from './locales/ko.js';

const locales: Record<Locale, Messages> = { en, ko };

let currentLocale: Locale = DEFAULT_LOCALE;

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(): Messages {
  return locales[currentLocale];
}

export function isValidLocale(value: string): value is Locale {
  return value in locales;
}

export type { Locale, Messages };
