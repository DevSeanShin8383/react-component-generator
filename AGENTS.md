# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정 (`bun.lock` 사용). npm/yarn/pnpm 사용 금지.
- 개발 서버 (API + Vite 동시): `bun run dev`
- API 서버만: `bun run server` (포트 3002)
- 테스트 전체: `bun run test` (vitest run, `src/**`와 `server/**` 대상)
- 단일 테스트: `bun run test server/generator.test.ts`
- 린트: `bun run lint`
- 빌드 + 타입체크: `bun run build` (`tsc -b && vite build`)

## Golden Rules

### Immutable

- API 키를 코드, 로그, 에러 메시지, 클라이언트 응답에 노출하지 마라. `.env`는 gitignore 대상(`.gitignore:30`)이며 커밋 금지.
- `/api/config`는 키 존재 여부(boolean)만 반환한다 (`server/index.ts:150-153`). 키 값을 반환하도록 바꾸지 마라.
- 클라이언트 입력 키는 React state에만 둔다 (`src/App.tsx:14`). localStorage 등에 저장하지 마라.

### Hard Constraint

- 미리보기는 react-live `noInline` 모드다 (`src/components/LivePreview.tsx:74`). 생성 코드에는 `render(<X />)` 호출이 필수다.
- 생성 코드에서 import와 TypeScript 문법은 허용되지 않는다 (`server/index.ts:11,20`). 시스템 프롬프트를 수정할 때 이 규칙을 유지하라.
- 개발 시 `/api` 프록시 대상 포트는 3002다 (`vite.config.ts:9`, `server/index.ts:139`). 한쪽만 바꾸지 마라.

### Double Defense

- `render()` 호출은 프롬프트(`server/index.ts:12`)와 후처리 `ensureRenderCall`(`server/index.ts:188`, `server/generator.ts:238`) 양쪽에서 보장한다. 한쪽을 제거하지 마라.

### Test Boundary

- 순수 로직(`server/generator.ts`, `server/fallback.ts`)은 테스트가 있다. 수정 시 해당 `*.test.ts`를 함께 갱신하라.
- `server/index.ts`는 `Bun.serve` 부수효과 때문에 테스트가 없다. 가능한 로직은 순수 함수로 분리해 테스트 가능한 파일로 옮겨라.

## Project Context

- 프롬프트로 React 컴포넌트를 생성하고 라이브 프리뷰와 코드를 보여주는 도구.
- Stack: React 19, TypeScript, Vite, Vitest, Bun(API 서버), react-live, Anthropic/Gemini API.

## Standards & References

- 설치와 실행 방법은 `README.md` 참조.
- 커밋 메시지: `type: 한국어 요약` (예: `feat: 프롬프트 입력 UI 추가`, `chore: ...`). 커밋은 `commit` 스킬 사용.
- 서버 작업 규칙은 `server/AGENTS.md` 참조.
- Maintenance Policy: 이 문서의 규칙과 코드 사이에 괴리가 발견되면 작업 중 즉시 업데이트를 제안하라.
