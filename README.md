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

This creates `~/.gh-persona/` with an empty configuration.

### Add a Profile

```bash
ghem add personal
```

Interactive prompts will ask for:
- Git user.name
- Git user.email
- SSH private key path (default: `~/.ssh/id_ed25519_personal`)
- Auto-switch directories (optional, comma-separated)

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
    path = ~/.gh-persona/gitconfig-work
```

Any Git repository under `~/work/` automatically uses the work profile's name, email, and SSH key. No shell hooks, no manual switching.

### SSH Key Management

SSH keys are copied to `~/.gh-persona/keys/{profile}/` with proper permissions (`0600`). Each profile's gitconfig uses `core.sshCommand` with `-o IdentitiesOnly=yes` to ensure the correct key is used.

### Configuration

All configuration is stored in `~/.gh-persona/`:

```text
~/.gh-persona/
├── config.json              # Profile definitions
├── keys/
│   ├── personal/
│   │   ├── id_ed25519_personal
│   │   └── id_ed25519_personal.pub
│   └── work/
│       ├── id_ed25519_work
│       └── id_ed25519_work.pub
├── gitconfig-personal       # Generated per-profile gitconfig
└── gitconfig-work
```

---

## Commands

| Command | Description |
|---------|-------------|
| `ghem init` | Create `~/.gh-persona/` directory and initial config |
| `ghem add <profile>` | Add a new profile via interactive prompts |
| `ghem switch <profile>` | Switch global Git profile and SSH key |
| `ghem list` | Show all registered profiles |

Both `ghem` and `git-env-manager` work as CLI commands.

---

## SSH Key Setup

Before adding a profile, generate SSH keys for each account:

```bash
# Personal
ssh-keygen -t ed25519 -C "your-personal@email.com" -f ~/.ssh/id_ed25519_personal

# Work
ssh-keygen -t ed25519 -C "your-work@email.com" -f ~/.ssh/id_ed25519_work
```

Then register the public keys on each GitHub/GitLab account. When you run `ghem add`, the tool copies the keys into its managed directory.

---

## Safety

- **Atomic writes**: `~/.gitconfig` is written to a temp file first, then renamed (POSIX-atomic)
- **Backup**: Modifying `~/.gitconfig` creates a timestamped backup in `~/.gh-persona/`
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
