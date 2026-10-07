---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 한국어 또는 영어 템플릿으로 GitHub PR을 생성한다. 포크된 서브 에이전트에서 독립적으로 실행된다. "PR 만들어줘", "PR 생성", "풀리퀘스트", "create pr", "open a pull request" 같은 요청에 활성화한다. 커밋만 하거나 리뷰 코멘트를 처리할 때는 쓰지 않는다.
context: fork
agent: general-purpose
---

# Create PR

현재 브랜치를 푸시하고 템플릿에 맞춰 GitHub PR을 생성한다.

이 스킬은 `context: fork`로 실행된다. 즉 메인 대화를 볼 수 없는 독립 서브 에이전트가 이 문서만 보고 끝까지 수행한다. 사용자에게 질문할 수 없으므로 모호한 점은 가장 보수적인 기본값으로 정하고, 마지막 보고에 무엇을 정했는지 적는다.

호출 인자: `$ARGUMENTS`

## 템플릿

| 언어 | 파일 (저장소 루트 기준) | 선택 조건 |
| --- | --- | --- |
| 한국어 (기본) | `.claude/skills/create-pr/references/template-ko.md` | 인자가 없거나 `ko` |
| English | `.claude/skills/create-pr/references/template-en.md` | 인자에 `en`, `english`, `영어` 포함 |

- 호출 형태: `/create-pr`, `/create-pr en`, `/create-pr ko`. 인자에 이슈 번호, base 브랜치, `draft` 같은 추가 정보가 있으면 PR에 반영한다.
- 언어를 판단할 수 없으면 한국어를 쓴다. 이 프로젝트의 커밋 규칙이 한국어다.
- 템플릿의 섹션 제목과 구조는 바꾸지 않는다. 내용 없는 섹션은 "해당 없음" / "N/A"로 채운다.

## 절차

### 1. 사전 확인

```bash
git rev-parse --abbrev-ref HEAD
git status --short
gh auth status
```

다음 경우에는 PR을 만들지 않고 이유를 보고한 뒤 끝낸다.

- 현재 브랜치가 기본 브랜치(`main`)다. 브랜치를 먼저 만들도록 안내한다.
- `gh`가 없거나 인증되지 않았다.
- 커밋되지 않은 변경이 있다. 먼저 `commit` 스킬로 커밋하라고 안내한다. 커밋 없이 PR을 만들면 그 변경은 PR에 들어가지 않는다.

### 2. base 브랜치 결정

인자에 지정이 없으면 다음으로 얻는다.

```bash
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
```

### 3. 변경 분석

```bash
git fetch origin <base>
git log origin/<base>..HEAD --oneline
git diff origin/<base>...HEAD --stat
git diff origin/<base>...HEAD
```

- 마지막 커밋이 아니라 **브랜치 전체**를 기준으로 쓴다.
- 결과가 비어 있으면 PR을 만들지 않고 그 사실을 보고한다.
- `.env`, 키·토큰이 diff에 보이면 PR을 만들지 않고 중단해 보고한다. 키 값은 보고에도 적지 않는다.

### 4. 본문 작성

선택한 템플릿을 읽고 모든 섹션을 채운다. 주석(`<!-- -->`)은 지우고 내용만 남긴다.

- 요약과 변경 이유는 diff와 커밋 로그가 말해 주는 사실에서만 쓴다.
- 테스트 항목은 **실제로 실행한 것만** 체크한다. `bun run test`, `bun run lint`, `bun run build`를 실행해 결과를 반영하고, 실패하면 실패한 그대로 적는다. 실행하지 않은 항목은 체크하지 않고 사유를 적는다.

### 5. 제목

70자 이내, 커밋 컨벤션과 같은 `type: 요약` 형식(feat, fix, refactor, chore)을 쓴다. 한국어 템플릿이면 요약을 한국어로, 영어 템플릿이면 영어로 쓴다. 끝에 마침표를 붙이지 않는다.

### 6. 푸시와 생성

원격에 브랜치가 없거나 뒤처져 있으면 푸시한다.

```bash
git push -u origin <branch>
```

본문은 임시 파일로 만들어 넘긴다.

```bash
gh pr create --base <base> --title "<제목>" --body-file <본문 파일>
```

- force push와 `--no-verify`는 쓰지 않는다.
- 같은 브랜치의 PR이 이미 열려 있으면(`gh pr view`) 새로 만들지 않고 기존 URL을 보고한다.
- 인자에 `draft`가 있을 때만 `--draft`를 붙인다.
- 시스템 안내로 받은 PR 설명용 attribution 줄이 있으면 본문 마지막에 붙인다.
- 임시 본문 파일은 생성 후 삭제한다.

### 7. 보고

메인 에이전트에게 돌려줄 최종 메시지에 다음을 한국어로 간결하게 적는다.

- PR URL, 제목, base 브랜치
- 실행한 검증과 결과
- 임의로 정한 사항 (언어, base, draft 여부 등)

## 하지 말 것

- 요청받지 않은 리뷰어 지정, 라벨, 머지는 하지 않는다.
- 하위 에이전트를 다시 띄우지 않는다. 이 스킬 자체가 이미 포크된 독립 에이전트다.
