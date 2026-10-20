# 플랜두씨 다이어리 1 · 과제 6

**Plan → Do → See → 다음 계획** 웹앱. Next.js 16 / React 19 / Neon PostgreSQL / Vercel / GitHub 기반. **로그인 없음: 링크를 아는 누구나 조회·수정할 수 있으므로 공개해도 되는 기록만 입력하세요.**

## 과제 구현 기능

- 계획: 제목, 기간, 우선순위, 성공 기준, 예상 시간(분), 자동 버전 이력(원본 포함)
- 할 일: 추가/수정/완료/되돌리기/소프트 삭제, 마감일/우선순위/태그/예상 시간, 검색/상태·우선순위 필터/결정적 정렬
- 실행 기록: 할 일과 연결된 시작·종료 시각, DB 계산 실제 시간(분), 막힌 이유. 계획 원본과 별도 저장
- 완료 이중 클릭: 원자적 SQL 업데이트 및 completion_events(task_id) UNIQUE. 집계는 현재 상태만 반영
- 돌아보기: 계획당 집계, 서울 시간 기준 지연 계산, 막힌 할 일 중복 제거, 시간 차이, 집계 클릭 후 출처 기록 조회, 다음 계획으로 개선점 연결
- 모든 레코드는 Neon PostgreSQL에 지속 저장. JSON 단일 파일 내보내기. 첫 화면 공개 안내
- 스키마 명세: `contracts/pds-schema-v2.json`

**주의: 예시 계획은 자동 입력하지 않습니다.** 과제에서 실제 사용자 계획/할 일/실행 기록을 요구하므로 직접 계획 1개+, 할 일 5개+, 실행 기록 3개+를 입력해 주세요.

## 1. Neon 프로젝트와 테이블 준비

1. [Neon](https://console.neon.tech/) 로그인 → 새 프로젝트 생성 → PostgreSQL 데이터베이스 선택.
2. Neon **SQL Editor**를 열어 [`db/schema.sql`](db/schema.sql) 전체를 복사해 한 번 실행합니다. `CREATE TABLE` 성공 메시지를 확인합니다.
3. Neon 대시보드 **Connect** → 연결 문자열 복사. 이 문자열은 **비밀번호가 포함된 비밀값**입니다. GitHub, 채팅, 브라우저 코드에 절대로 게시하지 마세요.

## 2. 로컬 실행 (VS Code / Windows PowerShell)

Node.js **22** 사용 권장. 프로젝트 폴더에서 다음 명령 실행:

```powershell
npm install
Copy-Item .env.example .env.local
```

`.env.local` 파일 안의 `DATABASE_URL=...`을 실제 Neon 연결 문자열로 **로컬에서만** 교체합니다. 이 파일은 `.gitignore`로 제외됩니다.

```powershell
npm run dev
```

브라우저에서 `http://localhost:3000` 접속. 초기 상태는 비어 있어야 정상이며 직접 기록해야 합니다.

## 3. GitHub 저장소에 올리기

GitHub에서 **Public** 새 저장소를 만듭니다 (예: `plando-see-diary`). 프로젝트 폴더에서:

```bash
git init
git add .
git commit -m "Build Plan-Do-See diary with Neon database"
git branch -M main
git remote add origin https://github.com/USERNAME/plando-see-diary.git
git push -u origin main
```

`USERNAME`을 본인의 GitHub 로그인으로 교체하세요. GitHub 웹에서 업로드한다면 ZIP 압축을 푼 **안쪽 파일과 폴더 자체**를 저장소 최상단에 올립니다. `node_modules`, `.env.local`, `.next`, `.vercel`은 절대로 올리지 않습니다.

## 4. Vercel 배포

1. [Vercel](https://vercel.com/new) → Add New Project → 위 GitHub 저장소 Import.
2. Framework Preset을 **Next.js**로 설정 (대개 자동 인식).
3. **Settings → Environment Variables**에 이름 `DATABASE_URL`, 값은 Neon의 **실제 연결 문자열**을 설정합니다. 이 값은 `NEXT_PUBLIC_`을 붙이지 마세요. Production에 적용하고 테스트할 Preview/Development 환경도 필요하면 각각 설정합니다.
4. Deploy. 나온 `*.vercel.app` URL을 시크릿 창에서 열어 실제 데이터가 저장되는지 확인합니다.
5. Vercel 프로젝트 연결 또는 DB 접근 설정 후 배포를 새로 했다면 다시 확인합니다.

[Neon 공식 연결 문자열 안내](https://neon.com/docs/connect/connect-from-any-app) · [Vercel의 Neon 연동](https://vercel.com/marketplace/neon/neon)

## 5. 완주 테스트

1. 계획 직접 입력 → 수정 → `내 계획 > 수정 이력`에서 **v1과 v2 모두 남았는지** 확인.
2. 할 일 5개 이상 입력: 생성·수정·완료·되돌리기·삭제·검색·필터·정렬 점검.
3. 실행 기록 3개 이상 입력: 날짜(서울 시간), 소요 시간, 막힘 사유, 기존 예상 시간 유지 확인.
4. 완료를 연속 두 번 클릭(또는 같은 POST 중복 전송) → `completion_events`의 해당 task_id가 1행이며 돌아보기 완료 수도 1인지 확인.
5. 돌아보기의 **7개 숫자 각각 클릭** → 근거에 해당하는 할 일 및 실행 기록으로 갈 수 있는지 확인.
6. 돌아보기 메모/고칠 점 저장 → `고칠 점을 다음 계획으로 넘기기` → 새 계획의 이어받은 메모 확인.
7. 새로고침 → ID·날짜·시간·단위 유지. `전체 내보내기` → JSON 파일 1개 다운로드.
8. 할 일 제목에 `<script>alert('x')</script>` 입력 → 문자열로만 표시되고 경고창이 뜨지 않는지 확인.
9. 브라우저 개발자 도구 Sources/Network/Console, 배포 파일, Git 기록에서 DB 비밀번호가 노출되지 않는지 확인. .env.local을 올리지 말 것.
10. **시크릿 창**에서 결과물 URL/소스 GitHub URL 모두 로그인 없이 열리는지 확인.

집계는 선택 계획의 소프트 삭제되지 않은 할 일만 대상으로 합니다. 마감일이 서울 오늘보다 이전이며 미완료인 항목만 지연으로 셉니다. 실행 기록의 막힘 횟수가 아닌 **막힌 할 일 수**를 셉니다. 예상 시간·실제 시간 모두 `분` 단위로 저장/합산합니다.

## 품질 검사

```bash
npm test
npm run typecheck
npm run build
node scripts/source-audit.mjs
```

GitHub Actions 워크플로도 포함되어 있습니다. 인증정보와 실제 Neon 프로젝트가 현재 소스 ZIP에 포함되지 않으므로, 이 환경에서 **운영 DB 연결 / Vercel 실배포 / 브라우저 실사용 검증이 완료된 상태는 아닙니다.**

## 제출 준비

- `docs/submission-template.md`를 실제 배포 URL, GitHub 소스 URL, 사용자 판단으로 채우세요.
- `docs/acceptance-checklist.md`로 평가 항목을 하나씩 확인하세요.
