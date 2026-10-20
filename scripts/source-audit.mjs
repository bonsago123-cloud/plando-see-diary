// Offline static guard. It does not replace deployment, browser, or Git-history verification.
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const include=['app','lib','db','contracts','public','scripts','tests'];
const files=[];
for(const folder of include){
 const walk=dir=>{for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else files.push(p);
 }};walk(path.join(root,folder));
}
let bad=0;
for(const file of files){const content=fs.readFileSync(file,'utf8');
 const violations=[];
 if(/postgres(?:ql)?:\/\/[^\s'"`]*:[^\s'"`]*@/i.test(content))violations.push('credential-shaped database URL');
 if(file.endsWith('.tsx')&&/dangerouslySetInnerHTML/.test(content))violations.push('unsafe HTML injection');
 if(/process\.env\.NEXT_PUBLIC_DATABASE_URL/.test(content))violations.push('public DATABASE_URL');
 if(file.endsWith('.tsx')&&/<script[\s>]/i.test(content))violations.push('raw script tag');
 if(violations.length){console.error(`${path.relative(root,file)}: ${violations.join(', ')}`);bad++}
}
if(bad)process.exit(1);
console.log(`PASS: ${files.length} source files checked for common secret / injection risks.`);
