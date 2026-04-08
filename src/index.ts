import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerAddCommand } from './commands/add.js';
import { registerSwitchCommand } from './commands/switch.js';
import { registerListCommand } from './commands/list.js';
import * as logger from './utils/logger.js';
import { MESSAGES } from './utils/messages.js';

const program = new Command();

program
  .name('gem')
  .description('다중 Git 프로필 및 SSH 키 관리 도구')
  .version('1.0.2');

registerInitCommand(program);
registerAddCommand(program);
registerSwitchCommand(program);
registerListCommand(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  logger.error(MESSAGES.unexpectedError);
  if (err instanceof Error) {
    console.error(err.message);
  }
  process.exit(1);
});
