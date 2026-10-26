# 인증 구현 설명 — 코드로 확인 가능한 부분

이 문서는 구현 사실과 AI의 선택 이유를 설명합니다. 사용자의 판단·직접 검증·실제 5일 사용을 작성한 문서가 아닙니다. 실제 운영 배포는 미확인입니다.

## ① 무엇으로 붙였나

**직접 구현한 이메일/비밀번호 인증과 데이터베이스 서버 세션**입니다. 완성형 인증 라이브러리/인증 서비스를 사용한 것처럼 표현하지 않습니다. 비밀번호 알고리즘 자체는 직접 만들지 않고 Node.js 표준 `node:crypto`의 `scrypt`, `randomBytes`, `timingSafeEqual`에 맡겼습니다.

잠금 파일 기준 Next.js 16.4.3, React 19.3.1, `@neondatabase/serverless` 1.2.0입니다. 로컬 검사는 Node.js 24.22.1 / PGlite 0.5.11로 실행했고, 프로젝트 실행 최소 안내는 Node.js 22 이상입니다. 운영 Node/OpenSSL 정확한 버전은 실제 운영 환경에서 확인해야 합니다.

작업 기준 T06: https://github.com/bonsago123-cloud/plando-see-diary/commit/f56930f7a643dcc58d944fcc83b4f820a13c8de8

이는 이번 작업의 출발점이며 실제 최종 T06 제출과 일치하는지는 사용자가 확인해야 합니다.

## ② 왜 그걸 골랐나

AI의 구현 선택 이유: 기존 Neon 데이터베이스와 Next.js API를 유지하면서, 과제가 요구하는 로그아웃 즉시 폐기와 비밀번호 저장 형태를 코드/SQL로 확인할 수 있도록 서버 세션을 선택했습니다. 별도 인증 서비스의 가입이나 키 발급 없이 사용자가 소스와 SQL을 직접 적용할 수 있습니다. 직접 인증 코드를 유지·점검해야 하는 부담은 남습니다.

함께 검토한 대안: Supabase Auth 같은 인증 서비스를 사용할 수도 있으나, 이번 작업에서는 기존 Neon 구조와 자료를 유지하고 새 외부 서비스 설정 없이 전달하기 위해 채택하지 않았습니다. 독립적으로 유효한 JWT(JSON Web Token)만 사용하는 방식은 로그아웃 후에도 토큰이 만료 전까지 통하는 문제를 따로 해결해야 하므로 선택하지 않았습니다.

scrypt 선택 이유: 단순 해시 한 번보다 계산·메모리 비용이 크고 Node.js 표준 구현을 사용할 수 있기 때문입니다. N=131072, r=8, p=1, 결과 64바이트, 계정별 무작위 salt 16바이트입니다. 저장 형식은 `scrypt$N$r$p$salt$hash`이며 원문은 저장하지 않습니다. 실제 임시 두 계정의 서로 다른 저장값은 `auth-test-results.md` 맨 위에 있습니다.

참고: [Node.js crypto 공식 문서](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback), [Neon 드라이버 공식 문서](https://github.com/neondatabase/serverless/blob/main/README.md).

## ③ 어디를 어떻게 고쳤나

| 흐름 | 소스와 처리 |
|---|---|
| 첫 화면 | `app/page.tsx` → `/login`; `app/login/login-form.tsx`에서 가입/로그인 |
| 가입 | `POST /api/auth/register` → `app/api/auth/[action]/route.ts` → `lib/password.ts` → app_users에 해시 저장. 정규화된 이메일 UNIQUE |
| 로그인 | `POST /api/auth/login` → 해시 비교 → `lib/auth.ts: issueSession` → auth_sessions → HttpOnly 쿠키 |
| 로그인 화면 오류 | 없는 이메일/틀린 비밀번호에 동일한 401 문구. 입력 형식 오류는 별도 400 |
| 기록 화면 | `app/diary/page.tsx` → 쿠키/서버 세션 검증 → 비로그인은 `/login`으로 이동 |
| 자료 조회 | `app/api/data/route.ts: GET` → requireUser → loadAll(ownerId). 목록·단건·내보내기 모두 소유자 제한 |
| 수정·삭제 | `POST /api/data` → requireUser → assertSameOrigin → assertOwned → 소유자 조건이 있는 SQL. 남의 ID는 404 |
| 로그아웃 | `POST /api/auth/logout` → 해당 사용자 모든 auth_sessions 삭제 → 쿠키 제거. 쿠키만 지우는 방식 아님 |
| 비밀번호 변경 | 현재 비밀번호 재검증 → 해시 교체와 모든 세션 폐기를 한 트랜잭션으로 처리 |
| 계정 삭제 | 현재 비밀번호와 확인 문구 검증 → 자식 자료, 계획/생각, 계정/세션을 한 트랜잭션으로 삭제. 소프트 삭제 자료도 포함 |
| 기존 자료 이전 | `scripts/assign-legacy-owner.mjs` → `lib/legacy-transfer.mjs`. DB 권한이 있는 관리자만 실행. 공개 이전 API 없음 |
| DB 변경 | `db/migrations/20261026_auth.sql`: users/sessions/attempts, plans/topics.owner_id, user_categories |

세션은 무작위 32바이트(쿠키에는 64자리 16진수)이며 DB에는 SHA-256 해시만 저장합니다. 로그인 시점부터 **12시간 절대 만료**이고 새 요청으로 연장되지 않습니다. SQL의 `expires_at > now()`를 매 요청 확인합니다. 세션 값은 URL·localStorage로 전달하지 않습니다. 서명용 비밀키는 사용하지 않습니다. 비밀인 DATABASE_URL은 서버 환경변수에만 둡니다.

쿠키는 HttpOnly, SameSite=Strict, Path=/이며 운영 환경에서 Secure입니다. 변경 요청은 JSON과 같은 Origin을 요구합니다. 계정당 15분 동안 인증 요청 10회를 넘으면 429입니다. 비밀번호·세션 원문을 응답/애플리케이션 로그에 기록하지 않습니다. 비밀번호 입력은 HTTPS 로그인 요청 본문으로 전송될 수밖에 없으므로, 개발자 도구 캡처 시 **요청 본문도 반드시 가려야 합니다**.

## ④ 안 열리는 것을 확인한 기록

`auth-test-results.md`는 실제 처리 함수에 NextRequest를 전달하고 실제 PostgreSQL 엔진(PGlite)에서 SQL을 실행한 결과입니다. HTTP 서버·Vercel·실제 Neon 네트워크를 통과한 기록은 아닙니다. 테스트 코드: `tests/auth-isolation.test.ts`.

| 확인 | 성공 요청 | 거절 요청과 결과 |
|---|---|---|
| 로그인 | login A/B, 200 | wrong password / missing user, 같은 401 문구 |
| 로그인 필요 | 계정의 `/api/data`, 200 | anonymous list/export/mutation, 401 |
| 세션 폐기 | same cookie before logout, `GET /api/data` 200 | same cookie after logout, **동일 쿠키·동일 GET 주소** 401 |
| 타인 자료 차단 | 각 owner read/edit/delete, 200 | A→B, B→A 각 자료 read/edit/delete, 404 |
| 소유자 위조·목록 | 본인 list/export, 200 | foreign create/update 404; query/header/body 위조는 본인 자료만 반환/변경 |

추가: 만료, 비밀번호 변경 후 두 기기의 세션 폐기, 계정 삭제, 삭제 도중 오류 시 롤백, 기존 자료 명시적 이전 및 재실행, 인증 시도 제한을 검사했습니다. 거절 전후 반대 계정의 모든 배열 건수뿐 아니라 **자료 전체 내용**도 동일한지 비교했습니다. 내보내기에 해시·세션 테이블은 포함하지 않습니다.

자동 결과의 요청에 비밀번호는 `[REDACTED]`, 쿠키는 `[REDACTED]`입니다. 테스트 중 얻은 비밀번호 해시만 과제의 저장 형태 증거로 포함하며 실제 사용자 비밀번호 해시가 아닙니다. 소스 패턴 검사 통과는 운영 환경변수/전체 Git 기록까지 무조건 안전하다는 보증이 아닙니다.

## ⑤ AI와 나

AI가 수행한 사실: 기존 소스 분석, 인증/자료 보호 코드, 이전 도구, 자동 검사, 구현 문서 작성.

**사용자의 직접 판단과 AI 제안을 따르지 않은 일은 작성하지 않았습니다.** 실제 본인 판단을 별도 제출 문서에 직접 작성해야 합니다. 5일 실사용, 규칙 변경, 손계산 비교, 실제 배포 확인도 AI가 대신 했다고 기록하지 않았습니다.

## ⑥ 아직 못 막은 것

- 이메일 소유 확인과 비밀번호 분실 복구가 없습니다. 타인의 이메일로 먼저 가입하거나, 비밀번호를 잊어 접근하지 못할 수 있습니다.
- 두 번째 인증 수단이 없습니다. 비밀번호가 유출되면 계정 접근을 막기 어렵습니다.
- 계정당 요청 제한만 있어 분산 공격·대량의 서로 다른 이메일을 이용한 자원 소모를 충분히 막지 못합니다. scrypt는 자원 비용이 크므로 운영 전 요청량 제한/관찰이 더 필요합니다.
- 관리자 DB 권한 탈취를 막는 구조는 아닙니다. 이번 보호는 API의 소유자 검증이며 DB RLS(Row Level Security)를 설정한 것은 아닙니다.
- 과거 공개 앱에서 이미 복사한 자료는 인증을 붙여도 회수할 수 없습니다. 기존 공개 배포가 살아 있으면 같은 DB를 계속 읽을 수 있으므로 접근을 차단하거나 별도 DB 사용을 검토해야 합니다.
- 계정 삭제는 현재 DB에서 자료를 삭제합니다. 외부 백업·이미 내려받은 파일까지 지우지는 않습니다. 계정 삭제 창에 비밀번호 재확인과 전체 삭제 안내를 표시합니다.
- 열린 다른 기기 화면에 이미 내려받은 내용은 즉시 회수할 수 없습니다. 서버는 세션 폐기 후 새 요청을 차단하며, 같은 브라우저 탭은 알림으로 잠그고 다른 화면은 포커스/60초 재확인 시 이동합니다.

## 일반 시간 집계

기존 시간 합계에 ‘기록일 평균’을 추가했습니다(`lib/metrics.ts: recordedDayStats`). 선택 계획의 삭제되지 않은 할 일과 실행 기록만 대상입니다. 합계는 기록의 실제 분 수 합산, 평균은 합계 ÷ 실행 기록 시작일의 서로 다른 서울 날짜 수이며 소수 둘째 자리까지 반올림합니다. 기록이 없는 날은 분모에서 제외하고 전혀 기록이 없으면 `—`입니다. 같은 ID의 기록은 DB에서 한 번 저장되지만 별도 ID로 중복 입력한 기록은 각각 합산되므로 사용자가 수정/삭제해야 합니다. 이상값을 자동 제거하지 않습니다. 이는 앱의 일반 집계 설명이며, 사용자의 과제 관찰 지표·계획 규칙을 대신 정한 것이 아닙니다.
