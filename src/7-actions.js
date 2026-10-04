<script>
/* ================= overlay helpers: focus moves into the dialog, the page behind is inert, focus returns on close ================= */
let curSheet=null,opener=null;
function setInert(on){['#app','#nav','#pill'].forEach(s=>{const e=$(s);if(!e)return;e.inert=on;if(on)e.setAttribute('aria-hidden','true');else e.removeAttribute('aria-hidden')})}
function sheet(h,k){const ov=$('#ov'),old=ov.querySelector('.sheet>div'),same=old&&curSheet===k,top=same?old.scrollTop:0;
 const fe=document.activeElement,fk=same&&fe&&ov.contains(fe)?{id:fe.id,a:fe.dataset?.a,v:fe.dataset?.v}:null;
 if(!ov.innerHTML)opener=document.activeElement;
 curSheet=k;ov.innerHTML=`<div class="sheet${same?' re':''}" data-k="${k}"><div role="dialog" aria-modal="true" aria-labelledby="sheet-title">${h}</div></div>`;setInert(true);
 const box=ov.querySelector('.sheet>div');if(top)box.scrollTop=top;
 if(fk){const t=fk.id?document.getElementById(fk.id):[...box.querySelectorAll('[data-a]')].find(e=>e.dataset.a===fk.a&&(e.dataset.v??'')===(fk.v??''));if(t){t.focus({preventScroll:true});return}}
 if(!same)(box.querySelector('#sheet-title')||box.querySelector('button,input'))?.focus({preventScroll:true})}
function openLayer(h,k){const ov=$('#ov');if(!ov.innerHTML)opener=document.activeElement;curSheet=k;ov.innerHTML=h;setInert(true);(ov.querySelector('[id$="-title"]')||ov.querySelector('button'))?.focus({preventScroll:true})}
function close(){clearInterval(timer);$('#ov').innerHTML='';curSheet=null;view.st=null;view.delprog=0;view.mood=null;view.note=null;view.rec=null;view.qq=null;view.el=null;
 if(view.rest){view.rest=null;persistRest()}setInert(false);
 /* the screen behind is redrawn: give focus back to the same control (same id, or same action + value) */
 const k=opener&&opener!==document.body?{id:opener.id,a:opener.dataset?.a,v:opener.dataset?.v}:null;opener=null;render();
 if(k){const t=(k.id&&document.getElementById(k.id))||[...document.querySelectorAll('#app [data-a],#nav [data-a]')].find(e=>e.dataset.a===k.a&&(e.dataset.v??'')===(k.v??''));if(t)t.focus({preventScroll:true})}}
const closeOv=()=>{clearInterval(timer);$('#ov').innerHTML='';curSheet=null;setInert(false)};
const stOf=()=>view.st;
function syncKg(){const st=view.st,i=$('#kgin');if(st&&i){const n=parseNum(i.value);if(isFinite(n))st.kg=n}}
function clampKg(id,v){const K=LIM.kg[ltOf(id)];return Math.min(K[1],Math.max(K[0],Math.round(v*100)/100))}
function clampR(id,v){const R=LIM.r[uOf(id)];return Math.min(R[1],Math.max(R[0],Math.round(v)))}
async function saveFile(fn,data,type){if(dl){try{await dl.save({filename:fn,data});return true}catch(e){if(e?.code!=='declined')toast('Export impossible ici');return false}}
 const blob=data instanceof Blob?data:new Blob([data],{type}),u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=fn;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);return true}
/* replacing all data (import, backup, reset): everything that disappears is marked deleted, so the account copy cannot bring it back */
function replaceAll(N){const now=Date.now(),del={...(S.del||{})};
 for(const [c,f] of Object.entries(COLL)){const keep=new Set((N[c]||[]).map(f));(S[c]||[]).forEach(x=>{const k=f(x);if(!keep.has(k))del[c+':'+k]=now});(N[c]||[]).forEach(x=>x.u=now)}
 for(const m of MAPS){Object.keys(S[m]||{}).forEach(k=>{if(!(N[m]||{})[k])del[m+':'+k]=now});Object.values(N[m]||{}).forEach(x=>{if(x&&typeof x==='object')x.u=now})}
 N.del=del;N.mt={};META.forEach(f=>N.mt[f]=now);S=N;REV++}

/* ================= actions ================= */
const A={
 tab:v=>{if(v==='seance'&&tab==='seance'&&view.page){view={};return render()}go(v)},
 page:v=>{view={page:v};render();scrollTo(0,0)},
 back:()=>{if(view.page==='ex'&&view.from&&view.from!=='prog'){if(view.from==='lib'){view={page:'lib',lm:view.lm,lq:view.lq};render();scrollTo(0,0);return}if(view.from==='sess'&&view.fsid){view={page:'sess',sid:view.fsid};render();return}return go(view.from)}
  if(view.page==='sess'&&view.fday){view={page:'day',day:view.fday};render();return}
  const keep=tab==='prog'?{ym:view.ym}:tab==='corps'?{ct:view.ct}:{};view=keep;render();scrollTo(0,0)},
 gotoprogs:()=>go('seance',{page:'progs'}),gopoids:()=>go('corps',{ct:'poids'}),gocorps:()=>{close();go('corps',{ct:'recup'})},
 day:v=>go('prog',{page:'day',day:v}),
 sess:v=>{const fday=view.page==='day'?view.day:null;closeOv();go('prog',{page:'sess',sid:v,fday})},
 /* séance */
 startsess:()=>{const s=ensureSession();save();render();const P=s.plan,n=P.find(p=>curWork(p.id).length<p.s)?.id||P[0]?.id;if(n)setSheet(n)},
 cancelsess:()=>{const a=active();if(!a)return close();if(sWork(a.id).length){close();return toast('Cette séance contient des séries : valide-la, ou supprime-la depuis Progrès.')}
  delSession(a.id);save();close();toast('Séance annulée')},
 set:v=>{if(!v)return;view.st=null;setSheet(v)},
 kg:v=>{const st=stOf();if(!st)return;syncKg();st.kg=clampKg(st.id,st.kg+ +v*incOf(st.id));setSheet(st.id)},
 reps:v=>{const st=stOf();if(!st)return;syncKg();st.r=clampR(st.id,+v);setSheet(st.id)},
 feel:v=>{const st=stOf();syncKg();st.f=v;setSheet(st.id)},
 warmtog:()=>{const st=stOf();syncKg();st.w=!st.w;if(st.w)st.dr=null;setSheet(st.id)},
 again:()=>{const id=stOf().id,tg=target(id);if(!tg)return;closeOv();logSet(id,tg.kg,tg.r,'ok')},
 validate:()=>{const st=stOf();if(!st)return;const v=readSet(st.id,'#kgin',st.r);if(!v)return;st.kg=v.kg;
  if(st.dr&&st.dr.some(d=>!inR(d.kg,LIM.kg.load)||!inR(d.r,[1,100]))){const e=$('#seterr');e.hidden=false;e.textContent='Palier dégressif invalide.';return}
  closeOv();logSet(st.id,v.kg,v.r,st.f,st.dr,st.w)},
 warm:v=>{const st=stOf();const [kg,r]=v.split(':').map(Number);logSet(st.id,kg,r,null,null,true)},
 dellog:v=>{const l=delLog(v);if(!l)return;const gone=reconcileBadges();save();
  if(curSheet==='set')setSheet(l.e);else if(curSheet==='elog')close();else render();
  toast('Série supprimée'+(gone.length?' · trophée retiré : '+esc(gone[0].n):''),['restorelog','Annuler',JSON.stringify(l)])},
 restorelog:v=>{try{const l=JSON.parse(v);if(!sessById(l.sid))return toast('Séance supprimée entre-temps : restauration impossible');delete S.del?.['logs:'+l.id];addLog(l);evalBadges(true);save();render();if(curSheet==='set')setSheet(l.e);toast('Série restaurée')}catch(e){}},
 editlog:v=>{view.el=null;editLogSheet({lid:v})},
 addlog:v=>{const [sid,e]=v.split('|');view.el=null;editLogSheet({sid,e})},
 efeel:v=>{const E=view.el;E.kg=parseNum($('#ekg').value);E.r=parseNum($('#er').value);E.f=v;editLogSheet(E.lid?{lid:E.lid}:{sid:E.sid,e:E.e})},
 ewarm:()=>{const E=view.el;E.kg=parseNum($('#ekg').value);E.r=parseNum($('#er').value);E.w=!E.w;if(E.w)E.dr=null;editLogSheet(E.lid?{lid:E.lid}:{sid:E.sid,e:E.e})},
 edropoff:()=>{const E=view.el;E.kg=parseNum($('#ekg').value);E.r=parseNum($('#er').value);E.dr=null;editLogSheet(E.lid?{lid:E.lid}:{sid:E.sid,e:E.e})},
 savelog:()=>{const E=view.el,l=E.lid?S.logs.find(x=>x.id===E.lid):null,id=l?l.e:E.e,v=readSet(id,'#ekg',parseNum($('#er').value));if(!v)return;
  if(l){l.kg=v.kg;l.r=v.r;if(E.w){l.w=1;delete l.f;delete l.dr}else{delete l.w;l.f=E.f;if(E.dr)l.dr=E.dr;else delete l.dr}stamp(l)}
  else{const s=sessById(E.sid);if(!s)return close();const L=sLogs(s.id),t=Math.max(s.start,L.at(-1)?.t||s.start)+6e4;
   if(!s.plan.some(p=>p.id===id)){s.plan.push({id,s:1,rmin:v.r,rmax:v.r,n:exo(id).n,extra:1})}if(s.end&&t>s.end)s.end=t;stamp(s);
   addLog({sid:s.id,e:id,kg:v.kg,r:v.r,t,...(E.w?{w:1}:{f:E.f})})}
  save();const gone=reconcileBadges();evalBadges(true);save();close();toast((l?'Série corrigée':'Série ajoutée')+' · stats recalculées'+(gone.length?' · trophée retiré : '+esc(gone[0].n):''))},
 undo:v=>{const l=delLog(v);if(!l)return;const gone=reconcileBadges();if(view.rest?.lid===v){view.rest=null;persistRest()}view.rec=null;save();closeOv();render();
  toast('Série annulée'+(gone.length?' · trophée retiré':''));if(active()){view.st={id:l.e,kg:l.kg,r:l.r,f:l.f||'ok',dr:null,w:!!l.w};setSheet(l.e)}},
 swap:v=>{const id=stOf().id,a=ensureSession(),i=a.plan.findIndex(x=>x.id===id);if(i<0)return;const it=a.plan[i];a.plan[i]={...it,id:v,orig:it.orig||it.id,n:exo(v).n};stamp(a);save();view.st=null;render();setSheet(v);toast('Remplacé pour cette séance seulement')},
 unswap:v=>{const a=active();if(!a)return;const i=a.plan.findIndex(x=>x.orig===v);if(i<0)return;const it={...a.plan[i],id:v,n:exo(v).n};delete it.orig;a.plan[i]=it;stamp(a);save();view.st=null;render();setSheet(v)},
 rmextra:v=>{const a=active();if(!a)return;a.plan=a.plan.filter(x=>x.id!==v||!x.extra);stamp(a);save();close()},
 exdetail:v=>{const from=tab==='prog'?(view.page==='lib'?'lib':view.page==='sess'?'sess':'prog'):tab,lm=view.lm,lq=view.lq,fsid=view.sid;if($('#ov').innerHTML){closeOv();view.st=null}go('prog',{page:'ex',ex:v,from,lm,lq,fsid})},
 demopause:()=>{view.demoPause=!view.demoPause;render()},
 togdemo:()=>{const st=stOf();syncKg();view.showDemo=!view.showDemo;setSheet(st.id)},
 lm:v=>{view.lm=v;render()},
 addto:v=>addToSheet(v),
 addtoprog:v=>{const id=view.addto,p=S.progs.find(x=>x.id===v);if(!p||!id)return;const c=exo(id).c;p.items.push({id,s:3,rmin:c?8:10,rmax:c?10:15});stamp(p);save();close();toast(esc(exo(id).n)+' ajouté à '+esc(p.n))},
 addtoday:v=>{const a=ensureSession();if(!a.plan.some(p=>p.id===v)){a.plan.push({id:v,s:3,rmin:10,rmax:12,extra:1,n:exo(v).n});stamp(a)}save();close();go('seance');toast('Ajouté à la séance en cours')},
 rest:v=>{const R=view.rest;if(!R)return;R.end+= +v*1000;R.total=Math.max(15,R.total+ +v);if(R.end<Date.now())R.end=Date.now();R.beeped=false;persistRest();lastLeft=-1;clearInterval(timer);timer=setInterval(tickRest,250);tickRest()},
 skiprest:()=>{clearInterval(timer);const id=view.rest?.id;view.rest=null;persistRest();closeOv();render();const nx=id&&afterRest(id);if(nx)return setSheet(nx);finish()},
 recok:()=>{const th=view.rec?.then;view.rec=null;if(th){closeOv();return setSheet(th)}if(view.rest)return buildRest();close()},
 drop:v=>{const st=stOf();syncKg();if(v==='off')st.dr=null;else{st.dr=st.dr||[];const prev=(st.dr.at(-1)||st).kg;st.dr.push({kg:Math.max(0,rnd(prev*.8,st.id)),r:st.r})}setSheet(st.id)},
 dropkg:v=>{const st=stOf();syncKg();const [k,d]=v.split(':').map(Number),x=st.dr[k];x.kg=Math.max(0,Math.min(500,Math.round((x.kg+d*incOf(st.id))*100)/100));setSheet(st.id)},
 dropr:v=>{const st=stOf();syncKg();const [k,d]=v.split(':').map(Number),x=st.dr[k];x.r=Math.max(1,Math.min(100,x.r+d));setSheet(st.id)},
 ss:v=>{const p=prog(),P=p.items,i=+v;P[i].ss=!P[i].ss;if(P[i].ss&&P[i+1])delete P[i+1].ss;if(!P[i].ss)delete P[i].ss;stamp(p);save();render();planSheet()},
 png:async v=>{try{const blob=await bilanPNG(v);if(await saveFile('charge-bilan-'+v+'.png',blob,'image/png'))toast('Image exportée')}catch(e){toast('Export impossible ici')}},
 sharepng:async v=>{try{const blob=await sessionPNG(v),fn='charge-seance-'+key(sessById(v).start)+'.png';
  if(!dl){const f=new File([blob],fn,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:'Ma séance Charge'});return}catch(e){if(e?.name==='AbortError')return}}}
  if(await saveFile(fn,blob,'image/png'))toast('Image enregistrée')}catch(e){toast('Export impossible ici')}},
 finish:()=>{if(view.rest){view.rest=null;persistRest()}closeOv();finish()},
 mood:v=>{view.note=$('#note')?.value;view.mood=v;finish()},
 savesession:()=>{const a=active();if(!a)return close();if(!sWork(a.id).length)return finish();
  closeSession(a,{note:($('#note')?.value||'').trim().slice(0,200),mood:view.mood||'bien'});save();
  const nb=evalBadges();chalCheck();closeOv();view.mood=null;view.note=null;render();winScreen(a.id,nb)},
 winok:()=>{close();scrollTo(0,0)},
 setgoal:v=>{const n=parseNum($('#goalkg').value);if(!inR(n,LIM.goal)){$('#goalkg').focus();return toast('Indique une charge entre 1 et 500 kg')}const b=best(v)||0;if(n<=b)return toast('Vise plus haut que ton record actuel ('+fmt(b)+' kg)');
  S.goalsEx=S.goalsEx||{};S.goalsEx[v]={kg:n,from:b,set:today(),u:Date.now()};save();render();toast('Objectif fixé : '+fmt(n)+' kg')},
 delgoal:v=>{if(S.goalsEx)delete S.goalsEx[v];tomb('goalsEx',v);save();render()},
 badge:v=>{const b=BADGES.find(x=>x.id===v),pr=badgeProg(b,CTX());toast(esc(b.n)+' : '+esc(b.d)+(S.badges?.[v]?' · obtenu le '+dShort(S.badges[v].d):b.goal>1&&!['bench','squat','dead'].includes(b.k)?' · '+(b.k==='vol'?fmt(pr.cur/1000)+' / '+fmt(b.goal/1000)+' t':Math.floor(pr.cur)+' / '+b.goal):''))},
 pickprog:v=>{if(active())return toast('Une séance est en cours : termine-la d’abord.');S.cur=v;touch('cur');save();if(view.page==='progs')view={};render();scrollTo(0,0)},
 editplan:v=>{if(v){S.cur=v;touch('cur')}view.delprog=0;render();planSheet()},
 progedit:v=>{S.cur=v;touch('cur');view.delprog=0;save();render();planSheet()},
 addprog:()=>{const id='p'+uid();S.progs.push(stamp({id,n:'Séance '+String.fromCharCode(65+S.progs.length),items:[]}));S.cur=id;touch('cur');save();render();planSheet()},
 mv:v=>{const p=prog(),P=p.items,i=+v;if(i>0)[P[i-1],P[i]]=[P[i],P[i-1]];stamp(p);save();render();planSheet()},
 rm:v=>{const p=prog();p.items.splice(+v,1);stamp(p);save();render();planSheet()},
 delprog:v=>{if(v==='ask'){view.delprog=1;return planSheet()}if(v==='0'){view.delprog=0;return planSheet()}const id=S.cur;S.progs=S.progs.filter(p=>p.id!==id);tomb('progs',id);S.cur=S.progs[0].id;touch('cur');view.delprog=0;save();render();planSheet()},
 pickex:v=>{view.newex=0;pickSheet(v)},
 addex:v=>{const m=view.pick||'';
  if(m==='plan'){const p=prog(),c=exo(v).c;p.items.push({id:v,s:3,rmin:c?8:10,rmax:c?10:15});stamp(p);save();render();planSheet();return toast(esc(exo(v).n)+' ajouté à la séance')}
  if(m.startsWith('sess:')){closeOv();view.el=null;return editLogSheet({sid:m.slice(5),e:v})}
  const a=ensureSession();if(!a.plan.some(p=>p.id===v)){a.plan.push({id:v,s:3,rmin:10,rmax:12,extra:1,n:exo(v).n});stamp(a)}save();closeOv();render();setSheet(v)},
 createex:()=>{const n=$('#newex').value.trim();if(!n){$('#newerr').hidden=false;$('#newex').focus();return}
  const m=[$('#newm').value];if($('#newm2').value&&$('#newm2').value!==m[0])m.push($('#newm2').value);const id='x'+uid();
  const e={id,n:n.slice(0,60),m,k:$('#newk').value,c:+$('#newc').value,seat:''};if($('#newlt').value!==(e.k==='pdc'?'bw':'load'))e.lt=$('#newlt').value;if($('#newu').value!=='reps')e.u=$('#newu').value;
  S.ex.push(stamp(e));A.addex(id)},
 tpl:v=>{view.tpl=v;render()},
 usetpl:v=>{S.progs.forEach(p=>tomb('progs',p.id));S.progs=progsFrom(v);S.cur=S.progs[0].id;S.pn=TPL[v].n;touch('cur');touch('pn');view.tpl='';save();render();toast('Programme « '+TPL[v].n+' » activé'+(active()?' · la séance en cours garde son plan':''))},
 exlt:v=>{const [id,k]=v.split('|'),e=S.ex.find(x=>x.id===id);if(!e)return;e.lt=k;stamp(e);view.exset=1;view.mode=null;save();render()},
 exu:v=>{const [id,k]=v.split('|'),e=S.ex.find(x=>x.id===id);if(!e)return;e.u=k;stamp(e);view.exset=1;view.mode=null;save();render()},
 /* progrès */
 ym:v=>{view.ym=v;view.coach=null;render()},
 more:()=>{view.more=1;render()},rg:v=>{view.rg=v;render()},mode:v=>{view.mode=v;render()},
 coach:()=>runCoach(),coachstop:()=>coachCtl?.abort(),
 delex:v=>{S.ex=S.ex.filter(e=>e.id!==v);tomb('ex',v);save();A.back()},
 smood:v=>{const [sid,k]=v.split('|'),s=sessById(sid);if(!s)return;s.mood=k;stamp(s);save();render()},
 delsess:v=>{if(v.startsWith('ask:')){view.delsess=v.slice(4);return render()}if(v==='no'){view.delsess=null;return render()}
  delSession(v);const gone=reconcileBadges();save();view={};render();toast('Séance supprimée · stats recalculées'+(gone.length?' · trophée retiré : '+esc(gone[0].n):''))},
 newsessday:d=>{if(d>=today())return;const st=at18(d),s=stamp({id:'s'+uid(),start:st,end:st+36e5,state:'done',p:'',pn:'Séance ajoutée',plan:[],retro:1});S.sess.push(s);save();view={page:'sess',sid:s.id,fday:d};render();pickSheet('sess:'+s.id)},
 /* corps */
 ct:v=>{view={ct:v};render()},off:v=>{view.off=+v;render()},ms:v=>{view.ms=v;render()},
 savebw:()=>{const v=parseNum($('#bwin').value);if(!inR(v,LIM.bw)){$('#bwin').setAttribute('aria-invalid','true');$('#bwin').focus();return toast('Indique un poids entre 25 et 350 kg')}
  S.bw=S.bw.filter(b=>b.d!==today());S.bw.push(stamp({d:today(),kg:Math.round(v*10)/10}));S.prof.w=v;touch('prof');save();render();toast('Pesée enregistrée · objectif nutrition recalculé')},
 delbw:v=>{S.bw=S.bw.filter(b=>b.d!==v);tomb('bw',v);save();render()},
 measure:()=>measureSheet(),
 /* same day: only the fields typed are updated, the others are kept */
 savemeas:()=>{const o={};let n=0,bad=0;MEAS.forEach(([k])=>{const raw=$('#m_'+k).value;if(raw==='')return;const v=parseNum(raw);if(inR(v,LIM.meas)){o[k]=v;n++}else{bad++;$('#m_'+k).setAttribute('aria-invalid','true')}});
  const e=$('#merr');if(bad||!n){e.hidden=false;e.textContent=bad?'Chaque mesure doit être entre 10 et 250 cm.':'Indique au moins une mesure.';return}
  const old=S.meas.find(m=>m.d===today());S.meas=S.meas.filter(m=>m.d!==today());S.meas.push(stamp({...(old||{}),...o,d:today()}));save();close();toast('Mesures enregistrées'+(old?' · fusionnées avec celles du jour':''))},
 addphoto:()=>$('#photofile').click(),
 ptap:v=>{const s=view.psel||[];view.psel=s.includes(v)?s.filter(x=>x!==v):[...s,v].slice(-2);render()},
 psel:()=>{view.psel=[];render()},
 pdel:async v=>{try{await PH.del(v);URL.revokeObjectURL(PH.urls[v]);delete PH.urls[v];view.psel=[];await loadPhotos();render();toast('Photo supprimée')}catch(e){toast('Suppression impossible')}},
 exportphotos:async()=>{let L;try{L=await PH.all()}catch(e){return toast('Photos illisibles dans ce navigateur')}if(!L.length)return toast('Aucune photo');
  const files=L.map((p,i)=>new File([p.blob],`charge-photo-${p.d}-${i+1}.jpg`,{type:'image/jpeg'}));
  if(!dl&&navigator.canShare&&navigator.canShare({files})){try{await navigator.share({files,title:'Photos Charge'});return toast('Photos partagées : enregistre-les dans Photos ou Fichiers')}catch(e){if(e?.name==='AbortError')return}}
  let n=0;for(const f of files){if(await saveFile(f.name,f,'image/jpeg'))n++;else break;await new Promise(r=>setTimeout(r,400))}toast(n+' photo'+(n>1?'s':'')+' enregistrée'+(n>1?'s':''))},
 /* nutrition */
 nd:v=>{view.nd=v>today()?today():v;render()},
 goalsheet:()=>goalSheet(),
 goal:v=>{S.prof.goal=v;S.prof.kadj=0;touch('prof');save();render();if(curSheet==='goal')goalSheet()},
 act:v=>{S.prof.act=v;touch('prof');save();render();if(curSheet==='goal')goalSheet()},
 wsess:v=>{const n=+v;if(!(Number.isInteger(n)&&n>=1&&n<=7))return;S.prof.sess=n;touch('prof');save();render();if(curSheet==='goal')goalSheet()},
 kadj0:()=>{S.prof.kadj=0;touch('prof');save();render();goalSheet()},
 kmanset:()=>{const n=parseNum($('#kman').value),e=$('#kerr');if(!inR(n,LIM.kman)){e.hidden=false;e.textContent='Entre 1 000 et 6 000 kcal.';return}S.prof.kman=Math.round(n);touch('prof');save();render();goalSheet();toast('Objectif fixé à '+nf(n)+' kcal')},
 kman0:()=>{S.prof.kman=0;touch('prof');save();render();goalSheet()},
 tipyes:v=>{S.prof.kadj=(S.prof.kadj||0)+ +v;S.prof.kadjAt=today();touch('prof');save();render();toast('Objectif ajusté : '+nf(goals().k)+' kcal')},
 tipno:()=>{S.prof.kadjAt=today();touch('prof');save();render()},
 water:v=>{const d=view.nd||today(),n=Math.max(0,Math.min(40,waterN(d)+ +v));S.water[d]={n,u:Date.now()};save();render();const nc=chalCheck();if(nc)toast('Défi réussi : '+esc(nc.n))},
 copyy:()=>{const d=view.nd||today(),yk=addDays(d,-1);S.food.filter(f=>f.d===yk).forEach(f=>S.food.push(stamp({...f,id:uid(),d})));save();render();toast('Repas de la veille copiés')},
 addfood:v=>{view.fq='';view.ft=null;foodSheet(v||mealNow())},
 ft:v=>{view.ft=v;foodSheet()},
 fav:v=>{S.fav=S.fav.includes(v)?S.fav.filter(x=>x!==v):[...S.fav,v];touch('fav');save();if(curSheet==='qty')qtySheet(view.qf,view.qe);else foodSheet()},
 pickfood:v=>{const f=findFood(v);if(f){view.qq=null;qtySheet(f)}},
 foodback:()=>foodSheet(),
 qset:v=>{view.qq=+v;const i=$('#qq');if(i){i.value=v;updQty()}},
 addfoodq:()=>{const f=view.qf,q=parseNum($('#qq').value);if(!inR(q,LIM.q)){$('#qerr').hidden=false;return $('#qq').focus()}const d=view.nd||today();
  S.food.push(stamp({id:uid(),d,m:view.fm,n:f.n,q,...per(f,q),k100:f.k100,p100:f.p100,g100:f.g100,l100:f.l100}));save();close();const nc=chalCheck();toast(nc?'Défi réussi : '+esc(nc.n):esc(f.n)+' ajouté')},
 editfood:v=>{const e=S.food.find(f=>f.id===v);if(e)qtySheet({n:e.n,k100:e.k100,p100:e.p100,g100:e.g100,l100:e.l100,q:findFood(e.n)?.q},e)},
 savefoodq:()=>{const e=view.qe,q=parseNum($('#qq').value);if(!inR(q,LIM.q)){$('#qerr').hidden=false;return}Object.assign(e,{q,m:$('#fm2').value,...per(view.qf,q)});stamp(e);save();close()},
 delfood:v=>{const e=S.food.find(f=>f.id===v);S.food=S.food.filter(f=>f.id!==v);tomb('food',v);save();close();toast('Aliment supprimé',['restorefood','Annuler',JSON.stringify(e)])},
 restorefood:v=>{try{const f=JSON.parse(v);delete S.del?.['food:'+f.id];S.food.push(stamp(f));save();render()}catch(e){}},
 savetmeal:v=>{const d=view.nd||today(),F=S.food.filter(f=>f.d===d&&f.m===v);const n=(v==='Petit-déjeuner'?'Mon petit-déj':'Mon '+v.toLowerCase())+' du '+dShort(d);
  S.tmeals.push(stamp({id:'t'+uid(),n,items:F.map(({n,q,k,p,g,l,k100,p100,g100,l100})=>({n,q,k,p,g,l,k100,p100,g100,l100}))}));save();toast('Repas type enregistré · onglet « Repas types »')},
 usetmeal:v=>{const m=S.tmeals.find(x=>x.id===v),d=view.nd||today();if(!m)return;m.items.forEach(x=>S.food.push(stamp({...x,id:uid(),d,m:view.fm})));save();close();toast(esc(m.n)+' ajouté')},
 deltmeal:v=>{S.tmeals=S.tmeals.filter(x=>x.id!==v);tomb('tmeals',v);save();foodSheet()},
 newfood:()=>newFoodSheet({}),
 savenewfood:()=>{const n=$('#nfn').value.trim(),k=parseNum($('#nfk').value),e=$('#nferr'),opt=id=>{const v=$(id).value;return v===''?0:parseNum(v)};
  const p=opt('#nfp'),g=opt('#nfg'),l=opt('#nfl'),q=$('#nfq').value===''?100:parseNum($('#nfq').value);
  const bad=!n?'Donne un nom à l’aliment.':!inR(k,LIM.k100)?'Énergie pour 100 g : entre 0 et 900 kcal.':![p,g,l].every(x=>inR(x,LIM.mac100))?'Protéines, glucides, lipides : entre 0 et 100 g pour 100 g.':p+g+l>100.5?'Protéines + glucides + lipides dépassent 100 g pour 100 g.':!inR(q,LIM.q)?'Portion entre 1 et 3 000 g.':'';
  if(bad){e.hidden=false;e.textContent=bad;return}
  const f=stamp({n:n.slice(0,60),k100:k,p100:p,g100:g,l100:l,q,code:view.nf?.code||''});
  S.myfoods=S.myfoods.filter(x=>x.n!==f.n&&(!f.code||x.code!==f.code));S.myfoods.unshift(f);save();view.qq=null;qtySheet(f);toast(f.code?'Produit ajouté à ta base : le prochain scan le reconnaîtra':'Aliment créé')},
 label:()=>{view.nf={...view.nf,n:$('#nfn').value,q:parseNum($('#nfq').value)||100};$('#labelfile').click()},
 scan:()=>{view.fm=view.fm||mealNow();scanSheet({})},
 shoot:()=>$('#scanfile').click(),
 codego:()=>afterCode($('#code').value),
 /* profil */
 sex:v=>{S.prof.sex=v;touch('prof');save();render()},sound:v=>{S.prof.sound=+v;touch('prof');save();render()},
 export:async()=>{const data=JSON.stringify(S,null,1);if(await saveFile('charge-sauvegarde-'+today()+'.json',data,'application/json'))toast('Sauvegarde exportée (sans les photos)')},
 import:()=>$('#importfile').click(),
 noimp:()=>{view.imp=null;render()},
 doimp:async()=>{const N=view.imp;if(!N)return;if(!await backup('Avant import')){if(!view.impforce){view.impforce=1;return toast('Copie de secours impossible : exporte d’abord, ou touche Remplacer à nouveau')}}
  replaceAll(structuredClone(N));S.prof.onb=1;touch('prof');view={};save();render();toast('Sauvegarde importée · copie de secours faite')},
 baks:async()=>{view.bakopen=!view.bakopen;if(view.bakopen){view.baks=null;render();try{view.baks=(await IDB.all('bak')).sort((a,b)=>b.at-a.at)}catch(e){view.baks=[]}}render()},
 restorebak:async v=>{try{const b=await IDB.get('bak',+v);view.imp=prepareImport(JSON.parse(b.json));render();scrollTo(0,document.body.scrollHeight);toast('Vérifie puis touche Remplacer')}catch(e){toast('Cette copie est illisible : '+esc((Array.isArray(e)?e:['format']).slice(0,2).join(' · ')))}},
 askreset:()=>{view.confirm=1;render()},nores:()=>{view.confirm=0;render()},
 reset:async()=>{await backup('Avant effacement');const N=SEED();replaceAll(N);view={};tab='seance';save();render();toast('Données effacées · copie de secours gardée')},
 replay:()=>{S.prof.onb=0;touch('prof');view={ob:0};save();render();scrollTo(0,0)},
 retrysave:()=>{persistLocal();banner();if(dbDoc)pushCloud();toast(localErr?'Toujours impossible : exporte tes données':'Enregistré')},
 /* onboarding */
 ob:v=>{view.ob=+v;render();scrollTo(0,0)},obt:v=>{view.obt=v;render()},
 obdone:()=>{const ch=view.obt||(S.logs.length?'keep':S.prof.sess<=3?'fb':S.prof.sess===4?'hb':'ppl');
  if(ch!=='keep'&&TPL[ch]&&view.ob===3){S.progs.forEach(p=>tomb('progs',p.id));S.progs=progsFrom(ch);S.cur=S.progs[0].id;S.pn=TPL[ch].n;touch('cur');touch('pn')}
  if(!S.bw.length&&view.obw)S.bw.push(stamp({d:today(),kg:S.prof.w}));
  S.prof.onb=1;touch('prof');save();tab='seance';view={};render();scrollTo(0,0)},
 close:()=>close()
};
function updQty(){const q=parseNum($('#qq')?.value);if(q>0&&view.qf){view.qq=q;const b=$('#qmac');if(b)b.innerHTML=macTiles(per(view.qf,q))}}

/* ================= events ================= */
document.addEventListener('click',ev=>{
 const sh=ev.target.classList?.contains('sheet')?ev.target:null;if(sh)return close();
 const b=ev.target.closest('[data-a]');if(!b||b.disabled)return;const f=A[b.dataset.a];if(f){ev.preventDefault();f(b.dataset.v??'',b,ev)}});
document.addEventListener('change',ev=>{const t=ev.target,d=t.dataset,c=d.c;
 if(t.id==='importfile'){const f=t.files[0];t.value='';if(!f)return;f.text().then(x=>{let o;try{o=JSON.parse(x)}catch(e){throw ['fichier JSON illisible']}view.imp=prepareImport(o);render()})
  .catch(er=>{view.imp=null;render();toast('Import refusé, tes données sont intactes : '+esc((Array.isArray(er)?er:['fichier invalide']).slice(0,2).join(' · ')))});return}
 if(t.id==='photofile'){const f=t.files[0];t.value='';if(!f)return;shrink(f).then(blob=>PH.put({id:uid(),d:today(),t:Date.now(),blob})).then(loadPhotos).then(()=>{render();toast('Photo ajoutée · pense à la sauvegarder à part')}).catch(()=>toast('Impossible d’enregistrer cette photo'));return}
 if(t.id==='scanfile'){const f=t.files[0];t.value='';if(!f)return;scanSheet({busy:'Lecture du code-barres…'});
  decodeBarcode(f).then(code=>{if(code)return afterCode(code);scanSheet({err:'Pas de code-barres trouvé sur la photo. Rapproche-toi, cadre-le bien à plat et net, ou saisis les chiffres.'})})
  .catch(()=>scanSheet({err:'Le lecteur de code-barres n’a pas pu se charger (réseau nécessaire la première fois). Saisis les chiffres du code.'}));return}
 if(t.id==='labelfile'){const f=t.files[0];t.value='';if(f&&sample)readLabel(f);return}
 if(c==='kg'){const n=parseNum(t.value),st=view.st;if(st&&inR(n,LIM.kg[ltOf(st.id)])){st.kg=n;t.removeAttribute('aria-invalid');if(exo(st.id).k==='barre')setSheet(st.id)}else t.setAttribute('aria-invalid','true');return}
 if(c==='prof'){const k=d.k,n=parseNum(t.value),lim={a:LIM.a,h:LIM.h,rest:[10,900],bar:[5,30],step:[.1,50],water:[.5,6]}[k],e=$('#proferr');
  if(!lim||!inR(n,lim)){t.setAttribute('aria-invalid','true');if(e){e.hidden=false;e.textContent=(k==='a'?'Âge entre 14 et 99 ans.':k==='h'?'Taille entre 120 et 230 cm.':'Valeur hors limites.')}return}
  t.removeAttribute('aria-invalid');if(e)e.hidden=true;S.prof[k]=n;touch('prof');save();if(S.prof.onb)render();return}
 if(c==='pname2'){S.prof.name=t.value.trim().slice(0,30);touch('prof');save();return}
 if(c==='obw'){const n=parseNum(t.value);if(inR(n,LIM.bw)){S.prof.w=n;view.obw=1;S.bw=S.bw.filter(b=>b.d!==today());touch('prof');save();t.removeAttribute('aria-invalid')}else t.setAttribute('aria-invalid','true');return}
 if(c==='pn'){S.pn=t.value.trim().slice(0,40)||S.pn;touch('pn');save();return}
 if(c==='pname'){const p=prog();p.n=t.value.trim().slice(0,40)||p.n;stamp(p);save();render();return planSheet()}
 if(['ps','pa','pb','pt'].includes(c)){const p=prog(),x=p.items[+d.i];if(!x)return;
  if(c==='ps')x.s=+t.value;if(c==='pa'){x.rmin=+t.value;if(x.rmax<x.rmin)x.rmax=x.rmin}if(c==='pb'){x.rmax=+t.value;if(x.rmin>x.rmax)x.rmin=x.rmax}if(c==='pt'){if(t.value)x.rest=+t.value;else delete x.rest}
  stamp(p);save();render();return planSheet()}
 if(c==='seat'){const e=S.ex.find(x=>x.id===d.v);if(e){e.seat=t.value.trim().slice(0,60);stamp(e);save()}return}
 if(c==='exinc'){const e=S.ex.find(x=>x.id===d.v);if(e){if(t.value)e.inc=+t.value;else delete e.inc;stamp(e);save();view.exset=1;render()}return}
 if(c==='snote'){const s=sessById(d.v);if(s){s.note=t.value.trim().slice(0,200);stamp(s);save()}return}
 if(c==='fm'){view.fm=t.value;return}});
document.addEventListener('input',ev=>{const t=ev.target,i=t.dataset.i;
 if(i==='exq'){$('#exlist').innerHTML=exList(t.value);return}
 if(i==='lq'){view.lq=t.value;$('#lgrid').innerHTML=libCards();return}
 if(i==='fq'){view.fq=t.value;if(t.value&&view.ft!=='search'){view.ft='search';document.querySelectorAll('.sheet .seg button').forEach(b=>{const on=b.dataset.v==='search';b.classList.toggle('on',on);b.setAttribute('aria-selected',on)})}$('#flist').innerHTML=foodList();return}
 if(i==='qq')updQty()});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&$('#ov').innerHTML){if(view.rest||view.rec)return;close()}
 if(ev.key==='Enter'&&ev.target.id==='bwin')A.savebw();if(ev.key==='Enter'&&ev.target.id==='code')A.codego();if(ev.key==='Enter'&&ev.target.id==='kgin'){ev.preventDefault();A.validate()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)return;if(view.rest){lastLeft=-1;tickRest()}if(dbDoc)pushCloud();softRender()});

/* ================= start ================= */
load();evalBadges(true);render();restoreRest();loadRescue();cloud();initCaps();
/* standalone site only (Cloudflare): offline cache; the Claude viewer has window.claude and no service workers */
if(!window.claude&&'serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
</script>
