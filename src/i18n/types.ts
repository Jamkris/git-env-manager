export type Locale = 'en' | 'ko';

export const DEFAULT_LOCALE: Locale = 'en';

export interface Messages {
  // Init
  initSuccess: string;
  initAlreadyExists: string;
  initSkipped: string;

  // Profile
  profileAdded: (name: string) => string;
  profileExists: (name: string) => string;
  profileNotFound: (name: string) => string;
  profileSwitched: (name: string) => string;
  profileList: string;
  profileEmpty: string;

  // Config
  configNotFound: string;
  configInvalid: string;

  // SSH
  sshKeyNotFound: (path: string) => string;
  sshKeyCopied: (dest: string) => string;
  sshKeyPrompt: string;
  sshAgentFailed: string;
  sshKeyChoice: string;
  sshKeyChoiceGenerate: string;
  sshKeyChoiceExisting: string;
  sshKeyGenerated: (pubPath: string) => string;
  sshKeyAlreadyExists: (path: string) => string;
  sshKeyAddToRemote: string;
  sshKeygenFailed: string;

  // Gitconfig
  gitconfigBackup: (path: string) => string;
  gitconfigUpdated: string;

  // Add command prompts
  gitUserNamePrompt: string;
  gitUserEmailPrompt: string;
  directoriesPrompt: string;

  // Switch command
  switchedName: (name: string) => string;
  switchedEmail: (email: string) => string;

  // List command
  noDirectories: string;
  listSigningBadge: string;

  // Delete command
  deleteConfirm: (name: string) => string;
  deleteSuccess: (name: string) => string;
  deleteCancelled: string;
  deleteActiveWarning: (name: string) => string;

  // Config command
  langUpdated: (locale: string) => string;
  langInvalid: (locale: string) => string;
  promptUpdated: (value: string) => string;
  promptInvalid: (value: string) => string;
  promptInstalled: (rcFile: string) => string;
  promptAlreadyInstalled: string;
  promptFailed: (rcFile: string) => string;
  promptUnsupported: string;

  // Completion
  completionInstalled: (rcFile: string) => string;
  completionAlreadyInstalled: string;
  completionFailed: (rcFile: string) => string;
  completionUnsupported: string;
  completionInvalid: (value: string) => string;
  completionUninstalled: (rcFile: string) => string;
  completionNotInstalled: string;

  // Status command
  statusDirectory: string;
  statusProfile: string;
  statusAutoSwitch: string;
  statusActive: string;
  statusActiveNoMatch: string;
  statusName: string;
  statusEmail: string;
  statusSshKey: string;
  statusNoProfileMatch: string;
  statusNoActiveProfile: string;

  // Commit signing
  commitSigningPrompt: string;
  commitSigningEnabled: string;
  commitSigningUnsupported: string;
  statusCommitSigning: string;
  statusSigningEnabled: string;
  statusSigningDisabled: string;

  // Edit command
  editNotChanged: string;
  editSuccess: (name: string) => string;
  editCurrentValue: (field: string, value: string) => string;
  editDirectoriesCurrent: (dirs: string) => string;
  editCommitSigningPrompt: (current: string) => string;
  editSshKeyAction: string;
  editSshKeyKeep: string;
  editSshKeyGenerate: string;
  editSshKeyExisting: string;

  // Test command
  testConnecting: (host: string, profile: string) => string;
  testSuccess: (host: string, username: string) => string;
  testFailed: (host: string) => string;

  // Status (detail)
  statusGitConfig: string;

  // Update check
  updateAvailable: (current: string, latest: string) => string;
  updateCommand: string;

  // General
  unexpectedError: string;
}
