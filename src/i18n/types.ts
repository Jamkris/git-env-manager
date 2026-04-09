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

  // General
  unexpectedError: string;
}
