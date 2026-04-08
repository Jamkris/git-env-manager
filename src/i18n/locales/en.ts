import type { Messages } from '../types.js';

export const en: Messages = {
  // Init
  initSuccess: '~/.gh-persona/ directory has been created.',
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

  // Gitconfig
  gitconfigBackup: (path) => `Existing .gitconfig backed up: ${path}`,
  gitconfigUpdated: 'includeIf config added to ~/.gitconfig.',

  // Add command prompts
  directoriesPrompt: 'Auto-switch directories (comma-separated, optional):',

  // Switch command
  switchedName: (name) => `  Name: ${name}`,
  switchedEmail: (email) => `  Email: ${email}`,

  // List command
  noDirectories: '(none)',

  // Config command
  langUpdated: (locale) => `Language changed to '${locale}'.`,
  langInvalid: (locale) => `Invalid language '${locale}'. Supported: en, ko`,

  // General
  unexpectedError: 'An unexpected error occurred.',
};
