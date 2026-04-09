import { describe, it, expect, vi } from 'vitest';

const { TEST_DIR } = vi.hoisted(() => {
  const { join } = require('node:path');
  const { tmpdir } = require('node:os');
  return { TEST_DIR: join(tmpdir(), `ghem-status-test-${Date.now()}`) };
});

vi.mock('../../src/core/paths.js', () => ({
  PERSONA_DIR: require('node:path').join(TEST_DIR, '.git-env-manager'),
  CONFIG_PATH: require('node:path').join(TEST_DIR, '.git-env-manager', 'config.json'),
  KEYS_DIR: require('node:path').join(TEST_DIR, '.git-env-manager', 'keys'),
  resolveHome: (path: string) => {
    if (path.startsWith('~/')) {
      return require('node:path').join('/Users/home', path.slice(2));
    }
    return path;
  },
  toTildePath: (path: string) => path,
}));

import { findMatchingProfile } from '../../src/core/profile-match.js';
import type { Profile } from '../../src/types/config.js';

describe('findMatchingProfile', () => {
  const profiles: Profile[] = [
    {
      name: 'work',
      gitUserName: 'Work User',
      gitUserEmail: 'work@company.com',
      sshKeyPath: 'id_ghem_work',
      directories: ['~/work/'],
    },
    {
      name: 'personal',
      gitUserName: 'Personal User',
      gitUserEmail: 'personal@gmail.com',
      sshKeyPath: 'id_ghem_personal',
      directories: ['~/projects/', '~/oss/'],
    },
  ];

  it('matches cwd inside a profile directory', () => {
    const result = findMatchingProfile('/Users/home/work/repo-x', profiles);
    expect(result).toBeDefined();
    expect(result!.name).toBe('work');
  });

  it('matches cwd inside a profile directory (subdirectory)', () => {
    const result = findMatchingProfile('/Users/home/projects/my-app', profiles);
    expect(result).toBeDefined();
    expect(result!.name).toBe('personal');
  });

  it('matches cwd exactly at directory root', () => {
    const result = findMatchingProfile('/Users/home/work', profiles);
    expect(result).toBeDefined();
    expect(result!.name).toBe('work');
  });

  it('matches second directory of a profile', () => {
    const result = findMatchingProfile('/Users/home/oss/lib', profiles);
    expect(result).toBeDefined();
    expect(result!.name).toBe('personal');
  });

  it('returns undefined when no directory matches', () => {
    const result = findMatchingProfile('/Users/home/random', profiles);
    expect(result).toBeUndefined();
  });

  it('handles directories without trailing slash', () => {
    const profilesNoSlash: Profile[] = [
      {
        name: 'test',
        gitUserName: 'Test',
        gitUserEmail: 'test@test.com',
        sshKeyPath: 'id_ghem_test',
        directories: ['~/work'],
      },
    ];
    const result = findMatchingProfile('/Users/home/work/repo', profilesNoSlash);
    expect(result).toBeDefined();
    expect(result!.name).toBe('test');
  });

  it('returns undefined for empty profiles', () => {
    expect(findMatchingProfile('/Users/home/work', [])).toBeUndefined();
  });

  it('returns first matching profile on overlap', () => {
    const result = findMatchingProfile('/Users/home/work/sub', profiles);
    expect(result!.name).toBe('work');
  });
});
