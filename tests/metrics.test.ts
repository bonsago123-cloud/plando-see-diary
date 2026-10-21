import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize,evidenceTasks,taskIsOverdue,seoulToday} from '../lib/metrics.ts';
import type {Task,Session} from '../lib/types.ts';
const t=(id:string,status:Task['status'],due_date:string,estimated_minutes:number):Task=>({id,plan_id:'plan',title:id,description:'',due_date,estimated_minutes,priority:'medium',tag:'',start_time:null,end_time:null,status,completed_at:null,created_at:'',updated_at:''});
const s=(id:string,task_id:string,duration_minutes:number,blocked_reason=''):Session=>({id,task_id,duration_minutes,blocked_reason,started_at:'',ended_at:'',created_at:''});
test('빈 기록은 모든 집계가 0',()=>assert.deepEqual(summarize([],[],'2026-10-20'),{planned:0,completed:0,overdue:0,blocked:0,estimated:0,actual:0,difference:0}));
test('완료된 과거 마감은 지연으로 중복 계산하지 않는다',()=>{
 const tasks=[t('a','completed','2026-10-18',60),t('b','doing','2026-10-19',120),t('c','todo','2026-10-20',30)];
 const sessions=[s('1','a',35,'복잡함'),s('2','a',15,'또 막힘'),s('3','b',160)];
 assert.deepEqual(summarize(tasks,sessions,'2026-10-20'),{planned:3,completed:1,overdue:1,blocked:1,estimated:210,actual:210,difference:0});
 assert.deepEqual(evidenceTasks('blocked',tasks,sessions,'2026-10-20').map(t=>t.id),['a']);
 assert.equal(taskIsOverdue(tasks[0],'2026-10-20'),false);
});
test('서울 기준 오늘을 기준으로 비교한다',()=>{
 assert.equal(seoulToday(new Date('2026-10-19T16:00:00Z')),'2026-10-20');
});

test('예상 시간을 설정하지 않은 NULL과 실제 0분을 구별하고 합계에서는 제외한다',()=>{
 const tasks=[t('a','todo','2026-10-20',30),t('b','todo','2026-10-20',0),{...t('c','todo','2026-10-20',0),estimated_minutes:null}];
 assert.equal(tasks[1].estimated_minutes,0);
 assert.equal(tasks[2].estimated_minutes,null);
 assert.equal(summarize(tasks,[],'2026-10-20').estimated,30);
 assert.equal(summarize([tasks[2]],[],'2026-10-20').estimated,0);
});
