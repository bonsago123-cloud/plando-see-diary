import {db} from '@/lib/db';
export async function changeRule(ownerId:string,x:Record<string,unknown>){
 const sql=db();
 const action=x.action;
 const validId=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
 if(!validId(action==='createRule'?x.plan_id:x.id))return {error:'ID를 확인하세요.',status:400};
 const owned=action==='createRule'
 ?await sql`SELECT id FROM plans WHERE id=${x.plan_id as string} AND owner_id=${ownerId} AND deleted_at IS NULL`
 :await sql`SELECT r.id FROM plan_rules r JOIN plans p ON p.id=r.plan_id WHERE r.id=${x.id as string} AND r.deleted_at IS NULL AND p.owner_id=${ownerId} AND p.deleted_at IS NULL`;
 if(!owned.length)return {error:'규칙 또는 계획을 찾을 수 없습니다.',status:404};
 const text=(v:unknown,max:number,required=false)=>typeof v==='string'&&v.length<=max&&(!required||!!v.trim());
 if(!text(x.reason??'',1000)||!text(x.evidence??'',2000))return {error:'이유와 근거 길이를 확인하세요.',status:400};
 if(action!=='deleteRule'&&(!text(x.title,160,true)||!text(x.description,1000)||!['high','medium','low'].includes(String(x.priority))||!['active','paused'].includes(String(x.status))))return {error:'규칙 내용을 확인하세요.',status:400};
 if(action!=='createRule'&&!text(x.reason,1000,true))return {error:'변경 이유를 입력하세요.',status:400};
 const title=String(x.title??'').trim(),description=String(x.description??'').trim(),priority=String(x.priority),status=String(x.status);
 const reason=String(x.reason??'').trim(),evidence=String(x.evidence??'').trim();
 if(action==='createRule'){
  await sql`INSERT INTO plan_rules(plan_id,title,description,priority,status) SELECT id,${title},${description},${priority},${status} FROM plans WHERE id=${x.plan_id as string} AND owner_id=${ownerId} AND deleted_at IS NULL`;
 }else{
  if(!Number.isInteger(x.version))return {error:'규칙을 새로고침하세요.',status:400};
  const deleted=action==='deleteRule';
  const rows=await sql`UPDATE plan_rules r SET
   history=r.history || jsonb_build_array(jsonb_build_object('version',r.version,'title',r.title,'description',r.description,'priority',r.priority,'status',r.status,'recorded_at',r.updated_at,'changed_at',clock_timestamp(),'reason',${reason}::text,'evidence',${evidence}::text,'action',${String(action)}::text)),
   title=CASE WHEN ${deleted} THEN r.title ELSE ${title} END,
   description=CASE WHEN ${deleted} THEN r.description ELSE ${description} END,
   priority=CASE WHEN ${deleted} THEN r.priority ELSE ${priority} END,
   status=CASE WHEN ${deleted} THEN r.status ELSE ${status} END,
   deleted_at=CASE WHEN ${deleted} THEN clock_timestamp() ELSE NULL END,
   updated_at=clock_timestamp(),version=r.version+1
   WHERE r.id=${x.id as string} AND r.version=${x.version as number} AND r.deleted_at IS NULL
   AND EXISTS(SELECT 1 FROM plans p WHERE p.id=r.plan_id AND p.owner_id=${ownerId} AND p.deleted_at IS NULL) RETURNING r.id`;
  if(!rows.length)return {error:'다른 곳에서 변경됐습니다. 새로고침 후 다시 시도하세요.',status:409};
 }
 return {status:200};
}
