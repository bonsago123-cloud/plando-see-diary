import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize} from '../lib/metrics.ts';
import type {Task, Session} from '../lib/types.ts';

const task: Task = {
 id:'task-a', plan_id:'plan', title:'학원 갈 준비를 하기', description:'', due_date:'2026-10-22',
 estimated_minutes:50, priority:'high', tag:'', start_time:'06:10', end_time:'07:00',
 status:'completed',completed_at:null,created_at:'',updated_at:''
};
const entry = (id:string,minutes:number,deleted_at:string|null=null):Session => ({
 id,task_id:task.id,started_at:'2026-10-21T21:00:00Z',ended_at:'2026-10-21T22:00:00Z',
 duration_minutes:minutes,blocked_reason:'',created_at:'',deleted_at
});

test('두 실행 기록은 합산하지만 잘못 입력한 기록을 제외하면 시간 차이가 바로 바뀐다',()=>{
 const original=entry('original',50);
 const corrected=entry('corrected',44);
 const before=summarize([task],[original,corrected],'2026-10-22');
 assert.equal(before.actual,94);
 assert.equal(before.difference,44);

 // API's normal GET excludes deleted_at != NULL, as tested separately in code review.
 const deleted={...original,deleted_at:'2026-10-22T00:00:00Z'};
 const live=[deleted,corrected].filter(session=>!session.deleted_at);
 const after=summarize([task],live,'2026-10-22');
 assert.equal(after.actual,44);
 assert.equal(after.estimated,50);
 assert.equal(after.difference,-6);
});

test('수정된 기록의 소요시간이 집계에 반영되고 완료 개수는 바뀌지 않는다',()=>{
 const before=summarize([task],[entry('one',50)],'2026-10-22');
 const after=summarize([task],[entry('one',44)],'2026-10-22');
 assert.equal(before.completed,1);
 assert.equal(after.completed,1);
 assert.equal(before.actual-after.actual,6);
});
