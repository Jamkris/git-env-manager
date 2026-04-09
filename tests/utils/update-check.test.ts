import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const { TEST_DIR } = vi.hoisted(() => {
  const { join } = require('node:path');
  const { tmpdir } = require('node:os');
  return { TEST_DIR: join(tmpdir(), `ghem-update-test-${Date.now()}`) };
});

vi.mock('../../src/core/paths.js', () => ({
  PERSONA_DIR: TEST_DIR,
  CONFIG_PATH: join(TEST_DIR, 'config.json'),
  KEYS_DIR: join(TEST_DIR, 'keys'),
  resolveHome: (path: string) => path,
  toTildePath: (path: string) => path,
}));

vi.mock('../../src/i18n/index.js', () => ({
  setLocale: vi.fn(),
  getLocale: () => 'en',
  t: () => ({
    updateAvailable: (current: string, latest: string) => `Update available: ${current} → ${latest}`,
    updateCommand: 'Run `npm install -g git-env-manager` to update.',
  }),
  isValidLocale: (v: string) => ['en', 'ko'].includes(v),
}));

import { isNewerVersion, checkForUpdates } from '../../src/utils/update-check.js';

const UPDATE_CHECK_PATH = join(TEST_DIR, 'update-check.json');

describe('isNewerVersion', () => {
  it('detects newer major version', () => {
    expect(isNewerVersion('1.0.0', '2.0.0')).toBe(true);
  });

  it('detects newer minor version', () => {
    expect(isNewerVersion('1.0.0', '1.1.0')).toBe(true);
  });

  it('detects newer patch version', () => {
    expect(isNewerVersion('1.0.0', '1.0.1')).toBe(true);
  });

  it('returns false for same version', () => {
    expect(isNewerVersion('1.2.0', '1.2.0')).toBe(false);
  });

  it('returns false for older version', () => {
    expect(isNewerVersion('2.0.0', '1.9.9')).toBe(false);
  });

  it('handles major downgrade with higher minor', () => {
    expect(isNewerVersion('2.0.0', '1.5.0')).toBe(false);
  });

  it('handles minor downgrade with higher patch', () => {
    expect(isNewerVersion('1.2.0', '1.1.9')).toBe(false);
  });
});

describe('checkForUpdates', () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('skips when PERSONA_DIR does not exist', async () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    const spy = vi.spyOn(console, 'log');
    await checkForUpdates('1.0.0');
    expect(spy).not.toHaveBeenCalled();
  });

  it('shows notification when cached version is newer', async () => {
    const cache = { lastCheck: Date.now(), latestVersion: '2.0.0' };
    writeFileSync(UPDATE_CHECK_PATH, JSON.stringify(cache), 'utf-8');

    const spy = vi.spyOn(console, 'log');
    await checkForUpdates('1.0.0');
    expect(spy).toHaveBeenCalled();

    const output = spy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).toContain('2.0.0');
  });

  it('does not notify when cached version is same', async () => {
    const cache = { lastCheck: Date.now(), latestVersion: '1.0.0' };
    writeFileSync(UPDATE_CHECK_PATH, JSON.stringify(cache), 'utf-8');

    const spy = vi.spyOn(console, 'log');
    await checkForUpdates('1.0.0');

    const output = spy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).not.toContain('→');
  });

  it('fetches from npm when cache is stale', async () => {
    const staleCache = { lastCheck: 0, latestVersion: '1.0.0' };
    writeFileSync(UPDATE_CHECK_PATH, JSON.stringify(staleCache), 'utf-8');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ version: '3.0.0' }), { status: 200 }),
    );

    const logSpy = vi.spyOn(console, 'log');
    await checkForUpdates('1.0.0');

    expect(fetchSpy).toHaveBeenCalledOnce();

    // Cache should be updated
    const cached = JSON.parse(readFileSync(UPDATE_CHECK_PATH, 'utf-8'));
    expect(cached.latestVersion).toBe('3.0.0');

    const output = logSpy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).toContain('3.0.0');
  });

  it('fetches when no cache exists', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ version: '1.0.0' }), { status: 200 }),
    );

    await checkForUpdates('1.0.0');

    expect(existsSync(UPDATE_CHECK_PATH)).toBe(true);
    const cached = JSON.parse(readFileSync(UPDATE_CHECK_PATH, 'utf-8'));
    expect(cached.latestVersion).toBe('1.0.0');
  });

  it('silently handles fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));

    await expect(checkForUpdates('1.0.0')).resolves.toBeUndefined();
  });

  it('silently handles malformed cache', async () => {
    writeFileSync(UPDATE_CHECK_PATH, '{ invalid json', 'utf-8');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ version: '1.0.0' }), { status: 200 }),
    );

    await expect(checkForUpdates('1.0.0')).resolves.toBeUndefined();
  });
});
