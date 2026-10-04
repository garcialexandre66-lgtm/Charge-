<script>
/* ================= theme for the exercise drawings ================= */
function themeFig(){if(typeof COL!=='object')return;const dark=matchMedia('(prefers-color-scheme: dark)').matches;
 Object.assign(COL,dark?{body:'#C9D1DE',near:'#E9EDF3',far:'#5C6779',mus:'#FF7468',eq:'#6F7A8C',eq2:'#9AA4B5',dark:'#3B4659',ac:'#FFD83D',bg:'#1A2130',floor:'#3B4659'}
  :{body:'#5E6B82',near:'#18233A',far:'#AEB6C2',mus:'#D9443C',eq:'#8C95A3',eq2:'#6B7486',dark:'#B3BCB1',ac:'#1F5FD6',bg:'#E3E8E1',floor:'#B3BCB1'})}
themeFig();matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{themeFig();render()});

/* ================= navigation ================= */
const TABS=[['seance','Séance'],['prog','Progrès'],['corps','Corps'],['nut','Nutrition'],['prof','Profil']];
function nav(){if(!S.prof.onb||BAD){$('#nav').hidden=true;return}$('#nav').hidden=false;const a=active();
 $('#nav').innerHTML=TABS.map(([k,l])=>`<button data-a="tab" data-v="${k}" ${tab===k?'aria-current="page"':''}>${ic(k)}${l}${k==='seance'&&a&&tab!=='seance'?'<span class="live"></span><span class="sr">, séance en cours</span>':''}</button>`).join('')}
function go(t,v={}){tab=t;view=v;render();scrollTo(0,0)}
function pill(){const a=active(),show=S.prof.onb&&!BAD&&a&&sLogs(a.id).length&&(tab!=='seance'||view.page);
 $('#pill').innerHTML=show?`<button class="spill" data-a="tab" data-v="seance"><i aria-hidden="true"></i>Séance en cours, ${Math.round((Date.now()-a.start)/6e4)} min</button>`:''}
/* empty sessions added after the fact and left without any set are removed */
function cleanEmpty(){const rm=S.sess.filter(s=>s.retro&&s.state==='done'&&!sLogs(s.id).length&&view.sid!==s.id);if(rm.length){rm.forEach(s=>delSession(s.id));save()}}
/* a screen that fails to draw shows what happened and how to get your data out, never a blank page */
function render(){if(!BAD)cleanEmpty();nav();pill();let h;
 try{h=BAD?Recovery():S.prof.onb?({seance:Home,prog:Prog,corps:Corps,nut:Nut,prof:Prof})[tab]():Onboard()}
 catch(e){console.error(e);h=`<h1 class="md">Écran indisponible</h1><div class="card col"><p class="sm" style="margin:0">Cet écran n’a pas pu s’afficher. Tes données ne sont pas touchées.</p><p class="xs mut" style="margin:0">Détail : ${esc(e.message)}</p>
  <div class="row"><button class="btn2 grow" data-a="export">Exporter mes données</button><button class="btn2 grow" data-a="tab" data-v="${tab==='prof'?'seance':'prof'}">Aller ${tab==='prof'?'à la séance':'au profil'}</button></div></div>`}
 $('#app').innerHTML=h;if(tab==='prog'&&view.page==='ex'&&!$('#ov').innerHTML)startDemo(view.ex)}
/* refresh behind an open sheet without rebuilding the sheet the user is typing in */
function softRender(){if(!$('#ov').innerHTML&&!document.activeElement?.matches?.('#app input'))render();else{nav();pill()}}
setInterval(()=>{const e=$('#elapsed'),a=active();if(e&&a)e.textContent=Math.round((Date.now()-a.start)/6e4)+' min';pill()},30000);
const back=(a='back')=>`<button class="x" data-a="${a}" aria-label="Retour">${ic('back',20)}</button>`;
const closeBtn=`<button class="x" data-a="close" aria-label="Fermer">${ic('x',18)}</button>`;
function tgtTxt(id,kg,r){const u=uOf(id),lt=ltOf(id),c=u==='reps'?String(r):r+' '+UL[u][0];
 if(u==='reps')return loadTxt(lt,kg)+' × '+c;return c+(kg>0||lt==='assist'?' · '+loadTxt(lt,kg):'')}
function bigOf(id,l){if(!l)return {n:'—',u:''};const lt=l.lt||ltOf(id),u=l.un||uOf(id);
 if(lt==='load'&&u==='reps')return {n:fmt(l.kg),u:'kg'};if(u!=='reps')return {n:String(l.r),u:UL[u][0]};
 return lt==='bw'?(l.kg>0?{n:'+'+fmt(l.kg),u:'kg'}:{n:String(l.r),u:'rép.'}):{n:fmt(l.kg),u:'kg ass.'}}

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

/* ================= Séance: the logbook page ================= */
function weekStrip(){const d=new Date(),dn=['L','M','M','J','V','S','D'],mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()+6)%7));
 return dn.map((l,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);const k=key(x),D=sessOfDay(k).filter(s=>s.state==='done'&&sWork(s.id).length),fut=k>today();
  const lab=D.length>1?D.length+' séances':D.length?sessName(D[0]):'';
  return `<button class="wday" data-a="day" data-v="${k}" ${fut?'disabled':''} aria-label="${cap(dLong(k))}${D.length?', '+pl(D.length,'séance'):''}"><span class="xs mut" aria-hidden="true">${l}</span><span class="day ${k===today()?'today':''} ${D.length?'done':''}" aria-hidden="true">${x.getDate()}</span><span class="dlab" aria-hidden="true">${esc(lab)}</span></button>`}).join('')}
/* default values of the pending lines of an exercise: what you typed, else the line above, else the target, else last time */
function rowDefaults(id,n){const p=planItem(id)||{s:3,rmin:10},tw=curWork(id),tg=target(id),lw=lastOne(id),lt=ltOf(id),typed=view.rows?.[id]||[],out=[];
 let prev=tw.at(-1)?{kg:tw.at(-1).kg,r:tw.at(-1).r}:tg?{kg:tg.kg,r:tg.r}:lw?{kg:lw.kg,r:lw.r}:{kg:lt==='load'?'':0,r:p.rmin};
 for(let k=0;k<n;k++){const t=typed[k]||{};const v={kg:t.kg??prev.kg,r:t.r??prev.r};out.push(v);prev=v}return out}
function exBlock(p,i,P,a,nowId){const e=exo(p.id),id=p.id,L=curLogs(id),tw=L.filter(l=>!l.w),u=uOf(id),lt=ltOf(id),tg=target(id),ok=tw.length>=p.s;
 const pend=Math.max(0,p.s-tw.length),D=rowDefaults(id,Math.max(pend,1)),uL=u==='reps'?'rép.':UL[u][0],kL=lt==='load'?'kg':lt==='bw'?'+kg':'ass.';
 const pr=pairOf(id),cur=nowId===id;
 const head=`<div class="exh"><button class="thumb" data-a="set" data-v="${id}" aria-label="Détails de ${esc(e.n)}" style="padding:0">${figId(id)?figSvg(figId(id),{t:1,arrow:false}):''}${ok?`<span class="ck">${ic('check',24)}</span>`:''}</button>
  <button class="grow" data-a="set" data-v="${id}" style="background:none;border:0;padding:0;text-align:left;color:var(--ink);min-height:44px"><div class="t">${esc(e.n)}</div>
  <div class="p">${p.s} × ${repTxt(p)}${p.orig?', remplace '+esc(exo(p.orig).n):''}${p.extra?', ajouté':''}${pr?', superset avec '+esc(exo(pr.a.id===id?pr.b.id:pr.a.id).n):''}${e.seat?', réglage '+esc(e.seat):''}</div>
  ${!tw.length&&tg?`<div class="goal">${tg.up?'<b class="hl">'+esc(tgtTxt(id,tg.kg,tg.r))+'</b> aujourd’hui':'Objectif <b>'+esc(tgtTxt(id,tg.kg,tg.r))+'</b>'}</div>`:''}</button>
  <button class="x s" data-a="set" data-v="${id}" aria-label="Plus d’options pour ${esc(e.n)}">${ic('more',18)}</button></div>`;
 const done=L.map(l=>`<div class="srow done ${l.w?'warm':''}"><span class="n" aria-hidden="true">${l.w?'éch.':tw.indexOf(l)+1}</span>
  <button class="vbtn" data-a="editlog" data-v="${l.id}" aria-label="Corriger ${l.w?'l’échauffement':'la série '+(tw.indexOf(l)+1)} : ${esc(setTxt(l))}"><span class="val">${esc(setTxt(l))}</span>${l.w?'':`<span class="xs mut">${FEEL[l.f]||''}</span>`}${isRec(l)?'<span class="tag rec">record</span>':''}</button>
  <span class="tick on" aria-hidden="true">${ic('check',22)}</span></div>`).join('');
 const rows=pend?D.slice(0,pend).map((v,k)=>{const n=tw.length+k+1,now=cur&&k===0;
  return `<div class="srow ${now?'now':''}"><span class="n" aria-hidden="true">${n}</span>
  <label class="fld"><span class="sr">${LTIN[lt]} série ${n}</span><input inputmode="decimal" autocomplete="off" data-row="${id}|${k}|kg" value="${v.kg===''?'':String(v.kg).replace('.',',')}" placeholder="${lt==='load'?'–':'0'}"><span aria-hidden="true">${kL}</span></label>
  <span class="xx" aria-hidden="true">×</span>
  <label class="fld"><span class="sr">${UL[u][1]} série ${n}</span><input inputmode="numeric" autocomplete="off" data-row="${id}|${k}|r" value="${v.r}"><span aria-hidden="true">${uL}</span></label>
  <button class="tick" data-a="tick" data-v="${id}|${k}" aria-label="Valider la série ${n} de ${esc(e.n)}">${ic('check',22)}</button></div>`}).join(''):'';
 return `<section class="exb ${ok?'done':''} ${cur?'cur':''}" aria-label="${esc(e.n)}">${head}<div class="srows">${done}${rows}</div>
 <div class="addrow">${ok?`<button class="link mutl" data-a="tickmore" data-v="${id}">${ic('plus',16)} Série en plus</button>`:''}</div></section>`}
function Home(){if(view.page==='progs')return Programs();
 const a=active(),P=plan(),stale=isStale(a)&&view.keep!==a.id,others=otherActives();
 const setsTot=P.reduce((s,p)=>s+p.s,0),setsDone=P.reduce((s,p)=>s+Math.min(p.s,curWork(p.id).length),0),nWork=a?sWork(a.id).length:0;
 const nowId=P.find(p=>curWork(p.id).length<p.s)?.id,allDone=a&&!nowId&&nWork>0;
 const estMin=Math.round(P.reduce((s,p)=>s+p.s*((p.rest||S.prof.rest)+45),0)/60/5)*5;
 const F=fatigue(0),hot=[...new Set(P.flatMap(p=>exo(p.id).m.slice(0,1)))].filter(m=>(F[m]?.f||0)>.5);
 const CH=challenges(),nt=nutDay(today()),g=goals(),st=streak(),sug=suggested();
 const expDays=S.prof.lastExp?daysAgo(S.prof.lastExp):null,needExp=!dbDoc&&doneSess().length>=3&&(expDays==null||expDays>14);
 return `<header class="page-head"><span class="date">${cap(dLong(today()))}${S.prof.name?', '+esc(S.prof.name):''}</span>
 <h1>${esc(a?sessName(a):prog().n)}</h1>
 ${a?`<div class="livebar"><span class="dotr" aria-hidden="true"></span><span>En cours depuis <span id="elapsed">${Math.round((Date.now()-a.start)/6e4)} min</span>, ${setsDone} séries sur ${setsTot}</span></div>`
  :`<span class="meta">${pl(P.length,'exercice')}, ${pl(setsTot,'série')}, environ ${estMin} min. <button class="link" style="min-height:0" data-a="page" data-v="progs">Changer de programme</button></span>`}</header>
 ${stale?`<section class="card warn col" style="gap:10px"><b>Séance du ${dLong(key(a.start))} pas encore validée</b><span class="sm">Dernière série à ${hm(lastAct(a))}. Valide-la pour la compter, ou continue-la.</span>
  <div class="row"><button class="btn2 grow" data-a="finish">Valider</button><button class="btn2 grow" data-a="keepgoing">Continuer</button></div></section>`:''}
 ${others.map(o=>`<section class="card warn col" style="gap:10px"><b>Une autre séance est ouverte</b><span class="sm">« ${esc(sessName(o))} », commencée le ${dShort(key(o.start))} à ${hm(o.start)}${o.dev&&o.dev!==DEV?' sur un autre appareil':''}, ${pl(sWork(o.id).length,'série')}.</span>
  <div class="row wrap">${sWork(o.id).length?`<button class="btn2 grow" data-a="closeother" data-v="${o.id}">La valider</button>`:`<button class="btn2 grow" data-a="dropother" data-v="${o.id}">La supprimer (vide)</button>`}<button class="btn2 grow" data-a="useother" data-v="${o.id}">Continuer celle-ci</button></div></section>`).join('')}
 ${allDone?`<button class="btn hlb" data-a="finish">${ic('check',20)} Valider la séance</button>`:!a&&P.length?`<p class="xs mut" style="margin:-8px 0 0">Coche une série pour démarrer la séance. Les charges proposées viennent de ta dernière fois.</p>`:''}
 ${P.map((p,i)=>exBlock(p,i,P,a,nowId)).join('')||'<div class="empty">Cette séance est vide.<button class="btn2 acb" data-a="editplan">Ajouter des exercices</button></div>'}
 <div class="row"><button class="btn2 grow" data-a="pickex" data-v="today">${ic('plus',16)} Exercice en plus</button><button class="btn2 grow" data-a="editplan">${ic('edit',16)} Modifier</button></div>
 ${a&&nWork&&!allDone?`<button class="btn ghost" data-a="finish">Terminer la séance</button>`:''}
 ${a&&!nWork?`<button class="link mutl" style="align-self:center" data-a="cancelsess">Annuler cette séance</button>`:''}
 ${S.progs.length>1&&!a?`<section class="col g6"><h2 class="lbl">Séance du jour</h2><div class="seg" role="group" aria-label="Séance du jour">${S.progs.map(p=>`<button class="${p.id===S.cur?'on':''}" aria-pressed="${p.id===S.cur}" data-a="pickprog" data-v="${p.id}">${esc(p.n)}${p.id===sug&&p.id!==S.cur?'<span class="dot"></span><span class="sr"> (suggérée)</span>':''}</button>`).join('')}</div>
  ${sug&&sug!==S.cur?`<span class="sm mut">Suite de ta rotation : <button class="link" data-a="pickprog" data-v="${sug}">${esc(pname(sug))}</button></span>`:''}</section>`:''}
 ${hot.length&&!allDone?`<p class="sm mut" style="margin:0">${hot.map(cap).join(', ')} : séance récente sur ce${hot.length>1?'s':''} muscle${hot.length>1?'s':''}. Fie-toi à tes sensations.</p>`:''}
 ${needExp?`<section class="card col" style="gap:8px"><b>Sauvegarde</b><span class="sm">${expDays==null?'Tu n’as jamais exporté tes données.':'Dernier export '+agoTxt(S.prof.lastExp)+'.'} Tout est sur ce téléphone uniquement : un fichier exporté te protège si le téléphone est perdu ou effacé.</span><button class="btn2 acb" data-a="export">Exporter maintenant</button></section>`:''}
 <section class="col" style="gap:8px"><div class="row sb"><h2 class="lbl">Cette semaine</h2><span class="streak">${st?pl(st,'semaine')+' d’affilée':''}</span></div>
 <div class="week" role="group" aria-label="Cette semaine (touche un jour pour voir ou corriger)">${weekStrip()}</div></section>
 <details class="fold"><summary>Défis de la semaine, ${CH.filter(c=>c.cur>=c.goal).length} sur ${CH.length}</summary>
 ${CH.map(c=>{const ok=c.cur>=c.goal;return `<div class="chal"><span class="ck2 ${ok?'on':''}" aria-hidden="true">${ok?ic('check',14):''}</span><div class="col" style="gap:5px"><span class="sm" style="${ok?'color:var(--ink2);text-decoration:line-through':''}">${esc(c.n)}${ok?'<span class="sr"> (réussi)</span>':''}</span><div class="bar" aria-hidden="true"><i style="width:${Math.min(100,c.cur/c.goal*100)}%"></i></div></div><span class="sm mut">${fmt(Math.min(c.cur,c.goal))}/${fmt(c.goal)}</span></div>`}).join('')}
 ${(()=>{const nb=nextBadge();return nb?`<button class="row link" style="gap:10px;text-decoration:none;font-weight:400;margin-top:4px;width:100%" data-a="tab" data-v="prof">${badgeSvg(nb.b,false,32)}<span class="sm grow" style="text-align:left">Prochain trophée : <b>${esc(nb.b.n)}</b><br><span class="xs mut">${esc(nb.txt)}</span></span>${ic('chev',14)}</button>`:''})()}</details>
 ${lastWeekCard()}
 <button class="card col" style="text-align:left;width:100%;color:var(--ink)" data-a="tab" data-v="nut"><div class="row sb"><span class="lbl">Nutrition</span><span><b class="num" style="font-size:22px">${nf(nt.k)}</b> sur ${nf(g.k)} kcal</span></div>
 <div class="bar" aria-hidden="true"><i class="${nt.k>g.k*1.05?'over':''}" style="width:${Math.min(100,nt.k/g.k*100)}%"></i></div><span class="sm mut">Protéines ${Math.round(nt.p)} sur ${g.p} g</span></button>`}

/* ================= Programmes ================= */
function Programs(){const c=view.tpl,a=active();
 return `<div class="row">${back()}<span class="lbl">Ton plan d’entraînement</span></div>
 <h1>Programme</h1>
 ${a?`<div class="card sm">Une séance est en cours : ce que tu changes ici vaut pour les <b>prochaines</b> séances. La séance en cours garde son plan.</div>`:''}
 <section class="card col"><label for="pn">Nom du programme<input id="pn" data-c="pn" value="${esc(S.pn)}" maxlength="40"></label>
  <span class="sm mut">${pl(S.progs.length,'séance')} en rotation, objectif ${S.prof.sess} par semaine</span></section>
 <section class="col">${S.progs.map(p=>`<div class="card col g6"><div class="row sb"><h2>${esc(p.n)}</h2>${p.id===S.cur?'<span class="tag">Prochaine</span>':`<button class="link" data-a="pickprog" data-v="${p.id}">Faire la prochaine fois</button>`}</div>
  <div class="sm mut">${p.items.map(x=>`${esc(exo(x.id).n)} ${x.s}×${repTxt(x)}`).join(', ')||'Aucun exercice'}</div>
  <button class="btn2" data-a="editplan" data-v="${p.id}">${ic('edit',16)} Modifier</button></div>`).join('')}
 <button class="btn2" data-a="addprog">${ic('plus',16)} Ajouter une séance</button></section>
 <section class="col"><h2>Programmes tout prêts</h2>
 ${Object.entries(TPL).map(([k,t])=>`<div class="card col g6 ${c===k?'hl':''}"><div class="row sb"><b>${t.n}</b><span class="tag grey">${t.lvl}</span></div><span class="sm mut">${t.info}. ${t.progs.map(p=>p.n).join(', ')}.</span>
  ${c===k?`<span class="sm">Remplacer ton programme par « ${t.n} » ? Ton historique, tes records et tes réglages de machines sont conservés.</span><div class="row"><button class="btn2 grow" data-a="tpl" data-v="">Annuler</button><button class="btn2 grow acb" data-a="usetpl" data-v="${k}">Utiliser</button></div>`
  :`<button class="btn2" data-a="tpl" data-v="${k}">Choisir ce programme</button>`}</div>`).join('')}</section>`}

/* ================= exercise details sheet (warm-up, drop set, plates, swap, movement) ================= */
const CHIPS={reps:[5,6,8,10,12,15],s:[20,30,45,60,90,120],m:[20,40,60,100,200,400]};
function setSheet(id){if(!id)return;const e=exo(id),p=planItem(id)||{id,s:3,rmin:lastOne(id)?.r||10,rmax:lastOne(id)?.r||10,none:1},tl=curLogs(id),tw=tl.filter(l=>!l.w),lw=lastWork(id),tg=target(id),u=uOf(id),lt=ltOf(id);
 let st=view.st&&view.st.id===id?view.st:{id,kg:tw.at(-1)?.kg??tg?.kg??lw?.at(-1)?.kg??(lt==='load'?20:0),r:tw.at(-1)?.r??tg?.r??p.rmin,f:'ok',dr:null,w:false};view.st=st;
 const pr=pairOf(id),chain=!st.w&&pr&&pr.a.id===id&&curWork(pr.b.id).length<pr.b.s,done=tw.length>=p.s,lastSet=!st.w&&tw.length+1>=p.s;
 const inc=incOf(id),s1=fmt(inc),s2=fmt(inc*4),K=LIM.kg[lt];
 const pl8=e.k==='barre'&&lt==='load'?plates(st.kg):null;
 const warm=lt==='load'&&e.c&&!tw.length&&(tg?.kg||st.kg)>=30?[[.4,8],[.6,5],[.8,3]].map(([k,r])=>({kg:Math.max(rnd(((tg?.kg)||st.kg)*k,id),0),r})):[];
 const alts=S.ex.filter(x=>x.id!==id&&x.m[0]===e.m[0]&&!plan().some(q=>q.id===x.id)).slice(0,4);
 sheet(`<div class="grab"></div><div class="row">${closeBtn}<div class="grow"><h2 id="sheet-title" tabindex="-1">${esc(e.n)}</h2>
 <div class="sm mut">${st.w?'Série d’échauffement':done?'Séries prévues faites, série en plus':'Série '+(tw.length+1)+' sur '+p.s}</div></div>
 <button class="x" data-a="exdetail" data-v="${id}" aria-label="Voir la progression de ${esc(e.n)}">${ic('prog',18)}</button></div>
 <div class="card col g6">
  ${tg?`<div class="row sb"><span class="sm mut">Objectif</span><b class="${tg.up?'hl':''}">${esc(tgtTxt(id,tg.kg,tg.r))}</b></div><span class="xs mut">${esc(tg.why)}${tg.rule&&!tg.up?' '+esc(tg.rule):''}</span>`:`<div class="row sb"><span class="sm mut">Plan</span><b>${p.none?'hors programme':p.s+' × '+repTxt(p)}</b></div><span class="xs mut">Première fois : choisis une charge qui laisse 2 répétitions en réserve.</span>`}
  ${lw?`<div class="sm"><span class="mut">Dernière fois, ${dShort(key(lw[0].t))} : </span>${esc(lw.map(l=>setTxt(l)).join(', '))}</div>`:''}</div>
 <div class="card col" style="align-items:center;padding:14px">
  <label for="kgin" class="lbl">${LTIN[lt]} (kg)</label>
  <div class="row sb" style="width:100%"><button class="round" data-a="kg" data-v="-1" aria-label="Retirer ${s1} kg">−</button>
  <input id="kgin" class="kgin" data-c="kg" type="text" inputmode="decimal" value="${String(st.kg).replace('.',',')}" aria-describedby="kghelp">
  <button class="round ac" data-a="kg" data-v="1" aria-label="Ajouter ${s1} kg">+</button></div>
  <div class="row" style="gap:8px"><button class="btn2" data-a="kg" data-v="-4" aria-label="Retirer ${s2} kg">−${s2}</button><span class="xs mut" id="kghelp">${lt==='bw'?'0 = sans lest':lt==='assist'?'moins d’assistance = plus dur':'pas de '+s1+' kg'}</span><button class="btn2" data-a="kg" data-v="4" aria-label="Ajouter ${s2} kg">+${s2}</button></div>
  ${pl8?`<div class="col g4" style="width:100%;border-top:1px solid var(--rule);padding-top:10px;margin-top:4px;align-items:center">${pl8.under?`<span class="sm mut">Moins que la barre seule (${fmt(pl8.bar)} kg)</span>`
   :`<span class="xs mut">Disques par côté, barre de ${fmt(pl8.bar)} kg</span><div class="row wrap" style="gap:6px;justify-content:center">${pl8.out.length?pl8.out.map(x=>`<span class="pill b">${fmt2(x)}</span>`).join(''):'<span class="sm">barre seule</span>'}</div>${pl8.exact?'':`<span class="xs warnc">Pas faisable exactement : ${fmt2(pl8.real)} kg avec ces disques</span>`}`}</div>`:''}</div>
 <div class="col"><div class="row sb"><span class="lbl" id="rlab">${UL[u][1]}</span>
  <div class="stepper"><button class="x" data-a="reps" data-v="${st.r-(u==='reps'?1:5)}" aria-label="Moins">−</button><span class="num" aria-live="polite" aria-labelledby="rlab">${st.r}</span><button class="x" data-a="reps" data-v="${st.r+(u==='reps'?1:5)}" aria-label="Plus">+</button></div></div>
  <div class="chips" style="grid-template-columns:repeat(6,1fr)">${CHIPS[u].map(n=>`<button class="chip ${st.r===n?'on':''}" aria-pressed="${st.r===n}" data-a="reps" data-v="${n}">${n}</button>`).join('')}</div></div>
 ${st.w?'':`<div class="col g6"><span class="lbl" id="flab">Ressenti</span><div class="feelh" role="group" aria-labelledby="flab">${Object.entries(FEEL).map(([k,l])=>`<button class="chip ${st.f===k?'on':''}" aria-pressed="${st.f===k}" style="font-size:14px;padding:4px 2px" data-a="feel" data-v="${k}">${l}<small>${FEELD[k]}</small></button>`).join('')}</div></div>`}
 <button class="sw" role="switch" aria-checked="${!!st.w}" data-a="warmtog"><span class="col" style="gap:0"><span class="b sm">Série d’échauffement</span><span class="xs mut">Hors objectif, volume et records</span></span><span class="knob" aria-hidden="true"></span></button>
 ${warm.length?`<details class="fold"><summary>Échauffement conseillé</summary><div class="col g6"><span class="xs mut">Touche une série pour la noter comme échauffement.</span><div class="row wrap" style="gap:6px">${warm.map(w=>`<button class="pill" data-a="warm" data-v="${w.kg}:${w.r}">${fmt(w.kg)} kg × ${w.r}</button>`).join('')}</div></div></details>`:''}
 ${lastSet&&lt==='load'&&u==='reps'?(st.dr?`<div class="card col" style="gap:8px"><div class="row sb"><span class="lbl">Série dégressive</span><button class="link mutl" data-a="drop" data-v="off">Retirer</button></div>
  <span class="xs mut">Enchaîne sans pause après ta série. Comptée comme une seule série ; son volume s’ajoute partout.</span>
  ${st.dr.map((d,k)=>`<div class="row sb"><span class="num mut" style="font-size:18px;width:20px">${k+1}</span>
   <div class="row" style="gap:6px"><button class="x s" data-a="dropkg" data-v="${k}:-1" aria-label="Palier ${k+1} moins lourd">−</button><span class="num" style="font-size:22px;min-width:64px;text-align:center">${fmt(d.kg)} kg</span><button class="x s" data-a="dropkg" data-v="${k}:1" aria-label="Palier ${k+1} plus lourd">+</button></div>
   <div class="row" style="gap:6px"><button class="x s" data-a="dropr" data-v="${k}:-1" aria-label="Palier ${k+1} une répétition de moins">−</button><span class="num" style="font-size:22px;min-width:28px;text-align:center">${d.r}</span><button class="x s" data-a="dropr" data-v="${k}:1" aria-label="Palier ${k+1} une répétition de plus">+</button></div></div>`).join('')}
  ${st.dr.length<3?'<button class="btn2" data-a="drop" data-v="add">Ajouter un palier</button>':''}</div>`
  :`<button class="btn2" data-a="drop" data-v="add">${ic('down',16)} Finir en série dégressive</button>`):''}
 <details class="fold" ${view.showDemo?'open':''}><summary data-a="togdemo">Voir le mouvement</summary>${view.showDemo?`<div class="demo" id="sdemo"></div><div class="legend"><span><i style="background:${COL.mus}"></i>muscles</span><span><i style="border:2px solid ${COL.ac}"></i>appuis</span></div>`:''}</details>
 ${alts.length&&!tl.length&&!p.extra?`<details class="fold"><summary>${ic('swap',16)} Machine occupée ? Remplacer pour cette séance</summary><div class="col">${alts.map(x=>`<button class="btn2" style="justify-content:flex-start;gap:10px;min-height:56px;text-align:left" data-a="swap" data-v="${x.id}">${thumb(x.id)}<b class="grow">${esc(x.n)}</b><span class="xs mut">${best(x.id)?'record '+fmt(best(x.id))+' kg':'jamais fait'}</span></button>`).join('')}</div></details>`:''}
 ${p.orig?`<button class="link mutl" data-a="unswap" data-v="${p.orig}">Revenir à ${esc(exo(p.orig).n)}</button>`:''}
 ${p.extra&&!tl.length&&active()?`<button class="link mutl" data-a="rmextra" data-v="${id}">Retirer de la séance</button>`:''}
 <div class="sfoot"><p id="seterr" class="sm redc" style="margin:0" role="alert" hidden></p><button class="btn" data-a="validate">${st.w?'Noter l’échauffement':chain?'Valider, puis '+esc(exo(pr.b.id).n):'Valider la série, repos '+mmss(restOf(id))}</button></div>`,'set');
 if(view.showDemo)startDemo(id,'sdemo')}
const PLATES=[25,20,15,10,5,2.5,1.25];
function plates(kg){const bar=S.prof.bar||20;if(kg<bar)return {bar,under:1};let side=(kg-bar)/2+1e-6;const out=[];
 for(const p of PLATES)while(side>=p){out.push(p);side-=p}const real=bar+2*out.reduce((a,b)=>a+b,0);return {bar,out,real,exact:Math.abs(real-kg)<.01}}
/* checks a load and a count; returns null and shows why when out of bounds */
function checkSet(id,kgRaw,rRaw,errEl){const lt=ltOf(id),u=uOf(id),K=LIM.kg[lt],R=LIM.r[u],kg=kgRaw===''&&lt!=='load'?0:parseNum(kgRaw),r=parseNum(rRaw);
 const err=m=>{if(errEl){errEl.hidden=false;errEl.textContent=m}else toast(m);return null};
 if(!inR(kg,K))return err(`${LTIN[lt]} : entre ${K[0]} et ${K[1]} kg.`);
 if(!(Number.isInteger(r)&&inR(r,R)))return err(`${UL[u][1]} : nombre entier entre ${R[0]} et ${R[1]}.`);
 return {kg:Math.round(kg*100)/100,r}}
function readSet(id,kgSel,rVal){const i=$(kgSel),v=checkSet(id,i?.value??'',String(rVal),$('#seterr'));if(!v&&i)i.setAttribute('aria-invalid','true');return v}

function logSet(id,kg,r,f,dr,w){primeAudio();keepAwake();const s=ensureSession();
 if(!s.plan.some(p=>p.id===id)){s.plan.push({id,s:3,rmin:r,rmax:r,extra:1,n:exo(id).n});s.plan=dedupe(s.plan);stamp(s)}
 const t=Math.max(Date.now(),(sLogs(s.id).at(-1)?.t||0)+1);
 const o=addLog({sid:s.id,e:id,kg,r,f:w?undefined:(f||'ok'),t,...(w?{w:1}:{}),...(dr?.length&&!w?{dr:dr.map(d=>({kg:d.kg,r:d.r}))}:{})});
 if(o.f===undefined)delete o.f;save();view.st=null;
 if(w){render();toast('Échauffement noté : '+setTxt(o),['undo','Annuler',o.id]);return}
 const rec=isRec(o),pr=pairOf(id);if(rec)fanfare();
 if(pr&&pr.a.id===id&&curWork(pr.b.id).length<pr.b.s){render();if(rec)return showRec(o,pr.b.id);toast('Superset : enchaîne avec '+esc(exo(pr.b.id).n),['undo','Annuler la série',o.id]);focusRow(pr.b.id);return}
 render();startRest(id,o.id);if(rec)showRec(o);
 const gr=goalHit(id,o);if(gr){setTimeout(()=>toast('Objectif atteint : '+fmt(gr.kg)+' kg à '+esc(exo(id).n)),300);return}
 const nb=evalBadges(),nc=chalCheck();if(nb.length)setTimeout(()=>toast('Trophée débloqué : '+esc(nb[0].n)),400);else if(nc)setTimeout(()=>toast('Défi réussi : '+esc(nc.n)),400)}
const goalHit=(id,o)=>{const g=goalInfo(id);return g&&g.done&&o.kg>=g.kg&&workOf(id).find(l=>l.kg>=g.kg&&l.t>=Date.parse(g.set+'T00:00'))?.id===o.id?g:null};
/* after a set, the next line to fill gets the focus */
function focusRow(id){requestAnimationFrame(()=>{const b=document.querySelector(`#app .srow.now .tick`)||document.querySelector(`#app [data-a="tick"][data-v^="${CSS.escape(id)}|"]`);if(b){b.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});b.focus({preventScroll:true})}})}

/* ---------- rest: the end time is saved; only the numbers change each tick. While resting you can say how the set felt. ---------- */
let timer=null;const RESTK='charge-rest';
function persistRest(){try{view.rest?localStorage.setItem(RESTK,JSON.stringify(view.rest)):localStorage.removeItem(RESTK)}catch(e){}}
function startRest(id,lid){const r=restOf(id);view.rest={end:Date.now()+r*1000,total:r,id,lid,sid:active()?.id,beeped:false};persistRest();buildRest()}
function restoreRest(){let R=null;try{R=JSON.parse(localStorage.getItem(RESTK)||'null')}catch(e){}if(!R)return;const a=active();
 if(!a||R.sid!==a.id||Date.now()-R.end>10*6e4){view.rest=null;persistRest();return}view.rest=R;buildRest()}
function restSug(R){const tl=curWork(R.id),l=tl.at(-1);if(!l||ltOf(R.id)!=='load')return '';const easy=tl.length>=2&&tl.slice(-2).every(x=>x.f==='easy');
 return easy?`Tes deux dernières séries étaient faciles : essaie ${fmt(l.kg+incOf(R.id))} kg.`:l.f==='hard'?`Échec : garde ${fmt(l.kg)} kg, ou baisse de ${fmt(incOf(R.id))} kg pour finir propre.`:''}
function buildRest(){const R=view.rest;if(!R||view.rec)return;const P=plan(),nx=afterRest(R.id),q=nx&&P.find(x=>x.id===nx),n=nx?curWork(nx).length:0,more=nx===R.id,l=S.logs.find(x=>x.id===R.lid);
 const nd=nx?rowDefaults(nx,1)[0]:null,nextTxt=!nx?'Toutes les séries prévues sont faites.':`Ensuite : ${more?'série '+(n+1)+' sur '+q.s:esc(exo(nx).n)}${nd&&nd.kg!==''?', '+esc(tgtTxt(nx,+nd.kg,nd.r)):''}`;
 openLayer(`<div class="full" role="dialog" aria-modal="true" aria-labelledby="rest-title"><h2 id="rest-title" tabindex="-1">Repos</h2><span class="sm mut">${esc(exo(R.id).n)}${l?', '+esc(setTxt(l)):''}</span>
 <div class="timer" id="rtime" aria-hidden="true"></div><div class="rring" aria-hidden="true"><i id="rbar"></i></div><span class="sm mut" id="rtot"></span>
 <span class="sr" id="rlive" role="timer" aria-live="off"></span>
 <div class="row"><button class="btn2" style="min-width:96px" data-a="rest" data-v="-15">−15 s</button><button class="btn2" style="min-width:96px" data-a="rest" data-v="15">+15 s</button></div>
 ${l&&!l.w?`<div class="col g6" style="width:100%;max-width:360px"><span class="sm b" id="rfl">Comment était cette série ?</span><div class="feelq" role="group" aria-labelledby="rfl">${Object.entries(FEEL).map(([k,lb])=>`<button class="chip ${l.f===k?'on':''}" aria-pressed="${l.f===k}" data-a="rfeel" data-v="${k}">${lb}</button>`).join('')}</div></div>`:''}
 ${restSug(R)?`<div class="card sm" style="max-width:360px;text-align:left">${restSug(R)}</div>`:''}
 <span class="sm" style="max-width:360px">${nextTxt}</span>
 <button class="btn" style="max-width:360px" id="rbtn" data-a="skiprest" data-nx="${!nx?'fin':more?'same':'next'}">Passer le repos</button>
 ${l?`<button class="link mutl" data-a="undo" data-v="${R.lid}">${ic('undo',16)} Annuler cette série</button>`:''}
 <p class="xs mut" style="max-width:300px;margin:0">Le bip ne sonne que si l’appli est ouverte à l’écran.</p></div>`,'rest');
 clearInterval(timer);lastLeft=-1;timer=setInterval(tickRest,250);tickRest()}
let lastLeft=-1;
function tickRest(){const R=view.rest,t=$('#rtime');if(!R||!t){clearInterval(timer);return}
 const left=Math.max(0,(R.end-Date.now())/1000),sec=Math.ceil(left),frac=R.total?left/R.total:0;
 $('#rbar').style.width=(frac*100).toFixed(1)+'%';
 if(sec!==lastLeft){lastLeft=sec;t.textContent=left>0?mmss(sec):'Go';$('#rtot').textContent='sur '+mmss(R.total);
  const b=$('#rbtn');if(b)b.textContent=left>0?'Passer le repos':b.dataset.nx==='fin'?'Terminer la séance':b.dataset.nx==='same'?'Série suivante':'Exercice suivant';
  if(sec%15===0||left<=0)$('#rlive').textContent=left>0?'Repos restant '+mmss(sec):'Repos terminé'}
 if(left<=0&&!R.beeped){R.beeped=true;persistRest();beep();$('#rlive').setAttribute('aria-live','assertive');$('#rlive').textContent='Repos terminé'}}
function showRec(o,then){view.rec={lid:o.id,then:then||null};const g=gainOf(o.e);
 openLayer(`<div class="full rec" role="dialog" aria-modal="true" aria-labelledby="rec-title"><canvas id="confetti" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true"></canvas><h2 id="rec-title" tabindex="-1" style="font-size:30px">Nouveau record</h2>
 <div class="num" style="font-size:64px;white-space:normal">${esc(setTxt(o))}</div><div style="font-size:18px;font-weight:700">${esc(exo(o.e).n)}</div>
 <p class="sm" style="max-width:320px;margin:0">${ormOk(o)?`1RM estimé ${fmt(Math.round(orm(o.kg,o.r)))} kg (formule d’Epley, indicatif).`:''}${g?' '+esc(cap(g.what))+' '+pctTxt(g.pct)+' depuis le '+dShort(g.since)+'.':''}</p>
 <div class="row" style="width:100%;max-width:340px"><button class="btn2 grow" style="min-height:54px;background:transparent;border-color:#18233A;color:#18233A" data-a="undo" data-v="${o.id}">Annuler (erreur)</button><button class="btn grow" style="background:#18233A;color:#fff" data-a="recok">${then?'Continuer le superset':'Continuer'}</button></div></div>`,'rec');
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
 <div class="tiles"><div class="tile"><span class="sm mut">Séries</span><span class="num">${L.length}</span></div>
 <div class="tile"><span class="sm mut">Durée</span><span class="num">${sessMins(a)} min</span></div>
 <div class="tile"><span class="sm mut">Volume</span><span class="num" style="font-size:22px">${volTxt(vol(L))}</span></div></div>
 ${miss?`<div class="card warn sm">Il reste ${pl(miss,'exercice')} non terminé${miss>1?'s':''}. Tu peux quand même enregistrer.</div>`:''}
 ${recs.length?`<div class="card col g6"><span class="lbl redc">Record${recs.length>1?'s':''}</span>${recs.map(id=>`<b>${esc(exo(id).n)}</b>`).join('')}</div>`:''}
 <div class="col"><span class="lbl">Muscles travaillés</span><div class="row wrap" style="gap:6px">${musc.map(m=>`<span class="pill">${cap(m)}</span>`).join('')}</div></div>
 <div class="col"><span class="lbl" id="mlab">Comment tu te sentais ?</span><div class="chips" role="group" aria-labelledby="mlab" style="grid-template-columns:repeat(4,1fr)">${MOODS.map(([k,l])=>`<button class="chip ${view.mood===k?'on':''}" aria-pressed="${view.mood===k}" style="font-size:14px" data-a="mood" data-v="${k}">${l}</button>`).join('')}</div></div>
 <label for="note">Note de séance<input id="note" maxlength="200" placeholder="Ex. épaule un peu raide" value="${esc(view.note??a.note??'')}"></label>
 <div class="sfoot"><button class="btn" data-a="savesession">Enregistrer la séance</button></div>`,'finish')}
/* victory screen: the XP shown is exactly what the session adds to the total */
function winScreen(sid,nb){const s=sessById(sid),TL=sWork(sid),X=XP(),x=X.by[sid]||{sess:0,recs:0,week:0,total:0,nrec:0},T=tierOf(X.lvl);
 const before=X.xp-x.total,lb=lvlOf(before),fb=lb===X.lvl?(before-X.cur)/(X.next-X.cur):0,prs=[...new Set(TL.filter(isRec).map(l=>l.e))];
 const rows=[['Séance terminée',x.sess],[x.nrec>3?`Records (3 comptés sur ${x.nrec})`:`Record${x.nrec>1?'s':''} (${x.nrec} × 30)`,x.recs],['Objectif de la semaine atteint',x.week]].filter(r=>r[1]);
 openLayer(`<div class="full win" role="dialog" aria-modal="true" aria-labelledby="win-title" style="justify-content:flex-start;padding-top:calc(40px + env(safe-area-inset-top,0px));gap:16px">
 <canvas id="confetti" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true"></canvas>
 <span class="sm mut">${esc(sessName(s))}, ${pl(TL.length,'série')}, ${sessMins(s)} min</span>
 <h1 id="win-title" tabindex="-1"><span class="hl">Séance</span><br>validée</h1>
 <div class="card col" style="width:100%;max-width:380px;gap:10px;text-align:left">
  <div class="row sb"><span class="row" style="gap:10px">${levelRing(X,44)}<span class="col" style="gap:0"><b>${lb<X.lvl?'Niveau '+X.lvl+' atteint':T[1]+', niveau '+X.lvl}</b><span class="xs mut">${T[2]}</span></span></span><span class="num" style="font-size:28px">+${x.total} XP</span></div>
  <div class="xpbar" aria-hidden="true"><i id="xpfill" style="width:${Math.round(fb*100)}%"></i></div>
  <div class="col g4">${rows.map(r=>`<div class="kv" style="padding:4px 0"><span class="mut">${r[0]}</span><span class="b">+${r[1]}</span></div>`).join('')}</div>
  <span class="xs mut">Encore ${nf(X.next-X.xp)} XP pour le niveau ${X.lvl+1}</span></div>
 ${prs.length?`<div class="card col g6" style="width:100%;max-width:380px;text-align:left"><span class="lbl redc">Record${prs.length>1?'s':''} battu${prs.length>1?'s':''}</span>${prs.map(id=>{const b=TL.filter(l=>l.e===id&&isRec(l)).at(-1);return `<div class="row sb"><b>${esc(exo(id).n)}</b><span class="num" style="font-size:20px">${esc(setTxt(b))}</span></div>`}).join('')}</div>`:''}
 ${nb&&nb.length?`<div class="card col" style="width:100%;max-width:380px;text-align:left;gap:10px"><span class="lbl">Trophée${nb.length>1?'s':''} débloqué${nb.length>1?'s':''}</span>${nb.map(b=>`<div class="row" style="gap:12px">${badgeSvg(b,true,44)}<div class="col" style="gap:0"><b>${esc(b.n)}</b><span class="xs mut">${esc(b.d)}</span></div></div>`).join('')}</div>`:''}
 <div class="row" style="width:100%;max-width:380px"><button class="btn2 grow" style="min-height:54px" data-a="sharepng" data-v="${sid}">${ic('camera',16)} Image à partager</button><button class="btn grow" data-a="winok">Continuer</button></div></div>`,'win');
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const f=$('#xpfill');if(f)f.style.width=Math.round(X.frac*100)+'%'}));setTimeout(confetti,60)}

/* ================= plan editor ================= */
const REPS=[1,2,3,4,5,6,8,10,12,15,20,25,30];
function planSheet(){const pg=prog(),a=active();
 sheet(`<div class="grab"></div><div class="row sb"><h2 id="sheet-title" tabindex="-1" style="font-size:26px">Modifier la séance</h2>${closeBtn}</div>
 ${a?'<span class="sm mut">Pour les prochaines séances. La séance en cours garde son plan.</span>':''}
 <div class="seg" role="group" aria-label="Séance à modifier">${S.progs.map(p=>`<button class="${p.id===S.cur?'on':''}" aria-pressed="${p.id===S.cur}" data-a="progedit" data-v="${p.id}">${esc(p.n)}</button>`).join('')}<button data-a="addprog" aria-label="Nouvelle séance">+</button></div>
 <label for="pname">Nom de la séance<input id="pname" data-c="pname" maxlength="40" value="${esc(pg.n)}"></label>
 <div class="col">${pg.items.map((p,i)=>{const u=uOf(p.id),R=u==='reps'?REPS:u==='s'?[10,15,20,30,45,60,90,120,180]:[10,20,30,40,50,60,100,200,400];const opt=v=>[...new Set([...R,v])].sort((a,b)=>a-b).map(n=>`<option value="${n}" ${n===v?'selected':''}>${n}</option>`).join('');
  return `<div class="card col" style="gap:8px;padding:12px 14px"><div class="row sb"><b class="grow">${esc(exo(p.id).n)}</b>
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
function exList(q){q=(q||'').trim().toLowerCase();const mode=view.pick,taken=new Set(mode==='plan'?prog().items.map(p=>p.id):mode==='today'?plan().map(p=>p.id):[]);
 const E=S.ex.filter(e=>!taken.has(e.id)&&(!q||e.n.toLowerCase().includes(q)||e.m.some(m=>m.includes(q))));
 if(!E.length)return `<div class="empty">Aucun exercice trouvé. Crée-le ci-dessous.</div>`;
 const by={};E.forEach(e=>(by[e.m[0]]=by[e.m[0]]||[]).push(e));
 return Object.keys(MUS).filter(m=>by[m]).map(m=>`<div class="col g4"><span class="lbl" style="margin-top:6px">${cap(m)}</span>${by[m].map(e=>`<button class="food" data-a="addex" data-v="${e.id}">${thumb(e.id)}<div class="grow"><div class="b">${esc(e.n)}</div><div class="xs mut">${KINDS[e.k]||''}${e.m.length>1?', '+e.m.slice(1).join(', '):''}${best(e.id)?', record '+fmt(best(e.id))+' kg':''}</div></div>${ic('plus',18)}</button>`).join('')}</div>`).join('')}
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
 ${E.dr?`<div class="card sm row sb"><span>Dégressif : ${E.dr.map(d=>fmt(d.kg)+' × '+d.r).join(' → ')}</span><button class="link mutl" data-a="edropoff">Retirer</button></div>`:''}
 ${l&&(l.lt!==ltOf(id)||l.un!==uOf(id))?`<p class="xs mut" style="margin:0">Série notée en « ${LTL[lt]} », ${UL[u][1].toLowerCase()} : elle garde cette mesure.</p>`:''}
 <span class="xs mut">Les records, objectifs, XP et trophées sont recalculés après la correction.</span>
 <div class="sfoot"><p id="seterr" class="sm redc" style="margin:0" role="alert" hidden></p><div class="row">${l?`<button class="btn2 grow danger" style="min-height:54px" data-a="dellog" data-v="${l.id}">Supprimer</button>`:''}<button class="btn grow" data-a="savelog">Enregistrer</button></div></div>`,'elog')}
</script>
