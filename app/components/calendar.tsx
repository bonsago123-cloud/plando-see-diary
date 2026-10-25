'use client';
import {useMemo,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight} from 'lucide-react';
import type {Dashboard} from '@/lib/types';
import {calendarItems,itemsOn,monthDays,kindNames,type CalendarItem,type CalendarKind} from '@/lib/calendar';
import {seoulToday} from '@/lib/metrics';
import Choice from './choice';
export default function Calendar({data,onOpen}:{data:Dashboard;onOpen:(item:CalendarItem)=>void}){
 const today=seoulToday(),[month,setMonth]=useState(today.slice(0,7)),[selected,setSelected]=useState(today),[kind,setKind]=useState('all');
 const all=useMemo(()=>calendarItems(data),[data]),items=all.filter(i=>kind==='all'||i.kind===kind),days=monthDays(month),selectedItems=itemsOn(items,selected);
 function shift(n:number){const date=new Date(month+'-01T00:00:00Z');date.setUTCMonth(date.getUTCMonth()+n);const next=date.toISOString().slice(0,7);setMonth(next);setSelected(next+'-01')}
 return <section className="panel calendar-panel"><div className="panel-head"><div><h2><CalendarDays size={18}/> {month.replace('-','년 ')}월</h2><p>날짜를 선택하면 그날의 계획과 기록을 볼 수 있어요.</p></div><div className="calendar-tools"><button type="button" className="btn btn-light" aria-label="이전 달" onClick={()=>shift(-1)}><ChevronLeft size={16}/></button><button type="button" className="btn btn-light" onClick={()=>{setMonth(today.slice(0,7));setSelected(today)}}>오늘</button><button type="button" className="btn btn-light" aria-label="다음 달" onClick={()=>shift(1)}><ChevronRight size={16}/></button><Choice aria-label="달력 표시 항목" value={kind} onChange={e=>setKind(e.target.value)}><option value="all">전체보기</option>{Object.entries(kindNames).map(([value,label])=><option key={value} value={value}>{label}</option>)}</Choice></div></div>
 <div className="calendar-legend">{Object.entries(kindNames).map(([k,label])=><span key={k} className={`calendar-label kind-${k}`}>{label}</span>)}</div>
 <div className="calendar-grid">{['일','월','화','수','목','금','토'].map(d=><div className="calendar-weekday" key={d}>{d}</div>)}{days.map(day=>{const list=itemsOn(items,day);return <button key={day} type="button" aria-label={`${day}, ${list.length}개 기록`} aria-pressed={day===selected} className={`calendar-cell ${day.slice(0,7)!==month?'outside':''} ${day===today?'today':''} ${day===selected?'selected':''}`} onClick={()=>setSelected(day)}><strong>{Number(day.slice(8))}</strong>{list.slice(0,3).map(i=><span key={i.kind+i.id} className={`calendar-label kind-${i.kind}`}>{i.completed?'✓ ':''}{i.title}</span>)}{list.length>3&&<small>+{list.length-3}개 더</small>}</button>})}</div>
 <div className="calendar-details"><h3>{selected} <span className="count">{selectedItems.length}</span></h3>{selectedItems.length?selectedItems.map(i=><button type="button" className="calendar-record" key={i.kind+i.id} onClick={()=>onOpen(i)}><span className={`calendar-label kind-${i.kind}`}>{kindNames[i.kind as CalendarKind]}</span><strong>{i.completed?'✓ ':''}{i.title}</strong><small>{i.detail||`${i.start} ~ ${i.end}`}</small><ChevronRight size={16}/></button>):<p>이 날짜에 등록된 계획이나 기록이 없어요.</p>}</div></section>;
}
