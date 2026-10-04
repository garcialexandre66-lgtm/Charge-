<script>
/* ================= navigation ================= */
const TABS=[['seance','Séance'],['prog','Progrès'],['corps','Corps'],['nut','Nutrition'],['prof','Profil']];
function nav(){if(!S.prof.onb){$('#nav').hidden=true;return}$('#nav').hidden=false;const a=active();
 $('#nav').innerHTML=TABS.map(([k,l])=>`<button data-a="tab" data-v="${k}" ${tab===k?'aria-current="page"':''}>${ic(k)}${l}${k==='seance'&&a&&tab!=='seance'?'<span class="live"></span><span class="sr">, séance en cours</span>':''}</button>`).join('')}
function go(t,v={}){tab=t;view=v;render();scrollTo(0,0)}
function pill(){const a=active(),show=S.prof.onb&&a&&sLogs(a.id).length&&(tab!=='seance'||view.page);
 $('#pill').innerHTML=show?`<button class="spill" data-a="tab" data-v="seance"><i aria-hidden="true"></i>Séance en cours · ${Math.round((Date.now()-a.start)/6e4)} min · Reprendre</button>`:''}
/* empty sessions added after the fact and left without any set are removed */
function cleanEmpty(){const rm=S.sess.filter(s=>s.retro&&s.state==='done'&&!sLogs(s.id).length&&view.sid!==s.id);if(rm.length){rm.forEach(s=>delSession(s.id));save()}}
function render(){cleanEmpty();nav();pill();$('#app').innerHTML=S.prof.onb?({seance:Home,prog:Prog,corps:Corps,nut:Nut,prof:Prof})[tab]():Onboard();
 if(tab==='prog'&&view.page==='ex'&&!$('#ov').innerHTML)startDemo(view.ex)}
/* refresh behind an open sheet without rebuilding the sheet the user is typing in */
function softRender(){if(!$('#ov').innerHTML)render();else{nav();pill()}}
setInterval(()=>{const e=$('#elapsed'),a=active();if(e&&a)e.textContent=Math.round((Date.now()-a.start)/6e4)+' min';pill()},30000);
const back=(a='back')=>`<button class="x" data-a="${a}" aria-label="Retour">${ic('back',20)}</button>`;
const closeBtn=`<button class="x" data-a="close" aria-label="Fermer">${ic('x',18)}</button>`;
/* what to aim for, written for the way the exercise is measured */
function tgtTxt(id,kg,r){const u=uOf(id),lt=ltOf(id),c=u==='reps'?String(r):r+' '+UL[u][0];
 if(lt==='load')return u==='reps'?fmt(kg)+' kg × '+c:c+(kg>0?' · '+fmt(kg)+' kg':'');
 if(lt==='bw')return (kg>0?'PDC + '+fmt(kg)+' kg':'PDC')+(u==='reps'?' × ':' · ')+c;
 return 'assist. '+fmt(kg)+' kg'+(u==='reps'?' × ':' · ')+c}
/* the big number shown for an exercise */
function bigOf(id,l){if(!l)return {n:'—',u:''};const lt=ltOf(id),u=uOf(id);
 if(lt==='load'&&u==='reps')return {n:fmt(l.kg),u:'kg'};if(u!=='reps')return {n:String(l.r),u:UL[u][0]};
 return lt==='bw'?(l.kg>0?{n:'+'+fmt(l.kg),u:'kg'}:{n:String(l.r),u:'rép.'}):{n:fmt(l.kg),u:'kg ass.'}}

/* ================= Séance (home) ================= */
function weekStrip(){const d=new Date(),dn=['L','M','M','J','V','S','D'],mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()+6)%7));
 return dn.map((l,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);const k=key(x),D=sessOfDay(k).filter(s=>s.state==='done'&&sWork(s.id).length),fut=k>today();
  const lab=D.length>1?D.length+' séances':D.length?sessName(D[0]):'';
  return `<button class="wday" data-a="day" data-v="${k}" ${fut?'disabled':''} aria-label="${cap(dLong(k))}${D.length?', '+pl(D.length,'séance'):''}"><span class="xs mut" aria-hidden="true">${l}</span><span class="day ${k===today()?'today':''} ${D.length?'done':''}" aria-hidden="true">${x.getDate()}</span><span class="dlab" aria-hidden="true">${esc(lab)}</span></button>`}).join('')}
function exItem(p,i,P,a){const e=exo(p.id),tw=curWork(p.id),ok=tw.length>=p.s,tg=target(p.id),last=tw.at(-1)||(tg?{e:p.id,kg:tg.kg,r:tg.r}:lastOne(p.id));
 const nextId=a&&P.find(x=>curWork(x.id).length<x.s)?.id,isNext=a&&!ok&&p.id===nextId&&sWork(a.id).length;
 const sub=tw.length?`${tw.length} / ${p.s} série${p.s>1?'s':''} faite${tw.length>1?'s':''}`:tg?`objectif ${tgtTxt(p.id,tg.kg,tg.r)}`:`${p.s} × ${repTxt(p)} · première fois`;
 const big=bigOf(p.id,last);
 return `<button class="item ${ok?'on':isNext?'next':''}" data-a="set" data-v="${p.id}"><span class="thumb">${figId(p.id)?figSvg(figId(p.id),{t:1,arrow:false}):''}${ok?`<span class="ck">${ic('check',26)}</span>`:''}</span>
  <div class="grow"><div class="t">${esc(e.n)}${p.orig?` <span class="tag grey">${ic('swap',12)} remplace ${esc(exo(p.orig).n)}</span>`:''}${p.extra?' <span class="tag grey">ajouté</span>':''}${p.ss&&P[i+1]?' <span class="tag">Superset ↓</span>':i>0&&P[i-1].ss?' <span class="tag">Superset ↑</span>':''}</div>
  <div class="sm mut">${p.s} × ${repTxt(p)}${tw.length||tg?' · '+sub:''}</div></div>
  <div style="text-align:right"><div class="num" style="font-size:28px">${big.n}<span class="mut" style="font-size:15px"> ${big.u}</span></div>${!tw.length&&tg?.up?`<span class="tag">${ic('up',12)} ${ltOf(p.id)==='load'?'+'+fmt(incOf(p.id))+' kg':'progresse'}</span>`:''}</div></button>`}
function Home(){if(view.page==='progs')return Programs();
 const a=active(),P=plan(),stale=isStale(a),X=XP(),T=tierOf(X.lvl);
 const setsTot=P.reduce((s,p)=>s+p.s,0),setsDone=P.reduce((s,p)=>s+Math.min(p.s,curWork(p.id).length),0),nWork=a?sWork(a.id).length:0;
 const nextId=P.find(p=>curWork(p.id).length<p.s)?.id,allDone=a&&!nextId&&nWork>0;
 const estMin=Math.round(P.reduce((s,p)=>s+p.s*((p.rest||S.prof.rest)+45),0)/60/5)*5;
 const hello=S.prof.name?`Salut ${esc(S.prof.name)}`:'Aujourd’hui';
 const r=26,cc=2*Math.PI*r,frac=setsTot?setsDone/setsTot:0;
 /* the main button: start → continue → validate (validating opens the session report, never another set) */
 const cta=a?(allDone?`<button class="btn" data-a="finish">${ic('check',20)} Valider la séance</button>`
   :nextId?`<button class="btn" data-a="set" data-v="${nextId}">${nWork?'Continuer':'Première série'} · ${esc(exo(nextId).n)}</button>`
   :`<button class="btn" data-a="finish">Terminer la séance</button>`)
  :P.length?`<button class="btn" data-a="startsess">${ic('seance',20)} Commencer la séance</button>`:`<button class="btn" data-a="editplan">Ajouter des exercices</button>`;
 const F=fatigue(0),hot=[...new Set(P.flatMap(p=>exo(p.id).m.slice(0,1)))].filter(m=>(F[m]?.f||0)>.5);
 const CH=challenges(),nt=nutDay(today()),g=goals(),st=streak(),sug=suggested();
 return `<div class="row sb"><div class="col" style="gap:2px"><b style="font-size:17px">${hello}</b><span class="sm mut">${cap(dLong(today()))}</span></div>
 <button class="lvl" data-a="tab" data-v="prof" aria-label="Niveau ${X.lvl}, ${T[1]}, voir le profil">${levelRing(X,38)}<span><b style="color:${T[3]}">${T[1]}</b><small>Niveau ${X.lvl} · ${nf(X.xp)} XP</small></span></button></div>
 ${stale?`<section class="card warn col" style="gap:10px"><b>Séance du ${cap(dLong(key(a.start)))} non validée</b><span class="sm mut">Dernière série à ${hm(lastAct(a))}. Valide-la pour la compter, ou continue-la.</span>
  <div class="row"><button class="btn2 grow" data-a="finish">Valider</button><button class="btn2 grow" data-a="set" data-v="${nextId||P[0]?.id||''}">Continuer</button></div></section>`:''}
 <section class="hero ${a?'live':''}" aria-label="Séance">
  <svg class="plate" width="190" height="190" viewBox="0 0 190 190" aria-hidden="true"><circle cx="95" cy="95" r="90" fill="#1E2124"/><circle cx="95" cy="95" r="90" fill="none" stroke="${T[3]}" stroke-width="10" stroke-opacity=".55"/><circle cx="95" cy="95" r="62" fill="none" stroke="#2A2E31" stroke-width="3"/><circle cx="95" cy="95" r="16" fill="#0B0C0D"/>
  <circle cx="95" cy="95" r="${r*2.6}" fill="none" stroke="#3D9BFF" stroke-width="7" stroke-linecap="round" stroke-dasharray="${cc*2.6*frac} ${cc*2.6}" transform="rotate(-90 95 95)" opacity="${frac?1:0}"/></svg>
  <button class="eyebrow link" style="color:var(--ac);min-height:32px" data-a="page" data-v="progs">${a?'Séance en cours':esc(S.pn)} ${ic('chev',12)}</button>
  <h1>${esc(a?sessName(a):prog().n)}</h1>
  <div class="meta">${pl(P.length,'exercice')} · ${pl(setsTot,'série')} · ≈ ${estMin} min${a?` · <span class="ac b">${setsDone}/${setsTot} faites</span> · <span id="elapsed">${Math.round((Date.now()-a.start)/6e4)} min</span>`:''}</div>
  <div class="say">${esc(motivation())}</div>
  ${cta}
 </section>
 <section class="col" aria-label="Exercices"><div class="row sb"><h2 class="lbl">Exercices ${a?'de la séance':'prévus'}</h2><span class="sm ac b">${P.filter(p=>curWork(p.id).length>=p.s).length} / ${P.length}</span></div>
 ${P.map((p,i)=>exItem(p,i,P,a)).join('')||'<div class="empty">Cette séance est vide.<button class="btn2 acb" data-a="editplan">Ajouter des exercices</button></div>'}
 <div class="row"><button class="btn2 grow" data-a="pickex" data-v="today">${ic('plus',16)} Exercice en plus</button><button class="btn2 grow" data-a="editplan">${ic('edit',16)} Modifier le programme</button></div>
 ${a&&nWork&&!allDone?`<button class="btn ghost" data-a="finish">Terminer la séance</button>`:''}
 ${a&&!nWork?`<button class="link mutl" style="align-self:center" data-a="cancelsess">Annuler cette séance (aucune série)</button>`:''}</section>
 ${S.progs.length>1&&!a?`<div class="col g6"><span class="lbl">Séance du jour</span><div class="seg" role="group" aria-label="Séance du jour">${S.progs.map(p=>`<button class="${p.id===S.cur?'on':''}" aria-pressed="${p.id===S.cur}" data-a="pickprog" data-v="${p.id}">${esc(p.n)}${p.id===sug&&p.id!==S.cur?'<span class="dot"></span><span class="sr"> (suggérée)</span>':''}</button>`).join('')}</div>
  ${sug&&sug!==S.cur?`<span class="sm mut">Suite logique de ta rotation : <button class="link" data-a="pickprog" data-v="${sug}">${esc(pname(sug))}</button></span>`:''}</div>`:''}
 ${hot.length&&!allDone?`<div class="card warn row" style="gap:10px"><span class="tag warn">Récup</span><span class="sm">${hot.map(cap).join(', ')} probablement encore sollicité${hot.length>1?'s':''}. Indication approximative : écoute tes sensations.</span></div>`:''}
 <section class="card col" style="gap:12px"><div class="row sb"><span class="streak" style="color:${st?'var(--p15)':'var(--mut)'}">${ic('spark',20)} ${pl(st,'semaine')} d’affilée</span><span class="sm mut">record ${maxStreak()}</span></div>
 <div class="week" role="group" aria-label="Cette semaine (touche un jour pour voir ou corriger)">${weekStrip()}</div></section>
 <section class="card col" style="gap:8px"><div class="row sb"><span class="lbl">Défis de la semaine</span><span class="sm ${CH.every(c=>c.cur>=c.goal)?'okc':'mut'} b">${CH.filter(c=>c.cur>=c.goal).length} / ${CH.length}</span></div>
 ${CH.map(c=>{const ok=c.cur>=c.goal;return `<div class="chal"><span class="ck2 ${ok?'on':''}" aria-hidden="true">${ok?ic('check',14):''}</span><div class="col" style="gap:5px"><span class="sm" style="${ok?'color:var(--mut);text-decoration:line-through':''}">${esc(c.n)}${ok?'<span class="sr"> (réussi)</span>':''}</span><div class="bar" aria-hidden="true"><i style="width:${Math.min(100,c.cur/c.goal*100)}%;background:${ok?'var(--p10)':'var(--ac)'}"></i></div></div><span class="sm mut">${fmt(Math.min(c.cur,c.goal))}${c.unit||''}/${fmt(c.goal)}${c.unit||''}</span></div>`}).join('')}
 ${(()=>{const nb=nextBadge();return nb?`<button class="row link" style="gap:10px;color:var(--fg);font-weight:400;margin-top:4px;border-top:1px solid #2A2E31;padding-top:10px;width:100%" data-a="tab" data-v="prof">${badgeSvg(nb.b,false,32)}<span class="sm grow" style="text-align:left">Prochain trophée : <b>${esc(nb.b.n)}</b><br><span class="xs mut">${esc(nb.txt)}</span></span>${ic('chev',14)}</button>`:''})()}</section>
 ${(()=>{const G=Object.keys(S.goalsEx||{}).map(id=>({id,g:goalInfo(id)})).filter(x=>x.g&&!x.g.done&&S.ex.some(e=>e.id===x.id)).sort((a,b)=>b.g.pct-a.g.pct)[0];
  return G?`<button class="card col" style="gap:8px;text-align:left;width:100%" data-a="exdetail" data-v="${G.id}"><div class="row sb"><span class="lbl">Objectif en cours</span><span class="num" style="font-size:22px;color:var(--ac)">${Math.round(G.g.pct*100)} %</span></div>
  <b>${fmt(G.g.kg)} kg · ${esc(exo(G.id).n)}</b><div class="xpbar" style="height:8px"><i style="width:${Math.round(G.g.pct*100)}%;background:var(--ac)"></i></div><span class="xs mut">Encore ${fmt(G.g.kg-G.g.cur)} kg${G.g.eta?' · vers le '+dShort(G.g.eta)+' au rythme actuel':''}</span></button>`:''})()}
 ${lastWeekCard()}
 <button class="card col" style="text-align:left;width:100%" data-a="tab" data-v="nut"><div class="row sb"><span class="lbl">Nutrition</span><span><b class="num" style="font-size:22px">${nf(nt.k)}</b> / ${nf(g.k)} kcal</span></div>
 <div class="bar" aria-hidden="true"><i class="${nt.k>g.k*1.05?'over':''}" style="width:${Math.min(100,nt.k/g.k*100)}%"></i></div><div class="row sb sm mut"><span>Protéines <b style="color:var(--fg)">${Math.round(nt.p)}</b> / ${g.p} g</span><span>${nt.k>g.k?'Dépassé de '+nf(nt.k-g.k):'Reste '+nf(g.k-nt.k)} kcal</span></div></button>`}

/* ================= Programmes ================= */
function Programs(){const c=view.tpl,a=active();
 return `<div class="row">${back()}<span class="lbl">Ton plan d’entraînement</span></div>
 <h1>Programme</h1>
 ${a?`<div class="card sm">Une séance est en cours : ce que tu changes ici s’applique aux <b>prochaines</b> séances. La séance en cours garde son plan.</div>`:''}
 <section class="card hl col"><label for="pn" style="color:var(--fg)"><span class="lbl">Nom du programme</span><input id="pn" data-c="pn" value="${esc(S.pn)}" maxlength="40"></label>
  <div class="row sb sm"><span class="mut">${pl(S.progs.length,'séance')} en rotation</span><span class="mut">objectif ${S.prof.sess} / semaine</span></div></section>
 <section class="col">${S.progs.map(p=>`<div class="card col g6"><div class="row sb"><b style="font-size:17px">${esc(p.n)}</b>${p.id===S.cur?'<span class="tag">Prochaine</span>':`<button class="link" data-a="pickprog" data-v="${p.id}">Faire la prochaine fois</button>`}</div>
  <div class="sm mut">${p.items.map(x=>`${esc(exo(x.id).n)} ${x.s}×${repTxt(x)}`).join(' · ')||'Aucun exercice'}</div>
  <button class="btn2" data-a="editplan" data-v="${p.id}">${ic('edit',16)} Modifier</button></div>`).join('')}
 <button class="btn2" data-a="addprog">${ic('plus',16)} Ajouter une séance</button></section>
 <section class="col"><h2 class="lbl">Programmes tout prêts</h2>
 ${Object.entries(TPL).map(([k,t])=>`<div class="card col g6 ${c===k?'hl':''}"><div class="row sb"><b>${t.n}</b><span class="tag grey">${t.lvl}</span></div><span class="sm mut">${t.info} · ${t.progs.map(p=>p.n).join(', ')}</span>
  ${c===k?`<span class="sm">Remplacer ton programme par « ${t.n} » ? Ton historique, tes records et tes réglages de machines sont conservés.</span><div class="row"><button class="btn2 grow" data-a="tpl" data-v="">Annuler</button><button class="btn2 grow acb" data-a="usetpl" data-v="${k}">Utiliser</button></div>`
  :`<button class="btn2" data-a="tpl" data-v="${k}">Choisir ce programme</button>`}</div>`).join('')}</section>`}

/* ================= set entry ================= */
const CHIPS={reps:[5,6,8,10,12,15],s:[20,30,45,60,90,120],m:[20,40,60,100,200,400]};
function setSheet(id){if(!id)return;const e=exo(id),p=planItem(id)||{id,s:3,rmin:lastOne(id)?.r||10,rmax:lastOne(id)?.r||10,none:1},tl=curLogs(id),tw=tl.filter(l=>!l.w),lw=lastWork(id),tg=target(id),u=uOf(id),lt=ltOf(id);
 let st=view.st&&view.st.id===id?view.st:{id,kg:tw.at(-1)?.kg??tg?.kg??lw?.at(-1)?.kg??(lt==='load'?20:0),r:tw.at(-1)?.r??tg?.r??p.rmin,f:'ok',dr:null,w:false};view.st=st;
 const pr=pairOf(id),chain=!st.w&&pr&&pr.a.id===id&&curWork(pr.b.id).length<pr.b.s,done=tw.length>=p.s,lastSet=!st.w&&tw.length+1>=p.s;
 const inc=incOf(id),s1=fmt(inc),s2=fmt(inc*4),K=LIM.kg[lt],R=LIM.r[u];
 const pl8=e.k==='barre'&&lt==='load'?plates(st.kg):null;
 const warm=lt==='load'&&e.c&&!tw.length&&(tg?.kg||st.kg)>=30?[[.4,8],[.6,5],[.8,3]].map(([k,r])=>({kg:Math.max(rnd(((tg?.kg)||st.kg)*k,id),0),r})):[];
 const alts=S.ex.filter(x=>x.id!==id&&x.m[0]===e.m[0]&&!plan().some(q=>q.id===x.id)).slice(0,4);
 const lastTxt=lw?`${dShort(key(lw[0].t))} : ${lw.map(l=>setTxt(l)).join(' · ')}`:'';
 sheet(`<div class="grab"></div><div class="row">${closeBtn}<div class="grow"><h2 class="b" style="font-size:18px" id="sheet-title" tabindex="-1">${esc(e.n)}</h2>
 <div class="sm mut">${st.w?'Série d’échauffement':done?'Séries prévues faites · série en plus':'Série '+(tw.length+1)+' sur '+p.s}</div></div>
 <button class="x" data-a="exdetail" data-v="${id}" aria-label="Voir la progression de ${esc(e.n)}">${ic('prog',18)}</button></div>
 <div class="card col g6" style="padding:12px 14px">
  ${tg?`<div class="row sb"><span class="sm mut">Objectif</span><b>${tgtTxt(id,tg.kg,tg.r)}${tg.up?' <span class="tag">'+ic('up',12)+' progression</span>':''}</b></div><span class="xs mut">${esc(tg.why)}${p.none?' Hors programme.':' Plan : '+p.s+' × '+repTxt(p)+'.'}</span>`:`<div class="row sb"><span class="sm mut">Plan</span><b>${p.none?'hors programme':p.s+' × '+repTxt(p)}</b></div><span class="xs mut">Première fois : choisis une charge qui laisse 2 répétitions en réserve.</span>`}
  ${lastTxt?`<div class="sm"><span class="mut">Dernière fois · </span>${esc(lastTxt)}</div>`:''}
  ${e.seat||pr?`<div class="row wrap" style="gap:6px">${e.seat?`<span class="tag">Réglage : ${esc(e.seat)}</span>`:''}${pr?`<span class="tag">Superset avec ${esc(exo(pr.a.id===id?pr.b.id:pr.a.id).n)}</span>`:''}</div>`:''}</div>
 ${!tw.length&&tg&&!st.w?`<button class="btn2 acb" style="min-height:56px;flex-direction:column;gap:0" data-a="again"><span class="b">Enregistrer ${tgtTxt(id,tg.kg,tg.r)} tout de suite</span><span class="xs" style="color:var(--mut)">Note la série telle que prévue, ressenti « Juste ». Annulable.</span></button>`:''}
 <div class="card col" style="align-items:center;border-radius:24px;padding:14px">
  <label for="kgin" class="lbl">${LTIN[lt]}</label>
  <div class="row sb" style="width:100%"><button class="round" data-a="kg" data-v="-1" aria-label="Retirer ${s1} kg">−</button>
  <input id="kgin" class="kgin" data-c="kg" type="number" inputmode="decimal" min="${K[0]}" max="${K[1]}" step="0.25" value="${String(st.kg)}" aria-label="${LTIN[lt]}" aria-describedby="kghelp">
  <button class="round ac" data-a="kg" data-v="1" aria-label="Ajouter ${s1} kg">+</button></div>
  <div class="row" style="gap:8px"><button class="btn2" data-a="kg" data-v="-4" aria-label="Retirer ${s2} kg">−${s2}</button><span class="xs mut" id="kghelp">${lt==='bw'?'0 = sans lest':lt==='assist'?'moins d’assistance = plus dur':'pas de '+s1+' kg'}</span><button class="btn2" data-a="kg" data-v="4" aria-label="Ajouter ${s2} kg">+${s2}</button></div>
  ${pl8?`<div class="col g4" style="width:100%;border-top:1px solid #2A2D2D;padding-top:10px;margin-top:4px;align-items:center">${pl8.under?`<span class="sm mut">Moins que la barre seule (${fmt(pl8.bar)} kg)</span>`
   :`<span class="xs mut">Par côté de la barre de ${fmt(pl8.bar)} kg</span><div class="row wrap" style="gap:6px;justify-content:center">${pl8.out.length?pl8.out.map(x=>`<span class="pill" style="background:#222525;font-weight:600">${fmt2(x)}</span>`).join(''):'<span class="sm">barre seule</span>'}</div>${pl8.exact?'':`<span class="xs warnc">Pas faisable exactement : ${fmt2(pl8.real)} kg avec ces disques</span>`}`}</div>`:''}</div>
 <div class="col"><div class="row sb"><span class="lbl" id="rlab">${UL[u][1]}</span>
  <div class="stepper"><button class="x" data-a="reps" data-v="${st.r-(u==='reps'?1:5)}" aria-label="Moins">−</button><span class="num" aria-live="polite" aria-labelledby="rlab">${st.r}</span><button class="x" data-a="reps" data-v="${st.r+(u==='reps'?1:5)}" aria-label="Plus">+</button></div></div>
  <div class="chips" style="grid-template-columns:repeat(6,1fr)">${CHIPS[u].map(n=>`<button class="chip ${st.r===n?'on':''}" aria-pressed="${st.r===n}" data-a="reps" data-v="${n}">${n}</button>`).join('')}</div></div>
 ${st.w?'':`<div class="col g6"><span class="lbl" id="flab">Ressenti</span><div class="feelh" role="group" aria-labelledby="flab">${Object.entries(FEEL).map(([k,l])=>`<button class="chip ${st.f===k?'on':''}" aria-pressed="${st.f===k}" style="font-size:14px;padding:4px 2px" data-a="feel" data-v="${k}">${l}<small>${FEELD[k]}</small></button>`).join('')}</div></div>`}
 <button class="sw" role="switch" aria-checked="${!!st.w}" data-a="warmtog"><span class="col" style="gap:0"><span class="b sm">Série d’échauffement</span><span class="xs mut">Non comptée dans l’objectif, le volume et les records</span></span><span class="knob" aria-hidden="true"></span></button>
 ${tl.length?`<div class="col g4"><span class="lbl">Cette séance</span>${tl.map(l=>`<div class="hist"><span class="grow">${l.w?'<span class="tag grey">écht</span> ':''}${setTxt(l)} <span class="xs mut">${l.w?'':FEEL[l.f]||''}</span>${isRec(l)?' <span class="tag ok">record</span>':''}</span><button class="x s" data-a="editlog" data-v="${l.id}" aria-label="Corriger la série ${setTxt(l)}">${ic('edit',16)}</button><button class="x s" data-a="dellog" data-v="${l.id}" aria-label="Supprimer la série ${setTxt(l)}">${ic('trash',16)}</button></div>`).join('')}</div>`:''}
 ${warm.length?`<details class="fold"><summary>Échauffement conseillé</summary><div class="col g6"><span class="xs mut">Touche une série pour la noter comme échauffement.</span><div class="row wrap" style="gap:6px">${warm.map(w=>`<button class="pill" data-a="warm" data-v="${w.kg}:${w.r}">${fmt(w.kg)} kg × ${w.r}</button>`).join('')}</div></div></details>`:''}
 ${lastSet&&lt==='load'&&u==='reps'?(st.dr?`<div class="card col" style="gap:8px"><div class="row sb"><span class="lbl">Série dégressive</span><button class="link mutl" data-a="drop" data-v="off">Retirer</button></div>
  <span class="xs mut">Enchaîne sans pause après ta série. Comptée comme une seule série ; son volume s’ajoute partout.</span>
  ${st.dr.map((d,k)=>`<div class="row sb"><span class="num mut" style="font-size:18px;width:20px">${k+1}</span>
   <div class="row" style="gap:6px"><button class="x s" data-a="dropkg" data-v="${k}:-1" aria-label="Palier ${k+1} moins lourd">−</button><span class="num" style="font-size:22px;min-width:64px;text-align:center">${fmt(d.kg)} kg</span><button class="x s" data-a="dropkg" data-v="${k}:1" aria-label="Palier ${k+1} plus lourd">+</button></div>
   <div class="row" style="gap:6px"><button class="x s" data-a="dropr" data-v="${k}:-1" aria-label="Palier ${k+1} une répétition de moins">−</button><span class="num" style="font-size:22px;min-width:28px;text-align:center">${d.r}</span><button class="x s" data-a="dropr" data-v="${k}:1" aria-label="Palier ${k+1} une répétition de plus">+</button></div></div>`).join('')}
  ${st.dr.length<3?'<button class="btn2" data-a="drop" data-v="add">+ Palier</button>':''}</div>`
  :`<button class="btn2" data-a="drop" data-v="add">${ic('down',16)} Finir en série dégressive</button>`):''}
 <details class="fold" ${view.showDemo?'open':''} data-a2="demo"><summary data-a="togdemo">Voir le mouvement</summary>${view.showDemo?`<div class="demo" id="sdemo"></div><div class="legend"><span><i style="background:#FF5A3C"></i>muscles</span><span><i style="border:2px solid #3D9BFF"></i>appuis</span><span style="color:#3D9BFF">→ effort</span></div>`:''}</details>
 ${alts.length&&!tl.length&&!p.extra?`<details class="fold"><summary>${ic('swap',16)} Machine occupée ? Remplacer pour cette séance</summary><div class="col">${alts.map(x=>`<button class="btn2" style="justify-content:flex-start;gap:10px;min-height:56px;text-align:left" data-a="swap" data-v="${x.id}">${thumb(x.id)}<b class="grow">${esc(x.n)}</b><span class="xs mut">${best(x.id)?'record '+fmt(best(x.id))+' kg':'jamais fait'}</span></button>`).join('')}</div></details>`:''}
 ${p.orig?`<button class="link mutl" data-a="unswap" data-v="${p.orig}">Revenir à ${esc(exo(p.orig).n)}</button>`:''}
 ${p.extra&&!tl.length&&active()?`<button class="link mutl" data-a="rmextra" data-v="${id}">Retirer de la séance</button>`:''}
 <div class="sfoot"><p id="seterr" class="sm redc" style="margin:0" role="alert" hidden></p><button class="btn" data-a="validate">${st.w?'Noter l’échauffement':chain?'Valider · enchaîner '+esc(exo(pr.b.id).n):'Valider la série · repos '+mmss(restOf(id))}</button></div>`,'set');
 if(view.showDemo)startDemo(id,'sdemo')}
/* plates per side for a barbell load (greedy, standard plates) */
const PLATES=[25,20,15,10,5,2.5,1.25];
function plates(kg){const bar=S.prof.bar||20;if(kg<bar)return {bar,under:1};let side=(kg-bar)/2+1e-6;const out=[];
 for(const p of PLATES)while(side>=p){out.push(p);side-=p}const real=bar+2*out.reduce((a,b)=>a+b,0);return {bar,out,real,exact:Math.abs(real-kg)<.01}}
/* reads and checks the load / count typed in a sheet; returns null and shows why when out of bounds */
function readSet(id,kgSel,rVal){const lt=ltOf(id),u=uOf(id),K=LIM.kg[lt],R=LIM.r[u],kg=parseNum($(kgSel)?.value),r=rVal;
 const err=m=>{const e=$('#seterr');if(e){e.hidden=false;e.textContent=m}else toast(m);const i=$(kgSel);if(i)i.setAttribute('aria-invalid','true');return null};
 if(!inR(kg,K))return err(`${LTIN[lt]} : entre ${K[0]} et ${K[1]} kg.`);
 if(!(Number.isInteger(r)&&inR(r,R)))return err(`${UL[u][1]} : nombre entier entre ${R[0]} et ${R[1]}.`);
 return {kg:Math.round(kg*100)/100,r}}

function logSet(id,kg,r,f,dr,w){primeAudio();keepAwake();const s=ensureSession();
 if(!s.plan.some(p=>p.id===id)){s.plan.push({id,s:3,rmin:r,rmax:r,extra:1,n:exo(id).n});stamp(s)}
 const t=Math.max(Date.now(),(sLogs(s.id).at(-1)?.t||0)+1);
 const o=addLog({sid:s.id,e:id,kg,r,f:w?undefined:f,t,...(w?{w:1}:{}),...(dr?.length&&!w?{dr:dr.map(d=>({kg:d.kg,r:d.r}))}:{})});
 if(o.f===undefined)delete o.f;save();view.st=null;
 if(w){render();setSheet(id);toast('Échauffement noté : '+setTxt(o),['undo','Annuler',o.id]);return}
 const rec=isRec(o),pr=pairOf(id);if(rec)fanfare();
 /* superset: first exercise done → straight to the second, no rest */
 if(pr&&pr.a.id===id&&curWork(pr.b.id).length<pr.b.s){render();if(rec)return showRec(o,pr.b.id);setSheet(pr.b.id);toast('Superset : enchaîne',['undo','Annuler la série',o.id]);return}
 render();startRest(id,o.id);if(rec)showRec(o);
 const gr=goalHit(id,o);if(gr){setTimeout(()=>toast('Objectif atteint : '+fmt(gr.kg)+' kg à '+esc(exo(id).n)),300);return}
 const nb=evalBadges(),nc=chalCheck();if(nb.length)setTimeout(()=>toast('Trophée débloqué : '+esc(nb[0].n)),400);else if(nc)setTimeout(()=>toast('Défi réussi : '+esc(nc.n)),400)}
const goalHit=(id,o)=>{const g=goalInfo(id);return g&&g.done&&o.kg>=g.kg&&workOf(id).find(l=>l.kg>=g.kg&&l.t>=Date.parse(g.set+'T00:00'))?.id===o.id?g:null};

/* ---------- rest timer: the end time is saved, so a reload or a locked phone does not lose it; only the numbers are updated each tick ---------- */
let timer=null;const RESTK='charge-rest';
function persistRest(){try{view.rest?localStorage.setItem(RESTK,JSON.stringify(view.rest)):localStorage.removeItem(RESTK)}catch(e){}}
function startRest(id,lid){const tl=curWork(id),easy=tl.length>=2&&tl.slice(-2).every(l=>l.f==='easy'),fail=tl.at(-1)?.f==='hard',r=restOf(id),lt=ltOf(id);
 const sug=lt!=='load'?'':easy?`Tes deux dernières séries étaient faciles : essaie ${fmt(tl.at(-1).kg+incOf(id))} kg.`:fail?`Échec sur cette série : garde ${fmt(tl.at(-1).kg)} kg, ou baisse de ${fmt(incOf(id))} kg pour finir propre.`:'';
 view.rest={end:Date.now()+r*1000,total:r,id,lid,sid:active()?.id,beeped:false,sug};persistRest();buildRest()}
function restoreRest(){let R=null;try{R=JSON.parse(localStorage.getItem(RESTK)||'null')}catch(e){}if(!R)return;const a=active();
 if(!a||R.sid!==a.id||Date.now()-R.end>10*6e4){view.rest=null;persistRest();return}view.rest=R;buildRest()}
function buildRest(){const R=view.rest;if(!R||view.rec)return;const P=plan(),nx=afterRest(R.id),q=nx&&P.find(x=>x.id===nx),n=nx?curWork(nx).length:0,more=nx===R.id;
 const nextTxt=!nx?'Toutes les séries prévues sont faites':pairOf(R.id)&&pairOf(R.id).a.id===nx?`Prochain tour du superset : ${esc(exo(nx).n)}, série ${n+1} / ${q.s}`:more?`Prochaine : série ${n+1} / ${q.s}`:`Prochain : ${esc(exo(nx).n)}`;
 openLayer(`<div class="full" style="background:var(--bg)" role="dialog" aria-modal="true" aria-labelledby="rest-title"><h2 class="lbl" id="rest-title" tabindex="-1">Repos · ${esc(exo(R.id).n)}</h2><span class="sm">${nextTxt}</span>
 <svg width="250" height="250" viewBox="0 0 260 260" aria-hidden="true"><circle cx="130" cy="130" r="110" fill="none" stroke="#1A1C1C" stroke-width="14"/>
 <circle id="rarc" cx="130" cy="130" r="110" fill="none" stroke="#3D9BFF" stroke-width="14" stroke-linecap="round" stroke-dasharray="0 692" transform="rotate(-90 130 130)"/>
 <text id="rtime" x="130" y="148" text-anchor="middle" fill="#F4F3EF" font-family="Barlow Condensed, Impact, sans-serif" font-weight="700" font-size="72"></text>
 <text id="rtot" x="130" y="178" text-anchor="middle" fill="#A3A9AE" font-family="DM Sans, sans-serif" font-size="14"></text></svg>
 <span class="sr" id="rlive" role="timer" aria-live="off"></span>
 <div class="row"><button class="btn2 fill" style="min-width:96px" data-a="rest" data-v="-15">−15 s</button><button class="btn2 fill" style="min-width:96px" data-a="rest" data-v="15">+15 s</button></div>
 ${R.sug?`<div class="card sm" style="max-width:340px;text-align:left">${R.sug}</div>`:''}
 <button class="btn" style="max-width:340px" id="rbtn" data-a="skiprest" data-nx="${!nx?'fin':more?'same':'next'}">Passer le repos</button>
 ${R.lid&&S.logs.some(l=>l.id===R.lid)?`<button class="link mutl" data-a="undo" data-v="${R.lid}">${ic('undo',16)} Annuler la dernière série</button>`:''}
 <p class="xs dim" style="max-width:300px;margin:0">Le bip ne sonne que si l’appli est ouverte à l’écran.</p></div>`,'rest');
 clearInterval(timer);timer=setInterval(tickRest,250);tickRest()}
let lastLeft=-1;
function tickRest(){const R=view.rest,t=$('#rtime');if(!R||!t){clearInterval(timer);return}
 const left=Math.max(0,(R.end-Date.now())/1000),sec=Math.ceil(left),c=2*Math.PI*110,frac=R.total?left/R.total:0;
 $('#rarc').setAttribute('stroke-dasharray',`${(c*frac).toFixed(1)} ${c.toFixed(1)}`);
 if(sec!==lastLeft){lastLeft=sec;t.textContent=left>0?mmss(sec):'GO';$('#rtot').textContent='sur '+mmss(R.total);$('#rarc').setAttribute('stroke',left>0?'#3D9BFF':'#32D583');
  const b=$('#rbtn');if(b)b.textContent=left>0?'Passer le repos':b.dataset.nx==='fin'?'Terminer la séance':b.dataset.nx==='same'?'Série suivante':'Exercice suivant';
  if(sec%15===0||left<=0)$('#rlive').textContent=left>0?'Repos restant '+mmss(sec):'Repos terminé'}
 if(left<=0&&!R.beeped){R.beeped=true;persistRest();beep();$('#rlive').setAttribute('aria-live','assertive');$('#rlive').textContent='Repos terminé'}}
function showRec(o,then){view.rec={lid:o.id,then:then||null};const g=gainOf(o.e);
 openLayer(`<div class="full rec" role="dialog" aria-modal="true" aria-labelledby="rec-title"><canvas id="confetti" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true"></canvas><h2 id="rec-title" tabindex="-1" style="font:italic 800 40px/1 var(--fd);text-transform:uppercase;letter-spacing:.5px;position:relative;margin:0">Nouveau record</h2>
 <div class="num" style="font-size:72px;white-space:normal">${esc(setTxt(o))}</div><div style="font-size:18px;font-weight:600">${esc(exo(o.e).n)}</div>
 <div class="tiles t2" style="width:100%;max-width:340px">${ormOk(o)?`<div class="tile" style="background:rgba(14,15,15,.12)"><span class="sm">1RM estimé</span><span class="num">${fmt(Math.round(orm(o.kg,o.r)))} kg</span><span class="xs">calcul indicatif (Epley)</span></div>`:`<div class="tile" style="background:rgba(14,15,15,.12)"><span class="sm">Meilleure série</span><span class="num">${o.r} ${UL[uOf(o.e)][0]}</span></div>`}
 <div class="tile" style="background:rgba(14,15,15,.12)"><span class="sm">Depuis le début</span><span class="num">${g?pctTxt(g.pct):'—'}</span><span class="xs">${g?esc(g.what)+' depuis le '+dShort(g.since):''}</span></div></div>
 <div class="row" style="width:100%;max-width:340px"><button class="btn2 grow" style="border-color:var(--on);color:var(--on);min-height:56px" data-a="undo" data-v="${o.id}">Annuler (erreur)</button><button class="btn grow" style="background:var(--on);color:var(--fg)" data-a="recok">${then?'Continuer le superset':'Continuer'}</button></div></div>`,'rec');
 setTimeout(confetti,60)}

/* ---------- end of session ---------- */
function finish(){const a=active();if(!a)return;const L=sWork(a.id),P=plan();
 if(!L.length)return sheet(`<div class="grab"></div><div class="row sb"><h2 class="md" style="font:italic 800 32px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">Séance vide</h2>${closeBtn}</div>
  <p class="sm" style="margin:0">Aucune série de travail n’est notée${sLogs(a.id).length?' (seulement de l’échauffement)':''} : il n’y a rien à valider, donc ni XP ni trophée.</p>
  <div class="sfoot"><button class="btn" data-a="close">Continuer la séance</button><button class="btn2 danger" data-a="cancelsess">Supprimer cette séance</button></div>`,'finish');
 const musc=[...new Set(L.flatMap(l=>exo(l.e).m.slice(0,2)))],recs=[...new Set(L.filter(isRec).map(l=>l.e))],miss=P.filter(p=>curWork(p.id).length<p.s).length;
 view.mood=view.mood??a.mood??'bien';
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font:italic 800 32px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">Bilan de séance</h2>${closeBtn}</div>
 <span class="sm mut">${esc(sessName(a))} · ${cap(dLong(key(a.start)))} · début ${hm(a.start)}</span>
 <div class="tiles"><div class="tile"><span class="sm mut">Volume</span><span class="num">${volTxt(vol(L))}</span></div>
 <div class="tile"><span class="sm mut">Séries</span><span class="num">${L.length}</span></div>
 <div class="tile"><span class="sm mut">Durée</span><span class="num">${sessMins(a)} min</span></div></div>
 ${miss?`<div class="card warn sm">Il reste ${pl(miss,'exercice')} non terminé${miss>1?'s':''}. Tu peux quand même enregistrer.</div>`:''}
 ${recs.length?`<div class="card hl col g6"><span class="lbl ac">Record${recs.length>1?'s':''} battu${recs.length>1?'s':''}</span>${recs.map(id=>`<b>${esc(exo(id).n)}</b>`).join('')}</div>`:''}
 <div class="col"><div class="row sb"><span class="lbl">Muscles travaillés</span><button class="link" data-a="gocorps">Récupération ${ic('chev',14)}</button></div><div class="row wrap" style="gap:6px">${musc.map(m=>`<span class="pill" style="background:var(--sf)">${cap(m)}</span>`).join('')}</div></div>
 <div class="col"><span class="lbl" id="mlab">Comment tu te sentais ?</span><div class="chips" role="group" aria-labelledby="mlab" style="grid-template-columns:repeat(4,1fr)">${MOODS.map(([k,l])=>`<button class="chip ${view.mood===k?'on':''}" aria-pressed="${view.mood===k}" style="font-size:14px" data-a="mood" data-v="${k}">${l}</button>`).join('')}</div></div>
 <label for="note">Note de séance<input id="note" maxlength="200" placeholder="Ex. épaule un peu raide" value="${esc(view.note??a.note??'')}"></label>
 <div class="sfoot"><button class="btn" data-a="savesession">Enregistrer la séance</button></div>`,'finish')}
/* victory screen: the XP shown is exactly what the session adds to the total */
function winScreen(sid,nb){const s=sessById(sid),TL=sWork(sid),X=XP(),x=X.by[sid]||{vol:0,sess:0,recs:0,week:0,total:0},T=tierOf(X.lvl);
 const before=X.xp-x.total,lb=lvlOf(before),fb=lb===X.lvl?(before-X.cur)/(X.next-X.cur):0,prs=[...new Set(TL.filter(isRec).map(l=>l.e))];
 const prev=doneSess().filter(o=>o.p===s.p&&o.start<s.start).at(-1),pv=prev?vol(sWork(prev.id)):0,v=vol(TL),diff=pv&&v?Math.round((v/pv-1)*100):null,eq=equiv(v);
 const rows=[['Volume (1 XP / 100 kg)',x.vol],['Séance terminée',x.sess],[`Records (${prs.length} × 60)`,x.recs],['Objectif de la semaine atteint',x.week]].filter(r=>r[1]);
 openLayer(`<div class="full win" role="dialog" aria-modal="true" aria-labelledby="win-title" style="justify-content:flex-start;padding-top:calc(40px + env(safe-area-inset-top,0px));gap:16px">
 <canvas id="confetti" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true"></canvas>
 <span class="lbl" style="color:var(--p15)">${esc(sessName(s))} · ${pl(TL.length,'série')} · ${sessMins(s)} min</span>
 <h1 id="win-title" tabindex="-1">Séance<br>validée</h1>
 <div class="col g4" style="align-items:center"><span class="num" style="font-size:64px;color:var(--ac)">${volTxt(v)}</span><span class="sm mut">soulevés${eq?' · '+eq:''}</span></div>
 ${diff!=null?`<span class="tag ${diff>=0?'ok':'grey'}" style="font-size:14px;padding:6px 12px">${diff>=0?'+':''}${diff} % de volume vs ta dernière « ${esc(sessName(s))} »</span>`:''}
 <div class="card col" style="width:100%;max-width:380px;gap:10px;text-align:left">
  <div class="row sb"><span class="row" style="gap:10px">${levelRing(X,44)}<span class="col" style="gap:0"><b style="font:italic 800 18px var(--fd);text-transform:uppercase;color:${T[3]}">${lb<X.lvl?'Niveau '+X.lvl+' atteint !':T[1]+' · niveau '+X.lvl}</b><span class="xs mut">${T[2]}</span></span></span><span class="num" style="font-size:26px;color:var(--p10)">+${x.total} XP</span></div>
  <div class="xpbar" aria-hidden="true"><i id="xpfill" style="width:${Math.round(fb*100)}%;background:${T[3]}"></i></div>
  <div class="col g4">${rows.map(r=>`<div class="kv" style="padding:4px 0"><span class="mut">${r[0]}</span><span class="b">+${r[1]}</span></div>`).join('')}</div>
  <span class="xs mut">Encore ${nf(X.next-X.xp)} XP pour le niveau ${X.lvl+1}</span></div>
 ${prs.length?`<div class="card col g6" style="width:100%;max-width:380px;text-align:left;border-color:var(--p25)"><span class="lbl" style="color:var(--p25)">Record${prs.length>1?'s':''} battu${prs.length>1?'s':''}</span>${prs.map(id=>{const b=TL.filter(l=>l.e===id&&isRec(l)).at(-1);return `<div class="row sb"><b>${esc(exo(id).n)}</b><span class="num" style="font-size:20px">${esc(setTxt(b))}</span></div>`}).join('')}</div>`:''}
 ${nb&&nb.length?`<div class="card col" style="width:100%;max-width:380px;text-align:left;gap:10px"><span class="lbl" style="color:var(--p15)">Trophée${nb.length>1?'s':''} débloqué${nb.length>1?'s':''}</span>${nb.map(b=>`<div class="row" style="gap:12px">${badgeSvg(b,true,44)}<div class="col" style="gap:0"><b>${esc(b.n)}</b><span class="xs mut">${esc(b.d)}</span></div></div>`).join('')}</div>`:''}
 <div class="row" style="width:100%;max-width:380px"><button class="btn2 grow" style="min-height:56px" data-a="sharepng" data-v="${sid}">${ic('camera',16)} Image à partager</button><button class="btn grow" data-a="winok">Continuer</button></div></div>`,'win');
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const f=$('#xpfill');if(f)f.style.width=Math.round(X.frac*100)+'%'}));setTimeout(confetti,60)}

/* ================= plan editor ================= */
const REPS=[1,2,3,4,5,6,8,10,12,15,20,25,30];
function planSheet(){const pg=prog(),a=active();
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font:italic 800 32px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">Modifier la séance</h2>${closeBtn}</div>
 ${a?'<span class="sm mut">Pour les prochaines séances. La séance en cours garde son plan.</span>':''}
 <div class="seg" role="group" aria-label="Séance à modifier">${S.progs.map(p=>`<button class="${p.id===S.cur?'on':''}" aria-pressed="${p.id===S.cur}" data-a="progedit" data-v="${p.id}">${esc(p.n)}</button>`).join('')}<button data-a="addprog" aria-label="Nouvelle séance">+</button></div>
 <label for="pname">Nom de la séance<input id="pname" data-c="pname" maxlength="40" value="${esc(pg.n)}"></label>
 <div class="col">${pg.items.map((p,i)=>{const u=uOf(p.id),R=u==='reps'?REPS:u==='s'?[10,15,20,30,45,60,90,120,180]:[10,20,30,40,50,60,100,200,400];const opt=v=>[...new Set([...R,v])].sort((a,b)=>a-b).map(n=>`<option value="${n}" ${n===v?'selected':''}>${n}</option>`).join('');
  return `<div class="card col" style="gap:8px;padding:12px 14px"><div class="row sb"><b class="grow">${esc(exo(p.id).n)}</b>
  <button class="x s" data-a="mv" data-v="${i}" aria-label="Monter ${esc(exo(p.id).n)}" ${i?'':'disabled'}>${ic('up',16)}</button><button class="x s" data-a="rm" data-v="${i}" aria-label="Retirer ${esc(exo(p.id).n)}">${ic('trash',16)}</button></div>
  <div class="g2"><label>Séries<select id="ps${i}" data-c="ps" data-i="${i}">${[1,2,3,4,5,6,8,10].map(n=>`<option ${p.s===n?'selected':''}>${n}</option>`).join('')}</select></label>
  <label>Repos<select id="pt${i}" data-c="pt" data-i="${i}"><option value="">Défaut (${mmss(S.prof.rest)})</option>${[45,60,90,120,150,180,240].map(n=>`<option value="${n}" ${p.rest===n?'selected':''}>${mmss(n)}</option>`).join('')}</select></label></div>
  <div class="g2"><label>${u==='reps'?'Répétitions de':UL[u][1]+' de'}<select id="pa${i}" data-c="pa" data-i="${i}">${opt(p.rmin)}</select></label><label>à<select id="pb${i}" data-c="pb" data-i="${i}">${opt(p.rmax)}</select></label></div>
  ${i>0&&pg.items[i-1].ss?`<span class="xs ac">Enchaîné en superset avec ${esc(exo(pg.items[i-1].id).n)}</span>`:i<pg.items.length-1?`<button class="btn2 ${p.ss?'acb':''}" data-a="ss" data-v="${i}" aria-pressed="${!!p.ss}">${p.ss?ic('check',16)+' Superset avec '+esc(exo(pg.items[i+1].id).n):'Enchaîner en superset avec le suivant'}</button>`:''}</div>`}).join('')||'<div class="empty">Cette séance est vide.</div>'}</div>
 <span class="xs mut">Fourchette : l’appli te fait monter la charge quand toutes les séries atteignent le haut de la fourchette, sans échec.</span>
 <button class="btn2" data-a="pickex" data-v="plan">${ic('plus',16)} Ajouter un exercice</button>
 ${S.progs.length>1?(view.delprog?`<div class="card col"><span>Supprimer « ${esc(pg.n)} » ? Les séances déjà faites restent dans l’historique avec leur nom.</span><div class="row"><button class="btn2 grow" data-a="delprog" data-v="0">Annuler</button><button class="btn2 grow danger" data-a="delprog" data-v="1">Supprimer</button></div></div>`:`<button class="link" style="color:var(--red)" data-a="delprog" data-v="ask">Supprimer cette séance du programme</button>`):''}
 <div class="sfoot"><button class="btn" data-a="close">Terminé</button></div>`,'plan')}

/* ================= exercise picker ================= */
function exList(q){q=(q||'').trim().toLowerCase();const mode=view.pick,taken=new Set(mode==='plan'?prog().items.map(p=>p.id):mode==='today'?plan().map(p=>p.id):[]);
 const E=S.ex.filter(e=>!taken.has(e.id)&&(!q||e.n.toLowerCase().includes(q)||e.m.some(m=>m.includes(q))));
 if(!E.length)return `<div class="empty">Aucun exercice trouvé. Crée-le ci-dessous.</div>`;
 const by={};E.forEach(e=>(by[e.m[0]]=by[e.m[0]]||[]).push(e));
 return Object.keys(MUS).filter(m=>by[m]).map(m=>`<div class="col g4"><span class="lbl xs" style="margin-top:6px">${cap(m)}</span>${by[m].map(e=>`<button class="food" data-a="addex" data-v="${e.id}">${thumb(e.id)}<div class="grow"><div class="b">${esc(e.n)}</div><div class="xs mut">${KINDS[e.k]||''}${e.m.length>1?' · '+e.m.slice(1).join(', '):''}${best(e.id)?' · record '+fmt(best(e.id))+' kg':''}</div></div>${ic('plus',18)}</button>`).join('')}</div>`).join('')}
function pickSheet(mode){view.pick=mode;
 sheet(`<div class="grab"></div><div class="row sb"><h2 style="font:italic 800 28px/1 var(--fd);text-transform:uppercase;margin:0" id="sheet-title" tabindex="-1">${mode==='plan'?'Ajouter à « '+esc(prog().n)+' »':mode.startsWith('sess:')?'Exercice de la séance':'Exercice en plus'}</h2>${closeBtn}</div>
 ${mode==='today'?'<span class="sm mut">Ajouté seulement à la séance '+(active()?'en cours':'du jour')+'. Ton programme ne change pas.</span>':''}
 <input id="exq" data-i="exq" type="search" placeholder="Rechercher : presse, dorsaux, curl…" aria-label="Rechercher un exercice" autocomplete="off">
 <div id="exlist" class="col">${exList('')}</div>
 <details class="fold" ${view.newex?'open':''}><summary>${ic('plus',16)} Créer un exercice</summary><div class="col" style="margin-top:4px">
 <label for="newex">Nom<input id="newex" maxlength="60" placeholder="Ex. Presse inclinée Technogym"></label>
 <div class="g2"><label for="newm">Muscle principal<select id="newm">${Object.keys(MUS).map(m=>`<option value="${m}">${cap(m)}</option>`).join('')}</select></label>
 <label for="newm2">Secondaire<select id="newm2"><option value="">Aucun</option>${Object.keys(MUS).map(m=>`<option value="${m}">${cap(m)}</option>`).join('')}</select></label></div>
 <div class="g2"><label for="newk">Matériel<select id="newk">${Object.entries(KINDS).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></label>
 <label for="newc">Mouvement<select id="newc"><option value="1">Polyarticulaire</option><option value="0">Isolation</option></select></label></div>
 <div class="g2"><label for="newlt">Charge notée<select id="newlt">${Object.entries(LTL).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></label>
 <label for="newu">Compté en<select id="newu">${Object.entries(UL).map(([k,l])=>`<option value="${k}">${l[1]}</option>`).join('')}</select></label></div>
 <p id="newerr" class="sm redc" style="margin:0" role="alert" hidden>Donne un nom à l’exercice.</p>
 <button class="btn2 acb" data-a="createex">Créer et ajouter</button></div></details>`,'pick')}

/* ================= correct a set (any session, even old ones) ================= */
function editLogSheet(o){/* o = {lid} to correct, or {sid,e} to add a set to a past session */
 const l=o.lid?S.logs.find(x=>x.id===o.lid):null;if(o.lid&&!l)return;const id=l?l.e:o.e,u=uOf(id),lt=ltOf(id),s=sessById(l?l.sid:o.sid);
 view.el=view.el&&view.el.key===(o.lid||o.sid+o.e)?view.el:{key:o.lid||o.sid+o.e,lid:o.lid,sid:o.sid,e:o.e,f:l?.f||'ok',w:!!l?.w,r:l?.r??lastOne(id)?.r??10,dr:l?.dr?structuredClone(l.dr):null,kg:l?.kg??lastOne(id)?.kg??0};
 const E=view.el,R=LIM.r[u];
 sheet(`<div class="grab"></div><div class="row sb"><div class="grow"><h2 class="b" style="font-size:18px" id="sheet-title" tabindex="-1">${l?'Corriger la série':'Ajouter une série'}</h2><span class="sm mut">${esc(exo(id).n)} · ${s?esc(sessName(s))+' du '+dShort(key(s.start)):''}</span></div>${closeBtn}</div>
 <div class="g2"><label for="ekg">${LTIN[lt]}<input id="ekg" type="number" inputmode="decimal" min="${LIM.kg[lt][0]}" max="${LIM.kg[lt][1]}" step="0.25" value="${E.kg}"></label>
 <label for="er">${UL[u][1]}<input id="er" type="number" inputmode="numeric" min="${R[0]}" max="${R[1]}" step="1" value="${E.r}"></label></div>
 ${E.w?'':`<div class="col g6"><span class="lbl" id="eflab">Ressenti</span><div class="feelh" role="group" aria-labelledby="eflab">${Object.entries(FEEL).map(([k,lb])=>`<button class="chip ${E.f===k?'on':''}" aria-pressed="${E.f===k}" style="font-size:14px;padding:4px 2px" data-a="efeel" data-v="${k}">${lb}<small>${FEELD[k]}</small></button>`).join('')}</div></div>`}
 <button class="sw" role="switch" aria-checked="${E.w}" data-a="ewarm"><span class="col" style="gap:0"><span class="b sm">Série d’échauffement</span><span class="xs mut">Exclue de l’objectif, du volume et des records</span></span><span class="knob" aria-hidden="true"></span></button>
 ${E.dr?`<div class="card sm row sb"><span>Dégressif : ${E.dr.map(d=>fmt(d.kg)+' × '+d.r).join(' → ')}</span><button class="link mutl" data-a="edropoff">Retirer</button></div>`:''}
 <span class="xs mut">Les records, objectifs, XP et trophées sont recalculés après la correction.</span>
 <div class="sfoot"><p id="seterr" class="sm redc" style="margin:0" role="alert" hidden></p><div class="row">${l?`<button class="btn2 grow danger" style="min-height:56px" data-a="dellog" data-v="${l.id}">Supprimer</button>`:''}<button class="btn grow" data-a="savelog">Enregistrer</button></div></div>`,'elog')}
</script>
