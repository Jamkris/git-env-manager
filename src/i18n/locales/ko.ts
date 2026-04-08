import type { Messages } from '../types.js';

export const ko: Messages = {
  // Init
  initSuccess: '~/.git-env-manager/ 디렉토리가 생성되었습니다.',
  initAlreadyExists: '이미 초기화되어 있습니다. 덮어쓰시겠습니까?',
  initSkipped: '초기화를 건너뛰었습니다.',

  // Profile
  profileAdded: (name) => `프로필 '${name}'이(가) 추가되었습니다.`,
  profileExists: (name) => `프로필 '${name}'이(가) 이미 존재합니다.`,
  profileNotFound: (name) => `프로필 '${name}'을(를) 찾을 수 없습니다.`,
  profileSwitched: (name) => `프로필이 '${name}'(으)로 전환되었습니다.`,
  profileList: '등록된 프로필 목록:',
  profileEmpty: '등록된 프로필이 없습니다. `ghem add <name>`으로 추가하세요.',

  // Config
  configNotFound: 'config.json을 찾을 수 없습니다. `ghem init`을 먼저 실행하세요.',
  configInvalid: 'config.json 형식이 올바르지 않습니다.',

  // SSH
  sshKeyNotFound: (path) => `SSH 키를 찾을 수 없습니다: ${path}`,
  sshKeyCopied: (dest) => `SSH 키가 복사되었습니다: ${dest}`,
  sshKeyPrompt: 'SSH 개인키 경로:',
  sshAgentFailed: 'SSH 에이전트 키 전환에 실패했습니다. SSH 에이전트가 실행 중인지 확인하세요.',

  // Gitconfig
  gitconfigBackup: (path) => `기존 .gitconfig가 백업되었습니다: ${path}`,
  gitconfigUpdated: 'includeIf 설정이 ~/.gitconfig에 추가되었습니다.',

  // Add command prompts
  directoriesPrompt: '자동 전환 디렉토리 (콤마 구분, 선택사항):',

  // Switch command
  switchedName: (name) => `  이름: ${name}`,
  switchedEmail: (email) => `  이메일: ${email}`,

  // List command
  noDirectories: '(없음)',

  // Config command
  langUpdated: (locale) => `언어가 '${locale}'(으)로 변경되었습니다.`,
  langInvalid: (locale) => `유효하지 않은 언어입니다: '${locale}'. 지원: en, ko`,

  // General
  unexpectedError: '예상치 못한 오류가 발생했습니다.',
};
