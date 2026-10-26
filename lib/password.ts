import {randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
// Node's vetted scrypt implementation; no custom hashing algorithm.
const N=131072,r=8,p=1,keyLength=64;
function derive(password:string,salt:Buffer):Promise<Buffer>{
 return new Promise((resolve,reject)=>scryptCallback(password,salt,keyLength,{N,r,p,maxmem:256*1024*1024},(e,key)=>e?reject(e):resolve(key)));
}
export function validPassword(value:unknown):value is string {
 return typeof value==='string'&&value.length>=12&&value.length<=128&&Buffer.byteLength(value,'utf8')<=512;
}
export async function hashPassword(password:string):Promise<string>{
 const salt=randomBytes(16),key=await derive(password,salt);
 return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${key.toString('hex')}`;
}
export async function verifyPassword(password:string,encoded:string):Promise<boolean>{
 const [algorithm,n,rr,pp,salt,hash]=encoded.split('$');
 if(algorithm!=='scrypt'||Number(n)!==N||Number(rr)!==r||Number(pp)!==p||!/^[a-f0-9]{32}$/.test(salt??'')||!/^[a-f0-9]{128}$/.test(hash??''))return false;
 const actual=await derive(password,Buffer.from(salt,'hex'));
 return timingSafeEqual(actual,Buffer.from(hash,'hex'));
}
// Same expensive verification when an account does not exist (not a usable credential).
export const DUMMY_HASH=`scrypt$${N}$${r}$${p}$${'00'.repeat(16)}$${'00'.repeat(64)}`;
