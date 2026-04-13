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
  sshKeyChoice: 'SSH 키 설정:',
  sshKeyChoiceGenerate: '새 SSH 키 생성 (권장)',
  sshKeyChoiceExisting: '기존 키 사용',
  sshKeyGenerated: (pubPath) => `SSH 키가 생성되었습니다. 공개키: ${pubPath}`,
  sshKeyAlreadyExists: (path) => `SSH 키가 이미 존재합니다: ${path}`,
  sshKeyAddToRemote: '위 공개키를 GitHub/GitLab 계정에 등록하세요.',
  sshKeygenFailed: 'SSH 키 생성에 실패했습니다. 수동으로 생성 후 "기존 키 사용"을 선택하세요.',

  // Gitconfig
  gitconfigBackup: (path) => `기존 .gitconfig가 백업되었습니다: ${path}`,
  gitconfigUpdated: 'includeIf 설정이 ~/.gitconfig에 추가되었습니다.',

  // Add command prompts
  gitUserNamePrompt: 'Git 사용자 이름:',
  gitUserEmailPrompt: 'Git 이메일:',
  directoriesPrompt: '자동 전환 디렉토리 (콤마 구분, 선택사항):',

  // Switch command
  switchedName: (name) => `  이름: ${name}`,
  switchedEmail: (email) => `  이메일: ${email}`,

  // List command
  noDirectories: '(없음)',
  listSigningBadge: ' [서명]',

  // Delete command
  deleteConfirm: (name) => `프로필 '${name}'을(를) 삭제하시겠습니까?`,
  deleteSuccess: (name) => `프로필 '${name}'이(가) 삭제되었습니다.`,
  deleteCancelled: '삭제가 취소되었습니다.',
  deleteActiveWarning: (name) => `프로필 '${name}'은(는) 현재 활성 상태입니다. 비활성화됩니다.`,

  // Config command
  langUpdated: (locale) => `언어가 '${locale}'(으)로 변경되었습니다.`,
  langInvalid: (locale) => `유효하지 않은 언어입니다: '${locale}'. 지원: en, ko`,
  promptUpdated: (value) => `프롬프트 표시가 '${value}'(으)로 설정되었습니다.`,
  promptInvalid: (value) => `유효하지 않은 값입니다: '${value}'. 사용: on, off`,

  // Completion
  completionInstalled: (rcFile) => `쉘 자동완성이 ${rcFile}에 설치되었습니다. 터미널을 재시작하면 활성화됩니다.`,
  completionAlreadyInstalled: '쉘 자동완성이 이미 설치되어 있습니다.',
  completionFailed: (rcFile) => `${rcFile}에 쉘 자동완성 설치에 실패했습니다. 수동으로 추가하세요: eval "$(ghem completion)"`,
  completionUnsupported: '쉘을 인식할 수 없습니다. `ghem completion --shell bash` 또는 `ghem completion --shell zsh`로 직접 스크립트를 확인하세요.',

  // Status command
  statusDirectory: '디렉토리:',
  statusProfile: '프로필:',
  statusAutoSwitch: '(자동 전환)',
  statusActive: '(활성)',
  statusActiveNoMatch: '(활성, 디렉토리 매칭 없음)',
  statusName: '이름:',
  statusEmail: '이메일:',
  statusSshKey: 'SSH 키:',
  statusNoProfileMatch: '현재 디렉토리와 일치하는 프로필이 없습니다.',
  statusNoActiveProfile: '활성 프로필이 설정되지 않았습니다.',

  // Commit signing
  commitSigningPrompt: 'SSH 커밋 서명을 활성화하시겠습니까? (Git >= 2.34 필요)',
  commitSigningEnabled: 'SSH 커밋 서명이 활성화되었습니다.',
  commitSigningUnsupported: 'SSH 커밋 서명은 Git >= 2.34가 필요합니다. 건너뜁니다.',
  statusCommitSigning: '커밋 서명:',
  statusSigningEnabled: '활성 (SSH)',
  statusSigningDisabled: '비활성',

  // Edit command
  editNotChanged: '변경 사항이 없습니다.',
  editSuccess: (name) => `프로필 '${name}'이(가) 수정되었습니다.`,
  editCurrentValue: (field, value) => `${field} (현재: ${value}):`,
  editDirectoriesCurrent: (dirs) => `자동 전환 디렉토리 (현재: ${dirs}):`,
  editCommitSigningPrompt: (current) => `SSH 커밋 서명 활성화 (현재: ${current})`,
  editSshKeyAction: 'SSH 키 작업:',
  editSshKeyKeep: '현재 키 유지',
  editSshKeyGenerate: '새 SSH 키 생성',
  editSshKeyExisting: '다른 기존 키 사용',

  // Test command
  testConnecting: (host, profile) => `프로필 '${profile}'로 ${host}에 SSH 연결 테스트 중...`,
  testSuccess: (host, username) => `성공! ${host}에 '${username}'(으)로 인증되었습니다.`,
  testFailed: (host) => `${host}에 인증에 실패했습니다.`,

  // Status (detail)
  statusGitConfig: 'Git 설정:',

  // Update check
  updateAvailable: (current, latest) => `새 버전이 있습니다: ${current} → ${latest}`,
  updateCommand: '업데이트: npm update -g git-env-manager',

  // General
  unexpectedError: '예상치 못한 오류가 발생했습니다.',
};
