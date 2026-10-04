const {chromium}=require('playwright');const SP=process.env.SP;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'}).catch(()=>chromium.launch());
 const R={};const errs=[];
 async function fresh(store){const ctx=await b.newContext({viewport:{width:390,height:844}});const pg=await ctx.newPage();
  pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:'+(process.env.PORT||8766)+'/');if(store!==undefined){await pg.evaluate(s=>{localStorage.clear();if(s!==null)localStorage.setItem('charge',s)},store);await pg.reload()}await pg.waitForTimeout(700);return {ctx,pg}}
 const H=36e5,now=Date.now();
 // A. v4.3 data with the u collision (seat edited → e.u numeric) and an exercise in seconds, with an open v4 session
 const v4={v:4,pn:'Full body',cur:'fb0',progs:[{id:'fb0',n:'Full body A',items:[{id:'presse',s:3,rmin:8,rmax:12},{id:'gainage',s:3,rmin:30,rmax:60}],u:now-9e5,ver:1}],
  ex:[{id:'presse',n:'Presse à cuisses',m:['quadriceps','fessiers'],k:'machine',c:1,seat:'siège 4',u:now-5e5},{id:'gainage',n:'Gainage (planche)',m:['abdos'],k:'pdc',c:0,seat:'',u:'s'}],
  sess:[{id:'s1',start:now-72*H,end:now-71*H,state:'done',p:'fb0',pn:'Full body A',plan:[{id:'presse',s:3,rmin:8,rmax:12}]},{id:'s2',start:now-24*H,end:now-23*H,state:'done',p:'fb0',pn:'Full body A',plan:[{id:'presse',s:3,rmin:8,rmax:12}]}],
  logs:[{id:'a',sid:'s1',e:'presse',kg:100,r:10,f:'ok',t:now-72*H+1e5},{id:'b',sid:'s2',e:'presse',kg:110,r:10,f:'ok',t:now-24*H+1e5},{id:'c',sid:'s2',e:'gainage',kg:0,r:45,f:'ok',t:now-24*H+2e5}],
  prof:{onb:1,sess:3,rest:90,step:2.5,w:80,h:180,a:30,sex:'h',goal:'masse',act:'leger'},food:[],bw:[],meas:[],myfoods:[],fav:[],tmeals:[],water:{},badges:{},goalsEx:{},wkGoal:{},del:{},mt:{}};
 {const {ctx,pg}=await fresh(JSON.stringify(v4));R.A=await pg.evaluate(()=>({fail:/Écran indisponible/.test($('#app').textContent),presseU:typeof S.ex.find(e=>e.id==='presse').u,presseUnit:uOf('presse'),gainage:uOf('gainage'),logs:S.logs.map(l=>l.e+':'+l.lt+'/'+l.un),v:S.v,baks:0,txt:$('#app').textContent.slice(0,80)}));
  R.A.baks=(await pg.evaluate(async()=>(await listBackups()).map(b=>b.why)));
  // seat edit then reload (the old P0)
  await pg.evaluate(()=>{const e=S.ex.find(x=>x.id==='presse');e.seat='siège 5';stamp(e,'ex','presse');save()});await pg.reload();await pg.waitForTimeout(600);
  R.A.afterSeat=await pg.evaluate(()=>({fail:/Écran indisponible/.test($('#app').textContent),unit:uOf('presse'),h1:$('h1')?.textContent}));
  // B. change unit/type after sets: volume, records, XP unchanged
  R.B=await pg.evaluate(()=>{const before={vol:XP().vol,xp:XP().xp,recs:RECS().size};const e=S.ex.find(x=>x.id==='presse');e.lt='assist';stamp(e,'ex','presse');save();evalBadges(true);const after={vol:XP().vol,xp:XP().xp,recs:RECS().size,txt:setTxt(S.logs.find(l=>l.id==='b'))};return {before,after}});
  await ctx.close()}
 // C. unreadable data: recovery screen, nothing overwritten
 {const {ctx,pg}=await fresh('{"v":4,"logs":[BROKEN');R.C=await pg.evaluate(()=>({bad:!!BAD,raw:localStorage.getItem('charge'),h1:$('h1')?.textContent,nav:$('#nav').hidden}));
  await pg.evaluate(()=>{S.logs.push({});save()});R.C.afterSave=await pg.evaluate(()=>localStorage.getItem('charge'));await ctx.close()}
 // D. merge scenarios
 {const {ctx,pg}=await fresh(null);R.D=await pg.evaluate(()=>{const H=36e5,now=Date.now(),out={};
  const base=()=>{const o=SEED();o.sess=[{id:'s1',start:now-H,end:now,state:'done',p:'fb0',pn:'A',plan:[],ver:1,u:now-H}];return o};
  // skew: device B (clock 10 min late) deletes a set
  const A=base();A.logs=[{id:'l1',sid:'s1',e:'presse',kg:90,r:10,t:now-H/2,ver:1,u:now}];
  const Bc=structuredClone(A);Bc.logs=[];Bc.del={'logs:l1':{t:now-6e5,v:1}};out.skew=merge(A,Bc).logs.length;
  // old tomb (300 days) still wins
  const Cc=structuredClone(A);Cc.logs=[];Cc.del={'logs:l1':{t:now-300*864e5,v:1}};out.oldTomb=merge(A,Cc).logs.length;
  // two open sessions are kept open
  const X=base(),Y=base();X.sess.push({id:'sa',start:now-6e5,end:null,state:'active',plan:[],ver:1,u:now});Y.sess.push({id:'sb',start:now-3e5,end:null,state:'active',plan:[],ver:1,u:now});
  out.actives=merge(X,Y).sess.filter(s=>s.state==='active').length;
  // newer edit beats older, deterministic both ways
  const P=base(),Q=base();P.logs=[{id:'l2',sid:'s1',e:'presse',kg:90,r:10,t:now,ver:2,u:now-1e5}];Q.logs=[{id:'l2',sid:'s1',e:'presse',kg:95,r:10,t:now,ver:3,u:now-2e5}];
  out.ver=[merge(P,Q).logs[0].kg,merge(Q,P).logs[0].kg];return out});await ctx.close()}
 // E. pyramid without warm-up flag: load can still go up
 {const {ctx,pg}=await fresh(null);R.E=await pg.evaluate(()=>{const now=Date.now();S=SEED();S.prof.onb=1;S.sess=[{id:'s1',start:now-864e5,end:now-8e7,state:'done',p:'fb0',pn:'A',plan:[{id:'presse',s:3,rmin:8,rmax:12}]}];
  [[60,12],[80,12],[100,12],[100,12],[100,12]].forEach(([kg,r],i)=>S.logs.push({id:'p'+i,sid:'s1',e:'presse',kg,r,f:'ok',t:now-864e5+i*1e5,lt:'load',un:'reps'}));REV++;return target('presse')});await ctx.close()}
 // F. honest import: backup failure → no "copy made"
 console.log(JSON.stringify(R,null,1));console.log('ERRS',errs);await b.close()})();
