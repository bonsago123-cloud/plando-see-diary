import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {AccessError,assertSameOrigin,authBody,authError,issueSession,limitAttempts,requireUser,setSessionCookie} from '@/lib/auth';
import {DUMMY_HASH,hashPassword,validPassword,verifyPassword} from '@/lib/password';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const ok=()=>NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
export async function GET(req:NextRequest,{params}:{params:Promise<{action:string}>}){
 try{
  if((await params).action!=='me')throw new AccessError(404,'찾을 수 없습니다.');
  const user=await requireUser(req);
  return NextResponse.json({user},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return authError(e)}
}
export async function POST(req:NextRequest,{params}:{params:Promise<{action:string}>}){
 try{
  assertSameOrigin(req);
  const {action}=await params,sql=db();
  if(action==='register'||action==='login'){
   const x=await authBody(req);
   const email=typeof x.email==='string'?x.email.trim().toLowerCase():'';
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new AccessError(400,'이메일 형식을 확인하세요.');
   if(!validPassword(x.password))throw new AccessError(400,'비밀번호는 12~128자로 입력하세요.');
   await limitAttempts('account:'+email);
   if(action==='register'){
    const hash=await hashPassword(x.password);
    const rows=await sql`INSERT INTO app_users(email,password_hash) VALUES(${email},${hash}) ON CONFLICT(email) DO NOTHING RETURNING id`;
    if(!rows.length)throw new AccessError(409,'이미 사용 중인 이메일입니다.');
    // Registration never claims legacy anonymous data.
    return ok();
   }
   const rows=await sql`SELECT id,password_hash FROM app_users WHERE email=${email}`;
   const matches=await verifyPassword(x.password,rows[0]?.password_hash??DUMMY_HASH);
   if(!rows.length||!matches)throw new AccessError(401,'이메일 또는 비밀번호가 올바르지 않습니다.');
   return setSessionCookie(ok(),await issueSession(rows[0].id));
  }
  const user=await requireUser(req);
  if(action==='logout'){
   await sql`DELETE FROM auth_sessions WHERE user_id=${user.id}`;
   return setSessionCookie(ok(),'');
  }
  if(action==='password'||action==='delete-account'){
   const x=await authBody(req);
   await limitAttempts('sensitive:'+user.id);
   const rows=await sql`SELECT password_hash FROM app_users WHERE id=${user.id}`;
   if(!validPassword(x.current_password)||!rows.length||!await verifyPassword(x.current_password,rows[0].password_hash))throw new AccessError(401,'현재 비밀번호가 올바르지 않습니다.');
   if(action==='password'){
    if(!validPassword(x.new_password))throw new AccessError(400,'새 비밀번호는 12~128자로 입력하세요.');
    const hash=await hashPassword(x.new_password);
    await sql.transaction([
     sql`UPDATE app_users SET password_hash=${hash} WHERE id=${user.id}`,
     sql`DELETE FROM auth_sessions WHERE user_id=${user.id}`
    ]);
   }else{
    if(x.confirmation!=='계정 삭제')throw new AccessError(400,'계정 삭제를 입력하세요.');
    // Atomic, children first; rollback on any error. Includes soft-deleted data.
    await sql.transaction([
     sql`DELETE FROM completion_events WHERE task_id IN (SELECT t.id FROM tasks t JOIN plans p ON p.id=t.plan_id WHERE p.owner_id=${user.id})`,
     sql`DELETE FROM work_sessions WHERE task_id IN (SELECT t.id FROM tasks t JOIN plans p ON p.id=t.plan_id WHERE p.owner_id=${user.id})`,
     sql`DELETE FROM tasks WHERE plan_id IN (SELECT id FROM plans WHERE owner_id=${user.id})`,
     sql`DELETE FROM plan_revisions WHERE plan_id IN (SELECT id FROM plans WHERE owner_id=${user.id})`,
     sql`DELETE FROM reviews WHERE plan_id IN (SELECT id FROM plans WHERE owner_id=${user.id})`,
     sql`DELETE FROM plans WHERE owner_id=${user.id}`,
     sql`DELETE FROM thoughts WHERE topic_id IN (SELECT id FROM thought_topics WHERE owner_id=${user.id})`,
     sql`DELETE FROM thought_topics WHERE owner_id=${user.id}`,
     sql`DELETE FROM app_users WHERE id=${user.id}`
    ]);
   }
   return setSessionCookie(ok(),'');
  }
  throw new AccessError(404,'찾을 수 없습니다.');
 }catch(e){return authError(e)}
}
