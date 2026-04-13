import type { Command } from 'commander';
import { PersonaError } from '../core/config.js';
import * as logger from '../utils/logger.js';

function detectShell(): string | null {
  const shell = process.env.SHELL ?? '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('bash')) return 'bash';
  if (shell.includes('fish')) return 'fish';
  return null;
}

const AWK_SCRIPT = `
awk -v cwd="$__ghem_cwd" -v home="$HOME" '
  /"promptIndicator"/ && /false/ { disabled = 1; exit }
  /"activeProfile"/ {
    gsub(/.*"activeProfile"[[:space:]]*:[[:space:]]*"/, "")
    gsub(/".*/, "")
    if ($0 != "" && $0 !~ /null/) active = $0
  }
  /"name"[[:space:]]*:/ {
    gsub(/.*"name"[[:space:]]*:[[:space:]]*"/, "")
    gsub(/".*/, "")
    current_name = $0
  }
  /"directories"/ { in_dirs = 1; next }
  in_dirs && /\\]/ { in_dirs = 0; next }
  in_dirs {
    line = $0
    gsub(/.*"/, "", line)
    gsub(/".*/, "", line)
    if (line == "") next
    sub(/^~/, home, line)
    if (line !~ /\\/$/) line = line "/"
    if (index(cwd, line) == 1) { print current_name; exit }
  }
  END { if (!disabled && active != "") print active }
' "$__ghem_config"
`.trim();

function generateBashScript(): string {
  return `# ghem prompt indicator
__ghem_prompt() {
  local __ghem_config="$HOME/.git-env-manager/config.json"
  [[ ! -f "$__ghem_config" ]] && return
  local __ghem_cwd="$PWD/"
  local __ghem_result
  __ghem_result=$(${AWK_SCRIPT})
  [[ -n "$__ghem_result" ]] && printf '[%s] ' "$__ghem_result"
}
`;
}

function generateZshScript(): string {
  return `# ghem prompt indicator
__ghem_prompt() {
  local __ghem_config="$HOME/.git-env-manager/config.json"
  [[ ! -f "$__ghem_config" ]] && return
  local __ghem_cwd="$PWD/"
  local __ghem_result
  __ghem_result=$(${AWK_SCRIPT})
  [[ -n "$__ghem_result" ]] && printf '[%s] ' "$__ghem_result"
}
`;
}

function generateFishScript(): string {
  return `# ghem prompt indicator
function __ghem_prompt
  set -l __ghem_config "$HOME/.git-env-manager/config.json"
  test -f "$__ghem_config"; or return
  set -l __ghem_cwd "$PWD/"
  set -l __ghem_result (${AWK_SCRIPT})
  test -n "$__ghem_result"; and printf '[%s] ' "$__ghem_result"
end
`;
}

function generateScript(shell: string): string {
  switch (shell) {
    case 'fish':
      return generateFishScript();
    case 'zsh':
      return generateZshScript();
    default:
      return generateBashScript();
  }
}

export function registerPromptCommand(program: Command): void {
  program
    .command('prompt')
    .description('Output shell prompt indicator script')
    .option('--shell <shell>', 'Shell type (bash, zsh, fish)')
    .action((opts: { shell?: string }) => {
      try {
        const shell = opts.shell ?? detectShell() ?? 'bash';
        process.stdout.write(generateScript(shell));
      } catch (err) {
        if (err instanceof PersonaError) {
          logger.error(err.message);
          process.exit(1);
        }
        throw err;
      }
    });
}
