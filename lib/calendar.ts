import type {Dashboard} from './types';
export type CalendarKind='plan'|'task'|'session'|'topic'|'thought';
export type CalendarItem={id:string;kind:CalendarKind;title:string;start:string;end:string;detail:string;completed?:boolean};
export const kindNames:Record<CalendarKind,string>={plan:'계획',task:'할 일',session:'실행',topic:'주제',thought:'생각'};
const seoulDay=(iso:string)=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso));
export function calendarItems(data:Dashboard):CalendarItem[]{
 return [
 ...data.plans.map(p=>({id:p.id,kind:'plan' as const,title:p.title,start:p.start_date,end:p.end_date,detail:p.category??'',completed:!!p.is_completed})),
 ...data.tasks.map(t=>({id:t.id,kind:'task' as const,title:t.title,start:t.due_date,end:t.due_date,detail:t.start_time&&t.end_time?`${t.start_time} ~ ${t.end_time}`:'',completed:t.status==='completed'})),
 ...data.sessions.map(s=>({id:s.id,kind:'session' as const,title:data.tasks.find(t=>t.id===s.task_id)?.title??'실행 기록',start:seoulDay(s.started_at),end:seoulDay(s.ended_at),detail:`${s.duration_minutes}분`,completed:true})),
 ...(data.topics??[]).map(t=>({id:t.id,kind:'topic' as const,title:t.title,start:t.start_date,end:t.end_date,detail:''})),
 ...(data.thoughts??[]).map(t=>({id:t.id,kind:'thought' as const,title:t.title,start:t.start_date,end:t.end_date,detail:(data.topics??[]).find(p=>p.id===t.topic_id)?.title??''}))
 ].sort((a,b)=>a.start.localeCompare(b.start)||a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
}
export function itemsOn(items:CalendarItem[],day:string){return items.filter(i=>i.start<=day&&day<=i.end)}
export function monthDays(month:string){const first=new Date(month+'-01T00:00:00Z');const start=first.getTime()-first.getUTCDay()*86400000;return Array.from({length:42},(_,i)=>new Date(start+i*86400000).toISOString().slice(0,10))}
