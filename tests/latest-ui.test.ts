import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';

test('saved date/time, leap day, keyboard selection and pointer drag without unintended changes (DOM simulation)',async()=>{
 const temp=await mkdtemp(path.resolve('.ui-test-'));
 const dom=new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',{url:'http://localhost'});
 const globals=globalThis as Record<string,unknown>,saved=new Map<string,PropertyDescriptor|undefined>();
 for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})){saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true})}
 let root:ReturnType<typeof import('react-dom/client').createRoot>|undefined;
 try{
  const {createRoot}=await import('react-dom/client');
  await build({entryPoints:['app/components/date-choice.tsx'],bundle:true,platform:'node',format:'esm',outfile:path.join(temp,'date.mjs'),packages:'external',jsx:'automatic'});
  const {default:DateChoice,changeDatePart}=await import(path.join(temp,'date.mjs'));
  assert.equal(changeDatePart('2024-02-29','date','year',2025),'2025-02-28');
  let changed='';root=createRoot(document.getElementById('app')!);
  await act(async()=>root!.render(React.createElement(DateChoice,{type:'datetime-local',value:'2026-03-04T06:10',onChange:(e:{target:{value:string}})=>{changed=e.target.value}})));
  assert.equal((document.querySelector('input') as HTMLInputElement).value,'2026-03-04T06:10');
  const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('[role=combobox]'));assert.deepEqual(buttons.map(b=>b.textContent?.replace('⌄','')),['2026년','03월','04일','06시','10분']);
  await act(async()=>buttons[4].click());let list=document.querySelector<HTMLElement>('[role=listbox]')!;
  await act(async()=>list.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})));
  await act(async()=>list.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true})));
  assert.equal(changed,'2026-03-04T06:11');
  changed='';await act(async()=>buttons[4].click());list=document.querySelector<HTMLElement>('[role=listbox]')!;
  Object.assign(list,{setPointerCapture:()=>{},hasPointerCapture:()=>false,releasePointerCapture:()=>{}});list.scrollTop=40;
  const pointer=(name:string,y:number)=>{const ev=new dom.window.MouseEvent(name,{clientY:y,button:0,bubbles:true});Object.defineProperty(ev,'pointerId',{value:1});return ev};
  await act(async()=>{list.dispatchEvent(pointer('pointerdown',100));list.dispatchEvent(pointer('pointermove',40));list.dispatchEvent(pointer('pointerup',40))});
  assert.equal(list.scrollTop,100);assert.equal(changed,'');assert.ok(document.querySelector('[role=listbox]'));
  const css=await readFile('app/globals.css','utf8');assert.match(css,/\.choice-list\{[^}]*overflow-y:auto/);
  await act(async()=>list.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(document.querySelector('[role=listbox]'),null);
 }finally{if(root)await act(async()=>root!.unmount());dom.window.close();for(const [key,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globals[key]}await rm(temp,{recursive:true,force:true})}
});

test('dashboard connects completed plans, category filter, saved task fields, calendar and topic editing (DOM simulation)',async()=>{
 const temp=await mkdtemp(path.resolve('.ui-test-'));
 const dom=new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',{url:'http://localhost'});
 const base={start_date:'2026-03-04',end_date:'2026-03-10',priority:'medium',success_criteria:'원래 기준',estimated_minutes:60,version:1,parent_plan_id:null,carry_over_text:'',created_at:'2026-03-04T00:00:00Z',updated_at:'2026-03-04T00:00:00Z'};
 const data={plans:[{...base,id:'p1',title:'현재 계획',category:'학습',is_completed:false},{...base,id:'p2',title:'지난 계획',category:'운동',is_completed:true}],revisions:[],tasks:[{id:'t1',plan_id:'p1',title:'저장된 할 일',description:'내용',due_date:'2026-03-05',priority:'medium',tag:'연습',estimated_minutes:30,start_time:'06:10',end_time:'06:40',status:'todo',completed_at:null,created_at:'',updated_at:''}],sessions:[],reviews:[],categories:[{name:'학습'},{name:'운동'}],topics:[{id:'topic1',title:'주제 이름',start_date:'2026-03-01',end_date:'2026-03-20',blocks:['원문 1','원문 2'],created_at:'',updated_at:''}],thoughts:[]};
 const globals=globalThis as Record<string,unknown>,saved=new Map<string,PropertyDescriptor|undefined>();
 for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true,fetch:async()=>new Response(JSON.stringify(data),{status:200})})){saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true})}
 let root:ReturnType<typeof import('react-dom/client').createRoot>|undefined;
 try{
  const {createRoot}=await import('react-dom/client');
  await build({entryPoints:['app/dashboard-client.tsx'],bundle:true,platform:'node',format:'esm',outfile:path.join(temp,'dashboard.mjs'),packages:'external',jsx:'automatic'});
  const {default:Dashboard}=await import(path.join(temp,'dashboard.mjs'));root=createRoot(document.getElementById('app')!);
  await act(async()=>root!.render(React.createElement(Dashboard)));
  async function click(text:string,selector='button'){const button=Array.from(document.querySelectorAll<HTMLButtonElement>(selector)).find(b=>b.textContent?.trim()===text);assert.ok(button,`button ${text}`);await act(async()=>button.click())}
  await click('내 계획','nav button');assert.ok(document.querySelector('.plan-grid')?.textContent?.includes('현재 계획'));assert.ok(!document.querySelector('.plan-grid')?.textContent?.includes('지난 계획'));
  await click('완수한 계획');assert.ok(document.querySelector('.plan-grid')?.textContent?.includes('지난 계획'));assert.ok(!document.querySelector('.plan-grid')?.textContent?.includes('현재 계획'));
  assert.equal(document.querySelector('[aria-label="카테고리 필터"]')?.textContent,'전체보기⌄');
  await click('할 일 관리','nav button');await click('저장된 할 일');
  const dateInputs=Array.from(document.querySelectorAll<HTMLInputElement>('.date-constraint')).map(i=>i.value);assert.deepEqual(dateInputs,['2026-03-05','06:10','06:40']);
  await act(async()=>(document.querySelector('[aria-label="닫기"]') as HTMLButtonElement).click());
  await click('캘린더','nav button');assert.equal(document.querySelectorAll('.calendar-cell').length,42);
  await click('나의 생각','nav button');assert.ok(document.querySelector('.topic-content')?.textContent?.includes('원문 2'));
  await click('수정','.topic-content button');assert.deepEqual(Array.from(document.querySelectorAll<HTMLInputElement>('.date-constraint')).map(i=>i.value),['2026-03-01','2026-03-20']);assert.equal(document.querySelectorAll('textarea').length,2);
  await click('내용 칸 추가');assert.equal(document.querySelectorAll('textarea').length,3);
 }finally{if(root)await act(async()=>root!.unmount());dom.window.close();for(const [key,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globals[key]}await rm(temp,{recursive:true,force:true})}
});
