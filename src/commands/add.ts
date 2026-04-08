import type { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { input, select } from '@inquirer/prompts';
import { readConfig, writeConfig, getProfile, addProfile, PersonaError } from '../core/config.js';
import { copyKeyPair } from '../core/ssh.js';
import { generateSshKey } from '../core/keygen.js';
import { generateProfileGitconfig, addIncludeIf, backupGitconfig } from '../core/gitconfig.js';
import { toTildePath } from '../core/paths.js';
import { t } from '../i18n/index.js';
import * as logger from '../utils/logger.js';

export function registerAddCommand(program: Command): void {
  program
    .command('add <profile>')
    .description('Add a new profile via interactive prompts')
    .action(async (profileName: string) => {
      try {
        const config = readConfig();

        if (getProfile(config, profileName)) {
          logger.error(t().profileExists(profileName));
          process.exit(1);
        }

        const gitUserName = await input({
          message: t().gitUserNamePrompt,
        });

        const gitUserEmail = await input({
          message: t().gitUserEmailPrompt,
        });

        // SSH key: generate or use existing
        const sshKeyMethod = await select({
          message: t().sshKeyChoice,
          choices: [
            { value: 'generate', name: t().sshKeyChoiceGenerate },
            { value: 'existing', name: t().sshKeyChoiceExisting },
          ],
        });

        let sshKeySource: string;

        if (sshKeyMethod === 'generate') {
          try {
            const result = generateSshKey(gitUserEmail, profileName);
            sshKeySource = result.privatePath;
            logger.success(t().sshKeyGenerated(result.publicPath));
            const pubContent = readFileSync(result.publicPath, 'utf-8').trim();
            console.log(`\n  ${pubContent}\n`);
            logger.info(t().sshKeyAddToRemote);
          } catch (err) {
            if (err instanceof PersonaError && err.code === 'SSH_KEY_EXISTS') {
              logger.error(err.message);
              process.exit(1);
            }
            logger.error(t().sshKeygenFailed);
            if (err instanceof Error) {
              logger.error(err.message);
            }
            process.exit(1);
          }
        } else {
          sshKeySource = await input({
            message: t().sshKeyPrompt,
            default: `~/.ssh/id_ghem_${profileName}`,
          });
        }

        const directoriesRaw = await input({
          message: t().directoriesPrompt,
          default: '',
        });

        const directories = directoriesRaw
          .split(',')
          .map((d) => d.trim())
          .filter((d) => d.length > 0);

        // SSH key copy
        const keyFileName = sshKeySource.split('/').pop()!;
        copyKeyPair(sshKeySource, profileName);
        logger.success(t().sshKeyCopied(`~/.git-env-manager/keys/${profileName}/`));

        // Build profile
        const profile = {
          name: profileName,
          gitUserName,
          gitUserEmail,
          sshKeyPath: keyFileName,
          directories,
        };

        // Generate profile gitconfig
        generateProfileGitconfig(profile);

        // Add includeIf entries
        if (directories.length > 0) {
          const backupPath = backupGitconfig();
          if (backupPath) {
            logger.info(t().gitconfigBackup(toTildePath(backupPath)));
          }

          for (const dir of directories) {
            addIncludeIf(dir, profileName);
          }
          logger.success(t().gitconfigUpdated);
        }

        // Save config
        const updated = addProfile(config, profile);
        writeConfig(updated);
        logger.success(t().profileAdded(profileName));
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
