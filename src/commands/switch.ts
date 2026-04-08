import type { Command } from 'commander';
import { execSync } from 'node:child_process';
import { readConfig, writeConfig, getProfile, PersonaError } from '../core/config.js';
import { KEYS_DIR } from '../core/paths.js';
import { join } from 'node:path';
import * as logger from '../utils/logger.js';
import { MESSAGES } from '../utils/messages.js';

export function registerSwitchCommand(program: Command): void {
  program
    .command('switch <profile>')
    .description('전역 기본 프로필을 변경합니다')
    .action(async (profileName: string) => {
      try {
        const config = readConfig();
        const profile = getProfile(config, profileName);

        if (!profile) {
          logger.error(MESSAGES.profileNotFound(profileName));
          process.exit(1);
        }

        // Set global git config
        execSync(`git config --global user.name "${profile.gitUserName}"`, { stdio: 'pipe' });
        execSync(`git config --global user.email "${profile.gitUserEmail}"`, { stdio: 'pipe' });

        // Switch SSH key
        const keyPath = join(KEYS_DIR, profile.name, profile.sshKeyPath);
        try {
          execSync('ssh-add -D', { stdio: 'pipe' });
          execSync(`ssh-add "${keyPath}"`, { stdio: 'pipe' });
        } catch {
          logger.warn('SSH 에이전트 키 전환에 실패했습니다. SSH 에이전트가 실행 중인지 확인하세요.');
        }

        // Update active profile
        const updated = { ...config, activeProfile: profileName };
        writeConfig(updated);

        logger.success(MESSAGES.profileSwitched(profileName));
        logger.info(`  이름: ${profile.gitUserName}`);
        logger.info(`  이메일: ${profile.gitUserEmail}`);
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
