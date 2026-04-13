import type { Command } from 'commander';
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { PersonaError } from '../core/config.js';
import * as logger from '../utils/logger.js';

function detectShell(): string | null {
  const shell = process.env.SHELL ?? '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('bash')) return 'bash';
  if (shell.includes('fish')) return 'fish';
  return null;
}

function rcFileFor(shell: string): string {
  const home = homedir();
  switch (shell) {
    case 'zsh':
      return join(home, '.zshrc');
    case 'fish':
      return join(home, '.config', 'fish', 'config.fish');
    default:
      return join(home, '.bashrc');
  }
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

const PROMPT_MARKER = '# ghem prompt indicator';

function integrationLines(shell: string): string {
  switch (shell) {
    case 'zsh':
      return `${PROMPT_MARKER}
eval "$(ghem prompt --shell zsh)"
setopt PROMPT_SUBST 2>/dev/null
if [[ "$RPROMPT" != *__ghem_prompt* ]]; then
  RPROMPT='$(__ghem_prompt)'"$RPROMPT"
fi
`;
    case 'fish':
      return `${PROMPT_MARKER}
ghem prompt --shell fish | source
function fish_right_prompt
  __ghem_prompt
end
`;
    default:
      return `${PROMPT_MARKER}
eval "$(ghem prompt --shell bash)"
if [[ "$PS1" != *__ghem_prompt* ]]; then
  PS1='$(__ghem_prompt)'"$PS1"
fi
`;
  }
}

export type PromptInstallResult =
  | { status: 'installed'; shell: string; rcFile: string }
  | { status: 'already_installed'; shell: string; rcFile: string }
  | { status: 'failed'; shell: string; rcFile: string }
  | { status: 'unsupported'; shell: string; rcFile: string };

export function installPromptIndicator(): PromptInstallResult {
  const shell = detectShell();
  if (!shell) {
    return { status: 'unsupported', shell: process.env.SHELL ?? 'unknown', rcFile: '' };
  }
  const rcFile = rcFileFor(shell);
  try {
    if (existsSync(rcFile)) {
      const content = readFileSync(rcFile, 'utf-8');
      if (content.includes(PROMPT_MARKER)) {
        return { status: 'already_installed', shell, rcFile };
      }
    }
    mkdirSync(dirname(rcFile), { recursive: true });
    appendFileSync(rcFile, `\n${integrationLines(shell)}`, 'utf-8');
    return { status: 'installed', shell, rcFile };
  } catch {
    return { status: 'failed', shell, rcFile };
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
