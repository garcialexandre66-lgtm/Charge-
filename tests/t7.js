const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+(process.env.PORT||8766)+'/');await pg.waitForTimeout(500);
const R=await pg.evaluate(()=>{const o={};S=SEED();S.prof.onb=1;REV++;
 // deletions survive a merge with the old copy
 S.food.push(stamp({id:'f1',d:today(),m:'Déjeuner',n:'Riz',q:100,k:130,p:3,g:28,l:0}));S.bw.push(stamp({d:'2026-10-01',kg:70},'bw','2026-10-01'));const old=structuredClone(S);
 A.delfood('f1');A.delbw('2026-10-01');A.usetpl('gl');const M=merge(S,old);o.del={food:M.food.length,bw:M.bw.length,progs:M.progs.map(p=>p.id).join(',')};
 // re-set goal survives
 S.logs.push({id:'g1',sid:S.sess[0]?.id||'x',e:'couche',kg:60,r:5,t:Date.now()});
 S.goalsEx.couche=stamp({kg:80,from:60,set:today()},'goalsEx','couche');A.delgoal('couche');S.goalsEx.couche=stamp({kg:90,from:60,set:today(),ver:0},'goalsEx','couche');o.goal=!!merge(S,S).goalsEx.couche;
 // calorie floor
 Object.assign(S.prof,{sex:'f',w:50,h:155,a:45,act:'sed',sess:2,goal:'seche',kadj:-1000});S.bw=[];REV++;const g=goals();o.kcal=[g.k,g.floored];
 // XSS ids dropped by migration
 const bad=SEED();bad.ex.push({id:'x"><img src=x onerror=alert(1)>',n:'pwn',m:['abdos'],k:'machine'});o.xss=fromJSON(JSON.stringify(bad)).ex.some(e=>e.n==='pwn');
 // extra item from programme
 o.extra=JSON.stringify(extraItem('hipthrust'));
 return o});
// stale session from yesterday: next set opens a new one
const R2=await pg.evaluate(()=>{S=SEED();S.prof.onb=1;const y=Date.now()-30*36e5;S.sess.push({id:'old',start:y,end:null,state:'active',p:'fb0',pn:'A',plan:previewPlan()});S.logs.push({id:'o1',sid:'old',e:'presse',kg:80,r:8,f:'ok',t:y+1e5,lt:'load',un:'reps'});REV++;render();
 logSet('presse',82.5,8,'ok');closeOv();view.rest=null;return {old:sessById('old').state,act:active()?.id!=='old',n:S.sess.length}});
// warm-up from the sheet keeps the sheet usable; rest minimise shows pill
await pg.evaluate(()=>{S=SEED();S.prof.onb=1;REV++;render();A.set('squat');});await pg.waitForTimeout(100);
const R3=await pg.evaluate(()=>{A.warm('20:8');const ok1=curSheet==='set'&&!!view.st;A.feel('easy');return {sheetAfterWarm:ok1}});
await pg.evaluate(()=>{close();view={};render()});await pg.fill('#dkg','90');await pg.click('[data-a="wdone"]');await pg.waitForTimeout(200);await pg.click('[data-a="restmin"]');await pg.waitForTimeout(1300);
const R4=await pg.evaluate(()=>({pill:$('#pill').textContent,rest:!!view.rest,ov:!!$('#ov').innerHTML}));
await pg.click('[data-a="editlog"] >> nth=0');await pg.waitForTimeout(100);await pg.click('#ov [data-a="close"]');const R5=await pg.evaluate(()=>({restAfterSheet:!!view.rest}));
await pg.click('[data-a="restopen"]');const R6=await pg.evaluate(()=>!!$('#rtime'));
// correct an old set with its own measure
const R7=await pg.evaluate(()=>{S=SEED();S.prof.onb=1;S.sess.push({id:'s9',start:Date.now()-864e5,end:Date.now()-8e7,state:'done',plan:[]});S.logs.push({id:'gx',sid:'s9',e:'gainage',kg:0,r:120,f:'ok',t:Date.now()-864e5,lt:'bw',un:'s'});S.ex.find(e=>e.id==='gainage').unit='reps';REV++;closeOv();editLogSheet({lid:'gx'});A.savelog();return S.logs.find(l=>l.id==='gx').r===120&&!curSheet});
console.log(JSON.stringify({R,R2,R3,R4,R5,R6,R7}),'ERRS',errs);await b.close()})();
