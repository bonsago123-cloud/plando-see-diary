/** Pixel-art campfire scene. Canvas-only, no network calls, no user data. */
const W = 640;
const H = 360;
function rand(seed) { let x=seed>>>0; return ()=> {x^=x<<13;x^=x>>>17;x^=x<<5;return ((x>>>0)%100000)/100000}; }
const random=rand(247109);
const stars=Array.from({length:118},()=>({x:12+random()*616,y:6+random()*134,r:random()>.93?2:1,phase:random()*6.28}));
const grasses=Array.from({length:260},()=>({x:random()*640,y:251+random()*109,s:random()*4,c:random()>.48?'#1b3541':'#263847'}));
const embers=Array.from({length:32},()=>({x:(random()-.5)*70,s:random(),speed:.35+random()*.8,side:random()*6.28}));
const water=Array.from({length:112},()=>({x:random()*640,y:178+random()*74,w:2+random()*10,phase:random()*6.28}));
const town=Array.from({length:65},()=>({x:random()*640,y:154+random()*12,l:random()>.32}));
const pines=Array.from({length:18},(_,i)=>({x:(i<9?random()*145:500+random()*140),y:170+random()*120,h:45+random()*85}));
const fract=x=>x-Math.floor(x);
function rect(ctx,x,y,w,h,color) {ctx.fillStyle=color;ctx.fillRect(Math.floor(x),Math.floor(y),Math.ceil(w),Math.ceil(h));}
function poly(ctx,pts,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(Math.round(pts[0][0]),Math.round(pts[0][1]));for(let i=1;i<pts.length;i++)ctx.lineTo(Math.round(pts[i][0]),Math.round(pts[i][1]));ctx.closePath();ctx.fill()}
function line(ctx,x1,y1,x2,y2,col,w=1){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function pine(ctx,x,y,h,dim=false){
 const col=dim?'#111d32':'#071522'; const col2=dim?'#223047':'#101e2b';
 rect(ctx,x-2,y-h*.15,4,h*.22,'#182435');
 for(let k=0;k<5;k++){
  const yy=y-h+k*h*.185;
  const half=4+k*h*.115;
  poly(ctx,[[x,yy],[x-half,yy+h*.31],[x+half,yy+h*.31]],k%2?col:col2);
  rect(ctx,x-half*.63,yy+h*.29,half*1.26,3,col);
 }
}
function drawSky(ctx,t){
 const colors=['#081126','#0b1833','#101d3d','#192346','#23284c','#303052','#393352','#46334f','#51384e'];
 colors.forEach((c,i)=>rect(ctx,0,i*18,W,19,c));
 for(let i=0;i<60;i++){
  const xx=(i*73+8)%W;const yy=65+(i*29)%99;rect(ctx,xx,yy,36+(i%7)*9,2,i%2?'#414263':'#323557');
 }
 for(const s of stars){const glow=.5+.5*Math.sin(t*.0016+s.phase);rect(ctx,s.x,s.y,s.r,s.r,glow>.38?'#f9dbbd':'#7e9ac0');if(s.r===2&&glow>.65){rect(ctx,s.x-2,s.y+1,6,1,'#94a8c8');rect(ctx,s.x+1,s.y-2,1,6,'#94a8c8')}}
 // crescent moon
 for(let dy=-12;dy<=12;dy++){const span=Math.sqrt(Math.max(0,144-dy*dy));rect(ctx,466-span,50+dy,span*2,1,'#ffe7a5')}
 for(let dy=-12;dy<=9;dy++){const span=Math.sqrt(Math.max(0,144-(dy-3)*(dy-3)));rect(ctx,459-span,46+dy,span*2,1,'#1d2446')}
 // mountains and snow
 poly(ctx,[[0,162],[80,114],[135,136],[205,93],[258,119],[321,74],[388,121],[466,100],[560,142],[640,119],[640,191],[0,191]],'#2d355a');
 poly(ctx,[[0,174],[106,139],[158,153],[215,108],[271,150],[330,93],[402,148],[450,133],[525,166],[640,143],[640,192],[0,192]],'#212e50');
 poly(ctx,[[192,115],[205,93],[220,115],[210,110],[205,106],[201,113]],'#9993ad');
 poly(ctx,[[308,100],[321,74],[341,111],[329,102],[323,91],[318,99]],'#e0b7b3');
 poly(ctx,[[0,191],[52,164],[125,181],[204,147],[254,174],[344,135],[420,182],[502,146],[592,172],[640,159],[640,202],[0,202]],'#142442');
 // opposite-shore pine silhouettes
 for(let i=0;i<32;i++){const x=i*24-5;pine(ctx,x,185+(i%4)*2,15+i%6*4,true)}
}
function drawWater(ctx,t){
 rect(ctx,0,178,640,79,'#102c46');
 for(let y=180;y<254;y+=4){rect(ctx,0,y,640,1,Math.floor(y/4)%2?'#163654':'#183853')}
 for(const r of water){const shift=Math.sin(t*.0012+r.phase)*3;rect(ctx,r.x+shift,r.y,r.w,1,r.y<224?'#31516a':'#263f58')}
 // warm shoreline lights
 town.forEach((p,i)=>{if(p.l){rect(ctx,p.x,p.y,2,2,i%3?'#f0ad67':'#ffe3a1');rect(ctx,p.x,180+(i%10)*5,2+(i%3)*2,2,i%2?'#a27657':'#926650')}});
 // moonlight patch
 for(let yy=181;yy<249;yy+=5){const width=5+(yy-180)*.29;const off= Math.sin(t*.0015+yy*.4)*7;rect(ctx,465-width*.5+off,yy,width,1, yy%3?'#8e8390':'#c39e8e')}
 // fire reflection
 for(let yy=194;yy<252;yy+=5){const w=2+(yy-194)*.42+Math.sin(t*.006+yy)*4;rect(ctx,315-w/2+Math.sin(yy+t*.002)*3,yy,w,2,yy%2?'#bb7149':'#e1a65c')}
}
function drawGround(ctx){
 poly(ctx,[[0,252],[40,239],[92,250],[160,237],[219,254],[304,246],[360,255],[441,243],[517,258],[580,245],[640,253],[640,360],[0,360]],'#142332');
 for(let y=260;y<360;y+=9){rect(ctx,0,y,640,3, y%3?'#1b2b33':'#202e35')}
 for(const g of grasses){rect(ctx,g.x,g.y,1.5+g.s,1,g.c); if(g.s>2)rect(ctx,g.x+1,g.y-2,1,2,g.c)}
 // ground fire glow pixels
 for(let yy=233;yy<342;yy+=3){const dist=Math.abs(yy-278)/70; const half=(105-dist*40);for(let x=320-half;x<320+half;x+=7){const r=fract(Math.sin((x+yy*3)*12.9898)*43758.5453);if(r>.63)rect(ctx,x,yy,2+r*4,1,r>.83?'#5c453b':'#3b3536')}}
 // lake-facing dock left
 rect(ctx,0,206,113,7,'#403041');rect(ctx,10,213,6,58,'#2b2531');rect(ctx,92,212,7,41,'#282431');
 for(let i=0;i<8;i++)rect(ctx,i*14,204,11,2,'#76604e');
}
function drawTent(ctx,t){
 poly(ctx,[[487,276],[573,158],[645,281]],'#3b3546');
 poly(ctx,[[538,276],[572,165],[643,282]],'#bb744b');
 poly(ctx,[[553,273],[574,193],[615,275]],'#e5a663');
 poly(ctx,[[572,275],[580,215],[596,273]],'#ffd08c');
 line(ctx,573,161,571,287,'#212533',3);
 line(ctx,488,276,573,156,'#d6a06d',2);
 line(ctx,573,156,644,278,'#f2b178',2);
 rect(ctx,524,284,112,7,'#3e2b30');
 rect(ctx,544,287,79,3,'#81614c');
 // camping bag
 rect(ctx,555,302,49,22,'#424056');rect(ctx,560,306,37,5,'#716478');rect(ctx,565,319,25,2,'#9c7d71');
 // lantern right post
 rect(ctx,592,208,3,42,'#2d2e39');rect(ctx,582,201,14,2,'#765b4f');rect(ctx,582,205,13,2,'#d8a161');rect(ctx,584,208,10,16,'#ffd27b');rect(ctx,583,224,12,3,'#5d4c43');
 rect(ctx,587,211,4,11, Math.floor(t/350)%2?'#ffce78':'#ffe79b');
 // mug atop stool
 rect(ctx,475,299,46,6,'#544140');rect(ctx,480,304,6,35,'#2f2c34');rect(ctx,511,304,6,33,'#2f2b32');
 rect(ctx,490,287,13,12,'#e3c4a4');rect(ctx,504,289,4,7,'#ceb393');rect(ctx,493,289,7,2,'#55474a');
}
function drawLogs(ctx){
 // fire base stones
 for(let i=0;i<15;i++){const a=(i/15)*Math.PI*2;const x=319+Math.cos(a)*44;const y=281+Math.sin(a)*12;rect(ctx,x-8,y-5,16,9,i%3===0?'#7c6663':i%3===1?'#9b786a':'#59536a');rect(ctx,x-8,y+2,16,3,'#3d3545')}
 poly(ctx,[[284,271],[334,254],[348,259],[297,278]],'#583b35');poly(ctx,[[339,272],[306,259],[296,262],[329,283]],'#96623d');
 rect(ctx,294,274,42,4,'#241f2a');
}
function drawFlames(ctx,t){
 const cx=320,base=268;
 // stepped translucent glow, draw in rough bands
 const flicker=Math.sin(t*.013)*4+Math.sin(t*.027)*3;
 for(let band=10;band>=1;band--){ const radius=band*8+23;const alpha=Math.max(.007,(11-band)*.006);ctx.fillStyle=`rgba(255,139,62,${alpha})`;ctx.fillRect(cx-radius/2,base-12-band*5, radius,22+band*6) }
 for(let i=0;i<17;i++){
  const p=(i-8)/8,abs=Math.abs(p),r=fract(Math.sin(i*9.8+Math.floor(t/130)*2.7)*18372.13);
  const height=(40-abs*23)+r*24+(i===8?23:0)+Math.sin(t*.008+i)*6;
  const x=cx+i*3.5-29;
  const mid=base-height;
  rect(ctx,x-2,base-21,5,23,'#b9402a');
  for(let k=0;k<Math.max(1,height/4);k++){
   const yy=base-4-k*4,shift=Math.sin(k*.48+t*.014+i*.44)*(k*.07)+flicker*(k/height);
   const col= k>height*.21?'#ee6434':k>height*.1?'#ffa44f':'#ffe6a0';
   rect(ctx,x+shift,yy,4,5,col);
  }
  rect(ctx,x+Math.sin(t*.012+i)*2,mid+6,3,7,'#ffce73');
 }
 // inner flame tongue
 for(let j=0;j<7;j++){const h=21+8*Math.sin(t*.018+j);rect(ctx,cx-11+j*3,base-h,3,h,'#fff2b7')}
 for(const [i,p] of embers.entries()){
  const age=fract(p.s+t*.00013*p.speed),yy=base-37-age*133;
  const x=cx+p.x+Math.sin(t*.002+p.side)*16+(age-.5)*19;
  const hue=i%4===0?'#ffe4a2':i%3===0?'#fcab59':'#c86a4c';
  if(age<.97)rect(ctx,x,yy,i%6===0?2:1,i%5===0?2:1,hue);
 }
}
function drawForeground(ctx){
 // left wooden stool + sleeping cat
 rect(ctx,73,301,80,12,'#6a483c');rect(ctx,78,312,9,40,'#45343a');rect(ctx,135,312,9,36,'#3e3137');
 rect(ctx,91,285,39,18,'#d5a277');rect(ctx,99,281,28,9,'#e0b48c');rect(ctx,103,277,5,8,'#b67b56');rect(ctx,120,277,5,8,'#b67b56');
 rect(ctx,110,292,3,2,'#503c43');rect(ctx,119,293,3,2,'#503c43');rect(ctx,124,298,17,5,'#bf8e70');
 // low wooden stool right
 rect(ctx,406,296,62,10,'#604437');rect(ctx,412,306,7,50,'#3c3132');rect(ctx,459,306,8,44,'#3c3132');
 // fire stone edge above scene
}
/** @param {HTMLCanvasElement} canvas */
export function startRecoveryScene(canvas){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return ()=>{};
 canvas.width=W;canvas.height=H;ctx.imageSmoothingEnabled=false;
 let stopped=false,raf=0,last=0;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const draw=(ms)=>{const t=reduced?0:ms;
  drawSky(ctx,t);drawWater(ctx,t);drawGround(ctx);
  pines.forEach(p=>pine(ctx,p.x,p.y,p.h,p.y<220));
  drawTent(ctx,t);drawForeground(ctx);drawLogs(ctx);drawFlames(ctx,t);
 };
 const animate=(ms)=>{if(stopped)return;if(ms-last>=55){draw(ms);last=ms;}raf=requestAnimationFrame(animate)};
 draw(0);if(!reduced)raf=requestAnimationFrame(animate);
 return ()=>{stopped=true;cancelAnimationFrame(raf)};
}
