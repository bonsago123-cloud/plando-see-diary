import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import ts from 'typescript';
import {NextRequest} from 'next/server.js';
import {calendarItems,itemsOn,monthDays} from '../lib/calendar.ts';
import {summarize} from '../lib/metrics.ts';
import type {Dashboard} from '../lib/types.ts';

test('latest design: real API SQL roundtrip, plan history/completion, thought hierarchy, export and assignment metrics',async()=>{
 const database=new PGlite();
 const sql=async(strings:TemplateStringsArray,...values:unknown[])=>{
  const query=strings.reduce((out,part,i)=>out+(i?'$'+i:'')+part,'');
  const result=await database.query(query,values);return result.rows;
 };
 const temp=await mkdtemp(path.resolve('.route-test-'));
 (globalThis as Record<string,unknown>).__latestTestSql=sql;
 try{
  await database.exec(await readFile('db/schema.sql','utf8'));
  const migration=await readFile('db/migrations/20261024_latest_design.sql','utf8');await database.exec(migration);await database.exec(migration);
  await database.exec(await readFile('db/migrations/20261026_auth.sql','utf8'));
  const testOwner='11111111-1111-4111-8111-111111111111';
  await database.query('INSERT INTO app_users(id,email,password_hash) VALUES($1,$2,$3)',[testOwner,'regression@example.test','not-a-login-hash']);
  const source=(await readFile('app/api/data/route.ts','utf8')).replace("import {db} from '@/lib/db';","const db=()=>globalThis.__latestTestSql;").replace("from 'next/server'","from 'next/server.js'").replace("import {AccessError,assertSameOrigin,authError,requireUser} from '@/lib/auth';", `class AccessError extends Error {constructor(status,message){super(message);this.status=status}}; const assertSameOrigin=()=>{}; const requireUser=async()=>({id:'${testOwner}'}); const authError=e=>NextResponse.json({error:e.message},{status:e.status});`);
  await writeFile(path.join(temp,'route.mjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
  const api=await import(path.join(temp,'route.mjs'));
  async function get(exported=false):Promise<Dashboard & {completion_events:unknown[]}>{const res=await api.GET(new NextRequest('http://localhost/api/data'+(exported?'?export=1':'')));assert.equal(res.status,200);return res.json()}
  async function post(action:string,payload:Record<string,unknown>,status=200){const res=await api.POST(new NextRequest('http://localhost/api/data',{method:'POST',body:JSON.stringify({action,...payload})}));const data=await res.json();assert.equal(res.status,status,JSON.stringify(data));return data}
  const plan={title:'원래 계획',start_date:'2026-10-01',end_date:'2026-10-03',priority:'medium',success_criteria:'기준',estimated_minutes:120,category:'공부'};
  await post('createPlan',plan);let data=await get();const p=data.plans[0];assert.equal(p.category,'공부');assert.equal(p.is_completed,false);
  await post('editPlan',{...plan,id:p.id,title:'수정 계획',category:'개발'});
  await post('setPlanCompleted',{id:p.id,is_completed:true});await post('setPlanCompleted',{id:p.id,is_completed:true});
  data=await get();assert.equal(data.plans[0].is_completed,true);assert.equal(data.revisions.length,3);assert.equal(data.revisions[0].title,'원래 계획');assert.equal(data.revisions[0].category,'공부');
  await post('setPlanCompleted',{id:p.id,is_completed:false});
  const task={plan_id:p.id,title:'실제 할 일',description:'설명',due_date:'2026-10-02',priority:'high',tag:'태그',estimated_minutes:60,start_time:'06:10',end_time:'07:10'};
  await post('createTask',task);data=await get();const t=data.tasks[0];assert.equal(t.start_time,'06:10');
  await post('addSession',{task_id:t.id,started:'2026-10-04T06:10',ended:'2026-10-04T06:40',blocked_reason:'확인'});
  data=await get();assert.equal(summarize(data.tasks,data.sessions,'2026-10-05').overdue,1);assert.equal(data.tasks[0].estimated_minutes,60);assert.equal(data.sessions[0].duration_minutes,30);
  await post('setStatus',{id:t.id,status:'completed'});await post('setStatus',{id:t.id,status:'completed'});data=await get(true);assert.equal(data.completion_events.length,1);assert.equal(summarize(data.tasks,data.sessions,'2026-10-05').completed,1);assert.equal(summarize(data.tasks,data.sessions,'2026-10-05').overdue,0);
  await post('setStatus',{id:t.id,status:'doing'});data=await get();assert.equal(data.tasks[0].completed_at,null);
  await post('setStatus',{id:t.id,status:'failed'},400);
  const topicId=crypto.randomUUID(),thoughtId=crypto.randomUUID();const topic={id:topicId,title:'주제',start_date:'2026-10-02',end_date:'2026-10-06',blocks:['첫째','둘째']};
  await post('saveTopic',topic);await post('saveTopic',topic);
  await post('saveThought',{...topic,id:thoughtId,topic_id:topicId,title:'생각',blocks:['<script>alert(1)</script>','생각 내용']});
  data=await get();assert.equal(data.topics?.length,1);assert.equal(data.thoughts?.[0].blocks[0],'<script>alert(1)</script>');
  const entries=calendarItems(data);assert.equal(itemsOn(entries,'2026-10-06').filter(i=>i.kind==='thought').length,1);assert.equal(itemsOn(entries,'2026-10-07').length,0);assert.equal(itemsOn(entries,'2026-10-04').some(i=>i.kind==='session'),true);
  await post('saveTopic',{...topic,end_date:'2026-09-01'},400);await post('saveTopic',{...topic,start_date:'2026-02-30'},400);
  await post('saveReview',{plan_id:p.id,reflection:'회고',improvement:'넉넉한 시간'});await post('carryForward',{plan_id:p.id,start_date:'2026-10-07',end_date:'2026-10-10'});data=await get();assert.equal(data.plans[1].category,'개발');assert.equal(data.plans[1].carry_over_text,'넉넉한 시간');assert.equal(data.plans[1].is_completed,false);
  await post('deleteTopic',{id:topicId});data=await get();assert.equal(data.topics?.length,0);assert.equal(data.thoughts?.length,0);data=await get(true);assert.equal(data.topics?.length,1);assert.equal(data.thoughts?.length,1);
  await post('saveTopic',topic,404);
 }finally{await database.close();delete (globalThis as Record<string,unknown>).__latestTestSql;await rm(temp,{recursive:true,force:true})}
});

test('month grid includes leap day and spans six weeks',()=>{const days=monthDays('2024-02');assert.equal(days.length,42);assert.ok(days.includes('2024-02-29'));assert.equal(new Date(days[0]+'T00:00:00Z').getUTCDay(),0)});
test('latest design does not alter original task status controls',async()=>{const text=await readFile('lib/task-status.ts','utf8');assert.ok(text.includes("value:'completed',label:'완료'"));assert.ok(!text.includes('수고했어'));assert.ok(!text.includes("value:'failed'"))});
