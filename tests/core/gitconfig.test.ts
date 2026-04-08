import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const { TEST_DIR, TEST_GITCONFIG } = vi.hoisted(() => {
  const { join } = require('node:path');
  const { tmpdir } = require('node:os');
  const TEST_DIR = join(tmpdir(), `gh-persona-gitconfig-test-${Date.now()}`);
  return {
    TEST_DIR,
    TEST_GITCONFIG: join(TEST_DIR, '.gitconfig'),
  };
});

vi.mock('../../src/core/paths.js', () => ({
  PERSONA_DIR: TEST_DIR,
  CONFIG_PATH: require('node:path').join(TEST_DIR, 'config.json'),
  KEYS_DIR: require('node:path').join(TEST_DIR, 'keys'),
  resolveHome: (path: string) => path,
  toTildePath: (path: string) => path,
}));

// Mock homedir to use test directory
vi.mock('node:os', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:os')>();
  return {
    ...original,
    homedir: () => TEST_DIR,
  };
});

import { generateProfileGitconfig, addIncludeIf, backupGitconfig } from '../../src/core/gitconfig.js';
import type { Profile } from '../../src/types/config.js';

describe('gitconfig', () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('generateProfileGitconfig', () => {
    it('creates profile gitconfig with user and sshCommand', () => {
      const profile: Profile = {
        name: 'personal',
        gitUserName: 'Jamkris',
        gitUserEmail: 'test@example.com',
        sshKeyPath: 'id_ed25519_personal',
        directories: [],
      };

      const configPath = generateProfileGitconfig(profile);
      expect(existsSync(configPath)).toBe(true);

      const content = readFileSync(configPath, 'utf-8');
      expect(content).toContain('[user]');
      expect(content).toContain('name = Jamkris');
      expect(content).toContain('email = test@example.com');
      expect(content).toContain('[core]');
      expect(content).toContain('IdentitiesOnly=yes');
      expect(content).toContain('id_ed25519_personal');
    });
  });

  describe('addIncludeIf', () => {
    it('appends includeIf block to gitconfig', () => {
      writeFileSync(TEST_GITCONFIG, '[user]\n\tname = Test\n', 'utf-8');

      addIncludeIf('~/projects/', 'personal');

      const content = readFileSync(TEST_GITCONFIG, 'utf-8');
      expect(content).toContain('[includeIf "gitdir:~/projects/"]');
      expect(content).toContain('path = ~/.gh-persona/gitconfig-personal');
    });

    it('adds trailing slash if missing', () => {
      writeFileSync(TEST_GITCONFIG, '', 'utf-8');

      addIncludeIf('~/projects', 'personal');

      const content = readFileSync(TEST_GITCONFIG, 'utf-8');
      expect(content).toContain('gitdir:~/projects/');
    });

    it('does not add duplicate entries', () => {
      writeFileSync(TEST_GITCONFIG, '', 'utf-8');

      addIncludeIf('~/projects/', 'personal');
      addIncludeIf('~/projects/', 'personal');

      const content = readFileSync(TEST_GITCONFIG, 'utf-8');
      const matches = content.match(/includeIf/g);
      expect(matches).toHaveLength(1);
    });

    it('preserves existing gitconfig content', () => {
      const existing = '[user]\n\tname = Existing\n[filter "lfs"]\n\tclean = git-lfs clean -- %f\n';
      writeFileSync(TEST_GITCONFIG, existing, 'utf-8');

      addIncludeIf('~/work/', 'work');

      const content = readFileSync(TEST_GITCONFIG, 'utf-8');
      expect(content).toContain('[user]');
      expect(content).toContain('[filter "lfs"]');
      expect(content).toContain('[includeIf');
    });
  });

  describe('backupGitconfig', () => {
    it('creates backup file', () => {
      writeFileSync(TEST_GITCONFIG, '[user]\n\tname = Test\n', 'utf-8');

      const backupPath = backupGitconfig();
      expect(backupPath).not.toBeNull();
      expect(existsSync(backupPath!)).toBe(true);

      const backupContent = readFileSync(backupPath!, 'utf-8');
      expect(backupContent).toContain('name = Test');
    });

    it('returns null when no gitconfig exists', () => {
      expect(backupGitconfig()).toBeNull();
    });
  });
});
