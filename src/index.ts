import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerAddCommand } from './commands/add.js';
import { registerSwitchCommand } from './commands/switch.js';
import { registerListCommand } from './commands/list.js';
import { registerDeleteCommand } from './commands/delete.js';
import { registerConfigCommand } from './commands/config.js';
import { registerCompletionCommand } from './commands/completion.js';
import { t } from './i18n/index.js';
import { configExists, readConfig } from './core/config.js';
import * as logger from './utils/logger.js';

// Hydrate locale from config before command registration
try {
  if (configExists()) {
    readConfig();
  }
} catch {
  // Keep default locale if config is unreadable
}

const program = new Command();

program
  .name('ghem')
  .description('A CLI tool for managing multiple Git profiles and SSH keys')
  .version('1.2.1');

registerInitCommand(program);
registerAddCommand(program);
registerSwitchCommand(program);
registerListCommand(program);
registerDeleteCommand(program);
registerConfigCommand(program);
registerCompletionCommand(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  logger.error(t().unexpectedError);
  if (err instanceof Error) {
    console.error(err.message);
  }
  process.exit(1);
});
