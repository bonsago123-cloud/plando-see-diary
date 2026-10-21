import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const revalidate=0;
const isoDay=/^\d{4}-\d{2}-\d{2}$/;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const err=(message:string,status=400)=>NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
function str(v:unknown,name:string,max=200,required=false):string {
 if(typeof v!=='string'||v.length>max||(required&&!v.trim())) throw Error(`${name}: 올바른 내용을 입력하세요.`);
 return v.trim();
}
function id(v:unknown):string {if(typeof v!=='string'||!uuid.test(v))throw Error('ID가 올바르지 않습니다.');return v;}
function day(v:unknown,name:string):string {
 if(typeof v!=='string'||!isoDay.test(v)||Number.isNaN(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(`${name}: 날짜가 올바르지 않습니다.`);
 return v;
}
function minute(v:unknown):number|null {
 if(v===null)return null; // NULL means the estimate feature does not apply. 0 means enabled and zero minutes.
 if(typeof v!=='number'||!Number.isInteger(v)||v<0||v>1_000_000)throw Error('예상 시간은 0 이상의 정수(분)여야 합니다.');
 return v;
}
function clockTime(v:unknown):string|null {
 if(v===null)return null;
 if(typeof v!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(v))throw Error('시간대가 올바르지 않습니다.');
 return v;
}
function priority(v:unknown):string {if(v!=='high'&&v!=='medium'&&v!=='low')throw Error('우선순위가 올바르지 않습니다.');return v;}
type PlanFields={title:string;priority:string;estimated:number|null;start:string;end:string;success:string};
type TaskFields={title:string;priority:string;estimated:number|null;due:string;tag:string;description:string;startTime:string|null;endTime:string|null};
function fields(x:Record<string,unknown>,type:'plan'):PlanFields;
function fields(x:Record<string,unknown>,type:'task'):TaskFields;
function fields(x:Record<string,unknown>,type:'plan'|'task'):PlanFields|TaskFields {
 const title=str(x.title,'제목',type==='plan'?120:160,true);
 const p=priority(x.priority);
 const estimated=minute(x.estimated_minutes);
 if(type==='plan') {
  const start=day(x.start_date,'시작일'),end=day(x.end_date,'종료일');
  if(end<start)throw Error('종료일은 시작일보다 빠를 수 없습니다.');
  return {title,priority:p,estimated,start,end,success:str(x.success_criteria,'성공 기준',1000,true)};
 }
 const startTime=clockTime(x.start_time),endTime=clockTime(x.end_time);
 if((startTime===null)!==(endTime===null))throw Error('시작 시간과 종료 시간을 모두 설정하세요.');
 if(startTime!==null&&endTime!==null&&endTime<=startTime)throw Error('종료 시간은 시작 시간보다 늦어야 합니다.');
 return {title,priority:p,estimated,due:day(x.due_date,'마감일'),tag:str(x.tag,'태그',50),description:str(x.description,'설명',1000),startTime,endTime};
}
function seoulInstant(v:unknown,label:string):string {
 if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v))throw Error(`${label}: 날짜와 시간을 입력하세요.`);
 const date=new Date(v+'+09:00');
 if(!Number.isFinite(date.getTime()) || new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(date).replace(' ','T')!==v)throw Error(`${label}: 존재하지 않는 시각입니다.`);
 return date.toISOString();
}
function dbError(e:unknown){
 const message=e instanceof Error?e.message:'';
 if(message==='DATABASE_NOT_CONFIGURED')return err('Neon DATABASE_URL이 설정되지 않았습니다. README의 연결 방법을 확인하세요.',503);
 if(/relation .* does not exist/i.test(message))return err('Neon 테이블이 없습니다. db/schema.sql을 먼저 실행하세요.',503);
 // Do not return raw SQL, database host, database credentials or internal exception messages to clients.
 console.error('Database operation failed:',message.replace(/postgres(?:ql)?:\/\/\S+/g,'[redacted database url]').slice(0,250));
 return err('데이터를 처리하지 못했습니다. 입력 내용과 데이터베이스 연결 상태를 확인하세요.',500);
}
const opts={headers:{'Cache-Control':'no-store'}};
async function loadAll(includeDeleted=false){
 const sql=db();
 const [plans,revisions,tasks,sessions,reviews]=await Promise.all([
  includeDeleted
   ?sql`SELECT id,title,to_char(start_date,'YYYY-MM-DD') AS start_date,to_char(end_date,'YYYY-MM-DD') AS end_date,priority,success_criteria,estimated_minutes,version,parent_plan_id,carry_over_text,created_at,updated_at,deleted_at FROM plans ORDER BY created_at ASC,id ASC`
   :sql`SELECT id,title,to_char(start_date,'YYYY-MM-DD') AS start_date,to_char(end_date,'YYYY-MM-DD') AS end_date,priority,success_criteria,estimated_minutes,version,parent_plan_id,carry_over_text,created_at,updated_at FROM plans WHERE deleted_at IS NULL ORDER BY created_at ASC,id ASC`,
  includeDeleted
   ?sql`SELECT id,plan_id,version,title,to_char(start_date,'YYYY-MM-DD') AS start_date,to_char(end_date,'YYYY-MM-DD') AS end_date,priority,success_criteria,estimated_minutes,carry_over_text,recorded_at FROM plan_revisions ORDER BY plan_id,version`
   :sql`SELECT id,plan_id,version,title,to_char(start_date,'YYYY-MM-DD') AS start_date,to_char(end_date,'YYYY-MM-DD') AS end_date,priority,success_criteria,estimated_minutes,carry_over_text,recorded_at FROM plan_revisions r WHERE EXISTS (SELECT 1 FROM plans p WHERE p.id=r.plan_id AND p.deleted_at IS NULL) ORDER BY plan_id,version`,
  includeDeleted
   ?sql`SELECT id,plan_id,title,description,to_char(due_date,'YYYY-MM-DD') AS due_date,priority,tag,estimated_minutes,to_char(start_time,'HH24:MI') AS start_time,to_char(end_time,'HH24:MI') AS end_time,status,completed_at,deleted_at,created_at,updated_at FROM tasks ORDER BY created_at,id`
   :sql`SELECT id,plan_id,title,description,to_char(due_date,'YYYY-MM-DD') AS due_date,priority,tag,estimated_minutes,to_char(start_time,'HH24:MI') AS start_time,to_char(end_time,'HH24:MI') AS end_time,status,completed_at,created_at,updated_at FROM tasks t WHERE t.deleted_at IS NULL AND EXISTS (SELECT 1 FROM plans p WHERE p.id=t.plan_id AND p.deleted_at IS NULL) ORDER BY created_at,id`,
  includeDeleted
   ?sql`SELECT id,task_id,started_at,ended_at,duration_minutes,blocked_reason,created_at FROM work_sessions ORDER BY started_at DESC,id`
   :sql`SELECT id,task_id,started_at,ended_at,duration_minutes,blocked_reason,created_at FROM work_sessions s WHERE EXISTS (SELECT 1 FROM tasks t JOIN plans p ON p.id=t.plan_id WHERE t.id=s.task_id AND p.deleted_at IS NULL) ORDER BY started_at DESC,id`,
  includeDeleted
   ?sql`SELECT plan_id,reflection,improvement,next_plan_id,updated_at FROM reviews ORDER BY updated_at DESC`
   :sql`SELECT plan_id,reflection,improvement,next_plan_id,updated_at FROM reviews r WHERE EXISTS (SELECT 1 FROM plans p WHERE p.id=r.plan_id AND p.deleted_at IS NULL) ORDER BY updated_at DESC`
 ]);
 return {plans,revisions,tasks,sessions,reviews};
}
export async function GET(req:NextRequest){
 try{
  const exportAll=req.nextUrl.searchParams.get('export')==='1';
  const data=await loadAll(exportAll);
  if(exportAll){
   const sql=db();
   const completion_events=await sql`SELECT id,task_id,event_key,completed_at FROM completion_events ORDER BY id`;
   return new NextResponse(JSON.stringify({exported_at:new Date().toISOString(),schema_version:'pds-schema-v2',timezone:'Asia/Seoul',duration_unit:'minutes',...data,completion_events},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="plando-see-export.json"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  return NextResponse.json(data,opts);
 }catch(e){return dbError(e)}
}
export async function POST(req:NextRequest){
 let x:Record<string,unknown>;
 try {
  if(Number(req.headers.get('content-length')??0)>15000)return err('요청 내용이 너무 큽니다.',413);
  const body:unknown=await req.json();
  if(!body||typeof body!=='object'||Array.isArray(body))return err('요청 형식이 잘못되었습니다.');
  x=body as Record<string,unknown>;
  const action=str(x.action,'action',40,true);
  const sql=db();
  if(action==='createPlan'){
   const f=fields(x,'plan');
   await sql`INSERT INTO plans(title,start_date,end_date,priority,success_criteria,estimated_minutes) VALUES(${f.title},${f.start},${f.end},${f.priority},${f.success},${f.estimated})`;
  }else if(action==='editPlan'){
   const planId=id(x.id),f=fields(x,'plan');
   const res=await sql`UPDATE plans SET title=${f.title},start_date=${f.start},end_date=${f.end},priority=${f.priority},success_criteria=${f.success},estimated_minutes=${f.estimated},version=version+1,updated_at=now() WHERE id=${planId} AND deleted_at IS NULL RETURNING id`;
   if(!res.length)return err('계획을 찾을 수 없습니다.',404);
  }else if(action==='deletePlan'){
   const planId=id(x.id);
   const res=await sql`UPDATE plans SET deleted_at=now(),updated_at=now() WHERE id=${planId} AND deleted_at IS NULL RETURNING id`;
   if(!res.length)return err('계획을 찾을 수 없습니다.',404);
  }else if(action==='createTask'){
   const planId=id(x.plan_id),f=fields(x,'task');
   const created=await sql`INSERT INTO tasks(plan_id,title,description,due_date,priority,tag,estimated_minutes,start_time,end_time) SELECT id,${f.title},${f.description},${f.due},${f.priority},${f.tag},${f.estimated},${f.startTime}::time,${f.endTime}::time FROM plans WHERE id=${planId} AND deleted_at IS NULL RETURNING id`;
   if(!created.length)return err('계획을 찾을 수 없습니다.',404);
  }else if(action==='editTask'){
   const taskId=id(x.id),f=fields(x,'task');
   const res=await sql`UPDATE tasks SET title=${f.title},description=${f.description},due_date=${f.due},priority=${f.priority},tag=${f.tag},estimated_minutes=${f.estimated},start_time=${f.startTime}::time,end_time=${f.endTime}::time,updated_at=now() WHERE id=${taskId} AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM plans p WHERE p.id=tasks.plan_id AND p.deleted_at IS NULL) RETURNING id`;
   if(!res.length)return err('할 일을 찾을 수 없습니다.',404);
  }else if(action==='setStatus'){
   const taskId=id(x.id);const status=str(x.status,'상태',20,true);
   if(status==='completed'){
    // Single SQL statement: row-level UPDATE lock + insert guarded by UNIQUE(task_id) and UNIQUE(event_key).
    // Rapid duplicate clicks cannot generate a second completion event.
    await sql`WITH changed AS (
      UPDATE tasks SET status='completed',completed_at=now(),updated_at=now()
      WHERE id=${taskId} AND status<>'completed' AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM plans p WHERE p.id=tasks.plan_id AND p.deleted_at IS NULL) RETURNING id
    ), inserted AS (
      INSERT INTO completion_events(task_id,event_key)
      SELECT id,'complete:' || id::text FROM changed ON CONFLICT (task_id) DO NOTHING RETURNING id
    ) SELECT (SELECT count(*) FROM changed)::int AS updated,(SELECT count(*) FROM inserted)::int AS events`;
   }else if(status==='todo'||status==='doing'){
    await sql`UPDATE tasks SET status=${status},completed_at=NULL,updated_at=now() WHERE id=${taskId} AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM plans p WHERE p.id=tasks.plan_id AND p.deleted_at IS NULL)`;
   }else throw Error('상태를 확인하세요.');
  }else if(action==='deleteTask'){
   await sql`UPDATE tasks SET deleted_at=now(),updated_at=now() WHERE id=${id(x.id)} AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM plans p WHERE p.id=tasks.plan_id AND p.deleted_at IS NULL)`;
  }else if(action==='addSession'){
   const taskId=id(x.task_id),start=seoulInstant(x.started,'시작 시각'),end=seoulInstant(x.ended,'종료 시각'),reason=str(x.blocked_reason,'막힌 이유',1000);
   if(new Date(end).getTime()<new Date(start).getTime())throw Error('끝난 시각은 시작 시각보다 빠를 수 없습니다.');
   if(new Date(end).getTime()-new Date(start).getTime()>1000*60*60*24*7)throw Error('한 실행 기록은 7일을 초과할 수 없습니다.');
   const res=await sql`INSERT INTO work_sessions(task_id,started_at,ended_at,blocked_reason)
    SELECT id,${start}::timestamptz,${end}::timestamptz,${reason} FROM tasks WHERE id=${taskId} AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM plans p WHERE p.id=tasks.plan_id AND p.deleted_at IS NULL) RETURNING id`;
   if(!res.length)return err('할 일을 찾을 수 없습니다.',404);
  }else if(action==='saveReview'){
   const planId=id(x.plan_id),reflection=str(x.reflection,'돌아보기',3000),improvement=str(x.improvement,'다음에 고칠 점',1000);
   const changed=await sql`INSERT INTO reviews(plan_id,reflection,improvement) SELECT id,${reflection},${improvement} FROM plans WHERE id=${planId} AND deleted_at IS NULL ON CONFLICT(plan_id) DO UPDATE SET reflection=excluded.reflection,improvement=excluded.improvement,updated_at=now() RETURNING plan_id`;
   if(!changed.length)return err('계획을 찾을 수 없습니다.',404);
  }else if(action==='carryForward'){
   const planId=id(x.plan_id);
   const start=day(x.start_date,'다음 계획 시작일'),end=day(x.end_date,'다음 계획 종료일');
   if(end<start)throw Error('종료일은 시작일보다 빠를 수 없습니다.');
   const created=await sql`WITH base AS (
     SELECT p.*,r.improvement FROM plans p INNER JOIN reviews r ON r.plan_id=p.id
     WHERE p.id=${planId} AND p.deleted_at IS NULL AND btrim(r.improvement)<>'' AND r.next_plan_id IS NULL
   ), new_plan AS (
     INSERT INTO plans(title,start_date,end_date,priority,success_criteria,estimated_minutes,parent_plan_id,carry_over_text)
     SELECT LEFT('다음 계획 · ' || b.title,120),${start}::date,${end}::date,b.priority,b.success_criteria,b.estimated_minutes,b.id,b.improvement FROM base b
     RETURNING id
   ), linked AS (
     UPDATE reviews SET next_plan_id=(SELECT id FROM new_plan),updated_at=now() WHERE plan_id=${planId} AND EXISTS(SELECT 1 FROM new_plan) RETURNING next_plan_id
   ) SELECT next_plan_id AS id FROM linked`;
   if(!created.length)return err('먼저 고칠 점을 저장하거나 이미 연결된 다음 계획을 확인하세요.');
  }else{return err('지원하지 않는 동작입니다.');}
  return NextResponse.json({ok:true},opts);
 }catch(e){
  if(e instanceof SyntaxError)return err('JSON 형식이 잘못되었습니다.');
  if(e instanceof Error && (/올바르지|입력하세요|너무|초과|빨리|기준|상태를|시각|정수|늦어야|모두 설정/.test(e.message)))return err(e.message);
  return dbError(e);
 }
}
