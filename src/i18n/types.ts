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

  // Delete command
  deleteConfirm: (name: string) => string;
  deleteSuccess: (name: string) => string;
  deleteCancelled: string;
  deleteActiveWarning: (name: string) => string;

  // Config command
  langUpdated: (locale: string) => string;
  langInvalid: (locale: string) => string;

  // Completion
  completionInstalled: (rcFile: string) => string;
  completionAlreadyInstalled: string;
  completionFailed: (rcFile: string) => string;
  completionUnsupported: string;

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

  // Edit command
  editNotChanged: string;
  editSuccess: (name: string) => string;
  editCurrentValue: (field: string, value: string) => string;
  editDirectoriesCurrent: (dirs: string) => string;
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

  // General
  unexpectedError: string;
}
