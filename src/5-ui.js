<script>
/* ================= theme for the exercise drawings ================= */
function themeFig(){if(typeof COL!=='object')return;const dark=matchMedia('(prefers-color-scheme: dark)').matches;
 /* same values as the tokens of 1-head.html (SVG attributes cannot read CSS variables) */
 Object.assign(COL,dark?{body:'#A3AEBF',near:'#C0C9D6',far:'#5F6A7D',line:'#232A38',mus:'#FF6B6B',musl:'#8E1D22',arr:'#F3F4F6',eq:'#74819A',eq2:'#B2BDCD',dark:'#56637B',ac:'#6C93F5',bg:'#1F2533',floor:'#283041',card:'#161B26',
   fam:{push:'#FB923C',pull:'#60A5FA',legs:'#34D399',glute:'#F472B6',core:'#A78BFA'},tint:.13,tint2:.24,shadow:.35}
  :{body:'#C3CCD9',near:'#DCE2EA',far:'#9AA6B8',line:'#556072',mus:'#D12F35',musl:'#9B1C21',arr:'#111827',eq:'#3A4659',eq2:'#9AA6B8',dark:'#263142',ac:'#2F5BEA',bg:'#EEF0F3',floor:'#DCE1E8',card:'#FFFFFF',
   fam:{push:'#EA580C',pull:'#2563EB',legs:'#059669',glute:'#DB2777',core:'#7C3AED'},tint:.13,tint2:.24,shadow:.10})}
themeFig();matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{themeFig();render()});

/* ================= navigation: 4 tabs ================= */
I.home='<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>';
const TABS=[['seance','Accueil','home'],['prog','Progrès','prog'],['nut','Nutrition','nut'],['prof','Moi','prof']];
function nav(){if(!S.prof.onb||BAD){$('#nav').hidden=true;return}$('#nav').hidden=false;const a=active(),cur=tab==='corps'?'prof':tab;
 $('#nav').innerHTML=TABS.map(([k,l,i])=>`<button data-a="tab" data-v="${k}" ${cur===k?'aria-current="page"':''}><span class="ni">${ic(i)}</span>${l}${k==='seance'&&a&&tab!=='seance'?'<span class="live"></span><span class="sr">, séance en cours</span>':''}</button>`).join('')}
function go(t,v={}){tab=t;view=v;render();scrollTo(0,0)}
function pill(){const a=active(),R=view.rest;
 if(R&&S.prof.onb&&!BAD&&!$('#ov').innerHTML){const left=Math.max(0,Math.ceil((R.end-Date.now())/1000));$('#pill').innerHTML=`<button class="spill" data-a="restopen"><i aria-hidden="true"></i>${left>0?'Repos <span id="pillt">'+mmss(left)+'</span>':'Repos terminé'}</button>`;return}
 const show=S.prof.onb&&!BAD&&a&&(tab!=='seance'||view.page);
 $('#pill').innerHTML=show?`<button class="spill" data-a="tab" data-v="seance"><i aria-hidden="true"></i>Reprendre la séance</button>`:''}
/* empty sessions added after the fact and left without any set are removed */
function cleanEmpty(){const rm=S.sess.filter(s=>s.retro&&s.state==='done'&&!sLogs(s.id).length&&view.sid!==s.id);if(rm.length){rm.forEach(s=>delSession(s.id));save()}}
/* a screen that fails to draw shows what happened and how to get your data out, never a blank page */
function render(){if(!BAD)cleanEmpty();nav();pill();let h;
 try{h=BAD?Recovery():S.prof.onb?({seance:Home,prog:Prog,corps:Corps,nut:Nut,prof:Prof})[tab]():Onboard()}
 catch(e){console.error(e);h=`<h1 class="md">Écran indisponible</h1><div class="card col"><p class="sm" style="margin:0">Cet écran n’a pas pu s’afficher. Tes données ne sont pas touchées.</p><p class="xs mut" style="margin:0">Détail : ${esc(e.message)}</p>
  <div class="row"><button class="btn2 grow" data-a="export">Exporter mes données</button><button class="btn2 grow" data-a="tab" data-v="${tab==='prof'?'seance':'prof'}">Aller ${tab==='prof'?'à l’accueil':'à Moi'}</button></div></div>`}
 $('#app').innerHTML=h;if(tab==='prog'&&view.page==='ex'&&!$('#ov').innerHTML)startDemo(view.ex)}
/* refresh behind an open sheet without rebuilding what the user is typing in */
function softRender(){if(!$('#ov').innerHTML&&!document.activeElement?.matches?.('#app input'))render();else{nav();pill()}}
setInterval(()=>{const e=$('#elapsed'),a=active();if(e&&a)e.textContent=Math.round((Date.now()-a.start)/6e4)+' min'},30000);
const back=(a='back',l='Retour')=>`<button class="x" data-a="${a}" aria-label="${l}">${ic('back',22)}</button>`;
const closeBtn=`<button class="x" data-a="close" aria-label="Fermer">${ic('x',20)}</button>`;
const chev=`<span class="chev">${ic('chev',18)}</span>`;
/* loads are shown to 0.01 kg everywhere in the session (61,25 stays 61,25, like the stepper) */
const loadTxt2=(lt,kg)=>lt==='load'?fmt2(kg)+' kg':lt==='bw'?(kg>0?'PDC + '+fmt2(kg)+' kg':'PDC'):'assist. '+fmt2(kg)+' kg';
function setTxt2(l){const u=unL(l),lt=ltL(l),r=u==='reps'?String(l.r):l.r+' '+UL[u][0];let a;
 if(u==='reps')a=loadTxt2(lt,l.kg)+' × '+r;else a=r+(l.kg>0||lt==='assist'?' · '+loadTxt2(lt,l.kg):'');
 if(l.dr?.length)a+=' → '+l.dr.map(d=>fmt2(d.kg)+' × '+d.r).join(' → ');return a}
function tgtTxt(id,kg,r){const u=uOf(id),lt=ltOf(id),c=u==='reps'?String(r):r+' '+UL[u][0];
 if(u==='reps')return loadTxt2(lt,kg)+' × '+c;return c+(kg>0||lt==='assist'?' · '+loadTxt2(lt,kg):'')}
function bigOf(id,l){if(!l)return {n:'—',u:''};const lt=l.lt||ltOf(id),u=l.un||uOf(id);
 if(lt==='load'&&u==='reps')return {n:fmt2(l.kg),u:'kg'};if(u!=='reps')return {n:String(l.r),u:UL[u][0]};
 return lt==='bw'?(l.kg>0?{n:'+'+fmt2(l.kg),u:'kg'}:{n:String(l.r),u:'rép.'}):{n:fmt2(l.kg),u:'kg ass.'}}

/* ================= Accueil ================= */
function weekStrip(){const d=new Date(),dn=['L','M','M','J','V','S','D'],mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()+6)%7));
 return dn.map((l,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);const k=key(x),D=sessOfDay(k).filter(s=>s.state==='done'&&sWork(s.id).length),fut=k>today();
  return `<button data-a="day" data-v="${k}" ${fut?'disabled':''} aria-label="${cap(dLong(k))}${D.length?', '+pl(D.length,'séance'):', pas de séance'}"><span class="xs dim" aria-hidden="true">${l}</span><span class="d ${k===today()?'today':''} ${D.length?'done':''}" aria-hidden="true">${D.length?ic('check',18):x.getDate()}</span></button>`}).join('')}
/* values proposed for the next set: what you typed, else the last set of today, else the target, else last time */
function rowDefaults(id,n){const p=planItem(id)||{s:3,rmin:10},tw=curWork(id),tg=target(id),lw=lastOne(id),lt=ltOf(id),typed=view.rows?.[id]||[],out=[];
 let prev=tw.at(-1)?{kg:tw.at(-1).kg,r:tw.at(-1).r}:tg?{kg:tg.kg,r:tg.r}:lw?{kg:lw.kg,r:lw.r}:{kg:lt==='load'?'':0,r:p.rmin};
 for(let k=0;k<n;k++){const t=typed[k]||{};const v={kg:t.kg??prev.kg,r:t.r??prev.r};out.push(v);prev=v}return out}
function Home(){if(view.page==='progs')return Programs();if(active())return Workout();
 const P=plan(),setsTot=P.reduce((s,p)=>s+p.s,0),estMin=Math.round(P.reduce((s,p)=>s+p.s*((p.rest||S.prof.rest)+45),0)/60/5)*5;
 const m=mondayOf(today()),n=weekN(m),goal=wkGoal(m),st=streak(),last=[...doneSess()].pop();
 const expDays=S.prof.lastExp?daysAgo(S.prof.lastExp):null,needExp=!dbDoc&&!(gOn()&&GS.last&&Date.now()-GS.last<14*864e5)&&doneSess().length>=3&&(expDays==null||expDays>14);
 const h=new Date().getHours(),hello=(h<5||h>=18?'Bonsoir':'Bonjour')+(S.prof.name?' '+esc(S.prof.name):'');
 return `<header class="col g4"><span class="sm dim">${cap(dLong(today()))}</span><h1>${hello}</h1></header>
 <section class="today" aria-label="Séance du jour"><div class="col g4"><span class="k">${ic('seance',16)} Ta séance du jour</span><h2>${esc(prog().n)}</h2><span class="m">${pl(P.length,'exercice')}, environ ${estMin} min</span></div>
  ${P.length?`<div class="exl">${P.slice(0,6).map(p=>`<span><i class="gdot gp-${grp(p.id)}" aria-hidden="true"></i>${esc(exo(p.id).n)}</span>`).join('')}${P.length>6?`<span>+${P.length-6}</span>`:''}</div>`:''}
  ${P.length?`<button class="btn big" data-a="startsess">${ic('seance',22)} Commencer</button>`:`<button class="btn big" data-a="editplan">Ajouter des exercices</button>`}
  <div class="row sb"><button class="link" data-a="choosesess">Changer de séance</button><button class="link" data-a="editplan">Modifier</button></div></section>
 <section class="card col hwk"><div class="row sb"><h2>Cette semaine</h2><span class="wkn ${n>=goal?'ok':''}">${n>=goal?ic('check',14):''}${n} sur ${goal} séance${goal>1?'s':''}</span></div>
  <div class="wkbar" aria-hidden="true"><i style="width:${Math.min(100,Math.round(n/Math.max(1,goal)*100))}%"></i></div>
  <div class="wk" role="group" aria-label="Jours de la semaine">${weekStrip()}</div>
  ${st>1?`<span class="streak">${ic('spark',18)} ${st} semaines d’affilée avec au moins une séance. Continue !</span>`:''}</section>
 ${gPending()&&!gLive()&&G.state!=='sync'?`<section class="card col"><b>Google Drive</b><span class="sm mut">Des modifications ne sont pas encore enregistrées sur ton Google Drive.</span><button class="btn2 acb" data-a="gsync">Synchroniser</button></section>`:''}
 ${needExp?`<section class="card warn col"><b>Pense à sauvegarder</b><span class="sm">${expDays==null?'Tu n’as jamais sauvegardé tes données.':'Dernière sauvegarde '+agoTxt(S.prof.lastExp)+'.'} Connecte Google (onglet Moi) ou exporte un fichier.</span><button class="btn2" data-a="export">Exporter un fichier</button></section>`:''}
 ${last?`<section class="section"><h2 class="lbl">Dernière séance</h2><div class="list">${sessRow(last)}</div></section>`:''}`}
/* choose another session of the programme (only before starting) */
function chooseSheet(){const sug=suggested();
 sheet(`<div class="grab"></div><div class="row sb"><h2 id="sheet-title" tabindex="-1">Quelle séance aujourd’hui ?</h2>${closeBtn}</div>
 <div class="col">${S.progs.map(p=>`<button class="item ${p.id===S.cur?'on':''}" data-a="pickprog" data-v="${p.id}" aria-pressed="${p.id===S.cur}"><div class="grow"><div class="t">${esc(p.n)} ${p.id===sug?'<span class="tag">Suite logique</span>':''}</div><div class="xs dim">${p.items.map(x=>esc(exo(x.id).n)).join(', ')||'Aucun exercice'}</div>${p.items.length?`<div class="chdots" aria-hidden="true">${p.items.map(x=>`<i class="gdot gp-${grp(x.id)}"></i>`).join('')}</div>`:''}</div>${p.id===S.cur?ic('check',20):''}</button>`).join('')}</div>
 <button class="btn2" data-a="gotoprogs">Changer de programme</button>`,'choose')}

/* ================= Séance en cours: one exercise at a time ================= */
function curEx(){const P=plan();if(view.cur&&P.some(p=>p.id===view.cur))return view.cur;return (P.find(p=>curWork(p.id).length<p.s)||P[0])?.id}
function draftOf(id){if(view.draft?.id===id)return view.draft;const d=rowDefaults(id,1)[0],lt=ltOf(id);
 view.draft={id,kg:d.kg===''?(lt==='load'?20:0):+d.kg,r:+d.r||planItem(id)?.rmin||10};return view.draft}
function Workout(){const a=active(),P=plan(),id=curEx(),stale=isStale(a)&&view.keep!==a.id,others=otherActives();
 const nW=sWork(a.id).length,setsTot=P.reduce((s,p)=>s+p.s,0),setsDone=P.reduce((s,p)=>s+Math.min(p.s,curWork(p.id).length),0);
 const top=`<div class="wtop"><div class="grow col" style="gap:2px"><span class="t">${esc(sessName(a))}</span><span class="xs dim"><span id="elapsed">${Math.round((Date.now()-a.start)/6e4)} min</span>, ${setsDone} ${setsDone>1?'séries':'série'} sur ${setsTot}</span></div>
  ${nW?`<button class="btn2 acb" data-a="finish">Terminer</button>`:`<button class="btn2" data-a="cancelsess">Annuler</button>`}</div>
  <div class="wprog" aria-hidden="true"><i style="width:${setsTot?Math.round(setsDone/setsTot*100):0}%"></i></div>`;
 const warn=`${stale?`<section class="card warn col"><b>Séance du ${dLong(key(a.start))} pas validée</b><span class="sm">${key(lastAct(a))!==today()?'Ta prochaine série ouvrira une nouvelle séance, celle-ci sera validée automatiquement.':'Dernière série à '+hm(lastAct(a))+'.'}</span><div class="row"><button class="btn2 grow" data-a="finish">La valider</button><button class="btn2 grow" data-a="keepgoing">Continuer</button></div></section>`:''}
  ${others.map(o=>`<section class="card warn col"><b>Une autre séance est ouverte</b><span class="sm">« ${esc(sessName(o))} », ${dShort(key(o.start))} à ${hm(o.start)}${o.dev&&o.dev!==DEV?', sur un autre appareil':''}.</span><div class="row wrap">${sWork(o.id).length?`<button class="btn2 grow" data-a="closeother" data-v="${o.id}">La valider</button>`:`<button class="btn2 grow" data-a="dropother" data-v="${o.id}">La supprimer</button>`}<button class="btn2 grow" data-a="useother" data-v="${o.id}">Passer dessus</button></div></section>`).join('')}`;
 if(!id)return `${top}${warn}<div class="empty">Cette séance n’a pas d’exercice.<button class="btn2 acb" data-a="pickex" data-v="today">Ajouter un exercice</button></div>`;
 const p=planItem(id),e=exo(id),L=curLogs(id),tw=L.filter(l=>!l.w),lt=ltOf(id),u=uOf(id),tg=target(id),lw=lastWork(id),done=tw.length>=p.s,more=view.more===id;
 const steps=`<div class="steps" role="tablist" aria-label="Exercices de la séance">${P.map((q,i)=>{const ok=curWork(q.id).length>=q.s;return `<button role="tab" aria-selected="${q.id===id}" class="gp-${grp(q.id)} ${q.id===id?'on':''} ${ok?'done':''}" data-a="wex" data-v="${q.id}" aria-label="${i+1}. ${esc(exo(q.id).n)}${ok?', terminé':''}">${ok?ic('check',16):''}${i+1}</button>`}).join('')}<button class="add" data-a="pickex" data-v="today" aria-label="Ajouter un exercice">${ic('plus',18)}</button></div>`;
 const pr=pairOf(id),idx=P.findIndex(q=>q.id===id)+1,g=grp(id),gc='gp-'+g;
 const head=`<div class="exhead ${gc}"><button class="thumb" style="padding:0;border:0" data-a="exdetail" data-v="${id}" aria-label="Voir ${esc(e.n)}">${figId(id)?figSvg(figId(id),{t:1,arrow:false}):''}</button>
  <div class="grow col" style="gap:2px"><span class="meta"><span class="gtag">${GRPN[g]}</span><span class="xs dim">Exercice ${idx} sur ${P.length}</span></span>${pr?`<span class="xs dim">En superset avec ${esc(exo(pr.a.id===id?pr.b.id:pr.a.id).n)}</span>`:''}<h1 class="md" style="margin:0">${esc(e.n)}</h1><span class="sm mut">${p.s} séries de ${repTxt(p)}${e.seat?', réglage '+esc(e.seat):''}</span></div></div>`;
 const goalBox=tg?`<div class="goal ${gc}"><span class="xs b k">${tg.up?'Aujourd’hui, tu montes':'Objectif du jour'}</span><span class="v">${esc(tgtTxt(id,tg.kg,tg.r))}</span><span class="xs mut">${esc(tg.why)}</span></div>`
  :lw?'':`<div class="goal ${gc}"><span class="xs b k">Première fois</span><span class="sm">Choisis une charge que tu pourrais soulever 2 fois de plus que demandé.</span></div>`;
 const rows=[...L.map(l=>`<button class="set done ${l.w?'warm':''}" data-a="editlog" data-v="${l.id}" aria-label="Corriger : ${esc(setTxt2(l))}"><span class="n" aria-hidden="true">${l.w?'éch.':tw.indexOf(l)+1}</span><span class="grow v">${esc(setTxt2(l))}</span>${isRec(l)?'<span class="tag rec">Record</span>':l.w?'':`<span class="xs dim">${FEEL[l.f]||''}</span>`}<span class="chev">${ic('edit',16)}</span></button>`),
  ...Array.from({length:Math.max(0,p.s-tw.length)},(_,k)=>{const n=tw.length+k+1,dd=draftOf(id),d=rowDefaults(id,k+1)[k],kg=d.kg===''?dd.kg:+d.kg;return `<div class="set ${k===0?'now':'todo'}"><span class="n" aria-hidden="true">${n}</span><span class="grow v">${k===0?'À faire maintenant':esc(tgtTxt(id,kg,+d.r))}</span></div>`})].join('');
 const D=draftOf(id),st=u==='reps'?1:5,kL={load:'Charge',bw:'Lest ajouté',assist:'Assistance'}[lt],atMin=D.kg!==''&&parseNum(String(D.kg))<=LIM.kg[lt][0];
 const dials=`<section class="dials ${gc}" aria-label="Série ${tw.length+1}">
  <div class="dial"><span class="lab" id="dkl">${kL} (kg)</span><div class="ctl"><button class="round" id="dkgm" data-a="dkg" data-v="-1" ${atMin?'disabled':''} aria-label="Moins ${fmt(incOf(id))} kg">−</button><input id="dkg" inputmode="decimal" autocomplete="off" aria-labelledby="dkl" value="${String(D.kg).replace('.',',')}"><button class="round" data-a="dkg" data-v="1" aria-label="Plus ${fmt(incOf(id))} kg">+</button></div>${lt!=='load'?`<span class="xs dim">${lt==='bw'?'0 = sans lest':'moins d’assistance = plus dur'}</span>`:''}</div>
  <hr><div class="dial"><span class="lab" id="drl">${UL[u][1]}</span><div class="ctl"><button class="round" data-a="dr" data-v="-${st}" aria-label="Moins ${st}">−</button><input id="dr" inputmode="numeric" autocomplete="off" aria-labelledby="drl" value="${D.r}"><button class="round" data-a="dr" data-v="${st}" aria-label="Plus ${st}">+</button></div></div>
  <p id="seterr" class="sm redc" role="alert" style="margin:0;text-align:center" hidden></p>
  <button class="btn big fam" data-a="wdone">${ic('check',22)} Valider la série ${tw.length+1}</button></section>`;
 const nx=P.find(q=>q.id!==id&&curWork(q.id).length<q.s);
 const after=done&&!more?`<section class="card col exdone"><span class="okt">${ic('check',24)} Exercice terminé</span>
   ${nx?`<button class="btn big" data-a="wex" data-v="${nx.id}">Exercice suivant : ${esc(exo(nx.id).n)}</button>`:`<button class="btn big ok" data-a="finish">Terminer la séance</button>`}
   <button class="link" data-a="wmore" data-v="${id}">${ic('plus',16)} Faire une série en plus</button></section>`:dials;
 return `${top}${warn}${steps}${head}${goalBox}
 ${lw?`<p class="last">${ic('clock',18)}<span>La dernière fois (${dShort(key(lw[0].t))}) : ${lw.map(l=>'<span class="nw">'+esc(setTxt2(l))+'</span>').join(', ')}</span></p>`:''}
 <section class="card wsets ${gc}"><div class="sets">${rows}</div></section>
 ${after}
 <div class="row"><button class="btn2 grow" data-a="set" data-v="${id}">Options</button><button class="btn2 grow" data-a="swapsheet" data-v="${id}">${ic('swap',16)} Remplacer</button></div>`}
/* machine taken: replace this exercise for today */
function swapSheet(id){const e=exo(id),tl=curLogs(id),alts=S.ex.filter(x=>x.id!==id&&x.m[0]===e.m[0]&&!plan().some(q=>q.id===x.id));
 sheet(`<div class="grab"></div><div class="row sb"><h2 id="sheet-title" tabindex="-1">Remplacer ${esc(e.n)}</h2>${closeBtn}</div>
 ${tl.length?'<p class="sm mut" style="margin:0">Des séries sont déjà notées sur cet exercice : il reste dans la séance, ajoute plutôt un exercice.</p><button class="btn2" data-a="pickex" data-v="today">Ajouter un exercice</button>'
 :`<span class="sm mut">Pour aujourd’hui seulement. Ton programme ne change pas.</span><div class="list">${alts.map(x=>`<button class="li gpx gp-${grp(x.id)}" data-a="swapto" data-v="${id}|${x.id}">${thumb(x.id)}<div class="grow"><div class="t">${esc(x.n)}</div><div class="s">${KINDS[x.k]||''}${best(x.id)?', record '+fmt(best(x.id))+' kg':''}</div></div>${chev}</button>`).join('')||'<div class="li">Aucun exercice équivalent.</div>'}</div>`}
 ${planItem(id)?.orig?`<button class="btn2" data-a="unswap" data-v="${planItem(id).orig}">Revenir à ${esc(exo(planItem(id).orig).n)}</button>`:''}
 ${planItem(id)?.extra&&!tl.length?`<button class="btn2 danger" data-a="rmextra" data-v="${id}">Retirer de la séance</button>`:''}`,'swap')}

/* ================= Programmes ================= */
function Programs(){const c=view.tpl,a=active();
 return `<div class="row">${back()}<span class="sm mut">Accueil</span></div><h1>Programme</h1>
 ${a?`<div class="card warn sm">Une séance est en cours : les changements valent pour les prochaines séances.</div>`:''}
 <section class="section"><div class="shead"><h2>Ton programme : ${esc(S.pn)}</h2></div><span class="sm mut">Les séances tournent dans l’ordre. Objectif : ${S.prof.sess} par semaine.</span>
 <div class="list">${S.progs.map(p=>`<button class="li" data-a="editplan" data-v="${p.id}"><div class="grow"><div class="t">${esc(p.n)} ${p.id===S.cur?'<span class="tag">Prochaine</span>':''}</div><div class="s">${pl(p.items.length,'exercice')} : ${p.items.slice(0,4).map(x=>esc(exo(x.id).n)).join(', ')}${p.items.length>4?'…':''}</div></div>${ic('edit',18)}</button>`).join('')}
 <button class="li" data-a="addprog"><span class="ac">${ic('plus',18)} Ajouter une séance</span></button></div>
 <label for="pn">Nom du programme<input id="pn" data-c="pn" value="${esc(S.pn)}" maxlength="40"></label></section>
 ${[['','Programmes tout prêts',''],['f','Fessiers et cuisses','Priorité au bas du corps, avec assez de haut du corps pour rester équilibré.']].map(([cat,h,sub])=>`<section class="section"><div class="shead"><h2>${h}</h2></div>${sub?`<span class="sm mut">${sub}</span>`:''}
 <div class="col">${Object.entries(TPL).filter(([,t])=>(t.cat||'')===cat).map(([k,t])=>{const cc=TPLC[k]||'ac',mix=typeof scObMix==='function'?scObMix(t):[],
   body=`<span class="sc-ico lg sc-${cc}" aria-hidden="true">${t.sess}×</span><div class="grow col" style="gap:3px"><span class="t sc-tt">${t.n}</span><span class="row sc-sub"><span class="sc-tag sc-${t.lvl==='Débutant'?'ok':'warn'}">${t.lvl}</span><span class="xs dim">${t.info}</span></span>${mix.length?`<span class="sc-mix" aria-hidden="true">${mix.map(([g,n])=>`<i class="sc-${g}" style="flex:${n}"></i>`).join('')}</span>`:''}</div>`;
  return c===k?`<div class="item sc-prog sc-${cc} on tplc col">${'<div class="row" style="gap:14px;width:100%;align-items:flex-start">'+body+'</div>'}<span class="sm">Remplacer ton programme par « ${t.n} » ? Ton historique et tes records sont gardés.</span><div class="row" style="width:100%"><button class="btn2 grow" data-a="tpl" data-v="">Annuler</button><button class="btn2 grow acb" data-a="usetpl" data-v="${k}">Oui, l’utiliser</button></div></div>`
  :`<button class="item sc-prog sc-${cc}" data-a="tpl" data-v="${k}">${body}${chev}</button>`}).join('')}</div></section>`).join('')}`}
/* programme colours: same as the first launch screen */
const TPLC={fb:'ac',hb:'pull',ppl:'push',f5:'core',gf:'glute',gl:'legs',gb:'legs',gh:'glute'};
/* ================= data recovery (unreadable data: nothing is written until you choose) ================= */
function Recovery(){if(!view.baks)listBackups().then(L=>{view.baks=L;render()});
 return `<div class="page-head"><span class="date">Charge ne peut pas lire tes données</span><h1 class="md">${esc(BAD.why)}</h1></div>
 <div class="card col"><p class="sm" style="margin:0">Rien n’a été effacé. ${BAD.copy?'Une copie brute a été mise de côté'+(BAD.copy==='idb'?'':' (copie unique)')+'.':'Aucune copie n’a pu être faite : télécharge le fichier brut avant toute autre action.'} Tant que tu n’as pas choisi, l’appli n’écrit rien.</p>
  <button class="btn" data-a="rawdl">Télécharger le fichier brut</button></div>
 <section class="col"><h2>Restaurer une copie de secours</h2>${view.baks?view.baks.filter(b=>b.json!==BAD.raw).map(b=>`<div class="hist"><span class="grow sm">${new Date(b.at).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}<br><span class="xs mut">${esc(b.why)}</span></span><button class="btn2" data-a="restorebak" data-v="${b.at}">Restaurer</button></div>`).join('')||'<p class="sm mut" style="margin:0">Aucune autre copie sur cet appareil.</p>':'<p class="sm mut">Recherche des copies…</p>'}</section>
 ${view.imp?importCard():''}
 <section class="col"><h2>Autres choix</h2><button class="btn2" data-a="import">Importer un fichier de sauvegarde</button>
 ${view.badreset?`<div class="card col"><span class="sm">Repartir de zéro remplace les données illisibles par une appli vide. Le fichier brut reste téléchargeable ici tant que tu n’as pas confirmé.</span><div class="row"><button class="btn2 grow" data-a="badreset" data-v="no">Annuler</button><button class="btn2 grow danger" data-a="badreset" data-v="yes">Repartir de zéro</button></div></div>`:'<button class="link mutl" data-a="badreset" data-v="ask">Repartir de zéro</button>'}</section>`}
function importCard(){const N=view.imp;return `<div class="card hl col"><span class="sm">Remplacer les données par cette sauvegarde (${pl(N.sess.filter(s=>s.state==='done').length,'séance')}, ${pl(N.logs.length,'série')}) ?${BAD?'':' Une copie de secours des données actuelles est faite avant.'}</span>
 ${view.impwarn?`<p class="sm redc" style="margin:0">${view.impwarn}</p>`:''}
 <div class="row"><button class="btn2 grow" data-a="noimp">Annuler</button><button class="btn2 grow acb" data-a="doimp">${view.impforce?'Remplacer sans copie':'Remplacer'}</button></div></div>`}

/* ================= exercise details sheet (warm-up, drop set, plates, swap, movement) ================= */
const CHIPS={reps:[5,6,8,10,12,15],s:[20,30,45,60,90,120],m:[20,40,60,100,200,400]};
function setSheet(id){if(!id)return;const e=exo(id),p=planItem(id)||{id,s:3,rmin:lastOne(id)?.r||10,rmax:lastOne(id)?.r||10,none:1},tl=curLogs(id),tw=tl.filter(l=>!l.w),lw=lastWork(id),tg=target(id),u=uOf(id),lt=ltOf(id);
 const rd=planItem(id)?rowDefaults(id,1)[0]:null,rkg=rd&&rd.kg!==''?parseNum(rd.kg):NaN,rr=rd?parseNum(rd.r):NaN;
 let st=view.st&&view.st.id===id?view.st:{id,kg:isFinite(rkg)?rkg:tw.at(-1)?.kg??tg?.kg??lw?.at(-1)?.kg??(lt==='load'?20:0),r:Number.isInteger(rr)?rr:tw.at(-1)?.r??tg?.r??p.rmin,f:'ok',dr:null,w:false};view.st=st;
 const pr=pairOf(id),chain=!st.w&&pr&&pr.a.id===id&&curWork(pr.b.id).length<pr.b.s,done=tw.length>=p.s,lastSet=!st.w&&tw.length+1>=p.s;
 const inc=incOf(id),s1=fmt(inc),s2=fmt(inc*4),K=LIM.kg[lt];
 const pl8=e.k==='barre'&&lt==='load'?plates(st.kg):null;
 const warm=lt==='load'&&e.c&&!tw.length&&(tg?.kg||st.kg)>=30?[[.4,8],[.6,5],[.8,3]].map(([k,r])=>({kg:Math.max(rnd(((tg?.kg)||st.kg)*k,id),0),r})):[];
 const alts=S.ex.filter(x=>x.id!==id&&x.m[0]===e.m[0]&&!plan().some(q=>q.id===x.id)).slice(0,4);
 sheet(`<div class="grab"></div><div class="row sethead gp-${grp(id)}">${closeBtn}<div class="grow"><h2 id="sheet-title" tabindex="-1">${esc(e.n)}</h2>
 <div class="sm mut"><span class="gtag" style="margin-right:6px">${GRPN[grp(id)]}</span>${st.w?'Série d’échauffement':done?'Séries prévues faites, série en plus':'Série '+(tw.length+1)+' sur '+p.s}</div></div>
 <button class="x" data-a="exdetail" data-v="${id}" aria-label="Voir la progression de ${esc(e.n)}">${ic('prog',18)}</button></div>
 <div class="card col g6">
  ${tg?`<div class="row sb"><span class="sm mut">Objectif</span><b class="${tg.up?'hl':''}">${esc(tgtTxt(id,tg.kg,tg.r))}</b></div><span class="xs mut">${esc(tg.why)}${tg.rule&&!tg.up?' '+esc(tg.rule.replace(loadTxt(ltOf(id),tg.kg),loadTxt2(ltOf(id),tg.kg))):''}</span>`:`<div class="row sb"><span class="sm mut">Plan</span><b>${p.none?'hors programme':p.s+' × '+repTxt(p)}</b></div><span class="xs mut">Première fois : choisis une charge qui laisse 2 répétitions en réserve.</span>`}
  ${lw?`<div class="sm"><span class="mut">Dernière fois, ${dShort(key(lw[0].t))} : </span>${lw.map(l=>'<span class="nw">'+esc(setTxt2(l))+'</span>').join(', ')}</div>`:''}</div>
 <div class="card col" style="align-items:center;padding:14px">
  <label for="kgin" class="lbl">${LTIN[lt]} (kg)</label>
  <div class="row sb kgrow" style="width:100%"><button class="round" data-a="kg" data-v="-1" ${st.kg<=K[0]?'disabled':''} aria-label="Retirer ${s1} kg">−</button>
  <input id="kgin" class="kgin" data-c="kg" type="text" inputmode="decimal" value="${String(st.kg).replace('.',',')}" aria-describedby="kghelp">
  <button class="round ac" data-a="kg" data-v="1" aria-label="Ajouter ${s1} kg">+</button></div>
  <div class="row" style="gap:8px"><button class="btn2" data-a="kg" data-v="-4" ${st.kg<=K[0]?'disabled':''} aria-label="Retirer ${s2} kg">−${s2}</button><span class="xs mut" id="kghelp">${lt==='bw'?'0 = sans lest':lt==='assist'?'moins d’assistance = plus dur':'pas de '+s1+' kg'}</span><button class="btn2" data-a="kg" data-v="4" aria-label="Ajouter ${s2} kg">+${s2}</button></div>
  ${pl8?`<div class="col g4" style="width:100%;border-top:1px solid var(--rule);padding-top:10px;margin-top:4px;align-items:center">${pl8.under?`<span class="sm mut">Moins que la barre seule (${fmt(pl8.bar)} kg)</span>`
   :`<span class="xs mut">Disques par côté, barre de ${fmt(pl8.bar)} kg</span><div class="row wrap" style="gap:6px;justify-content:center">${pl8.out.length?pl8.out.map(x=>`<span class="pill b">${fmt2(x)}</span>`).join(''):'<span class="sm">barre seule</span>'}</div>${pl8.exact?'':`<span class="xs warnc">Pas faisable exactement : ${fmt2(pl8.real)} kg avec ces disques</span>`}`}</div>`:''}</div>
 <div class="col"><div class="row sb"><span class="lbl" id="rlab">${UL[u][1]}</span>
  <div class="stepper"><button class="x" data-a="reps" data-v="${st.r-(u==='reps'?1:5)}" aria-label="Moins">−</button><span class="num" aria-live="polite" aria-labelledby="rlab">${st.r}</span><button class="x" data-a="reps" data-v="${st.r+(u==='reps'?1:5)}" aria-label="Plus">+</button></div></div>
  <div class="chips" style="grid-template-columns:repeat(6,1fr)">${CHIPS[u].map(n=>`<button class="chip ${st.r===n?'on':''}" aria-pressed="${st.r===n}" data-a="reps" data-v="${n}">${n}</button>`).join('')}</div></div>
 ${st.w?'':`<div class="col g6"><span class="lbl" id="flab">Ressenti</span><div class="feelh" role="group" aria-labelledby="flab">${Object.entries(FEEL).map(([k,l])=>`<button class="chip ${st.f===k?'on':''}" aria-pressed="${st.f===k}" style="font-size:14px;padding:4px 2px" data-a="feel" data-v="${k}">${l}<small>${FEELD[k]}</small></button>`).join('')}</div></div>`}
 <button class="sw" role="switch" aria-checked="${!!st.w}" data-a="warmtog"><span class="col" style="gap:0"><span class="b sm">Série d’échauffement</span><span class="xs mut">Hors objectif, volume et records</span></span><span class="knob" aria-hidden="true"></span></button>
 ${warm.length?`<details class="fold"><summary>Échauffement conseillé</summary><div class="col g6"><span class="xs mut">Touche une série pour la noter comme échauffement.</span><div class="row wrap" style="gap:6px">${warm.map(w=>`<button class="pill" data-a="warm" data-v="${w.kg}:${w.r}">${fmt2(w.kg)} kg × ${w.r}</button>`).join('')}</div></div></details>`:''}
 ${lastSet&&lt==='load'&&u==='reps'?(st.dr?`<div class="card col" style="gap:8px"><div class="row sb"><span class="lbl">Série dégressive</span><button class="link mutl" data-a="drop" data-v="off">Retirer</button></div>
  <span class="xs mut">Enchaîne sans pause après ta série. Comptée comme une seule série ; son volume s’ajoute partout.</span>
  ${st.dr.map((d,k)=>`<div class="row sb"><span class="num mut" style="font-size:18px;width:20px">${k+1}</span>
   <div class="row" style="gap:6px"><button class="x s" data-a="dropkg" data-v="${k}:-1" aria-label="Palier ${k+1} moins lourd">−</button><span class="num" style="font-size:22px;min-width:64px;text-align:center">${fmt2(d.kg)} kg</span><button class="x s" data-a="dropkg" data-v="${k}:1" aria-label="Palier ${k+1} plus lourd">+</button></div>
   <div class="row" style="gap:6px"><button class="x s" data-a="dropr" data-v="${k}:-1" aria-label="Palier ${k+1} une répétition de moins">−</button><span class="num" style="font-size:22px;min-width:28px;text-align:center">${d.r}</span><button class="x s" data-a="dropr" data-v="${k}:1" aria-label="Palier ${k+1} une répétition de plus">+</button></div></div>`).join('')}
  ${st.dr.length<3?'<button class="btn2" data-a="drop" data-v="add">Ajouter un palier</button>':''}</div>`
  :`<button class="btn2" data-a="drop" data-v="add">${ic('down',16)} Finir en série dégressive</button>`):''}
 <details class="fold" ${view.showDemo?'open':''}><summary data-a="togdemo">Voir le mouvement</summary>${view.showDemo?`<div class="demo" id="sdemo"></div><div class="legend"><span><i style="background:${COL.mus}"></i>muscles</span><span><i style="border:2px solid ${COL.ac}"></i>appuis</span></div>`:''}</details>
 ${alts.length&&!tl.length&&!p.extra?`<details class="fold"><summary>${ic('swap',16)} Machine occupée ? Remplacer pour cette séance</summary><div class="col">${alts.map(x=>`<button class="btn2" style="justify-content:flex-start;gap:10px;min-height:56px;text-align:left" data-a="swap" data-v="${x.id}">${thumb(x.id)}<b class="grow">${esc(x.n)}</b><span class="xs mut">${best(x.id)?'record '+fmt(best(x.id))+' kg':'jamais fait'}</span></button>`).join('')}</div></details>`:''}
 ${p.orig?`<button class="link mutl" data-a="unswap" data-v="${p.orig}">Revenir à ${esc(exo(p.orig).n)}</button>`:''}
 ${p.extra&&!tl.length&&active()?`<button class="link mutl" data-a="rmextra" data-v="${id}">Retirer de la séance</button>`:''}
 <div class="sfoot"><p id="sseterr" class="sm redc" style="margin:0" role="alert" hidden></p><button class="btn" data-a="validate">${st.w?'Noter l’échauffement':chain?'Valider, puis '+esc(exo(pr.b.id).n):'Valider la série, repos '+mmss(restOf(id))}</button></div>`,'set','setsh gp-'+grp(id));
 if(view.showDemo)startDemo(id,'sdemo')}
const PLATES=[25,20,15,10,5,2.5,1.25];
function plates(kg){const bar=S.prof.bar||20;if(kg<bar)return {bar,under:1};let side=(kg-bar)/2+1e-6;const out=[];
 for(const p of PLATES)while(side>=p){out.push(p);side-=p}const real=bar+2*out.reduce((a,b)=>a+b,0);return {bar,out,real,exact:Math.abs(real-kg)<.01}}
/* checks a load and a count; returns null and shows why when out of bounds */
function checkSet(id,kgRaw,rRaw,errEl,lt=ltOf(id),u=uOf(id)){const K=LIM.kg[lt],R=LIM.r[u],kg=kgRaw===''&&lt!=='load'?0:parseNum(kgRaw),r=parseNum(rRaw);
 const err=m=>{if(errEl){errEl.hidden=false;errEl.textContent=m}else toast(m);return null};
 if(!inR(kg,K))return err(`${LTIN[lt]} : entre ${K[0]} et ${K[1]} kg.`);
 if(!(Number.isInteger(r)&&inR(r,R)))return err(`${UL[u][1]} : nombre entier entre ${R[0]} et ${R[1]}.`);
 return {kg:Math.round(kg*100)/100,r}}
function readSet(id,kgSel,rVal){const i=$(kgSel),v=checkSet(id,i?.value??'',String(rVal),$('#sseterr')||$('#seterr'));if(!v&&i)i.setAttribute('aria-invalid','true');return v}

function logSet(id,kg,r,f,dr,w){primeAudio();keepAwake();const s=ensureSession();
 const t=Math.max(Date.now(),(sLogs(s.id).at(-1)?.t||0)+1);if(!s.plan.some(p=>p.id===id)){s.plan.push({...extraItem(id),rmin:r,rmax:Math.max(r,extraItem(id).rmax),n:exo(id).n});stamp(s)}
 const o=addLog({sid:s.id,e:id,kg,r,f:w?undefined:(f||'ok'),t,...(w?{w:1}:{}),...(dr?.length&&!w?{dr:dr.map(d=>({kg:d.kg,r:d.r}))}:{})});
 if(o.f===undefined)delete o.f;save();view.st=null;
 if(w){render();if(curSheet==='set')setSheet(id);toast('Échauffement noté : '+setTxt2(o),['undo','Annuler',o.id]);return}
 const rec=isRec(o),pr=pairOf(id);if(rec)fanfare();
 if(pr&&pr.a.id===id&&curWork(pr.b.id).length<pr.b.s){focusRow(pr.b.id);if(rec)return showRec(o,pr.b.id);toast('Superset : enchaîne avec '+esc(exo(pr.b.id).n),['undo','Annuler la série',o.id]);return}
 render();startRest(id,o.id);if(rec)showRec(o);
 const gr=goalHit(id,o);if(gr){setTimeout(()=>toast('Objectif atteint : '+fmt(gr.kg)+' kg à '+esc(exo(id).n)),300);return}
 const nb=evalBadges(),nc=chalCheck();if(nb.length)setTimeout(()=>toast('Trophée débloqué : '+esc(nb[0].n)),400);else if(nc)setTimeout(()=>toast('Défi réussi : '+esc(nc.n)),400)}
const goalHit=(id,o)=>{const g=goalInfo(id);return g&&g.done&&o.kg>=g.kg&&workOf(id).find(l=>l.kg>=g.kg&&l.t>=Date.parse(g.set+'T00:00'))?.id===o.id?g:null};
/* after a set, the next line to fill gets the focus */
function focusRow(id){view.cur=id;view.draft=null;view.more=null;if(tab==='seance'&&!$('#ov').innerHTML)render();scrollTo(0,0)}

/* ---------- rest: the end time is saved; only the numbers change each tick. While resting you can say how the set felt. ---------- */
let timer=null;const RESTK='charge-rest';
function persistRest(){try{view.rest?localStorage.setItem(RESTK,JSON.stringify(view.rest)):localStorage.removeItem(RESTK)}catch(e){}}
function startRest(id,lid){const r=restOf(id);view.rest={end:Date.now()+r*1000,total:r,id,lid,sid:active()?.id,beeped:false};persistRest();buildRest()}
/* an exercise added to a session takes its sets and rep range from the programme, else the last session, else its last sets */
function extraItem(id){const fromP=S.progs.flatMap(p=>p.items).find(x=>x.id===id);if(fromP)return {id,s:fromP.s,rmin:fromP.rmin,rmax:fromP.rmax,...(fromP.rest?{rest:fromP.rest}:{}),extra:1};
 const fromS=[...doneSess()].reverse().map(x=>x.plan.find(q=>q.id===id)).find(Boolean);if(fromS)return {id,s:fromS.s,rmin:fromS.rmin,rmax:fromS.rmax,extra:1};
 const lw=lastWork(id);if(lw){const r=Math.max(...lw.map(l=>l.r));return {id,s:Math.min(5,lw.length),rmin:r,rmax:r,extra:1}}
 const u=uOf(id);return u==='reps'?{id,s:3,rmin:10,rmax:12,extra:1}:u==='s'?{id,s:3,rmin:30,rmax:60,extra:1}:{id,s:3,rmin:20,rmax:40,extra:1}}
function restoreRest(){let R=null;try{R=JSON.parse(localStorage.getItem(RESTK)||'null')}catch(e){}if(!R)return;const a=active();
 if(!a||R.sid!==a.id||Date.now()-R.end>10*6e4){view.rest=null;persistRest();return}view.rest=R;keepAwake();buildRest()}
function restSug(R){const tl=curWork(R.id),l=tl.at(-1);if(!l||ltOf(R.id)!=='load')return '';const easy=tl.length>=2&&tl.slice(-2).every(x=>x.f==='easy');
 return easy?`Tes deux dernières séries étaient faciles : essaie ${fmt2(l.kg+incOf(R.id))} kg.`:l.f==='hard'?`Échec : garde ${fmt2(l.kg)} kg, ou baisse de ${fmt(incOf(R.id))} kg pour finir propre.`:''}
function buildRest(){const R=view.rest;if(!R||view.rec)return;keepAwake();const P=plan(),nx=afterRest(R.id),q=nx&&P.find(x=>x.id===nx),n=nx?curWork(nx).length:0,more=nx===R.id,l=S.logs.find(x=>x.id===R.lid);
 const nd=nx?rowDefaults(nx,1)[0]:null,nextTxt=!nx?'Toutes les séries prévues sont faites.':`<b>Ensuite</b> : ${more?'série '+(n+1)+' sur '+q.s:esc(exo(nx).n)}${nd&&nd.kg!==''?', '+esc(tgtTxt(nx,+nd.kg,nd.r)):''}`,g=grp(R.id);
 openLayer(`<div class="full rest gp-${g}" role="dialog" aria-modal="true" aria-labelledby="rest-title"><div class="rhead"><h2 id="rest-title" tabindex="-1">Repos</h2><span class="row" style="gap:8px;justify-content:center;flex-wrap:wrap"><span class="gtag">${GRPN[g]}</span><span class="sm mut">${esc(exo(R.id).n)}${l?', '+esc(setTxt2(l)):''}</span></span></div>
 <div class="rwrap" id="rwrap" aria-hidden="true"><svg viewBox="0 0 120 120" focusable="false"><circle class="trk" cx="60" cy="60" r="54"/><circle class="arc" id="rbar" cx="60" cy="60" r="54" pathLength="100"/></svg><div class="rin"><div class="timer" id="rtime"></div><span class="sm mut" id="rtot"></span></div></div>
 <span class="sr" id="rlive" role="timer" aria-live="off"></span>
 <div class="row"><button class="btn2" style="min-width:96px" data-a="rest" data-v="-15">−15 s</button><button class="btn2" style="min-width:96px" data-a="rest" data-v="15">+15 s</button></div>
 ${l&&!l.w?`<div class="col g6" style="width:100%;max-width:360px"><span class="sm b" id="rfl">Comment était cette série ?</span><div class="feelq" role="group" aria-labelledby="rfl">${Object.entries(FEEL).map(([k,lb])=>`<button class="chip ${l.f===k?'on':''}" aria-pressed="${l.f===k}" data-a="rfeel" data-v="${k}">${lb}</button>`).join('')}</div></div>`:''}
 ${restSug(R)?`<div class="rsug">${ic('spark',18)}<span>${restSug(R)}</span></div>`:''}
 <div class="rnext">${nx?`<i class="gdot gp-${grp(nx)}" aria-hidden="true"></i>`:ic('check',18)}<span class="grow">${nextTxt}</span></div>
 <button class="btn fam" style="max-width:360px" id="rbtn" data-a="skiprest" data-nx="${!nx?'fin':more?'same':'next'}">Passer le repos</button>
 <button class="btn2" style="max-width:360px;width:100%" data-a="restmin">Voir la séance (le repos continue)</button>
 ${l?`<button class="link mutl" data-a="undo" data-v="${R.lid}">${ic('undo',16)} Annuler cette série</button>`:''}
 <p class="xs mut" style="max-width:300px;margin:0">Le bip ne sonne que si l’appli est ouverte à l’écran.</p></div>`,'rest');
 clearInterval(timer);lastLeft=-1;timer=setInterval(tickRest,250);tickRest()}
let lastLeft=-1;
function tickRest(){const R=view.rest,t=$('#rtime');if(!R){clearInterval(timer);return}
 if(!t){if($('#ov').innerHTML)return;const left=Math.max(0,(R.end-Date.now())/1000),pt=$('#pillt');if(pt)pt.textContent=mmss(Math.ceil(left));if(left<=0&&!R.beeped){R.beeped=true;persistRest();beep();pill()}return}
 const left=Math.max(0,(R.end-Date.now())/1000),sec=Math.ceil(left),frac=R.total?left/R.total:0;
 $('#rbar').style.strokeDashoffset=(100-frac*100).toFixed(2);$('#rwrap')?.classList.toggle('over',left<=0);
 if(sec!==lastLeft){lastLeft=sec;t.textContent=left>0?mmss(sec):'Go';$('#rtot').textContent='sur '+mmss(R.total);
  const b=$('#rbtn');if(b)b.textContent=left>0?'Passer le repos':b.dataset.nx==='fin'?'Terminer la séance':b.dataset.nx==='same'?'Série suivante':'Exercice suivant';
  if(sec%15===0||left<=0)$('#rlive').textContent=left>0?'Repos restant '+mmss(sec):'Repos terminé'}
 if(left<=0&&!R.beeped){R.beeped=true;persistRest();beep();$('#rlive').setAttribute('aria-live','assertive');$('#rlive').textContent='Repos terminé'}}
function showRec(o,then){view.rec={lid:o.id,then:then||null};const g=gainOf(o.e);
 openLayer(`<div class="full rec" role="dialog" aria-modal="true" aria-labelledby="rec-title"><canvas id="confetti" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true"></canvas><div class="rechero"><span class="medal" aria-hidden="true">${ic('star',36)}</span><h2 id="rec-title" tabindex="-1">Nouveau record</h2>
 <div class="num">${esc(setTxt2(o))}</div><div class="exn">${esc(exo(o.e).n)}</div>
 <p class="sm" style="max-width:320px;margin:0">${ormOk(o)?`1RM estimé ${fmt(Math.round(orm(o.kg,o.r)))} kg (formule d’Epley, indicatif).`:''}${g?(ormOk(o)&&/1RM/.test(g.what)?' Soit ':' '+esc(cap(g.what))+' ')+pctTxt(g.pct)+' depuis le '+dShort(g.since)+'.':''}</p></div>
 <div class="row" style="width:100%;max-width:360px"><button class="btn2 grow" style="min-height:54px" data-a="undo" data-v="${o.id}">Annuler (erreur)</button><button class="btn grow" data-a="recok">${then?'Continuer le superset':'Continuer'}</button></div></div>`,'rec');
 setTimeout(confetti,60)}

/* ---------- end of session ---------- */
function finish(){const a=active();if(!a)return;const L=sWork(a.id),P=plan();
 if(!L.length)return sheet(`<div class="grab"></div><div class="row sb"><h2 id="sheet-title" tabindex="-1">Séance vide</h2>${closeBtn}</div>
  <p class="sm" style="margin:0">Aucune série de travail n’est notée${sLogs(a.id).length?' (seulement de l’échauffement)':''} : il n’y a rien à valider, donc ni XP ni trophée.</p>
  <div class="sfoot"><button class="btn" data-a="close">Continuer la séance</button><button class="btn2 danger" data-a="cancelsess">Supprimer cette séance</button></div>`,'finish');
 const musc=[...new Set(L.flatMap(l=>exo(l.e).m.slice(0,2)))],recs=[...new Set(L.filter(isRec).map(l=>l.e))],miss=P.filter(p=>curWork(p.id).length<p.s).length;
 view.mood=view.mood??a.mood??'bien';
 sheet(`<div class="grab"></div><div class="row sb"><h2 id="sheet-title" tabindex="-1" style="font-size:26px">Bilan de séance</h2>${closeBtn}</div>
 <span class="sm mut">${esc(sessName(a))}, ${dLong(key(a.start))}, début ${hm(a.start)}</span>
 <div class="tiles ftiles"><div class="tile t-ac"><span class="sm">Séries</span><span class="num">${L.length}</span></div>
 <div class="tile gp-core"><span class="sm">Durée</span><span class="num">${sessMins(a)} min</span></div>
 <div class="tile gp-push"><span class="sm">Volume</span><span class="num" style="font-size:22px">${volTxt(vol(L))}</span></div></div>
 ${miss?`<div class="card warn sm">Il reste ${pl(miss,'exercice')} non terminé${miss>1?'s':''}. Tu peux quand même enregistrer.</div>`:''}
 ${recs.length?`<div class="card col g6 reccard"><span class="lbl">Record${recs.length>1?'s':''}</span>${recs.map(id=>`<span class="row" style="gap:8px">${ic('star',18)}<b>${esc(exo(id).n)}</b></span>`).join('')}</div>`:''}
 <div class="col"><span class="lbl">Muscles travaillés</span><div class="row wrap" style="gap:6px">${musc.map(m=>`<span class="gtag gp-${grpOfM(m)}" style="font-size:15px;padding:5px 12px"><i class="gdot" aria-hidden="true"></i>${cap(m)}</span>`).join('')}</div></div>
 <div class="col"><span class="lbl" id="mlab">Comment tu te sentais ?</span><div class="chips" role="group" aria-labelledby="mlab" style="grid-template-columns:repeat(4,1fr)">${MOODS.map(([k,l])=>`<button class="chip ${view.mood===k?'on':''}" aria-pressed="${view.mood===k}" style="font-size:14px" data-a="mood" data-v="${k}">${l}</button>`).join('')}</div></div>
 <label for="note">Note de séance<input id="note" maxlength="200" placeholder="Ex. épaule un peu raide" value="${esc(view.note??a.note??'')}"></label>
 <div class="sfoot"><button class="btn" data-a="savesession">Enregistrer la séance</button></div>`,'finish')}
/* victory screen: the XP shown is exactly what the session adds to the total */
function winScreen(sid,nb){const s=sessById(sid),TL=sWork(sid),X=XP(),x=X.by[sid]||{sess:0,recs:0,week:0,total:0,nrec:0},T=tierOf(X.lvl);
 const before=X.xp-x.total,lb=lvlOf(before),fb=lb===X.lvl?(before-X.cur)/(X.next-X.cur):0,prs=[...new Set(TL.filter(isRec).map(l=>l.e))];
 const rows=[['Séance terminée',x.sess],[x.nrec>3?`Records (3 comptés sur ${x.nrec})`:`Record${x.nrec>1?'s':''} (${x.nrec} × 30)`,x.recs],['Objectif de la semaine atteint',x.week]].filter(r=>r[1]);
 openLayer(`<div class="full win" role="dialog" aria-modal="true" aria-labelledby="win-title" style="justify-content:flex-start;padding-top:calc(40px + env(safe-area-inset-top,0px));gap:16px">
 <canvas id="confetti" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true"></canvas>
 <div class="winhero"><span class="medal" aria-hidden="true">${ic('check',36)}</span><h1 id="win-title" tabindex="-1">Séance validée</h1><span class="wsub">${esc(sessName(s))}</span>
 <div class="wst"><div><span class="num">${TL.length}</span><span>série${TL.length>1?'s':''}</span></div><div><span class="num">${sessMins(s)}</span><span>min</span></div><div><span class="num">${prs.length}</span><span>record${prs.length>1?'s':''}</span></div></div></div>
 <div class="card col wcard" style="gap:10px">
  <div class="row sb"><span class="row" style="gap:10px">${levelRing(X,44)}<span class="col" style="gap:0"><b>${lb<X.lvl?'Niveau '+X.lvl+' atteint':T[1]+', niveau '+X.lvl}</b><span class="xs mut">${T[2]}</span></span></span><span class="num xpv" style="font-size:28px">+${x.total} XP</span></div>
  <div class="xpbar" aria-hidden="true"><i id="xpfill" style="width:${Math.round(fb*100)}%"></i></div>
  <div class="col g4">${rows.map(r=>`<div class="kv" style="padding:4px 0"><span class="mut">${r[0]}</span><span class="b">+${r[1]}</span></div>`).join('')}</div>
  <span class="xs mut">Encore ${nf(X.next-X.xp)} XP pour le niveau ${X.lvl+1}</span></div>
 ${prs.length?`<div class="card col g6 wcard reccard"><span class="lbl">Record${prs.length>1?'s':''} battu${prs.length>1?'s':''}</span>${prs.map(id=>{const b=TL.filter(l=>l.e===id&&isRec(l)).at(-1);return `<div class="row sb gp-${grp(id)}"><span class="row" style="gap:8px;min-width:0"><i class="gdot" aria-hidden="true"></i><b>${esc(exo(id).n)}</b></span><span class="num" style="font-size:20px">${esc(setTxt2(b))}</span></div>`}).join('')}</div>`:''}
 ${nb&&nb.length?`<div class="card col wcard" style="gap:10px"><span class="lbl">Trophée${nb.length>1?'s':''} débloqué${nb.length>1?'s':''}</span>${nb.map(b=>`<div class="row" style="gap:12px">${badgeSvg(b,true,44)}<div class="col" style="gap:0"><b>${esc(b.n)}</b><span class="xs mut">${esc(b.d)}</span></div></div>`).join('')}</div>`:''}
 <div class="wact"><button class="btn" data-a="winok">Continuer</button><button class="btn2" style="min-height:50px" data-a="sharepng" data-v="${sid}">${ic('camera',18)} Image à partager</button></div></div>`,'win');
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const f=$('#xpfill');if(f)f.style.width=Math.round(X.frac*100)+'%'}));setTimeout(confetti,60)}

/* ================= plan editor ================= */
const REPS=[1,2,3,4,5,6,8,10,12,15,20,25,30];
function planSheet(){const pg=prog(),a=active();
 sheet(`<div class="grab"></div><div class="row sb"><h2 id="sheet-title" tabindex="-1" style="font-size:26px">Modifier la séance</h2>${closeBtn}</div>
 ${a?'<span class="sm mut">Pour les prochaines séances. La séance en cours garde son plan.</span>':''}
 <div class="seg" role="group" aria-label="Séance à modifier">${S.progs.map(p=>`<button class="${p.id===S.cur?'on':''}" aria-pressed="${p.id===S.cur}" data-a="progedit" data-v="${p.id}">${esc(p.n)}</button>`).join('')}<button data-a="addprog" aria-label="Nouvelle séance">+</button></div>
 <label for="pname">Nom de la séance<input id="pname" data-c="pname" maxlength="40" value="${esc(pg.n)}"></label>
 <div class="col">${pg.items.map((p,i)=>{const u=uOf(p.id),R=u==='reps'?REPS:u==='s'?[10,15,20,30,45,60,90,120,180]:[10,20,30,40,50,60,100,200,400];const opt=v=>[...new Set([...R,v])].sort((a,b)=>a-b).map(n=>`<option value="${n}" ${n===v?'selected':''}>${n}</option>`).join('');
  const g=grp(p.id);return `<div class="card col pcard gp-${g}" style="gap:8px"><div class="row sb"><span class="grow col" style="gap:4px;min-width:0"><b>${esc(exo(p.id).n)}</b><span><span class="gtag">${GRPN[g]}</span></span></span>
  <button class="x s" data-a="mv" data-v="${i}" aria-label="Monter ${esc(exo(p.id).n)}" ${i?'':'disabled'}>${ic('up',16)}</button><button class="x s" data-a="rm" data-v="${i}" aria-label="Retirer ${esc(exo(p.id).n)}">${ic('trash',16)}</button></div>
  <div class="g2"><label>Séries<select id="ps${i}" data-c="ps" data-i="${i}">${[1,2,3,4,5,6,8,10].map(n=>`<option ${p.s===n?'selected':''}>${n}</option>`).join('')}</select></label>
  <label>Repos<select id="pt${i}" data-c="pt" data-i="${i}"><option value="">Défaut (${mmss(S.prof.rest)})</option>${[45,60,90,120,150,180,240].map(n=>`<option value="${n}" ${p.rest===n?'selected':''}>${mmss(n)}</option>`).join('')}</select></label></div>
  <div class="g2"><label>${u==='reps'?'Répétitions, de':UL[u][1]+', de'}<select id="pa${i}" data-c="pa" data-i="${i}">${opt(p.rmin)}</select></label><label>à<select id="pb${i}" data-c="pb" data-i="${i}">${opt(p.rmax)}</select></label></div>
  ${i>0&&pg.items[i-1].ss?`<span class="xs">Enchaîné en superset avec ${esc(exo(pg.items[i-1].id).n)}</span>`:i<pg.items.length-1?`<button class="btn2 ${p.ss?'acb':''}" data-a="ss" data-v="${i}" aria-pressed="${!!p.ss}">${p.ss?ic('check',16)+' Superset avec '+esc(exo(pg.items[i+1].id).n):'Enchaîner en superset avec le suivant'}</button>`:''}</div>`}).join('')||'<div class="empty">Cette séance est vide.</div>'}</div>
 <span class="xs mut">La charge monte quand toutes les séries prévues atteignent le haut de la fourchette, sans échec.</span>
 <button class="btn2" data-a="pickex" data-v="plan">${ic('plus',16)} Ajouter un exercice</button>
 ${S.progs.length>1?(view.delprog?`<div class="card col"><span>Supprimer « ${esc(pg.n)} » ? Les séances déjà faites restent dans l’historique avec leur nom.</span><div class="row"><button class="btn2 grow" data-a="delprog" data-v="0">Annuler</button><button class="btn2 grow danger" data-a="delprog" data-v="1">Supprimer</button></div></div>`:`<button class="link mutl" data-a="delprog" data-v="ask">Supprimer cette séance du programme</button>`):''}
 <div class="sfoot"><button class="btn" data-a="close">Terminé</button></div>`,'plan')}

/* ================= exercise picker ================= */
const fold=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function exList(q){q=fold((q||'').trim());const mode=view.pick,taken=new Set(mode==='plan'?prog().items.map(p=>p.id):mode==='today'?plan().map(p=>p.id):[]);
 const E=S.ex.filter(e=>!taken.has(e.id)&&(!q||fold(e.n).includes(q)||e.m.some(m=>fold(m).includes(q))));
 if(!E.length)return `<div class="empty">Aucun exercice trouvé. Crée-le ci-dessous.</div>`;
 const by={};E.forEach(e=>(by[e.m[0]]=by[e.m[0]]||[]).push(e));
 return Object.keys(MUS).filter(m=>by[m]).map(m=>`<div class="col g4 gp-${grpOfM(m)}"><span class="pickh"><i class="gdot" aria-hidden="true"></i><span class="lbl">${cap(m)}</span></span>${by[m].map(e=>`<button class="food pex" data-a="addex" data-v="${e.id}">${thumb(e.id)}<div class="grow"><div class="b">${esc(e.n)}</div><div class="xs mut">${KINDS[e.k]||''}${e.m.length>1?', '+e.m.slice(1).join(', '):''}${best(e.id)?', record '+fmt(best(e.id))+' kg':''}</div></div><span class="add" aria-hidden="true">${ic('plus',18)}</span></button>`).join('')}</div>`).join('')}
function pickSheet(mode){view.pick=mode;
 sheet(`<div class="grab"></div><div class="row sb"><h2 id="sheet-title" tabindex="-1" style="font-size:24px">${mode==='plan'?'Ajouter à « '+esc(prog().n)+' »':mode.startsWith('sess:')?'Exercice de la séance':'Exercice en plus'}</h2>${closeBtn}</div>
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
function editLogSheet(o){const l=o.lid?S.logs.find(x=>x.id===o.lid):null;if(o.lid&&!l)return;const id=l?l.e:o.e,u=l?unL(l):uOf(id),lt=l?ltL(l):ltOf(id),s=sessById(l?l.sid:o.sid);
 view.el=view.el&&view.el.key===(o.lid||o.sid+o.e)?view.el:{key:o.lid||o.sid+o.e,lid:o.lid,sid:o.sid,e:o.e,f:l?.f||'ok',w:!!l?.w,r:l?.r??lastOne(id)?.r??10,dr:l?.dr?structuredClone(l.dr):null,kg:l?.kg??lastOne(id)?.kg??0};
 const E=view.el,R=LIM.r[u];
 sheet(`<div class="grab"></div><div class="row sb"><div class="grow"><h2 id="sheet-title" tabindex="-1">${l?'Corriger la série':'Ajouter une série'}</h2><span class="sm mut">${esc(exo(id).n)}${s?', '+esc(sessName(s))+' du '+dShort(key(s.start)):''}</span></div>${closeBtn}</div>
 <div class="g2"><label for="ekg">${LTIN[lt]} (kg)<input id="ekg" type="text" inputmode="decimal" value="${String(E.kg).replace('.',',')}"></label>
 <label for="er">${UL[u][1]}<input id="er" type="text" inputmode="numeric" value="${E.r}"></label></div>
 ${E.w?'':`<div class="col g6"><span class="lbl" id="eflab">Ressenti</span><div class="feelh" role="group" aria-labelledby="eflab">${Object.entries(FEEL).map(([k,lb])=>`<button class="chip ${E.f===k?'on':''}" aria-pressed="${E.f===k}" style="font-size:14px;padding:4px 2px" data-a="efeel" data-v="${k}">${lb}<small>${FEELD[k]}</small></button>`).join('')}</div></div>`}
 <button class="sw" role="switch" aria-checked="${E.w}" data-a="ewarm"><span class="col" style="gap:0"><span class="b sm">Série d’échauffement</span><span class="xs mut">Hors objectif, volume et records</span></span><span class="knob" aria-hidden="true"></span></button>
 ${E.dr?`<div class="card sm row sb"><span>Dégressif : ${E.dr.map(d=>fmt2(d.kg)+' × '+d.r).join(' → ')}</span><button class="link mutl" data-a="edropoff">Retirer</button></div>`:''}
 ${l&&(l.lt!==ltOf(id)||l.un!==uOf(id))?`<p class="xs mut" style="margin:0">Série notée en « ${LTL[lt]} », ${UL[u][1].toLowerCase()} : elle garde cette mesure.</p>`:''}
 <span class="xs mut">Les records, objectifs, XP et trophées sont recalculés après la correction.</span>
 <div class="sfoot"><p id="sseterr" class="sm redc" style="margin:0" role="alert" hidden></p><div class="row">${l?`<button class="btn2 grow danger" style="min-height:54px" data-a="dellog" data-v="${l.id}">Supprimer</button>`:''}<button class="btn grow" data-a="savelog">Enregistrer</button></div></div>`,'elog')}
</script>
