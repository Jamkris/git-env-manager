import type { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { input, select } from '@inquirer/prompts';
import { readConfig, writeConfig, getProfile, updateProfile, PersonaError } from '../core/config.js';
import { copyKeyPair } from '../core/ssh.js';
import { generateSshKey } from '../core/keygen.js';
import { generateProfileGitconfig, addIncludeIf, removeIncludeIf, backupGitconfig } from '../core/gitconfig.js';
import { toTildePath } from '../core/paths.js';
import { t } from '../i18n/index.js';
import * as logger from '../utils/logger.js';

export function registerEditCommand(program: Command): void {
  program
    .command('edit <profile>')
    .description('Edit an existing profile')
    .action(async (profileName: string) => {
      try {
        const config = readConfig();
        const profile = getProfile(config, profileName);

        if (!profile) {
          logger.error(t().profileNotFound(profileName));
          process.exit(1);
        }

        const gitUserName = await input({
          message: t().editCurrentValue('user.name', profile.gitUserName),
          default: profile.gitUserName,
        });

        const gitUserEmail = await input({
          message: t().editCurrentValue('user.email', profile.gitUserEmail),
          default: profile.gitUserEmail,
        });

        // SSH key action
        const sshAction = await select({
          message: t().editSshKeyAction,
          choices: [
            { value: 'keep', name: t().editSshKeyKeep },
            { value: 'generate', name: t().editSshKeyGenerate },
            { value: 'existing', name: t().editSshKeyExisting },
          ],
        });

        let sshKeyPath = profile.sshKeyPath;

        if (sshAction === 'generate') {
          try {
            const result = generateSshKey(gitUserEmail, profileName);
            const keyFileName = result.privatePath.split('/').pop() ?? result.privatePath;
            copyKeyPair(result.privatePath, profileName);
            sshKeyPath = keyFileName;
            logger.success(t().sshKeyGenerated(result.publicPath));
            const pubContent = readFileSync(result.publicPath, 'utf-8').trim();
            console.log(`\n  ${pubContent}\n`);
            logger.info(t().sshKeyAddToRemote);
          } catch (err) {
            if (err instanceof PersonaError) {
              logger.error(err.message);
              process.exit(1);
            }
            logger.error(t().sshKeygenFailed);
            if (err instanceof Error) {
              logger.error(err.message);
            }
            process.exit(1);
          }
        } else if (sshAction === 'existing') {
          const sshKeySource = await input({
            message: t().sshKeyPrompt,
            default: `~/.ssh/id_ghem_${profileName}`,
          });
          const keyFileName = sshKeySource.split('/').pop() ?? sshKeySource;
          copyKeyPair(sshKeySource, profileName);
          sshKeyPath = keyFileName;
          logger.success(t().sshKeyCopied(`~/.git-env-manager/keys/${profileName}/`));
        }

        const currentDirs = profile.directories.join(', ');
        const directoriesRaw = await input({
          message: currentDirs
            ? t().editDirectoriesCurrent(currentDirs)
            : t().directoriesPrompt,
          default: currentDirs,
        });

        const directories = directoriesRaw
          .split(',')
          .map((d) => d.trim())
          .filter((d) => d.length > 0);

        // Detect changes
        const unchanged =
          gitUserName === profile.gitUserName &&
          gitUserEmail === profile.gitUserEmail &&
          sshKeyPath === profile.sshKeyPath &&
          directories.join(',') === profile.directories.join(',');

        if (unchanged) {
          logger.info(t().editNotChanged);
          return;
        }

        const updatedProfile = {
          name: profileName,
          gitUserName,
          gitUserEmail,
          sshKeyPath,
          directories,
        };

        // Update includeIf entries
        removeIncludeIf(profileName);
        generateProfileGitconfig(updatedProfile);

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

        const updatedConfig = updateProfile(config, profileName, updatedProfile);
        writeConfig(updatedConfig);
        logger.success(t().editSuccess(profileName));
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
