import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { readConfig, getProfile, PersonaError } from '../core/config.js';
import { findMatchingProfile } from '../core/profile-match.js';
import { t } from '../i18n/index.js';
import * as logger from '../utils/logger.js';

function getGitConfig(key: string): string {
  const result = spawnSync('git', ['config', key], { stdio: 'pipe' });
  return result.stdout?.toString().trim() ?? '';
}

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show current profile context for the working directory')
    .action(async () => {
      try {
        const config = readConfig();
        const cwd = process.cwd();
        const matched = findMatchingProfile(cwd, config.profiles);
        const gitName = getGitConfig('user.name');
        const gitEmail = getGitConfig('user.email');

        console.log('');
        console.log(`  ${t().statusDirectory} ${cwd}`);

        if (matched) {
          console.log(`  ${t().statusProfile} ${matched.name} ${t().statusAutoSwitch}`);
          console.log(`  ${t().statusName} ${matched.gitUserName}`);
          console.log(`  ${t().statusEmail} ${matched.gitUserEmail}`);
          console.log(`  ${t().statusSshKey} ~/.git-env-manager/keys/${matched.name}/${matched.sshKeyPath}`);
        } else if (config.activeProfile) {
          const active = getProfile(config, config.activeProfile);
          if (active) {
            console.log(`  ${t().statusProfile} ${active.name} ${t().statusActiveNoMatch}`);
            console.log(`  ${t().statusName} ${active.gitUserName}`);
            console.log(`  ${t().statusEmail} ${active.gitUserEmail}`);
            console.log(`  ${t().statusSshKey} ~/.git-env-manager/keys/${active.name}/${active.sshKeyPath}`);
          }
        } else {
          logger.info(t().statusNoActiveProfile);
        }

        if (gitName || gitEmail) {
          console.log('');
          console.log(`  ${t().statusGitConfig} ${gitName} <${gitEmail}>`);
        }

        console.log('');
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
