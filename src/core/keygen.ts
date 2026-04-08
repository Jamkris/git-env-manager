import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { PersonaError } from './config.js';
import { t } from '../i18n/index.js';

export interface KeygenResult {
  privatePath: string;
  publicPath: string;
}

export function generateSshKey(email: string, profileName: string): KeygenResult {
  const sshDir = join(homedir(), '.ssh');
  const keyName = `id_ghem_${profileName}`;
  const privatePath = join(sshDir, keyName);
  const publicPath = privatePath + '.pub';

  if (existsSync(privatePath)) {
    throw new PersonaError(
      t().sshKeyAlreadyExists(privatePath),
      'SSH_KEY_EXISTS',
    );
  }

  if (!existsSync(sshDir)) {
    mkdirSync(sshDir, { recursive: true, mode: 0o700 });
  }

  const result = spawnSync('ssh-keygen', ['-t', 'ed25519', '-C', email, '-f', privatePath, '-N', ''], {
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    throw new PersonaError(
      t().sshKeygenFailed,
      'SSH_KEYGEN_FAILED',
    );
  }

  return { privatePath, publicPath };
}
