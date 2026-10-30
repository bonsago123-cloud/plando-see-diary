import {neon} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
try{process.loadEnvFile('.env.local')}catch{}
try{
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL을 .env.local에 설정하세요.');
 const sql=neon(process.env.DATABASE_URL);
 const source=await readFile(new URL('../db/migrations/20261030_plan_rules.sql',import.meta.url),'utf8');
 await sql.transaction(source.split(';').map(s=>s.trim()).filter(Boolean).map(s=>sql.query(s)));
 console.log('완료: 계획 규칙 저장 준비가 끝났습니다.');
}catch{console.error('적용 실패: DATABASE_URL과 기존 데이터베이스 설정을 확인하세요.');process.exitCode=1}
