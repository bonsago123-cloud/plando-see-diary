# 실행 기록 저장 시각 표시 적용

1. ZIP 안의 폴더와 파일을 기존 프로젝트의 같은 위치에 덮어쓰세요. README.md는 바꾸지 않습니다.
2. 프로젝트 폴더의 PowerShell에서 아래 명령을 한 번 실행하세요. 기존 .env.local의 DATABASE_URL을 사용합니다.

```powershell
node scripts/migrate-session-timestamps.mjs
```

3. 로컬 확인:

```powershell
npm.cmd run dev
```

4. 확인 후 직접 GitHub에 커밋·푸시하세요. 배포 전에 2번을 완료해야 합니다. 배포가 다른 DB를 사용하면 해당 DB에도 db/migrations/20261028_session_timestamps.sql을 먼저 실행하세요.

## 변경 사항

- 실행 기록의 소요 시간 왼쪽에 최초 기록 / 마지막 수정을 나란히 표시합니다.
- 한국 시간(Asia/Seoul), 연월일·24시간제·초 단위로 표시합니다.
- 작은 화면에서는 줄바꿈합니다.
- 최초 기록은 기존 created_at을 사용하며 수정해도 유지합니다.
- 수정 저장을 누르면 서버가 마지막 수정 시각을 갱신합니다.
- 수정 시각이 저장되지 않은 기록은 ‘—’로 표시합니다. 과거 수정 시각은 추정해서 채우지 않습니다.
- 기존 실행 날짜·소요 시간·집계 방식은 유지됩니다.

검증: 테스트 31개 통과, TypeScript 및 프로덕션 빌드 통과. 운영 사이트에는 아직 배포하지 않았습니다.

커밋 메시지: feat: display session creation and last edit times in KST
