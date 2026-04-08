import type { Locale } from '../i18n/types.js';

export interface Profile {
  name: string;
  gitUserName: string;
  gitUserEmail: string;
  sshKeyPath: string;
  directories: string[];
}

export interface PersonaConfig {
  version: 1;
  locale: Locale;
  activeProfile: string | null;
  profiles: Profile[];
}
