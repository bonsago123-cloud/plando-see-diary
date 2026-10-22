import test from 'node:test';
import assert from 'node:assert/strict';
import {compareTaskTime,taskTimeBarPercent} from '../lib/metrics.ts';
import type {Task,Session} from '../lib/types.ts';
const task=(estimate:number|null):Pick<Task,'id'|'estimated_minutes'>=>({id:'preparation',estimated_minutes:estimate});
const entry=(id:string,minutes:number,deleted_at:string|null=null):Pick<Session,'task_id'|'duration_minutes'|'deleted_at'> & {id:string}=>({id,task_id:'preparation',duration_minutes:minutes,deleted_at});

test('예상 50분, 실제 44분이면 6분 단축',()=>{
 assert.deepEqual(compareTaskTime(task(50),[entry('a',44)]),{actual:44,difference:-6});
});
test('예상 50분, 실제 94분이면 44분 초과',()=>{
 assert.deepEqual(compareTaskTime(task(50),[entry('a',50),entry('b',44)]),{actual:94,difference:44});
});
test('삭제한 실행 기록은 개별 비교에서 제외',()=>{
 assert.deepEqual(compareTaskTime(task(50),[entry('a',50,'2026-10-22T06:00:00Z'),entry('b',44)]),{actual:44,difference:-6});
});
test('실제 기록이 없는 할 일은 0분 단축으로 오인하지 않음',()=>{
 assert.deepEqual(compareTaskTime(task(50),[]),{actual:null,difference:null});
});
test('예상 시간 설정이 없는 할 일은 실제 시간만 계산',()=>{
 assert.deepEqual(compareTaskTime(task(null),[entry('a',17)]),{actual:17,difference:null});
});
test('0분 실제 기록이 있는 경우 미기록과 구분하고 차이 계산',()=>{
 assert.deepEqual(compareTaskTime(task(0),[entry('a',0)]),{actual:0,difference:0});
});

test('비교 막대: 실제 44분은 예상 50분의 88%',()=>{
 assert.equal(taskTimeBarPercent(50,44),88);
});
test('비교 막대: 시간 초과는 100%로 제한하고 붉은 표시와 수치를 사용',()=>{
 assert.equal(taskTimeBarPercent(50,94),100);
});
test('비교 막대: 실행이 없거나 예상 시간이 설정되지 않으면 나타나지 않음',()=>{
 assert.equal(taskTimeBarPercent(50,null),null);
 assert.equal(taskTimeBarPercent(null,44),null);
 assert.equal(taskTimeBarPercent(0,44),null);
});
test('비교 막대: 실제 0분은 0%, 예상보다 적은 시간으로 인식',()=>{
 assert.equal(taskTimeBarPercent(50,0),0);
});
