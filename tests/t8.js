const {chromium}=require('playwright');const SP=process.env.SP;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load/.test(m.text()))errs.push(m.text())});
 const shot=async(n,full=false)=>pg.screenshot({path:SP+'/shots/'+n+'.png',fullPage:full});
 const bad=async n=>{const t=await pg.textContent('#app');if(/Écran indisponible/.test(t))errs.push('FAIL '+n+' '+t.slice(0,200))};
 await pg.goto('http://localhost:'+(process.env.PORT||8766)+'/');await pg.waitForTimeout(500);await shot('01-onboard',true);
 await pg.click('[data-a="obdone"]');await pg.waitForTimeout(200);await shot('02-home',true);await bad('home');
 await pg.click('[data-a="startsess"]');await pg.waitForTimeout(200);await shot('03-workout',true);await bad('workout');
 await pg.click('[data-a="dkg"][data-v="1"]');await pg.click('[data-a="dkg"][data-v="1"]');
 await pg.click('[data-a="wdone"]');await pg.waitForTimeout(300);await shot('04-rest');
 await pg.click('[data-a="rfeel"][data-v="ok"]');await pg.click('#rbtn');await pg.waitForTimeout(200);await shot('05-workout-set2',true);
 for(let i=0;i<2;i++){await pg.click('[data-a="wdone"]');await pg.waitForTimeout(150);await pg.click('#rbtn');await pg.waitForTimeout(150)}
 await shot('06-next-ex',true);await bad('next');
 const st=await pg.evaluate(()=>({cur:curEx(),logs:S.logs.map(l=>l.e+' '+l.kg+'x'+l.r)}));console.log(JSON.stringify(st));
 await pg.click('[data-a="swapsheet"]');await pg.waitForTimeout(150);await shot('07-swap');await pg.click('[data-a="close"]');
 for(const t of ['prog','nut','prof']){await pg.click(`#nav [data-v="${t}"]`);await pg.waitForTimeout(250);await shot('10-'+t,true);await bad(t)}
 await pg.click('[data-a="corpspage"][data-v="poids"]');await pg.waitForTimeout(150);await shot('11-poids',true);await bad('poids');await pg.click('[data-a="tomoi"]');
 await pg.click('[data-a="page"][data-v="data"]');await pg.waitForTimeout(150);await shot('12-data',true);await bad('data');await pg.click('[data-a="back"]');
 await pg.click('[data-a="page"][data-v="set"]');await pg.waitForTimeout(150);await bad('set');await pg.click('[data-a="back"]');
 await pg.click('[data-a="page"][data-v="me"]');await pg.waitForTimeout(150);await bad('me');await pg.click('[data-a="bodyok"]');
 await pg.click('#nav [data-v="prog"]');for(const p of ['month','trophies','records','lib']){await pg.click(`[data-a="page"][data-v="${p}"]`);await pg.waitForTimeout(200);await bad(p);if(p==='month')await shot('13-month',true);await pg.click('[data-a="back"]');await pg.waitForTimeout(100)}
 await pg.click('[data-a="exdetail"] >> nth=0');await pg.waitForTimeout(300);await shot('14-exercise',true);await bad('ex');
 await pg.click('#nav [data-v="seance"]');await pg.waitForTimeout(150);await pg.click('[data-a="finish"]');await pg.waitForTimeout(200);await pg.click('[data-a="savesession"]');await pg.waitForTimeout(600);await shot('15-win');await pg.click('[data-a="winok"]');await pg.waitForTimeout(200);await shot('16-home-after',true);await bad('after');
 await pg.click('[data-a="choosesess"]');await pg.waitForTimeout(150);await shot('17-choose');await pg.click('[data-a="close"]');
 await pg.emulateMedia({colorScheme:'dark'});await pg.click('[data-a="startsess"]');await pg.waitForTimeout(200);await shot('18-dark-workout',true);
 console.log('ERRS',JSON.stringify(errs));await b.close()})();
