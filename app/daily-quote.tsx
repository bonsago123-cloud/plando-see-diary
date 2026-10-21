'use client';
import {useEffect,useState} from 'react';
import {ExternalLink,RefreshCw,Sparkles} from 'lucide-react';
import {QUOTES,nextQuoteIndex} from '@/lib/quotes';

const STORED_INDEX='plando-see-last-quote-index';

/** Optional dashboard content. Does not call the database or affect Plan/Do/See. */
export default function DailyQuote(){
 const [index,setIndex]=useState(0);
 useEffect(()=>{
  // sessionStorage survives F5 but is limited to this browser tab.
  // Keep the choice after hydration so the server and client HTML match.
  try{
   const previous=Number(window.sessionStorage.getItem(STORED_INDEX));
   const next=nextQuoteIndex(Number.isInteger(previous)&&previous>=0&&previous<QUOTES.length?previous:0);
   setIndex(next);
   window.sessionStorage.setItem(STORED_INDEX,String(next));
  }catch{
   setIndex(nextQuoteIndex(0));
  }
 },[]);
 const quote=QUOTES[index];
 function changeQuote(){
  const next=nextQuoteIndex(index);
  setIndex(next);
  try{window.sessionStorage.setItem(STORED_INDEX,String(next));}catch{/* Browser storage may be disabled */}
 }
 return <section className="quote-strip quote-card" aria-label="오늘의 명언">
  <span className="quote-icon" aria-hidden="true"><Sparkles size={21}/></span>
  <div className="quote-card-content" aria-live="polite" aria-atomic="true">
   <span className="quote-heading">오늘의 명언 · {QUOTES.length}개 중 하나</span>
   <strong className="quote-korean">“{quote.ko}”</strong>
   <p className="quote-original" lang="en">“{quote.original}”</p>
   <div className="quote-credit">
    <span>— {quote.author}</span>
    <a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer" title="명언 원문 출처 열기">{quote.work} <ExternalLink size={12} aria-hidden="true"/></a>
   </div>
  </div>
  <button type="button" className="quote-refresh" onClick={changeQuote} aria-label="다른 명언 보기" title="다른 명언 보기"><RefreshCw size={19}/></button>
 </section>;
}
