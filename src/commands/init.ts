import type { Command } from 'commander';
import { existsSync, mkdirSync } from 'node:fs';
import { confirm } from '@inquirer/prompts';
import { PERSONA_DIR, KEYS_DIR } from '../core/paths.js';
import { configExists, writeDefaultConfig, readConfig } from '../core/config.js';
import { isValidLocale, setLocale, t } from '../i18n/index.js';
import * as logger from '../utils/logger.js';

function ensureDirectories(): void {
  if (!existsSync(PERSONA_DIR)) {
    mkdirSync(PERSONA_DIR, { recursive: true });
  }
  if (!existsSync(KEYS_DIR)) {
    mkdirSync(KEYS_DIR, { recursive: true });
  }
}

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Create ~/.git-env-manager directory and initial config')
    .option('--lang <locale>', 'Set language (en, ko)', 'en')
    .action(async (opts: { lang: string }) => {
      if (!isValidLocale(opts.lang)) {
        logger.error(t().langInvalid(opts.lang));
        process.exit(1);
      }

      const locale = opts.lang;

      if (configExists()) {
        const existing = readConfig();
        const effectiveLocale = program.getOptionValueSource?.('lang') === 'default'
          ? existing.locale
          : locale;
        setLocale(effectiveLocale);

        const overwrite = await confirm({
          message: t().initAlreadyExists,
          default: false,
        });

        if (!overwrite) {
          logger.info(t().initSkipped);
          return;
        }

        ensureDirectories();
        writeDefaultConfig(effectiveLocale);
        setLocale(effectiveLocale);
        logger.success(t().initSuccess);
        return;
      }

      setLocale(locale);
      ensureDirectories();
      writeDefaultConfig(locale);
      logger.success(t().initSuccess);
    });
}
