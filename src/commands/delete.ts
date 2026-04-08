import type { Command } from 'commander';
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { confirm } from '@inquirer/prompts';
import { readConfig, writeConfig, getProfile, removeProfile, PersonaError } from '../core/config.js';
import { removeIncludeIf } from '../core/gitconfig.js';
import { KEYS_DIR, PERSONA_DIR } from '../core/paths.js';
import { t } from '../i18n/index.js';
import * as logger from '../utils/logger.js';

export function registerDeleteCommand(program: Command): void {
  program
    .command('delete <profile>')
    .description('Delete a profile and its associated keys')
    .action(async (profileName: string) => {
      try {
        const config = readConfig();
        const profile = getProfile(config, profileName);

        if (!profile) {
          logger.error(t().profileNotFound(profileName));
          process.exit(1);
        }

        if (config.activeProfile === profileName) {
          logger.warn(t().deleteActiveWarning(profileName));
        }

        const confirmed = await confirm({
          message: t().deleteConfirm(profileName),
          default: false,
        });

        if (!confirmed) {
          logger.info(t().deleteCancelled);
          return;
        }

        // Remove includeIf entries from ~/.gitconfig
        removeIncludeIf(profileName);

        // Delete keys directory
        const keysDir = join(KEYS_DIR, profileName);
        if (existsSync(keysDir)) {
          rmSync(keysDir, { recursive: true, force: true });
        }

        // Delete per-profile gitconfig
        const profileGitconfig = join(PERSONA_DIR, `gitconfig-${profileName}`);
        if (existsSync(profileGitconfig)) {
          rmSync(profileGitconfig);
        }

        // Update config
        const updated = removeProfile(config, profileName);
        writeConfig(updated);

        logger.success(t().deleteSuccess(profileName));
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
