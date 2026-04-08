import type { Command } from 'commander';
import chalk from 'chalk';
import { readConfig, PersonaError } from '../core/config.js';
import * as logger from '../utils/logger.js';
import { MESSAGES } from '../utils/messages.js';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('등록된 프로필 목록을 출력합니다')
    .action(async () => {
      try {
        const config = readConfig();

        if (config.profiles.length === 0) {
          logger.info(MESSAGES.profileEmpty);
          return;
        }

        logger.info(MESSAGES.profileList);
        console.log('');

        const nameWidth = Math.max(8, ...config.profiles.map((p) => p.name.length)) + 2;
        const emailWidth = Math.max(10, ...config.profiles.map((p) => p.gitUserEmail.length)) + 2;

        // Header
        const header = [
          '  ',
          'Profile'.padEnd(nameWidth),
          'Email'.padEnd(emailWidth),
          'Directories',
        ].join('');
        console.log(chalk.dim(header));
        console.log(chalk.dim('  ' + '─'.repeat(header.length - 2)));

        // Rows
        for (const profile of config.profiles) {
          const isActive = profile.name === config.activeProfile;
          const marker = isActive ? chalk.green('● ') : '  ';
          const name = isActive
            ? chalk.green.bold(profile.name.padEnd(nameWidth))
            : profile.name.padEnd(nameWidth);
          const email = profile.gitUserEmail.padEnd(emailWidth);
          const dirs = profile.directories.length > 0
            ? profile.directories.join(', ')
            : chalk.dim('(없음)');

          console.log(`${marker}${name}${email}${dirs}`);
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
