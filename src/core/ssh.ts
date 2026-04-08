import { existsSync, copyFileSync, mkdirSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { KEYS_DIR, resolveHome } from './paths.js';
import { PersonaError } from './config.js';
import { t } from '../i18n/index.js';

export function validateKeyExists(keyPath: string): void {
  const resolved = resolveHome(keyPath);
  if (!existsSync(resolved)) {
    throw new PersonaError(
      t().sshKeyNotFound(keyPath),
      'SSH_KEY_NOT_FOUND',
    );
  }
}

export function copyKeyPair(sourcePath: string, profileName: string): string {
  const resolvedSource = resolveHome(sourcePath);
  validateKeyExists(resolvedSource);

  const keyFileName = sourcePath.split('/').pop()!;
  const destDir = join(KEYS_DIR, profileName);
  const destPrivate = join(destDir, keyFileName);
  const destPublic = destPrivate + '.pub';
  const sourcePublic = resolvedSource + '.pub';

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  copyFileSync(resolvedSource, destPrivate);
  chmodSync(destPrivate, 0o600);

  if (existsSync(sourcePublic)) {
    copyFileSync(sourcePublic, destPublic);
    chmodSync(destPublic, 0o644);
  }

  return destPrivate;
}
