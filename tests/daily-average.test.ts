import test from 'node:test';
import assert from 'node:assert/strict';
import {recordedDayStats} from '../lib/metrics.ts';
test('기록일 평균은 서울 시작일, 같은 날 합산, 삭제/타인 할 일 제외, 미기록 제외',()=>{
 const entry=(started_at:string,duration_minutes:number,task_id='a',deleted_at:string|null=null)=>({started_at,duration_minutes,task_id,deleted_at});
 const value=recordedDayStats([{id:'a'}],[entry('2026-10-01T14:30:00Z',10),entry('2026-10-01T15:30:00Z',20),entry('2026-10-02T01:00:00Z',40),entry('2026-10-03T00:00:00Z',999,'other'),entry('2026-10-03T00:00:00Z',999,'a','2026-10-03')]);
 assert.deepEqual(value,{total:70,days:2,average:35});
 assert.deepEqual(recordedDayStats([{id:'a'}],[]),{total:0,days:0,average:null});
 assert.equal(recordedDayStats([{id:'a'}],[entry('2026-10-01T00:00:00Z',1),entry('2026-10-02T00:00:00Z',1),entry('2026-10-03T00:00:00Z',0)]).average,0.67);
});
