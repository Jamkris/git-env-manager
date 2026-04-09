import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PERSONA_DIR } from '../core/paths.js';
import { t } from '../i18n/index.js';
import * as logger from './logger.js';

const UPDATE_CHECK_PATH = join(PERSONA_DIR, 'update-check.json');
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT = 3000; // 3 seconds
const PACKAGE_NAME = 'git-env-manager';

interface UpdateCache {
  lastCheck: number;
  latestVersion: string;
}

export function isNewerVersion(current: string, latest: string): boolean {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((l[i] ?? 0) > (c[i] ?? 0)) return true;
    if ((l[i] ?? 0) < (c[i] ?? 0)) return false;
  }
  return false;
}

function readCache(): UpdateCache | null {
  try {
    if (!existsSync(UPDATE_CHECK_PATH)) return null;
    return JSON.parse(readFileSync(UPDATE_CHECK_PATH, 'utf-8')) as UpdateCache;
  } catch {
    return null;
  }
}

function writeCache(cache: UpdateCache): void {
  try {
    writeFileSync(UPDATE_CHECK_PATH, JSON.stringify(cache), 'utf-8');
  } catch {
    // non-critical — silently ignore
  }
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const res = await fetch(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as { version: string };
    return data.version;
  } catch {
    return null;
  }
}

export async function checkForUpdates(currentVersion: string): Promise<void> {
  try {
    if (!existsSync(PERSONA_DIR)) return;

    const cache = readCache();
    const now = Date.now();

    // Cache is fresh — use cached result
    if (cache && (now - cache.lastCheck) < CHECK_INTERVAL) {
      if (isNewerVersion(currentVersion, cache.latestVersion)) {
        notifyUpdate(currentVersion, cache.latestVersion);
      }
      return;
    }

    // Cache stale or missing — fetch from npm
    const latest = await fetchLatestVersion();
    if (!latest) return;

    writeCache({ lastCheck: now, latestVersion: latest });

    if (isNewerVersion(currentVersion, latest)) {
      notifyUpdate(currentVersion, latest);
    }
  } catch {
    // Never let update check break the CLI
  }
}

function notifyUpdate(current: string, latest: string): void {
  console.log('');
  logger.warn(t().updateAvailable(current, latest));
  logger.info(t().updateCommand);
}
