'use client';
import {Children,isValidElement,useEffect,useId,useRef,useState,type ReactNode,type SelectHTMLAttributes,type ChangeEvent} from 'react';
import {createPortal} from 'react-dom';

type Option={value:string;label:ReactNode;disabled:boolean};
function optionsFrom(children:ReactNode):Option[]{
 return Children.toArray(children).flatMap(child=>{
  if(!isValidElement<{value?:string;children?:ReactNode;disabled?:boolean}>(child))return [];
  return child.type==='option'?[{value:String(child.props.value??''),label:child.props.children,disabled:!!child.props.disabled}]:optionsFrom(child.props.children);
 });
}
/** A shared wheel/drag/keyboard selection control. Dragging never chooses an option. */
export default function Choice({children,value,onChange,className='',disabled,required,name,...rest}:SelectHTMLAttributes<HTMLSelectElement>){
 const options=optionsFrom(children),selected=options.findIndex(o=>o.value===String(value));
 const [open,setOpen]=useState(false),[active,setActive]=useState(0),[rect,setRect]=useState({top:0,left:0,width:0,height:240});
 const button=useRef<HTMLButtonElement>(null),list=useRef<HTMLDivElement>(null),drag=useRef<{y:number;scroll:number;moved:boolean}|null>(null),listId=useId();
 function close(){setOpen(false);button.current?.focus()}
 function choose(index:number){const o=options[index];if(!o||o.disabled)return;onChange?.({target:{value:o.value},currentTarget:{value:o.value}} as ChangeEvent<HTMLSelectElement>);close()}
 function show(){if(disabled)return;const r=button.current!.getBoundingClientRect(),height=Math.min(240,Math.max(100,window.innerHeight-32));const below=window.innerHeight-r.bottom;setRect({top:below>=height+8?r.bottom+4:Math.max(8,r.top-height-4),left:Math.max(8,Math.min(r.left,window.innerWidth-Math.max(160,r.width)-8)),width:Math.min(window.innerWidth-16,Math.max(160,r.width)),height});setActive(Math.max(selected,0));setOpen(true)}
 useEffect(()=>{if(!open)return;list.current?.focus();const el=list.current?.children[Math.max(selected,0)] as HTMLElement|undefined;if(el&&list.current)list.current.scrollTop=Math.max(0,el.offsetTop-list.current.clientHeight/2);const outside=(e:PointerEvent)=>{if(!list.current?.contains(e.target as Node)&&!button.current?.contains(e.target as Node))setOpen(false)};const resize=()=>setOpen(false);document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize)}},[open,selected]);
 function move(index:number,direction:number){let i=index;while(i>=0&&i<options.length&&options[i].disabled)i+=direction;if(i<0||i>=options.length)return;setActive(i);const el=list.current?.children[i] as HTMLElement|undefined;el?.scrollIntoView?.({block:'nearest'})}
 return <><button ref={button} type="button" role="combobox" aria-label={rest['aria-label']} aria-labelledby={rest['aria-labelledby']} aria-expanded={open} aria-controls={listId} aria-haspopup="listbox" aria-required={required} title={rest.title} disabled={disabled} className={`choice ${className}`} onClick={()=>open?close():show()} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault();show()}}}><span>{options[selected]?.label??'선택하세요'}</span><span aria-hidden="true">⌄</span></button>{name&&<input type="hidden" name={name} value={String(value??'')}/>}
 {open&&createPortal(<div ref={list} id={listId} role="listbox" aria-label={rest['aria-label']??rest.title??'선택 목록'} tabIndex={-1} aria-activedescendant={`${listId}-${active}`} className="choice-list" style={{top:rect.top,left:rect.left,width:rect.width,maxHeight:rect.height}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}else if(e.key==='Tab')setOpen(false);else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const d=e.key==='ArrowDown'?1:-1;move(active+d,d)}else if(e.key==='Home'||e.key==='End'){e.preventDefault();move(e.key==='Home'?0:options.length-1,e.key==='Home'?1:-1)}else if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(active)}}}
 onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();drag.current={y:e.clientY,scroll:e.currentTarget.scrollTop,moved:false};e.currentTarget.setPointerCapture(e.pointerId)}}
 onPointerMove={e=>{const d=drag.current;if(!d)return;const delta=e.clientY-d.y;if(Math.abs(delta)>4)d.moved=true;if(d.moved)e.currentTarget.scrollTop=d.scroll-delta}}
 onPointerUp={e=>{const d=drag.current;drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(!d||d.moved)return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-choice-index]');if(target&&e.currentTarget.contains(target))choose(Number(target.dataset.choiceIndex))}}
 onPointerCancel={()=>{drag.current=null}}>{options.map((o,i)=><div key={`${o.value}-${i}`} id={`${listId}-${i}`} data-choice-index={i} role="option" aria-selected={i===selected} aria-disabled={o.disabled} className={`choice-option ${active===i?'active':''} ${selected===i?'chosen':''}`} onClick={e=>{if(e.detail===0)choose(i)}}>{o.label}{i===selected&&<span aria-hidden="true">✓</span>}</div>)}</div>,document.body)}</>;
}
