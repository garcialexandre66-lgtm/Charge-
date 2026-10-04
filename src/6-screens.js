<script>
/* ================= charts ================= */
function lineChart(pts,label,fmtX,unit=''){if(!pts.length)return '';const vs=pts.map(p=>p[1]),mn=Math.min(...vs),mx=Math.max(...vs),pad=Math.max(1,(mx-mn)*.15),lo=Math.floor(mn-pad),hi=Math.ceil(mx+pad);
 const W=326,H=150,x=i=>pts.length===1?(W+34)/2:44+i*(W-58)/(pts.length-1),y=v=>130-(v-lo)/(hi-lo)*110;
 const P=pts.map((p,i)=>x(i)+','+y(p[1])).join(' ');
 return `<figure class="card" style="margin:0;padding:16px 12px 10px"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(label)} : de ${fmt(vs[0])} à ${fmt(vs.at(-1))}${unit}">
  ${[hi,(hi+lo)/2,lo].map(v=>`<line x1="38" y1="${y(v)}" x2="${W}" y2="${y(v)}" stroke="#2A2D2D" stroke-dasharray="3 5"/><text x="0" y="${y(v)+4}" fill="#A3A9AE" font-size="11" font-family="DM Sans, sans-serif">${fmt(v)}</text>`).join('')}
  ${pts.length>1?`<polygon points="${x(0)},130 ${P} ${x(pts.length-1)},130" fill="#3D9BFF" fill-opacity=".12"/><polyline points="${P}" fill="none" stroke="#3D9BFF" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`:''}
  ${pts.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p[1])}" r="${i===pts.length-1?6:3.5}" fill="${i===pts.length-1?'#3D9BFF':'#0E0F0F'}" stroke="#3D9BFF" stroke-width="2"/>`).join('')}</svg>
  <figcaption class="row sb xs mut" style="padding-left:38px"><span>${fmtX(pts[0][0])}</span><span>${pts.length>1?fmtX(pts.at(-1)[0]):''}</span></figcaption></figure>`}

/* ================= Progrès ================= */
function monthStats(ym){const D=doneSess().filter(s=>key(s.start).startsWith(ym)),L=D.flatMap(s=>sWork(s.id));return {D,L,vol:vol(L),recs:new Set(L.filter(isRec).map(l=>l.sid+l.e)).size}}
function monthWeeks(Y,M){const first=new Date(Y,M-1,1),mon=new Date(first);mon.setDate(1-((first.getDay()+6)%7));const out=[];
 for(let d=new Date(mon);d<new Date(Y,M,1);d.setDate(d.getDate()+7)){const k=key(d);out.push({lab:dShort(k),n:weekN(k),goal:wkGoal(k),fut:k>today()})}return out}
function monthLifts(ym,st){return [...new Set(st.L.map(l=>l.e))].filter(id=>ltOf(id)==='load'&&uOf(id)==='reps').map(id=>{const before=workOf(id).filter(l=>key(l.t)<ym+'-01'&&ormOk(l)),inM=st.L.filter(l=>l.e===id&&ormOk(l));if(!inM.length)return null;
 const b0=before.length?Math.max(...before.map(l=>orm(l.kg,l.r))):Math.max(...inM.filter(l=>l.sid===inM[0].sid).map(l=>orm(l.kg,l.r)));
 const b1=Math.max(b0,...inM.map(l=>orm(l.kg,l.r)));return {id,b1,d:b1-b0}}).filter(Boolean).sort((a,b)=>b.d-a.d).slice(0,5)}
function Prog(){if(view.page==='ex')return Machine(view.ex);if(view.page==='day')return DayView(view.day);if(view.page==='sess')return SessView(view.sid);if(view.page==='lib')return Library();if(view.page==='records')return Records();
 const now=new Date(),ym=view.ym||today().slice(0,7),[Y,M]=ym.split('-').map(Number);
 const prevYm=key(new Date(Y,M-2,1)).slice(0,7),nextYm=key(new Date(Y,M,1)).slice(0,7),isCur=ym===today().slice(0,7);
 const st=monthStats(ym),pv=monthStats(prevYm),dom=+today().slice(8);
 const pvVol=isCur?vol(pv.L.filter(l=>+key(l.t).slice(8)<=dom)):pv.vol,dv=pvVol?Math.round((st.vol/pvVol-1)*100):null;
 const weeks=monthWeeks(Y,M),goal=S.prof.sess,mxw=Math.max(goal,...weeks.map(w=>w.n),1),target=Math.round(goal*new Date(Y,M,0).getDate()/7);
 const lifts=monthLifts(ym,st);
 const wkv={};IDX().L.filter(l=>!l.w&&Date.now()-l.t<7*864e5).forEach(l=>exo(l.e).m.forEach((m,i)=>wkv[m]=(wkv[m]||0)+(i?.5:1)));
 const vmax=25,volRows=Object.keys(MUS).map(m=>{const v=wkv[m]||0,cl=v>20?'hi':v>=10?'ok':'';
  return `<div class="vol"><span>${m}</span><div class="vtrack" role="img" aria-label="${m} : ${fmt(v)} séries sur 7 jours"><span class="zone" style="left:${10/vmax*100}%;width:${10/vmax*100}%"></span><i class="${cl}" style="width:${Math.min(100,v/vmax*100)}%"></i></div><span class="num" style="font-size:18px;text-align:right">${fmt(v)}</span></div>`}).join('');
 const a=active(),SS=[...(a?[a]:[]),...doneSess().slice().reverse()],hist=SS.slice(0,view.more?80:8).map(sessRow).join('');
 const used=S.ex.filter(e=>workOf(e.id).length).sort((x,y)=>workOf(y.id).at(-1).t-workOf(x.id).at(-1).t);
 const X=XP(),eq=equiv(X.vol),A=avgGain();
 return `<h1>Progrès</h1>
 <section class="hero" style="gap:6px"><span class="eyebrow">Total soulevé depuis le début</span><span class="num" style="font-size:58px;position:relative">${volTxt(X.vol)}</span><span class="sm mut" style="position:relative">${eq?eq+' · ':''}${pl(X.sessions,'séance')} · ${pl(X.prs,'record')}</span>
 ${A?`<div class="row" style="gap:12px;margin-top:8px;padding-top:12px;border-top:1px solid #2A2E31;position:relative"><span class="num" style="font-size:40px;color:var(--p10)">${pctTxt(A.pct)}</span><div class="col" style="gap:2px"><b>de 1RM estimé en moyenne</b><span class="xs mut">Écart entre ta 1re séance et ton meilleur 1RM estimé (Epley), sur ${pl(A.n,'exercice')} avec charge. La plus forte hausse : ${esc(A.top.e.n)} ${pctTxt(A.top.g.pct)}.</span></div></div>`:''}</section>
 <section class="col"><h2 class="lbl">Séances</h2>${hist||'<div class="empty">Tes séances apparaîtront ici après ta première série.</div>'}${!view.more&&SS.length>8?'<button class="btn2" data-a="more">Voir tout l’historique</button>':''}</section>
 <section class="card col"><div class="row sb"><span class="lbl">Assiduité · 18 semaines</span><span class="sm" style="color:var(--p15)">${streak()} sem. d’affilée</span></div>${heatmap()}
 <div class="row xs mut" style="gap:6px;justify-content:flex-end" aria-hidden="true">moins ${['#1E2124','#1D3A5E','#22578F','#2B78C6','#3D9BFF'].map(c=>`<i style="width:10px;height:10px;border-radius:2px;background:${c};display:inline-block"></i>`).join('')} plus</div></section>
 <button class="card row" style="width:100%;text-align:left;gap:14px" data-a="page" data-v="records"><svg width="48" height="48" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="#E5383B"/><circle cx="28" cy="28" r="19" fill="none" stroke="rgba(14,15,15,.35)" stroke-width="2"/><text x="28" y="34" text-anchor="middle" font-family="Barlow Condensed, Impact, sans-serif" font-weight="800" font-style="italic" font-size="18" fill="#0B0C0D">PR</text></svg><div class="grow"><div class="b">Mur des records</div><div class="sm mut">Records historiques et meilleures perfs récentes</div></div>${ic('chev',18)}</button>
 <section class="col"><div class="row sb"><button class="x s" data-a="ym" data-v="${prevYm}" aria-label="Mois précédent">${ic('left',16)}</button><h2 class="lbl" style="color:var(--fg)">Bilan de ${MONTHS[M-1]} ${Y!==now.getFullYear()?Y:''}</h2><button class="x s" data-a="ym" data-v="${nextYm}" aria-label="Mois suivant" ${isCur?'disabled':''}>${ic('chev',16)}</button></div>
 <div class="tiles"><div class="tile"><span class="sm mut">Séances</span><span class="num">${st.D.length}<span class="mut" style="font-size:16px"> / ${target}</span></span></div>
 <div class="tile"><span class="sm mut">Volume</span><span class="num">${fmt(st.vol/1000)} t</span>${dv!=null?`<span class="xs ${dv>=0?'okc':'warnc'} b">${dv>0?'+':''}${dv} %</span><span class="xs mut">vs ${isCur?'même période':MONTHS[(M+10)%12]}</span>`:''}</div>
 <div class="tile"><span class="sm mut">Records</span><span class="num">${st.recs}</span></div></div>
 <div class="card col"><div class="row sb"><span class="sm mut">Séances par semaine</span><span class="xs mut">objectif ${goal}</span></div>
 <div class="wbars" style="grid-template-columns:repeat(${weeks.length},1fr)" role="img" aria-label="Séances par semaine : ${weeks.map(w=>w.n).join(', ')}"><div class="goal" style="bottom:${22+goal/mxw*88}px"></div>
 ${weeks.map(w=>`<div class="wb"><span class="num" style="font-size:16px;${w.fut?'opacity:.3':''}">${w.fut?'':w.n}</span><i class="${w.n>=w.goal?'ok':''}" style="height:${w.n/mxw*88}px"></i><span class="xs mut" style="white-space:nowrap">${w.lab}</span></div>`).join('')}</div></div>
 ${lifts.length?`<div class="card col g4"><span class="sm mut">1RM estimé (indicatif) · évolution du mois</span>${lifts.map(l=>`<div class="kv"><span>${esc(exo(l.id).n)}</span><span><b>${fmt(Math.round(l.b1))} kg</b> <span class="${l.d>0?'okc':'mut'} b">${l.d>0?'+'+fmt(Math.round(l.d)):'±0'}</span></span></div>`).join('')}</div>`:''}
 ${sample&&st.L.length?`<div class="card col"><div class="row sb"><span class="lbl">Avis du coach</span>${view.coach?.busy?'<span class="spin" role="status" aria-label="Analyse en cours"></span>':''}</div>
  ${view.coach?.text?`<div class="coach">${esc(view.coach.text)}</div>`:`<span class="sm mut">Claude lit ton mois (séances, charges, ressentis, poids) et te donne 3 à 5 conseils concrets.</span>`}
  ${view.coach?.err?`<span class="sm warnc">${esc(view.coach.err)}</span>`:''}
  ${view.coach?.busy?'<button class="btn2" data-a="coachstop">Arrêter</button>':`<button class="btn2 acb" data-a="coach">${ic('spark',16)} ${view.coach?.text?'Relancer l’analyse':'Analyser mon mois'}</button>`}</div>`:''}
 ${st.L.length&&(dl||!window.claude)?`<button class="btn2" data-a="png" data-v="${ym}">${ic('camera',16)} Exporter le bilan en image</button>`:''}</section>
 <section class="col"><div class="row sb"><h2 class="lbl">Séries par muscle · 7 jours</h2><span class="xs mut">zone utile 10 à 20</span></div><div class="card col g4">${volRows}</div></section>
 <button class="card row" style="width:100%;text-align:left;gap:14px" data-a="page" data-v="lib">${thumb('elev')}<div class="grow"><div class="b">Bibliothèque d’exercices</div><div class="sm mut">${S.ex.length} exercices illustrés, avec les muscles et les bons gestes</div></div>${ic('chev',18)}</button>
 ${(()=>{const G=Object.keys(S.goalsEx||{}).map(id=>({id,g:goalInfo(id)})).filter(x=>x.g&&S.ex.some(e=>e.id===x.id));return G.length?`<section class="col"><h2 class="lbl">Tes objectifs</h2>${G.map(({id,g})=>`<button class="item" style="min-height:70px" data-a="exdetail" data-v="${id}">${thumb(id)}<div class="grow col" style="gap:6px"><div class="row sb"><b>${esc(exo(id).n)}</b><span class="num" style="font-size:20px;color:${g.done?'var(--p10)':'var(--ac)'}">${fmt(g.kg)} kg</span></div><div class="xpbar" style="height:6px" aria-hidden="true"><i style="width:${Math.round(g.pct*100)}%;background:${g.done?'var(--p10)':'var(--ac)'}"></i></div><span class="xs mut">${g.done?'Atteint le '+dShort(g.done)+' · fixe la suite':Math.round(g.pct*100)+' %'+(g.eta?' · vers le '+dShort(g.eta):'')}</span></div></button>`).join('')}</section>`:''})()}
 <section class="col"><h2 class="lbl">Tes exercices</h2>${used.map(exRow).join('')||'<div class="empty">Aucune série enregistrée pour l’instant.</div>'}</section>`}
function sessRow(s){const L=sWork(s.id),live=s.state==='active';
 return `<button class="item" style="min-height:64px${live?';border-color:var(--ac)':''}" data-a="sess" data-v="${s.id}"><div class="grow"><div class="b">${cap(new Date(s.start).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'}))} · ${hm(s.start)} · ${esc(sessName(s))}${live?' <span class="tag">en cours</span>':''}</div>
 <div class="sm mut">${pl(L.length,'série')}${sessMins(s)?' · '+sessMins(s)+' min':''}${s.mood?' · '+MOODS.find(m=>m[0]===s.mood)?.[1]:''}${s.note?' · '+esc(s.note):''}</div></div><span class="num" style="font-size:20px">${volTxt(vol(L))}</span></button>`}
function exRow(e){const B=bestSet(e.id),L=workOf(e.id),g=gainOf(e.id),big=bigOf(e.id,B);
 return `<button class="item" style="min-height:64px" data-a="exdetail" data-v="${e.id}">${thumb(e.id)}<div class="grow"><div class="b">${esc(e.n)}</div><div class="sm mut">${g&&g.pct?`<b style="color:var(--p10)">${pctTxt(g.pct)}</b> ${esc(g.what)} · `:''}${pl(L.length,'série')}</div></div><div style="text-align:right"><span class="num" style="font-size:24px">${big.n}</span><span class="mut xs"> ${big.u}</span><div class="xs mut">record</div></div></button>`}
/* one session: every set can be corrected, deleted or added, even weeks later */
function SessView(sid){const s=sessById(sid);if(!s){view={};return Prog()}const L=sLogs(sid),by={};L.forEach(l=>(by[l.e]=by[l.e]||[]).push(l));const W=L.filter(l=>!l.w),live=s.state==='active';
 return `<div class="row">${back()}<span class="lbl">${cap(dLong(key(s.start)))} · ${hm(s.start)}</span></div>
 <h1 class="md">${esc(sessName(s))}</h1>
 ${live?`<div class="card hl row sb"><span class="sm">Séance en cours</span><button class="btn2 acb" data-a="tab" data-v="seance">Reprendre</button></div>`:''}
 <div class="tiles"><div class="tile"><span class="sm mut">Volume</span><span class="num">${volTxt(vol(W))}</span></div>
 <div class="tile"><span class="sm mut">Séries</span><span class="num">${W.length}</span></div><div class="tile"><span class="sm mut">Durée</span><span class="num">${sessMins(s)} min</span></div></div>
 ${!W.length&&!live?'<div class="card warn sm">Aucune série de travail : cette séance ne compte pas (ni XP, ni assiduité).</div>':''}
 ${Object.entries(by).map(([id,LL])=>`<section class="card" style="padding:6px 16px"><button class="row sb link" style="width:100%;color:var(--fg);font-size:15px" data-a="exdetail" data-v="${id}"><b>${esc(exo(id).n)}</b>${ic('chev',16)}</button>
  ${LL.map(l=>`<button class="hist" data-a="editlog" data-v="${l.id}" aria-label="Corriger ${esc(setTxt(l))}"><span class="grow">${l.w?'<span class="tag grey">écht</span> ':''}${esc(setTxt(l))}${isRec(l)?' <span class="tag ok">record</span>':''}</span><span class="sm mut">${l.w?'':FEEL[l.f]?.toLowerCase()||''}</span>${ic('edit',16)}</button>`).join('')}
  <button class="link" data-a="addlog" data-v="${sid}|${id}">${ic('plus',14)} Ajouter une série</button></section>`).join('')}
 <button class="btn2" data-a="pickex" data-v="sess:${sid}">${ic('plus',16)} Ajouter un exercice à cette séance</button>
 ${live?'':`<section class="col"><label for="snote">Note<input id="snote" data-c="snote" data-v="${sid}" maxlength="200" value="${esc(s.note||'')}" placeholder="Ex. épaule un peu raide"></label>
 <div class="chips" role="group" aria-label="Ressenti de la séance" style="grid-template-columns:repeat(4,1fr)">${MOODS.map(([k,l])=>`<button class="chip ${s.mood===k?'on':''}" aria-pressed="${s.mood===k}" style="font-size:14px" data-a="smood" data-v="${sid}|${k}">${l}</button>`).join('')}</div></section>`}
 ${view.delsess===sid?`<div class="card col"><span>Supprimer cette séance et ses ${pl(L.length,'série')} ? Records, XP et trophées seront recalculés.</span><div class="row"><button class="btn2 grow" data-a="delsess" data-v="no">Annuler</button><button class="btn2 grow danger" data-a="delsess" data-v="${sid}">Supprimer</button></div></div>`
 :`<button class="link" style="color:var(--red);align-self:flex-start" data-a="delsess" data-v="ask:${sid}">Supprimer cette séance</button>`}`}
function DayView(d){const D=sessOfDay(d);
 return `<div class="row">${back()}<span class="lbl">${d===today()?'Aujourd’hui':cap(dLong(d))}</span></div>
 <h1 class="md">${D.length>1?pl(D.length,'séance'):D.length?esc(sessName(D[0])):'Aucune séance'}</h1>
 ${D.map(sessRow).join('')||`<div class="empty">Rien n’est noté ce jour-là.${d<today()?'<span class="sm">Tu as oublié de noter une séance ? Ajoute-la après coup.</span>':''}</div>`}
 ${d<today()?`<button class="btn2 acb" data-a="newsessday" data-v="${d}">${ic('plus',16)} Ajouter une séance ce jour-là</button>`:''}`}

function Machine(id){const e=exo(id),L=workOf(id),u=uOf(id),lt=ltOf(id),isLoad=lt==='load'&&u==='reps',rg=view.rg||'3m',mode=view.mode||(isLoad?'kg':'r');
 const from={'1m':31,'3m':92,'1a':365}[rg],fromT=from?Date.now()-from*864e5:0;
 const byS={};L.filter(l=>l.t>=fromT).forEach(l=>{const k=l.sid,o=byS[k]||(byS[k]={d:key(l.t),v:0});
  if(mode==='vol')o.v+=setVol(l);else if(mode==='1rm'){if(ormOk(l))o.v=Math.max(o.v,orm(l.kg,l.r))}else if(mode==='r')o.v=Math.max(o.v,l.r);else o.v=Math.max(o.v,l.kg)});
 const pts=Object.values(byS).filter(o=>o.v>0).map(o=>[o.d,o.v]);
 const chart=pts.length?lineChart(pts,{kg:'Charge max par séance',['1rm']:'1RM estimé par séance',vol:'Volume par séance',r:UL[u][1]+' (meilleure série) par séance'}[mode],dShort,mode==='r'?' '+UL[u][0]:' kg'):'<div class="empty">Valide une série pour voir ta courbe.</div>';
 const sids=[...new Set(L.map(l=>l.sid))].reverse().slice(0,10);
 const B=bestSet(id),Rc=bestSet(id,Date.now()-28*864e5),lib=libOf(id),fid=figId(id),isM=['machine','poulie'].includes(e.k);
 const modes=isLoad?[['kg','Charge max'],['1rm','1RM estimé'],['vol','Volume']]:[['r',UL[u][1]],...(lt!=='assist'?[['kg',lt==='bw'?'Lest':'Charge']]:[])];
 return `<div class="row sb">${back()}<span class="tag grey">${KINDS[e.k]||''}</span></div>
 <div class="col g6"><h1 class="md">${esc(e.n)}</h1><div class="row wrap" style="gap:6px">${e.m.map((m,i)=>`<span class="pill" style="background:${i?'var(--sf)':'rgba(255,90,60,.16)'};color:${i?'var(--mut)':'#FF8A70'}">${cap(m)}${i?'':' · principal'}</span>`).join('')}</div></div>
 ${fid?`<div class="demo" id="demo"></div>
 <div class="row sb"><div class="legend"><span><i style="background:#FF5A3C"></i>muscles</span><span><i style="border:2px solid #3D9BFF"></i>appuis</span><span style="color:#3D9BFF">→ effort</span></div>
 <button class="btn2" style="min-height:40px" data-a="demopause" aria-pressed="${!!view.demoPause}">${view.demoPause?'Animer':'Pause'}</button></div>`:''}
 ${lib?.q?`<details class="fold"><summary>Bien faire le mouvement</summary><ol class="cues">${lib.q.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details>`:`<p class="sm mut" style="margin:0">Exercice créé par toi : l’illustration montre un mouvement proche qui travaille le même muscle.</p>`}
 <div class="row"><button class="btn grow" data-a="set" data-v="${id}">${ic('plus',20)} Noter une série</button><button class="btn2" style="min-height:56px" data-a="addto" data-v="${id}" aria-label="Ajouter ${esc(e.n)} à une séance">${ic('plus',16)} Séance</button></div>
 <section class="col"><h2 class="lbl">Ta progression</h2>
 ${L.length?`<div class="tiles t2"><div class="tile"><span class="sm mut">Record historique</span><span class="num" style="font-size:24px;white-space:normal">${B?esc(setTxt(B)):'—'}</span><span class="xs mut">${B?dShort(key(B.t)):''}</span></div>
 <div class="tile"><span class="sm mut">Meilleure perf · 4 semaines</span><span class="num" style="font-size:24px;white-space:normal">${Rc?esc(setTxt(Rc)):'—'}</span><span class="xs mut">${Rc?dShort(key(Rc.t)):'pas de série récente'}</span></div></div>
 ${(()=>{const g=gainOf(id);return g?`<div class="card col g4"><div class="row" style="gap:12px"><span class="num" style="font-size:40px;color:${g.pct>=0?'var(--p10)':'var(--mut)'}">${pctTxt(g.pct)}</span><b>${esc(g.what)}</b></div><span class="xs mut">${isLoad?`1RM estimé (formule d’Epley, séries de 1 à 12 répétitions) : ${fmt(Math.round(g.from))} kg à ta 1re séance du ${dShort(g.since)}, ${fmt(Math.round(g.to))} kg au mieux depuis. C’est une estimation, pas une charge testée.`:`Meilleure série de ta 1re séance (${g.from} ${g.unit}) comparée à la meilleure depuis (${g.to} ${g.unit}).`}</span></div>`:''})()}
 <div class="seg" role="group" aria-label="Période">${[['1m','1 M'],['3m','3 M'],['1a','1 an'],['all','Tout']].map(([k,l])=>`<button class="${rg===k?'on':''}" aria-pressed="${rg===k}" data-a="rg" data-v="${k}">${l}</button>`).join('')}</div>
 <div class="seg" role="group" aria-label="Courbe">${modes.map(([k,l])=>`<button class="${mode===k?'on':''}" aria-pressed="${mode===k}" data-a="mode" data-v="${k}">${l}</button>`).join('')}</div>
 ${chart}
 ${(()=>{const s=strength(id);if(!s)return '';const pos=Math.min(1,Math.max(0,(s.i+(s.th[s.i+1]?(s.r-s.th[Math.max(0,s.i)])/(s.th[s.i+1]-s.th[Math.max(0,s.i)]):.5)*(s.i<0?0:1))/5));
  return `<div class="card col" style="gap:8px"><div class="row sb"><span class="lbl">Repère de force</span><b style="color:var(--p15)">${s.i<0?'En route':STDN[s.i]}</b></div>
  <div class="std" aria-hidden="true"><span class="mk" style="left:calc(${Math.round(pos*100)}% - 1px)"></span>${STDN.map((n,k)=>`<i style="background:${k<=s.i?['#E9E8E3','#2FB86E','#F2C230','#3D9BFF','#E5383B'][k]:'#1E2124'}"></i>`).join('')}${STDN.map(n=>`<span>${n}</span>`).join('')}</div>
  <span class="xs mut">Meilleur 1RM estimé = ${fmt(s.r)} × ton poids du jour.${s.next?` Palier suivant ≈ ${fmt(rnd(s.next,id))} kg.`:''} Repères publics approximatifs.</span></div>`})()}`
 :'<div class="empty">Pas encore de série sur cet exercice. Note la première pour voir ta courbe.</div>'}</section>
 ${isLoad?(()=>{const G=goalInfo(id);if(G)return `<section class="card col" style="gap:10px;border-color:${G.done?'var(--p10)':'var(--bd)'}"><div class="row sb"><span class="lbl" style="color:${G.done?'var(--p10)':'var(--mut)'}">${G.done?'Objectif atteint le '+dShort(G.done):'Ton objectif'}</span><button class="link mutl" data-a="delgoal" data-v="${id}">Retirer</button></div>
  <div class="row end" style="gap:8px"><span class="num" style="font-size:44px">${fmt(G.kg)}</span><span class="num mut" style="font-size:20px">kg</span><span class="grow"></span><span class="num" style="font-size:28px;color:${G.done?'var(--p10)':'var(--ac)'}">${Math.round(G.pct*100)} %</span></div>
  <div class="xpbar" aria-hidden="true"><i style="width:${Math.round(G.pct*100)}%;background:${G.done?'var(--p10)':'var(--ac)'}"></i></div>
  <span class="sm mut">${G.done?'Bravo. Fixe-toi la barre suivante.':`Départ ${fmt(G.from)} kg · aujourd’hui ${fmt(G.cur)} kg · encore ${fmt(G.kg-G.cur)} kg. `+(G.eta?`Au rythme des 9 dernières semaines (${G.slope>0?'+':''}${fmt(G.slope)} kg / semaine) : <b style="color:var(--fg)">vers le ${dShort(G.eta)}</b>, estimation indicative.`:'Pas encore assez de séances récentes pour estimer une date.')}</span>
  ${G.done?`<div class="row"><input id="goalkg" type="number" inputmode="decimal" step="2.5" placeholder="Nouvel objectif (kg)" aria-label="Nouvel objectif en kg" class="grow"><button class="btn2 acb" style="min-height:48px" data-a="setgoal" data-v="${id}">Fixer</button></div>`:''}</section>`;
  const sug=best(id)?rnd(best(id)*1.1+incOf(id),id):null;
  return `<section class="card col" style="gap:10px"><span class="lbl">Fixe-toi un objectif</span><span class="sm mut">Une charge à atteindre. L’appli suit ta progression et estime quand tu y seras.</span>
  <div class="row"><input id="goalkg" type="number" inputmode="decimal" step="2.5" placeholder="${sug?'Ex. '+fmt(sug)+' kg':'Charge visée (kg)'}" aria-label="Objectif en kg" class="grow"><button class="btn2 acb" style="min-height:48px" data-a="setgoal" data-v="${id}">Fixer</button></div></section>`})():''}
 <details class="fold" ${view.exset?'open':''}><summary>Réglages de l’exercice</summary><div class="col">
  ${isM||e.seat?`<label for="seat">Réglage de la machine (siège, dossier…)<input id="seat" data-c="seat" data-v="${id}" maxlength="60" value="${esc(e.seat)}" placeholder="Ex. siège 4, dossier 2"></label>`:''}
  <div class="col g6"><span class="lbl" id="ltl">Charge notée</span><div class="seg" role="group" aria-labelledby="ltl">${Object.entries(LTL).map(([k,l])=>`<button class="${lt===k?'on':''}" aria-pressed="${lt===k}" data-a="exlt" data-v="${id}|${k}">${l}</button>`).join('')}</div></div>
  <div class="col g6"><span class="lbl" id="ull">Compté en</span><div class="seg" role="group" aria-labelledby="ull">${Object.entries(UL).map(([k,l])=>`<button class="${u===k?'on':''}" aria-pressed="${u===k}" data-a="exu" data-v="${id}|${k}">${l[1]}</button>`).join('')}</div></div>
  <label for="exinc">Pas de progression de la charge<select id="exinc" data-c="exinc" data-v="${id}"><option value="">Par défaut (${fmt2(S.prof.step)} kg)</option>${[.5,1,1.25,2,2.5,4,5,10].map(n=>`<option value="${n}" ${e.inc===n?'selected':''}>${fmt2(n)} kg</option>`).join('')}</select></label>
  ${L.length?'<span class="xs warnc">Changer le type ou l’unité change la lecture des séries déjà notées.</span>':''}</div></details>
 ${L.length?`<section><h2 class="lbl" style="margin-bottom:6px">Historique</h2>${sids.map(sid=>{const D=L.filter(l=>l.sid===sid),s=sessById(sid);
  return `<button class="hist" data-a="sess" data-v="${sid}"><span class="mut" style="width:72px">${dShort(key(D[0].t))}</span><span class="grow">${D.map(l=>esc(setTxt(l))).join(' · ')}</span>${ic('chev',14)}</button>`}).join('')}</section>`:''}
 ${!logsOf(id).length&&!S.progs.some(p=>p.items.some(x=>x.id===id))&&!LIB.some(x=>x.id===id)?`<button class="link" style="color:var(--red)" data-a="delex" data-v="${id}">Supprimer cet exercice</button>`:''}`}

/* ================= records wall ================= */
function Records(){const rows=S.ex.filter(e=>workOf(e.id).length).map(e=>{const L=workOf(e.id),last=L.filter(isRec).at(-1);return {e,b:bestSet(e.id),r:bestSet(e.id,Date.now()-28*864e5),last}}).sort((a,b)=>(b.last?.t||0)-(a.last?.t||0));
 const recent=IDX().L.filter(isRec).slice(-6).reverse();
 return `<div class="row">${back()}<span class="lbl">${pl(XP().prs,'record')} battus</span></div><h1>Mur des records</h1>
 <p class="sm mut" style="margin:0">Record historique = ta meilleure série de tous les temps. Perf récente = la meilleure des 4 dernières semaines.</p>
 ${recent.length?`<section class="col"><h2 class="lbl">Derniers records</h2><div class="card" style="padding:4px 16px">${recent.map(l=>`<button class="hist" data-a="exdetail" data-v="${l.e}"><span class="grow">${esc(exo(l.e).n)}<br><span class="xs mut">${dShort(key(l.t))}</span></span><span class="num" style="font-size:20px">${esc(setTxt(l))}</span></button>`).join('')}</div></section>`:''}
 <section class="col"><h2 class="lbl">Tous tes exercices</h2>${rows.map(x=>{const s=strength(x.e.id);return `<button class="item" style="min-height:76px" data-a="exdetail" data-v="${x.e.id}">${thumb(x.e.id)}<div class="grow"><div class="t">${esc(x.e.n)}</div><div class="sm mut">Record ${esc(setTxt(x.b))} · ${dShort(key(x.b.t))}</div><div class="xs mut">Récent : ${x.r?esc(setTxt(x.r)):'aucune série en 4 semaines'}${s?` · <span style="color:var(--p15)">${STDN[Math.max(0,s.i)]}</span>`:''}</div></div>${ormOk(x.b)?`<div style="text-align:right"><div class="num" style="font-size:26px">${fmt(Math.round(best1(x.e.id)))}</div><span class="xs mut">kg 1RM est.</span></div>`:''}</button>`}).join('')||'<div class="empty">Pas encore de record. Il faut au moins deux séances sur un exercice.</div>'}</section>`}

/* ================= exercise library ================= */
function libCards(){const q=(view.lq||'').trim().toLowerCase(),m=view.lm||'';
 const E=S.ex.filter(e=>(q||!m||e.m[0]===m)&&(!q||e.n.toLowerCase().includes(q)||e.m.some(x=>x.includes(q))));
 if(!E.length)return '<div class="empty" style="grid-column:1/-1">Aucun exercice pour cette recherche.</div>';
 return E.map(e=>`<button class="lcard" data-a="exdetail" data-v="${e.id}">${thumb(e.id)}<b>${esc(e.n)}</b><span class="xs mut">${KINDS[e.k]||''}${best(e.id)?' · '+fmt(best(e.id))+' kg':''}</span></button>`).join('')}
function Library(){const m=view.lm||'',cnt=k=>S.ex.filter(e=>e.m[0]===k).length;
 return `<div class="row">${back()}<span class="lbl">${S.ex.length} exercices illustrés</span></div><h1 class="md">Bibliothèque</h1>
 <input id="lq" data-i="lq" type="search" placeholder="Rechercher : curl, presse, dorsaux…" aria-label="Rechercher un exercice" value="${esc(view.lq||'')}" autocomplete="off">
 <div class="seg" role="group" aria-label="Muscle">${[['','Tous'],...Object.keys(MUS).filter(cnt).map(k=>[k,cap(k)])].map(([k,l])=>`<button class="${m===k?'on':''}" aria-pressed="${m===k}" data-a="lm" data-v="${k}">${l}</button>`).join('')}</div>
 <div class="lgrid" id="lgrid">${libCards()}</div>
 <button class="btn2" data-a="pickex" data-v="today">${ic('plus',16)} Créer un exercice</button>`}
function addToSheet(id){const e=exo(id);view.addto=id;
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font:italic 800 28px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">Ajouter à…</h2>${closeBtn}</div><span class="sm mut">${esc(e.n)}</span>
 <div class="col">${S.progs.map(p=>{const inP=p.items.some(x=>x.id===id);return `<button class="item" style="min-height:60px" data-a="addtoprog" data-v="${p.id}" ${inP?'disabled':''}><div class="grow"><div class="t">${esc(p.n)}</div><div class="sm mut">${inP?'Déjà dans cette séance':pl(p.items.length,'exercice')}</div></div>${inP?ic('check'):ic('plus')}</button>`}).join('')}</div>
 <button class="btn2" data-a="addtoday" data-v="${id}">Seulement pour la séance ${active()?'en cours':'du jour'}</button>`,'addto')}

/* ================= monthly report as a PNG (1080×1350, app colours) ================= */
async function bilanPNG(ym){const [Y,M]=ym.split('-').map(Number),st=monthStats(ym),goal=S.prof.sess,target=Math.round(goal*new Date(Y,M,0).getDate()/7);
 const weeks=monthWeeks(Y,M),lifts=monthLifts(ym,st);
 try{await Promise.all(['700 120px "Barlow Condensed"','600 30px "DM Sans"','400 30px "DM Sans"'].map(f=>document.fonts.load(f)))}catch(e){}
 const boxH=lifts.length?100+lifts.length*62:150,W=1080,H=Math.max(1350,914+boxH+110),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 const FD='"Barlow Condensed", Impact, sans-serif',FB='"DM Sans", system-ui, sans-serif',rr=(X,Yy,w,h,r,col)=>{x.fillStyle=col;x.beginPath();x.roundRect(X,Yy,w,h,r);x.fill()};
 x.fillStyle='#0E0F0F';x.fillRect(0,0,W,H);
 x.fillStyle='#A3A9AE';x.font='700 34px '+FD;x.fillText('C H A R G E',72,104);
 x.fillStyle='#F2F2EE';x.font='700 112px '+FD;x.fillText(('BILAN DE '+MONTHS[M-1]).toUpperCase(),72,236);
 x.fillStyle='#A3A9AE';x.font='400 34px '+FB;x.fillText(String(Y)+(S.prof.name?' · '+S.prof.name:''),72,292);
 [['Séances',st.D.length+' / '+target],['Volume',fmt(st.vol/1000)+' t'],['Records',String(st.recs)]].forEach(([l,v],i)=>{const X=72+i*318;rr(X,340,294,180,28,'#1A1C1C');x.fillStyle='#A3A9AE';x.font='400 28px '+FB;x.fillText(l,X+28,392);x.fillStyle='#F2F2EE';x.font='700 72px '+FD;x.fillText(v,X+28,478)});
 rr(72,552,936,330,28,'#1A1C1C');x.fillStyle='#A3A9AE';x.font='400 28px '+FB;x.fillText('Séances par semaine · objectif '+goal,100,604);
 const mx=Math.max(goal,...weeks.map(w=>w.n),1),bw=(880-(weeks.length-1)*20)/weeks.length,base=820,hmax=170;
 x.strokeStyle='#A3A9AE';x.setLineDash([8,10]);x.lineWidth=2;x.beginPath();const gy=base-goal/mx*hmax;x.moveTo(100,gy);x.lineTo(980,gy);x.stroke();x.setLineDash([]);
 weeks.forEach((w,i)=>{const X=100+i*(bw+20),h=Math.max(6,w.n/mx*hmax);rr(X,base-h,bw,h,12,w.fut?'#222525':w.n>=w.goal?'#3D9BFF':'#3A3E3D');
  x.fillStyle='#F2F2EE';x.font='700 40px '+FD;x.textAlign='center';if(!w.fut)x.fillText(String(w.n),X+bw/2,base-h-14);x.fillStyle='#A3A9AE';x.font='400 24px '+FB;x.fillText(w.lab,X+bw/2,base+40);x.textAlign='left'});
 rr(72,914,936,boxH,28,'#1A1C1C');x.fillStyle='#A3A9AE';x.font='400 28px '+FB;x.fillText('1RM estimé (indicatif) · évolution du mois',100,966);
 lifts.forEach((l,i)=>{const Yy=1030+i*62;x.fillStyle='#F2F2EE';x.font='600 32px '+FB;x.fillText(exo(l.id).n.slice(0,30),100,Yy);x.textAlign='right';
  x.font='700 40px '+FD;x.fillText(fmt(Math.round(l.b1))+' kg',870,Yy);x.fillStyle=l.d>0?'#32D583':'#A3A9AE';x.fillText(l.d>0?'+'+fmt(Math.round(l.d)):'±0',980,Yy);x.textAlign='left'});
 x.fillStyle='#3D9BFF';x.font='700 30px '+FD;x.fillText(streak()+' SEMAINE'+(streak()>1?'S':'')+' D’AFFILÉE',72,H-50);
 return new Promise(ok=>c.toBlob(ok,'image/png'))}

/* ================= Corps ================= */
/* recovery is an approximation from your sets, your effort and an average recovery time per muscle */
function fatigue(offsetH=0){const now=Date.now()+offsetH*36e5,F={},by={};
 IDX().L.filter(l=>!l.w&&now-l.t<80*36e5&&l.t<=now).forEach(l=>{exo(l.e).m.forEach((m,i)=>{const kk=l.sid+'|'+m;by[kk]=by[kk]||{m,t:l.t,n:0,src:sessName(sessById(l.sid)||{})};by[kk].n+=(i?.5:1)*({easy:.7,ok:1,max:1.2,hard:1.3}[l.f]||1);by[kk].t=Math.max(by[kk].t,l.t)})});
 Object.values(by).forEach(s=>{if(!MUS[s.m])return;const I=Math.min(1,s.n*.15),h=(now-s.t)/36e5,f=I*Math.max(0,1-h/MUS[s.m]);if(f>(F[s.m]?.f||0))F[s.m]={f,I,h,src:s.src,t:s.t}});return F}
const RLV=[[.15,'Récupéré','#2A2D2D'],[.4,'Plutôt récupéré','#5A3A2E'],[.7,'Encore sollicité','#B34A35'],[2,'Très sollicité','#FF453A']];
const rlv=f=>RLV.find(x=>f<x[0]);
function Corps(){const ct=view.ct||'poids';
 const seg=`<div class="seg" role="tablist" aria-label="Corps">${[['poids','Poids'],['mesures','Mesures'],['photos','Photos'],['recup','Récup']].map(([k,l])=>`<button role="tab" aria-selected="${ct===k}" class="${ct===k?'on':''}" data-a="ct" data-v="${k}">${l}</button>`).join('')}</div>`;
 return `<h1>Corps</h1>${seg}${({poids:Poids,mesures:Mesures,photos:Photos,recup:Recup})[ct]()}`}
function Poids(){const B=S.bw.slice().sort((a,b)=>a.d<b.d?-1:1),cw=B.at(-1),old=B.filter(b=>Date.parse(b.d)>=Date.now()-31*864e5)[0];
 const dlt=cw&&old&&old!==cw?cw.kg-old.kg:null,tr=trend(),g=S.prof.goal;
 const tgt={masse:'+0,1 à +0,5',seche:'−0,25 à −1',maintien:'−0,2 à +0,2'}[g];
 const ok=tr==null?null:g==='masse'?tr>=.1&&tr<=.5:g==='seche'?tr<=-.25&&tr>=-1:Math.abs(tr)<=.2;
 return `<section class="col"><div class="row end"><span class="num" style="font-size:72px;line-height:.85">${fmt(cw?cw.kg:S.prof.w)}</span><span class="num mut" style="font-size:24px">kg</span>
  <div class="grow" style="text-align:right">${dlt!=null?`<div class="sm ac b">${dlt>0?'+':''}${fmt(dlt)} kg sur 30 j</div>`:''}<div class="xs mut">${cw?'pesée du '+dShort(cw.d):'poids de départ'}</div></div></div>
 ${B.length>1?lineChart(B.slice(-40).map(b=>[b.d,b.kg]),'Évolution du poids',dShort,' kg'):''}
 ${tr!=null?`<div class="card row sb"><div class="col g4"><span class="sm mut">Tendance (4 semaines)</span><b>${tr>0?'+':''}${fmt2(tr)} kg / semaine</b></div><div class="col g4" style="text-align:right"><span class="xs mut">cible ${g==='masse'?'prise de masse':g==='seche'?'sèche':'maintien'}</span><span class="tag ${ok?'ok':'warn'}" style="align-self:flex-end">${tgt} kg</span></div></div>`
  :`<p class="sm mut" style="margin:0">Pèse-toi le matin à jeun, 2 à 3 fois par semaine. Avec 4 pesées sur au moins 2 semaines, l’appli calcule ta tendance.</p>`}
 <div class="row"><input id="bwin" type="number" inputmode="decimal" min="25" max="350" step="0.1" placeholder="Poids du jour (kg)" aria-label="Poids du jour en kg" class="grow"><button class="btn2 acb" style="min-height:48px" data-a="savebw">Enregistrer</button></div></section>
 ${B.length?`<section class="col"><h2 class="lbl">Dernières pesées</h2><div class="card" style="padding:4px 16px">${B.slice(-8).reverse().map(b=>`<div class="hist"><span class="mut">${cap(new Date(b.d+'T12:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'}))}</span><span class="grow num" style="text-align:right;font-size:20px">${fmt(b.kg)} kg</span><button class="x s" data-a="delbw" data-v="${b.d}" aria-label="Supprimer la pesée du ${dShort(b.d)}">${ic('trash',16)}</button></div>`).join('')}</div></section>`:''}`}
function Mesures(){const M=S.meas.slice().sort((a,b)=>a.d<b.d?-1:1),lastOf=k=>M.filter(m=>m[k]).at(-1),firstOf=k=>M.find(m=>m[k]);
 const sel=view.ms||'bras',pts=M.filter(m=>m[sel]).map(m=>[m.d,m[sel]]);
 return `<section class="col"><div class="g2">${MEAS.map(([k,l])=>{const a=lastOf(k),f=firstOf(k),d=a&&f&&a!==f?a[k]-f[k]:null;
  return `<button class="tile" style="border:1px solid ${sel===k?'var(--ac)':'transparent'};text-align:left" aria-pressed="${sel===k}" data-a="ms" data-v="${k}"><span class="sm mut">${l}</span><span class="num">${a?fmt(a[k])+' cm':'—'}</span><span class="xs ${d>0?'ac':'mut'}">${d!=null?(d>0?'+':'')+fmt(d)+' cm depuis le '+dShort(f.d):a?'mesuré le '+dShort(a.d):'pas encore mesuré'}</span></button>`}).join('')}</div>
 ${pts.length>1?lineChart(pts,'Tour de '+MEAS.find(m=>m[0]===sel)[1].toLowerCase(),dShort,' cm'):''}
 <button class="btn" data-a="measure">${ic('plus',20)} Nouvelle mesure</button>
 <p class="xs mut" style="margin:0">Mesure toujours au même endroit, muscle relâché, le matin. Plusieurs saisies le même jour se complètent sans s’effacer.</p></section>`}
function Photos(){if(photos===null){loadPhotos();return '<div class="empty"><span class="spin"></span>Chargement des photos…</div>'}
 if(photos===false)return '<div class="empty">Les photos ne peuvent pas être enregistrées dans ce navigateur (stockage bloqué).</div>';
 const sel=view.psel||[],cmp=sel.length===2?sel.map(id=>photos.find(p=>p.id===id)).filter(Boolean).sort((a,b)=>a.d<b.d?-1:1):null;
 return `<section class="col"><div class="card sm col g6"><b>Privées et hors sauvegarde</b><span class="mut">Les photos restent sur cet appareil : elles ne sont ni synchronisées ni dans l’export JSON. Sauvegarde-les à part.</span>${photos.length?`<button class="btn2" data-a="exportphotos">${ic('copy',16)} Sauvegarder les ${pl(photos.length,'photo')}</button>`:''}</div>
 ${cmp&&cmp.length===2?`<div class="card col"><span class="lbl">Avant / après · ${Math.round((Date.parse(cmp[1].d)-Date.parse(cmp[0].d))/864e5)} jours</span><div class="cmp">${cmp.map(p=>`<figure><img src="${PH.url(p)}" alt="Photo du ${dShort(p.d)}"><figcaption class="sm mut">${dShort(p.d)}</figcaption></figure>`).join('')}</div><button class="btn2" data-a="psel" data-v="">Fermer la comparaison</button></div>`:''}
 ${photos.length?`<div class="pgrid">${photos.slice().reverse().map(p=>{const on=sel.includes(p.id);return `<button class="photo ${on?'sel':''}" data-a="ptap" data-v="${p.id}" aria-pressed="${on}" aria-label="Photo du ${dShort(p.d)}"><img src="${PH.url(p)}" alt=""><span>${dShort(p.d)}</span>${on?`<span class="ck">${ic('check',14)}</span>`:''}</button>`}).join('')}</div>
  <span class="xs mut">${sel.length===1?'Choisis une 2e photo pour comparer.':'Touche deux photos pour les comparer côte à côte.'}</span>
  ${sel.length===1?`<div class="row"><button class="btn2 grow" data-a="psel" data-v="">Désélectionner</button><button class="btn2 grow danger" data-a="pdel" data-v="${sel[0]}">Supprimer la photo</button></div>`:''}`
  :'<div class="empty">Aucune photo. Une photo par mois, même lumière, même pose : c’est le meilleur juge de ta progression.</div>'}
 <button class="btn" data-a="addphoto">${ic('camera',20)} Ajouter une photo</button></section>`}
function Recup(){const off=view.off??0,F=fatigue(off);
 const top=Object.entries(F).filter(([,v])=>v.f>=.15).sort((a,b)=>b[1].f-a[1].f).slice(0,4);
 const when=v=>{const h=Math.max(0,MUS[v.m||'pectoraux']*(1-.15/v.I)-v.h);return h<6?'probablement prêt':h<30?'probablement prêt demain':'plutôt dans '+Math.max(2,Math.round(h/24))+' jours'};
 return `<section class="col"><div class="seg" role="group" aria-label="Moment">${[[0,'Maintenant'],[12,'+12 h'],[24,'Demain'],[48,'+2 j']].map(([h,l])=>`<button class="${off===h?'on':''}" aria-pressed="${off===h}" data-a="off" data-v="${h}">${l}</button>`).join('')}</div>
 <div class="mus">${Object.keys(MUS).map(m=>{const f=F[m]?.f||0,L=rlv(f);return `<div style="background:${L[2]};color:#F4F3EF"><span>${m}</span><b class="xs" style="text-align:right">${L[1]}</b></div>`}).join('')}</div></section>
 <section class="col"><h2 class="lbl">Les plus sollicités</h2>${top.length?top.map(([m,v])=>`<div class="card row sb"><div class="col" style="gap:2px"><b>${cap(m)}</b><span class="xs mut">${esc(v.src)} · ${dShort(key(v.t))}</span></div><span class="sm mut" style="text-align:right">${rlv(v.f)[1]}<br>${when({...v,m})}</span></div>`).join(''):'<div class="empty">Rien de récent : tes muscles sont probablement récupérés.</div>'}
 <p class="xs mut" style="margin:0">Indication approximative à partir de tes séries des 3 derniers jours, de ton ressenti et d’un temps de récupération moyen par muscle. Ce n’est pas une mesure : sommeil, alimentation et courbatures comptent aussi.</p></section>`}
function measureSheet(){const M=S.meas.slice().sort((a,b)=>a.d<b.d?-1:1),td=M.find(m=>m.d===today());
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font:italic 800 28px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">Nouvelle mesure</h2>${closeBtn}</div><span class="sm mut">En centimètres. Laisse vide ce que tu ne mesures pas${td?' : les mesures déjà notées aujourd’hui sont gardées':''}.</span>
 <div class="g2">${MEAS.map(([k,l])=>{const p=M.filter(m=>m[k]).at(-1);return `<label for="m_${k}">${l}${td?.[k]?` <span class="xs">(aujourd’hui ${fmt(td[k])})</span>`:''}<input id="m_${k}" type="number" inputmode="decimal" min="10" max="250" step="0.5" placeholder="${p?fmt(p[k]):''}"></label>`}).join('')}</div>
 <p id="merr" class="sm redc" style="margin:0" role="alert" hidden></p>
 <div class="sfoot"><button class="btn" data-a="savemeas">Enregistrer</button></div>`,'meas')}

/* ================= Nutrition ================= */
function Nut(){const d=view.nd||today(),g=goals(),n=nutDay(d),c=2*Math.PI*50,w=waterN(d),isT=d===today(),tip=isT?adjustTip():null;
 const wGoal=S.prof.water||2.5,glasses=Math.round(wGoal/.25);
 const meals=MEALS.map(m=>{const F=S.food.filter(f=>f.d===d&&f.m===m),k=F.reduce((s,f)=>s+f.k,0);
  return `<div class="card col" style="gap:4px"><div class="row sb"><b>${m}</b><div class="row" style="gap:8px"><span class="num" style="font-size:22px">${F.length?nf(k):'—'}</span><button class="x s acx" data-a="addfood" data-v="${m}" aria-label="Ajouter au ${m.toLowerCase()}">${ic('plus',16)}</button></div></div>
  ${F.map(f=>`<button class="food" style="min-height:48px;padding:6px 0" data-a="editfood" data-v="${f.id}"><span class="grow sm">${esc(f.n)} <span class="mut">· ${fmt(f.q)} g</span></span><span class="sm mut">${nf(f.k)} kcal · ${Math.round(f.p)} g prot.</span></button>`).join('')}
  ${F.length>1?`<button class="link mutl" style="align-self:flex-start" data-a="savetmeal" data-v="${m}">${ic('star',14)} Enregistrer comme repas type</button>`:''}</div>`}).join('');
 const yk=addDays(d,-1),hasY=S.food.some(f=>f.d===yk),hasD=S.food.some(f=>f.d===d);
 return `<div class="col g4"><button class="link mutl" data-a="goalsheet">Objectif ${({seche:'sèche',maintien:'maintien',masse:'prise de masse'})[S.prof.goal]} · ${nf(g.k)} kcal${g.man?' (manuel)':''} ${ic('chev',14)}</button><h1>Nutrition</h1></div>
 <div class="row sb"><button class="x s" data-a="nd" data-v="${addDays(d,-1)}" aria-label="Jour précédent">${ic('left',16)}</button><b>${isT?'Aujourd’hui':cap(dLong(d))}</b><button class="x s" data-a="nd" data-v="${addDays(d,1)}" aria-label="Jour suivant" ${isT?'disabled':''}>${ic('chev',16)}</button></div>
 <section class="card row" style="gap:20px;padding:20px;border-radius:24px"><svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="${nf(n.k)} kcal sur ${nf(g.k)}" style="flex:none">
 <circle cx="60" cy="60" r="50" fill="none" stroke="#2A2D2D" stroke-width="12"/><circle cx="60" cy="60" r="50" fill="none" stroke="${n.k>g.k*1.05?'#FFB020':'#3D9BFF'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c*Math.min(1,n.k/g.k)} ${c}" transform="rotate(-90 60 60)"/>
 <text x="60" y="62" text-anchor="middle" fill="#F2F2EE" font-family="Barlow Condensed, Impact, sans-serif" font-weight="700" font-size="30">${nf(n.k)}</text><text x="60" y="80" text-anchor="middle" fill="#A3A9AE" font-size="11" font-family="DM Sans, sans-serif">${n.k>g.k?'+'+nf(n.k-g.k):'reste '+nf(g.k-n.k)}</text></svg>
 <div class="grow col" style="gap:12px">${[['Protéines',n.p,g.p,'#F2F2EE'],['Glucides',n.g,g.g,'#A3A9AE'],['Lipides',n.l,g.l,'#7C8380']].map(([l,v,o,col])=>`<div class="col" style="gap:5px"><div class="row sb sm"><span class="mut">${l}</span><span><b>${Math.round(v)}</b> / ${o} g</span></div><div class="bar" style="height:6px" aria-hidden="true"><i style="width:${Math.min(100,v/o*100)}%;background:${col}"></i></div></div>`).join('')}</div></section>
 ${tip?`<div class="card hl col"><span class="lbl ac">Ajustement possible</span><span class="sm">${tip.why} (${tip.r>0?'+':''}${fmt2(tip.r)} kg / semaine sur 4 semaines, repas notés ${tip.logged} jours sur 7). Si tes saisies sont complètes, passe à <b>${nf(g.k+tip.d)} kcal</b> par jour.</span><div class="row"><button class="btn2 grow" data-a="tipno">Plus tard</button><button class="btn2 grow acb" data-a="tipyes" data-v="${tip.d}">${tip.d>0?'+':''}${tip.d} kcal</button></div></div>`:''}
 <section class="card col"><div class="row sb"><div><b>Eau</b><div class="sm mut">${fmt(w*.25)} / ${fmt(wGoal)} L · verres de 25 cl</div></div><div class="row"><button class="x" data-a="water" data-v="-1" aria-label="Retirer un verre">−</button><span class="num" style="font-size:26px;min-width:28px;text-align:center" aria-live="polite">${w}</span><button class="x acx" data-a="water" data-v="1" aria-label="Ajouter un verre">+</button></div></div>
  <div class="row" style="gap:4px" aria-hidden="true">${[...Array(glasses)].map((_,i)=>`<i style="flex:1;height:6px;border-radius:3px;background:${i<w?'#3D9BFF':'#2A2D2D'}"></i>`).join('')}</div></section>
 <section class="col"><div class="row sb"><h2 class="lbl">Repas</h2>${hasY&&!hasD?`<button class="link" data-a="copyy">${ic('copy',14)} Copier les repas de la veille</button>`:''}</div>${meals}</section>
 <div class="row"><button class="btn grow" data-a="addfood" data-v="">${ic('plus',20)} Ajouter</button><button class="btn light grow" data-a="scan">${ic('scan',20)} Scanner</button></div>`}
const mealNow=()=>{const h=new Date().getHours();return h<11?'Petit-déjeuner':h<15?'Déjeuner':h<18?'Collation':'Dîner'};
function goalSheet(){const p=S.prof,g=goals();
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font:italic 800 28px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">Mon objectif</h2>${closeBtn}</div>
 <div class="col"><span class="lbl" id="gl1">Objectif</span><div class="chips" role="group" aria-labelledby="gl1" style="grid-template-columns:repeat(3,1fr)">${[['seche','Sèche'],['maintien','Maintien'],['masse','Masse']].map(([k,l])=>`<button class="chip ${p.goal===k?'on':''}" aria-pressed="${p.goal===k}" style="font-size:15px" data-a="goal" data-v="${k}">${l}</button>`).join('')}</div></div>
 <div class="col"><span class="lbl" id="gl2">Activité en dehors de la salle</span><div class="col g6" role="group" aria-labelledby="gl2">${Object.entries(ACT).map(([k,[l,d]])=>`<button class="item ${p.act===k?'on':''}" style="min-height:52px;padding:8px 14px" aria-pressed="${p.act===k}" data-a="act" data-v="${k}"><div class="grow"><div class="b sm">${l}</div><div class="xs mut">${d}</div></div>${p.act===k?ic('check',18):''}</button>`).join('')}</div></div>
 <div class="col"><span class="lbl" id="gl3">Séances par semaine</span><div class="chips" role="group" aria-labelledby="gl3" style="grid-template-columns:repeat(5,1fr)">${[2,3,4,5,6].map(n=>`<button class="chip ${p.sess==n?'on':''}" aria-pressed="${p.sess==n}" data-a="wsess" data-v="${n}">${n}×</button>`).join('')}</div><span class="xs mut">Les semaines déjà comptées gardent l’objectif de l’époque.</span></div>
 <div class="card col"><span class="sm mut">Ton objectif quotidien${g.man?' (fixé à la main)':''}</span><div class="row base"><span class="num" style="font-size:56px">${nf(g.k)}</span><span class="mut">kcal</span></div>
 <div class="g3 sm"><span><b>${g.p} g</b><br><span class="mut">protéines</span></span><span><b>${g.g} g</b><br><span class="mut">glucides</span></span><span><b>${g.l} g</b><br><span class="mut">lipides</span></span></div></div>
 <div class="card col g4 sm"><div class="kv"><span class="mut">Poids utilisé</span><span>${fmt(wNow())} kg (dernière pesée)</span></div><div class="kv"><span class="mut">Métabolisme de base</span><span>${nf(g.bmr)} kcal</span></div>
 <div class="kv"><span class="mut">Activité + ${p.sess} séances</span><span>× ${fmt2(g.act)}</span></div><div class="kv"><span class="mut">Objectif</span><span>${g.off>0?'+':''}${g.off} kcal</span></div>
 ${p.kadj?`<div class="kv"><span class="mut">Ajustement selon ton poids</span><span>${p.kadj>0?'+':''}${p.kadj} kcal <button class="link" data-a="kadj0">remettre à 0</button></span></div>`:''}
 <div class="kv"><span class="mut">Calcul automatique</span><span>${nf(g.auto)} kcal</span></div></div>
 <div class="col g6"><label for="kman">Objectif manuel (kcal, facultatif)<input id="kman" type="number" inputmode="numeric" min="1000" max="6000" step="10" value="${p.kman||''}" placeholder="Laisse vide pour le calcul automatique"></label>
 <div class="row"><button class="btn2 grow" data-a="kmanset">Utiliser ce chiffre</button>${p.kman?'<button class="btn2 grow" data-a="kman0">Revenir au calcul</button>':''}</div><p id="kerr" class="sm redc" role="alert" style="margin:0" hidden></p></div>
 <p class="xs mut" style="margin:0">Formule Mifflin-St Jeor × activité. Protéines ${p.goal==='seche'?'2,2':'2'} g/kg, lipides ${p.goal==='seche'?'0,8':'1'} g/kg, le reste en glucides. Âge, taille et sexe se modifient dans Profil. Ce sont des estimations de départ : ajuste selon l’évolution de ton poids.</p>
 <div class="sfoot"><button class="btn" data-a="close">Valider</button></div>`,'goal')}
/* ---------- food picker ---------- */
const per=(f,q)=>({k:f.k100*q/100,p:f.p100*q/100,g:f.g100*q/100,l:f.l100*q/100});
const baseFoods=()=>[...S.myfoods.map(f=>({...f,mine:1})),...FOODS.map(([n,k,p,g,l,q])=>({n,k100:k,p100:p,g100:g,l100:l,q}))];
const findFood=n=>baseFoods().find(f=>f.n===n)||(()=>{const r=S.food.slice().reverse().find(f=>f.n===n);return r&&{n:r.n,k100:r.k100,p100:r.p100,g100:r.g100,l100:r.l100,q:r.q}})();
function foodRows(list){return list.map(f=>`<div class="row" style="gap:0;border-bottom:1px solid #2A2D2D"><button class="food grow" style="border:0" data-a="pickfood" data-v="${esc(f.n)}"><div class="grow"><div class="b">${esc(f.n)}</div><div class="xs mut">${f.info||`${nf(f.k100)} kcal · ${fmt(f.p100)} g prot. / 100 g`}</div></div></button>
 <button class="star ${S.fav.includes(f.n)?'on':''}" data-a="fav" data-v="${esc(f.n)}" aria-label="${S.fav.includes(f.n)?'Retirer des':'Ajouter aux'} favoris : ${esc(f.n)}" aria-pressed="${S.fav.includes(f.n)}">${ic('star',20)}</button></div>`).join('')}
function foodList(){const t=view.ft||'search',q=(view.fq||'').trim().toLowerCase();
 if(t==='recent'){const R=[...new Map(S.food.slice().reverse().map(f=>[f.n,f])).values()].slice(0,15);return R.length?foodRows(R.map(f=>({...findFood(f.n),n:f.n,info:`${fmt(f.q)} g · ${nf(f.k)} kcal · ${Math.round(f.p)} g prot.`}))):'<div class="empty">Les aliments que tu ajoutes apparaîtront ici.</div>'}
 if(t==='fav'){const F=S.fav.map(findFood).filter(Boolean);return F.length?foodRows(F):'<div class="empty">Touche l’étoile d’un aliment pour le retrouver ici.</div>'}
 if(t==='meals')return S.tmeals.length?S.tmeals.map(m=>`<div class="row" style="gap:0;border-bottom:1px solid #2A2D2D"><button class="food grow" style="border:0" data-a="usetmeal" data-v="${m.id}"><div class="grow"><div class="b">${esc(m.n)}</div><div class="xs mut">${m.items.map(x=>esc(x.n)).join(', ')} · ${nf(m.items.reduce((s,x)=>s+x.k,0))} kcal</div></div>${ic('plus',18)}</button><button class="star" data-a="deltmeal" data-v="${m.id}" aria-label="Supprimer le repas type ${esc(m.n)}">${ic('trash',18)}</button></div>`).join(''):'<div class="empty">Compose un repas puis touche « Enregistrer comme repas type » pour l’ajouter en un geste.</div>';
 const L=baseFoods().filter(f=>!q||f.n.toLowerCase().includes(q)).slice(0,q?40:60);
 return L.length?foodRows(L):`<div class="empty">Rien pour « ${esc(view.fq)} ».<button class="btn2 acb" data-a="newfood">Créer cet aliment</button></div>`}
function foodSheet(meal){view.fm=meal||view.fm||mealNow();view.ft=view.ft||(S.food.length?'recent':'search');
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font:italic 800 28px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">Ajouter</h2>${closeBtn}</div>
 <label for="fm">Repas<select id="fm" data-c="fm">${MEALS.map(m=>`<option ${m===view.fm?'selected':''}>${m}</option>`).join('')}</select></label>
 <div class="row"><input id="fq" data-i="fq" type="search" placeholder="Rechercher un aliment" aria-label="Rechercher un aliment" value="${esc(view.fq||'')}" autocomplete="off" class="grow"><button class="x acx" data-a="scan" aria-label="Scanner un code-barres">${ic('scan',20)}</button></div>
 <div class="seg" role="tablist" aria-label="Liste">${[['search','Tous'],['recent','Récents'],['fav','Favoris'],['meals','Repas types']].map(([k,l])=>`<button role="tab" aria-selected="${view.ft===k}" class="${view.ft===k?'on':''}" data-a="ft" data-v="${k}">${l}</button>`).join('')}</div>
 <div id="flist" class="col" style="gap:0">${foodList()}</div>
 <button class="btn2" data-a="newfood">${ic('plus',16)} Créer un aliment (étiquette)</button>`,'food')}
function qtySheet(f,entry){view.qf=f;view.qe=entry||null;const q=entry?entry.q:(view.qq||f.q||100),m=per(f,q);
 sheet(`<div class="grab"></div><div class="row">${entry?closeBtn:`<button class="x" data-a="foodback" aria-label="Retour">${ic('back',20)}</button>`}<div class="grow"><h2 class="b" style="font-size:17px;margin:0" id="sheet-title" tabindex="-1">${esc(f.n)}</h2><div class="sm mut">${nf(f.k100)} kcal · P ${fmt(f.p100)} · G ${fmt(f.g100)} · L ${fmt(f.l100)} / 100 g</div></div>
 <button class="star ${S.fav.includes(f.n)?'on':''}" data-a="fav" data-v="${esc(f.n)}" aria-label="Favori" aria-pressed="${S.fav.includes(f.n)}">${ic('star',22)}</button></div>
 <label for="qq">Quantité (g)<input id="qq" data-i="qq" type="number" inputmode="decimal" min="1" max="3000" value="${q}"></label>
 <div class="row wrap" style="gap:6px">${[...new Set([f.q,50,100,150,200,250].filter(Boolean))].slice(0,6).map(v=>`<button class="btn2 fill" data-a="qset" data-v="${v}">${v} g${v===f.q?' · portion':''}</button>`).join('')}</div>
 <div class="card tiles" id="qmac" style="grid-template-columns:repeat(4,1fr);padding:12px" aria-live="polite">${macTiles(m)}</div>
 <p id="qerr" class="sm redc" role="alert" style="margin:0" hidden>Quantité entre 1 et 3 000 g.</p>
 ${entry?`<label for="fm2">Repas<select id="fm2">${MEALS.map(x=>`<option ${x===entry.m?'selected':''}>${x}</option>`).join('')}</select></label>
 <div class="sfoot"><div class="row"><button class="btn2 grow danger" style="min-height:56px" data-a="delfood" data-v="${entry.id}">Supprimer</button><button class="btn grow" data-a="savefoodq">Enregistrer</button></div></div>`
 :`<div class="sfoot"><button class="btn" data-a="addfoodq">Ajouter · ${esc(view.fm||mealNow())}</button></div>`}`,'qty')}
const macTiles=m=>[['kcal',nf(m.k)],['prot.',fmt(m.p)+' g'],['gluc.',fmt(m.g)+' g'],['lip.',fmt(m.l)+' g']].map(([l,v])=>`<div class="col g4" style="align-items:center"><span class="num" style="font-size:22px">${v}</span><span class="xs mut">${l}</span></div>`).join('');
function newFoodSheet(pre={}){view.nf=pre;
 sheet(`<div class="grab"></div><div class="row"><button class="x" data-a="foodback" aria-label="Retour">${ic('back',20)}</button><h2 class="grow" style="font:italic 800 28px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">${pre.code?'Nouveau produit':'Créer un aliment'}</h2></div>
 ${pre.code?`<span class="tag grey" style="align-self:flex-start">Code-barres ${esc(pre.code)}</span><span class="sm mut">Ce code n’est pas encore dans <b>ta base personnelle</b>. Recopie l’étiquette une fois : au prochain scan, le produit sera reconnu.</span>`:''}
 ${pre.src==='claude'?'<div class="card sm">Valeurs lues sur ta photo par Claude. Vérifie-les avec l’étiquette avant d’enregistrer.</div>':''}
 ${sample&&sampleImg&&!pre.src?`<button class="btn2 acb" data-a="label">${ic('camera',16)} Photographier le tableau nutritionnel</button>`:''}
 <label for="nfn">Nom<input id="nfn" maxlength="60" placeholder="Ex. Skyr vanille Siggi’s" value="${esc(pre.n||(pre.code?'':view.fq||''))}"></label>
 <span class="lbl">Valeurs pour 100 g (étiquette)</span>
 <div class="g2"><label for="nfk">Énergie (kcal)<input id="nfk" type="number" inputmode="decimal" min="0" max="900" value="${pre.k100??''}"></label><label for="nfp">Protéines (g)<input id="nfp" type="number" inputmode="decimal" min="0" max="100" value="${pre.p100??''}"></label>
 <label for="nfg">Glucides (g)<input id="nfg" type="number" inputmode="decimal" min="0" max="100" value="${pre.g100??''}"></label><label for="nfl">Lipides (g)<input id="nfl" type="number" inputmode="decimal" min="0" max="100" value="${pre.l100??''}"></label></div>
 <label for="nfq">Portion habituelle (g)<input id="nfq" type="number" inputmode="decimal" min="1" max="3000" value="${pre.q??100}"></label>
 <p id="nferr" class="sm redc" style="margin:0" role="alert" hidden></p>
 <div class="sfoot"><button class="btn" data-a="savenewfood">Enregistrer l’aliment</button></div>`,'newfood')}
/* ---------- barcode scan: photo → native BarcodeDetector or ZXing → YOUR product base (not a universal food database) ---------- */
let zxP=null;
function loadZX(){if(window.ZXing)return Promise.resolve(window.ZXing);if(zxP)return zxP;
 const srcs=['https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js','https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js'];
 zxP=srcs.reduce((p,src)=>p.catch(()=>new Promise((ok,ko)=>{const s=document.createElement('script');s.crossOrigin='anonymous';s.src=src;s.onload=()=>window.ZXing?ok(window.ZXing):ko();s.onerror=()=>{s.remove();ko()};document.head.appendChild(s)})),Promise.reject()).catch(e=>{zxP=null;throw e});return zxP}
async function decodeBarcode(file){
 if('BarcodeDetector' in window){try{const bd=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']}),bm=await createImageBitmap(file),r=await bd.detect(bm);if(r[0])return r[0].rawValue}catch(e){}}
 const Z=await loadZX();const u=URL.createObjectURL(file);
 try{const im=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=u});
  const hints=new Map();hints.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.UPC_E]);hints.set(Z.DecodeHintType.TRY_HARDER,true);
  const rd=new Z.MultiFormatReader();rd.setHints(hints);
  for(const mx of [1400,900,2000]){const s=Math.min(1,mx/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
   for(const rot of [0,90]){try{let cv=c;if(rot){cv=document.createElement('canvas');cv.width=c.height;cv.height=c.width;const x=cv.getContext('2d');x.translate(cv.width/2,cv.height/2);x.rotate(Math.PI/2);x.drawImage(c,-c.width/2,-c.height/2)}
    const lum=new Z.HTMLCanvasElementLuminanceSource(cv),bmp=new Z.BinaryBitmap(new Z.HybridBinarizer(lum));return rd.decode(bmp).getText()}catch(e){}}}
  return null}finally{URL.revokeObjectURL(u)}}
function scanSheet(state={}){view.scan=state;const s=state,n=S.myfoods.filter(f=>f.code).length;
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font:italic 800 28px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">Scanner</h2>${closeBtn}</div>
 ${s.busy?`<div class="card row" role="status"><span class="spin"></span><span>${esc(s.busy)}</span></div>`:''}
 ${s.err?`<div class="card warn sm" role="alert">${s.err}</div>`:''}
 ${!s.busy?`<div class="card sm col g4"><b>Comment ça marche</b><span class="mut">Le scanner reconnaît les produits de <b>ta base personnelle</b> (${pl(n,'produit')} enregistré${n>1?'s':''}). Ce n’est pas une base alimentaire universelle : un produit jamais scanné, tu le complètes une fois depuis l’étiquette, ensuite il est reconnu.</span></div>
 <button class="btn" data-a="shoot">${ic('camera',20)} Photographier le code-barres</button>
 <p class="sm mut" style="margin:0">Cadre le code-barres de près, bien net et à plat. Le lecteur se télécharge la première fois (réseau nécessaire).</p>
 <div class="row"><input id="code" type="text" inputmode="numeric" maxlength="14" placeholder="ou saisis les chiffres du code" aria-label="Code-barres" class="grow" value="${esc(s.code||'')}"><button class="btn2 acb" style="min-height:48px" data-a="codego">OK</button></div>`:''}`,'scan')}
function afterCode(code){code=String(code||'').replace(/\D/g,'');if(code.length<8||code.length>14){scanSheet({err:'Ce code ne ressemble pas à un code-barres (8 à 14 chiffres).',code});return}
 const f=S.myfoods.find(x=>x.code===code);
 if(f){view.fq='';toast('Produit reconnu : '+esc(f.n));return qtySheet(f)}
 newFoodSheet({code})}
async function readLabel(file){const pre=view.nf||{};newFoodSheetBusy('Claude lit l’étiquette…');
 try{const r=await sample.json('Photo d’une étiquette alimentaire (tableau de valeurs nutritionnelles, emballage). Lis les valeurs POUR 100 g (ou 100 ml). Réponds uniquement avec un objet JSON : {"nom": string ou null (nom du produit et marque si visibles, en français), "kcal": number, "proteines": number, "glucides": number, "lipides": number, "portion_g": number ou null (portion indiquée sur le paquet)}. Mets null si une valeur est illisible. N’invente rien.',{images:file,modelTier:'default'});
  const num=v=>typeof v==='number'&&isFinite(v)?Math.round(v*10)/10:(isFinite(parseNum(v))?parseNum(v):'');
  newFoodSheet({...pre,src:'claude',n:r?.nom||pre.n||'',k100:num(r?.kcal),p100:num(r?.proteines),g100:num(r?.glucides),l100:num(r?.lipides),q:num(r?.portion_g)||pre.q||100})}
 catch(e){newFoodSheet(pre);const m={not_granted:'Accès à Claude refusé : saisis les valeurs à la main.',image_rejected:'Photo illisible. Réessaie plus près, bien éclairé.',rate_limited:'Trop de demandes pour le moment. Saisis les valeurs ou réessaie plus tard.'}[e?.code]||'Lecture impossible. Saisis les valeurs à la main.';toast(m)}}
function newFoodSheetBusy(msg){const box=document.querySelector('.sheet>div');if(box)box.insertAdjacentHTML('afterbegin',`<div class="card row" id="busy" role="status"><span class="spin"></span><span>${msg}</span></div>`)}

/* ================= Profil ================= */
function Prof(){const p=S.prof,X=XP(),T=tierOf(X.lvl),c=CTX(),got=BADGES.filter(b=>S.badges?.[b.id]);
 const num=(k,l,r,st=1)=>`<label for="pf_${k}">${l}<input id="pf_${k}" data-c="prof" data-k="${k}" type="number" inputmode="decimal" min="${r[0]}" max="${r[1]}" step="${st}" value="${p[k]}"></label>`;
 const syncTxt={cloud:['okc','Enregistré dans ton compte'],envoi:['mut','Envoi en cours…'],chargement:['mut','Lecture de ton compte…'],erreur:['warnc','Échec de l’envoi, gardé sur cet appareil'],local:['mut','Sur cet appareil uniquement']}[dbDoc?sync:'local'];
 return `<h1>Profil</h1>
 <section class="hero" style="gap:14px"><div class="row" style="gap:14px">${levelRing(X,72)}<div class="col" style="gap:2px"><span class="eyebrow" style="color:${T[3]}">${T[2]}</span><b style="font:italic 800 30px/1 var(--fd);text-transform:uppercase">${T[1]}</b><span class="sm mut">Niveau ${X.lvl} · ${nf(X.xp)} XP</span></div></div>
  <div class="xpbar" aria-hidden="true"><i style="width:${Math.round(X.frac*100)}%;background:${T[3]}"></i></div><span class="xs mut" style="margin-top:-6px">Encore ${nf(X.next-X.xp)} XP pour le niveau ${X.lvl+1}</span>
  <div class="row" style="gap:6px">${TIERS.map(t=>`<div class="col g4" style="flex:1;align-items:center;opacity:${X.lvl>=t[0]?1:.4}"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="${t[3]}"/><circle cx="15" cy="15" r="3.5" fill="#0B0C0D"/></svg><span class="xs" style="color:${t===T?t[3]:'var(--mut)'}">${t[1]}</span><span class="xs dim">niv. ${t[0]}</span></div>`).join('')}</div>
  <span class="xs mut">Par séance validée : 40 XP, + 1 XP par 100 kg soulevés, + 60 par exercice en record, + 100 pour la séance qui atteint l’objectif de la semaine.</span></section>
 <section class="col"><div class="row sb"><h2 class="lbl">Trophées</h2><span class="sm b ${got.length?'':'mut'}" style="color:var(--p15)">${got.length} / ${BADGES.length}</span></div>
 <div class="card"><div class="bgrid">${BADGES.map(b=>{const on=!!S.badges?.[b.id],pr=badgeProg(b,c);return `<button class="bdg ${on?'on':''}" data-a="badge" data-v="${b.id}" aria-label="${esc(b.n)}${on?' (obtenu)':''}">${badgeSvg(b,on,52)}<span>${esc(b.n)}</span>${!on&&b.goal>1&&!['bench','squat','dead'].includes(b.k)?`<i style="display:block;width:70%;height:3px;border-radius:2px;background:#2A2E31" aria-hidden="true"><i style="display:block;height:3px;border-radius:2px;background:var(--ac);width:${Math.min(100,pr.cur/b.goal*100)}%"></i></i>`:''}</button>`}).join('')}</div></div></section>
 <section class="col"><h2 class="lbl">Toi</h2>
 <label for="pf_name">Prénom<input id="pf_name" data-c="pname2" maxlength="30" value="${esc(p.name)}" placeholder="Facultatif" autocomplete="given-name"></label>
 <div class="chips" style="grid-template-columns:1fr 1fr" role="group" aria-label="Sexe (pour le calcul des calories)">${[['h','Homme'],['f','Femme']].map(([k,l])=>`<button class="chip ${p.sex===k?'on':''}" aria-pressed="${p.sex===k}" style="font-size:15px" data-a="sex" data-v="${k}">${l}</button>`).join('')}</div>
 <div class="g2">${num('a','Âge',LIM.a)}${num('h','Taille (cm)',LIM.h)}</div><p id="proferr" class="sm redc" role="alert" style="margin:0" hidden></p>
 <button class="card row sb" style="width:100%;text-align:left" data-a="gopoids"><span class="col" style="gap:2px"><span>Poids</span><span class="xs mut">Mis à jour par tes pesées (onglet Corps)</span></span><span class="row" style="gap:4px"><b>${fmt(wNow())} kg</b>${ic('chev',14)}</span></button></section>
 <section class="col"><h2 class="lbl">Entraînement</h2>
 <div class="g2"><label for="pf_rest">Repos par défaut<select id="pf_rest" data-c="prof" data-k="rest">${[45,60,90,120,150,180].map(n=>`<option value="${n}" ${p.rest==n?'selected':''}>${mmss(n)}</option>`).join('')}</select></label>
 <label for="pf_bar">Barre (exercices à la barre)<select id="pf_bar" data-c="prof" data-k="bar">${[20,15,10].map(n=>`<option value="${n}" ${(p.bar||20)==n?'selected':''}>${n} kg</option>`).join('')}</select></label>
 <label for="pf_step">Pas de charge par défaut<select id="pf_step" data-c="prof" data-k="step">${[1,1.25,2.5,5].map(n=>`<option value="${n}" ${p.step==n?'selected':''}>${fmt2(n)} kg</option>`).join('')}</select></label></div>
 <div class="card col g6"><span class="col" style="gap:2px"><span>Bip à la fin du repos</span><span class="xs mut">Seulement quand l’appli est ouverte à l’écran. Pas de son ni de minuteur sur l’écran verrouillé de l’iPhone.</span></span><div class="seg" role="group" aria-label="Bip" style="align-self:flex-start;min-width:160px"><button class="${p.sound?'on':''}" aria-pressed="${!!p.sound}" data-a="sound" data-v="1">Oui</button><button class="${p.sound?'':'on'}" aria-pressed="${!p.sound}" data-a="sound" data-v="0">Non</button></div></div>
 <button class="card row sb" style="width:100%;text-align:left" data-a="gotoprogs"><span class="col" style="gap:2px"><span>Programme</span><span class="xs mut">${p.sess} séances par semaine</span></span><span class="row" style="gap:4px"><b>${esc(S.pn)}</b>${ic('chev',14)}</span></button></section>
 <section class="col"><h2 class="lbl">Nutrition</h2>
 <button class="card row sb" style="width:100%;text-align:left" data-a="goalsheet"><span class="col" style="gap:2px"><span>Objectif</span><span class="xs mut">${({seche:'Sèche',maintien:'Maintien',masse:'Prise de masse'})[p.goal]} · ${ACT[p.act]?.[0]||''}</span></span><span class="row" style="gap:4px"><b>${nf(goals().k)} kcal</b>${ic('chev',14)}</span></button>
 <label for="pf_water">Objectif d’eau par jour<select id="pf_water" data-c="prof" data-k="water">${[1.5,2,2.5,3,3.5].map(n=>`<option value="${n}" ${p.water==n?'selected':''}>${fmt(n)} L</option>`).join('')}</select></label></section>
 <section class="col"><h2 class="lbl">Données</h2>
 <div class="card col g4 sm"><div class="kv"><span>Compte (Claude)</span><span class="${syncTxt[0]}">${syncTxt[1]}</span></div>
 <div class="kv"><span>Cet appareil</span><span class="${localErr?'warnc':'okc'}">${localErr?'Erreur : '+localErr:'Enregistré'+(lastSaved?' à '+hm(lastSaved):'')}</span></div>
 <div class="kv"><span class="mut">Contenu</span><span>${pl(doneSess().length,'séance')} · ${pl(S.logs.length,'série')} · ${pl(S.food.length,'aliment')} · ${pl(S.bw.length,'pesée')}</span></div>
 <div class="kv"><span class="mut">Produits scannés</span><span>${S.myfoods.length}</span></div></div>
 <div class="card sm col g4"><b>Les photos ne sont pas dans l’export JSON</b><span class="mut">Elles restent sur cet appareil. Sauvegarde-les à part (onglet Corps → Photos).</span></div>
 <div class="row">${dl||!window.claude?'<button class="btn2 grow" data-a="export">Exporter (JSON)</button>':''}<button class="btn2 grow" data-a="import">Importer</button></div>
 ${view.imp?`<div class="card col hl"><span>Remplacer tes données par cette sauvegarde (${pl(view.imp.sess.filter(s=>s.state==='done').length,'séance')}, ${pl(view.imp.logs.length,'série')}) ? Une copie de secours des données actuelles est faite avant.</span><div class="row"><button class="btn2 grow" data-a="noimp">Annuler</button><button class="btn2 grow acb" data-a="doimp">Remplacer</button></div></div>`:''}
 <details class="fold" ${view.bakopen?'open':''}><summary data-a="baks">Copies de secours</summary>${view.baks?view.baks.length?view.baks.map(b=>`<div class="hist"><span class="grow sm">${new Date(b.at).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}<br><span class="xs mut">${esc(b.why)}</span></span><button class="btn2" data-a="restorebak" data-v="${b.at}">Restaurer</button></div>`).join(''):'<p class="sm mut">Aucune copie pour l’instant. Une copie est faite avant chaque mise à jour, import ou effacement.</p>':'<p class="sm mut">Chargement…</p>'}</details>
 ${view.confirm?`<div class="card col"><span>Effacer toutes les séries, repas, mesures et réglages ? Une copie de secours est faite avant. Les photos restent sur l’appareil.</span><div class="row"><button class="btn2 grow" data-a="nores">Annuler</button><button class="btn2 grow danger" data-a="reset">Tout effacer</button></div></div>`:'<button class="btn2" data-a="askreset">Effacer mes données</button>'}
 <button class="link mutl" style="align-self:center" data-a="replay">Revoir l’écran d’accueil</button>
 <p class="xs dim" style="margin:0;text-align:center">Charge · V${APPV}</p></section>`}

/* ================= first launch ================= */
function Onboard(){const s=view.ob||0,p=S.prof;
 const dots=`<div class="row" style="gap:6px" role="img" aria-label="Étape ${s} sur 3">${[1,2,3].map(i=>`<i style="flex:1;height:4px;border-radius:2px;background:${i<=s?'#3D9BFF':'#2A2D2D'}"></i>`).join('')}</div>`;
 const nextB=(l='Continuer')=>`<div class="row" style="margin-top:auto">${s>0?`<button class="x" data-a="ob" data-v="${s-1}" aria-label="Retour">${ic('back',20)}</button>`:''}<button class="btn grow" data-a="ob" data-v="${s+1}">${l}</button></div>`;
 if(s===0)return `<div class="ob"><span class="num" style="font-size:22px;letter-spacing:3px">CHARGE</span>
  <svg viewBox="0 0 340 190" width="100%" aria-hidden="true" style="max-width:420px">
   <rect x="0" y="88" width="340" height="14" rx="4" fill="#3A3F43"/><rect x="96" y="80" width="16" height="30" rx="3" fill="#6E757A"/>
   ${[['#E5383B',180,30],['#3D9BFF',164,28],['#F2C230',144,24],['#2FB86E',118,20],['#E9E8E3',86,16]].map(([c,h,w],i,a)=>{const x=116+a.slice(0,i).reduce((t,q)=>t+q[2]+4,0);return `<rect x="${x}" y="${95-h/2}" width="${w}" height="${h}" rx="5" fill="${c}"/>`}).join('')}
   <rect x="254" y="80" width="14" height="30" rx="3" fill="#6E757A"/>
   <text x="272" y="66" font-family="Barlow Condensed, Impact, sans-serif" font-style="italic" font-weight="800" font-size="34" fill="#F4F3EF">+2,5</text></svg>
  <h1>Chaque kilo<br>compte.</h1><p class="mut" style="margin:0;font-size:17px;max-width:34ch">Note ta charge sur chaque machine, suis ta progression, mange en fonction de ton objectif.</p>
  <button class="btn" style="margin-top:auto" data-a="ob" data-v="1">Commencer</button>${S.logs.length?'<button class="link mutl" style="align-self:center" data-a="obdone">Passer</button>':''}</div>`;
 if(s===1)return `<div class="ob">${dots}<h1 class="md">Faisons connaissance</h1><p class="mut" style="margin:0">Ces infos servent à estimer tes besoins caloriques.</p>
  <label for="ob_name">Prénom<input id="ob_name" data-c="pname2" maxlength="30" value="${esc(p.name)}" placeholder="Facultatif" autocomplete="given-name"></label>
  <div class="chips" style="grid-template-columns:1fr 1fr" role="group" aria-label="Sexe">${[['h','Homme'],['f','Femme']].map(([k,l])=>`<button class="chip ${p.sex===k?'on':''}" aria-pressed="${p.sex===k}" style="font-size:15px" data-a="sex" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="g3"><label for="ob_a">Âge<input id="ob_a" data-c="prof" data-k="a" type="number" inputmode="numeric" min="14" max="99" value="${p.a}"></label><label for="ob_h">Taille (cm)<input id="ob_h" data-c="prof" data-k="h" type="number" inputmode="numeric" min="120" max="230" value="${p.h}"></label><label for="ob_w">Poids (kg)<input id="ob_w" data-c="obw" type="number" inputmode="decimal" min="25" max="350" step="0.1" value="${fmt(wNow()).replace(',','.')}"></label></div>
  <p id="proferr" class="sm redc" role="alert" style="margin:0" hidden></p>${nextB()}</div>`;
 if(s===2){const g=goals();return `<div class="ob">${dots}<h1 class="md">Ton objectif</h1>
  <div class="col">${[['masse','Prendre du muscle','+300 kcal au-dessus de tes besoins'],['maintien','Garder mon poids','Recomposition, performance'],['seche','Sécher','−400 kcal, protéines hautes']].map(([k,l,d])=>`<button class="item ${p.goal===k?'on':''}" style="min-height:64px" aria-pressed="${p.goal===k}" data-a="goal" data-v="${k}"><div class="grow"><div class="t">${l}</div><div class="sm mut">${d}</div></div>${p.goal===k?ic('check'):''}</button>`).join('')}</div>
  <div class="col"><span class="lbl">Activité en dehors de la salle</span><div class="chips" role="group" aria-label="Activité" style="grid-template-columns:repeat(2,1fr)">${Object.entries(ACT).map(([k,[l]])=>`<button class="chip ${p.act===k?'on':''}" aria-pressed="${p.act===k}" style="font-size:15px" data-a="act" data-v="${k}">${l}</button>`).join('')}</div></div>
  <div class="col"><span class="lbl">Séances par semaine</span><div class="chips" role="group" aria-label="Séances par semaine" style="grid-template-columns:repeat(5,1fr)">${[2,3,4,5,6].map(n=>`<button class="chip ${p.sess==n?'on':''}" aria-pressed="${p.sess==n}" data-a="wsess" data-v="${n}">${n}</button>`).join('')}</div></div>
  <div class="card row sb"><span class="mut">Estimation de départ</span><span><b class="num" style="font-size:28px">${nf(g.k)}</b> kcal · ${g.p} g prot.</span></div>${nextB()}</div>`}
 const rec=p.sess<=3?'fb':p.sess===4?'hb':'ppl',ch=view.obt||(S.logs.length?'keep':rec);
 return `<div class="ob">${dots}<h1 class="md">Ton programme</h1><p class="mut" style="margin:0">Tu pourras tout modifier ensuite : exercices, séries, fourchettes de répétitions, repos.</p>
  <div class="col">${S.logs.length?`<button class="item ${ch==='keep'?'on':''}" style="min-height:64px" aria-pressed="${ch==='keep'}" data-a="obt" data-v="keep"><div class="grow"><div class="t">Garder mon programme</div><div class="sm mut">${esc(S.pn)} · ${S.progs.map(x=>esc(x.n)).join(', ')}</div></div>${ch==='keep'?ic('check'):''}</button>`:''}
  ${Object.entries(TPL).map(([k,t])=>`<button class="item ${ch===k?'on':''}" style="min-height:64px" aria-pressed="${ch===k}" data-a="obt" data-v="${k}"><div class="grow"><div class="t">${t.n} ${k===rec?'<span class="tag">Conseillé</span>':''}</div><div class="sm mut">${t.lvl} · ${t.info}</div></div>${ch===k?ic('check'):''}</button>`).join('')}</div>
  <div class="row" style="margin-top:auto"><button class="x" data-a="ob" data-v="2" aria-label="Retour">${ic('back',20)}</button><button class="btn grow" data-a="obdone">C’est parti</button></div></div>`}

/* ================= coach (Claude) ================= */
let coachCtl=null;
async function runCoach(){const ym=view.ym||today().slice(0,7),st=monthStats(ym);coachCtl=new AbortController();view.coach={busy:1};render();
 const days=st.D.map(s=>{const by={};sWork(s.id).forEach(l=>(by[exo(l.e).n]=by[exo(l.e).n]||[]).push(setTxt(l).replace(/ kg × /,'x')+(l.f==='hard'?'!':l.f==='easy'?'+':'')));
  return `${key(s.start)} ${hm(s.start)} ${sessName(s)}${s.mood?' humeur:'+s.mood:''}${s.note?' note:"'+s.note.slice(0,80)+'"':''}\n`+Object.entries(by).map(([n,a])=>'  '+n+': '+a.join(' ')).join('\n')}).join('\n');
 const tr=trend(),g=goals(),nut=[...Array(7)].map((_,i)=>nutDay(addDays(today(),-i))).filter(n=>n.k>0);
 const prompt=`Tu es un coach de musculation francophone, direct et précis. Voici le mois de ${MONTHS[+ym.slice(5)-1]} d’un pratiquant (${S.prof.sex==='f'?'femme':'homme'}, ${S.prof.a} ans, ${fmt(wNow())} kg, objectif ${S.prof.goal}, ${S.prof.sess} séances/semaine prévues, programme « ${S.pn} »).
Séances (charge kg x reps ; + = facile, ! = échec ; PDC = poids du corps) :
${days.slice(0,9000)}
Tendance du poids : ${tr==null?'inconnue':fmt2(tr)+' kg/semaine'}. Objectif calorique ${g.k} kcal, protéines ${g.p} g. Moyenne 7 derniers jours saisis : ${nut.length?Math.round(nut.reduce((s,n)=>s+n.k,0)/nut.length)+' kcal, '+Math.round(nut.reduce((s,n)=>s+n.p,0)/nut.length)+' g prot.':'non renseignée'}.
Donne 3 à 5 conseils concrets et chiffrés, en t’appuyant sur les données (régularité, progression des charges, stagnations, équilibre des muscles, récupération, nutrition). Une ligne par conseil, qui commence par « – ». Pas de titre, pas de markdown, pas de formule de politesse. Si les données sont trop maigres, dis-le en une ligne et donne quand même 2 conseils.`;
 try{const r=await sample(prompt,{signal:coachCtl.signal,cache:false,onText:({text})=>{view.coach={busy:1,text};if(tab==='prog'&&!view.page&&!$('#ov').innerHTML)render()}});view.coach={text:r.text}}
 catch(e){view.coach={text:e?.text||'',err:e?.code==='cancelled'?'':({not_granted:'Accès à Claude refusé pour cette page.',rate_limited:'Trop de demandes pour le moment, réessaie plus tard.'}[e?.code]||'L’analyse a échoué. Réessaie.')}}
 coachCtl=null;if(tab==='prog')render()}
</script>
