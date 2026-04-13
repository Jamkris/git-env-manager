import type { Command } from 'commander';
import { readConfig, writeConfig, PersonaError } from '../core/config.js';
import { isValidLocale, setLocale, t } from '../i18n/index.js';
import * as logger from '../utils/logger.js';

export function registerConfigCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('Manage ghem configuration');

  configCmd
    .command('set-lang <locale>')
    .description('Set display language (en, ko)')
    .action(async (locale: string) => {
      try {
        if (!isValidLocale(locale)) {
          logger.error(t().langInvalid(locale));
          process.exit(1);
        }

        const config = readConfig();
        const updated = { ...config, locale };
        writeConfig(updated);
        setLocale(locale);
        logger.success(t().langUpdated(locale));
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });

  configCmd
    .command('set-prompt <on|off>')
    .description('Enable or disable shell prompt indicator (on, off)')
    .action(async (value: string) => {
      try {
        if (value !== 'on' && value !== 'off') {
          logger.error(t().promptInvalid(value));
          process.exit(1);
        }

        const config = readConfig();
        const enabled = value === 'on';
        const updated = { ...config, promptIndicator: enabled };
        writeConfig(updated);
        logger.success(t().promptUpdated(value));
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
