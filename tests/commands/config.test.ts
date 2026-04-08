import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';

const { TEST_DIR, TEST_CONFIG_PATH, TEST_KEYS_DIR } = vi.hoisted(() => {
  const { join } = require('node:path');
  const { tmpdir } = require('node:os');
  const TEST_DIR = join(tmpdir(), `gh-persona-config-cmd-test-${Date.now()}`);
  return {
    TEST_DIR,
    TEST_CONFIG_PATH: join(TEST_DIR, 'config.json'),
    TEST_KEYS_DIR: join(TEST_DIR, 'keys'),
  };
});

vi.mock('../../src/core/paths.js', () => ({
  PERSONA_DIR: TEST_DIR,
  CONFIG_PATH: TEST_CONFIG_PATH,
  KEYS_DIR: TEST_KEYS_DIR,
  resolveHome: (path: string) => path,
  toTildePath: (path: string) => path,
}));

import { writeConfig, readConfig } from '../../src/core/config.js';
import { setLocale, getLocale } from '../../src/i18n/index.js';
import type { PersonaConfig } from '../../src/types/config.js';

describe('config set-lang', () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    setLocale('en');
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('updates locale to ko in config file', () => {
    const config: PersonaConfig = {
      version: 1,
      locale: 'en',
      activeProfile: null,
      profiles: [],
    };
    writeConfig(config);

    // Simulate what the config set-lang command does
    const loaded = readConfig();
    const updated = { ...loaded, locale: 'ko' as const };
    writeConfig(updated);

    const raw = JSON.parse(readFileSync(TEST_CONFIG_PATH, 'utf-8'));
    expect(raw.locale).toBe('ko');
  });

  it('updates locale to en in config file', () => {
    const config: PersonaConfig = {
      version: 1,
      locale: 'ko',
      activeProfile: null,
      profiles: [],
    };
    writeConfig(config);

    const loaded = readConfig();
    const updated = { ...loaded, locale: 'en' as const };
    writeConfig(updated);

    const raw = JSON.parse(readFileSync(TEST_CONFIG_PATH, 'utf-8'));
    expect(raw.locale).toBe('en');
  });

  it('readConfig sets locale via setLocale', () => {
    const config: PersonaConfig = {
      version: 1,
      locale: 'ko',
      activeProfile: null,
      profiles: [],
    };
    writeConfig(config);

    readConfig();
    expect(getLocale()).toBe('ko');
  });

  it('preserves profiles when updating locale', () => {
    const config: PersonaConfig = {
      version: 1,
      locale: 'en',
      activeProfile: 'personal',
      profiles: [
        {
          name: 'personal',
          gitUserName: 'Test',
          gitUserEmail: 'test@test.com',
          sshKeyPath: 'id_ghem_personal',
          directories: [],
        },
      ],
    };
    writeConfig(config);

    const loaded = readConfig();
    const updated = { ...loaded, locale: 'ko' as const };
    writeConfig(updated);

    const reloaded = readConfig();
    expect(reloaded.locale).toBe('ko');
    expect(reloaded.profiles).toHaveLength(1);
    expect(reloaded.activeProfile).toBe('personal');
  });
});
