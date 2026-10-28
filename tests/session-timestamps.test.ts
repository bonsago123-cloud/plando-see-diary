import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

test('migration preserves legacy dates and does not invent historical edit times',async()=>{
 const db=new PGlite();
 try{
  await db.exec("CREATE TABLE work_sessions(id integer,created_at timestamptz); INSERT INTO work_sessions VALUES(1,'2026-10-27T15:30:00Z');");
  const sql=await readFile('db/migrations/20261028_session_timestamps.sql','utf8');
  await db.exec(sql);await db.exec(sql);
  const {rows}=await db.query<{created_at:Date;updated_at:Date|null}>('SELECT * FROM work_sessions');
  assert.equal(rows[0].created_at.toISOString(),'2026-10-27T15:30:00.000Z');assert.equal(rows[0].updated_at,null);
 }finally{await db.close()}
});

test('audit display uses Korea date rollover and 24-hour seconds; missing edit stays unknown',async()=>{
 const temp=await mkdtemp(path.resolve('.timestamp-test-'));
 try{
  await build({entryPoints:['app/components/session-timestamps.tsx'],bundle:true,platform:'node',format:'esm',outfile:path.join(temp,'component.mjs'),packages:'external',jsx:'automatic'});
  const {default:Stamp}=await import(path.join(temp,'component.mjs'));
  const html=renderToStaticMarkup(React.createElement(Stamp,{createdAt:'2026-10-27T15:30:01Z',updatedAt:'2026-10-28T14:59:59Z'}));
  assert.ok(html.includes('2026-10-28 00:30:01'));assert.ok(html.includes('2026-10-28 23:59:59'));assert.ok(html.includes('한국 시간'));
  const missing=renderToStaticMarkup(React.createElement(Stamp,{createdAt:'2026-10-27T15:30:01Z',updatedAt:null}));
  assert.equal((missing.match(/<time /g)||[]).length,1);assert.ok(missing.includes('—'));
 }finally{await rm(temp,{recursive:true,force:true})}
});
