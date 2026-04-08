**Language:** **English** | [한국어](docs/ko-KR/README.md)

# git-env-manager

[![CI](https://github.com/Jamkris/git-env-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/Jamkris/git-env-manager/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/git-env-manager)](https://www.npmjs.com/package/git-env-manager)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A CLI tool for managing multiple Git profiles and SSH keys.**

Stop manually switching `git config` and `ssh-add` between your personal and work accounts. git-env-manager centralizes profile management with automatic directory-based switching via Git's native `includeIf`.

---

## Quick Start

### Install

```bash
npm install -g git-env-manager
```

### Initialize

```bash
ghem init
```

This creates `~/.git-env-manager/` with an empty configuration. Default language is English.

To initialize with Korean:

```bash
ghem init --lang ko
```

### Add a Profile

```bash
ghem add personal
```

Interactive prompts will ask for:
- Git user.name
- Git user.email
- SSH key setup: **Generate new key** (recommended) or use an existing key
- Auto-switch directories (optional, comma-separated)

When you choose "Generate new key", `ghem` automatically runs `ssh-keygen` and displays the public key so you can add it to GitHub/GitLab.

### Switch Profile (Manual)

```bash
ghem switch work
```

Sets the global `git config` and loads the SSH key into the agent.

### List Profiles

```bash
ghem list
```

Displays all registered profiles with their emails and mapped directories.

---

## How It Works

### Directory-Based Auto-Switching

When you add a profile with directories (e.g., `~/work/`), git-env-manager injects `includeIf` entries into your `~/.gitconfig`:

```ini
[includeIf "gitdir:~/work/"]
    path = ~/.git-env-manager/gitconfig-work
```

Any Git repository under `~/work/` automatically uses the work profile's name, email, and SSH key. No shell hooks, no manual switching.

### SSH Key Management

SSH keys are copied to `~/.git-env-manager/keys/{profile}/` with proper permissions (`0600`). Each profile's gitconfig uses `core.sshCommand` with `-o IdentitiesOnly=yes` to ensure the correct key is used.

### Configuration

All configuration is stored in `~/.git-env-manager/`:

```text
~/.git-env-manager/
├── config.json              # Profile definitions
├── keys/
│   ├── personal/
│   │   ├── id_ghem_personal
│   │   └── id_ghem_personal.pub
│   └── work/
│       ├── id_ghem_work
│       └── id_ghem_work.pub
├── gitconfig-personal       # Generated per-profile gitconfig
└── gitconfig-work
```

---

## Commands

| Command | Description |
|---------|-------------|
| `ghem init [--lang <locale>]` | Create `~/.git-env-manager/` directory and initial config |
| `ghem add <profile>` | Add a new profile via interactive prompts |
| `ghem switch <profile>` | Switch global Git profile and SSH key |
| `ghem delete <profile>` | Delete a profile and its associated keys |
| `ghem list` | Show all registered profiles |
| `ghem config set-lang <locale>` | Set display language (en, ko) |
| `ghem completion` | Output shell completion script |

Both `ghem` and `git-env-manager` work as CLI commands.

---

## SSH Key Setup

`ghem add` can **auto-generate** SSH keys for you. Just select "Generate new ed25519 key" during the interactive prompt.

If you prefer to generate keys manually:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ghem_personal
```

Then register the public key on your GitHub/GitLab account. When you run `ghem add` and choose "Use existing key", point to your key path.

---

## Language

git-env-manager supports English (`en`) and Korean (`ko`). Default is English.

Set language during initialization:

```bash
ghem init --lang ko
```

Or change it later:

```bash
ghem config set-lang ko
```

All prompts, messages, and errors will be displayed in the selected language. Command descriptions in `--help` remain in English.

---

## Shell Completion

### Bash

```bash
echo 'eval "$(ghem completion --shell bash)"' >> ~/.bashrc
```

### Zsh

```bash
echo 'eval "$(ghem completion --shell zsh)"' >> ~/.zshrc
```

Tab completion supports command names, profile names for `switch`/`delete`, and language options for `config set-lang`.

---

## Safety

- **Atomic writes**: `~/.gitconfig` is written to a temp file first, then renamed (POSIX-atomic)
- **Backup**: Modifying `~/.gitconfig` creates a timestamped backup in `~/.git-env-manager/`
- **Append-only**: Existing gitconfig entries (LFS, difftool, mergetool, etc.) are never removed
- **Key permissions**: Private keys are set to `0600` on copy

---

## Requirements

- Node.js >= 20
- Git >= 2.13 (for `includeIf` support)
- macOS or Linux

---

## License

MIT
