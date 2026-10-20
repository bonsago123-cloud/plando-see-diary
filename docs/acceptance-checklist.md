# 과제 6 조건별 체크 (코드 구현 여부와 실사용 검증은 구별)

| 기준 | 코드에 반영된 위치 | 실제 확인 |
| --- | --- | --- |
| C04~C07 기간·우선순위·성공 기준·예상 시간 | `plans` 테이블, 계획 폼 | ☐ |
| C08 수정 전 계획 유지 | `plan_revisions`, DB trigger, 이력 화면 | ☐ |
| C09~C13 할 일 CRUD + 완료 복귀 | task API, 할 일 화면 (삭제는 소프트 삭제) | ☐ |
| C14~C17 마감일·우선순위·태그·예상 시간 | `tasks`, 할 일 폼 | ☐ |
| C18~C20 검색·필터·정렬 | 할 일 화면 (마감일/우선순위/ID 확정 순서) | ☐ |
| C21~C22 완료 이중 요청 중복 방지 및 집계 정확성 | `completion_events` UNIQUE, 원자적 CTE, 현재 status 집계 | ☐ |
| C23~C27 시작·종료·실제 소요·막힘·계획 보존 | `work_sessions`, PostgreSQL generated duration | ☐ |
| C28~C32 개수 및 시간 합계 계산 | `lib/metrics.ts`, 집계 카드 | ☐ |
| C83 집계 클릭 후 근거 | 돌아보기 > 근거 기록 | ☐ |
| C33 개선점 다음 계획으로 | `reviews`, `carryForward` 서버 요청 | ☐ |
| C34 서버 실제 데이터베이스 저장 | Neon DB API, SQL 스키마, review 테이블 | ☐ |
| C35 새로고침 후 값 그대로 | 서버에서 GET 재조회 / 서울 시간 규칙 | ☐ |
| C36 단일 파일 내보내기 | GET `/api/data?export=1` JSON | ☐ |
| C78 실제 계획 1개 이상 | 본인 입력 필수, 예시 자동 삽입 없음 | ☐ |
| C79 해당 할 일 5개 이상 | 본인 입력 필수 | ☐ |
| C80 실행 기록 3개 이상 | 본인 입력 필수 | ☐ |
| C81 집계 0만 나오지 않음 | 본인 실행 기록 후 확인 | ☐ |
| C82 공개 안내 원문 | 첫 화면 상단 노란 안내 | ☐ |
| C57 XSS 글자 그대로 노출 | React escaping, `dangerouslySetInnerHTML` 금지 | ☐ |
| C58 비밀값 노출 없음 | 서버 전용 `DATABASE_URL`, `.gitignore`, 감사 스크립트 | ☐ |
| C59 확인 방법 4줄 | `docs/submission-template.md` | ☐ |
| C60 AI·내 판단 3줄 | `docs/submission-template.md` (본인이 완성) | ☐ |
| C01 모든 URL 로그인 없이 열림 | 인증 기능 없음. 배포·GitHub 공개 설정은 실제 확인 필수 | ☐ |

- **소스 반영**은 정적 구현을 뜻하며, **실제 통과 판정**을 의미하지 않습니다.
- Neon/Vercel 연결 후 실제 데이터 입력, 중복 요청, 새로고침, 브라우저 보안 검사, 시크릿 창 검사까지 해야 통과 여부를 판단할 수 있습니다.
