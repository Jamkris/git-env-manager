import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { readConfig, writeConfig, getProfile, PersonaError } from '../core/config.js';
import { KEYS_DIR } from '../core/paths.js';
import { join } from 'node:path';
import { t } from '../i18n/index.js';
import * as logger from '../utils/logger.js';

export function registerSwitchCommand(program: Command): void {
  program
    .command('switch <profile>')
    .description('Switch global Git profile and SSH key')
    .action(async (profileName: string) => {
      try {
        const config = readConfig();
        const profile = getProfile(config, profileName);

        if (!profile) {
          logger.error(t().profileNotFound(profileName));
          process.exit(1);
        }

        // Set global git config
        spawnSync('git', ['config', '--global', 'user.name', profile.gitUserName], { stdio: 'pipe' });
        spawnSync('git', ['config', '--global', 'user.email', profile.gitUserEmail], { stdio: 'pipe' });

        // Switch SSH key
        const keyPath = join(KEYS_DIR, profile.name, profile.sshKeyPath);
        const removeResult = spawnSync('ssh-add', ['-D'], { stdio: 'pipe' });
        const addResult = spawnSync('ssh-add', [keyPath], { stdio: 'pipe' });

        if (removeResult.status !== 0 || addResult.status !== 0) {
          logger.warn(t().sshAgentFailed);
        }

        // Update active profile
        const updated = { ...config, activeProfile: profileName };
        writeConfig(updated);

        logger.success(t().profileSwitched(profileName));
        logger.info(t().switchedName(profile.gitUserName));
        logger.info(t().switchedEmail(profile.gitUserEmail));
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
