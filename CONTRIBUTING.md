# Contributing to git-env-manager

Thank you for your interest in contributing to git-env-manager! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js >= 20
- Git >= 2.13
- macOS or Linux

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/<your-username>/git-env-manager.git
cd git-env-manager

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm run test:run
```

### Development

```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Type checking
npm run lint

# Run tests in watch mode
npm test
```

## Project Structure

```text
src/
├── commands/       # CLI command handlers (add, switch, delete, etc.)
├── core/           # Core logic (SSH, keygen, gitconfig, config)
├── types/          # TypeScript type definitions
├── utils/          # Utilities (logger, update-check)
└── i18n/           # Internationalization (en, ko)
    └── locales/    # Language files
tests/              # Test suites mirroring src/ structure
scripts/            # Build and release scripts
docs/               # Documentation (English + Korean)
```

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/Jamkris/git-env-manager/issues) first.
2. Open a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Node.js version and OS

### Suggesting Features

Open an issue with the `enhancement` label describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Submitting Changes

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make your changes following the guidelines below.
3. Add or update tests for your changes.
4. Ensure all checks pass:
   ```bash
   npm run lint && npm run test:run
   ```
5. Commit using [conventional commits](#commit-messages).
6. Push and open a Pull Request against `main`.

## Development Guidelines

### Code Style

- **TypeScript strict mode** — no `any` types allowed
- **ESM only** — use `node:` prefix for built-in modules (e.g., `node:fs`, `node:path`)
- **Immutable patterns** — create new objects instead of mutating existing ones
- **Small files** — keep files under 400 lines where practical
- **Error handling** — use `PersonaError` for user-facing errors

### Testing

We use [Vitest](https://vitest.dev/) as our test framework.

- Write tests for all new features and bug fixes
- Place tests in `tests/` mirroring the `src/` structure
- Aim for 80%+ test coverage
- Run tests: `npm run test:run`

### Internationalization (i18n)

All user-facing messages must go through the i18n system.

- **Never hardcode** user-visible strings in command handlers
- Add new messages to both locale files:
  - `src/i18n/locales/en.ts` (English)
  - `src/i18n/locales/ko.ts` (Korean)
- Command `--help` descriptions remain in English

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <description>
```

| Type       | When to Use                   |
|------------|-------------------------------|
| `feat`     | New feature                   |
| `fix`      | Bug fix                       |
| `docs`     | Documentation only            |
| `test`     | Adding or updating tests      |
| `refactor` | Code change (no feature/fix)  |
| `chore`    | Build, tooling, dependencies  |
| `perf`     | Performance improvement       |
| `ci`       | CI/CD configuration           |

### Pull Requests

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what and why
- Update documentation if adding new commands or changing behavior
- Update both English (`README.md`) and Korean (`docs/ko-KR/README.md`) docs when applicable
- All CI checks must pass before merging

## Security

If you discover a security vulnerability, **do not open a public issue**. Instead, please report it privately via [GitHub Security Advisories](https://github.com/Jamkris/git-env-manager/security/advisories/new).

Key security considerations for this project:
- SSH private keys must always have `0600` permissions
- Use atomic writes when modifying `~/.gitconfig`
- Never log or expose private key contents

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
