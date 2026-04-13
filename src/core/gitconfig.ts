import { readFileSync, writeFileSync, existsSync, renameSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { PERSONA_DIR, toTildePath } from './paths.js';
import { PersonaError } from './config.js';
import type { Profile } from '../types/config.js';

const GITCONFIG_PATH = join(homedir(), '.gitconfig');

function readGitconfig(): string {
  if (!existsSync(GITCONFIG_PATH)) {
    return '';
  }
  return readFileSync(GITCONFIG_PATH, 'utf-8');
}

function writeGitconfigAtomic(content: string): void {
  const tmpPath = GITCONFIG_PATH + '.ghem-tmp';
  writeFileSync(tmpPath, content, 'utf-8');
  renameSync(tmpPath, GITCONFIG_PATH);
}

export function backupGitconfig(): string | null {
  if (!existsSync(GITCONFIG_PATH)) {
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(PERSONA_DIR, `gitconfig-backup-${timestamp}`);
  copyFileSync(GITCONFIG_PATH, backupPath);
  return backupPath;
}

export function generateProfileGitconfig(profile: Profile): string {
  const sshKeyTildePath = `~/.git-env-manager/keys/${profile.name}/${profile.sshKeyPath}`;
  const configPath = join(PERSONA_DIR, `gitconfig-${profile.name}`);

  const lines = [
    '[user]',
    `\tname = ${profile.gitUserName}`,
    `\temail = ${profile.gitUserEmail}`,
  ];

  if (profile.commitSigning) {
    lines.push(`\tsigningkey = ${sshKeyTildePath}.pub`);
  }

  lines.push('[core]', `\tsshCommand = "ssh -i ${sshKeyTildePath} -o IdentitiesOnly=yes"`);

  if (profile.commitSigning) {
    lines.push('[commit]', '\tgpgsign = true', '[gpg]', '\tformat = ssh');
  }

  lines.push('');

  writeFileSync(configPath, lines.join('\n'), 'utf-8');
  return configPath;
}

function ensureTrailingSlash(dir: string): string {
  return dir.endsWith('/') ? dir : dir + '/';
}

export function addIncludeIf(directory: string, profileName: string): void {
  const content = readGitconfig();
  const gitconfigTildePath = `~/.git-env-manager/gitconfig-${profileName}`;
  const normalizedDir = ensureTrailingSlash(directory);

  // Check for duplicate
  if (content.includes(`[includeIf "gitdir:${normalizedDir}"]`)) {
    return;
  }

  const block = [
    '',
    `[includeIf "gitdir:${normalizedDir}"]`,
    `\tpath = ${gitconfigTildePath}`,
  ].join('\n');

  writeGitconfigAtomic(content + block + '\n');
}

export function removeIncludeIf(profileName: string): void {
  const content = readGitconfig();
  const gitconfigTildePath = `~/.git-env-manager/gitconfig-${profileName}`;

  const lines = content.split('\n');
  const filtered: string[] = [];
  let skip = false;

  for (const line of lines) {
    if (line.startsWith('[includeIf') && skip === false) {
      // Check if next lines reference this profile
      const idx = lines.indexOf(line);
      const nextLine = lines[idx + 1] ?? '';
      if (nextLine.includes(gitconfigTildePath)) {
        skip = true;
        continue;
      }
    }

    if (skip) {
      if (line.startsWith('\t') || line.startsWith(' ')) {
        continue;
      }
      skip = false;
    }

    filtered.push(line);
  }

  writeGitconfigAtomic(filtered.join('\n'));
}
