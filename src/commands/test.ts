import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readConfig, getProfile, PersonaError } from '../core/config.js';
import { KEYS_DIR } from '../core/paths.js';
import { t } from '../i18n/index.js';
import * as logger from '../utils/logger.js';

export function parseAuthResult(stderr: string, exitCode: number): { success: boolean; username: string } {
  // GitHub: exit code 1, stderr contains "Hi username!"
  const githubMatch = stderr.match(/Hi (\S+?)!/);
  if (githubMatch && exitCode === 1) {
    return { success: true, username: githubMatch[1] };
  }

  // GitLab: exit code 0, stderr contains "Welcome to GitLab, @username!"
  const gitlabMatch = stderr.match(/Welcome to GitLab, @(\S+?)!/);
  if (gitlabMatch && exitCode === 0) {
    return { success: true, username: gitlabMatch[1] };
  }

  // Broad fallback: "successfully authenticated"
  if (stderr.toLowerCase().includes('successfully authenticated')) {
    const nameMatch = stderr.match(/Hi (\S+?)!|@(\S+?)!/);
    return { success: true, username: nameMatch?.[1] ?? nameMatch?.[2] ?? 'unknown' };
  }

  return { success: false, username: '' };
}

export function registerTestCommand(program: Command): void {
  program
    .command('test <profile>')
    .description('Test SSH connection for a profile')
    .option('--host <hostname>', 'SSH host to test', 'github.com')
    .action(async (profileName: string, opts: { host: string }) => {
      try {
        const config = readConfig();
        const profile = getProfile(config, profileName);

        if (!profile) {
          logger.error(t().profileNotFound(profileName));
          process.exit(1);
        }

        const keyPath = join(KEYS_DIR, profile.name, profile.sshKeyPath);

        if (!existsSync(keyPath)) {
          logger.error(t().sshKeyNotFound(keyPath));
          process.exit(1);
        }

        logger.info(t().testConnecting(opts.host, profileName));

        const result = spawnSync('ssh', [
          '-T',
          '-i', keyPath,
          '-o', 'IdentitiesOnly=yes',
          '-o', 'BatchMode=yes',
          '-o', 'StrictHostKeyChecking=accept-new',
          `git@${opts.host}`,
        ], { stdio: 'pipe', timeout: 10000 });

        const stderr = result.stderr?.toString() ?? '';
        const exitCode = result.status ?? -1;
        const auth = parseAuthResult(stderr, exitCode);

        if (auth.success) {
          logger.success(t().testSuccess(opts.host, auth.username));
        } else {
          logger.error(t().testFailed(opts.host));
          if (stderr.trim()) {
            console.error(`  ${stderr.trim()}`);
          }
          process.exit(1);
        }
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
