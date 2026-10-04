<script>
/* colour helpers (classes in 1d-style-ecrans.html): one class .sc-<name> sets the colour, the components derive tints from it */
const SC_FAM=['push','pull','legs','glute','core'];
const scG=id=>{try{return grp(id)}catch(e){return 'core'}};
const scIco=(c,icon,sz=20,cls='')=>`<span class="sc-ico sc-${c} ${cls}" aria-hidden="true">${ic(icon,sz)}</span>`;
const scFamTag=g=>`<span class="sc-tag sc-${g}">${GRPN[g]}</span>`;
/* top bar of a sub-page: back + the parent's name, always the same; counts and dates go in .sc-sub under the h1 */
const scTop=(label,a)=>`<div class="row sc-top">${back(a)}<span class="sm mut">${label}</span></div>`;
/* dates never split between day and month; French "de" elides before a vowel (d’octobre) */
const scD=d=>dShort(d).replace(/ /g,'\u00a0');
const deM=m=>/^[aeiouyhâàéèêîôû]/i.test(m)?'d’'+m:'de '+m;
/* hyphenated words stay on one line (vis-à-vis) */
const scSet=l=>`<span class="sc-nw">${esc(setTxt2(l))}</span>`;
const scNW=t=>t.replace(/(\S+-\S+)/g,'<span class="sc-nw">$1</span>');
/* families of a session's work sets, most trained first */
function scSessFams(s){const n={};sWork(s.id).forEach(l=>{const g=scG(l.e);n[g]=(n[g]||0)+1});return Object.keys(n).sort((a,b)=>n[b]-n[a])}
/* ================= charts ================= */
let scLgN=0;
function lineChart(pts,label,fmtX,unit='',col='ac'){if(!pts.length)return '';const vs=pts.map(p=>p[1]),mn=Math.min(...vs),mx=Math.max(...vs),pad=Math.max(1,(mx-mn)*.15),lo=Math.floor(mn-pad),hi=Math.ceil(mx+pad);
 const W=326,H=150,x=i=>pts.length===1?(W+34)/2:44+i*(W-58)/(pts.length-1),y=v=>130-(v-lo)/(hi-lo)*110,gid='scg'+(++scLgN);
 const P=pts.map((p,i)=>x(i)+','+y(p[1])).join(' ');
 return `<figure class="card sc-${col}" style="margin:0;padding:16px 12px 10px"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(label)} : de ${fmt(vs[0])} à ${fmt(vs.at(-1))}${unit}">
  <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--c);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--c);stop-opacity:0"/></linearGradient></defs>
  ${[hi,(hi+lo)/2,lo].map(v=>`<line x1="38" y1="${y(v)}" x2="${W}" y2="${y(v)}" style="stroke:var(--line2)" stroke-dasharray="3 5"/><text x="0" y="${y(v)+4}" style="fill:var(--ink2);font:600 11px var(--f)">${fmt(v)}</text>`).join('')}
  ${pts.length>1?`<polygon points="${x(0)},130 ${P} ${x(pts.length-1)},130" fill="url(#${gid})"/><polyline points="${P}" fill="none" style="stroke:var(--c)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`:''}
  ${pts.map((p,i)=>{const last=i===pts.length-1;return `<circle cx="${x(i)}" cy="${y(p[1])}" r="${last?6:3.5}" style="fill:${last?'var(--c)':'var(--card)'};stroke:${last?'var(--card)':'var(--c)'}" stroke-width="${last?3:2}"/>`}).join('')}</svg>
  <figcaption class="row sb xs mut" style="padding-left:38px"><span>${fmtX(pts[0][0])}</span><span>${pts.length>1?fmtX(pts.at(-1)[0]):''}</span></figcaption></figure>`}

/* ================= Progrès ================= */
function monthStats(ym){const D=doneSess().filter(s=>key(s.start).startsWith(ym)),L=D.flatMap(s=>sWork(s.id));return {D,L,vol:vol(L),recs:new Set(L.filter(isRec).map(l=>l.sid+l.e)).size}}
function monthWeeks(Y,M){const first=new Date(Y,M-1,1),mon=new Date(first);mon.setDate(1-((first.getDay()+6)%7));const out=[];
 for(let d=new Date(mon);d<new Date(Y,M,1);d.setDate(d.getDate()+7)){const k=key(d);out.push({lab:scD(k),n:weekN(k),goal:wkGoal(k),fut:k>today()})}return out}
function monthLifts(ym,st){return [...new Set(st.L.map(l=>l.e))].filter(id=>ltOf(id)==='load'&&uOf(id)==='reps').map(id=>{const before=workOf(id).filter(l=>key(l.t)<ym+'-01'&&ormOk(l)),inM=st.L.filter(l=>l.e===id&&ormOk(l));if(!inM.length)return null;
 const b0=before.length?Math.max(...before.map(l=>orm(l.kg,l.r))):Math.max(...inM.filter(l=>l.sid===inM[0].sid).map(l=>orm(l.kg,l.r)));
 const b1=Math.max(b0,...inM.map(l=>orm(l.kg,l.r)));return {id,b1,d:b1-b0}}).filter(Boolean).sort((a,b)=>b.d-a.d).slice(0,5)}
function Prog(){const pg=view.page;if(pg==='ex')return Machine(view.ex);if(pg==='day')return DayView(view.day);if(pg==='sess')return SessView(view.sid);if(pg==='lib')return Library();if(pg==='records')return Records();if(pg==='month')return Month();if(pg==='trophies')return Trophies();if(pg==='hist')return History();
 const ym=today().slice(0,7),st=monthStats(ym),D=doneSess(),a=active(),used=S.ex.filter(e=>workOf(e.id).length).sort((x,y)=>workOf(y.id).at(-1).t-workOf(x.id).at(-1).t);
 const recent=IDX().L.filter(isRec).slice(-3).reverse(),X=XP();
 if(!D.length&&!a)return `<h1>Progrès</h1><div class="empty"><b style="font-size:17px">Rien à afficher pour l’instant</b>Fais ta première séance : tes charges, tes records et ta courbe de progression apparaîtront ici.<button class="btn2 acb" data-a="tab" data-v="seance">Aller à la séance du jour</button></div>
  <div class="list"><button class="li" data-a="page" data-v="lib">${scIco('legs','seance')}<div class="grow"><div class="t">Bibliothèque d’exercices</div><div class="s">${S.ex.length} exercices expliqués</div></div>${chev}</button></div>`;
 return `<h1>Progrès</h1>
 <div class="tiles">${[['ac','seance','Séances',st.D.length,'en '+MONTHS[+ym.slice(5)-1]],['gold','star','Records',st.recs,'ce mois'],['push','cal','Assiduité',streak(),pl(streak(),'semaine').replace(/^\d+ /,'')+' d’affilée']].map(([c,i,l,v,sub])=>`<div class="tile sc-tile sc-${c}"><span class="sc-tk">${ic(i,18)}${l}</span><span class="num">${v}</span><span class="xs sc-tl">${sub}</span></div>`).join('')}</div>
 ${recent.length?`<section class="section"><h2 class="lbl">Derniers records</h2><div class="list">${recent.map(l=>`<button class="li sc-th sc-${scG(l.e)}" data-a="exdetail" data-v="${l.e}">${thumb(l.e)}<div class="grow"><div class="t">${esc(exo(l.e).n)}</div><div class="s">${agoTxt(key(l.t))}</div></div><span class="tag rec">${esc(setTxt2(l))}</span></button>`).join('')}</div></section>`:''}
 <section class="section"><div class="shead"><h2 class="lbl">Tes exercices</h2><span class="xs dim"><span class="okc b">+ %</span> depuis le début</span></div><div class="list">${used.slice(0,view.allex?200:8).map(exRow).join('')}</div>${used.length>8&&!view.allex?`<button class="btn2" data-a="allex">Voir les ${used.length} exercices</button>`:''}</section>
 <section class="section"><h2 class="lbl">Historique</h2><div class="list">${[...(a?[a]:[]),...D.slice().reverse()].slice(0,5).map(sessRow).join('')}</div>${D.length>5?'<button class="btn2" data-a="page" data-v="hist">Tout l’historique</button>':''}</section>
 <section class="section"><h2 class="lbl">Plus</h2><div class="list">
  <button class="li" data-a="page" data-v="month">${scIco('ac','cal')}<div class="grow"><div class="t">Bilan du mois</div><div class="s">Séances par semaine, muscles travaillés, image à partager</div></div>${chev}</button>
  <button class="li" data-a="page" data-v="records">${scIco('gold','star')}<div class="grow"><div class="t">Tous les records</div><div class="s">${pl(X.prs,'record')} battu${X.prs>1?'s':''}</div></div>${chev}</button>
  <button class="li" data-a="page" data-v="trophies">${scIco('core','shield')}<div class="grow"><div class="t">Trophées et niveau</div><div class="s">Niveau ${X.lvl}, ${BADGES.filter(b=>S.badges?.[b.id]).length} trophées sur ${BADGES.length}</div></div>${chev}</button>
  <button class="li" data-a="page" data-v="lib">${scIco('legs','seance')}<div class="grow"><div class="t">Bibliothèque d’exercices</div><div class="s">${S.ex.length} exercices expliqués</div></div>${chev}</button></div></section>`}
function History(){const a=active(),SS=[...(a?[a]:[]),...doneSess().slice().reverse()];
 return `${scTop('Progrès')}<h1 class="md">Historique</h1><div class="list">${SS.slice(0,view.more?400:40).map(sessRow).join('')}</div>${!view.more&&SS.length>40?'<button class="btn2" data-a="more">Voir plus</button>':''}`}
function Trophies(){const X=XP(),T=tierOf(X.lvl),c=CTX(),got=BADGES.filter(b=>S.badges?.[b.id]),CH=challenges();
 return `${scTop('Progrès')}<h1 class="md">Trophées et niveau</h1>
 <section class="card col"><div class="row" style="gap:14px">${levelRing(X,64)}<div class="col" style="gap:2px"><b style="font-size:20px">${T[1]}, niveau ${X.lvl}</b><span class="sm mut">${nf(X.xp)} points, encore ${nf(X.next-X.xp)} pour le niveau ${X.lvl+1}</span></div></div>
  <div class="xpbar" aria-hidden="true"><i style="width:${Math.round(X.frac*100)}%"></i></div>
  <span class="xs dim">50 points par séance validée, +30 par exercice en record (3 au plus), +100 quand tu atteins ton objectif de la semaine.</span></section>
 <section class="section"><h2 class="lbl">Défis de la semaine</h2><div class="card col">${CH.map(x=>{const ok=x.cur>=x.goal;return `<div class="col g6"><div class="row sb"><span class="sm ${ok?'okc b':''}">${ok?ic('check',16)+' ':''}${esc(x.n)}</span><span class="xs dim">${fmt(Math.min(x.cur,x.goal))} / ${fmt(x.goal)}</span></div><div class="bar" aria-hidden="true"><i style="width:${Math.min(100,x.cur/x.goal*100)}%;${ok?'background:var(--ok)':''}"></i></div></div>`}).join('')}</div></section>
 <section class="section"><div class="shead"><h2 class="lbl">Trophées</h2><span class="sm b">${got.length} / ${BADGES.length}</span></div>
 <div class="card"><div class="bgrid">${BADGES.map(b=>{const on=!!S.badges?.[b.id],pr=badgeProg(b,c);return `<button class="bdg ${on?'on':''}" data-a="badge" data-v="${b.id}" aria-label="${esc(b.n)}${on?' (obtenu)':''}">${badgeSvg(b,on,52)}${(()=>{const sh=!on&&b.goal>1&&!['bench','squat','dead'].includes(b.k);return `<span class="sc-bp sc-${BADGEC[b.k]||'ac'}" aria-hidden="true"${sh?'':' style="visibility:hidden"'}><i style="width:${sh?Math.min(100,pr.cur/b.goal*100):0}%"></i></span>`})()}<span>${esc(b.n)}</span></button>`}).join('')}</div></div></section>`}
function Month(){
 const now=new Date(),ym=view.ym||today().slice(0,7),[Y,M]=ym.split('-').map(Number);
 const prevYm=key(new Date(Y,M-2,1)).slice(0,7),nextYm=key(new Date(Y,M,1)).slice(0,7),isCur=ym===today().slice(0,7);
 const st=monthStats(ym),pv=monthStats(prevYm),dom=+today().slice(8);
 const pvVol=isCur?vol(pv.L.filter(l=>+key(l.t).slice(8)<=dom)):pv.vol,dv=pvVol?Math.round((st.vol/pvVol-1)*100):null;
 const weeks=monthWeeks(Y,M),goal=S.prof.sess,mxw=Math.max(goal,...weeks.map(w=>w.n),1),target=Math.round(goal*new Date(Y,M,0).getDate()/7);
 const lifts=monthLifts(ym,st);
 const wkv={};IDX().L.filter(l=>!l.w&&Date.now()-l.t<7*864e5).forEach(l=>exo(l.e).m.forEach((m,i)=>wkv[m]=(wkv[m]||0)+(i?.5:1)));
 const vmax=25,volRows=Object.keys(MUS).sort((a,b)=>SC_FAM.indexOf(grpOfM(a))-SC_FAM.indexOf(grpOfM(b))).map(m=>{const v=wkv[m]||0,cl=v>20?'hi':v>=10?'ok':'';
  return `<div class="vol sc-${grpOfM(m)}"><span><i class="sc-dot" aria-hidden="true"></i>${m}</span><div class="vtrack" role="img" aria-label="${m} : ${fmt(v)} séries sur 7 jours"><span class="zone" style="left:${10/vmax*100}%;width:${10/vmax*100}%"></span><i class="${cl}" style="width:${Math.min(100,v/vmax*100)}%"></i></div><span class="num ${cl==='hi'?'warnc':cl==='ok'?'okc':'dim'}" style="font-size:18px;text-align:right">${fmt(v)}</span></div>`}).join('');
 const a=active(),SS=[...(a?[a]:[]),...doneSess().slice().reverse()],hist=SS.slice(0,view.more?80:8).map(sessRow).join('');
 const used=S.ex.filter(e=>workOf(e.id).length).sort((x,y)=>workOf(y.id).at(-1).t-workOf(x.id).at(-1).t);
 const X=XP(),eq=equiv(X.vol),A=avgGain();
 return `${scTop('Progrès')}<h1 class="md">Bilan du mois</h1>
 <section class="sc-hero"><span class="sc-eb">Total soulevé depuis le début</span><span class="num" style="font-size:54px">${volTxt(X.vol)}</span><span class="sm">${eq?eq+', ':''}${pl(X.sessions,'séance')}, ${pl(X.prs,'record')}</span>
 ${A?`<div class="sc-ha"><span class="num sc-pct">${pctTxt(A.pct)}</span><div class="col" style="gap:2px"><b>de 1RM estimé en moyenne</b><span class="xs">Écart entre ta 1re séance et ton meilleur 1RM estimé (Epley), sur ${pl(A.n,'exercice')} avec charge. La plus forte hausse : ${esc(A.top.e.n)} ${pctTxt(A.top.g.pct)}.</span></div></div>`:''}</section>
 
 <section class="card col"><div class="row sb"><span class="lbl">Assiduité sur 18 semaines</span><span class="sc-tag sc-ok">${pl(streak(),'semaine')} d’affilée</span></div>${heatmap().replace(/fill:var\(--ink\)/g,'fill:var(--ok)')}</section>


 <section class="col"><div class="row sb"><button class="x s" data-a="ym" data-v="${prevYm}" aria-label="Mois précédent">${ic('left',16)}</button><h2 class="lbl">Bilan ${deM(MONTHS[M-1])}${Y!==now.getFullYear()?' '+Y:''}</h2><button class="x s" data-a="ym" data-v="${nextYm}" aria-label="Mois suivant" ${isCur?'disabled':''}>${ic('chev',16)}</button></div>
 <div class="tiles"><div class="tile sc-tile sc-ac"><span class="sc-tk">${ic('seance',18)}Séances</span><span class="num">${st.D.length}<span class="mut" style="font-size:16px"> / ${target}</span></span></div>
 <div class="tile sc-tile sc-push"><span class="sc-tk">${ic('prog',18)}Volume</span><span class="num">${fmt(st.vol/1000)} t</span>${dv!=null?`<span class="xs b" style="color:var(--ctx)">${dv>0?'+':''}${dv} % <span class="mut" style="font-weight:500">vs ${isCur?'même période':MONTHS[(M+10)%12]}</span></span>`:''}</div>
 <div class="tile sc-tile sc-gold"><span class="sc-tk">${ic('star',18)}Records</span><span class="num">${st.recs}</span></div></div>
 <div class="card col sc-wb"><div class="row sb"><span class="sm mut">Séances par semaine</span><span class="sc-tag sc-ok">objectif ${goal}</span></div>
 <div class="wbars" style="grid-template-columns:repeat(${weeks.length},1fr)" role="img" aria-label="Séances par semaine : ${weeks.map(w=>w.n).join(', ')}"><div class="goal" style="bottom:${22+goal/mxw*88}px"></div>
 ${weeks.map(w=>`<div class="wb"><span class="num" style="font-size:16px;${w.fut?'opacity:.3':''}">${w.fut?'':w.n}</span><i class="${w.n>=w.goal?'ok':w.n?'sc-part':''}" style="height:${w.n/mxw*88}px"></i><span class="xs mut" style="white-space:nowrap">${w.lab}</span></div>`).join('')}</div></div>
 ${lifts.length?`<div class="card col g4"><span class="sm mut">1RM estimé (indicatif), évolution du mois</span>${lifts.map(l=>`<div class="kv"><span class="row sc-${scG(l.id)}" style="gap:8px"><i class="sc-dot" aria-hidden="true"></i>${esc(exo(l.id).n)}</span><span><b>${fmt(Math.round(l.b1))} kg</b> <span class="${l.d>0?'okc':'mut'} b">${l.d>0?'+'+fmt(Math.round(l.d)):'±0'}</span></span></div>`).join('')}</div>`:''}
 ${sample&&st.L.length?`<div class="card col"><div class="row sb"><span class="lbl">Avis du coach</span>${view.coach?.busy?'<span class="spin" role="status" aria-label="Analyse en cours"></span>':''}</div>
  ${view.coach?.text?`<div class="coach">${esc(view.coach.text)}</div>`:`<span class="sm mut">Claude lit ton mois (séances, charges, ressentis, poids) et te donne 3 à 5 conseils concrets.</span>`}
  ${view.coach?.err?`<span class="sm warnc">${esc(view.coach.err)}</span>`:''}
  ${view.coach?.busy?'<button class="btn2" data-a="coachstop">Arrêter</button>':`<button class="btn2 acb" data-a="coach">${ic('spark',16)} ${view.coach?.text?'Relancer l’analyse':'Analyser mon mois'}</button>`}</div>`:''}
 ${st.L.length&&(dl||!window.claude)?`<button class="btn2" data-a="png" data-v="${ym}">${ic('camera',16)} Exporter le bilan en image</button>`:''}</section>
 <section class="col"><div class="row sb"><h2 class="lbl">Séries par muscle, 7 jours</h2><span class="xs mut">zone utile 10 à 20</span></div><div class="card col g4 sc-vol">${volRows}</div></section>

 ${(()=>{const G=Object.keys(S.goalsEx||{}).map(id=>({id,g:goalInfo(id)})).filter(x=>x.g&&S.ex.some(e=>e.id===x.id));return G.length?`<section class="col"><h2 class="lbl">Tes objectifs</h2>${G.map(({id,g})=>`<button class="item sc-th sc-${g.done?'ok':scG(id)}" style="min-height:70px" data-a="exdetail" data-v="${id}">${thumb(id)}<div class="grow col" style="gap:6px"><div class="row sb"><b>${esc(exo(id).n)}</b><span class="num ${g.done?'okc':''}" style="font-size:20px">${fmt(g.kg)} kg</span></div><div class="xpbar sc-bar" style="height:6px" aria-hidden="true"><i style="width:${Math.round(g.pct*100)}%"></i></div><span class="xs mut">${g.done?'Atteint le '+scD(g.done)+', fixe la suite':Math.round(g.pct*100)+' %'+(g.eta?', vers le '+scD(g.eta):'')}</span></div></button>`).join('')}</section>`:''})()}
 `}
function sessRow(s){const L=sWork(s.id),live=s.state==='active',d=new Date(s.start),F=scSessFams(s);
 return `<button class="li" data-a="sess" data-v="${s.id}"><span class="sc-date sc-${live?'ac':F[0]||'ac'}" aria-hidden="true"><b>${d.getDate()}</b><span>${d.toLocaleDateString('fr-FR',{month:'short'}).replace('.','')}</span></span><div class="grow"><div class="t">${esc(sessName(s))}${live?' <span class="tag">en cours</span>':''}${F.length?`<span class="sc-dots" aria-hidden="true">${F.map(g=>`<i class="sc-${g}"></i>`).join('')}</span>`:''}</div><div class="s">${cap(d.toLocaleDateString('fr-FR',{weekday:'long'}))}, ${pl(L.length,'série')}${sessMins(s)?', '+sessMins(s)+' min':''}</div></div>${chev}</button>`}
function exRow(e){const B=bestSet(e.id),big=bigOf(e.id,B),g=gainOf(e.id),f=scG(e.id);
 return `<button class="li sc-th sc-${f}" data-a="exdetail" data-v="${e.id}">${thumb(e.id)}<div class="grow"><div class="t">${esc(e.n)}</div><div class="s row sc-exs">${scFamTag(f)}${g&&g.pct>0?`<span class="sc-gain okc b" title="depuis le début">${pctTxt(g.pct)}</span>`:`<span class="sc-gain">${pl(workOf(e.id).length,'série')}</span>`}</div></div><div style="text-align:right"><span class="num sc-n">${big.n}</span><span class="xs dim"> ${big.u}</span><div class="xs dim">record</div></div></button>`}
/* one session: every set can be corrected, deleted or added, even weeks later */
function SessView(sid){const s=sessById(sid);if(!s){view={};return Prog()}const L=sLogs(sid),by={};L.forEach(l=>(by[l.e]=by[l.e]||[]).push(l));const W=L.filter(l=>!l.w),live=s.state==='active';
 return `${scTop('Progrès')}
 <div class="col sc-ht"><h1 class="md">${esc(sessName(s))}</h1><span class="sc-sub">${cap(dLong(key(s.start)))}, ${hm(s.start)}</span></div>
 ${live?`<div class="card hl row sb"><span class="sm">Séance en cours</span><button class="btn2 acb" data-a="tab" data-v="seance">Reprendre</button></div>`:''}
 <div class="tiles"><div class="tile sc-tile sc-push"><span class="sc-tk">${ic('prog',18)}Volume</span><span class="num" style="font-size:22px">${volTxt(vol(W))}</span></div>
 <div class="tile sc-tile sc-ac"><span class="sc-tk">${ic('seance',18)}Séries</span><span class="num" style="font-size:22px">${W.length}</span></div><div class="tile sc-tile sc-core"><span class="sc-tk">${ic('clock',18)}Durée</span><span class="num" style="font-size:22px">${sessMins(s)} min</span></div></div>
 ${!W.length&&!live?'<div class="card warn sm">Aucune série de travail : cette séance ne compte pas (ni XP, ni assiduité).</div>':''}
 ${Object.entries(by).map(([id,LL])=>`<section class="card sc-th sc-${scG(id)}" style="padding:6px 16px"><button class="row sb link" style="width:100%;font-size:15px;text-decoration:none;color:var(--ink)" data-a="exdetail" data-v="${id}"><span class="row" style="gap:10px">${thumb(id)}<span class="col" style="gap:2px"><b>${esc(exo(id).n)}</b>${scFamTag(scG(id))}</span></span>${ic('chev',16)}</button>
  ${LL.map(l=>`<button class="hist" data-a="editlog" data-v="${l.id}" aria-label="Corriger ${esc(setTxt2(l))}"><span class="grow">${l.w?'<span class="tag grey">éch.</span> ':''}${esc(setTxt2(l))}${isRec(l)?' <span class="tag rec">record</span>':''}</span><span class="sm mut">${l.w?'':FEEL[l.f]?.toLowerCase()||''}</span>${ic('edit',16)}</button>`).join('')}
  <button class="link" data-a="addlog" data-v="${sid}|${id}">${ic('plus',14)} Ajouter une série</button></section>`).join('')}
 <button class="btn2" data-a="pickex" data-v="sess:${sid}">${ic('plus',16)} Ajouter un exercice à cette séance</button>
 ${live?'':`<section class="col"><label for="snote">Note<input id="snote" data-c="snote" data-v="${sid}" maxlength="200" value="${esc(s.note||'')}" placeholder="Ex. épaule un peu raide"></label>
 <div class="chips" role="group" aria-label="Ressenti de la séance" style="grid-template-columns:repeat(4,1fr)">${MOODS.map(([k,l])=>`<button class="chip ${s.mood===k?'on':''}" aria-pressed="${s.mood===k}" style="font-size:14px" data-a="smood" data-v="${sid}|${k}">${l}</button>`).join('')}</div></section>`}
 ${view.delsess===sid?`<div class="card col"><span>Supprimer cette séance et ses ${pl(L.length,'série')} ? Records, XP et trophées seront recalculés.</span><div class="row"><button class="btn2 grow" data-a="delsess" data-v="no">Annuler</button><button class="btn2 grow danger" data-a="delsess" data-v="${sid}">Supprimer</button></div></div>`
 :`<button class="link" style="align-self:flex-start;color:var(--red)" data-a="delsess" data-v="ask:${sid}">Supprimer cette séance</button>`}`}
function DayView(d){const D=sessOfDay(d);
 return `${scTop('Progrès')}
 <div class="col sc-ht"><h1 class="md">${D.length>1?pl(D.length,'séance'):D.length?esc(sessName(D[0])):'Aucune séance'}</h1><span class="sc-sub">${d===today()?'Aujourd’hui':cap(dLong(d))}</span></div>
 ${D.length?`<div class="list">${D.map(sessRow).join('')}</div>`:''}${D.length?'':`<div class="empty">Rien n’est noté ce jour-là.${d<today()?'<span class="sm">Tu as oublié de noter une séance ? Ajoute-la après coup.</span>':''}</div>`}
 ${d<today()?`<button class="btn2 acb" data-a="newsessday" data-v="${d}">${ic('plus',16)} Ajouter une séance ce jour-là</button>`:''}`}

function Machine(id){const f=scG(id),e=exo(id),L=workOf(id),u=uOf(id),lt=ltOf(id),isLoad=lt==='load'&&u==='reps',rg=view.rg||'3m',mode=view.mode||(isLoad?'kg':'r');
 const from={'1m':31,'3m':92,'1a':365}[rg],fromT=from?Date.now()-from*864e5:0;
 const byS={};L.filter(l=>l.t>=fromT).forEach(l=>{const k=l.sid,o=byS[k]||(byS[k]={d:key(l.t),v:0});
  if(mode==='vol')o.v+=setVol(l);else if(mode==='1rm'){if(ormOk(l))o.v=Math.max(o.v,orm(l.kg,l.r))}else if(mode==='r')o.v=Math.max(o.v,l.r);else o.v=Math.max(o.v,l.kg)});
 const pts=Object.values(byS).filter(o=>o.v>0).map(o=>[o.d,o.v]);
 const chart=pts.length?lineChart(pts,{kg:'Charge max par séance',['1rm']:'1RM estimé par séance',vol:'Volume par séance',r:UL[u][1]+' (meilleure série) par séance'}[mode],scD,mode==='r'?' '+UL[u][0]:' kg',f):'<div class="empty">Valide une série pour voir ta courbe.</div>';
 const sids=[...new Set(L.map(l=>l.sid))].reverse().slice(0,10);
 const B=bestSet(id),Rc=bestSet(id,Date.now()-28*864e5),lib=libOf(id),fid=figId(id),isM=['machine','poulie'].includes(e.k);
 const modes=isLoad?[['kg','Charge max'],['1rm','1RM estimé'],['vol','Volume']]:[['r',UL[u][1]],...(lt!=='assist'?[['kg',lt==='bw'?'Lest':'Charge']]:[])];
 return `<div class="sc-ex sc-${f}" style="display:contents">${scTop(({lib:'Bibliothèque',sess:'Séance',seance:'Accueil',nut:'Nutrition',prof:'Moi'})[view.from]||'Progrès')}
 <div class="sc-exh"><div class="row sb" style="gap:8px">${scFamTag(f)}${B?`<span class="sc-tag sc-gold">${ic('star',14)} ${esc(setTxt2(B))}</span>`:''}</div><h1 class="md">${esc(e.n)}</h1><div class="row wrap" style="gap:6px">${e.m.map((m,i)=>`<span class="pill ${i?'':'b'}">${cap(m)}${i?'':', principal'}</span>`).join('')}${KINDS[e.k]?`<span class="pill sc-kind">${KINDS[e.k]}</span>`:''}</div></div>
 ${fid?`<div class="demo" id="demo"></div>
 <div class="row sb"><div class="legend"><span><i style="background:${COL.mus}"></i>muscles</span><span><i style="border:2px solid ${COL.ac}"></i>appuis</span><span>→ effort</span></div>
 <button class="btn2" style="min-height:40px" data-a="demopause" aria-pressed="${!!view.demoPause}">${view.demoPause?'Animer':'Pause'}</button></div>`:''}
 ${lib?.q?`<details class="fold"><summary>Bien faire le mouvement</summary><ol class="cues">${lib.q.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details>`:`<p class="sm mut" style="margin:0">Exercice créé par toi : l’illustration montre un mouvement proche qui travaille le même muscle.</p>`}
 <div class="row"><button class="btn grow" data-a="trainex" data-v="${id}">${ic('plus',20)} Faire cet exercice</button><button class="btn2" style="min-height:56px" data-a="addto" data-v="${id}" aria-label="Ajouter ${esc(e.n)} à une séance">${ic('plus',16)} Séance</button></div>
 <section class="col"><h2 class="lbl">Ta progression</h2>
 ${L.length?`<div class="tiles t2 sc-t2"><div class="tile sc-tile sc-gold"><span class="sc-tk">${ic('star',18)}Record historique</span><span class="num sc-tv">${B?esc(setTxt2(B)):'—'}</span><span class="xs mut">${B?scD(key(B.t)):''}</span></div>
 <div class="tile sc-tile sc-${f}"><span class="sc-tk">${ic('prog',18)}Récent (4 sem.)</span><span class="num sc-tv">${Rc?esc(setTxt2(Rc)):'—'}</span><span class="xs mut">${Rc?scD(key(Rc.t)):'pas de série récente'}</span></div></div>
 ${(()=>{const g=gainOf(id);return g?`<div class="card col g4"><div class="row" style="gap:12px"><span class="num ${g.pct>0?'okc':'mut'}" style="font-size:40px">${pctTxt(g.pct)}</span><b>${esc(g.what)}</b></div><span class="xs mut">${isLoad?`1RM estimé (formule d’Epley, séries de 1 à 12 répétitions) : ${fmt(Math.round(g.from))} kg à ta 1re séance du ${scD(g.since)}, ${fmt(Math.round(g.to))} kg au mieux depuis. C’est une estimation, pas une charge testée.`:`Meilleure série de ta 1re séance (${g.from} ${g.unit}) comparée à la meilleure depuis (${g.to} ${g.unit}).`}</span></div>`:''})()}
 <div class="seg" role="group" aria-label="Période">${[['1m','1 M'],['3m','3 M'],['1a','1 an'],['all','Tout']].map(([k,l])=>`<button class="${rg===k?'on':''}" aria-pressed="${rg===k}" data-a="rg" data-v="${k}">${l}</button>`).join('')}</div>
 <div class="seg" role="group" aria-label="Courbe">${modes.map(([k,l])=>`<button class="${mode===k?'on':''}" aria-pressed="${mode===k}" data-a="mode" data-v="${k}">${l}</button>`).join('')}</div>
 ${chart}
 ${(()=>{const s=strength(id);if(!s)return '';const pos=Math.min(1,Math.max(0,(s.i+(s.th[s.i+1]?(s.r-s.th[Math.max(0,s.i)])/(s.th[s.i+1]-s.th[Math.max(0,s.i)]):.5)*(s.i<0?0:1))/5));
  return `<div class="card col" style="gap:8px"><div class="row sb"><span class="lbl">Repère de force</span><b class="sc-tx">${s.i<0?'En route':STDN[s.i]}</b></div>
  <div class="std" aria-hidden="true"><span class="mk" style="left:calc(${Math.round(pos*100)}% - 1px)"></span>${STDN.map((n,k)=>`<i class="${k<=s.i?'on':''}"></i>`).join('')}${STDN.map(n=>`<span>${n}</span>`).join('')}</div>
  <span class="xs mut">Meilleur 1RM estimé = ${fmt(s.r)} × ton poids du jour.${s.next?` Palier suivant ≈ ${fmt(rnd(s.next,id))} kg.`:''} Repères publics approximatifs.</span></div>`})()}`
 :'<div class="empty">Pas encore de série sur cet exercice. Note la première pour voir ta courbe.</div>'}</section>
 ${isLoad?(()=>{const G=goalInfo(id);if(G)return `<section class="card col" style="gap:10px;${G.done?'border-color:var(--ok)':''}"><div class="row sb"><span class="lbl ${G.done?'okc':''}">${G.done?'Objectif atteint le '+scD(G.done):'Ton objectif'}</span><button class="link mutl" data-a="delgoal" data-v="${id}">Retirer</button></div>
  <div class="row end" style="gap:8px"><span class="num" style="font-size:44px">${fmt(G.kg)}</span><span class="num mut" style="font-size:20px">kg</span><span class="grow"></span><span class="num ${G.done?'okc':''}" style="font-size:28px">${Math.round(G.pct*100)} %</span></div>
  <div class="xpbar ${G.done?'sc-ok':''}" aria-hidden="true"><i style="width:${Math.round(G.pct*100)}%"></i></div>
  <span class="sm mut">${G.done?'Bravo. Fixe-toi la barre suivante.':`Départ ${fmt(G.from)} kg, aujourd’hui ${fmt(G.cur)} kg, encore ${fmt(G.kg-G.cur)} kg. `+(G.eta?`Au rythme des 9 dernières semaines (${G.slope>0?'+':''}${fmt(G.slope)} kg par semaine) : <b>vers le ${scD(G.eta)}</b>, estimation indicative.`:'Pas encore assez de séances récentes pour estimer une date.')}</span>
  ${G.done?`<div class="row"><input id="goalkg" type="number" inputmode="decimal" step="2.5" placeholder="Nouvel objectif (kg)" aria-label="Nouvel objectif en kg" class="grow"><button class="btn2 acb" style="min-height:48px" data-a="setgoal" data-v="${id}">Fixer</button></div>`:''}</section>`;
  const sug=best(id)?rnd(best(id)*1.1+incOf(id),id):null;
  return `<section class="card col" style="gap:10px"><span class="lbl">Fixe-toi un objectif</span><span class="sm mut">Une charge à atteindre. L’appli suit ta progression et estime quand tu y seras.</span>
  <div class="row"><input id="goalkg" type="number" inputmode="decimal" step="2.5" placeholder="${sug?'Ex. '+fmt(sug)+' kg':'Charge visée (kg)'}" aria-label="Objectif en kg" class="grow"><button class="btn2 acb" style="min-height:48px" data-a="setgoal" data-v="${id}">Fixer</button></div></section>`})():''}
 <details class="fold" ${view.exset?'open':''}><summary>Réglages de l’exercice</summary><div class="col">
  ${isM||e.seat?`<label for="seat">Réglage de la machine (siège, dossier…)<input id="seat" data-c="seat" data-v="${id}" maxlength="60" value="${esc(e.seat)}" placeholder="Ex. siège 4, dossier 2"></label>`:''}
  <div class="col g6"><span class="lbl" id="ltl">Charge notée</span><div class="seg sc-segw" role="group" aria-labelledby="ltl">${Object.entries(LTL).map(([k,l])=>`<button class="${lt===k?'on':''}" aria-pressed="${lt===k}" data-a="exlt" data-v="${id}|${k}">${l}</button>`).join('')}</div></div>
  <div class="col g6"><span class="lbl" id="ull">Compté en</span><div class="seg sc-segw" role="group" aria-labelledby="ull">${Object.entries(UL).map(([k,l])=>`<button class="${u===k?'on':''}" aria-pressed="${u===k}" data-a="exu" data-v="${id}|${k}">${l[1]}</button>`).join('')}</div></div>
  <label for="exinc">Pas de progression de la charge<select id="exinc" data-c="exinc" data-v="${id}"><option value="">Par défaut (${fmt2(S.prof.step)} kg)</option>${[.5,1,1.25,2,2.5,4,5,10].map(n=>`<option value="${n}" ${e.inc===n?'selected':''}>${fmt2(n)} kg</option>`).join('')}</select></label>
  ${allWorkOf(id).length?'<span class="xs mut">Les séries déjà notées gardent leur mesure d’origine. Après un changement, courbe, objectif et records repartent des séries notées avec la nouvelle mesure.</span>':''}</div></details>
 ${L.length?`<section><h2 class="lbl" style="margin-bottom:6px">Historique</h2>${sids.map(sid=>{const D=L.filter(l=>l.sid===sid),s=sessById(sid);
  return `<button class="hist" data-a="sess" data-v="${sid}"><span class="sc-d">${scD(key(D[0].t))}</span><span class="grow">${D.map(scSet).join(', ')}</span>${ic('chev',14)}</button>`}).join('')}</section>`:''}
 ${!logsOf(id).length&&!S.progs.some(p=>p.items.some(x=>x.id===id))&&!LIB.some(x=>x.id===id)?`<button class="link" style="color:var(--red)" data-a="delex" data-v="${id}">Supprimer cet exercice</button>`:''}</div>`}

/* ================= records wall ================= */
function Records(){const rows=S.ex.filter(e=>workOf(e.id).length).map(e=>{const L=workOf(e.id),last=L.filter(isRec).at(-1);return {e,b:bestSet(e.id),r:bestSet(e.id,Date.now()-28*864e5),last}}).sort((a,b)=>(b.last?.t||0)-(a.last?.t||0));
 const recent=IDX().L.filter(isRec).slice(-6).reverse();
 return `${scTop('Progrès')}<div class="col sc-ht"><h1 class="md">Mur des records</h1><span class="sc-sub">${pl(XP().prs,'record')} battu${XP().prs>1?'s':''}</span></div>
 <p class="sm mut" style="margin:0">Record historique = ta meilleure série de tous les temps. Perf récente = la meilleure des 4 dernières semaines.</p>
 ${recent.length?`<section class="col"><h2 class="lbl">Derniers records</h2><div class="card sc-goldcard" style="padding:4px 16px">${recent.map(l=>`<button class="hist" data-a="exdetail" data-v="${l.e}">${scIco('gold','star',18)}<span class="grow">${esc(exo(l.e).n)}<br><span class="xs mut">${scD(key(l.t))}</span></span><span class="num sc-nw" style="font-size:20px">${esc(setTxt2(l))}</span></button>`).join('')}</div></section>`:''}
 <section class="col"><h2 class="lbl">Tous tes exercices</h2>${rows.map(x=>{const s=strength(x.e.id),f=scG(x.e.id);return `<button class="item sc-th sc-${f}" style="min-height:76px" data-a="exdetail" data-v="${x.e.id}">${thumb(x.e.id)}<div class="grow col" style="gap:3px"><div class="t">${esc(x.e.n)}</div><div class="sm mut">Record <b class="sc-tx sc-nw">${esc(setTxt2(x.b))}</b></div><div class="xs mut">Battu le ${scD(key(x.b.t))}<br>Récent : ${x.r?scSet(x.r):'aucune série en 4 semaines'}</div>${s?`<span class="sc-tag sc-${f}" style="align-self:flex-start">${STDN[Math.max(0,s.i)]}</span>`:''}</div>${ormOk(x.b)?`<div style="text-align:right"><div class="num sc-cn" style="font-size:26px">${fmt(Math.round(best1(x.e.id)))}</div><span class="xs mut">kg 1RM est.</span></div>`:''}</button>`}).join('')||'<div class="empty">Pas encore de record. Il faut au moins deux séances sur un exercice.</div>'}</section>`}

/* ================= exercise library ================= */
/* filter value: '' = all, 'g:<family>' = a muscle family, otherwise one main muscle */
const scLibFam=m=>m.startsWith('g:')?m.slice(2):m?grpOfM(m):'';
/* accent-insensitive search: 'pates' finds 'Pâtes', 'developpe' finds 'Développé' */
const scFold=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function libCards(){const q=scFold((view.lq||'').trim()),m=view.lm||'';
 const E=S.ex.filter(e=>(q||!m||(m.startsWith('g:')?scG(e.id)===m.slice(2):e.m[0]===m))&&(!q||scFold(e.n).includes(q)||e.m.some(x=>scFold(x).includes(q))));
 if(!E.length)return '<div class="empty" style="grid-column:1/-1">Aucun exercice pour cette recherche.</div>';
 return E.map(e=>{const f=scG(e.id);return `<button class="lcard sc-th sc-${f}" data-a="exdetail" data-v="${e.id}">${thumb(e.id)}<b>${scNW(esc(e.n))}</b><span class="xs"><span class="sc-tx b">${cap(e.m[0])}</span><span class="mut">, ${KINDS[e.k]||''}${best(e.id)?', <span class="sc-nw">'+fmt2(best(e.id))+'\u00a0kg</span>':''}</span></span></button>`}).join('')}
function Library(){const m=view.lm||'',fam=scLibFam(m),cnt=k=>S.ex.filter(e=>e.m[0]===k).length,fcnt=g=>S.ex.filter(e=>scG(e.id)===g).length;
 return `${scTop('Progrès')}<div class="col sc-ht"><h1 class="md">Bibliothèque</h1><span class="sc-sub">${S.ex.length} exercices illustrés</span></div>
 <input id="lq" data-i="lq" type="search" placeholder="Rechercher : curl, presse, dorsaux…" aria-label="Rechercher un exercice" value="${esc(view.lq||'')}" autocomplete="off">
 <div class="sc-fchips" role="group" aria-label="Famille de muscles"><button class="sc-fchip all ${!m?'on':''}" aria-pressed="${!m}" data-a="lm" data-v="">Tous <small>${S.ex.length}</small></button>
 ${SC_FAM.filter(fcnt).map(g=>`<button class="sc-fchip sc-${g} ${fam===g?'on':''}" aria-pressed="${fam===g}" data-a="lm" data-v="g:${g}"><i class="sc-dot" aria-hidden="true"></i>${GRPN[g]}</button>`).join('')}</div>
 ${fam?`<div class="sc-mchips sc-${fam}" role="group" aria-label="Muscle"><button class="${m==='g:'+fam?'on':''}" aria-pressed="${m==='g:'+fam}" data-a="lm" data-v="g:${fam}">Tous</button>${Object.keys(MUS).filter(k=>grpOfM(k)===fam&&cnt(k)).map(k=>`<button class="${m===k?'on':''}" aria-pressed="${m===k}" data-a="lm" data-v="${k}">${cap(k)}</button>`).join('')}</div>`:''}
 <div class="lgrid" id="lgrid">${libCards()}</div>
 <button class="btn2" data-a="pickex" data-v="today">${ic('plus',16)} Créer un exercice</button>`}
function addToSheet(id){const e=exo(id);view.addto=id;
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font-size:26px" id="sheet-title" tabindex="-1">Ajouter à…</h2>${closeBtn}</div><span class="sm mut">${esc(e.n)}</span>
 <div class="col">${S.progs.map(p=>{const inP=p.items.some(x=>x.id===id);return `<button class="item" style="min-height:60px" data-a="addtoprog" data-v="${p.id}" ${inP?'disabled':''}><div class="grow"><div class="t">${esc(p.n)}</div><div class="sm mut">${inP?'Déjà dans cette séance':pl(p.items.length,'exercice')}</div></div>${inP?ic('check'):ic('plus')}</button>`}).join('')}</div>
 <button class="btn2" data-a="addtoday" data-v="${id}">Seulement pour la séance ${active()?'en cours':'du jour'}</button>`,'addto')}

/* ================= monthly report as a PNG (1080 × variable, same look as sessionPNG: PNGC light palette, a canvas cannot read CSS variables) ================= */
async function bilanPNG(ym){const [Y,M]=ym.split('-').map(Number),st=monthStats(ym),goal=S.prof.sess,target=Math.round(goal*new Date(Y,M,0).getDate()/7);
 const weeks=monthWeeks(Y,M),lifts=monthLifts(ym,st),C=PNGC,OK='#15803D',GOLD=['#A15C07','#FFF5E5'];
 try{await Promise.all(['900 120px Archivo','600 30px Archivo','400 30px Archivo'].map(f=>document.fonts.load(f)))}catch(e){}
 const boxH=lifts.length?110+lifts.length*64:160,W=1080,H=Math.max(1350,1076+boxH+150),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),F='Archivo, system-ui, sans-serif';
 const rr=(X0,Y0,w,h,r)=>{x.beginPath();x.roundRect(X0,Y0,w,h,r)};
 const fit=(t,max)=>{if(x.measureText(t).width<=max)return t;while(t.length>1&&x.measureText(t+'…').width>max)t=t.slice(0,-1);return t.trimEnd()+'…'};
 const shrink=(t,wt,fz,min,max)=>{do{x.font=wt+' '+fz+'px '+F;fz-=4}while(fz>min&&x.measureText(t).width>max)};
 x.fillStyle=C.bg;x.fillRect(0,0,W,H);
 /* hero: blue → violet */
 const gr=x.createLinearGradient(48,48,1032,470);gr.addColorStop(0,C.ac);gr.addColorStop(1,C.vi);x.fillStyle=gr;rr(48,48,984,420,48);x.fill();
 x.save();rr(48,48,984,420,48);x.clip();x.fillStyle='rgba(255,255,255,.08)';x.beginPath();x.arc(950,110,210,0,7);x.fill();x.beginPath();x.arc(1010,430,120,0,7);x.fill();x.restore();
 x.fillStyle='#FFFFFF';x.font='800 40px '+F;x.fillText('Charge',104,132);
 x.fillStyle='rgba(255,255,255,.86)';x.font='500 34px '+F;x.fillText(fit(String(Y)+(S.prof.name?', '+S.prof.name:''),860),104,190);
 x.fillStyle=C.gold;rr(104,214,96,10,5);x.fill();
 const title='Bilan '+deM(MONTHS[M-1]);x.fillStyle='#FFFFFF';shrink(title,'900',120,64,872);x.fillText(title,96,340);
 x.fillStyle='rgba(255,255,255,.9)';x.font='600 38px '+F;x.fillText(fit(pl(st.D.length,'séance')+', '+fmt(st.vol/1000)+' t soulevées',872),104,414);
 /* three tiles, each in its own colour */
 [['Séances',st.D.length+' / '+target,C.fam.pull],['Volume',fmt(st.vol/1000)+' t',C.fam.push],['Records',String(st.recs),GOLD]].forEach(([l,val,[cs,cb]],i)=>{const X0=48+i*334;
  x.fillStyle=cb;rr(X0,504,316,176,32);x.fill();x.fillStyle=cs;rr(X0,504,12,176,[32,0,0,32]);x.fill();
  x.fillStyle=cs;x.font='700 30px '+F;x.fillText(l,X0+44,556);x.fillStyle=C.ink;shrink(val,'800',80,40,250);x.fillText(val,X0+44,650)});
 /* sessions per week: blue bars, green when the week's goal is met, goal line labelled at its right end */
 x.fillStyle=C.card;rr(48,712,984,332,32);x.fill();
 x.fillStyle=C.ink2;x.font='700 28px '+F;x.fillText('Séances par semaine',88,764);
 const mx=Math.max(goal,...weeks.map(w=>w.n),1),gap=20,PX=88,PW=904,bw=(PW-(weeks.length-1)*gap)/weeks.length,base=976,hmax=150,gy=base-goal/mx*hmax;
 x.strokeStyle=OK;x.setLineDash([10,10]);x.lineWidth=3;x.beginPath();x.moveTo(PX,gy);x.lineTo(PX+PW,gy);x.stroke();x.setLineDash([]);
 weeks.forEach((w,i)=>{const X0=PX+i*(bw+gap),h=w.n?Math.max(8,w.n/mx*hmax):6;x.fillStyle=w.fut||!w.n?C.line:w.n>=w.goal?OK:C.ac;rr(X0,base-h,bw,h,[12,12,4,4]);x.fill();
  x.textAlign='center';if(!w.fut){x.font='800 36px '+F;const nw=x.measureText(String(w.n)).width+20;x.fillStyle=C.card;rr(X0+bw/2-nw/2,base-h-50,nw,44,10);x.fill();x.fillStyle=C.ink;x.fillText(String(w.n),X0+bw/2,base-h-14)}x.fillStyle=C.ink2;x.font='500 24px '+F;x.fillText(w.lab,X0+bw/2,base+40);x.textAlign='left'});
  const gl='objectif '+goal;x.font='700 24px '+F;const glw=x.measureText(gl).width+28;x.fillStyle='#E8F6EE';rr(PX+PW-glw,734,glw,40,20);x.fill();x.fillStyle=OK;x.textAlign="right";x.fillText(gl,PX+PW-14,762);x.textAlign='left';
 /* estimated 1RM per lift, family colour dot */
 x.fillStyle=C.card;rr(48,1076,984,boxH,32);x.fill();x.fillStyle=C.ink2;x.font='700 28px '+F;x.fillText('1RM estimé (indicatif), évolution du mois',88,1128);
 if(!lifts.length){x.font='500 30px '+F;x.fillText('Pas de série avec charge ce mois-ci.',88,1194)}
 lifts.forEach((l,i)=>{const Yy=1196+i*64,fc=(C.fam[scG(l.id)]||C.fam.pull)[0];x.fillStyle=fc;rr(88,Yy-24,22,22,6);x.fill();
  x.textAlign='right';x.font='800 40px '+F;const dt=l.d>0?'+'+fmt(Math.round(l.d)):'±0';x.fillStyle=l.d>0?OK:C.ink2;x.fillText(dt,992,Yy);const dw=x.measureText(dt).width;
  x.fillStyle=C.ink;const kv=fmt(Math.round(l.b1))+' kg';x.fillText(kv,992-dw-36,Yy);const kw=x.measureText(kv).width;
  x.textAlign='left';x.font='600 34px '+F;x.fillText(fit(exo(l.id).n,992-dw-36-kw-40-126),126,Yy)});
 x.fillStyle=C.line;x.fillRect(56,H-128,968,2);
 x.fillStyle=C.gold;x.beginPath();x.arc(72,H-72,14,0,7);x.fill();
 x.fillStyle=C.ink;x.font='700 32px '+F;x.fillText(fit(pl(streak(),'semaine')+' d’affilée',920),100,H-61);
 return new Promise(ok=>c.toBlob(ok,'image/png'))}
/* level and XP live in Progrès, not on the session page */
function levelCard(){const X=XP(),T=tierOf(X.lvl);
 return `<button class="card row" style="width:100%;text-align:left;gap:14px;color:var(--ink)" data-a="tab" data-v="prof">${levelRing(X,52)}<div class="grow col" style="gap:4px"><div class="row sb"><b>${T[1]}, niveau ${X.lvl}</b><span class="sm mut">${nf(X.xp)} XP</span></div><div class="xpbar" style="height:8px" aria-hidden="true"><i style="width:${Math.round(X.frac*100)}%"></i></div><span class="xs mut">Encore ${nf(X.next-X.xp)} XP pour le niveau ${X.lvl+1}</span></div>${ic('chev',16)}</button>`}

/* ================= Corps ================= */
/* recovery is an approximation from your sets, your effort and an average recovery time per muscle */
function fatigue(offsetH=0){const now=Date.now()+offsetH*36e5,F={},by={};
 IDX().L.filter(l=>!l.w&&now-l.t<80*36e5&&l.t<=now).forEach(l=>{exo(l.e).m.forEach((m,i)=>{const kk=l.sid+'|'+m;by[kk]=by[kk]||{m,t:l.t,n:0,src:sessName(sessById(l.sid)||{})};by[kk].n+=(i?.5:1)*({easy:.7,ok:1,max:1.2,hard:1.3}[l.f]||1);by[kk].t=Math.max(by[kk].t,l.t)})});
 Object.values(by).forEach(s=>{if(!MUS[s.m])return;const I=Math.min(1,s.n*.15),h=(now-s.t)/36e5,f=I*Math.max(0,1-h/MUS[s.m]);if(f>(F[s.m]?.f||0))F[s.m]={f,I,h,src:s.src,t:s.t}});return F}
/* how much a muscle worked recently, in words (no deadline: recovery times are an app heuristic, not a measure) */
const RLV=[[.15,'Repos',0],[.4,'Un peu travaillé',1],[.7,'Travaillé',2],[9,'Très travaillé',3]];
const rlv=f=>RLV.find(x=>f<x[0]);
function Corps(){const ct=view.ct||'poids';
 const seg0=`<div class="seg" role="tablist" aria-label="Corps">${[['poids','Poids'],['mesures','Mesures'],['photos','Photos'],['recup','Récup']].map(([k,l])=>`<button role="tab" aria-selected="${ct===k}" class="${ct===k?'on':''}" data-a="ct" data-v="${k}">${l}</button>`).join('')}</div>`;
 return `${scTop('Moi','tomoi')}<h1 class="md">${({poids:'Poids',mesures:'Mensurations',photos:'Photos',recup:'Récupération'})[ct]}</h1>${({poids:Poids,mesures:Mesures,photos:Photos,recup:Recup})[ct]()}`}
function Poids(){const B=S.bw.slice().sort((a,b)=>a.d<b.d?-1:1),cw=B.at(-1),old=B.filter(b=>Date.parse(b.d)>=Date.now()-31*864e5)[0];
 const dlt=cw&&old&&old!==cw?cw.kg-old.kg:null,tr=trend(),g=S.prof.goal;
 const T=WTGT[g]||WTGT.maintien,wk=cw?cw.kg:S.prof.w,kg=x=>(x>0?'+':x<0?'−':'')+fmt2(Math.abs(x*wk/100)),tgt=kg(T[0])+' à '+kg(T[1]);
 const ok=tr==null?null:tr/wk*100>=T[0]&&tr/wk*100<=T[1];
 return `<section class="col"><div class="row end"><span class="num" style="font-size:72px;line-height:.85">${fmt(cw?cw.kg:S.prof.w)}</span><span class="num mut" style="font-size:24px">kg</span>
  <div class="grow" style="text-align:right">${dlt!=null?`<span class="sc-tag sc-ac">${dlt>0?'+':''}${fmt(dlt)} kg sur 30 j</span>`:''}<div class="xs mut">${cw?'pesée du '+scD(cw.d):'poids de départ'}</div></div></div>
 ${B.length>1?lineChart(B.slice(-40).map(b=>[b.d,b.kg]),'Évolution du poids',scD,' kg'):''}
 ${tr!=null?`<div class="card row sb"><div class="col g4"><span class="sm mut">Tendance (4 semaines)</span><b>${tr>0?'+':''}${fmt2(tr)} kg / semaine</b></div><div class="col g4" style="text-align:right"><span class="xs mut">cible ${g==='masse'?'prise de masse':g==='seche'?'sèche':'maintien'}</span><span class="tag ${ok?'ok':'warn'}" style="align-self:flex-end">${tgt} kg</span></div></div>`
  :`<p class="sm mut" style="margin:0">Pèse-toi le matin à jeun, 2 à 3 fois par semaine. Avec 4 pesées sur au moins 2 semaines, l’appli calcule ta tendance.</p>`}
 <div class="row"><input id="bwin" type="number" inputmode="decimal" min="25" max="350" step="0.1" placeholder="Poids du jour (kg)" aria-label="Poids du jour en kg" class="grow"><button class="btn2 acb" style="min-height:48px" data-a="savebw">Enregistrer</button></div></section>
 ${B.length?`<section class="col"><h2 class="lbl">Dernières pesées</h2><div class="card" style="padding:4px 16px">${B.slice(-8).reverse().map(b=>`<div class="hist"><span class="mut">${cap(new Date(b.d+'T12:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'}))}</span><span class="grow num" style="text-align:right;font-size:20px">${fmt(b.kg)} kg</span><button class="x s" data-a="delbw" data-v="${b.d}" aria-label="Supprimer la pesée du ${scD(b.d)}">${ic('trash',16)}</button></div>`).join('')}</div></section>`:''}`}
function Mesures(){const M=S.meas.slice().sort((a,b)=>a.d<b.d?-1:1),lastOf=k=>M.filter(m=>m[k]).at(-1),firstOf=k=>M.find(m=>m[k]);
 const sel=view.ms||'bras',pts=M.filter(m=>m[sel]).map(m=>[m.d,m[sel]]);
 return `<section class="col"><div class="g2">${MEAS.map(([k,l])=>{const a=lastOf(k),f=firstOf(k),d=a&&f&&a!==f?a[k]-f[k]:null;
  return `<button class="tile sc-mtile sc-ac ${sel===k?'on':''}" aria-pressed="${sel===k}" data-a="ms" data-v="${k}"><span class="sm mut">${l}</span><span class="num">${a?fmt(a[k])+' cm':'—'}</span><span class="xs ${d>0?'b sc-tx':'mut'}">${d!=null?(d>0?'+':'')+fmt(d)+' cm depuis le '+scD(f.d):a?'mesuré le '+scD(a.d):'pas encore mesuré'}</span></button>`}).join('')}</div>
 ${pts.length>1?lineChart(pts,'Tour de '+MEAS.find(m=>m[0]===sel)[1].toLowerCase(),scD,' cm','ac'):`<p class="sm mut" style="margin:0">${MEAS.find(m=>m[0]===sel)[1]} : ${pts.length?'encore une mesure, un autre jour, pour tracer la courbe.':'pas encore de mesure.'}</p>`}
 <button class="btn" data-a="measure">${ic('plus',20)} Nouvelle mesure</button>
 <p class="xs mut" style="margin:0">Mesure toujours au même endroit, muscle relâché, le matin. Plusieurs saisies le même jour se complètent sans s’effacer.</p></section>`}
function Photos(){if(photos===null){loadPhotos();return '<div class="empty"><span class="spin"></span>Chargement des photos…</div>'}
 if(photos===false)return '<div class="empty">Les photos ne peuvent pas être enregistrées dans ce navigateur (stockage bloqué).</div>';
 const sel=view.psel||[],cmp=sel.length===2?sel.map(id=>photos.find(p=>p.id===id)).filter(Boolean).sort((a,b)=>a.d<b.d?-1:1):null;
 return `<section class="col"><div class="card sm col g6"><b>Privées et hors sauvegarde</b><span class="mut">Les photos restent sur cet appareil : elles ne sont ni synchronisées ni dans l’export JSON. Sauvegarde-les à part.</span>${photos.length?`<button class="btn2" data-a="exportphotos">${ic('copy',16)} Sauvegarder les ${pl(photos.length,'photo')}</button>`:''}</div>
 ${cmp&&cmp.length===2?`<div class="card col"><span class="lbl">Avant / après · ${Math.round((Date.parse(cmp[1].d)-Date.parse(cmp[0].d))/864e5)} jours</span><div class="cmp">${cmp.map(p=>`<figure><img src="${PH.url(p)}" alt="Photo du ${scD(p.d)}"><figcaption class="sm mut">${scD(p.d)}</figcaption></figure>`).join('')}</div><button class="btn2" data-a="psel" data-v="">Fermer la comparaison</button></div>`:''}
 ${photos.length?`<div class="pgrid">${photos.slice().reverse().map(p=>{const on=sel.includes(p.id);return `<button class="photo ${on?'sel':''}" data-a="ptap" data-v="${p.id}" aria-pressed="${on}" aria-label="Photo du ${scD(p.d)}"><img src="${PH.url(p)}" alt=""><span>${scD(p.d)}</span>${on?`<span class="ck">${ic('check',14)}</span>`:''}</button>`}).join('')}</div>
  <span class="xs mut">${sel.length===1?'Choisis une 2e photo pour comparer.':'Touche deux photos pour les comparer côte à côte.'}</span>
  ${sel.length===1?`<div class="row"><button class="btn2 grow" data-a="psel" data-v="">Désélectionner</button><button class="btn2 grow danger" data-a="pdel" data-v="${sel[0]}">Supprimer la photo</button></div>`:''}`
  :'<div class="empty">Aucune photo. Une photo par mois, même lumière, même pose : c’est le meilleur juge de ta progression.</div>'}
 <button class="btn" data-a="addphoto">${ic('camera',20)} Ajouter une photo</button></section>`}
function Recup(){const F=fatigue(0),dots=n=>`<span class="sc-lv" aria-hidden="true">${[0,1,2].map(i=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;
 const top=Object.entries(F).filter(([,v])=>v.f>=.15).sort((a,b)=>b[1].f-a[1].f);
 return `<p class="sm mut" style="margin:0">Muscles travaillés ces 3 derniers jours, selon tes séries et ton ressenti. Ce n’est pas une mesure de récupération : fie-toi aussi à tes sensations, ton sommeil et tes courbatures.</p>
 <section class="col">${top.length?`<div class="card" style="padding:4px 16px">${top.map(([m,v])=>{const L=rlv(v.f);return `<div class="hist sc-${grpOfM(m)}"><div class="row" style="gap:12px"><i class="sc-dot" aria-hidden="true"></i><div class="col" style="gap:2px"><b>${cap(m)}</b><span class="xs mut">${esc(v.src)}, ${agoTxt(key(v.t))}</span></div></div><span class="row sm" style="gap:8px">${L[1]} ${dots(L[2])}</span></div>`}).join('')}</div>`:'<div class="empty">Aucune séance ces 3 derniers jours.</div>'}</section>
 <section class="col"><h2 class="lbl">Tous les muscles</h2><div class="mus sc-mus">${Object.keys(MUS).sort((a,b)=>SC_FAM.indexOf(grpOfM(a))-SC_FAM.indexOf(grpOfM(b))).map(m=>{const L=rlv(F[m]?.f||0);return `<div class="sc-${grpOfM(m)} ${L[2]>=1?'hot':''}"><span><i class="sc-dot" aria-hidden="true"></i>${m}</span><span class="xs ${L[2]?'':'dim'}">${L[1]}</span></div>`}).join('')}</div></section>`}
function measureSheet(){const M=S.meas.slice().sort((a,b)=>a.d<b.d?-1:1),td=M.find(m=>m.d===today());
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font-size:26px" id="sheet-title" tabindex="-1">Nouvelle mesure</h2>${closeBtn}</div><span class="sm mut">En centimètres. Laisse vide ce que tu ne mesures pas${td?' : les mesures déjà notées aujourd’hui sont gardées':''}.</span>
 <div class="g2">${MEAS.map(([k,l])=>{const p=M.filter(m=>m[k]).at(-1);return `<label for="m_${k}">${l}<input id="m_${k}" type="number" inputmode="decimal" min="10" max="250" step="0.5" placeholder="${td?.[k]?'aujourd’hui '+fmt(td[k]):p?'dernière '+fmt(p[k]):''}"></label>`}).join('')}</div>
 <p id="merr" class="sm redc" style="margin:0" role="alert" hidden></p>
 <div class="sfoot"><button class="btn" data-a="savemeas">Enregistrer</button></div>`,'meas')}

/* ================= Nutrition ================= */
function Nut(){const d=view.nd||today(),g=goals(),n=nutDay(d),c=2*Math.PI*50,w=waterN(d),isT=d===today(),tip=isT?adjustTip():null;
 const wGoal=S.prof.water||2.5,glasses=Math.round(wGoal/.25);
 const MC={'Petit-déjeuner':'carb','Déjeuner':'legs','Collation':'glute','Dîner':'core'};
 const meals=MEALS.map(m=>{const F=S.food.filter(f=>f.d===d&&f.m===m),k=F.reduce((s,f)=>s+f.k,0),pr=F.reduce((s,f)=>s+f.p,0);
  return `<div class="card col sc-meal"><div class="row sc-mh">${scIco(MC[m]||'ac','nut')}<div class="grow"><b>${m}</b><div class="xs mut">${F.length?pl(F.length,'aliment')+', '+Math.round(pr)+' g prot.':'Rien de noté'}</div></div><div class="row" style="gap:10px">${F.length?`<span class="num" style="font-size:22px">${nf(k)}<span class="xs mut" style="font-weight:600"> kcal</span></span>`:''}<button class="x s acx" data-a="addfood" data-v="${m}" aria-label="Ajouter au ${m.toLowerCase()}">${ic('plus',16)}</button></div></div>
  ${F.map(f=>`<button class="food" data-a="editfood" data-v="${f.id}"><span class="grow col sc-fi"><span class="sm">${esc(f.n)}</span><span class="xs mut">${fmt(f.q)}\u00a0g${F.length>1?` · ${Math.round(f.p)}\u00a0g prot.`:''}</span></span>${F.length>1?`<span class="sm b sc-nw">${nf(f.k)}<span class="xs mut" style="font-weight:600">\u00a0kcal</span></span>`:''}</button>`).join('')}
  ${F.length>1?`<button class="link mutl" style="align-self:flex-start" data-a="savetmeal" data-v="${m}">${ic('star',14)} Enregistrer comme repas type</button>`:''}</div>`}).join('');
 const yk=addDays(d,-1),hasY=S.food.some(f=>f.d===yk),hasD=S.food.some(f=>f.d===d);
 return `<div class="col g4"><h1>Nutrition</h1><button class="link" data-a="goalsheet">Objectif : ${({seche:'sèche',maintien:'maintien',masse:'prise de masse'})[S.prof.goal]}, ${nf(g.k)} kcal par jour${g.man?' (manuel)':''} ${ic('chev',14)}</button></div>
 <div class="row sb"><button class="x s" data-a="nd" data-v="${addDays(d,-1)}" aria-label="Jour précédent">${ic('left',16)}</button><b>${isT?'Aujourd’hui':cap(dLong(d))}</b><button class="x s" data-a="nd" data-v="${addDays(d,1)}" aria-label="Jour suivant" ${isT?'disabled':''}>${ic('chev',16)}</button></div>
 ${S.prof.body?'':`<section class="card warn col" style="gap:8px"><b>Objectif calculé avec un profil par défaut</b><span class="sm">Indique ton âge, ta taille, ton sexe et ton poids dans Profil pour une estimation qui te correspond.</span><div class="row"><button class="btn2 grow acb" data-a="profme">Compléter</button><button class="btn2 grow" data-a="bodyok">C’est bon</button></div></section>`}
 <section class="card row" style="gap:20px;padding:20px"><svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="${nf(n.k)} kcal sur ${nf(g.k)}" style="flex:none">
 <circle cx="60" cy="60" r="50" fill="none" style="stroke:var(--soft)" stroke-width="12"/>${(()=>{const parts=[['prot',n.p*4],['carb',n.g*4],['fat',n.l*9]],tot=parts.reduce((s,x)=>s+x[1],0),arc=c*Math.min(1,n.k/g.k);if(!tot||!arc)return '';let o=0;
  return parts.map(([k,v])=>{const len=v/tot*arc,gap=len>3?1.5:0,seg=`<circle cx="60" cy="60" r="50" fill="none" style="stroke:var(--${k})" stroke-width="12" stroke-dasharray="${Math.max(0,len-gap)} ${c}" stroke-dashoffset="${-o}" transform="rotate(-90 60 60)"/>`;o+=len;return len>0?seg:''}).join('')})()}
 <text x="60" y="58" text-anchor="middle" style="fill:var(--ink);font:800 28px var(--f);letter-spacing:-.5px">${nf(n.k)}</text><text x="60" y="76" text-anchor="middle" style="fill:${n.k>g.k*1.05?'var(--warn)':'var(--ink2)'};font:700 11px var(--f)">${n.k>g.k?'+'+nf(n.k-g.k)+' kcal':'reste '+nf(g.k-n.k)}</text></svg>
 <div class="grow col" style="gap:12px">${[['Protéines',n.p,g.p,'prot'],['Glucides',n.g,g.g,'carb'],['Lipides',n.l,g.l,'fat']].map(([l,v,o,col])=>`<div class="col sc-${col}" style="gap:5px"><div class="row sb sm"><span class="sc-mac"><i class="sc-dot" aria-hidden="true"></i>${l}</span><span><b>${Math.round(v)}</b><span class="mut"> / ${o} g</span></span></div><div class="bar sc-bar" style="height:8px" aria-hidden="true"><i style="width:${Math.min(100,v/o*100)}%"></i></div></div>`).join('')}</div></section>
 ${tip?`<div class="card hl col"><b>Ajustement possible</b><span class="sm">${tip.why} (${tip.r>0?'+':''}${fmt2(tip.r)} kg / semaine sur 4 semaines, repas notés ${tip.logged} jours sur 7). Si tes saisies sont complètes, passe à <b>${nf(g.k+tip.d)} kcal</b> par jour.</span><div class="row"><button class="btn2 grow" data-a="tipno">Plus tard</button><button class="btn2 grow acb" data-a="tipyes" data-v="${tip.d}">${tip.d>0?'+':''}${tip.d} kcal</button></div></div>`:''}
 <section class="card col sc-water"><div class="row sb"><div class="row">${scIco('water','water')}<div><b>Eau</b><div class="sm mut">${fmt(w*.25)} / ${fmt(wGoal)} L · verres de 25 cl</div></div></div><div class="row" style="gap:8px"><button class="x" data-a="water" data-v="-1" aria-label="Retirer un verre" ${w>0?'':'disabled'}>−</button><span class="num" style="font-size:26px;min-width:28px;text-align:center" aria-live="polite">${w}</span><button class="x acx" data-a="water" data-v="1" aria-label="Ajouter un verre">+</button></div></div>
  <div class="row" style="gap:4px" aria-hidden="true">${[...Array(glasses)].map((_,i)=>`<i class="sc-glass ${i<w?'on':''}"></i>`).join('')}</div></section>
 <section class="col"><div class="row sb"><h2 class="lbl">Repas</h2>${hasY&&!hasD?`<button class="link" data-a="copyy">${ic('copy',14)} Copier les repas de la veille</button>`:''}</div>${meals}</section>
 <div class="row"><button class="btn grow" data-a="addfood" data-v="">${ic('plus',20)} Ajouter</button><button class="btn light grow" data-a="scan">${ic('scan',20)} Scanner</button></div>`}
const mealNow=()=>{const h=new Date().getHours();return h<11?'Petit-déjeuner':h<15?'Déjeuner':h<18?'Collation':'Dîner'};
function goalSheet(){const p=S.prof,g=goals();
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font-size:26px" id="sheet-title" tabindex="-1">Mon objectif</h2>${closeBtn}</div>
 <div class="col"><span class="lbl" id="gl1">Objectif</span><div class="chips" role="group" aria-labelledby="gl1" style="grid-template-columns:repeat(3,1fr)">${[['seche','Sèche'],['maintien','Maintien'],['masse','Masse']].map(([k,l])=>`<button class="chip ${p.goal===k?'on':''}" aria-pressed="${p.goal===k}" style="font-size:15px" data-a="goal" data-v="${k}">${l}</button>`).join('')}</div></div>
 <div class="col"><span class="lbl" id="gl2">Activité en dehors de la salle</span><div class="col g6" role="group" aria-labelledby="gl2">${Object.entries(ACT).map(([k,[l,d]])=>`<button class="item ${p.act===k?'on':''}" style="min-height:52px;padding:8px 14px" aria-pressed="${p.act===k}" data-a="act" data-v="${k}"><div class="grow"><div class="b sm">${l}</div><div class="xs mut">${d}</div></div>${p.act===k?ic('check',18):''}</button>`).join('')}</div></div>
 <div class="col"><span class="lbl" id="gl3">Séances par semaine</span><div class="chips" role="group" aria-labelledby="gl3" style="grid-template-columns:repeat(5,1fr)">${[2,3,4,5,6].map(n=>`<button class="chip ${p.sess==n?'on':''}" aria-pressed="${p.sess==n}" data-a="wsess" data-v="${n}">${n}×</button>`).join('')}</div><span class="xs mut">Les semaines déjà comptées gardent l’objectif de l’époque.</span></div>
 <div class="card col"><span class="sm mut">Ton objectif quotidien${g.man?' (fixé à la main)':''}</span><div class="row base"><span class="num" style="font-size:56px">${nf(g.k)}</span><span class="mut">kcal</span></div>
 <div class="g3 sm">${[[g.p,'protéines','prot'],[g.g,'glucides','carb'],[g.l,'lipides','fat']].map(([v,l,c])=>`<span class="sc-${c}"><b>${v} g</b><br><span class="mut sc-mac" style="gap:5px"><i class="sc-dot" aria-hidden="true"></i>${l}</span></span>`).join('')}</div></div>
 <div class="card col g4 sm"><div class="kv"><span class="mut">Poids utilisé</span><span>${fmt(wNow())} kg (dernière pesée)</span></div><div class="kv"><span class="mut">Métabolisme de base</span><span>${nf(g.bmr)} kcal</span></div>
 <div class="kv"><span class="mut">Activité + ${p.sess} séances</span><span>× ${fmt2(g.act)}</span></div><div class="kv"><span class="mut">Objectif</span><span>${g.off>0?'+':''}${g.off} kcal</span></div>
 ${p.kadj?`<div class="kv"><span class="mut">Ajustement selon ton poids</span><span>${p.kadj>0?'+':''}${p.kadj} kcal <button class="link" data-a="kadj0">remettre à 0</button></span></div>`:''}
 <div class="kv"><span class="mut">Calcul automatique</span><span>${nf(g.auto)} kcal</span></div>
 ${g.floored?`<div class="kv"><span class="mut">Plancher appliqué</span><span>pas moins de ${nf(Math.max(KFLOOR(),g.bmr))} kcal</span></div>`:''}</div>
 <div class="col g6"><label for="kman">Objectif manuel (kcal, facultatif)<input id="kman" type="number" inputmode="numeric" min="1000" max="6000" step="10" value="${p.kman||''}" placeholder="Laisse vide pour le calcul automatique"></label>
 <div class="row"><button class="btn2 grow" data-a="kmanset">Utiliser ce chiffre</button>${p.kman?'<button class="btn2 grow" data-a="kman0">Revenir au calcul</button>':''}</div><p id="kerr" class="sm redc" role="alert" style="margin:0" hidden></p></div>
 <p class="xs mut" style="margin:0">Estimation de départ : métabolisme de repos selon Mifflin-St Jeor (1990), multiplié par un facteur d’activité courant, plus 2,5 % par séance hebdomadaire (approximation de l’appli). Protéines ${p.goal==='seche'?'2,2':'2'} g/kg : les études situent l’utile entre 1,6 et 2,2 g/kg. Lipides ${p.goal==='seche'?'0,8':'1'} g/kg (règle empirique), le reste en glucides. Ajuste selon l’évolution réelle de ton poids.</p>
 <div class="sfoot"><button class="btn" data-a="close">Valider</button></div>`,'goal')}
/* ---------- food picker ---------- */
const per=(f,q)=>({k:f.k100*q/100,p:f.p100*q/100,g:f.g100*q/100,l:f.l100*q/100});
const baseFoods=()=>[...S.myfoods.map(f=>({...f,mine:1})),...FOODS.map(([n,k,p,g,l,q])=>({n,k100:k,p100:p,g100:g,l100:l,q}))];
const findFood=n=>baseFoods().find(f=>f.n===n)||(()=>{const r=S.food.slice().reverse().find(f=>f.n===n);return r&&{n:r.n,k100:r.k100,p100:r.p100,g100:r.g100,l100:r.l100,q:r.q}})();
function foodRows(list){return list.map(f=>`<div class="row" style="gap:0;border-bottom:1px solid var(--rule)"><button class="food grow" style="border:0" data-a="pickfood" data-v="${esc(f.n)}"><div class="grow"><div class="b">${esc(f.n)}</div><div class="xs mut">${f.info||`${nf(f.k100)} kcal · ${fmt(f.p100)} g prot. / 100 g`}</div></div></button>
 <button class="star ${S.fav.includes(f.n)?'on':''}" data-a="fav" data-v="${esc(f.n)}" aria-label="${S.fav.includes(f.n)?'Retirer des':'Ajouter aux'} favoris : ${esc(f.n)}" aria-pressed="${S.fav.includes(f.n)}">${ic('star',20)}</button></div>`).join('')}
function foodList(){const t=view.ft||'search',q=scFold((view.fq||'').trim());
 if(t==='recent'){const R=[...new Map(S.food.slice().reverse().map(f=>[f.n,f])).values()].slice(0,15);return R.length?foodRows(R.map(f=>({...findFood(f.n),n:f.n,info:`${fmt(f.q)} g · ${nf(f.k)} kcal · ${Math.round(f.p)} g prot.`}))):'<div class="empty">Les aliments que tu ajoutes apparaîtront ici.</div>'}
 if(t==='fav'){const F=S.fav.map(findFood).filter(Boolean);return F.length?foodRows(F):'<div class="empty">Touche l’étoile d’un aliment pour le retrouver ici.</div>'}
 if(t==='meals')return S.tmeals.length?S.tmeals.map(m=>`<div class="row" style="gap:0;border-bottom:1px solid var(--rule)"><button class="food grow" style="border:0" data-a="usetmeal" data-v="${m.id}"><div class="grow"><div class="b">${esc(m.n)}</div><div class="xs mut">${m.items.map(x=>esc(x.n)).join(', ')} · ${nf(m.items.reduce((s,x)=>s+x.k,0))} kcal</div></div>${ic('plus',18)}</button><button class="star" data-a="deltmeal" data-v="${m.id}" aria-label="Supprimer le repas type ${esc(m.n)}">${ic('trash',18)}</button></div>`).join(''):'<div class="empty">Compose un repas puis touche « Enregistrer comme repas type » pour l’ajouter en un geste.</div>';
 const L=baseFoods().filter(f=>!q||scFold(f.n).includes(q)).slice(0,q?40:60);
 return L.length?foodRows(L):`<div class="empty">Rien pour « ${esc(view.fq)} ».<button class="btn2 acb" data-a="newfood">Créer cet aliment</button></div>`}
function foodSheet(meal){view.fm=meal||view.fm||mealNow();view.ft=view.ft||(S.food.length?'recent':'search');
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font-size:26px" id="sheet-title" tabindex="-1">Ajouter</h2>${closeBtn}</div>
 <label for="fm">Repas<select id="fm" data-c="fm">${MEALS.map(m=>`<option ${m===view.fm?'selected':''}>${m}</option>`).join('')}</select></label>
 <div class="row"><input id="fq" data-i="fq" type="search" placeholder="Rechercher un aliment" aria-label="Rechercher un aliment" value="${esc(view.fq||'')}" autocomplete="off" class="grow"><button class="x acx" data-a="scan" aria-label="Scanner un code-barres">${ic('scan',20)}</button></div>
 <div class="seg" role="tablist" aria-label="Liste">${[['search','Tous'],['recent','Récents'],['fav','Favoris'],['meals','Repas types']].map(([k,l])=>`<button role="tab" aria-selected="${view.ft===k}" class="${view.ft===k?'on':''}" data-a="ft" data-v="${k}">${l}</button>`).join('')}</div>
 <div id="flist" class="col" style="gap:0">${foodList()}</div>
 <button class="btn2" data-a="newfood">${ic('plus',16)} Créer un aliment (étiquette)</button>`,'food')}
function qtySheet(f,entry){view.qf=f;view.qe=entry||null;const q=entry?entry.q:(view.qq||f.q||100),m=per(f,q);
 sheet(`<div class="grab"></div><div class="row">${entry?closeBtn:`<button class="x" data-a="foodback" aria-label="Retour">${ic('back',20)}</button>`}<div class="grow"><h2 class="b" style="font-size:17px;margin:0" id="sheet-title" tabindex="-1">${esc(f.n)}</h2><div class="sm mut">${nf(f.k100)} kcal · P ${fmt(f.p100)} · G ${fmt(f.g100)} · L ${fmt(f.l100)} / 100 g</div></div>
 <button class="star ${S.fav.includes(f.n)?'on':''}" data-a="fav" data-v="${esc(f.n)}" aria-label="Favori" aria-pressed="${S.fav.includes(f.n)}">${ic('star',22)}</button></div>
 <label for="qq">Quantité (g)<input id="qq" data-i="qq" type="number" inputmode="decimal" min="1" max="3000" value="${q}"></label>
 <div class="row wrap sc-qset sc-ac" id="qset" style="gap:6px">${[...new Set([f.q,50,100,150,200,250].filter(Boolean))].slice(0,6).map(v=>`<button class="btn2 fill ${+v===+q?'on':''}" aria-pressed="${+v===+q}" data-a="qset" data-v="${v}">${v} g${v===f.q?' · portion':''}</button>`).join('')}</div>
 <div class="card tiles" id="qmac" style="grid-template-columns:repeat(4,1fr);padding:12px" aria-live="polite">${macTiles(m)}</div>
 <p id="qerr" class="sm redc" role="alert" style="margin:0" hidden>Quantité entre 1 et 3 000 g.</p>
 ${entry?`<label for="fm2">Repas<select id="fm2">${MEALS.map(x=>`<option ${x===entry.m?'selected':''}>${x}</option>`).join('')}</select></label>
 <div class="sfoot"><div class="row"><button class="btn2 grow danger" style="min-height:56px" data-a="delfood" data-v="${entry.id}">Supprimer</button><button class="btn grow" data-a="savefoodq">Enregistrer</button></div></div>`
 :`<div class="sfoot"><button class="btn" data-a="addfoodq">Ajouter · ${esc(view.fm||mealNow())}</button></div>`}`,'qty')}
/* updQty() (7-actions) redraws the macro tiles through macTiles after setting view.qq: the quick chips follow the same value */
const scQsync=()=>document.querySelectorAll('#qset [data-a="qset"]').forEach(b=>{const iq=document.getElementById('qq'),cur=view.qq||(iq?+String(iq.value).replace(',','.'):0),on=+b.dataset.v===+cur;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
const macTiles=m=>{queueMicrotask(scQsync);return scMacTiles(m)};
const scMacTiles=m=>[['kcal',nf(m.k),''],['prot.',fmt(m.p)+' g','prot'],['gluc.',fmt(m.g)+' g','carb'],['lip.',fmt(m.l)+' g','fat']].map(([l,v,c])=>`<div class="col g4 ${c?'sc-'+c:''}" style="align-items:center"><span class="num" style="font-size:22px">${v}</span><span class="xs mut sc-mac" style="gap:5px">${c?'<i class="sc-dot" aria-hidden="true"></i>':''}${l}</span></div>`).join('');
function newFoodSheet(pre={}){view.nf=pre;
 sheet(`<div class="grab"></div><div class="row"><button class="x" data-a="foodback" aria-label="Retour">${ic('back',20)}</button><h2 class="grow" style="font-size:26px" id="sheet-title" tabindex="-1">${pre.code?'Nouveau produit':'Créer un aliment'}</h2></div>
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
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font-size:26px" id="sheet-title" tabindex="-1">Scanner</h2>${closeBtn}</div>
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
function Prof(){const p=S.prof,pg=view.page;if(pg==='set')return Settings();if(pg==='data')return DataPage();if(pg==='me')return MePage();
 const g=goals(),gst=window.claude?'':gOn()?(G.state==='err'?'Erreur de synchro':GS.last?'Synchronisé '+agoTxt(key(GS.last)):'Connecté'):'Non connecté';
 const li=(a,v,icon,t,s,c='ac')=>`<button class="li" data-a="${a}" data-v="${v}">${scIco(c,icon)}<div class="grow"><div class="t">${t}</div>${s?`<div class="s">${s}</div>`:''}</div>${chev}</button>`;
 return `<h1>Moi</h1>
 <button class="card row" style="text-align:left;color:var(--ink)" data-a="page" data-v="me"><span class="sc-av" aria-hidden="true">${esc((p.name||'?')[0].toUpperCase())}</span>
  <div class="grow col" style="gap:2px"><b style="font-size:19px">${esc(p.name||'Ajouter ton prénom')}</b><span class="sm mut">${p.body?`${p.a} ans, ${p.h} cm, ${fmt(wNow())} kg`:'Profil à compléter (pour la nutrition)'}</span></div>${chev}</button>
 <section class="section"><h2 class="lbl">Mon corps</h2><div class="list">
  ${li('corpspage','poids','corps','Poids',`${fmt(wNow())} kg${S.bw.length?', pesée '+agoTxt(S.bw.slice().sort((a,b)=>a.d<b.d?-1:1).at(-1).d):''}`,'ac')}
  ${li('corpspage','mesures','edit','Mensurations',S.meas.length?pl(S.meas.length,'mesure'):'Bras, taille, cuisses…','push')}
  ${li('corpspage','photos','camera','Photos','Avant / après, restent sur ce téléphone','glute')}
  ${li('corpspage','recup','clock','Récupération','Muscles travaillés ces 3 derniers jours','legs')}</div></section>
 <section class="section"><h2 class="lbl">Entraînement</h2><div class="list">
  ${li('gotoprogs','','prog','Programme',`${esc(S.pn)}, ${p.sess} séances par semaine`,'core')}
  ${li('page','set','more','Réglages des séances',`Repos ${mmss(p.rest)}, pas de ${fmt2(p.step)} kg, bip ${p.sound?'activé':'coupé'}`,'ink')}</div></section>
 <section class="section"><h2 class="lbl">Nutrition</h2><div class="list">${li('goalsheet','','nut','Objectif',`${({seche:'Sèche',maintien:'Maintien',masse:'Prise de masse'})[p.goal]}, ${nf(g.k)} kcal par jour`,'carb')}</div></section>
 <section class="section"><h2 class="lbl">Mes données</h2><div class="list">${li('page','data','shield','Sauvegarde et Google',[gst,localErr?'Erreur sur cet appareil':'',p.lastExp?'export '+agoTxt(p.lastExp):''].filter(Boolean).join(', ')||'Exporter, importer, copies de secours','water')}</div></section>
 <p class="xs dim" style="margin:0;text-align:center">Charge, version ${APPV}</p>`}
function MePage(){const p=S.prof,num=(k,l,r,st=1)=>`<label for="pf_${k}">${l}<input id="pf_${k}" data-c="prof" data-k="${k}" type="number" inputmode="decimal" min="${r[0]}" max="${r[1]}" step="${st}" value="${p[k]}"></label>`;
 return `${scTop('Moi')}<h1 class="md">Mon profil</h1>
 <span class="sm mut">Sert à estimer tes besoins en calories et en protéines.</span>
 <label for="pf_name">Prénom<input id="pf_name" data-c="pname2" maxlength="30" value="${esc(p.name)}" placeholder="Facultatif" autocomplete="given-name"></label>
 <div class="col g6"><span class="lbl" style="text-transform:none;letter-spacing:0;font-size:15px;color:var(--ink2)">Sexe</span><div class="chips" style="grid-template-columns:1fr 1fr" role="group" aria-label="Sexe">${[['h','Homme'],['f','Femme']].map(([k,l])=>`<button class="chip ${p.sex===k?'on':''}" aria-pressed="${p.sex===k}" data-a="sex" data-v="${k}">${l}</button>`).join('')}</div></div>
 <div class="g2">${num('a','Âge',LIM.a)}${num('h','Taille (cm)',LIM.h)}</div><p id="proferr" class="sm redc" role="alert" style="margin:0" hidden></p>
 <button class="li card" data-a="corpspage" data-v="poids"><div class="grow"><div class="t">Poids : ${fmt(wNow())} kg</div><div class="s">Se met à jour avec tes pesées</div></div>${chev}</button>
 <button class="btn" data-a="bodyok">C’est bon</button>`}
function Settings(){const p=S.prof;
 return `${scTop('Moi')}<h1 class="md">Réglages des séances</h1>
 <label for="pf_rest">Repos entre les séries<select id="pf_rest" data-c="prof" data-k="rest">${[45,60,90,120,150,180].map(n=>`<option value="${n}" ${p.rest==n?'selected':''}>${mmss(n)}</option>`).join('')}</select></label>
 <label for="pf_step">Pas pour monter la charge<select id="pf_step" data-c="prof" data-k="step">${[1,1.25,2.5,5].map(n=>`<option value="${n}" ${p.step==n?'selected':''}>${fmt2(n)} kg</option>`).join('')}</select></label>
 <label for="pf_bar">Poids de la barre<select id="pf_bar" data-c="prof" data-k="bar">${[20,15,10].map(n=>`<option value="${n}" ${(p.bar||20)==n?'selected':''}>${n} kg</option>`).join('')}</select></label>
 <div class="col g6"><span class="sm b" style="color:var(--ink2)">Séances par semaine</span><div class="chips" role="group" aria-label="Séances par semaine" style="grid-template-columns:repeat(5,1fr)">${[2,3,4,5,6].map(n=>`<button class="chip ${p.sess==n?'on':''}" aria-pressed="${p.sess==n}" data-a="wsess" data-v="${n}">${n}</button>`).join('')}</div></div>
 <button class="sw" role="switch" aria-checked="${!!p.sound}" data-a="sound" data-v="${p.sound?0:1}"><span class="col" style="gap:0"><span class="b">Bip à la fin du repos</span><span class="xs dim">Quand l’appli est ouverte à l’écran</span></span><span class="knob" aria-hidden="true"></span></button>`}
function DataPage(){const p=S.prof,expDays=p.lastExp?daysAgo(p.lastExp):null,ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
 return `${scTop('Moi')}<h1 class="md">Sauvegarde</h1>
 ${window.claude?'':gOn()?`<section class="card col"><div class="row sb"><b style="font-size:17px">Google Drive</b><span class="sm ${G.state==='err'?'redc':G.state==='ok'?'okc':'mut'}">${G.state==='sync'?'Synchronisation…':G.state==='ok'?'À jour':G.state==='err'?'Erreur':gLive()?'Connecté':'En pause'}</span></div>
  <span class="sm mut">${esc(GS.email||'Compte Google')}${GS.last?', dernière synchro '+agoTxt(key(GS.last))+' à '+hm(GS.last):''}</span>${G.err?`<span class="sm redc">${esc(G.err)}</span>`:''}
  <div class="row"><button class="btn2 grow acb" data-a="gsync" ${G.state==='sync'?'disabled':''}>Synchroniser</button><button class="btn2 grow" data-a="goff">Déconnecter</button></div></section>`
 :`<section class="card col"><b style="font-size:17px">Se connecter avec Google</b><span class="sm mut">Tes données sont copiées dans ton Google Drive (un dossier caché réservé à Charge). Tu les retrouves sur un autre téléphone, même si celui-ci est perdu.</span>${G.err?`<span class="sm redc">${esc(G.err)}</span>`:''}
  ${gcid()?`<button class="btn" data-a="gsync" ${G.state==='sync'?'disabled':''}>${G.state==='sync'?'Connexion…':'Se connecter avec Google'}</button>`:`<label for="gcid">ID client Google<input id="gcid" data-c="gcid" placeholder="xxxxx.apps.googleusercontent.com" autocomplete="off"></label>`}</section>`}
 <section class="card col"><b style="font-size:17px">Fichier de sauvegarde</b><span class="sm mut">Dernier export : ${expDays==null?'jamais':agoTxt(p.lastExp)}. Les photos ne sont pas dedans.</span>
  <div class="row"><button class="btn2 grow acb" data-a="export">Exporter</button><button class="btn2 grow" data-a="import">Importer</button></div>${view.imp?importCard():''}</section>
 ${!window.claude&&!isStandalone()?`<section class="card warn col"><b>Installe Charge sur l’écran d’accueil</b><span class="sm">${ios?'Dans Safari : bouton Partager, puis «\u00a0Sur l’écran d’accueil\u00a0». Sinon Safari peut effacer les données après 7 jours sans visite.':'Menu du navigateur, puis «\u00a0Installer l’application\u00a0». Tes données sont mieux protégées.'}</span></section>`:''}
 <section class="card col g4 sm"><div class="kv"><span>Sur ce téléphone</span><span class="${localErr?'redc b':'okc'}">${localErr?'Refusé : '+localErr:'Enregistré'+(lastSaved?' à '+hm(lastSaved):'')}</span></div>
  ${persisted!=null&&!window.claude?`<div class="kv"><span>Stockage protégé</span><span class="${persisted?'okc':'warnc'}">${persisted?'oui':'non'}</span></div>`:''}
  <div class="kv"><span class="mut">Contenu</span><span style="text-align:right">${pl(doneSess().length,'séance')}, ${pl(S.logs.length,'série')}, ${pl(S.food.length,'aliment')}</span></div></section>
 <details class="fold" ${view.bakopen?'open':''}><summary data-a="baks">Copies de secours</summary>${view.baks?view.baks.length?view.baks.map(b=>`<div class="hist"><span class="grow sm">${new Date(b.at).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}<br><span class="xs dim">${esc(b.why)}</span></span><button class="btn2" data-a="restorebak" data-v="${b.at}">Restaurer</button></div>`).join(''):'<p class="sm mut">Aucune copie pour l’instant.</p>':'<p class="sm mut">Chargement…</p>'}</details>
 ${view.confirm===2?`<div class="card warn col"><span class="sm"><b>La copie de secours a échoué.</b> Rien n’a été effacé. Exporte d’abord, ou efface sans copie.</span><div class="row wrap"><button class="btn2 grow" data-a="nores">Annuler</button><button class="btn2 grow danger" data-a="reset" data-v="force">Effacer sans copie</button></div></div>`
  :view.confirm?`<div class="card col"><span class="sm">Tout effacer ? Une copie de secours est faite avant.</span><div class="row"><button class="btn2 grow" data-a="nores">Annuler</button><button class="btn2 grow danger" data-a="reset">Tout effacer</button></div></div>`:'<button class="btn2 danger" data-a="askreset">Effacer mes données</button>'}`}

/* ================= first launch: one screen ================= */
const SC_OBC={fb:'ac',hb:'pull',ppl:'push',gf:'glute',gl:'legs'};
/* how a programme splits between muscle families (count of exercises), for the coloured bar */
function scObMix(t){const n={};(t.progs||[]).forEach(p=>p.items.forEach(x=>{const L=LIB.find(l=>l[0]===x.id),g=L?grpOfM(L[2][0]):scG(x.id);n[g]=(n[g]||0)+1}));return SC_FAM.filter(g=>n[g]).map(g=>[g,n[g]])}
function Onboard(){const p=S.prof,ch=view.obt||(S.logs.length?'keep':'fb');
 const pick=['fb','hb','ppl','gf','gl'];
 return `<div class="ob"><div class="col g6"><span class="sc-brand"><span class="sc-logo" aria-hidden="true">${ic('seance',22)}</span>Charge</span><h1>Bienvenue</h1><p class="mut" style="margin:0;font-size:17px">Ton carnet de musculation : l’appli retient tes charges et te dit quand augmenter.</p></div>
  <section class="section"><h2>Choisis un programme</h2><span class="sm mut">Tu pourras le modifier ou en changer quand tu veux.</span>
  <div class="sc-mixl" aria-label="Couleurs des barres : répartition des exercices par famille de muscles">${SC_FAM.map(g=>`<span class="sc-${g}"><i class="sc-dot" aria-hidden="true"></i>${GRPN[g]}</span>`).join('')}</div>
  <div class="col">${S.logs.length?`<button class="item sc-prog sc-ac ${ch==='keep'?'on':''}" aria-pressed="${ch==='keep'}" data-a="obt" data-v="keep">${scIco('ac','check')}<div class="grow"><div class="t">Garder mon programme</div><div class="xs dim">${esc(S.pn)}</div></div>${ch==='keep'?ic('check',20):''}</button>`:''}
  ${pick.map(k=>{const t=TPL[k],c=SC_OBC[k]||'ac',mix=scObMix(t);return `<button class="item sc-prog sc-${c} ${ch===k?'on':''}" aria-pressed="${ch===k}" data-a="obt" data-v="${k}"><span class="sc-ico lg sc-${c}" aria-hidden="true">${t.sess}×</span><div class="grow"><div class="t">${t.n}</div><div class="xs dim">${t.lvl}, ${t.info}</div>${mix.length?`<div class="sc-mix" aria-hidden="true">${mix.map(([g,n])=>`<i class="sc-${g}" style="flex:${n}"></i>`).join('')}</div>`:''}</div>${ch===k?ic('check',20):''}</button>`}).join('')}</div></section>
  <button class="btn big" style="margin-top:auto" data-a="obdone">C’est parti</button>
  <p class="xs dim" style="margin:0;text-align:center">Tout reste sur ce téléphone. Aucun compte à créer.</p></div>`}

/* ================= coach (Claude) ================= */
let coachCtl=null;
async function runCoach(){const ym=view.ym||today().slice(0,7),st=monthStats(ym);coachCtl=new AbortController();view.coach={busy:1};render();
 const days=st.D.map(s=>{const by={};sWork(s.id).forEach(l=>(by[exo(l.e).n]=by[exo(l.e).n]||[]).push(setTxt2(l).replace(/ kg × /,'x')+(l.f==='hard'?'!':l.f==='easy'?'+':'')));
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
