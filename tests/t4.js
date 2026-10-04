const {chromium}=require('playwright');const SP=process.env.SP;
const MOCK=()=>{const DD=()=>(window.__drive=window.__drive||{});
 window.google={accounts:{oauth2:{initTokenClient:o=>({requestAccessToken:()=>setTimeout(()=>o.callback({access_token:'tok',expires_in:3600}),10)}),revoke(){}}}};
 const of=window.fetch;window.fetch=async(url,opt={})=>{url=String(url);if(!url.includes('googleapis.com'))return of(url,opt);const J=(o,st=200)=>new Response(typeof o==='string'?o:JSON.stringify(o),{status:st});
  if(url.includes('userinfo'))return J({email:'test@gmail.com'});
  if(url.includes('/drive/v3/files?')&&!url.includes('upload'))return J({files:DD().f?[{id:'f1'}]:[]});
  if(url.includes('alt=media'))return J(DD().f);
  if(url.includes('uploadType=multipart')){const b=opt.body;DD().f=b.split('\r\n\r\n')[2].split('\r\n--')[0];DD().writes=(DD().writes||0)+1;return J({id:'f1'})}
  if(url.includes('uploadType=media')){DD().f=opt.body;DD().writes=(DD().writes||0)+1;return J({id:'f1'})}
  return J({},404)}};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const errs=[];
 const mk=async()=>{const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(MOCK);const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));return {ctx,pg}};
 // phone 1: one session, connect → file created
 const P1=await mk();let pg=P1.pg;await pg.goto('http://localhost:'+(process.env.PORT||8766)+'/');await pg.evaluate(()=>localStorage.setItem('charge-gcid','123-abc.apps.googleusercontent.com'));await pg.reload();await pg.waitForTimeout(500);
 await pg.click('[data-a="obdone"]');await pg.click('[data-a="startsess"]');await pg.fill('#dkg','70');await pg.click('[data-a="wdone"]');await pg.waitForTimeout(200);await pg.click('#rbtn');
 await pg.click('#nav [data-v="prof"]');await pg.click('[data-a="page"][data-v="data"]');await pg.waitForTimeout(200);await pg.screenshot({path:SP+'/shots/30-prof-google.png',fullPage:true});
 await pg.click('[data-a="gsync"]');await pg.waitForTimeout(800);
 const drive=await pg.evaluate(()=>window.__drive.f);
 const r1=await pg.evaluate(()=>({state:G.state,email:GS.email,logs:S.logs.length,writes:__drive.writes}));
 await pg.screenshot({path:SP+'/shots/31-prof-google-on.png',fullPage:true});
 // phone 2: other data, connects → merged both ways
 const P2=await mk();const q=P2.pg;await q.addInitScript(d=>{window.__drive={f:d}},drive);await q.goto('http://localhost:'+(process.env.PORT||8766)+'/');await q.evaluate(()=>localStorage.setItem('charge-gcid','123-abc.apps.googleusercontent.com'));await q.reload();await q.waitForTimeout(400);
 await q.click('[data-a="obdone"]');await q.evaluate(()=>{S.bw.push(stamp({d:today(),kg:61}));save()});
 await q.click('#nav [data-v="prof"]');await q.click('[data-a="page"][data-v="data"]');await q.click('[data-a="gsync"]');await q.waitForTimeout(800);
 console.log('R1',JSON.stringify(r1),await q.evaluate(()=>JSON.stringify({st:G.state,err:G.err,tok:!!G.tok,on:GS.on,d:typeof __drive.f})));const r2=await q.evaluate(()=>({state:G.state,logs:S.logs.length,sess:S.sess.length,bw:S.bw.length,remote:fromJSON(__drive.f).bw.length,remoteLogs:fromJSON(__drive.f).logs.length}));
 // auto push after a save while token valid
 await q.evaluate(()=>{S.bw[0].kg=62;stamp(S.bw[0]);save()});await q.waitForTimeout(2200);const r3=await q.evaluate(()=>fromJSON(__drive.f).bw[0].kg);
 // programmes page
 await q.evaluate(()=>go('seance',{page:'progs'}));await q.waitForTimeout(300);await q.screenshot({path:SP+'/shots/32-programmes.png',fullPage:true});
 await q.click('[data-a="tpl"][data-v="gl"]');await q.click('[data-a="usetpl"][data-v="gl"]');await q.waitForTimeout(200);const r4=await q.evaluate(()=>({pn:S.pn,progs:S.progs.map(p=>p.n),plan:previewPlan().map(p=>p.id)}));
 console.log(JSON.stringify({r1,r2,r3,r4},null,1),'ERRS',errs);await b.close()})();
