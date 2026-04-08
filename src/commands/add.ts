import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { readConfig, writeConfig, getProfile, addProfile, PersonaError } from '../core/config.js';
import { copyKeyPair } from '../core/ssh.js';
import { generateProfileGitconfig, addIncludeIf, backupGitconfig } from '../core/gitconfig.js';
import { toTildePath } from '../core/paths.js';
import * as logger from '../utils/logger.js';
import { MESSAGES } from '../utils/messages.js';

export function registerAddCommand(program: Command): void {
  program
    .command('add <profile>')
    .description('새 프로필을 대화형 프롬프트로 추가합니다')
    .action(async (profileName: string) => {
      try {
        const config = readConfig();

        if (getProfile(config, profileName)) {
          logger.error(MESSAGES.profileExists(profileName));
          process.exit(1);
        }

        const gitUserName = await input({
          message: 'Git user.name:',
        });

        const gitUserEmail = await input({
          message: 'Git user.email:',
        });

        const sshKeySource = await input({
          message: 'SSH 개인키 경로:',
          default: `~/.ssh/id_ed25519_${profileName}`,
        });

        const directoriesRaw = await input({
          message: '자동 전환 디렉토리 (콤마 구분, 선택사항):',
          default: '',
        });

        const directories = directoriesRaw
          .split(',')
          .map((d) => d.trim())
          .filter((d) => d.length > 0);

        // SSH key copy
        const keyFileName = sshKeySource.split('/').pop()!;
        copyKeyPair(sshKeySource, profileName);
        logger.success(MESSAGES.sshKeyCopied(`~/.gh-persona/keys/${profileName}/`));

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
            logger.info(MESSAGES.gitconfigBackup(toTildePath(backupPath)));
          }

          for (const dir of directories) {
            addIncludeIf(dir, profileName);
          }
          logger.success(MESSAGES.gitconfigUpdated);
        }

        // Save config
        const updated = addProfile(config, profile);
        writeConfig(updated);
        logger.success(MESSAGES.profileAdded(profileName));
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
