import type { Command } from 'commander';
import { readConfig, writeConfig, PersonaError } from '../core/config.js';
import { isValidLocale, setLocale, t } from '../i18n/index.js';
import { installPromptIndicator } from './prompt.js';
import { installCompletion, uninstallCompletion } from './completion.js';
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

        if (enabled) {
          const result = installPromptIndicator();
          switch (result.status) {
            case 'installed':
              logger.success(t().promptInstalled(result.rcFile));
              break;
            case 'already_installed':
              logger.info(t().promptAlreadyInstalled);
              break;
            case 'failed':
              logger.error(t().promptFailed(result.rcFile));
              break;
            case 'unsupported':
              logger.error(t().promptUnsupported);
              break;
          }
        }
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });

  configCmd
    .command('set-completion <on|off>')
    .description('Install or remove shell completion (on, off)')
    .action((value: string) => {
      try {
        if (value !== 'on' && value !== 'off') {
          logger.error(t().completionInvalid(value));
          process.exit(1);
        }

        if (value === 'on') {
          const result = installCompletion();
          switch (result.status) {
            case 'installed':
              logger.success(t().completionInstalled(result.rcFile));
              break;
            case 'already_installed':
              logger.info(t().completionAlreadyInstalled);
              break;
            case 'failed':
              logger.error(t().completionFailed(result.rcFile));
              process.exit(1);
            case 'unsupported':
              logger.error(t().completionUnsupported);
              process.exit(1);
          }
        } else {
          const result = uninstallCompletion();
          switch (result.status) {
            case 'uninstalled':
              logger.success(t().completionUninstalled(result.rcFile));
              break;
            case 'not_installed':
              logger.info(t().completionNotInstalled);
              break;
            case 'failed':
              logger.error(t().completionFailed(result.rcFile));
              process.exit(1);
            case 'unsupported':
              logger.error(t().completionUnsupported);
              process.exit(1);
          }
        }
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
