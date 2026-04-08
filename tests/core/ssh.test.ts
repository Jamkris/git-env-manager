import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, existsSync, statSync } from 'node:fs';

const { TEST_DIR, TEST_KEYS_DIR } = vi.hoisted(() => {
  const { join } = require('node:path');
  const { tmpdir } = require('node:os');
  const TEST_DIR = join(tmpdir(), `gh-persona-ssh-test-${Date.now()}`);
  return {
    TEST_DIR,
    TEST_KEYS_DIR: join(TEST_DIR, 'keys'),
  };
});

vi.mock('../../src/core/paths.js', () => ({
  PERSONA_DIR: TEST_DIR,
  CONFIG_PATH: require('node:path').join(TEST_DIR, 'config.json'),
  KEYS_DIR: TEST_KEYS_DIR,
  resolveHome: (path: string) => path,
  toTildePath: (path: string) => path,
}));

vi.mock('../../src/i18n/index.js', () => ({
  setLocale: vi.fn(),
  getLocale: () => 'en',
  t: () => ({
    sshKeyNotFound: (path: string) => `SSH key not found: ${path}`,
    configNotFound: 'config.json not found. Run `ghem init` first.',
    configInvalid: 'config.json format is invalid.',
  }),
  isValidLocale: (v: string) => ['en', 'ko'].includes(v),
}));

import { validateKeyExists, copyKeyPair } from '../../src/core/ssh.js';
import { PersonaError } from '../../src/core/config.js';

describe('ssh', () => {
  const sourceDir = require('node:path').join(TEST_DIR, 'source-keys');

  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(TEST_KEYS_DIR, { recursive: true });
    mkdirSync(sourceDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('validateKeyExists', () => {
    it('throws SSH_KEY_NOT_FOUND for missing key', () => {
      expect(() => validateKeyExists('/nonexistent/key')).toThrow(PersonaError);
      try {
        validateKeyExists('/nonexistent/key');
      } catch (err) {
        expect((err as PersonaError).code).toBe('SSH_KEY_NOT_FOUND');
      }
    });

    it('does not throw for existing key', () => {
      const keyPath = require('node:path').join(sourceDir, 'id_test');
      writeFileSync(keyPath, 'fake-key-content', 'utf-8');
      expect(() => validateKeyExists(keyPath)).not.toThrow();
    });
  });

  describe('copyKeyPair', () => {
    it('copies private key with 0o600 permissions', () => {
      const keyPath = require('node:path').join(sourceDir, 'id_ed25519_test');
      writeFileSync(keyPath, 'private-key', 'utf-8');

      const dest = copyKeyPair(keyPath, 'test');
      expect(existsSync(dest)).toBe(true);

      const stats = statSync(dest);
      expect(stats.mode & 0o777).toBe(0o600);
    });

    it('copies public key if it exists', () => {
      const keyPath = require('node:path').join(sourceDir, 'id_ed25519_test');
      writeFileSync(keyPath, 'private-key', 'utf-8');
      writeFileSync(keyPath + '.pub', 'public-key', 'utf-8');

      copyKeyPair(keyPath, 'test');

      const pubDest = require('node:path').join(TEST_KEYS_DIR, 'test', 'id_ed25519_test.pub');
      expect(existsSync(pubDest)).toBe(true);
    });

    it('throws for nonexistent source key', () => {
      expect(() => copyKeyPair('/nonexistent/key', 'test')).toThrow(PersonaError);
    });
  });
});
