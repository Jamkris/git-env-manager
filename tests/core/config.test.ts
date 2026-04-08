import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Mock paths before importing config module
const TEST_DIR = join(tmpdir(), `gh-persona-test-${Date.now()}`);
const TEST_CONFIG_PATH = join(TEST_DIR, 'config.json');
const TEST_KEYS_DIR = join(TEST_DIR, 'keys');

vi.mock('../../src/core/paths.js', () => ({
  PERSONA_DIR: TEST_DIR,
  CONFIG_PATH: TEST_CONFIG_PATH,
  KEYS_DIR: TEST_KEYS_DIR,
  resolveHome: (path: string) => path,
  toTildePath: (path: string) => path,
}));

import {
  readConfig,
  writeConfig,
  writeDefaultConfig,
  configExists,
  getProfile,
  addProfile,
  PersonaError,
} from '../../src/core/config.js';
import type { PersonaConfig, Profile } from '../../src/types/config.js';

describe('config', () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('configExists', () => {
    it('returns false when config does not exist', () => {
      expect(configExists()).toBe(false);
    });

    it('returns true after writing default config', () => {
      writeDefaultConfig();
      expect(configExists()).toBe(true);
    });
  });

  describe('writeDefaultConfig / readConfig', () => {
    it('creates a valid default config', () => {
      writeDefaultConfig();
      const config = readConfig();

      expect(config.version).toBe(1);
      expect(config.activeProfile).toBeNull();
      expect(config.profiles).toEqual([]);
    });

    it('writes formatted JSON with trailing newline', () => {
      writeDefaultConfig();
      const raw = readFileSync(TEST_CONFIG_PATH, 'utf-8');

      expect(raw).toContain('\n');
      expect(raw.endsWith('\n')).toBe(true);
      expect(() => JSON.parse(raw)).not.toThrow();
    });
  });

  describe('readConfig errors', () => {
    it('throws CONFIG_NOT_FOUND when file missing', () => {
      expect(() => readConfig()).toThrow(PersonaError);
      try {
        readConfig();
      } catch (err) {
        expect((err as PersonaError).code).toBe('CONFIG_NOT_FOUND');
      }
    });

    it('throws CONFIG_INVALID for malformed JSON', () => {
      const { writeFileSync } = await import('node:fs');
      writeFileSync(TEST_CONFIG_PATH, '{ bad json }', 'utf-8');

      expect(() => readConfig()).toThrow(PersonaError);
      try {
        readConfig();
      } catch (err) {
        expect((err as PersonaError).code).toBe('CONFIG_INVALID');
      }
    });

    it('throws CONFIG_INVALID for wrong schema', () => {
      const { writeFileSync } = await import('node:fs');
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({ version: 2, profiles: [] }), 'utf-8');

      expect(() => readConfig()).toThrow(PersonaError);
      try {
        readConfig();
      } catch (err) {
        expect((err as PersonaError).code).toBe('CONFIG_INVALID');
      }
    });
  });

  describe('writeConfig', () => {
    it('persists config correctly', () => {
      const config: PersonaConfig = {
        version: 1,
        activeProfile: 'personal',
        profiles: [
          {
            name: 'personal',
            gitUserName: 'Jamkris',
            gitUserEmail: 'test@example.com',
            sshKeyPath: 'id_ed25519_personal',
            directories: ['~/projects/'],
          },
        ],
      };

      writeConfig(config);
      const loaded = readConfig();

      expect(loaded.activeProfile).toBe('personal');
      expect(loaded.profiles).toHaveLength(1);
      expect(loaded.profiles[0].name).toBe('personal');
    });
  });

  describe('getProfile', () => {
    const config: PersonaConfig = {
      version: 1,
      activeProfile: null,
      profiles: [
        {
          name: 'personal',
          gitUserName: 'Jamkris',
          gitUserEmail: 'test@example.com',
          sshKeyPath: 'id_ed25519_personal',
          directories: [],
        },
      ],
    };

    it('finds existing profile', () => {
      const profile = getProfile(config, 'personal');
      expect(profile).toBeDefined();
      expect(profile!.gitUserName).toBe('Jamkris');
    });

    it('returns undefined for missing profile', () => {
      expect(getProfile(config, 'nonexistent')).toBeUndefined();
    });
  });

  describe('addProfile', () => {
    it('returns new config with added profile (immutable)', () => {
      const original: PersonaConfig = {
        version: 1,
        activeProfile: null,
        profiles: [],
      };

      const newProfile: Profile = {
        name: 'work',
        gitUserName: 'leesh',
        gitUserEmail: 'leesh@work.com',
        sshKeyPath: 'id_ed25519_work',
        directories: ['~/work/'],
      };

      const updated = addProfile(original, newProfile);

      expect(updated.profiles).toHaveLength(1);
      expect(updated.profiles[0].name).toBe('work');
      // Original unchanged (immutability)
      expect(original.profiles).toHaveLength(0);
    });
  });
});
