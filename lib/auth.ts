import 'server-only';
import {createHash,randomBytes} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
export const COOKIE='pds_session';
export const SESSION_SECONDS=12*60*60;
export class AccessError extends Error {constructor(public status:number,message:string){super(message)}}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export function authError(e:unknown):NextResponse {
 if(e instanceof AccessError)return NextResponse.json({error:e.message},{status:e.status,headers:{'Cache-Control':'no-store'}});
 // Never log raw database exceptions: parameters may contain credentials.
 console.error('Authentication/data service failed');
 return NextResponse.json({error:'서버에 연결하지 못했습니다. 설정을 확인하고 다시 시도하세요.'},{status:503,headers:{'Cache-Control':'no-store'}});
}
export function assertSameOrigin(req:NextRequest){
 const origin=req.headers.get('origin');
 const expected=process.env.APP_ORIGIN||req.nextUrl.origin;
 if(origin!==expected||req.headers.get('sec-fetch-site')==='cross-site')throw new AccessError(403,'허용되지 않은 요청입니다.');
 if(!req.headers.get('content-type')?.startsWith('application/json'))throw new AccessError(415,'JSON 요청만 허용합니다.');
}
export async function sessionUser(token:string|undefined){
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const sql=db();
 const rows=await sql`SELECT u.id,u.email,s.expires_at FROM auth_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=${tokenHash(token)} AND s.expires_at>now()`;
 return rows[0] as {id:string;email:string;expires_at:string}|undefined??null;
}
export async function requireUser(req:NextRequest){
 const user=await sessionUser(req.cookies.get(COOKIE)?.value);
 if(!user)throw new AccessError(401,'로그인이 필요합니다.');
 return user;
}
export async function issueSession(userId:string){
 const token=randomBytes(32).toString('hex'),sql=db();
 await sql`INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES(${tokenHash(token)},${userId},now()+interval '12 hours')`;
 return token;
}
export function setSessionCookie(response:NextResponse,token:string){
 response.cookies.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:token?SESSION_SECONDS:0});
 return response;
}
export async function authBody(req:NextRequest){
 const raw=await req.text();
 if(Buffer.byteLength(raw)>4096)throw new AccessError(413,'요청이 너무 큽니다.');
 try{const data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw Error();return data as Record<string,unknown>}
 catch{throw new AccessError(400,'요청 형식이 잘못되었습니다.')}
}
export async function limitAttempts(identifier:string){
 const sql=db();
 const rows=await sql`INSERT INTO auth_attempts(identifier,count) VALUES(${tokenHash(identifier)},1)
 ON CONFLICT(identifier) DO UPDATE SET count=CASE WHEN auth_attempts.window_start<now()-interval '15 minutes' THEN 1 ELSE auth_attempts.count+1 END,
 window_start=CASE WHEN auth_attempts.window_start<now()-interval '15 minutes' THEN now() ELSE auth_attempts.window_start END RETURNING count`;
 if(Number(rows[0].count)>10)throw new AccessError(429,'요청이 너무 많습니다. 15분 뒤 다시 시도하세요.');
}
