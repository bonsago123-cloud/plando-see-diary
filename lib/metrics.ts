import type {Session,Task,MetricKey} from './types';
export function seoulToday(now:Date=new Date()):string {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function taskIsOverdue(task:Task,today:string):boolean {
  return task.status!=='completed' && task.due_date < today;
}
export function summarize(tasks:Task[],sessions:Session[],today=seoulToday()) {
  const actualByTask=new Map<string,number>();
  const blocked=new Set<string>();
  for(const s of sessions){
    actualByTask.set(s.task_id,(actualByTask.get(s.task_id)??0)+s.duration_minutes);
    if(s.blocked_reason.trim())blocked.add(s.task_id);
  }
  const planned=tasks.length;
  const completed=tasks.filter(t=>t.status==='completed').length;
  const overdue=tasks.filter(t=>taskIsOverdue(t,today)).length;
  const blockedCount=tasks.filter(t=>blocked.has(t.id)).length;
  const estimated=tasks.reduce((sum,t)=>sum+t.estimated_minutes,0);
  const actual=tasks.reduce((sum,t)=>sum+(actualByTask.get(t.id)??0),0);
  return {planned,completed,overdue,blocked:blockedCount,estimated,actual,difference:actual-estimated};
}
export function evidenceTasks(key:MetricKey,tasks:Task[],sessions:Session[],today=seoulToday()):Task[] {
  const blocked=new Set(sessions.filter(s=>s.blocked_reason.trim()).map(s=>s.task_id));
  if(key==='completed')return tasks.filter(t=>t.status==='completed');
  if(key==='overdue')return tasks.filter(t=>taskIsOverdue(t,today));
  if(key==='blocked')return tasks.filter(t=>blocked.has(t.id));
  if(key==='actual')return tasks.filter(t=>sessions.some(s=>s.task_id===t.id));
  return tasks;
}
export function minutesLabel(minutes:number):string{
  const sign=minutes<0?'-':'';const n=Math.abs(minutes);
  return sign+`${Math.floor(n/60)}시간 ${n%60}분`;
}
export function toSeoulInput(date:Date=new Date()):string {
  const formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
  return formatter.format(date).replace(' ','T');
}
