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

  // Gitconfig
  gitconfigBackup: (path: string) => string;
  gitconfigUpdated: string;

  // Add command prompts
  directoriesPrompt: string;

  // Switch command
  switchedName: (name: string) => string;
  switchedEmail: (email: string) => string;

  // List command
  noDirectories: string;

  // Config command
  langUpdated: (locale: string) => string;
  langInvalid: (locale: string) => string;

  // General
  unexpectedError: string;
}
