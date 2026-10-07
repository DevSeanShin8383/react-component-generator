# server/AGENTS.md

## Module Context

Bun 런타임에서 실행되는 AI API 프록시. `index.ts`가 HTTP 라우팅과 프로바이더 호출을 담당하고, `generator.ts`와 `fallback.ts`는 부수효과 없는 순수 함수다.

## Tech Stack & Constraints

- 런타임은 Bun (`Bun.serve`, `process.env`). HTTP 호출은 내장 `fetch`만 사용하고 SDK/axios를 추가하지 마라.
- `server/`는 `tsc -b`의 include에 없다 (`tsconfig.app.json:53`은 `src`, `tsconfig.node.json:25`는 `vite.config.ts`만). `bun run build`로는 서버 타입 오류가 잡히지 않으므로 직접 주의하라.
- 테스트 환경이 jsdom이다 (`vite.config.ts:19`). Bun 전역(`Bun`)을 쓰는 코드는 테스트에서 import할 수 없다.

## Implementation Patterns

- 새 프로바이더는 `Provider` 타입, `ENV_KEYS`(`index.ts:57-62`), `resolveApiKey`, `/api/generate` 분기를 모두 갱신한다. 클라이언트 `src/types/index.ts`의 `Provider`와도 맞춰라.
- 외부 응답 후처리는 `generator.ts`에 순수 함수로 추가하고 같은 이름의 `*.test.ts`를 작성한다 (vitest `describe/it`, 한국어 테스트명).
- Gemini 모델 우선순위는 `GOOGLE_MODELS`(`index.ts:5`) 배열 순서로 정한다.

## Local Golden Rules

- Asymmetry: Google만 모델 폴백(`index.ts:135`)과 `MAX_TOKENS` 잘림 검사(`index.ts:123`)가 있고 Anthropic 경로에는 없다. 의도된 차이인지 확인하기 전에 한쪽에 맞춰 통일하지 마라.
- Hard Constraint: 상태 코드 분기는 에러 메시지 문자열에 의존한다. `index.ts:194,201`이 `message.includes('503'|'429')`로 판정하므로, 프로바이더 에러 메시지 형식(`... API error: ${status}`, `index.ts:85,112`)에 상태 코드를 반드시 포함하라.
- Security Boundary: Gemini 호출은 API 키가 URL 쿼리에 들어간다 (`index.ts:99`). 이 URL이나 fetch 에러 원문을 로그/응답 에러 메시지에 넣지 마라.
- Security Boundary: CORS는 `*`로 열려 있다 (`index.ts:51-55`). 새 라우트도 모든 `Response`에 `CORS_HEADERS`를 붙여라. 서버 키를 쓰는 라우트를 추가할 때는 노출 범위를 먼저 검토하라.
- Do: `ensureRenderCall`/`stripCodeFences` 정규식을 바꾸면 `generator.test.ts` 케이스를 먼저 추가하라.
- Don't: `withModelFallback`에서 에러를 삼키지 마라. 모두 실패하면 마지막 에러를 던지는 계약(`fallback.ts:15-16`)에 `index.ts`의 에러 매핑이 의존한다.
