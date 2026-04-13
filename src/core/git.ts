import { spawnSync } from 'node:child_process';

export const MIN_GIT_VERSION_FOR_SSH_SIGNING = { major: 2, minor: 34 };

export function getGitVersion(): { major: number; minor: number; patch: number } | null {
  const result = spawnSync('git', ['--version'], { encoding: 'utf-8' });
  if (result.status !== 0 || !result.stdout) {
    return null;
  }
  const match = result.stdout.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3] ?? 0),
  };
}

export function supportsSshCommitSigning(): boolean {
  const version = getGitVersion();
  if (!version) {
    return false;
  }
  const { major, minor } = MIN_GIT_VERSION_FOR_SSH_SIGNING;
  return version.major > major || (version.major === major && version.minor >= minor);
}
