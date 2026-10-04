<script>
/* ================= motivation: levels, trophies, weekly challenges, records ================= */
/* levels follow competition plate colours: white 5 kg → green 10 → yellow 15 → blue 20 → red 25 */
const TIERS=[[1,'Recrue','Plaque blanche · 5 kg','#E9E8E3'],[5,'Régulier','Plaque verte · 10 kg','#2FB86E'],[10,'Solide','Plaque jaune · 15 kg','#F2C230'],[15,'Costaud','Plaque bleue · 20 kg','#3D9BFF'],[20,'Monstre','Plaque rouge · 25 kg','#E5383B']];
const tierOf=l=>TIERS.filter(t=>l>=t[0]).at(-1);
/* things everyone can picture */
const EQUIV=[[150000,'baleines bleues','une baleine bleue'],[12000,'bus','un bus'],[6000,'éléphants d’Afrique','un éléphant d’Afrique'],[1200,'voitures','une voiture'],[450,'pianos à queue','un piano à queue'],[200,'motos','une moto']];
function equiv(kg){const e=EQUIV.find(x=>kg>=x[0]);if(!e)return '';const n=kg/e[0];return n<1.5?'≈ '+e[2]:'≈ '+fmt(Math.round(n*10)/10).replace(/,0$/,'')+' '+e[1]}
/* strength standards: estimated 1RM ÷ body weight on the day of the lift (men; women ≈ ×0.65 upper body, ×0.75 lower body). Rough public references. */
const STD={couche:[.5,.75,1,1.5,2,'up'],squat:[.75,1.25,1.5,2.25,2.75,'low'],souleve:[1,1.5,2,2.5,3,'low'],militaire:[.35,.55,.8,1.05,1.35,'up'],frontsquat:[.6,1,1.25,1.75,2.25,'low'],rowbarre:[.5,.75,1,1.5,1.75,'up'],incline_b:[.45,.65,.9,1.3,1.75,'up']};
const STDN=['Débutant','Novice','Intermédiaire','Avancé','Élite'];
const bestRatio=id=>workOf(id).filter(ormOk).reduce((b,l)=>Math.max(b,orm(l.kg,l.r)/wAt(l.t)),0);
function strength(id){const s=STD[id];if(!s||ltOf(id)!=='load'||uOf(id)!=='reps')return null;const r=bestRatio(id);if(!r)return null;const f=S.prof.sex==='f'?(s[5]==='up'?.65:.75):1,th=s.slice(0,5).map(x=>x*f);
 const i=th.filter(x=>r>=x).length-1;return {r,th,i,next:th[i+1]?th[i+1]*wNow():null}}
/* what moved on an exercise since its first session, said exactly:
   weight & reps → change of the best estimated 1RM (Epley, sets of 1–12 reps) between the first session and now;
   other exercises → best count (reps, seconds or metres) of the first session vs best since. */
function gainOf(id){const W=workOf(id);if(!W.length)return null;const sid0=W[0].sid,D0=W.filter(l=>l.sid===sid0);if(new Set(W.map(l=>l.sid)).size<2)return null;
 const since=key(W[0].t);
 if(uOf(id)==='reps'&&ltOf(id)==='load'){const a=Math.max(0,...D0.filter(ormOk).map(l=>orm(l.kg,l.r))),b=best1(id);if(!a||!b)return null;return {pct:Math.round((b/a-1)*100),what:'1RM estimé',from:a,to:b,unit:'kg',since}}
 const a=Math.max(...D0.map(l=>l.r)),b=bestReps(id);if(!a)return null;return {pct:Math.round((b/a-1)*100),what:UL[uOf(id)][1].toLowerCase()+' (meilleure série)',from:a,to:b,unit:UL[uOf(id)][0],since}}
function avgGain(){const G=S.ex.filter(e=>ltOf(e.id)==='load'&&uOf(e.id)==='reps').map(e=>({e,g:gainOf(e.id)})).filter(x=>x.g);
 return G.length?{pct:Math.round(G.reduce((s,x)=>s+x.g.pct,0)/G.length),n:G.length,top:G.sort((a,b)=>b.g.pct-a.g.pct)[0]}:null}
/* personal load goals; "reached" is always recomputed from the sets, so deleting a wrong set cancels it */
function goalInfo(id){const g=S.goalsEx?.[id];if(!g||g.del)return null;const W=workOf(id),cur=best(id),span=g.kg-g.from;
 const hit=W.find(l=>l.kg>=g.kg&&l.t>=Date.parse(g.set+'T00:00')),done=hit?key(hit.t):null,pct=done?1:span>0?Math.max(0,Math.min(1,(cur-g.from)/span)):0;
 const L=W.filter(l=>Date.now()-l.t<63*864e5),byS={};L.forEach(l=>{byS[l.sid]=byS[l.sid]?{t:byS[l.sid].t,v:Math.max(byS[l.sid].v,l.kg)}:{t:l.t,v:l.kg}});const P=Object.values(byS).map(x=>[x.t/864e5/7,x.v]);
 let slope=null;if(P.length>=3){const mx=P.reduce((s,p)=>s+p[0],0)/P.length,my=P.reduce((s,p)=>s+p[1],0)/P.length,den=P.reduce((s,p)=>s+(p[0]-mx)**2,0);slope=den?P.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0)/den:null}
 const left=Math.max(0,g.kg-cur),weeks=!done&&slope>0.05&&left>0?Math.ceil(left/slope):null;return {...g,cur,pct,done,slope,weeks,eta:weeks?addDays(today(),weeks*7):null}}
/* ---------- trophies ---------- */
const CTX=memo(()=>{const X=XP(),D=doneSess(),g=goals();
 const protDays=[...new Set(S.food.map(f=>f.d))].filter(d=>nutDay(d).p>=g.p).length;
 return {X,sessions:D.length,streak:maxStreak(),early:D.some(s=>new Date(s.start).getHours()<8),late:D.some(s=>new Date(s.start).getHours()>=21),
  variety:new Set(IDX().L.filter(l=>!l.w).map(l=>l.e)).size,protDays,weigh:S.bw.length,drop:IDX().L.some(l=>l.dr?.length&&!l.w),meas:S.meas.length,
  bench:bestRatio('couche'),squat:bestRatio('squat'),dead:bestRatio('souleve')}});
const BADGES=[
 ['first','Premier pas','Termine ta première séance','sessions',1],['s10','Habitué','10 séances','sessions',10],['s25','Pilier de salle','25 séances','sessions',25],['s50','Inarrêtable','50 séances','sessions',50],['s100','Centurion','100 séances','sessions',100],
 ['w4','Un mois carré','4 semaines d’affilée avec au moins une séance','streak',4],['w12','Trimestre de fer','12 semaines d’affilée','streak',12],['w26','Six mois sans lâcher','26 semaines d’affilée','streak',26],
 ['pr1','Premier record','Bats ton premier record','prs',1],['pr10','Collectionneur','10 records battus','prs',10],['pr50','Briseur de records','50 records battus','prs',50],
 ['t10','10 tonnes','10 t soulevées au total','vol',10000],['t100','100 tonnes','100 t soulevées au total','vol',100000],['t500','500 tonnes','500 t au total','vol',500000],['t1000','1 000 tonnes','1 000 t au total','vol',1000000],
 ['pw1','Semaine parfaite','Atteins ton objectif de séances sur une semaine','weeksOk',1],['pw8','Deux mois parfaits','8 semaines à l’objectif','weeksOk',8],
 ['early','Lève-tôt','Une séance commencée avant 8 h','early',1],['late','Oiseau de nuit','Une séance commencée après 21 h','late',1],
 ['v20','Touche-à-tout','20 exercices différents essayés','variety',20],['drop','Jusqu’au bout','Ta première série dégressive','drop',1],
 ['prot7','Carburant','Objectif de protéines atteint 7 jours','protDays',7],['weigh10','Sous contrôle','10 pesées enregistrées','weigh',10],['meas1','Mètre ruban','Premières mensurations','meas',1],
 ['bench1','Club du poids de corps','Développé couché ≥ ton poids du jour (1RM estimé)','bench',1],['squat15','Cuisses d’acier','Squat ≥ 1,5 × ton poids du jour','squat',1.5],['dead2','Double poids','Soulevé de terre ≥ 2 × ton poids du jour','dead',2]
].map(([id,n,d,k,goal])=>({id,n,d,k,goal}));
/* trophies that depend on the training sets: if a wrong set is corrected or deleted, a trophy it alone earned is withdrawn */
const SETKEYS=['sessions','streak','prs','vol','weeksOk','early','late','variety','drop','bench','squat','dead'];
function badgeProg(b,c){const v=k=>['prs','weeksOk','vol'].includes(k)?c.X[k]:c[k];const cur=typeof v(b.k)==='boolean'?+v(b.k):(v(b.k)||0);return {cur,ok:cur>=b.goal}}
function evalBadges(silent){REV++;S.badges=S.badges||{};const c=CTX(),fresh=[];
 BADGES.forEach(b=>{if(!S.badges[b.id]&&badgeProg(b,c).ok){S.badges[b.id]={d:today(),u:Date.now()};fresh.push(b)}});if(fresh.length)save();return silent?[]:fresh}
function reconcileBadges(){REV++;/* the sets just changed: recompute before judging */const c=CTX(),gone=[];BADGES.forEach(b=>{if(S.badges?.[b.id]&&SETKEYS.includes(b.k)&&!badgeProg(b,c).ok){delete S.badges[b.id];tomb('badges',b.id);gone.push(b)}});return gone}
function badgeSvg(b,on,size=56){const col=on?(['t','pr','be','sq','de'].some(p=>b.id.startsWith(p))?'#E5383B':b.id.startsWith('w')||b.id.startsWith('pw')?'#3D9BFF':b.id.startsWith('s')||b.id==='first'?'#F2C230':'#2FB86E'):'#3A3F3D';
 const lab=b.id==='first'?'1':b.id.startsWith('t')?b.id.slice(1)+'t':b.id.startsWith('s')?b.id.slice(1):b.id.startsWith('w')?b.id.slice(1)+'S':b.id.startsWith('pr')?'PR':b.id.startsWith('pw')?b.id.slice(2)+'✓':({early:'6h',late:'21h',v20:'20',drop:'↘',prot7:'P',weigh10:'kg',meas1:'cm',bench1:'1×',squat15:'1,5',dead2:'2×'})[b.id]||'★';
 return `<svg width="${size}" height="${size}" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="${on?col:'#1E2124'}"/><circle cx="28" cy="28" r="19" fill="none" stroke="${on?'rgba(14,15,15,.35)':'#2A2E31'}" stroke-width="2"/><circle cx="28" cy="28" r="4.5" fill="${on?'rgba(14,15,15,.45)':'#2A2E31'}"/>
 <text x="28" y="${lab.length>2?22:21}" text-anchor="middle" font-family="Barlow Condensed, Impact, sans-serif" font-weight="800" font-style="italic" font-size="${lab.length>3?11:13}" fill="${on?'#0E0F0F':'#7C8380'}">${esc(lab)}</text></svg>`}
function nextBadge(){const c=CTX();const L=BADGES.filter(b=>!S.badges?.[b.id]&&b.goal>1&&!['bench','squat','dead'].includes(b.k)).map(b=>{const p=badgeProg(b,c);return {b,f:p.cur/b.goal,cur:p.cur}}).filter(x=>x.f<1).sort((a,b)=>b.f-a.f)[0];
 if(!L)return null;const left=Math.ceil(L.b.goal-L.cur),u={sessions:['séance','séances'],streak:['semaine d’affilée','semaines d’affilée'],prs:['record','records'],weeksOk:['semaine à l’objectif','semaines à l’objectif'],variety:['nouvel exercice','nouveaux exercices'],protDays:['jour à l’objectif de protéines','jours à l’objectif de protéines'],weigh:['pesée','pesées']}[L.b.k];
 return {b:L.b,txt:L.b.k==='vol'?`Encore ${fmt(Math.ceil(left/100)/10)} t à soulever`:u?`Plus que ${left} ${u[left>1?1:0]}`:L.b.d}}
/* Monday & Tuesday: how last week went */
function lastWeekCard(){const dow=(new Date().getDay()+6)%7;if(dow>1)return '';const mon=addDays(mondayOf(today()),-7),D=WEEKS()[mon]||[];if(!D.length)return '';
 const L=D.flatMap(s=>sWork(s.id)),n=D.length,goal=wkGoal(mon),prs=new Set(L.filter(isRec).map(l=>l.sid+l.e)).size,ok=n>=goal;
 const PV=vol((WEEKS()[addDays(mon,-7)]||[]).flatMap(s=>sWork(s.id))),dv=PV?Math.round((vol(L)/PV-1)*100):null;
 return `<section class="card col" style="gap:8px;border-color:${ok?'var(--p10)':'var(--bd)'}"><span class="lbl" style="color:${ok?'var(--p10)':'var(--mut)'}">Ta semaine dernière${ok?' · objectif atteint':''}</span>
 <div class="tiles"><div class="tile" style="background:var(--sf2)"><span class="xs mut">Séances</span><span class="num" style="font-size:24px">${n}/${goal}</span></div><div class="tile" style="background:var(--sf2)"><span class="xs mut">Volume</span><span class="num" style="font-size:24px">${volTxt(vol(L))}</span>${dv!=null?`<span class="xs ${dv>=0?'okc':'mut'}">${pctTxt(dv)}</span>`:''}</div><div class="tile" style="background:var(--sf2)"><span class="xs mut">Records</span><span class="num" style="font-size:24px">${prs}</span></div></div></section>`}
/* ---------- weekly challenges (always recomputed from the data) ---------- */
function challenges(){const mon=mondayOf(today()),D=WEEKS()[mon]||[],L=D.flatMap(s=>sWork(s.id)),a=active(),LA=a?sWork(a.id):[],LL=[...L,...LA];
 const pv=vol((WEEKS()[addDays(mon,-7)]||[]).flatMap(s=>sWork(s.id))),g=goals(),wdays=[...Array(7)].map((_,i)=>addDays(mon,i)).filter(d=>d<=today());
 const firstEver=new Set(LL.filter(l=>workOf(l.e)[0]?.id===l.id).map(l=>l.e));
 const legs=LL.filter(l=>['quadriceps','ischios','fessiers'].includes(exo(l.e).m[0])).length;
 const tv=pv?Math.max(1,Math.round(pv*1.05/100)/10):5;
 const pool=[
  {id:'pr',n:'Bats au moins 1 record',cur:new Set(LL.filter(isRec).map(l=>l.e)).size,goal:1},
  {id:'vol',n:`Soulève ${fmt(tv)} t cette semaine`,cur:Math.round(vol(LL)/100)/10,goal:tv,unit:' t'},
  {id:'legs',n:'12 séries de jambes',cur:legs,goal:12},
  {id:'prot',n:'Objectif protéines 4 jours',cur:wdays.filter(d=>nutDay(d).p>=g.p).length,goal:4},
  {id:'new',n:'Essaie un nouvel exercice',cur:firstEver.size,goal:1},
  {id:'water',n:'Objectif d’eau 5 jours',cur:wdays.filter(d=>waterN(d)*.25>=(S.prof.water||2.5)).length,goal:5}];
 const w=Math.floor(Date.parse(mon)/(7*864e5)),x=pool[w%pool.length],y=pool[(w*3+2)%pool.length]===x?pool[(w+1)%pool.length]:pool[(w*3+2)%pool.length];
 return [{id:'sess',n:`${wkGoal(mon)} séances cette semaine`,cur:D.length,goal:wkGoal(mon)},x,y]}
/* newly completed weekly challenge, announced once per week */
function chalCheck(){const wk=mondayOf(today());S.chal=S.chal&&S.chal.w===wk?S.chal:{w:wk,done:[]};const n=challenges().find(c=>c.cur>=c.goal&&!S.chal.done.includes(c.id));if(n){S.chal.done.push(n.id);save()}return n||null}
/* ---------- coaching line from the user's own numbers ---------- */
function motivation(){const a=active(),P=plan(),W=weekN(mondayOf(today())),D=doneSess();
 if(a){const left=P.reduce((s,p)=>s+Math.max(0,p.s-curWork(p.id).length),0);return sWork(a.id).length?(left?`Encore ${pl(left,'série')} prévue${left>1?'s':''}.`:'Tout est fait. Valide ta séance.'):'Séance démarrée. Première série quand tu es prêt.'}
 const up=P.map(p=>({p,t:target(p.id)})).find(x=>x.t?.up&&ltOf(x.p.id)==='load');
 if(up)return `Aujourd’hui tu montes : ${exo(up.p.id).n} à ${fmt(up.t.kg)} kg.`;
 if(W===wkGoal(mondayOf(today()))-1)return 'Une séance de plus et ta semaine est validée.';
 const st=streak();if(st>=2)return `${st} semaines d’affilée. Garde la série.`;
 const last=D.at(-1),gap=last?Math.round((Date.parse(today())-Date.parse(key(last.start)))/864e5):null;
 if(gap>=4)return `${gap} jours sans séance. Une séance courte vaut mieux que rien.`;
 return 'Chaque kilo compte.'}
/* ---------- heatmap: last 18 weeks, one cell per day (a day with a session counts even with no load) ---------- */
function heatmap(){const end=mondayOf(today()),start=addDays(end,-7*17),V={};doneSess().forEach(s=>{const k=key(s.start);if(k>=start)V[k]=(V[k]||0)+Math.max(1,vol(sWork(s.id)))});
 const vals=Object.values(V).sort((a,b)=>a-b),q=f=>vals[Math.floor((vals.length-1)*f)]||0,cut=[q(.25),q(.5),q(.75)];
 const cols=[];for(let w=0;w<18;w++){const m=addDays(start,7*w);cols.push([...Array(7)].map((_,i)=>{const d=addDays(m,i),v=V[d]||0,lv=!v?0:v<=cut[0]?1:v<=cut[1]?2:v<=cut[2]?3:4;return {d,v,lv,fut:d>today()}}))}
 const C=['#1E2124','#1D3A5E','#22578F','#2B78C6','#3D9BFF'],cell=13,gap=3,W=18*(cell+gap),H=7*(cell+gap);
 return `<svg viewBox="0 0 ${W+18} ${H+16}" width="100%" role="img" aria-label="Jours d’entraînement sur 18 semaines : ${Object.keys(V).length} jours">
 ${['L','','M','','V','','D'].map((l,i)=>l?`<text x="0" y="${i*(cell+gap)+cell-2}" fill="#8B9298" font-size="9" font-family="DM Sans, sans-serif">${l}</text>`:'').join('')}
 ${cols.map((c,w)=>c.map((x,i)=>x.fut?'':`<rect x="${18+w*(cell+gap)}" y="${i*(cell+gap)}" width="${cell}" height="${cell}" rx="3" fill="${C[x.lv]}"${x.d===today()?' stroke="#F4F3EF" stroke-width="1.5"':''}><title>${dShort(x.d)}${x.v?' · séance':''}</title></rect>`).join('')).join('')}
 ${cols.map((c,w)=>{const d=c[0].d;return +d.slice(8)<=7?`<text x="${18+w*(cell+gap)}" y="${H+12}" fill="#8B9298" font-size="9" font-family="DM Sans, sans-serif">${MONTHS[+d.slice(5,7)-1].slice(0,4)}</text>`:''}).join('')}</svg>`}
/* ---------- shareable session card (PNG 1080×1350) ---------- */
async function sessionPNG(sid){const s=sessById(sid),TL=sWork(sid),prs=[...new Set(TL.filter(isRec).map(l=>l.e))],X=XP(),T=tierOf(X.lvl),v=vol(TL);
 try{await Promise.all(['italic 800 120px "Barlow Condensed"','600 30px "DM Sans"','400 30px "DM Sans"'].map(f=>document.fonts.load(f)))}catch(e){}
 const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),FD='"Barlow Condensed", Impact, sans-serif',FB='"DM Sans", system-ui, sans-serif';
 x.fillStyle='#0B0C0D';x.fillRect(0,0,W,H);
 x.fillStyle='#16181A';x.beginPath();x.arc(930,170,300,0,7);x.fill();x.strokeStyle=T[3];x.lineWidth=26;x.globalAlpha=.6;x.beginPath();x.arc(930,170,286,0,7);x.stroke();x.globalAlpha=1;x.fillStyle='#0B0C0D';x.beginPath();x.arc(930,170,52,0,7);x.fill();
 x.fillStyle='#3D9BFF';x.font='italic 800 40px '+FD;x.fillText('CHARGE',72,110);
 x.fillStyle='#A3A9AE';x.font='400 32px '+FB;x.fillText(cap(dLong(key(s.start))),72,170);
 x.fillStyle='#F4F3EF';x.font='italic 800 150px '+FD;x.fillText('SÉANCE',64,360);x.fillText('VALIDÉE',64,500);
 x.fillStyle='#A3A9AE';x.font='600 34px '+FB;x.fillText(sessName(s).toUpperCase(),72,566);
 x.fillStyle='#3D9BFF';x.font='italic 800 170px '+FD;x.fillText(volTxt(v),64,760);
 x.fillStyle='#A3A9AE';x.font='400 32px '+FB;x.fillText('soulevés'+(equiv(v)?' · '+equiv(v):''),72,812);
 [['Séries',String(TL.length)],['Durée',sessMins(s)+' min'],['Records',String(prs.length)]].forEach(([l,val],i)=>{const X0=72+i*318;x.fillStyle='#16181A';x.beginPath();x.roundRect(X0,860,294,170,28);x.fill();x.fillStyle='#A3A9AE';x.font='400 28px '+FB;x.fillText(l,X0+28,910);x.fillStyle='#F4F3EF';x.font='italic 800 76px '+FD;x.fillText(val,X0+28,995)});
 let y=1100;prs.slice(0,3).forEach(id=>{const b=bestSet(id);x.fillStyle='#E5383B';x.beginPath();x.arc(96,y-12,14,0,7);x.fill();x.fillStyle='#F4F3EF';x.font='600 34px '+FB;x.fillText(exo(id).n.slice(0,28),126,y);x.textAlign='right';x.fillStyle='#2FB86E';x.font='italic 800 44px '+FD;x.fillText(b?setTxt(b):'',1008,y);x.textAlign='left';y+=64});
 x.fillStyle=T[3];x.font='italic 800 36px '+FD;x.fillText((T[1]+' · niveau '+X.lvl+' · '+streak()+' sem. d’affilée').toUpperCase(),72,H-60);
 return new Promise(ok=>c.toBlob(ok,'image/png'))}
/* ---------- level ring (a plate seen from the front) ---------- */
function levelRing(X,size=56){const t=tierOf(X.lvl),r=23,c=2*Math.PI*r;
 return `<svg width="${size}" height="${size}" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="${r}" fill="#16181A" stroke="#2A2E31" stroke-width="5"/>
 <circle cx="28" cy="28" r="${r}" fill="none" stroke="${t[3]}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c*Math.max(.02,X.frac)} ${c}" transform="rotate(-90 28 28)"/>
 <text x="28" y="34" text-anchor="middle" font-family="Barlow Condensed, Impact, sans-serif" font-weight="800" font-style="italic" font-size="20" fill="#F4F3EF">${X.lvl}</text></svg>`}
/* ---------- one short burst of plates; never restarted while it runs ---------- */
let confettiOn=false;
function confetti(){if(confettiOn||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=document.getElementById('confetti');if(!c)return;confettiOn=true;const x=c.getContext('2d'),W=c.width=c.offsetWidth*2,H=c.height=c.offsetHeight*2;
 const cols=['#E5383B','#3D9BFF','#F2C230','#2FB86E','#E9E8E3'],P=[...Array(70)].map(()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*26,vy:-Math.random()*30-8,r:6+Math.random()*10,c:cols[Math.floor(Math.random()*5)],a:Math.random()*6}));
 const t0=performance.now();const f=now=>{const el=document.getElementById('confetti');if(!el){confettiOn=false;return}x.clearRect(0,0,W,H);P.forEach(p=>{p.vy+=1.1;p.x+=p.vx;p.y+=p.vy;p.a+=.1;x.save();x.translate(p.x,p.y);x.scale(1,Math.abs(Math.cos(p.a)));x.fillStyle=p.c;x.beginPath();x.arc(0,0,p.r,0,7);x.fill();x.fillStyle='rgba(14,15,15,.35)';x.beginPath();x.arc(0,0,p.r*.3,0,7);x.fill();x.restore()});
  if(now-t0<2600)requestAnimationFrame(f);else{x.clearRect(0,0,W,H);confettiOn=false}};requestAnimationFrame(f)}
</script>
