# 플랜두씨 다이어리 2 · 과제 7

기존 과제 6 다이어리에 계정별 인증을 붙인 소스입니다. 첫 화면 `/login`은 공개되고, 기록 화면 `/diary`와 자료 API는 로그인해야 열립니다.

**아직 업로드·배포·운영 데이터 이전을 하지 않았습니다.** 적용 순서는 [APPLY.md](APPLY.md)를 읽으세요. GitHub에 이미 있는 과제 6 저장소에 이어 적용해야 합니다.

## 구현한 기능

- 이메일 가입·로그인·로그아웃, 중복 가입 차단, 로그인 실패 문구 통일
- Node.js 내장 `crypto.scrypt` 비밀번호 해싱, 계정마다 무작위 salt
- 12시간 서버 세션, HttpOnly 쿠키, 운영 환경 Secure, SameSite=Strict
- 로그아웃·비밀번호 변경 시 해당 사용자의 모든 서버 세션 폐기
- 계획·할 일·실행 기록·수정 이력·돌아보기·카테고리·생각의 계정별 분리
- 본인 자료 전체 JSON 내보내기(소프트 삭제 포함), 비밀번호 재확인 후 계정/자료 일괄 삭제
- 기존 자료를 지정한 계정으로만 옮기는 관리자용 이전 도구
- 실제 요청 처리 코드와 PostgreSQL을 사용한 자동 통합 검사

기존 캘린더, 계획 완수, 생각, 시간 계산, 마음 회복 등 과제 6 기능은 유지했습니다. 5일 실사용 기록, 질문·지표 선택, 규칙 변경 이유, 본인 판단 작성 화면과 가짜 기록은 추가하지 않았습니다.

## 로컬 실행

Node.js 22 이상에서 프로젝트 폴더를 열고 실행합니다.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

`npm ci`는 잠금 파일의 버전대로 의존성을 설치합니다. `Copy-Item`은 파일 복사입니다. `.env.local`에 본인 데이터베이스 연결 문자열을 넣고, 먼저 `APPLY.md`의 SQL 마이그레이션을 적용하세요. 로컬 주소는 `http://localhost:3000`입니다.

운영 환경 `APP_ORIGIN`은 실제 결과물 주소의 출처(예: `https://프로젝트.vercel.app`, 마지막 `/` 없음)로 설정하세요. 비밀인 `DATABASE_URL`에 `NEXT_PUBLIC_`을 붙이면 안 됩니다.

## 확인

```powershell
npm test
npm run typecheck
npm run build
node scripts/source-audit.mjs
```

- `npm test`: 기존 기능, 화면 DOM 모의 검사, 인증·자료 분리 통합 검사
- `npm run typecheck`: TypeScript 자료형 검사
- `npm run build`: 배포용 빌드 검사
- `node scripts/source-audit.mjs`: 소스의 흔한 비밀값/HTML 삽입 위험 패턴 검사

검사는 실제 계정이 아닌 로컬 임시 계정/임시 데이터베이스를 사용합니다. 실제 Neon/Vercel 설정이나 사람의 5일 사용을 대신하지 않습니다.

## 문서

- [적용 방법](APPLY.md)
- [인증 구현 설명](docs/auth-implementation.md)
- [자동 검사의 실제 요청·응답](docs/auth-test-results.md)
- [검증 범위와 남은 직접 확인](docs/t07-verification.md)

`docs/submission-template.md`, `docs/acceptance-checklist.md` 등 이전 문서는 과제 6 당시 문서입니다. 과제 7의 제출 완료 근거로 사용하지 마세요.
