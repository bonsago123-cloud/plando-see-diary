const formatter=new Intl.DateTimeFormat('sv-SE',{
 timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',
 hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
});
function Stamp({value}:{value?:string|null}){
 if(!value||!Number.isFinite(Date.parse(value)))return <span title="저장된 시각이 없습니다. 이전 기록의 수정 시각은 확인할 수 없습니다.">—</span>;
 return <time dateTime={value}>{formatter.format(new Date(value))}</time>;
}
export default function SessionTimestamps({createdAt,updatedAt}:{createdAt:string;updatedAt?:string|null}){
 return <div className="session-timestamps" aria-label="기록 저장 시각 · 한국 시간">
  <div><span className="session-stamp-label">최초 기록 <small>한국 시간</small></span><Stamp value={createdAt}/></div>
  <div><span className="session-stamp-label">마지막 수정 <small>한국 시간</small></span><Stamp value={updatedAt}/></div>
 </div>;
}
