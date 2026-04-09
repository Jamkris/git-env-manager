import type { Messages } from '../types.js';

export const en: Messages = {
  // Init
  initSuccess: '~/.git-env-manager/ directory has been created.',
  initAlreadyExists: 'Already initialized. Do you want to overwrite?',
  initSkipped: 'Initialization skipped.',

  // Profile
  profileAdded: (name) => `Profile '${name}' has been added.`,
  profileExists: (name) => `Profile '${name}' already exists.`,
  profileNotFound: (name) => `Profile '${name}' not found.`,
  profileSwitched: (name) => `Switched to profile '${name}'.`,
  profileList: 'Registered profiles:',
  profileEmpty: 'No profiles registered. Add one with `ghem add <name>`.',

  // Config
  configNotFound: 'config.json not found. Run `ghem init` first.',
  configInvalid: 'config.json format is invalid.',

  // SSH
  sshKeyNotFound: (path) => `SSH key not found: ${path}`,
  sshKeyCopied: (dest) => `SSH key copied: ${dest}`,
  sshKeyPrompt: 'SSH private key path:',
  sshAgentFailed: 'Failed to switch SSH agent key. Make sure ssh-agent is running.',
  sshKeyChoice: 'SSH key setup:',
  sshKeyChoiceGenerate: 'Generate new SSH key (recommended)',
  sshKeyChoiceExisting: 'Use existing key',
  sshKeyGenerated: (pubPath) => `SSH key generated. Public key: ${pubPath}`,
  sshKeyAlreadyExists: (path) => `SSH key already exists at: ${path}`,
  sshKeyAddToRemote: 'Add the public key above to your GitHub/GitLab account.',
  sshKeygenFailed: 'Failed to generate SSH key. Please generate manually and use "Use existing key".',

  // Gitconfig
  gitconfigBackup: (path) => `Existing .gitconfig backed up: ${path}`,
  gitconfigUpdated: 'includeIf config added to ~/.gitconfig.',

  // Add command prompts
  gitUserNamePrompt: 'Git user.name:',
  gitUserEmailPrompt: 'Git user.email:',
  directoriesPrompt: 'Auto-switch directories (comma-separated, optional):',

  // Switch command
  switchedName: (name) => `  Name: ${name}`,
  switchedEmail: (email) => `  Email: ${email}`,

  // List command
  noDirectories: '(none)',

  // Delete command
  deleteConfirm: (name) => `Are you sure you want to delete profile '${name}'?`,
  deleteSuccess: (name) => `Profile '${name}' has been deleted.`,
  deleteCancelled: 'Deletion cancelled.',
  deleteActiveWarning: (name) => `Profile '${name}' is currently active. It will be deactivated.`,

  // Config command
  langUpdated: (locale) => `Language changed to '${locale}'.`,
  langInvalid: (locale) => `Invalid language '${locale}'. Supported: en, ko`,

  // Completion
  completionInstalled: (rcFile) => `Shell completion installed in ${rcFile}. Restart your terminal to activate.`,
  completionAlreadyInstalled: 'Shell completion is already installed.',
  completionFailed: (rcFile) => `Failed to install shell completion in ${rcFile}. You can add it manually: eval "$(ghem completion)"`,
  completionUnsupported: 'Shell not recognized. Run `ghem completion --shell bash` or `ghem completion --shell zsh` to get the completion script manually.',

  // General
  unexpectedError: 'An unexpected error occurred.',
};
