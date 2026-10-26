'use client';
import {useState,type FormEvent} from 'react';
export default function LoginForm(){
 const [register,setRegister]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;
  const form=event.currentTarget,fields=new FormData(form);
  if(register&&fields.get('password')!==fields.get('confirmation')){setMessage('비밀번호가 서로 다릅니다.');return}
  setBusy(true);setMessage('');
  try{
   const res=await fetch('/api/auth/'+(register?'register':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fields.get('email'),password:fields.get('password')})});
   const json=await res.json();
   // Never retain passwords in component state or browser storage.
   form.querySelectorAll<HTMLInputElement>('input[type=password]').forEach(input=>{input.value=''});
   if(!res.ok)throw Error(json.error||'요청을 처리하지 못했습니다.');
   if(register){setRegister(false);setMessage('가입이 완료되었습니다. 로그인해 주세요.')}else window.location.replace('/diary');
  }catch(e){setMessage(e instanceof Error?e.message:'연결을 확인하세요.')}finally{setBusy(false)}
 }
 return <main className="auth-page"><section className="auth-card"><div className="auth-brand">✦ 플랜두씨</div><h1>{register?'나만의 다이어리 만들기':'다시 만나 반가워요'}</h1><p>로그인하고 나의 계획과 기록을 이어가세요.</p><form onSubmit={submit}>
 <label>이메일<input type="email" name="email" autoComplete="username" required maxLength={254}/></label>
 <label>비밀번호<input type="password" name="password" autoComplete={register?'new-password':'current-password'} minLength={12} maxLength={128} required/></label>
 {register&&<><small>비밀번호는 12~128자로 입력하세요.</small><label>비밀번호 확인<input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label></>}
 <p role="status" aria-live="polite">{message}</p><button className="btn btn-primary" disabled={busy}>{busy?'처리 중…':register?'가입하기':'로그인'}</button></form>
 <button className="auth-switch" type="button" disabled={busy} onClick={()=>{setRegister(!register);setMessage('')}}>{register?'이미 계정이 있나요? 로그인':'처음 오셨나요? 회원가입'}</button><small>계정마다 기록이 따로 보관됩니다.</small></section></main>
}
