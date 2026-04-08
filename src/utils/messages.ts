export const MESSAGES = {
  initSuccess: '~/.gh-persona/ 디렉토리가 생성되었습니다.',
  initAlreadyExists: '이미 초기화되어 있습니다. 덮어쓰시겠습니까?',
  initSkipped: '초기화를 건너뛰었습니다.',

  profileAdded: (name: string) => `프로필 '${name}'이(가) 추가되었습니다.`,
  profileExists: (name: string) => `프로필 '${name}'이(가) 이미 존재합니다.`,
  profileNotFound: (name: string) => `프로필 '${name}'을(를) 찾을 수 없습니다.`,
  profileSwitched: (name: string) => `프로필이 '${name}'(으)로 전환되었습니다.`,
  profileList: '등록된 프로필 목록:',
  profileEmpty: '등록된 프로필이 없습니다. `gemadd <name>`으로 추가하세요.',

  configNotFound: 'config.json을 찾을 수 없습니다. `geminit`을 먼저 실행하세요.',
  configInvalid: 'config.json 형식이 올바르지 않습니다.',

  sshKeyNotFound: (path: string) => `SSH 키를 찾을 수 없습니다: ${path}`,
  sshKeyCopied: (dest: string) => `SSH 키가 복사되었습니다: ${dest}`,

  gitconfigBackup: (path: string) => `기존 .gitconfig가 백업되었습니다: ${path}`,
  gitconfigUpdated: 'includeIf 설정이 ~/.gitconfig에 추가되었습니다.',

  unexpectedError: '예상치 못한 오류가 발생했습니다.',
} as const;
