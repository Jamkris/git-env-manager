import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { CONFIG_PATH } from './paths.js';
import { isValidLocale, setLocale, t } from '../i18n/index.js';
import { DEFAULT_LOCALE } from '../i18n/types.js';
import type { Locale } from '../i18n/types.js';
import type { PersonaConfig, Profile } from '../types/config.js';

export class PersonaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'PersonaError';
  }
}

function createDefaultConfig(locale: Locale = 'en'): PersonaConfig {
  return {
    version: 1,
    locale,
    activeProfile: null,
    profiles: [],
  };
}

export function configExists(): boolean {
  return existsSync(CONFIG_PATH);
}

export function readConfig(): PersonaConfig {
  if (!existsSync(CONFIG_PATH)) {
    throw new PersonaError(
      t().configNotFound,
      'CONFIG_NOT_FOUND',
    );
  }

  const raw = readFileSync(CONFIG_PATH, 'utf-8');

  try {
    const parsed = JSON.parse(raw) as PersonaConfig;
    if (parsed.version !== 1 || !Array.isArray(parsed.profiles)) {
      throw new Error();
    }
    const locale = isValidLocale(parsed.locale) ? parsed.locale : DEFAULT_LOCALE;
    const config = { ...parsed, locale } as PersonaConfig;
    setLocale(config.locale);
    return config;
  } catch {
    throw new PersonaError(
      t().configInvalid,
      'CONFIG_INVALID',
    );
  }
}

export function writeConfig(config: PersonaConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function writeDefaultConfig(locale: Locale = 'en'): void {
  writeConfig(createDefaultConfig(locale));
}

export function getProfile(config: PersonaConfig, name: string): Profile | undefined {
  return config.profiles.find((p) => p.name === name);
}

export function addProfile(config: PersonaConfig, profile: Profile): PersonaConfig {
  return {
    ...config,
    profiles: [...config.profiles, profile],
  };
}

export function updateProfile(config: PersonaConfig, name: string, updated: Profile): PersonaConfig {
  return {
    ...config,
    profiles: config.profiles.map((p) => (p.name === name ? updated : p)),
  };
}

export function removeProfile(config: PersonaConfig, name: string): PersonaConfig {
  return {
    ...config,
    profiles: config.profiles.filter((p) => p.name !== name),
    activeProfile: config.activeProfile === name ? null : config.activeProfile,
  };
}
