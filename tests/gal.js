const {chromium}=require('playwright');const SP=process.env.SP;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const pg=await (await b.newContext({viewport:{width:1000,height:800},deviceScaleFactor:1})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+(process.env.PORT||8766)+'/');await pg.waitForTimeout(400);
const n=await pg.evaluate(()=>{const ids=S.ex.map(e=>e.id);document.body.innerHTML='<div id="g" style="display:grid;grid-template-columns:repeat(6,160px);gap:6px;padding:6px;background:#fff;font:11px sans-serif"></div>';
 const g=document.getElementById('g');ids.forEach(id=>{const d=document.createElement('div');d.innerHTML=`<div style="width:160px;height:136px;border-radius:8px;overflow:hidden">${figSvg(figId(id),{t:1,arrow:true})}</div><div>${id}${FIG[id]?'':' *'}</div>`;g.appendChild(d)});return ids.length});
const h=await pg.evaluate(()=>document.body.scrollHeight);const parts=Math.ceil(h/1500);
await pg.setViewportSize({width:1000,height:h});for(let i=0;i<parts;i++){await pg.screenshot({path:SP+'/shots/gal'+i+'.png',clip:{x:0,y:i*1500,width:1000,height:Math.min(1500,h-i*1500)}})}
console.log(n,parts,errs);await b.close()})();
