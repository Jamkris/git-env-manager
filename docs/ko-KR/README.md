**언어:** [English](../../README.md) | **한국어**

# git-env-manager

[![CI](https://github.com/Jamkris/git-env-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/Jamkris/git-env-manager/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/git-env-manager)](https://www.npmjs.com/package/git-env-manager)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

**다중 Git 프로필 및 SSH 키를 관리하는 CLI 도구.**

개인 계정과 회사 계정을 전환할 때마다 `git config`와 `ssh-add`를 수동으로 입력하는 번거로움을 해결합니다. git-env-manager는 Git의 네이티브 `includeIf` 기능을 활용하여 디렉토리 기반 자동 전환과 중앙 집중식 프로필 관리를 제공합니다.

---

## 빠른 시작

### 설치

```bash
npm install -g git-env-manager
```

### 초기화

```bash
ghem init
```

`~/.git-env-manager/` 디렉토리와 초기 설정 파일이 생성됩니다. 기본 언어는 영어입니다.

한국어로 초기화하려면:

```bash
ghem init --lang ko
```

### 프로필 추가

```bash
ghem add personal
```

대화형 프롬프트에서 다음을 입력합니다:
- Git user.name
- Git user.email
- SSH 키 설정: **새 키 생성** (권장) 또는 기존 키 사용
- 자동 전환 디렉토리 (선택, 콤마 구분)

"새 키 생성"을 선택하면 `ghem`이 자동으로 `ssh-keygen`을 실행하고 공개키를 표시합니다. 이를 GitHub/GitLab에 등록하세요.

### 프로필 수동 전환

```bash
ghem switch work
```

전역 `git config`를 변경하고 SSH 키를 에이전트에 로드합니다.

### 프로필 목록 확인

```bash
ghem list
```

등록된 프로필의 이름, 이메일, 매핑된 디렉토리를 표 형태로 출력합니다.

---

## 동작 원리

### 디렉토리 기반 자동 전환

프로필 추가 시 디렉토리를 지정하면 (예: `~/work/`), `~/.gitconfig`에 `includeIf` 설정이 자동으로 주입됩니다:

```ini
[includeIf "gitdir:~/work/"]
    path = ~/.git-env-manager/gitconfig-work
```

`~/work/` 하위의 모든 Git 저장소에서 자동으로 해당 프로필의 이름, 이메일, SSH 키가 사용됩니다. 쉘 후킹 없이, 수동 전환 없이 동작합니다.

### SSH 키 관리

SSH 키는 `~/.git-env-manager/keys/{profile}/`에 복사되며 적절한 권한(`0600`)이 설정됩니다. 각 프로필의 gitconfig는 `core.sshCommand`에 `-o IdentitiesOnly=yes`를 포함하여 올바른 키만 사용되도록 보장합니다.

### 설정 구조

모든 설정은 `~/.git-env-manager/`에 저장됩니다:

```text
~/.git-env-manager/
├── config.json              # 프로필 정의
├── keys/
│   ├── personal/
│   │   ├── id_ghem_personal
│   │   └── id_ghem_personal.pub
│   └── work/
│       ├── id_ghem_work
│       └── id_ghem_work.pub
├── gitconfig-personal       # 프로필별 gitconfig (자동 생성)
└── gitconfig-work
```

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `ghem init [--lang <locale>]` | `~/.git-env-manager/` 디렉토리와 초기 설정 파일 생성 |
| `ghem add <profile>` | 대화형 프롬프트로 새 프로필 추가 |
| `ghem switch <profile>` | 전역 Git 프로필 및 SSH 키 전환 |
| `ghem delete <profile>` | 프로필 및 관련 키 삭제 |
| `ghem list` | 등록된 프로필 목록 출력 |
| `ghem config set-lang <locale>` | 표시 언어 설정 (en, ko) |
| `ghem completion` | 쉘 자동완성 스크립트 출력 |
| `ghem status` | 현재 디렉토리의 프로필 컨텍스트 표시 |
| `ghem edit <profile>` | 기존 프로필을 대화형으로 수정 |
| `ghem test <profile> [--host <hostname>]` | 프로필의 SSH 연결 테스트 |

`ghem`과 `git-env-manager` 두 명령어 모두 사용 가능합니다.

---

## SSH 키 설정

`ghem add` 실행 시 SSH 키 설정 방법을 선택합니다:

1. **새 키 생성** (권장) — `~/.ssh/id_ghem_{profile}` 경로에 키 쌍을 자동 생성하고, 공개키를 표시합니다. 이를 GitHub/GitLab에 등록하세요.
2. **기존 키 사용** — 기존 개인키 경로를 입력합니다 (예: `~/.ssh/id_rsa`).

`ghem add` 실행 전에 수동으로 키를 생성하려면:

```bash
ssh-keygen -C "your-email@example.com" -f ~/.ssh/id_ghem_personal
```

이후 `ghem add`에서 "기존 키 사용"을 선택하고 경로를 입력하세요.

---

## 커밋 서명 (SSH)

git-env-manager는 프로필별로 SSH 기반 커밋 서명을 자동 구성할 수 있습니다. 이미 관리 중인 SSH 키를 그대로 사용하므로 별도의 GPG 키가 필요 없습니다.

### 프로필 생성 시 활성화

`ghem add` 실행 시 다음 프롬프트가 표시됩니다:

```text
? SSH 커밋 서명을 활성화하시겠습니까? (Git >= 2.34 필요) (y/N)
```

### 기존 프로필에 활성화

```bash
ghem edit personal
```

프롬프트에서 커밋 서명 옵션을 전환합니다.

### 설정 내용

활성화 시 프로필별 gitconfig에 다음이 포함됩니다:

```ini
[user]
    signingkey = ~/.git-env-manager/keys/{profile}/{key}.pub
[commit]
    gpgsign = true
[gpg]
    format = ssh
```

해당 프로필에 매핑된 디렉토리의 모든 커밋이 자동으로 서명됩니다.

### GitHub에서 확인

1. **Settings > SSH and GPG keys > New SSH key**로 이동
2. **Key type**을 **Signing Key**로 설정
3. 인증에 사용하는 동일한 공개키를 붙여넣기

GitHub에서 서명된 커밋에 "Verified" 배지가 표시됩니다.

> **참고**: SSH 커밋 서명은 Git >= 2.34가 필요합니다. 프로필의 SSH 키를 서명에도 재사용하므로 추가적인 키 관리가 필요 없습니다.

---

## 언어 설정

영어(`en`)와 한국어(`ko`)를 지원합니다. 기본값은 영어입니다.

초기화 시 언어 설정:

```bash
ghem init --lang ko
```

이후 변경:

```bash
ghem config set-lang ko
```

모든 프롬프트, 메시지, 에러가 선택한 언어로 표시됩니다. `--help`의 명령어 설명은 영어로 유지됩니다.

---

## 쉘 자동완성

### Bash

```bash
echo 'eval "$(ghem completion --shell bash)"' >> ~/.bashrc
```

### Zsh

```bash
echo 'eval "$(ghem completion --shell zsh)"' >> ~/.zshrc
```

`switch`/`delete`/`edit`/`test` 명령어에서 프로필 이름, `config set-lang`에서 언어 옵션이 탭 자동완성됩니다.

---

## 안전 장치

- **원자적 쓰기**: `~/.gitconfig`는 임시 파일에 먼저 쓴 후 rename (POSIX 원자적 연산)
- **백업**: `~/.gitconfig` 수정 시 타임스탬프가 포함된 백업 파일을 `~/.git-env-manager/`에 생성
- **추가 전용**: 기존 gitconfig 설정 (LFS, difftool, mergetool 등)은 절대 삭제하지 않음
- **키 권한**: 개인키 복사 시 `0600` 권한 자동 설정

---

## 요구사항

- Node.js >= 20
- Git >= 2.13 (`includeIf` 지원)
- macOS 또는 Linux

---

## 라이선스

MIT
