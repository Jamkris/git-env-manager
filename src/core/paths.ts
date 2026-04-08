import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME = homedir();

export const PERSONA_DIR = join(HOME, '.git-env-manager');
export const CONFIG_PATH = join(PERSONA_DIR, 'config.json');
export const KEYS_DIR = join(PERSONA_DIR, 'keys');

export function resolveHome(path: string): string {
  if (path.startsWith('~/')) {
    return join(HOME, path.slice(2));
  }
  return path;
}

export function toTildePath(absolutePath: string): string {
  if (absolutePath.startsWith(HOME)) {
    return '~' + absolutePath.slice(HOME.length);
  }
  return absolutePath;
}
