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

`~/.gh-persona/` 디렉토리와 초기 설정 파일이 생성됩니다.

### 프로필 추가

```bash
ghem add personal
```

대화형 프롬프트에서 다음을 입력합니다:
- Git user.name
- Git user.email
- SSH 개인키 경로 (기본값: `~/.ssh/id_ed25519_personal`)
- 자동 전환 디렉토리 (선택, 콤마 구분)

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
    path = ~/.gh-persona/gitconfig-work
```

`~/work/` 하위의 모든 Git 저장소에서 자동으로 해당 프로필의 이름, 이메일, SSH 키가 사용됩니다. 쉘 후킹 없이, 수동 전환 없이 동작합니다.

### SSH 키 관리

SSH 키는 `~/.gh-persona/keys/{profile}/`에 복사되며 적절한 권한(`0600`)이 설정됩니다. 각 프로필의 gitconfig는 `core.sshCommand`에 `-o IdentitiesOnly=yes`를 포함하여 올바른 키만 사용되도록 보장합니다.

### 설정 구조

모든 설정은 `~/.gh-persona/`에 저장됩니다:

```text
~/.gh-persona/
├── config.json              # 프로필 정의
├── keys/
│   ├── personal/
│   │   ├── id_ed25519_personal
│   │   └── id_ed25519_personal.pub
│   └── work/
│       ├── id_ed25519_work
│       └── id_ed25519_work.pub
├── gitconfig-personal       # 프로필별 gitconfig (자동 생성)
└── gitconfig-work
```

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `ghem init` | `~/.gh-persona/` 디렉토리와 초기 설정 파일 생성 |
| `ghem add <profile>` | 대화형 프롬프트로 새 프로필 추가 |
| `ghem switch <profile>` | 전역 Git 프로필 및 SSH 키 전환 |
| `ghem list` | 등록된 프로필 목록 출력 |

`ghem`과 `git-env-manager` 두 명령어 모두 사용 가능합니다.

---

## SSH 키 생성 가이드

프로필 추가 전에 각 계정별 SSH 키를 생성하세요:

```bash
# Personal 프로필용
ssh-keygen -t ed25519 -C "your-personal@email.com" -f ~/.ssh/id_ed25519_personal

# Work 프로필용
ssh-keygen -t ed25519 -C "your-work@email.com" -f ~/.ssh/id_ed25519_work
```

생성된 공개키를 각 GitHub/GitLab 계정에 등록한 후, `ghem add` 명령어를 실행하면 키가 관리 디렉토리로 복사됩니다.

---

## 안전 장치

- **원자적 쓰기**: `~/.gitconfig`는 임시 파일에 먼저 쓴 후 rename (POSIX 원자적 연산)
- **백업**: `~/.gitconfig` 수정 시 타임스탬프가 포함된 백업 파일을 `~/.gh-persona/`에 생성
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
