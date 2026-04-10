**언어:** [English](../../CONTRIBUTING.md) | **한국어**

# git-env-manager 기여 가이드

git-env-manager에 관심을 가져주셔서 감사합니다! 이 가이드는 프로젝트에 기여하는 방법을 안내합니다.

## 행동 강령

이 프로젝트에 참여함으로써 [행동 강령](../../CODE_OF_CONDUCT.md)을 준수하는 데 동의하게 됩니다.

## 시작하기

### 사전 요구사항

- Node.js >= 20
- Git >= 2.13
- macOS 또는 Linux

### 환경 설정

```bash
# 저장소를 포크한 후 클론
git clone https://github.com/<your-username>/git-env-manager.git
cd git-env-manager

# 의존성 설치
npm install

# 프로젝트 빌드
npm run build

# 테스트 실행
npm run test:run
```

### 개발 모드

```bash
# 감시 모드 (변경 시 자동 리빌드)
npm run dev

# 타입 검사
npm run lint

# 감시 모드로 테스트 실행
npm test
```

## 프로젝트 구조

```text
src/
├── commands/       # CLI 명령어 핸들러 (add, switch, delete 등)
├── core/           # 핵심 로직 (SSH, keygen, gitconfig, config)
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 (logger, update-check)
└── i18n/           # 국제화 (en, ko)
    └── locales/    # 언어 파일
tests/              # src/ 구조를 반영하는 테스트 모음
scripts/            # 빌드 및 릴리스 스크립트
docs/               # 문서 (영어 + 한국어)
```

## 기여 방법

### 버그 리포트

1. 먼저 [기존 이슈](https://github.com/Jamkris/git-env-manager/issues)를 확인하세요.
2. 새 이슈를 열 때 다음을 포함해 주세요:
   - 재현 단계
   - 예상 동작 vs 실제 동작
   - Node.js 버전 및 OS

### 기능 제안

`enhancement` 라벨로 이슈를 열어 다음을 설명해 주세요:
- 해결하려는 문제
- 제안하는 해결 방법
- 고려한 대안

### 변경사항 제출

1. 저장소를 포크하고 `main`에서 브랜치를 생성합니다:
   ```bash
   git checkout -b feat/your-feature
   ```
2. 아래 가이드라인에 따라 변경사항을 작성합니다.
3. 변경사항에 대한 테스트를 추가하거나 업데이트합니다.
4. 모든 검사가 통과하는지 확인합니다:
   ```bash
   npm run lint && npm run test:run
   ```
5. [커밋 메시지 규칙](#커밋-메시지)에 따라 커밋합니다.
6. 푸시하고 `main`을 대상으로 Pull Request를 엽니다.

## 개발 가이드라인

### 코드 스타일

- **TypeScript strict 모드** — `any` 타입 사용 금지
- **ESM 전용** — 빌트인 모듈에 `node:` 접두사 사용 (예: `node:fs`, `node:path`)
- **불변 패턴** — 기존 객체를 변경하지 않고 새 객체를 생성
- **작은 파일 유지** — 가능한 한 400줄 이하로 유지
- **에러 처리** — 사용자 대상 에러에는 `PersonaError` 사용

### 테스트

테스트 프레임워크로 [Vitest](https://vitest.dev/)를 사용합니다.

- 모든 새 기능과 버그 수정에 테스트를 작성하세요
- `tests/` 디렉토리에 `src/` 구조를 반영하여 배치하세요
- 테스트 커버리지 80% 이상을 목표로 하세요
- 테스트 실행: `npm run test:run`

### 국제화 (i18n)

모든 사용자 대상 메시지는 i18n 시스템을 통해 처리해야 합니다.

- 명령어 핸들러에 사용자에게 보이는 문자열을 **직접 하드코딩하지 마세요**
- 새 메시지는 양쪽 로케일 파일에 추가하세요:
  - `src/i18n/locales/en.ts` (영어)
  - `src/i18n/locales/ko.ts` (한국어)
- `--help`의 명령어 설명은 영어로 유지합니다

### 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다:

```text
<type>: <description>
```

| 타입       | 사용 시기                     |
|------------|-------------------------------|
| `feat`     | 새로운 기능                   |
| `fix`      | 버그 수정                     |
| `docs`     | 문서 변경                     |
| `test`     | 테스트 추가 또는 업데이트     |
| `refactor` | 코드 변경 (기능/수정 아님)    |
| `chore`    | 빌드, 도구, 의존성            |
| `perf`     | 성능 개선                     |
| `ci`       | CI/CD 설정                    |

### Pull Request

- PR은 하나의 기능 또는 수정에 집중하세요
- 무엇을 왜 변경했는지 명확하게 설명하세요
- 새 명령어를 추가하거나 동작을 변경할 경우 문서를 업데이트하세요
- 영어 (`README.md`)와 한국어 (`docs/ko-KR/README.md`) 문서를 모두 업데이트하세요
- 모든 CI 검사를 통과해야 머지할 수 있습니다

## 보안

보안 취약점을 발견한 경우 **공개 이슈를 열지 마세요**. 대신 [GitHub Security Advisories](https://github.com/Jamkris/git-env-manager/security/advisories/new)를 통해 비공개로 보고해 주세요.

이 프로젝트의 주요 보안 고려사항:
- SSH 개인키는 항상 `0600` 권한을 유지해야 합니다
- `~/.gitconfig` 수정 시 원자적 쓰기를 사용합니다
- 개인키 내용을 로그에 남기거나 노출하지 마세요

## 라이선스

기여함으로써 귀하의 기여가 [MIT 라이선스](../../LICENSE)로 라이선스됨에 동의합니다.
