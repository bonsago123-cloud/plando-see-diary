import {neon} from '@neondatabase/serverless';
try{process.loadEnvFile('.env.local')}catch{/* The environment may be supplied directly. */}
try{
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL을 .env.local에 설정하세요.');
 const sql=neon(process.env.DATABASE_URL);
 await sql`ALTER TABLE work_sessions ADD COLUMN IF NOT EXISTS updated_at timestamptz`;
 console.log('완료: 실행 기록 수정 시각 저장 준비가 끝났습니다.');
}catch(e){console.error(e instanceof Error&&e.message.includes('설정하세요')?e.message:'적용 실패: 데이터베이스 연결과 work_sessions 테이블을 확인하세요.');process.exitCode=1}
