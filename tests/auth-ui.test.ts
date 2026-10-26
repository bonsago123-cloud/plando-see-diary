import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';

test('login/register UI validates confirmation, clears password and shows server errors (DOM simulation)',async()=>{
 const temp=await mkdtemp(path.resolve('.ui-test-'));
 const dom=new JSDOM('<div id="app"></div>',{url:'http://localhost/login'});
 const saved=new Map<string,PropertyDescriptor|undefined>();
 const requests:{url:string;body:Record<string,string>}[]=[];
 for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true,fetch:async(url:string,init:RequestInit)=>{requests.push({url,body:JSON.parse(String(init.body))});return new Response(JSON.stringify(url.endsWith('register')?{ok:true}:{error:'이메일 또는 비밀번호가 올바르지 않습니다.'}),{status:url.endsWith('register')?200:401})}})){
  saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
 }
 let root:ReturnType<typeof import('react-dom/client').createRoot>|undefined;
 try{
  await build({entryPoints:['app/login/login-form.tsx'],bundle:true,platform:'node',format:'esm',outfile:path.join(temp,'login.mjs'),packages:'external',jsx:'automatic'});
  const {createRoot}=await import('react-dom/client'),{default:Login}=await import(path.join(temp,'login.mjs'));
  root=createRoot(document.getElementById('app')!);await act(async()=>root!.render(React.createElement(Login)));
  assert.match(document.querySelector('h1')!.textContent!,/반가워요/);
  await act(async()=>(document.querySelector('.auth-switch') as HTMLButtonElement).click());
  const set=(name:string,value:string)=>{(document.querySelector(`[name=${name}]`) as HTMLInputElement).value=value};
  const submit=async()=>act(async()=>{document.querySelector('form')!.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}))});
  set('email','test@example.test');set('password','test-only-password');set('confirmation','different');await submit();
  assert.equal(requests.length,0);assert.match(document.body.textContent!,/서로 다릅니다/);
  set('confirmation','test-only-password');await submit();assert.equal(requests[0].url,'/api/auth/register');
  assert.match(document.body.textContent!,/가입이 완료/);assert.equal((document.querySelector('[name=password]') as HTMLInputElement).value,'');
  set('password','wrong-password');await submit();assert.equal(requests[1].url,'/api/auth/login');assert.match(document.body.textContent!,/이메일 또는 비밀번호/);
  assert.equal((document.querySelector('[name=password]') as HTMLInputElement).value,'');assert.equal(dom.window.localStorage.length,0);
 }finally{if(root)await act(async()=>root!.unmount());dom.window.close();for(const [key,desc] of saved){if(desc)Object.defineProperty(globalThis,key,desc);else delete (globalThis as Record<string,unknown>)[key]}await rm(temp,{recursive:true,force:true})}
});
