import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {build} from 'esbuild';
import {PGlite} from '@electric-sql/pglite';
import {NextRequest} from 'next/server.js';
import {assignLegacy} from '../lib/legacy-transfer.mjs';

test('T07 real handlers + PostgreSQL: auth, revocation, all resource isolation, export, account deletion',async()=>{
 const database=new PGlite(),temp=await mkdtemp(path.resolve('.auth-test-'));
 // Same lazy query/transaction contract as Neon; only the transport is replaced.
 const sql=Object.assign((parts:TemplateStringsArray,...values:unknown[])=>{
  const query=parts.reduce((s,p,i)=>s+(i?'$'+i:'')+p,'');
  return {query,values,then(resolve: (rows:unknown[])=>unknown,reject:(error:unknown)=>unknown){return database.query(query,values).then(r=>r.rows).then(resolve,reject)}};
 },{transaction:async(queries:{query:string;values:unknown[]}[])=>database.transaction(async tx=>{const result=[];for(const q of queries)result.push((await tx.query(q.query,q.values)).rows);return result})});
 (globalThis as Record<string,unknown>).__authSQL=sql;
 const evidence:{label:string;method:string;url:string;headers:Record<string,string>;request:unknown;status:number;response:unknown}[]=[];
 const snapshots:unknown[]=[];
 try{
  for(const file of ['db/schema.sql','db/migrations/20261024_latest_design.sql','db/migrations/20261026_auth.sql'])await database.exec(await readFile(file,'utf8'));
  await database.exec(await readFile('db/migrations/20261026_auth.sql','utf8')); // repeatable
  // Legacy rows MUST NOT be given to the first registrant.
  await database.exec("INSERT INTO plans(title,start_date,end_date,success_criteria) VALUES('legacy private','2026-01-01','2026-01-02','legacy')");
  for(const [name,file] of [['data','app/api/data/route.ts'],['auth','app/api/auth/[action]/route.ts'],['page','app/diary/page.tsx']]){
   await build({entryPoints:[file],bundle:true,platform:'node',format:'esm',outfile:path.join(temp,name+'.mjs'),packages:'external',jsx:'automatic',plugins:[{name:'test-transport',setup(b){
    b.onResolve({filter:/^next\/headers$/},()=>({path:'headers',namespace:'framework'}));
    b.onResolve({filter:/^next\/navigation$/},()=>({path:'navigation',namespace:'framework'}));
    b.onResolve({filter:/dashboard-client$/},()=>({path:'dashboard',namespace:'framework'}));
    b.onLoad({filter:/.*/,namespace:'framework'},args=>({contents:args.path==='headers'?"export const cookies=async()=>({get:()=>globalThis.__pageToken?{value:globalThis.__pageToken}:undefined});":args.path==='navigation'?"export const redirect=url=>{throw new Error('REDIRECT:'+url)};":"export default function Dashboard(){return null}",loader:'js'}));
    b.onResolve({filter:/^@\/lib\/db$/},()=>({path:'db',namespace:'mock'}));
    b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const db=()=>globalThis.__authSQL;',loader:'js'}));
    b.onResolve({filter:/^server-only$/},()=>({path:'empty',namespace:'empty'}));
    b.onLoad({filter:/.*/,namespace:'empty'},()=>({contents:'',loader:'js'}));
    b.onResolve({filter:/^next\/server$/},()=>({path:'next/server.js',external:true}));
   }}]});
  }
  const pageAPI=await import(path.join(temp,'page.mjs'));
  await assert.rejects(()=>pageAPI.default(),/REDIRECT:\/login/);
  const dataAPI=await import(path.join(temp,'data.mjs')),authAPI=await import(path.join(temp,'auth.mjs'));
  const redact=(value:unknown):unknown=>JSON.parse(JSON.stringify(value, (key,v)=>/password|token|cookie|secret/i.test(key)?'[REDACTED]':v));
  async function call(label:string,url:string,token='',body?:Record<string,unknown>,expected=200,extra:Record<string,string>={}){
   const method=body?'POST':'GET',headers:Record<string,string>={origin:'http://localhost','content-type':'application/json',...extra};
   if(token)headers.cookie='pds_session='+token;
   const request=new NextRequest('http://localhost'+url,{method,headers,body:body?JSON.stringify(body):undefined});
   const response=url.startsWith('/api/auth/')?await authAPI[method](request,{params:Promise.resolve({action:url.split('/').pop()})}):await dataAPI[method](request);
   const json=await response.json();assert.equal(response.status,expected,label+': '+JSON.stringify(json));
   evidence.push({label,method,url,headers:redact(headers) as Record<string,string>,request:redact(body??null),status:response.status,response:redact(json)});
   const responseText=JSON.stringify(json);assert.ok(!responseText.includes(password),'password in response');
   return {response,json,token:response.cookies.get('pds_session')?.value??''};
  }
  const password=randomBytes(24).toString('base64url');
  const a={email:'a@example.test',password},b={email:'b@example.test',password};
  await call('anonymous list','/api/data','',undefined,401);
  await call('anonymous export','/api/data?export=1','',undefined,401);
  await call('anonymous mutation','/api/data','',{action:'createPlan'},401);
  await call('register A','/api/auth/register','',a);
  await call('register B','/api/auth/register','',b);
  await call('duplicate normalized email','/api/auth/register','',{...a,email:' A@EXAMPLE.TEST '},409);
  const hashes=await database.query<{email:string;password_hash:string}>('SELECT email,password_hash FROM app_users ORDER BY email');
  assert.notEqual(hashes.rows[0].password_hash,hashes.rows[1].password_hash);
  for(const row of hashes.rows){assert.match(row.password_hash,/^scrypt\$131072\$8\$1\$/);assert.ok(!row.password_hash.includes(password))}
  const wrong=await call('wrong password','/api/auth/login','',{...a,password:randomBytes(24).toString('hex')},401);
  const missing=await call('missing user','/api/auth/login','',{...a,email:'missing@example.test'},401);assert.deepEqual(wrong.json,missing.json);
  let A=(await call('login A','/api/auth/login','',a)).token;
  const loginB=await call('login B','/api/auth/login','',b),B=loginB.token;
  assert.match(loginB.response.headers.get('set-cookie'),/HttpOnly/i);assert.match(loginB.response.headers.get('set-cookie'),/SameSite=strict/i);
  (globalThis as Record<string,unknown>).__pageToken=A;
  assert.ok(await pageAPI.default());
  delete (globalThis as Record<string,unknown>).__pageToken;
  assert.equal((await call('legacy not auto claimed','/api/data',A)).json.plans.length,0);
  const plan={title:'test plan',start_date:'2026-10-01',end_date:'2026-10-05',priority:'medium',success_criteria:'test',estimated_minutes:100,category:'test category'};
  const task={title:'test task',description:'',due_date:'2026-10-02',priority:'high',tag:'',estimated_minutes:30,start_time:null,end_time:null};
  const topic={title:'test topic',start_date:'2026-10-01',end_date:'2026-10-05',blocks:['private test']};
  for(const [label,token] of [['A',A],['B',B]]){
   await call(label+' create plan','/api/data',token,{action:'createPlan',...plan,title:label+' plan'});
   let d=(await call(label+' list','/api/data',token)).json;
   await call(label+' create task','/api/data',token,{action:'createTask',...task,plan_id:d.plans[0].id});
   d=(await call(label+' list','/api/data',token)).json;
   await call(label+' session','/api/data',token,{action:'addSession',task_id:d.tasks[0].id,started:'2026-10-01T09:00',ended:'2026-10-01T09:30',blocked_reason:''});
   await call(label+' complete','/api/data',token,{action:'setStatus',id:d.tasks[0].id,status:'completed'});
   await call(label+' review','/api/data',token,{action:'saveReview',plan_id:d.plans[0].id,reflection:'test reflection',improvement:'test improvement'});
   const topicId=crypto.randomUUID();
   await call(label+' topic','/api/data',token,{action:'saveTopic',...topic,id:topicId});
   await call(label+' thought','/api/data',token,{action:'saveThought',...topic,id:crypto.randomUUID(),topic_id:topicId});
  }
  for(const [label,mine,other] of [['A → B',A,B],['B → A',B,A]]){
   const before=(await call(label+' before','/api/data?export=1',other)).json;
   const otherUser=(await call(label+' identity','/api/auth/me',other)).json.user.id;
   const p=before.plans[0],t=before.tasks[0],s=before.sessions[0],tp=before.topics[0],th=before.thoughts[0];
   const own=(await call(label+' own list','/api/data',mine)).json;
   for(const [kind,id] of [['plan',p.id],['task',t.id],['session',s.id],['topic',tp.id],['thought',th.id]]){
    await call(label+' own read '+kind,'/api/data?kind='+kind+'&id='+({plan:own.plans[0].id,task:own.tasks[0].id,session:own.sessions[0].id,topic:own.topics[0].id,thought:own.thoughts[0].id} as Record<string,string>)[kind],mine);
    await call(label+' foreign read '+kind,'/api/data?kind='+kind+'&id='+id,mine,undefined,404);
   }
   const attacks=[
    {action:'editPlan',...plan,id:p.id,category:'injected category'}, {action:'deletePlan',id:p.id},{action:'setPlanCompleted',id:p.id,is_completed:true},
    {action:'createTask',...task,plan_id:p.id}, {action:'editTask',...task,id:t.id},{action:'deleteTask',id:t.id},{action:'setStatus',id:t.id,status:'todo'},
    {action:'addSession',task_id:t.id,started:'2026-10-01T09:00',ended:'2026-10-01T10:00',blocked_reason:''},
    {action:'editSession',id:s.id,task_id:own.tasks[0].id,started:'2026-10-01T09:00',ended:'2026-10-01T10:00',blocked_reason:''},
    {action:'editSession',id:own.sessions[0].id,task_id:t.id,started:'2026-10-01T09:00',ended:'2026-10-01T10:00',blocked_reason:''},
    {action:'deleteSession',id:s.id},{action:'saveReview',plan_id:p.id,reflection:'attack',improvement:'attack'},
    {action:'carryForward',plan_id:p.id,start_date:'2026-10-06',end_date:'2026-10-07'},
    {action:'saveTopic',...topic,id:tp.id},{action:'deleteTopic',id:tp.id},
    {action:'saveThought',...topic,id:th.id,topic_id:own.topics[0].id},{action:'deleteThought',id:th.id},
    {action:'saveThought',...topic,id:crypto.randomUUID(),topic_id:tp.id}
   ];
   for(const attack of attacks)await call(label+' foreign '+attack.action,'/api/data',mine,attack,404);
   const after=(await call(label+' after','/api/data?export=1',other)).json;
   delete before.exported_at;delete after.exported_at;assert.deepEqual(after,before,'foreign account changed');
   snapshots.push({direction:label,before:Object.fromEntries(Object.entries(before).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,(v as unknown[]).length])),after:Object.fromEntries(Object.entries(after).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,(v as unknown[]).length])),allContentsUnchanged:true});
   const spoofed=(await call(label+' query/header spoof','/api/data?owner_id='+otherUser+'&user_id='+otherUser,mine,undefined,200,{'x-user-id':otherUser,'x-owner-id':otherUser})).json;
   assert.deepEqual(spoofed,own);
   await call(label+' body spoof','/api/data',mine,{action:'editPlan',...plan,id:own.plans[0].id,owner_id:otherUser,user_id:otherUser});
   assert.equal((await call(label+' after spoof','/api/data',mine)).json.plans.length,1);
  }
  // Positive counterparts: owners can edit/delete every resource protected above.
  const mine=(await call('owner mutation baseline','/api/data',A)).json;
  await call('owner edit task','/api/data',A,{action:'editTask',...task,id:mine.tasks[0].id});
  await call('owner edit session','/api/data',A,{action:'editSession',id:mine.sessions[0].id,task_id:mine.tasks[0].id,started:'2026-10-01T09:00',ended:'2026-10-01T09:40',blocked_reason:''});
  const edited=(await call('edited timestamp read','/api/data',A)).json.sessions[0];
  assert.equal(mine.sessions[0].updated_at,null);
  assert.equal(edited.created_at,mine.sessions[0].created_at);
  assert.ok(Date.parse(edited.updated_at)>=Date.parse(edited.created_at));
  assert.equal(edited.duration_minutes,40);
  await call('second edit ignores supplied audit timestamps','/api/data',A,{action:'editSession',id:edited.id,task_id:edited.task_id,started:'2026-10-01T09:00',ended:'2026-10-01T09:41',blocked_reason:'edited',created_at:'2000-01-01',updated_at:'2000-01-01'});
  const editedAgain=(await call('latest edit timestamp read','/api/data',A)).json.sessions[0];
  assert.equal(editedAgain.created_at,edited.created_at);
  assert.ok(Date.parse(editedAgain.updated_at)>Date.parse(edited.updated_at));
  assert.equal(editedAgain.duration_minutes,41);
  await call('owner edit topic','/api/data',A,{action:'saveTopic',...topic,id:mine.topics[0].id});
  await call('owner edit thought','/api/data',A,{action:'saveThought',...topic,id:mine.thoughts[0].id,topic_id:mine.topics[0].id});
  await call('owner delete thought','/api/data',A,{action:'deleteThought',id:mine.thoughts[0].id});
  await call('owner delete topic','/api/data',A,{action:'deleteTopic',id:mine.topics[0].id});
  await call('owner delete session','/api/data',A,{action:'deleteSession',id:mine.sessions[0].id});
  await call('owner delete task','/api/data',A,{action:'deleteTask',id:mine.tasks[0].id});
  await call('owner delete plan','/api/data',A,{action:'deletePlan',id:mine.plans[0].id});
  const deletedExport=(await call('soft deleted own records export','/api/data?export=1',A)).json;
  assert.equal(deletedExport.plans.length,1);assert.equal(deletedExport.sessions.length,1);assert.equal(deletedExport.thoughts.length,1);
  assert.equal((await call('soft deleted normal list','/api/data',A)).json.plans.length,0);
  // One-time transfer requires an administrator with DB credentials, not a public request.
  const aId=(await call('owner identity','/api/auth/me',A)).json.user.id;
  const transfer=await assignLegacy(sql,aId);assert.equal(transfer[3].length,1);
  const repeat=await assignLegacy(sql,aId);assert.equal(repeat[3].length,0);
  const afterTransfer=(await call('legacy after explicit admin transfer','/api/data',A)).json;
  assert.equal(afterTransfer.plans[0].title,'legacy private');
  await call('cross site rejected','/api/data',A,{action:'createPlan',...plan},403,{origin:'https://foreign.example'});
  const beforeLogout=await call('same cookie before logout','/api/data',A);
  await call('logout','/api/auth/logout',A,{});
  await call('same cookie after logout','/api/data',A,undefined,401);
  assert.equal(beforeLogout.response.headers.get('cache-control'),'no-store');
  A=(await call('login again','/api/auth/login','',a)).token;
  const A2=(await call('second device login','/api/auth/login','',a)).token;
  const newPassword=randomBytes(24).toString('hex');
  await call('change password','/api/auth/password',A,{current_password:password,new_password:newPassword});
  await call('old session after password change','/api/data',A,undefined,401);
  await call('other device after password change','/api/data',A2,undefined,401);
  await call('old password fails','/api/auth/login','',a,401);
  A=(await call('new password succeeds','/api/auth/login','',{...a,password:newPassword})).token;
  const sessions=await database.query<{token_hash:string}>('SELECT token_hash FROM auth_sessions');assert.ok(sessions.rows.every(r=>r.token_hash!==A&&r.token_hash!==B));
  await database.exec("UPDATE auth_sessions SET expires_at=now()-interval '1 second' WHERE user_id=(SELECT id FROM app_users WHERE email='a@example.test')");
  await call('expired session','/api/data',A,undefined,401);
  A=(await call('fresh login','/api/auth/login','',{...a,password:newPassword})).token;
  const bBefore=(await call('B before A deletion','/api/data?export=1',B)).json;
  await call('delete account wrong password','/api/auth/delete-account',A,{current_password:password,confirmation:'계정 삭제'},401);
  // Force a late database failure to prove earlier deletes roll back.
  await database.exec("CREATE FUNCTION test_block_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test rollback'; END $$; CREATE TRIGGER test_block_delete BEFORE DELETE ON app_users FOR EACH ROW EXECUTE FUNCTION test_block_delete()");
  const rollbackBefore=(await call('before failed deletion','/api/data?export=1',A)).json;
  await call('deletion rolls back on DB failure','/api/auth/delete-account',A,{current_password:newPassword,confirmation:'계정 삭제'},503);
  const rollbackAfter=(await call('after failed deletion','/api/data?export=1',A)).json;
  delete rollbackBefore.exported_at;delete rollbackAfter.exported_at;assert.deepEqual(rollbackAfter,rollbackBefore);
  await database.exec('DROP TRIGGER test_block_delete ON app_users; DROP FUNCTION test_block_delete()');
  await call('delete account','/api/auth/delete-account',A,{current_password:newPassword,confirmation:'계정 삭제'});
  await call('deleted account session','/api/data',A,undefined,401);
  const bAfter=(await call('B after A deletion','/api/data?export=1',B)).json;
  delete bBefore.exported_at;delete bAfter.exported_at;assert.deepEqual(bAfter,bBefore);
  assert.equal((await database.query("SELECT id FROM app_users WHERE email='a@example.test'")).rows.length,0);
  const remaining=await database.query<{n:number}>("SELECT count(*)::int AS n FROM plans WHERE owner_id IS NOT NULL");assert.equal(remaining.rows[0].n,1);
  for(let i=0;i<11;i++)await call('rate limit '+i,'/api/auth/login','',{email:'rate@example.test',password},i<10?401:429);
  if(process.env.AUTH_EVIDENCE_PATH){
   const report='# T07 자동 통합 검사 결과\n\n실제 배포/사람의 수동 확인이 아닌, 로컬 PGlite PostgreSQL + 실제 Next.js 요청 처리 함수 검사입니다. 임시 시험 계정과 자료만 사용했으며 5일 실사용 기록이 아닙니다.\n\n'+
    '비밀번호 저장 방식: scrypt (N=131072, r=8, p=1), 계정별 무작위 16바이트 salt. 동일 비밀번호의 두 계정 저장값:\n\n```json\n'+JSON.stringify(hashes.rows,null,2)+'\n```\n\n## 거절 전후 비교\n\n```json\n'+JSON.stringify(snapshots,null,2)+'\n```\n\n## 실제 요청·응답 (민감값 마스킹)\n\n'+evidence.map(e=>'### '+e.label+'\n\n```json\n'+JSON.stringify(e,null,2)+'\n```').join('\n\n');
   assert.ok(!report.includes(password));assert.ok(!report.includes(newPassword));assert.ok(!report.includes(A));assert.ok(!report.includes(B));
   await writeFile(process.env.AUTH_EVIDENCE_PATH,report);
  }
 }finally{await database.close();delete (globalThis as Record<string,unknown>).__authSQL;await rm(temp,{recursive:true,force:true})}
});
