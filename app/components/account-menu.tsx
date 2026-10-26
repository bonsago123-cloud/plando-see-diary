'use client';
import {useState,type FormEvent} from 'react';
export default function AccountMenu(){
 const [mode,setMode]=useState<'password'|'delete-account'|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function request(action:string,body:Record<string,unknown>){
  if(busy)return;setBusy(true);setError('');
  try{
   const res=await fetch('/api/auth/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),data=await res.json();
   if(!res.ok)throw Error(data.error||'처리하지 못했습니다.');
   // Hard navigation destroys loaded diary state; other tabs also lock immediately.
   if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel('pds-auth');channel.postMessage('signed-out');channel.close()}
   window.location.replace('/login');
  }catch(e){setError(e instanceof Error?e.message:'연결을 확인하세요.')}finally{setBusy(false)}
 }
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget,f=new FormData(form);
  const payload={current_password:f.get('current_password'),new_password:f.get('new_password'),confirmation:f.get('confirmation')};
  form.querySelectorAll<HTMLInputElement>('input[type=password]').forEach(i=>{i.value=''});
  if(mode)void request(mode,payload);
 }
 return <div className="account-menu"><button className="btn btn-light" disabled={busy} onClick={()=>void request('logout',{})}>로그아웃</button><button className="btn btn-light" onClick={()=>{setMode('password');setError('')}}>비밀번호 변경</button><button className="btn btn-light" onClick={()=>{setMode('delete-account');setError('')}}>계정 삭제</button>
 {!mode&&error&&<span role="alert">{error}</span>}
 {mode&&<div className="overlay"><section className="dialog account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title"><h2 id="account-title">{mode==='password'?'비밀번호 변경':'계정 삭제'}</h2>
 <p>{mode==='password'?'변경 후 모든 기기에서 로그아웃됩니다.':'계정과 계획, 할 일, 실행 기록, 수정 이력, 돌아보기, 생각이 모두 영구 삭제됩니다. 먼저 전체 내보내기로 백업하세요.'}</p>
 <form onSubmit={submit}><label>현재 비밀번호<input autoFocus name="current_password" type="password" autoComplete="current-password" required minLength={12} maxLength={128}/></label>
 {mode==='password'?<label>새 비밀번호 (12~128자)<input name="new_password" type="password" autoComplete="new-password" required minLength={12} maxLength={128}/></label>:<label>확인을 위해 ‘계정 삭제’를 입력하세요<input name="confirmation" required pattern="계정 삭제" autoComplete="off"/></label>}
 <p role="alert">{error}</p><div className="form-actions"><button className="btn btn-light" type="button" disabled={busy} onClick={()=>setMode(null)}>취소</button><button className="btn btn-primary" disabled={busy}>{busy?'처리 중…':mode==='password'?'변경하고 로그아웃':'영구 삭제'}</button></div></form></section></div>}</div>
}
