# Code Review Style Guide

## Project Context

This is **git-env-manager** — a Node.js CLI tool for managing multiple Git profiles and SSH keys.
The codebase consists of:

- **TypeScript source** (`src/`) — ESM modules built with tsup
- **Commands** (`src/commands/`) — CLI commands (init, add, switch, list)
- **Core modules** (`src/core/`) — Config management, gitconfig manipulation, SSH key handling
- **Utilities** (`src/utils/`) — Korean UI messages, chalk-based logger
- **Tests** (`tests/`) — Vitest unit/integration tests
- **GitHub Actions** (`.github/workflows/`) — CI, release, maintenance pipelines
- **Scripts** (`scripts/`) — Release automation

## TypeScript / Node.js

- Target Node.js 20+. Use ESM (`import/export`), not CommonJS.
- Strict TypeScript — no `any`, use `unknown` for external input.
- Prefer `const` over `let`. Never use `var`.
- Use immutable patterns — spread operator for object updates, never mutate in place.
- Functions should be under 50 lines. Files should be under 400 lines.
- Use Vitest for tests. Target 80%+ coverage.
- Use `node:` prefix for built-in modules (`node:fs`, `node:path`, `node:os`).

## Error Handling

- Use typed `PersonaError` with error codes (`CONFIG_NOT_FOUND`, `SSH_KEY_NOT_FOUND`, etc.).
- Commands catch `PersonaError` and display Korean error messages via logger.
- Core modules throw errors; commands handle them.
- Never silently swallow errors.

## File System Safety

- `~/.gitconfig` modifications must use atomic writes (write to temp file, then `fs.renameSync`).
- Always backup `~/.gitconfig` before first modification.
- SSH key copies must set `0o600` permissions on private keys.
- Validate file existence before operations.

## Git includeIf

- Directory paths in `includeIf` must end with `/` (trailing slash required for subdirectory matching).
- Use `~` in gitconfig paths — git expands it natively. Do not resolve to absolute paths.
- `core.sshCommand` must include `-o IdentitiesOnly=yes`.

## UI Messages

- All user-facing messages are in Korean, centralized in `src/utils/messages.ts`.
- Use `src/utils/logger.ts` (chalk wrapper) for consistent colored output.
- No raw `console.log` in command handlers — use logger functions.

## Shell Scripts

- Use `set -e` at the top of all bash scripts.
- Quote all variables: `"$VAR"` not `$VAR`.
- Support macOS (BSD sed) — use `sed -i ''` syntax.

## CI / GitHub Actions

- Pin third-party actions to commit SHA (e.g., `uses: action@<sha> # v2`).
- First-party GitHub actions (`actions/*`) can use version tags (`@v4`).
- Reusable workflows in `.github/workflows/reusable-*.yml` must be called by `ci.yml`.

## What NOT to Flag

- Korean strings in `messages.ts` are intentional — do not suggest English.
- `process.exit(1)` in command handlers is expected CLI behavior — do not flag.
- `execSync` usage in `switch.ts` for `git config` and `ssh-add` is intentional.
