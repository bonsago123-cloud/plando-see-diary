# T07 자동 통합 검사 결과

실제 배포/사람의 수동 확인이 아닌, 로컬 PGlite PostgreSQL + 실제 Next.js 요청 처리 함수 검사입니다. 임시 시험 계정과 자료만 사용했으며 5일 실사용 기록이 아닙니다.

비밀번호 저장 방식: scrypt (N=131072, r=8, p=1), 계정별 무작위 16바이트 salt. 동일 비밀번호의 두 계정 저장값:

```json
[
  {
    "email": "a@example.test",
    "password_hash": "scrypt$131072$8$1$119185bd91cba145685271d9a2e86bed$16b17e2ec0c95cf92b390331ff274820fccc1550ee5be36a8e412de5376777c2fe7c564df3d20b60cca3c35b1dec3b0d04db05017b119f198dc5e0594cbc6a82"
  },
  {
    "email": "b@example.test",
    "password_hash": "scrypt$131072$8$1$af6c6c1da99a4eb7e1cd4e205f75ae78$5d17cbeb0eead49f0d43d61d850d53146c7dbc5bd6538d9ba5b0b8c8566def64177ace249b45742cc245e7d56bb3164ebf778a5a5f008939a674183b146bc7f8"
  }
]
```

## 거절 전후 비교

```json
[
  {
    "direction": "A → B",
    "before": {
      "plans": 1,
      "revisions": 1,
      "tasks": 1,
      "sessions": 1,
      "reviews": 1,
      "categories": 1,
      "topics": 1,
      "thoughts": 1,
      "completion_events": 1
    },
    "after": {
      "plans": 1,
      "revisions": 1,
      "tasks": 1,
      "sessions": 1,
      "reviews": 1,
      "categories": 1,
      "topics": 1,
      "thoughts": 1,
      "completion_events": 1
    },
    "allContentsUnchanged": true
  },
  {
    "direction": "B → A",
    "before": {
      "plans": 1,
      "revisions": 2,
      "tasks": 1,
      "sessions": 1,
      "reviews": 1,
      "categories": 1,
      "topics": 1,
      "thoughts": 1,
      "completion_events": 1
    },
    "after": {
      "plans": 1,
      "revisions": 2,
      "tasks": 1,
      "sessions": 1,
      "reviews": 1,
      "categories": 1,
      "topics": 1,
      "thoughts": 1,
      "completion_events": 1
    },
    "allContentsUnchanged": true
  }
]
```

## 실제 요청·응답 (민감값 마스킹)

### anonymous list

```json
{
  "label": "anonymous list",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": null,
  "status": 401,
  "response": {
    "error": "로그인이 필요합니다."
  }
}
```

### anonymous export

```json
{
  "label": "anonymous export",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": null,
  "status": 401,
  "response": {
    "error": "로그인이 필요합니다."
  }
}
```

### anonymous mutation

```json
{
  "label": "anonymous mutation",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "action": "createPlan"
  },
  "status": 401,
  "response": {
    "error": "로그인이 필요합니다."
  }
}
```

### register A

```json
{
  "label": "register A",
  "method": "POST",
  "url": "/api/auth/register",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "a@example.test",
    "password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### register B

```json
{
  "label": "register B",
  "method": "POST",
  "url": "/api/auth/register",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "b@example.test",
    "password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### duplicate normalized email

```json
{
  "label": "duplicate normalized email",
  "method": "POST",
  "url": "/api/auth/register",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": " A@EXAMPLE.TEST ",
    "password": "[REDACTED]"
  },
  "status": 409,
  "response": {
    "error": "이미 사용 중인 이메일입니다."
  }
}
```

### wrong password

```json
{
  "label": "wrong password",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "a@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### missing user

```json
{
  "label": "missing user",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "missing@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### login A

```json
{
  "label": "login A",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "a@example.test",
    "password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### login B

```json
{
  "label": "login B",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "b@example.test",
    "password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### legacy not auto claimed

```json
{
  "label": "legacy not auto claimed",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [],
    "revisions": [],
    "tasks": [],
    "sessions": [],
    "reviews": [],
    "categories": [],
    "topics": [],
    "thoughts": []
  }
}
```

### A create plan

```json
{
  "label": "A create plan",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "createPlan",
    "title": "A plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "category": "test category"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### A list

```json
{
  "label": "A list",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.265Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      }
    ],
    "tasks": [],
    "sessions": [],
    "reviews": [],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [],
    "thoughts": []
  }
}
```

### A create task

```json
{
  "label": "A create task",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "createTask",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### A list

```json
{
  "label": "A list",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.265Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "todo",
        "completed_at": null,
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.276Z"
      }
    ],
    "sessions": [],
    "reviews": [],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [],
    "thoughts": []
  }
}
```

### A session

```json
{
  "label": "A session",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "addSession",
    "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T09:30",
    "blocked_reason": ""
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### A complete

```json
{
  "label": "A complete",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "setStatus",
    "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "status": "completed"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### A review

```json
{
  "label": "A review",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveReview",
    "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
    "reflection": "test reflection",
    "improvement": "test improvement"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### A topic

```json
{
  "label": "A topic",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveTopic",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### A thought

```json
{
  "label": "A thought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveThought",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
    "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B create plan

```json
{
  "label": "B create plan",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "createPlan",
    "title": "B plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "category": "test category"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B list

```json
{
  "label": "B list",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "tasks": [],
    "sessions": [],
    "reviews": [],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [],
    "thoughts": []
  }
}
```

### B create task

```json
{
  "label": "B create task",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "createTask",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B list

```json
{
  "label": "B list",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "tasks": [
      {
        "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "todo",
        "completed_at": null,
        "created_at": "2026-10-26T03:23:48.335Z",
        "updated_at": "2026-10-26T03:23:48.335Z"
      }
    ],
    "sessions": [],
    "reviews": [],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [],
    "thoughts": []
  }
}
```

### B session

```json
{
  "label": "B session",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "addSession",
    "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T09:30",
    "blocked_reason": ""
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B complete

```json
{
  "label": "B complete",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "setStatus",
    "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
    "status": "completed"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B review

```json
{
  "label": "B review",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveReview",
    "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
    "reflection": "test reflection",
    "improvement": "test improvement"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B topic

```json
{
  "label": "B topic",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveTopic",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B thought

```json
{
  "label": "B thought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveThought",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
    "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### A → B before

```json
{
  "label": "A → B before",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:48.365Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.324Z",
        "deleted_at": null
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "tasks": [
      {
        "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.348Z",
        "deleted_at": null,
        "created_at": "2026-10-26T03:23:48.335Z",
        "updated_at": "2026-10-26T03:23:48.348Z"
      }
    ],
    "sessions": [
      {
        "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.345Z",
        "deleted_at": null
      }
    ],
    "reviews": [
      {
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.351Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.353Z",
        "updated_at": "2026-10-26T03:23:48.353Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
        "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.355Z",
        "updated_at": "2026-10-26T03:23:48.355Z",
        "deleted_at": null
      }
    ],
    "completion_events": [
      {
        "id": 2,
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "event_key": "complete:ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "completed_at": "2026-10-26T03:23:48.348Z"
      }
    ]
  }
}
```

### A → B identity

```json
{
  "label": "A → B identity",
  "method": "GET",
  "url": "/api/auth/me",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "user": {
      "id": "43b47131-cc4f-4170-b399-373dfd22002f",
      "email": "b@example.test",
      "expires_at": "2026-10-26T15:23:48.242Z"
    }
  }
}
```

### A → B own list

```json
{
  "label": "A → B own list",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.265Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.309Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.317Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.321Z",
        "deleted_at": null
      }
    ]
  }
}
```

### A → B own read plan

```json
{
  "label": "A → B own read plan",
  "method": "GET",
  "url": "/api/data?kind=plan&id=3d73813b-5386-439c-bd75-41f58f078e83",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "3d73813b-5386-439c-bd75-41f58f078e83",
    "title": "A plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "version": 1,
    "parent_plan_id": null,
    "carry_over_text": "",
    "category": "test category",
    "is_completed": false,
    "created_at": "2026-10-26T03:23:48.265Z",
    "updated_at": "2026-10-26T03:23:48.265Z"
  }
}
```

### A → B foreign read plan

```json
{
  "label": "A → B foreign read plan",
  "method": "GET",
  "url": "/api/data?kind=plan&id=33f622dc-2692-4577-9099-8ccad6d9e79d",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B own read task

```json
{
  "label": "A → B own read task",
  "method": "GET",
  "url": "/api/data?kind=task&id=544d567b-295a-4b74-9aeb-f0970c623a8f",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "status": "completed",
    "completed_at": "2026-10-26T03:23:48.309Z",
    "created_at": "2026-10-26T03:23:48.276Z",
    "updated_at": "2026-10-26T03:23:48.309Z"
  }
}
```

### A → B foreign read task

```json
{
  "label": "A → B foreign read task",
  "method": "GET",
  "url": "/api/data?kind=task&id=ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B own read session

```json
{
  "label": "A → B own read session",
  "method": "GET",
  "url": "/api/data?kind=session&id=49d09a09-f742-4556-97d4-e7b304ca06c3",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
    "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "started_at": "2026-10-01T00:00:00.000Z",
    "ended_at": "2026-10-01T00:30:00.000Z",
    "duration_minutes": 30,
    "blocked_reason": "",
    "created_at": "2026-10-26T03:23:48.304Z"
  }
}
```

### A → B foreign read session

```json
{
  "label": "A → B foreign read session",
  "method": "GET",
  "url": "/api/data?kind=session&id=10546b84-4566-42e4-91a1-df33c0c1fd28",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B own read topic

```json
{
  "label": "A → B own read topic",
  "method": "GET",
  "url": "/api/data?kind=topic&id=7b2f9462-4c91-4960-8e7c-3bc10aa25168",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "created_at": "2026-10-26T03:23:48.317Z",
    "updated_at": "2026-10-26T03:23:48.317Z",
    "deleted_at": null
  }
}
```

### A → B foreign read topic

```json
{
  "label": "A → B foreign read topic",
  "method": "GET",
  "url": "/api/data?kind=topic&id=f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B own read thought

```json
{
  "label": "A → B own read thought",
  "method": "GET",
  "url": "/api/data?kind=thought&id=5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
    "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "created_at": "2026-10-26T03:23:48.321Z",
    "updated_at": "2026-10-26T03:23:48.321Z",
    "deleted_at": null
  }
}
```

### A → B foreign read thought

```json
{
  "label": "A → B foreign read thought",
  "method": "GET",
  "url": "/api/data?kind=thought&id=8176a065-a7c9-4f31-99d6-7c2e5983afe9",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign editPlan

```json
{
  "label": "A → B foreign editPlan",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editPlan",
    "title": "test plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "category": "injected category",
    "id": "33f622dc-2692-4577-9099-8ccad6d9e79d"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign deletePlan

```json
{
  "label": "A → B foreign deletePlan",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deletePlan",
    "id": "33f622dc-2692-4577-9099-8ccad6d9e79d"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign setPlanCompleted

```json
{
  "label": "A → B foreign setPlanCompleted",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "setPlanCompleted",
    "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
    "is_completed": true
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign createTask

```json
{
  "label": "A → B foreign createTask",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "createTask",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign editTask

```json
{
  "label": "A → B foreign editTask",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editTask",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign deleteTask

```json
{
  "label": "A → B foreign deleteTask",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteTask",
    "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign setStatus

```json
{
  "label": "A → B foreign setStatus",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "setStatus",
    "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
    "status": "todo"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign addSession

```json
{
  "label": "A → B foreign addSession",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "addSession",
    "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T10:00",
    "blocked_reason": ""
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign editSession

```json
{
  "label": "A → B foreign editSession",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editSession",
    "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
    "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T10:00",
    "blocked_reason": ""
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign editSession

```json
{
  "label": "A → B foreign editSession",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editSession",
    "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
    "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T10:00",
    "blocked_reason": ""
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign deleteSession

```json
{
  "label": "A → B foreign deleteSession",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteSession",
    "id": "10546b84-4566-42e4-91a1-df33c0c1fd28"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign saveReview

```json
{
  "label": "A → B foreign saveReview",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveReview",
    "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
    "reflection": "attack",
    "improvement": "attack"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign carryForward

```json
{
  "label": "A → B foreign carryForward",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "carryForward",
    "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
    "start_date": "2026-10-06",
    "end_date": "2026-10-07"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign saveTopic

```json
{
  "label": "A → B foreign saveTopic",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveTopic",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5"
  },
  "status": 404,
  "response": {
    "error": "주제를 찾을 수 없습니다."
  }
}
```

### A → B foreign deleteTopic

```json
{
  "label": "A → B foreign deleteTopic",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteTopic",
    "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign saveThought

```json
{
  "label": "A → B foreign saveThought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveThought",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
    "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 404,
  "response": {
    "error": "주제 또는 생각을 찾을 수 없습니다."
  }
}
```

### A → B foreign deleteThought

```json
{
  "label": "A → B foreign deleteThought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteThought",
    "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B foreign saveThought

```json
{
  "label": "A → B foreign saveThought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveThought",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "3df1fd91-9b4d-4395-a0c7-b2c1e5a37bde",
    "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### A → B after

```json
{
  "label": "A → B after",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:48.493Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.324Z",
        "deleted_at": null
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "tasks": [
      {
        "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.348Z",
        "deleted_at": null,
        "created_at": "2026-10-26T03:23:48.335Z",
        "updated_at": "2026-10-26T03:23:48.348Z"
      }
    ],
    "sessions": [
      {
        "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.345Z",
        "deleted_at": null
      }
    ],
    "reviews": [
      {
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.351Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.353Z",
        "updated_at": "2026-10-26T03:23:48.353Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
        "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.355Z",
        "updated_at": "2026-10-26T03:23:48.355Z",
        "deleted_at": null
      }
    ],
    "completion_events": [
      {
        "id": 2,
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "event_key": "complete:ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "completed_at": "2026-10-26T03:23:48.348Z"
      }
    ]
  }
}
```

### A → B query/header spoof

```json
{
  "label": "A → B query/header spoof",
  "method": "GET",
  "url": "/api/data?owner_id=43b47131-cc4f-4170-b399-373dfd22002f&user_id=43b47131-cc4f-4170-b399-373dfd22002f",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "x-user-id": "43b47131-cc4f-4170-b399-373dfd22002f",
    "x-owner-id": "43b47131-cc4f-4170-b399-373dfd22002f",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.265Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.309Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.317Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.321Z",
        "deleted_at": null
      }
    ]
  }
}
```

### A → B body spoof

```json
{
  "label": "A → B body spoof",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editPlan",
    "title": "test plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "category": "test category",
    "id": "3d73813b-5386-439c-bd75-41f58f078e83",
    "owner_id": "43b47131-cc4f-4170-b399-373dfd22002f",
    "user_id": "43b47131-cc4f-4170-b399-373dfd22002f"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### A → B after spoof

```json
{
  "label": "A → B after spoof",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.502Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      },
      {
        "id": 4,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.502Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.309Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.317Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.321Z",
        "deleted_at": null
      }
    ]
  }
}
```

### B → A before

```json
{
  "label": "B → A before",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:48.516Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.502Z",
        "deleted_at": null
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      },
      {
        "id": 4,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.502Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "deleted_at": null,
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.309Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z",
        "deleted_at": null
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.317Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.321Z",
        "deleted_at": null
      }
    ],
    "completion_events": [
      {
        "id": 1,
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "event_key": "complete:544d567b-295a-4b74-9aeb-f0970c623a8f",
        "completed_at": "2026-10-26T03:23:48.309Z"
      }
    ]
  }
}
```

### B → A identity

```json
{
  "label": "B → A identity",
  "method": "GET",
  "url": "/api/auth/me",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "user": {
      "id": "14022397-f1ff-4702-a67c-b8f9fd9df01f",
      "email": "a@example.test",
      "expires_at": "2026-10-26T15:23:47.924Z"
    }
  }
}
```

### B → A own list

```json
{
  "label": "B → A own list",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "tasks": [
      {
        "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.348Z",
        "created_at": "2026-10-26T03:23:48.335Z",
        "updated_at": "2026-10-26T03:23:48.348Z"
      }
    ],
    "sessions": [
      {
        "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.345Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.351Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.353Z",
        "updated_at": "2026-10-26T03:23:48.353Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
        "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.355Z",
        "updated_at": "2026-10-26T03:23:48.355Z",
        "deleted_at": null
      }
    ]
  }
}
```

### B → A own read plan

```json
{
  "label": "B → A own read plan",
  "method": "GET",
  "url": "/api/data?kind=plan&id=33f622dc-2692-4577-9099-8ccad6d9e79d",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
    "title": "B plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "version": 1,
    "parent_plan_id": null,
    "carry_over_text": "",
    "category": "test category",
    "is_completed": false,
    "created_at": "2026-10-26T03:23:48.324Z",
    "updated_at": "2026-10-26T03:23:48.324Z"
  }
}
```

### B → A foreign read plan

```json
{
  "label": "B → A foreign read plan",
  "method": "GET",
  "url": "/api/data?kind=plan&id=3d73813b-5386-439c-bd75-41f58f078e83",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A own read task

```json
{
  "label": "B → A own read task",
  "method": "GET",
  "url": "/api/data?kind=task&id=ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
    "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "status": "completed",
    "completed_at": "2026-10-26T03:23:48.348Z",
    "created_at": "2026-10-26T03:23:48.335Z",
    "updated_at": "2026-10-26T03:23:48.348Z"
  }
}
```

### B → A foreign read task

```json
{
  "label": "B → A foreign read task",
  "method": "GET",
  "url": "/api/data?kind=task&id=544d567b-295a-4b74-9aeb-f0970c623a8f",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A own read session

```json
{
  "label": "B → A own read session",
  "method": "GET",
  "url": "/api/data?kind=session&id=10546b84-4566-42e4-91a1-df33c0c1fd28",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
    "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
    "started_at": "2026-10-01T00:00:00.000Z",
    "ended_at": "2026-10-01T00:30:00.000Z",
    "duration_minutes": 30,
    "blocked_reason": "",
    "created_at": "2026-10-26T03:23:48.345Z"
  }
}
```

### B → A foreign read session

```json
{
  "label": "B → A foreign read session",
  "method": "GET",
  "url": "/api/data?kind=session&id=49d09a09-f742-4556-97d4-e7b304ca06c3",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A own read topic

```json
{
  "label": "B → A own read topic",
  "method": "GET",
  "url": "/api/data?kind=topic&id=f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "created_at": "2026-10-26T03:23:48.353Z",
    "updated_at": "2026-10-26T03:23:48.353Z",
    "deleted_at": null
  }
}
```

### B → A foreign read topic

```json
{
  "label": "B → A foreign read topic",
  "method": "GET",
  "url": "/api/data?kind=topic&id=7b2f9462-4c91-4960-8e7c-3bc10aa25168",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A own read thought

```json
{
  "label": "B → A own read thought",
  "method": "GET",
  "url": "/api/data?kind=thought&id=8176a065-a7c9-4f31-99d6-7c2e5983afe9",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
    "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "created_at": "2026-10-26T03:23:48.355Z",
    "updated_at": "2026-10-26T03:23:48.355Z",
    "deleted_at": null
  }
}
```

### B → A foreign read thought

```json
{
  "label": "B → A foreign read thought",
  "method": "GET",
  "url": "/api/data?kind=thought&id=5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign editPlan

```json
{
  "label": "B → A foreign editPlan",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editPlan",
    "title": "test plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "category": "injected category",
    "id": "3d73813b-5386-439c-bd75-41f58f078e83"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign deletePlan

```json
{
  "label": "B → A foreign deletePlan",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deletePlan",
    "id": "3d73813b-5386-439c-bd75-41f58f078e83"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign setPlanCompleted

```json
{
  "label": "B → A foreign setPlanCompleted",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "setPlanCompleted",
    "id": "3d73813b-5386-439c-bd75-41f58f078e83",
    "is_completed": true
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign createTask

```json
{
  "label": "B → A foreign createTask",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "createTask",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign editTask

```json
{
  "label": "B → A foreign editTask",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editTask",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "id": "544d567b-295a-4b74-9aeb-f0970c623a8f"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign deleteTask

```json
{
  "label": "B → A foreign deleteTask",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteTask",
    "id": "544d567b-295a-4b74-9aeb-f0970c623a8f"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign setStatus

```json
{
  "label": "B → A foreign setStatus",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "setStatus",
    "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "status": "todo"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign addSession

```json
{
  "label": "B → A foreign addSession",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "addSession",
    "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T10:00",
    "blocked_reason": ""
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign editSession

```json
{
  "label": "B → A foreign editSession",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editSession",
    "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
    "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T10:00",
    "blocked_reason": ""
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign editSession

```json
{
  "label": "B → A foreign editSession",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editSession",
    "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
    "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T10:00",
    "blocked_reason": ""
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign deleteSession

```json
{
  "label": "B → A foreign deleteSession",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteSession",
    "id": "49d09a09-f742-4556-97d4-e7b304ca06c3"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign saveReview

```json
{
  "label": "B → A foreign saveReview",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveReview",
    "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
    "reflection": "attack",
    "improvement": "attack"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign carryForward

```json
{
  "label": "B → A foreign carryForward",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "carryForward",
    "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
    "start_date": "2026-10-06",
    "end_date": "2026-10-07"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign saveTopic

```json
{
  "label": "B → A foreign saveTopic",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveTopic",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 404,
  "response": {
    "error": "주제를 찾을 수 없습니다."
  }
}
```

### B → A foreign deleteTopic

```json
{
  "label": "B → A foreign deleteTopic",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteTopic",
    "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign saveThought

```json
{
  "label": "B → A foreign saveThought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveThought",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
    "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5"
  },
  "status": 404,
  "response": {
    "error": "주제 또는 생각을 찾을 수 없습니다."
  }
}
```

### B → A foreign deleteThought

```json
{
  "label": "B → A foreign deleteThought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteThought",
    "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A foreign saveThought

```json
{
  "label": "B → A foreign saveThought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveThought",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "d64bf98c-be06-4d18-9fa1-142a682de807",
    "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 404,
  "response": {
    "error": "자료를 찾을 수 없습니다."
  }
}
```

### B → A after

```json
{
  "label": "B → A after",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:48.632Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.502Z",
        "deleted_at": null
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      },
      {
        "id": 4,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.502Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "deleted_at": null,
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.309Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z",
        "deleted_at": null
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.317Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.321Z",
        "deleted_at": null
      }
    ],
    "completion_events": [
      {
        "id": 1,
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "event_key": "complete:544d567b-295a-4b74-9aeb-f0970c623a8f",
        "completed_at": "2026-10-26T03:23:48.309Z"
      }
    ]
  }
}
```

### B → A query/header spoof

```json
{
  "label": "B → A query/header spoof",
  "method": "GET",
  "url": "/api/data?owner_id=14022397-f1ff-4702-a67c-b8f9fd9df01f&user_id=14022397-f1ff-4702-a67c-b8f9fd9df01f",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "x-user-id": "14022397-f1ff-4702-a67c-b8f9fd9df01f",
    "x-owner-id": "14022397-f1ff-4702-a67c-b8f9fd9df01f",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      }
    ],
    "tasks": [
      {
        "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.348Z",
        "created_at": "2026-10-26T03:23:48.335Z",
        "updated_at": "2026-10-26T03:23:48.348Z"
      }
    ],
    "sessions": [
      {
        "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.345Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.351Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.353Z",
        "updated_at": "2026-10-26T03:23:48.353Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
        "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.355Z",
        "updated_at": "2026-10-26T03:23:48.355Z",
        "deleted_at": null
      }
    ]
  }
}
```

### B → A body spoof

```json
{
  "label": "B → A body spoof",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editPlan",
    "title": "test plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "category": "test category",
    "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
    "owner_id": "14022397-f1ff-4702-a67c-b8f9fd9df01f",
    "user_id": "14022397-f1ff-4702-a67c-b8f9fd9df01f"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B → A after spoof

```json
{
  "label": "B → A after spoof",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.641Z"
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      },
      {
        "id": 5,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.641Z"
      }
    ],
    "tasks": [
      {
        "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.348Z",
        "created_at": "2026-10-26T03:23:48.335Z",
        "updated_at": "2026-10-26T03:23:48.348Z"
      }
    ],
    "sessions": [
      {
        "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.345Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.351Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.353Z",
        "updated_at": "2026-10-26T03:23:48.353Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
        "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.355Z",
        "updated_at": "2026-10-26T03:23:48.355Z",
        "deleted_at": null
      }
    ]
  }
}
```

### owner mutation baseline

```json
{
  "label": "owner mutation baseline",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.502Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      },
      {
        "id": 4,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.502Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.309Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.317Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.321Z",
        "deleted_at": null
      }
    ]
  }
}
```

### owner edit task

```json
{
  "label": "owner edit task",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editTask",
    "title": "test task",
    "description": "",
    "due_date": "2026-10-02",
    "priority": "high",
    "tag": "",
    "estimated_minutes": 30,
    "start_time": null,
    "end_time": null,
    "id": "544d567b-295a-4b74-9aeb-f0970c623a8f"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### owner edit session

```json
{
  "label": "owner edit session",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "editSession",
    "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
    "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
    "started": "2026-10-01T09:00",
    "ended": "2026-10-01T09:40",
    "blocked_reason": ""
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### owner edit topic

```json
{
  "label": "owner edit topic",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveTopic",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### owner edit thought

```json
{
  "label": "owner edit thought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "saveThought",
    "title": "test topic",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "blocks": [
      "private test"
    ],
    "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
    "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### owner delete thought

```json
{
  "label": "owner delete thought",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteThought",
    "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### owner delete topic

```json
{
  "label": "owner delete topic",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteTopic",
    "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### owner delete session

```json
{
  "label": "owner delete session",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteSession",
    "id": "49d09a09-f742-4556-97d4-e7b304ca06c3"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### owner delete task

```json
{
  "label": "owner delete task",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deleteTask",
    "id": "544d567b-295a-4b74-9aeb-f0970c623a8f"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### owner delete plan

```json
{
  "label": "owner delete plan",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "deletePlan",
    "id": "3d73813b-5386-439c-bd75-41f58f078e83"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### soft deleted own records export

```json
{
  "label": "soft deleted own records export",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:48.696Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.687Z",
        "deleted_at": "2026-10-26T03:23:48.687Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      },
      {
        "id": 4,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.502Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "deleted_at": "2026-10-26T03:23:48.685Z",
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.685Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:40:00.000Z",
        "duration_minutes": 40,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z",
        "deleted_at": "2026-10-26T03:23:48.682Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.680Z",
        "deleted_at": "2026-10-26T03:23:48.680Z"
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.677Z",
        "deleted_at": "2026-10-26T03:23:48.677Z"
      }
    ],
    "completion_events": [
      {
        "id": 1,
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "event_key": "complete:544d567b-295a-4b74-9aeb-f0970c623a8f",
        "completed_at": "2026-10-26T03:23:48.309Z"
      }
    ]
  }
}
```

### soft deleted normal list

```json
{
  "label": "soft deleted normal list",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [],
    "revisions": [],
    "tasks": [],
    "sessions": [],
    "reviews": [],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [],
    "thoughts": []
  }
}
```

### owner identity

```json
{
  "label": "owner identity",
  "method": "GET",
  "url": "/api/auth/me",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "user": {
      "id": "14022397-f1ff-4702-a67c-b8f9fd9df01f",
      "email": "a@example.test",
      "expires_at": "2026-10-26T15:23:47.924Z"
    }
  }
}
```

### legacy after explicit admin transfer

```json
{
  "label": "legacy after explicit admin transfer",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "8499d468-feee-4443-a9ce-ed7e6b01d732",
        "title": "legacy private",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
        "priority": "medium",
        "success_criteria": "legacy",
        "estimated_minutes": null,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": null,
        "is_completed": false,
        "created_at": "2026-10-26T03:23:45.708Z",
        "updated_at": "2026-10-26T03:23:45.708Z"
      }
    ],
    "revisions": [
      {
        "id": 1,
        "plan_id": "8499d468-feee-4443-a9ce-ed7e6b01d732",
        "version": 1,
        "title": "legacy private",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
        "priority": "medium",
        "success_criteria": "legacy",
        "estimated_minutes": null,
        "carry_over_text": "",
        "category": null,
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:45.708Z"
      }
    ],
    "tasks": [],
    "sessions": [],
    "reviews": [],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [],
    "thoughts": []
  }
}
```

### cross site rejected

```json
{
  "label": "cross site rejected",
  "method": "POST",
  "url": "/api/data",
  "headers": {
    "origin": "https://foreign.example",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "action": "createPlan",
    "title": "test plan",
    "start_date": "2026-10-01",
    "end_date": "2026-10-05",
    "priority": "medium",
    "success_criteria": "test",
    "estimated_minutes": 100,
    "category": "test category"
  },
  "status": 403,
  "response": {
    "error": "허용되지 않은 요청입니다."
  }
}
```

### same cookie before logout

```json
{
  "label": "same cookie before logout",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "plans": [
      {
        "id": "8499d468-feee-4443-a9ce-ed7e6b01d732",
        "title": "legacy private",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
        "priority": "medium",
        "success_criteria": "legacy",
        "estimated_minutes": null,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": null,
        "is_completed": false,
        "created_at": "2026-10-26T03:23:45.708Z",
        "updated_at": "2026-10-26T03:23:45.708Z"
      }
    ],
    "revisions": [
      {
        "id": 1,
        "plan_id": "8499d468-feee-4443-a9ce-ed7e6b01d732",
        "version": 1,
        "title": "legacy private",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
        "priority": "medium",
        "success_criteria": "legacy",
        "estimated_minutes": null,
        "carry_over_text": "",
        "category": null,
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:45.708Z"
      }
    ],
    "tasks": [],
    "sessions": [],
    "reviews": [],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [],
    "thoughts": []
  }
}
```

### logout

```json
{
  "label": "logout",
  "method": "POST",
  "url": "/api/auth/logout",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {},
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### same cookie after logout

```json
{
  "label": "same cookie after logout",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 401,
  "response": {
    "error": "로그인이 필요합니다."
  }
}
```

### login again

```json
{
  "label": "login again",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "a@example.test",
    "password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### second device login

```json
{
  "label": "second device login",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "a@example.test",
    "password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### change password

```json
{
  "label": "change password",
  "method": "POST",
  "url": "/api/auth/password",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "current_password": "[REDACTED]",
    "new_password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### old session after password change

```json
{
  "label": "old session after password change",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 401,
  "response": {
    "error": "로그인이 필요합니다."
  }
}
```

### other device after password change

```json
{
  "label": "other device after password change",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 401,
  "response": {
    "error": "로그인이 필요합니다."
  }
}
```

### old password fails

```json
{
  "label": "old password fails",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "a@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### new password succeeds

```json
{
  "label": "new password succeeds",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "a@example.test",
    "password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### expired session

```json
{
  "label": "expired session",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 401,
  "response": {
    "error": "로그인이 필요합니다."
  }
}
```

### fresh login

```json
{
  "label": "fresh login",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "a@example.test",
    "password": "[REDACTED]"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### B before A deletion

```json
{
  "label": "B before A deletion",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:51.066Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.641Z",
        "deleted_at": null
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      },
      {
        "id": 5,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.641Z"
      }
    ],
    "tasks": [
      {
        "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.348Z",
        "deleted_at": null,
        "created_at": "2026-10-26T03:23:48.335Z",
        "updated_at": "2026-10-26T03:23:48.348Z"
      }
    ],
    "sessions": [
      {
        "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.345Z",
        "deleted_at": null
      }
    ],
    "reviews": [
      {
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.351Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.353Z",
        "updated_at": "2026-10-26T03:23:48.353Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
        "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.355Z",
        "updated_at": "2026-10-26T03:23:48.355Z",
        "deleted_at": null
      }
    ],
    "completion_events": [
      {
        "id": 2,
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "event_key": "complete:ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "completed_at": "2026-10-26T03:23:48.348Z"
      }
    ]
  }
}
```

### delete account wrong password

```json
{
  "label": "delete account wrong password",
  "method": "POST",
  "url": "/api/auth/delete-account",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "current_password": "[REDACTED]",
    "confirmation": "계정 삭제"
  },
  "status": 401,
  "response": {
    "error": "현재 비밀번호가 올바르지 않습니다."
  }
}
```

### before failed deletion

```json
{
  "label": "before failed deletion",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:51.397Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "8499d468-feee-4443-a9ce-ed7e6b01d732",
        "title": "legacy private",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
        "priority": "medium",
        "success_criteria": "legacy",
        "estimated_minutes": null,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": null,
        "is_completed": false,
        "created_at": "2026-10-26T03:23:45.708Z",
        "updated_at": "2026-10-26T03:23:45.708Z",
        "deleted_at": null
      },
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.687Z",
        "deleted_at": "2026-10-26T03:23:48.687Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      },
      {
        "id": 4,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.502Z"
      },
      {
        "id": 1,
        "plan_id": "8499d468-feee-4443-a9ce-ed7e6b01d732",
        "version": 1,
        "title": "legacy private",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
        "priority": "medium",
        "success_criteria": "legacy",
        "estimated_minutes": null,
        "carry_over_text": "",
        "category": null,
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:45.708Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "deleted_at": "2026-10-26T03:23:48.685Z",
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.685Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:40:00.000Z",
        "duration_minutes": 40,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z",
        "deleted_at": "2026-10-26T03:23:48.682Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.680Z",
        "deleted_at": "2026-10-26T03:23:48.680Z"
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.677Z",
        "deleted_at": "2026-10-26T03:23:48.677Z"
      }
    ],
    "completion_events": [
      {
        "id": 1,
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "event_key": "complete:544d567b-295a-4b74-9aeb-f0970c623a8f",
        "completed_at": "2026-10-26T03:23:48.309Z"
      }
    ]
  }
}
```

### deletion rolls back on DB failure

```json
{
  "label": "deletion rolls back on DB failure",
  "method": "POST",
  "url": "/api/auth/delete-account",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "current_password": "[REDACTED]",
    "confirmation": "계정 삭제"
  },
  "status": 503,
  "response": {
    "error": "서버에 연결하지 못했습니다. 설정을 확인하고 다시 시도하세요."
  }
}
```

### after failed deletion

```json
{
  "label": "after failed deletion",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:51.749Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "8499d468-feee-4443-a9ce-ed7e6b01d732",
        "title": "legacy private",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
        "priority": "medium",
        "success_criteria": "legacy",
        "estimated_minutes": null,
        "version": 1,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": null,
        "is_completed": false,
        "created_at": "2026-10-26T03:23:45.708Z",
        "updated_at": "2026-10-26T03:23:45.708Z",
        "deleted_at": null
      },
      {
        "id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.265Z",
        "updated_at": "2026-10-26T03:23:48.687Z",
        "deleted_at": "2026-10-26T03:23:48.687Z"
      }
    ],
    "revisions": [
      {
        "id": 2,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 1,
        "title": "A plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.265Z"
      },
      {
        "id": 4,
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.502Z"
      },
      {
        "id": 1,
        "plan_id": "8499d468-feee-4443-a9ce-ed7e6b01d732",
        "version": 1,
        "title": "legacy private",
        "start_date": "2026-01-01",
        "end_date": "2026-01-02",
        "priority": "medium",
        "success_criteria": "legacy",
        "estimated_minutes": null,
        "carry_over_text": "",
        "category": null,
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:45.708Z"
      }
    ],
    "tasks": [
      {
        "id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.309Z",
        "deleted_at": "2026-10-26T03:23:48.685Z",
        "created_at": "2026-10-26T03:23:48.276Z",
        "updated_at": "2026-10-26T03:23:48.685Z"
      }
    ],
    "sessions": [
      {
        "id": "49d09a09-f742-4556-97d4-e7b304ca06c3",
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:40:00.000Z",
        "duration_minutes": 40,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.304Z",
        "deleted_at": "2026-10-26T03:23:48.682Z"
      }
    ],
    "reviews": [
      {
        "plan_id": "3d73813b-5386-439c-bd75-41f58f078e83",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.314Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.317Z",
        "updated_at": "2026-10-26T03:23:48.680Z",
        "deleted_at": "2026-10-26T03:23:48.680Z"
      }
    ],
    "thoughts": [
      {
        "id": "5853dc34-c48b-4227-9c5a-c0532fdb9a5d",
        "topic_id": "7b2f9462-4c91-4960-8e7c-3bc10aa25168",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.321Z",
        "updated_at": "2026-10-26T03:23:48.677Z",
        "deleted_at": "2026-10-26T03:23:48.677Z"
      }
    ],
    "completion_events": [
      {
        "id": 1,
        "task_id": "544d567b-295a-4b74-9aeb-f0970c623a8f",
        "event_key": "complete:544d567b-295a-4b74-9aeb-f0970c623a8f",
        "completed_at": "2026-10-26T03:23:48.309Z"
      }
    ]
  }
}
```

### delete account

```json
{
  "label": "delete account",
  "method": "POST",
  "url": "/api/auth/delete-account",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": {
    "current_password": "[REDACTED]",
    "confirmation": "계정 삭제"
  },
  "status": 200,
  "response": {
    "ok": true
  }
}
```

### deleted account session

```json
{
  "label": "deleted account session",
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 401,
  "response": {
    "error": "로그인이 필요합니다."
  }
}
```

### B after A deletion

```json
{
  "label": "B after A deletion",
  "method": "GET",
  "url": "/api/data?export=1",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json",
    "cookie": "[REDACTED]"
  },
  "request": null,
  "status": 200,
  "response": {
    "exported_at": "2026-10-26T03:23:52.084Z",
    "schema_version": "pds-schema-v3-auth",
    "timezone": "Asia/Seoul",
    "duration_unit": "minutes",
    "plans": [
      {
        "id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "version": 2,
        "parent_plan_id": null,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "created_at": "2026-10-26T03:23:48.324Z",
        "updated_at": "2026-10-26T03:23:48.641Z",
        "deleted_at": null
      }
    ],
    "revisions": [
      {
        "id": 3,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 1,
        "title": "B plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.324Z"
      },
      {
        "id": 5,
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "version": 2,
        "title": "test plan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "priority": "medium",
        "success_criteria": "test",
        "estimated_minutes": 100,
        "carry_over_text": "",
        "category": "test category",
        "is_completed": false,
        "recorded_at": "2026-10-26T03:23:48.641Z"
      }
    ],
    "tasks": [
      {
        "id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "title": "test task",
        "description": "",
        "due_date": "2026-10-02",
        "priority": "high",
        "tag": "",
        "estimated_minutes": 30,
        "start_time": null,
        "end_time": null,
        "status": "completed",
        "completed_at": "2026-10-26T03:23:48.348Z",
        "deleted_at": null,
        "created_at": "2026-10-26T03:23:48.335Z",
        "updated_at": "2026-10-26T03:23:48.348Z"
      }
    ],
    "sessions": [
      {
        "id": "10546b84-4566-42e4-91a1-df33c0c1fd28",
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "started_at": "2026-10-01T00:00:00.000Z",
        "ended_at": "2026-10-01T00:30:00.000Z",
        "duration_minutes": 30,
        "blocked_reason": "",
        "created_at": "2026-10-26T03:23:48.345Z",
        "deleted_at": null
      }
    ],
    "reviews": [
      {
        "plan_id": "33f622dc-2692-4577-9099-8ccad6d9e79d",
        "reflection": "test reflection",
        "improvement": "test improvement",
        "next_plan_id": null,
        "updated_at": "2026-10-26T03:23:48.351Z"
      }
    ],
    "categories": [
      {
        "name": "test category"
      }
    ],
    "topics": [
      {
        "id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.353Z",
        "updated_at": "2026-10-26T03:23:48.353Z",
        "deleted_at": null
      }
    ],
    "thoughts": [
      {
        "id": "8176a065-a7c9-4f31-99d6-7c2e5983afe9",
        "topic_id": "f0deb5be-82cb-406e-9f16-dea7fdf6bce5",
        "title": "test topic",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "blocks": [
          "private test"
        ],
        "created_at": "2026-10-26T03:23:48.355Z",
        "updated_at": "2026-10-26T03:23:48.355Z",
        "deleted_at": null
      }
    ],
    "completion_events": [
      {
        "id": 2,
        "task_id": "ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "event_key": "complete:ac61a68a-706f-44b7-9b3d-a7f85a6e81f5",
        "completed_at": "2026-10-26T03:23:48.348Z"
      }
    ]
  }
}
```

### rate limit 0

```json
{
  "label": "rate limit 0",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 1

```json
{
  "label": "rate limit 1",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 2

```json
{
  "label": "rate limit 2",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 3

```json
{
  "label": "rate limit 3",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 4

```json
{
  "label": "rate limit 4",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 5

```json
{
  "label": "rate limit 5",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 6

```json
{
  "label": "rate limit 6",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 7

```json
{
  "label": "rate limit 7",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 8

```json
{
  "label": "rate limit 8",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 9

```json
{
  "label": "rate limit 9",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 401,
  "response": {
    "error": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### rate limit 10

```json
{
  "label": "rate limit 10",
  "method": "POST",
  "url": "/api/auth/login",
  "headers": {
    "origin": "http://localhost",
    "content-type": "application/json"
  },
  "request": {
    "email": "rate@example.test",
    "password": "[REDACTED]"
  },
  "status": 429,
  "response": {
    "error": "요청이 너무 많습니다. 15분 뒤 다시 시도하세요."
  }
}
```