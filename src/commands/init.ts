import type { Command } from 'commander';
import { existsSync, mkdirSync } from 'node:fs';
import { confirm } from '@inquirer/prompts';
import { PERSONA_DIR, KEYS_DIR } from '../core/paths.js';
import { configExists, writeDefaultConfig } from '../core/config.js';
import * as logger from '../utils/logger.js';
import { MESSAGES } from '../utils/messages.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('~/.gh-persona 디렉토리와 초기 설정 파일을 생성합니다')
    .action(async () => {
      if (configExists()) {
        const overwrite = await confirm({
          message: MESSAGES.initAlreadyExists,
          default: false,
        });

        if (!overwrite) {
          logger.info(MESSAGES.initSkipped);
          return;
        }
      }

      if (!existsSync(PERSONA_DIR)) {
        mkdirSync(PERSONA_DIR, { recursive: true });
      }

      if (!existsSync(KEYS_DIR)) {
        mkdirSync(KEYS_DIR, { recursive: true });
      }

      writeDefaultConfig();
      logger.success(MESSAGES.initSuccess);
    });
}
