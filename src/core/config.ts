import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { CONFIG_PATH } from './paths.js';
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

function createDefaultConfig(): PersonaConfig {
  return {
    version: 1,
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
      'config.json을 찾을 수 없습니다. `persona init`을 먼저 실행하세요.',
      'CONFIG_NOT_FOUND',
    );
  }

  const raw = readFileSync(CONFIG_PATH, 'utf-8');

  try {
    const parsed = JSON.parse(raw) as PersonaConfig;
    if (parsed.version !== 1 || !Array.isArray(parsed.profiles)) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new PersonaError(
      'config.json 형식이 올바르지 않습니다.',
      'CONFIG_INVALID',
    );
  }
}

export function writeConfig(config: PersonaConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function writeDefaultConfig(): void {
  writeConfig(createDefaultConfig());
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
