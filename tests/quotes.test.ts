import test from 'node:test';
import assert from 'node:assert/strict';
import {QUOTES,nextQuoteIndex} from '../lib/quotes.ts';

test('명언은 50개이며 원문, 직역, 인물, 출처 링크가 있다',()=>{
 assert.equal(QUOTES.length,50);
 assert.equal(new Set(QUOTES.map(q=>q.original)).size,50);
 for(const quote of QUOTES){
  assert.ok(quote.ko.trim() && quote.original.trim() && quote.author.trim() && quote.work.trim());
  assert.match(quote.sourceUrl,/^https:\/\//);
 }
});
test('새로고침에서 직전 명언은 선택하지 않는다',()=>{
 for(let current=0;current<QUOTES.length;current++){
  for(const random of [0,0.01,0.5,0.99,0.999999]){
   const next=nextQuoteIndex(current,random);
   assert.notEqual(next,current);
   assert.ok(next>=0 && next<QUOTES.length);
  }
 }
});
