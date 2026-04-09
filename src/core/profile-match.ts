import { resolveHome } from './paths.js';
import type { Profile } from '../types/config.js';

export function findMatchingProfile(cwd: string, profiles: ReadonlyArray<Profile>): Profile | undefined {
  const normalizedCwd = cwd.endsWith('/') ? cwd : cwd + '/';
  for (const profile of profiles) {
    for (const dir of profile.directories) {
      const resolved = resolveHome(dir.endsWith('/') ? dir : dir + '/');
      if (normalizedCwd.startsWith(resolved)) {
        return profile;
      }
    }
  }
  return undefined;
}
