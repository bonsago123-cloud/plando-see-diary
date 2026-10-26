import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {COOKIE,sessionUser} from '@/lib/auth';
import DashboardClient from '../dashboard-client';
export const dynamic='force-dynamic';
export default async function Diary(){
 let user;
 try{user=await sessionUser((await cookies()).get(COOKIE)?.value)}catch{return <main className="auth-page"><section className="auth-card"><h1>기록을 불러올 수 없습니다</h1><p>서버 연결을 확인하고 잠시 뒤 다시 시도하세요.</p><a href="/login">로그인 화면으로</a></section></main>}
 if(!user)redirect('/login');
 return <DashboardClient/>;
}
