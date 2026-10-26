import {neon} from '@neondatabase/serverless';
import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import {assignLegacy} from '../lib/legacy-transfer.mjs';
try{process.loadEnvFile('.env.local')}catch{/* Environment variables may be supplied directly. */}
const rl=createInterface({input:stdin,output:stdout});
try{
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL을 .env.local에 설정하세요.');
 const sql=neon(process.env.DATABASE_URL);
 const email=(await rl.question('이전 자료를 받을 가입된 계정 이메일: ')).trim().toLowerCase();
 const users=await sql`SELECT id FROM app_users WHERE email=${email}`;
 if(users.length!==1)throw Error('해당 계정으로 먼저 회원가입하세요.');
 const counts=await sql`SELECT (SELECT count(*) FROM plans WHERE owner_id IS NULL)::int AS plans,(SELECT count(*) FROM thought_topics WHERE owner_id IS NULL)::int AS topics`;
 console.log(`이전할 미소유 계획 ${counts[0].plans}개 / 생각 주제 ${counts[0].topics}개. 연결된 자료도 같은 소유자를 따릅니다.`);
 if(await rl.question('백업을 마쳤고 이 계정의 자료가 맞으면 "이전" 입력: ')!=='이전')throw Error('이전을 취소했습니다.');
 const result=await assignLegacy(sql,users[0].id);
 console.log(`완료: 계획 ${result[3].length}개, 생각 주제 ${result[4].length}개를 지정한 계정에 연결했습니다. 로그인하여 확인하세요.`);
}catch(e){console.error(e instanceof Error&&/설정하세요|회원가입하세요|취소했습니다/.test(e.message)?e.message:'이전 실패. 연결·마이그레이션 상태를 확인하세요. 데이터베이스 오류 원문은 출력하지 않습니다.');process.exitCode=1}
finally{rl.close()}
