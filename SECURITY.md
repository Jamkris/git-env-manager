# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in git-env-manager, **please do not open a public issue**.

### How to Report

1. Go to [GitHub Security Advisories](https://github.com/Jamkris/git-env-manager/security/advisories/new)
2. Click **"New draft security advisory"**
3. Provide:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix release**: Depends on severity, prioritized as follows:
  - **Critical** (key exposure, arbitrary code execution): Patch release ASAP
  - **High** (privilege escalation, data leakage): Patch within 1 week
  - **Medium/Low**: Included in next regular release

## Security Considerations

git-env-manager handles sensitive data including SSH private keys and Git configurations. The following security measures are enforced:

### SSH Key Handling

- Private keys are stored with `0600` permissions (owner read/write only)
- Keys are copied to `~/.git-env-manager/keys/{profile}/` with restricted permissions
- `core.sshCommand` uses `-o IdentitiesOnly=yes` to prevent key leakage across profiles
- Private key contents are never logged or displayed to the user

### Git Configuration

- `~/.gitconfig` modifications use **atomic writes** (write to temp file, then rename)
- A timestamped backup is created before `~/.gitconfig` modification when directory-based auto-switching is configured
- Existing gitconfig entries (LFS, difftool, mergetool, etc.) are never removed

### General Practices

- No secrets or credentials are stored in the codebase
- All user input is validated before processing
- Error messages do not expose sensitive file contents or internal paths

## Scope

The following are **in scope** for security reports:

- SSH private key exposure or permission issues
- Arbitrary file read/write via crafted profile names
- Command injection through user-provided input
- Unintended modification or deletion of `~/.gitconfig` entries
- Backup file permission issues

The following are **out of scope**:

- Vulnerabilities in upstream dependencies (report to the respective project)
- Issues requiring physical access to the machine
- Social engineering attacks
