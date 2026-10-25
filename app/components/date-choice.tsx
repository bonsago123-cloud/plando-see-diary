'use client';
import {useId,useState,type InputHTMLAttributes,type ChangeEvent} from 'react';
import Choice from './choice';

export function dateParts(value:string,type:string){const [date,time]=type==='time'?['',value]:value.split('T');return {date:date??'',time:time??''}}
export function changeDatePart(value:string,type:string,part:'year'|'month'|'day'|'hour'|'minute',number:number):string{
 const {date,time}=dateParts(value,type);let [y,m,d]=(date||'2000-01-01').split('-').map(Number);let [h,mi]=(time||'00:00').split(':').map(Number);
 if(part==='year')y=number;if(part==='month')m=number;if(part==='day')d=number;if(part==='hour')h=number;if(part==='minute')mi=number;
 d=Math.min(d,new Date(Date.UTC(y,m,0)).getUTCDate());const pad=(v:number)=>String(v).padStart(2,'0');const nextDate=`${String(y).padStart(4,'0')}-${pad(m)}-${pad(d)}`,nextTime=`${pad(h)}:${pad(mi)}`;
 return type==='date'?nextDate:type==='time'?nextTime:`${nextDate}T${nextTime}`;
}
/** Every column starts from the form's saved value, including during edits. */
export default function DateChoice({type='date',value,onChange,min,required,disabled,'aria-label':label,...rest}:InputHTMLAttributes<HTMLInputElement>){
 const text=String(value??''),{date,time}=dateParts(text,type),[y,m,d]=(date||'2000-01-01').split('-').map(Number),[h,mi]=(time||'00:00').split(':').map(Number),id=useId();const [invalid,setInvalid]=useState(false);
 const update=(part:'year'|'month'|'day'|'hour'|'minute',n:number)=>{setInvalid(false);const next=changeDatePart(text,type,part,n);onChange?.({target:{value:next},currentTarget:{value:next}} as ChangeEvent<HTMLInputElement>)};
 const column=(part:'year'|'month'|'day'|'hour'|'minute',v:number,from:number,to:number,unit:string)=><Choice aria-label={`${label??(type==='time'?'시간':'날짜')} ${unit}`} disabled={disabled} value={v} onChange={e=>update(part,Number(e.target.value))}>{Array.from({length:to-from+1},(_,i)=><option key={i+from} value={i+from}>{part==='year'?i+from:String(i+from).padStart(2,'0')}{unit}</option>)}</Choice>;
 return <div className="date-choice"><input {...rest} className="date-constraint" tabIndex={-1} aria-label={label??'선택한 날짜 및 시간'} aria-describedby={invalid?id:undefined} type={type} value={text} min={min} required={required} disabled={disabled} onChange={onChange} onInvalid={e=>{e.preventDefault();setInvalid(true);e.currentTarget.parentElement?.querySelector('button')?.focus()}}/>
 {type!=='time'&&<div className="date-columns">{column('year',y,Math.min(1900,y),Math.max(2100,y),'년')}{column('month',m,1,12,'월')}{column('day',d,1,new Date(Date.UTC(y,m,0)).getUTCDate(),'일')}</div>}
 {type!=='date'&&<div className="date-columns">{column('hour',h,0,23,'시')}{column('minute',mi,0,59,'분')}</div>}
 {invalid&&<small id={id} role="alert">날짜와 시간을 확인하세요.{min?` 최소 ${String(min)}`:''}</small>}</div>;
}
