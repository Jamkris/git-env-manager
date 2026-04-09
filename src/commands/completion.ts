import type { Command } from 'commander';
import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

function detectShell(): string | null {
  const shell = process.env.SHELL ?? '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('bash')) return 'bash';
  return null;
}

function generateBashScript(): string {
  return `# ghem bash completion
_ghem_completions() {
  local cur prev commands
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  commands="init add switch delete list config completion"

  case "\${prev}" in
    switch|delete)
      local profiles
      profiles=$(node -e "
        try {
          const fs = require('fs');
          const os = require('os');
          const path = require('path');
          const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.git-env-manager', 'config.json'), 'utf-8'));
          console.log(config.profiles.map(p => p.name).join(' '));
        } catch {}
      " 2>/dev/null)
      COMPREPLY=($(compgen -W "\${profiles}" -- "\${cur}"))
      return 0
      ;;
    config)
      COMPREPLY=($(compgen -W "set-lang" -- "\${cur}"))
      return 0
      ;;
    set-lang)
      COMPREPLY=($(compgen -W "en ko" -- "\${cur}"))
      return 0
      ;;
    ghem)
      COMPREPLY=($(compgen -W "\${commands}" -- "\${cur}"))
      return 0
      ;;
  esac

  if [ "\${COMP_CWORD}" -eq 1 ]; then
    COMPREPLY=($(compgen -W "\${commands}" -- "\${cur}"))
  fi
}

complete -F _ghem_completions ghem
`;
}

function generateZshScript(): string {
  return `# ghem zsh completion
_ghem_completions() {
  local -a commands profiles
  commands=(
    'init:Create ~/.git-env-manager directory and initial config'
    'add:Add a new profile via interactive prompts'
    'switch:Switch global Git profile and SSH key'
    'delete:Delete a profile and its associated keys'
    'list:Show all registered profiles'
    'config:Manage ghem configuration'
    'completion:Output shell completion script'
  )

  _arguments -C \\
    '1:command:->cmd' \\
    '*::arg:->args'

  case "\$state" in
    cmd)
      _describe 'command' commands
      ;;
    args)
      case "\${words[1]}" in
        switch|delete)
          profiles=(\${(f)"$(node -e "
            try {
              const fs = require('fs');
              const os = require('os');
              const path = require('path');
              const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.git-env-manager', 'config.json'), 'utf-8'));
              config.profiles.forEach(p => console.log(p.name));
            } catch {}
          " 2>/dev/null)"})
          _describe 'profile' profiles
          ;;
        config)
          _describe 'subcommand' '(set-lang:Set display language)'
          ;;
      esac
      ;;
  esac
}

compdef _ghem_completions ghem
`;
}

export function generateCompletionScript(shell: string): string {
  return shell === 'zsh' ? generateZshScript() : generateBashScript();
}

const COMPLETION_MARKER = '# ghem shell completion';

export type InstallResult =
  | { status: 'installed'; shell: string; rcFile: string }
  | { status: 'already_installed'; shell: string; rcFile: string }
  | { status: 'failed'; shell: string; rcFile: string }
  | { status: 'unsupported'; shell: string; rcFile: string };

export function installCompletion(): InstallResult {
  const shell = detectShell();
  if (!shell) {
    return { status: 'unsupported', shell: process.env.SHELL ?? 'unknown', rcFile: '' };
  }
  const rcFile = shell === 'zsh'
    ? join(homedir(), '.zshrc')
    : join(homedir(), '.bashrc');

  try {
    // Skip if already installed
    if (existsSync(rcFile)) {
      const content = readFileSync(rcFile, 'utf-8');
      if (content.includes(COMPLETION_MARKER)) {
        return { status: 'already_installed', shell, rcFile };
      }
    }

    const line = `\n${COMPLETION_MARKER}\neval "$(ghem completion --shell ${shell})"\n`;
    appendFileSync(rcFile, line, 'utf-8');
    return { status: 'installed', shell, rcFile };
  } catch {
    return { status: 'failed', shell, rcFile };
  }
}

export function registerCompletionCommand(program: Command): void {
  program
    .command('completion')
    .description('Output shell completion script')
    .option('--shell <shell>', 'Shell type (bash, zsh)')
    .action((opts: { shell?: string }) => {
      const shell = opts.shell ?? detectShell() ?? 'bash';
      process.stdout.write(generateCompletionScript(shell));
    });
}
