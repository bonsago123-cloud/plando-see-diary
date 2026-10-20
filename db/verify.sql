-- Neon SQL Editor: 초기 schema 실행 및 실제 입력 이후 체크에 활용하세요.
-- SQL은 기록을 수정하지 않습니다.
SELECT 'plans' AS table_name, count(*) AS row_count FROM plans
UNION ALL SELECT 'plan_revisions',count(*) FROM plan_revisions
UNION ALL SELECT 'tasks (not deleted)',count(*) FROM tasks WHERE deleted_at IS NULL
UNION ALL SELECT 'work_sessions',count(*) FROM work_sessions
UNION ALL SELECT 'reviews',count(*) FROM reviews
UNION ALL SELECT 'completion_events',count(*) FROM completion_events;

-- 계획 버전별 기록 (원본 v1 + 수정 v2 모두 존재해야 함)
SELECT plan_id,version,title,start_date,end_date,priority,success_criteria,estimated_minutes,recorded_at
FROM plan_revisions ORDER BY plan_id,version;

-- 완료 이벤트 task_id 중복 확인: 결과는 0행이어야 합니다.
SELECT task_id,count(*) AS duplicates FROM completion_events GROUP BY task_id HAVING count(*) > 1;

-- 계획별 완료/지연/막힘 및 시간합계가 소스 화면 집계와 같은지 검증
WITH session_stats AS (
 SELECT task_id,sum(duration_minutes) AS actual_minutes,
        bool_or(length(btrim(blocked_reason))>0) AS had_block
 FROM work_sessions GROUP BY task_id
)
SELECT p.id AS plan_id,p.title,
       count(t.id)::integer AS planned,
       count(t.id) FILTER (WHERE t.status='completed')::integer AS completed,
       count(t.id) FILTER (WHERE t.status<>'completed' AND t.due_date<(now() AT TIME ZONE 'Asia/Seoul')::date)::integer AS overdue,
       count(t.id) FILTER (WHERE ss.had_block IS TRUE)::integer AS blocked,
       coalesce(sum(t.estimated_minutes),0)::integer AS estimated_minutes,
       coalesce(sum(ss.actual_minutes),0)::integer AS actual_minutes,
       (coalesce(sum(ss.actual_minutes),0)-coalesce(sum(t.estimated_minutes),0))::integer AS difference_minutes
FROM plans p
LEFT JOIN tasks t ON t.plan_id=p.id AND t.deleted_at IS NULL
LEFT JOIN session_stats ss ON ss.task_id=t.id
GROUP BY p.id,p.title ORDER BY p.title;
