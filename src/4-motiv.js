<script>
/* ================= motivation: levels, trophies, weekly challenges, records ================= */
const TIERS=[[1,'Recrue','Plaque de 5 kg'],[5,'Régulier','Plaque de 10 kg'],[10,'Solide','Plaque de 15 kg'],[15,'Costaud','Plaque de 20 kg'],[20,'Monstre','Plaque de 25 kg']];
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
/* what moved on an exercise since its first session, said exactly */
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
 BADGES.forEach(b=>{if(!S.badges[b.id]&&badgeProg(b,c).ok){S.badges[b.id]=stamp({d:today()},'badges',b.id);fresh.push(b)}});if(fresh.length)save();return silent?[]:fresh}
function reconcileBadges(){REV++;/* the sets just changed: recompute before judging */const c=CTX(),gone=[];BADGES.forEach(b=>{const x=S.badges?.[b.id];if(x&&SETKEYS.includes(b.k)&&!badgeProg(b,c).ok){delete S.badges[b.id];tomb('badges',b.id,x.ver);gone.push(b)}});return gone}
/* a trophy is a round medal; its kind gives it a colour of the palette, its family decides the mark printed in the middle */
const BADGEC={sessions:'ac',streak:'push',prs:'gold',vol:'core',weeksOk:'legs',early:'pull',late:'core',variety:'glute',drop:'push',protDays:'prot',weigh:'water',meas:'fat',bench:'gold',squat:'gold',dead:'gold'};
function badgeSvg(b,on,size=56){
 const fixed={first:'1',early:'6h',late:'21h',v20:'20',drop:'↘',prot7:'P',weigh10:'kg',meas1:'cm',bench1:'1×',squat15:'1,5',dead2:'2×'}[b.id];
 const lab=fixed||(/^t\d/.test(b.id)?b.id.slice(1)+'t':/^s\d/.test(b.id)?b.id.slice(1):/^w\d/.test(b.id)?b.id.slice(1)+'s':b.id.startsWith('pw')?b.id.slice(2)+'✓':b.id.startsWith('pr')?'PR':'★');
 const k=BADGEC[b.k]||'ac',c=`var(--${k})`,gold=k==='gold';
 /* tint behind, solid ring, text mixed towards the ink so it stays readable (≥ 4,5:1) in both themes */
 const bg=`color-mix(in srgb,${c} ${gold?30:16}%,var(--card))`,tx=`color-mix(in srgb,${c} ${gold?42:70}%,var(--ink))`;
 const fs=lab.length>4?10.5:lab.length>3?12:lab.length>2?15:17,ty=lab.length>3?32:lab.length>2?33.5:34;
 return on?`<svg class="bsvg" width="${size}" height="${size}" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="25.5" style="fill:${bg};stroke:${c};stroke-width:3"/><circle cx="28" cy="28" r="19.5" style="fill:none;stroke:${c};stroke-width:1.2;stroke-dasharray:2 2.6;opacity:.55"/>
 <text x="28" y="${ty}" text-anchor="middle" style="font:800 ${fs}px var(--fw);font-stretch:80%;fill:${tx}">${esc(lab)}</text></svg>`
 :`<svg class="bsvg" width="${size}" height="${size}" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="25" style="fill:var(--soft);stroke:color-mix(in srgb,${c} 45%,var(--line2));stroke-width:2;stroke-dasharray:4 3"/>
 <text x="28" y="${ty}" text-anchor="middle" style="font:800 ${fs}px var(--fw);font-stretch:80%;fill:color-mix(in srgb,${c} ${gold?25:35}%,var(--ink3))">${esc(lab)}</text></svg>`}
function nextBadge(){const c=CTX();const L=BADGES.filter(b=>!S.badges?.[b.id]&&b.goal>1&&!['bench','squat','dead'].includes(b.k)).map(b=>{const p=badgeProg(b,c);return {b,f:p.cur/b.goal,cur:p.cur}}).filter(x=>x.f<1).sort((a,b)=>b.f-a.f)[0];
 if(!L)return null;const left=Math.ceil(L.b.goal-L.cur),u={sessions:['séance','séances'],streak:['semaine d’affilée','semaines d’affilée'],prs:['record','records'],weeksOk:['semaine à l’objectif','semaines à l’objectif'],variety:['nouvel exercice','nouveaux exercices'],protDays:['jour à l’objectif de protéines','jours à l’objectif de protéines'],weigh:['pesée','pesées']}[L.b.k];
 return {b:L.b,txt:L.b.k==='vol'?`Encore ${fmt(Math.ceil(left/100)/10)} t à soulever`:u?`Plus que ${left} ${u[left>1?1:0]}`:L.b.d}}
/* Monday & Tuesday: how last week went */
function lastWeekCard(){const dow=(new Date().getDay()+6)%7;if(dow>1)return '';const mon=addDays(mondayOf(today()),-7),D=WEEKS()[mon]||[];if(!D.length)return '';
 const L=D.flatMap(s=>sWork(s.id)),n=D.length,goal=wkGoal(mon),prs=new Set(L.filter(isRec).map(l=>l.sid+l.e)).size,ok=n>=goal;
 return `<section class="card col" style="gap:8px"><h2 class="lbl">Ta semaine dernière${ok?' <span class="tag ok">objectif atteint</span>':''}</h2>
 <p class="sm mut" style="margin:0">${pl(n,'séance')} sur ${goal} prévues, ${pl(L.length,'série')}, ${pl(prs,'record')}.</p></section>`}
/* ---------- weekly challenges (always recomputed from the data; about showing up, not tonnage) ---------- */
const complete=s=>s.plan.length>0&&s.plan.every(p=>sWork(s.id).filter(l=>l.e===p.id).length>=p.s);
function challenges(){const mon=mondayOf(today()),D=WEEKS()[mon]||[],L=D.flatMap(s=>sWork(s.id)),a=active(),LA=a?sWork(a.id):[],LL=[...L,...LA];
 const g=goals(),wdays=[...Array(7)].map((_,i)=>addDays(mon,i)).filter(d=>d<=today());
 const firstEver=new Set(LL.filter(l=>workOf(l.e)[0]?.id===l.id).map(l=>l.e));
 const legs=LL.filter(l=>['quadriceps','ischios','fessiers'].includes(exo(l.e).m[0])).length;
 const pool=[
  {id:'pr',n:'Bats au moins 1 record',cur:new Set(LL.filter(isRec).map(l=>l.e)).size,goal:1},
  {id:'full',n:'Fais toutes les séries prévues de 2 séances',cur:D.filter(complete).length,goal:2},
  {id:'legs',n:'12 séries de jambes',cur:legs,goal:12},
  {id:'prot',n:'Objectif protéines 4 jours',cur:wdays.filter(d=>nutDay(d).p>=g.p).length,goal:4},
  {id:'new',n:'Essaie un nouvel exercice',cur:firstEver.size,goal:1},
  {id:'water',n:'Objectif d’eau 5 jours',cur:wdays.filter(d=>waterN(d)*.25>=(S.prof.water||2.5)).length,goal:5}];
 const w=Math.floor(Date.parse(mon)/(7*864e5)),x=pool[w%pool.length],y=pool[(w*3+2)%pool.length]===x?pool[(w+1)%pool.length]:pool[(w*3+2)%pool.length];
 return [{id:'sess',n:`${wkGoal(mon)} séances cette semaine`,cur:D.length,goal:wkGoal(mon)},x,y]}
/* newly completed weekly challenge, announced once per week */
function chalCheck(){const wk=mondayOf(today());S.chal=S.chal&&S.chal.w===wk?S.chal:{w:wk,done:[]};const n=challenges().find(c=>c.cur>=c.goal&&!S.chal.done.includes(c.id));if(n){S.chal.done.push(n.id);save()}return n||null}
/* ---------- heatmap: last 18 weeks, one cell per day with a session ---------- */
/* each training day takes the colour of the muscle family it worked the most */
function heatmap(){const end=mondayOf(today()),start=addDays(end,-7*17),V={},F={};doneSess().forEach(s=>{const k=key(s.start);if(k>=start){V[k]=(V[k]||0)+1;F[k]=F[k]||{};sWork(s.id).forEach(l=>{const g=grp(l.e);F[k][g]=(F[k][g]||0)+1})}});
 const top=d=>{const o=F[d]||{};let b=null;for(const g in o)if(!b||o[g]>o[b])b=g;return b||'legs'};
 const cols=[];for(let w=0;w<18;w++){const m=addDays(start,7*w);cols.push([...Array(7)].map((_,i)=>{const d=addDays(m,i);return {d,v:V[d]||0,fut:d>today()}}))}
 const cell=13,gap=3,W=18*(cell+gap),H=7*(cell+gap),used=[...new Set(Object.keys(V).map(top))],LG=Object.keys(GRPN).filter(g=>used.includes(g));
 return `<svg class="hmap" viewBox="0 0 ${W+18} ${H+(LG.length?34:16)}" width="100%" role="img" aria-label="Jours d’entraînement sur 18 semaines : ${Object.keys(V).length} jours">
 ${['L','','M','','V','','D'].map((l,i)=>l?`<text x="0" y="${i*(cell+gap)+cell-2}" style="fill:var(--ink3);font:600 9px var(--fw)">${l}</text>`:'').join('')}
 ${cols.map((c,w)=>c.map((x,i)=>{if(x.fut)return '';const t=x.d===today(),g=x.v?top(x.d):null;
  return `<rect x="${18+w*(cell+gap)+(t?1:0)}" y="${i*(cell+gap)+(t?1:0)}" width="${cell-(t?2:0)}" height="${cell-(t?2:0)}" rx="3" style="fill:${g?`var(--${g})`:'var(--soft)'};stroke:${t?'var(--ink)':g?'none':'var(--line)'};stroke-width:${t?2:1}"><title>${dShort(x.d)}${x.v?', séance '+GRPN[g].toLowerCase():''}${t?' (aujourd’hui)':''}</title></rect>`}).join('')).join('')}
 ${cols.map((c,w)=>{const d=c[0].d;return +d.slice(8)<=7?`<text x="${18+w*(cell+gap)}" y="${H+12}" style="fill:var(--ink3);font:600 9px var(--fw)">${MONTHS[+d.slice(5,7)-1].slice(0,4)}</text>`:''}).join('')}
 ${(()=>{let lx=0;return LG.map(g=>{const x0=lx;lx+=13+GRPN[g].length*5.4+9;return `<rect x="${f1(x0)}" y="${H+22}" width="9" height="9" rx="2.5" style="fill:var(--${g})"/><text x="${f1(x0+13)}" y="${H+30}" style="fill:var(--ink2);font:600 9.5px var(--fw)">${GRPN[g]}</text>`}).join('')})()}</svg>`}
/* ---------- shareable session card (PNG 1080×1350, light palette of 1-head.html: a canvas cannot read CSS variables) ---------- */
const PNGC={bg:'#F4F5F7',card:'#FFFFFF',ink:'#111827',ink2:'#4B5563',line:'#E5E7EB',ac:'#2F5BEA',vi:'#6D3FE0',gold:'#F5B700',
 fam:{push:['#EA580C','#FFF1E7'],pull:['#2563EB','#EAF1FE'],legs:['#059669','#E6F7F1'],glute:['#DB2777','#FDECF4'],core:['#7C3AED','#F2ECFE']}};
async function sessionPNG(sid){const s=sessById(sid),TL=sWork(sid),prs=[...new Set(TL.filter(isRec).map(l=>l.e))],X=XP(),T=tierOf(X.lvl),C=PNGC;
 try{await Promise.all(['900 120px Archivo','600 30px Archivo','400 30px Archivo'].map(f=>document.fonts.load(f)))}catch(e){}
 const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),F='Archivo, system-ui, sans-serif';
 const rr=(X0,Y0,w,h,r)=>{x.beginPath();x.roundRect(X0,Y0,w,h,r)};
 const fit=(t,max)=>{if(x.measureText(t).width<=max)return t;while(t.length>1&&x.measureText(t+'…').width>max)t=t.slice(0,-1);return t.trimEnd()+'…'};
 x.fillStyle=C.bg;x.fillRect(0,0,W,H);
 /* hero: blue → violet, like the app gradient */
 const gr=x.createLinearGradient(48,48,1032,600);gr.addColorStop(0,C.ac);gr.addColorStop(1,C.vi);x.fillStyle=gr;rr(48,48,984,552,48);x.fill();
 x.save();rr(48,48,984,552,48);x.clip();x.fillStyle='rgba(255,255,255,.08)';x.beginPath();x.arc(940,120,230,0,7);x.fill();x.beginPath();x.arc(1010,540,140,0,7);x.fill();x.restore();
 x.fillStyle='#FFFFFF';x.font='800 40px '+F;x.fillText('Charge',104,132);
 x.fillStyle='rgba(255,255,255,.86)';x.font='500 34px '+F;x.fillText(cap(dLong(key(s.start))),104,190);
 x.fillStyle=C.gold;rr(104,214,96,10,5);x.fill();
 x.fillStyle='#FFFFFF';x.font='900 130px '+F;x.fillText('Séance',96,366);x.fillText('validée',96,492);
 x.fillStyle='rgba(255,255,255,.9)';x.font='600 38px '+F;x.fillText(fit(sessName(s),860),104,558);
 /* three tiles, each in its own colour */
 [['Séries',String(TL.length),C.fam.pull],['Durée',sessMins(s)+' min',C.fam.legs],['Records',String(prs.length),['#A15C07','#FFF5E5']]].forEach(([l,val,[cs,cb]],i)=>{const X0=48+i*334;
  x.fillStyle=cb;rr(X0,636,316,176,32);x.fill();x.fillStyle=cs;rr(X0,636,12,176,[32,0,0,32]);x.fill();
  x.fillStyle=cs;x.font='700 30px '+F;x.fillText(l,X0+44,688);x.fillStyle=C.ink;let fz=80;do{x.font='800 '+fz+'px '+F;fz-=4}while(fz>40&&x.measureText(val).width>250);x.fillText(val,X0+44,782)});
 /* sets per muscle family */
 const by={};TL.forEach(l=>{const g=grp(l.e);by[g]=(by[g]||0)+1});const G=Object.keys(C.fam).filter(g=>by[g]);
 let y=874;if(G.length){x.fillStyle=C.ink2;x.font='700 28px '+F;x.fillText('Muscles travaillés',56,y);
  let X0=56;const BW=968;x.save();rr(56,y+24,BW,30,15);x.clip();G.forEach(g=>{const w=BW*by[g]/TL.length;x.fillStyle=C.fam[g][0];x.fillRect(X0,y+24,w+1,30);X0+=w});x.restore();
  let fz=28,gp=34;const lw=()=>G.reduce((a,g)=>a+32+x.measureText(GRPN[g]+' '+by[g]).width,0)+gp*(G.length-1);x.font='600 28px '+F;while(lw()>968&&fz>20){fz-=2;gp=Math.max(18,gp-4);x.font='600 '+fz+'px '+F}
  X0=56;G.forEach(g=>{const t=GRPN[g]+' '+by[g];x.fillStyle=C.fam[g][0];rr(X0,y+80,22,22,6);x.fill();x.fillStyle=C.ink;x.fillText(t,X0+32,y+100);X0+=32+x.measureText(t).width+gp});y+=176}
 prs.slice(0,G.length?3:5).forEach(id=>{const b=TL.filter(l=>l.e===id&&isRec(l)).at(-1);
  x.fillStyle=C.gold;rr(56,y-36,150,48,24);x.fill();x.fillStyle=C.ink;x.font='800 26px '+F;x.textAlign='center';x.fillText('RECORD',131,y-3);
  x.textAlign='right';x.font='800 38px '+F;const v=b?setTxt(b):'';x.fillText(v,1024,y);const vw=x.measureText(v).width;
  x.textAlign='left';x.font='600 36px '+F;x.fillText(fit(exo(id).n,1024-vw-40-232),232,y);y+=66});
 x.fillStyle=C.line;x.fillRect(56,H-128,968,2);
 x.fillStyle=C.gold;x.beginPath();x.arc(72,H-72,14,0,7);x.fill();
 x.fillStyle=C.ink;x.font='700 32px '+F;x.fillText(fit(T[1]+', niveau '+X.lvl+' — '+pl(streak(),'semaine')+' d’affilée',920),100,H-61);
 return new Promise(ok=>c.toBlob(ok,'image/png'))}
/* ---------- level mark: a plate seen from the front, filled (blue → violet) by the progress to the next level ---------- */
let LVLN=0;
function levelRing(X,size=56){const r=22,c=2*Math.PI*r,id='lvg'+(++LVLN);
 return `<svg class="lvl" width="${size}" height="${size}" viewBox="0 0 56 56" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--ac)"/><stop offset="1" style="stop-color:var(--core)"/></linearGradient></defs>
 <circle cx="28" cy="28" r="${r}" style="fill:var(--card);stroke:var(--acbg);stroke-width:6"/>
 <circle cx="28" cy="28" r="${r}" style="fill:none;stroke:url(#${id});stroke-width:6;stroke-linecap:round" stroke-dasharray="${c*Math.max(.02,X.frac)} ${c}" transform="rotate(-90 28 28)"/>
 <circle cx="28" cy="28" r="15.5" style="fill:var(--acbg)"/>
 <text x="28" y="34" text-anchor="middle" style="font:800 ${String(X.lvl).length>2?15:19}px var(--fw);font-stretch:80%;fill:color-mix(in srgb,var(--ac) 70%,var(--ink))">${X.lvl}</text></svg>`}
/* ---------- one short burst of paper squares; never restarted while it runs ---------- */
let confettiOn=false;
function confetti(){if(confettiOn||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=document.getElementById('confetti');if(!c)return;confettiOn=true;const x=c.getContext('2d'),W=c.width=c.offsetWidth*2,H=c.height=c.offsetHeight*2;
 const cols=['#2F5BEA','#6D3FE0','#EA580C','#059669','#DB2777','#F5B700'],P=[...Array(70)].map(()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*26,vy:-Math.random()*30-8,r:6+Math.random()*10,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*6}));
 const t0=performance.now();const f=now=>{const el=document.getElementById('confetti');if(!el){confettiOn=false;return}x.clearRect(0,0,W,H);P.forEach(p=>{p.vy+=1.1;p.x+=p.vx;p.y+=p.vy;p.a+=.1;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r/2,p.r,p.r*.6);x.restore()});
  if(now-t0<2600)requestAnimationFrame(f);else{x.clearRect(0,0,W,H);confettiOn=false}};requestAnimationFrame(f)}
</script>
