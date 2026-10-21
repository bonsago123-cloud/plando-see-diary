'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Volume2,VolumeX} from 'lucide-react';
import {startRecoveryScene} from '@/lib/recovery-scene';

interface Props {audio:HTMLAudioElement;onClose:()=>void}

/** Pixel campfire only, with a looping original crackling recording; no site data is touched. */
export default function CampfireRecovery({audio,onClose}:Props){
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 const [muted,setMuted]=useState(audio.muted);
 useEffect(()=>{
  const canvas=canvasRef.current;
  if(!canvas)return;
  const stop=startRecoveryScene(canvas);
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};
  window.addEventListener('keydown',onEscape);
  return ()=>{
   stop();
   document.body.style.overflow=previous;
   window.removeEventListener('keydown',onEscape);
  };
 },[onClose]);
 function toggleSound(){
  if(audio.paused){void audio.play().catch(()=>{});audio.muted=false;setMuted(false);return;}
  audio.muted=!audio.muted;
  setMuted(audio.muted);
 }
 return <section className="campfire-fullscreen" aria-label="모닥불 휴식 화면" role="dialog" aria-modal="true">
  <canvas ref={canvasRef} className="campfire-canvas" role="img" aria-label="움직이는 도트 그래픽 캠프파이어와 밤하늘" />
  <div className="campfire-tools">
   <button type="button" className="campfire-tool" onClick={toggleSound} aria-label={muted?'장작 타는 소리 켜기':'장작 타는 소리 끄기'} title={muted?'소리 켜기':'소리 끄기'} aria-pressed={!muted}>{muted?<VolumeX size={21}/>:<Volume2 size={21}/>}</button>
   <button type="button" className="campfire-tool" onClick={onClose} aria-label="계획 화면으로 돌아가기" title="돌아가기"><ArrowLeft size={22}/></button>
  </div>
 </section>;
}
