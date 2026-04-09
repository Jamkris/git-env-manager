import { resolveHome } from './paths.js';
import type { Profile } from '../types/config.js';

export function findMatchingProfile(cwd: string, profiles: ReadonlyArray<Profile>): Profile | undefined {
  for (const profile of profiles) {
    for (const dir of profile.directories) {
      const resolved = resolveHome(dir.endsWith('/') ? dir : dir + '/');
      if (cwd.startsWith(resolved)) {
        return profile;
      }
    }
  }
  return undefined;
}
