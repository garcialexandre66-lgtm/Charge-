<script>
/* ================= exercise illustrations =================
   A small parametric mannequin (side or front view) drawn in SVG from joint angles.
   Each exercise gives two poses (start a, contracted b), its equipment and contact points;
   the demo animates a → b → a, thumbnails show b solid over a ghosted. Worked muscles in red,
   contact points (where you push or pull) circled in blue, arrow = direction of effort. */
const FIG={};
const D2R=Math.PI/180,dv=(a,l)=>[Math.cos(a*D2R)*l,-Math.sin(a*D2R)*l],ad=(o,a,l)=>{const d=dv(a,l);return [o[0]+d[0],o[1]+d[1]]};
const SEG={to:46,ua:27,fa:25,th:41,sh:40,ft:13};
const FLOOR=164;
const COL={body:'#C3C7C5',near:'#DCDFDD',far:'#5D6360',mus:'#FF5A3C',eq:'#5E6461',eq2:'#8C918E',dark:'#3A3F3D',ac:'#3D9BFF',bg:'#141515'};
const lerp=(a,b,t)=>a+(b-a)*t;
function lerpPose(A,B,t){const o={};for(const k in A)o[k]=typeof A[k]==='number'&&typeof B[k]==='number'?lerp(A[k],B[k],t):A[k];for(const k in B)if(!(k in o))o[k]=B[k];
 /* shortest way round for angles */
 for(const k in o)if(typeof A[k]==='number'&&typeof B[k]==='number'&&!/^(x|y|L)/.test(k)&&!k.endsWith('L')){let d=B[k]-A[k];if(d>180)d-=360;if(d<-180)d+=360;o[k]=A[k]+d*t}
 return o}
function joints(p,view){const J={};
 if(view==='front'){const P=[p.x,p.y];J.P=P;const S=ad(P,p.t??90,SEG.to*(p.tL??1));J.S=S;J.H=ad(S,(p.t??90)+(p.hn||0),17*(p.hL??1));
  const sw=p.sw??15,sy=p.sy||0;J.SR=[S[0]+sw,S[1]+3+sy];J.SL=[S[0]-sw,S[1]+3+sy];
  J.ER=ad(J.SR,p.ua,SEG.ua*(p.uaL??1));J.WR=ad(J.ER,p.fa,SEG.fa*(p.faL??1));
  const ua2=p.ua2??180-p.ua,fa2=p.fa2??180-p.fa;J.EL=ad(J.SL,ua2,SEG.ua*(p.ua2L??p.uaL??1));J.WL=ad(J.EL,fa2,SEG.fa*(p.fa2L??p.faL??1));
  J.HR=[P[0]+9,P[1]];J.HL=[P[0]-9,P[1]];
  J.KR=ad(J.HR,p.th,SEG.th*(p.thL??1));J.AR=ad(J.KR,p.sh,SEG.sh*(p.shL??1));
  const th2=p.th2??180-p.th,sh2=p.sh2??180-p.sh;J.KL=ad(J.HL,th2,SEG.th*(p.th2L??p.thL??1));J.AL=ad(J.KL,sh2,SEG.sh*(p.sh2L??p.shL??1));
  J.HdR=ad(J.WR,p.ha??p.fa,3.5);J.HdL=ad(J.WL,p.ha2??(p.ha!==undefined?180-p.ha:(p.fa2??180-p.fa)),3.5);J.Hd=J.HdR;J.Hd2=J.HdL;J.mid=pt(J.HdR,J.HdL,.5);J.W=J.WR;J.W2=J.WL;J.A=J.AR;J.A2=J.AL;J.E=J.ER;J.K=J.KR;return J}
 const P=[p.x,p.y];J.P=P;J.S=ad(P,p.t,SEG.to*(p.tL??1));J.H=ad(J.S,p.t+(p.hn||0),16);
 J.E=ad(J.S,p.ua,SEG.ua*(p.uaL??1));J.W=ad(J.E,p.fa,SEG.fa*(p.faL??1));
 J.E2=ad(J.S,p.ua2??p.ua,SEG.ua*(p.ua2L??p.uaL??1));J.W2=ad(J.E2,p.fa2??p.fa,SEG.fa*(p.fa2L??p.faL??1));
 J.K=ad(P,p.th,SEG.th*(p.thL??1));J.A=ad(J.K,p.sh,SEG.sh*(p.shL??1));J.T=ad(J.A,p.ft??p.sh+90,SEG.ft);
 J.K2=ad(P,p.th2??p.th,SEG.th*(p.th2L??p.thL??1));J.A2=ad(J.K2,p.sh2??p.sh,SEG.sh*(p.shL??1));J.T2=ad(J.A2,p.ft2??(p.sh2??p.sh)+90,SEG.ft);
 /* hand slightly past the wrist */
 J.Hd=ad(J.W,p.ha??p.fa,4);J.Hd2=ad(J.W2,p.ha2??p.ha??p.fa2??p.fa,4);
 J.Bk=ad(J.S,p.t+90,6);J.Fr=ad(pt(J.P,J.S,.88),p.t-90,9);J.mid=pt(J.Hd,J.Hd2,.5);J.ta=p.t;return J}
const f1=n=>Math.round(n*10)/10;
const ln=(a,b,w,c,op='')=>`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${op?` opacity="${op}"`:''}/>`;
const ci=(c,r,fill,extra='')=>`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${r}" fill="${fill}"${extra}/>`;
const pt=(a,b,f)=>[lerp(a[0],b[0],f),lerp(a[1],b[1],f)];
const ang=(a,b)=>Math.atan2(-(b[1]-a[1]),b[0]-a[0])/D2R;
/* a muscle = an offset stroke along part of a segment; side +1/-1 picks the face */
function musSeg(a,b,f0,f1_,side,off,w){const A=ang(a,b),n=dv(A+90*side,off),p0=pt(a,b,f0),p1=pt(a,b,f1_);return ln([p0[0]+n[0],p0[1]+n[1]],[p1[0]+n[0],p1[1]+n[1]],w,COL.mus,.92)}
function musclesSide(J,m,far){const o=[];const s=far?'':'';
 const T=(f0,f1,side,off,w)=>musSeg(J.P,J.S,f0,f1,side,off,w);
 for(const k of m){
  if(k==='pectoraux')o.push(T(.58,.86,-1,6,9));
  if(k==='abdos')o.push(T(.12,.55,-1,6,8));
  if(k==='obliques')o.push(T(.15,.55,-1,1,9));
  if(k==='dorsaux')o.push(T(.4,.82,1,6,9));
  if(k==='lombaires')o.push(T(.04,.38,1,6,8));
  if(k==='trapèzes'){o.push(T(.86,1,1,5,8));o.push(ln(J.S,pt(J.S,J.H,.45),6,COL.mus,.92))}
  if(k==='épaules')o.push(ci(J.S,7.5,COL.mus,' opacity=".92"'));
  if(k==='biceps')o.push(musSeg(J.S,J.E,.18,.85,1,2,6));
  if(k==='triceps')o.push(musSeg(J.S,J.E,.15,.85,-1,2,6));
  if(k==='avant-bras')o.push(musSeg(J.E,J.W,.1,.75,1,0,6));
  if(k==='fessiers')o.push(ci(ad(J.P,J.ta-90+180,0).map((v,i)=>v+dv(J.ta-90,-7)[i]),8,COL.mus,' opacity=".92"'));
  if(k==='quadriceps')o.push(musSeg(J.P,J.K,.15,.9,1,3,8));
  if(k==='ischios')o.push(musSeg(J.P,J.K,.2,.9,-1,3,7));
  if(k==='adducteurs')o.push(musSeg(J.P,J.K,.1,.7,1,0,6));
  if(k==='mollets')o.push(musSeg(J.K,J.A,.1,.6,-1,2.5,7));}
 return o.join('')}
function musclesFront(J,m){const o=[],S=J.S,P=J.P;
 const tor=(f,dx)=>{const q=pt(P,S,f);return [q[0]+dx,q[1]]};
 for(const k of m){
  if(k==='pectoraux'){o.push(ln(tor(.78,-7),tor(.78,-4),9,COL.mus,.92));o.push(ln(tor(.78,4),tor(.78,7),9,COL.mus,.92))}
  if(k==='abdos')o.push(ln(tor(.2,0),tor(.58,0),10,COL.mus,.92));
  if(k==='obliques'){o.push(ln(tor(.18,-10),tor(.5,-11),5,COL.mus,.92));o.push(ln(tor(.18,10),tor(.5,11),5,COL.mus,.92))}
  if(k==='dorsaux'){o.push(ln(tor(.45,-11),tor(.85,-14),6,COL.mus,.92));o.push(ln(tor(.45,11),tor(.85,14),6,COL.mus,.92))}
  if(k==='lombaires')o.push(ln(tor(.04,0),tor(.22,0),8,COL.mus,.7));
  if(k==='trapèzes'){o.push(ln([S[0]-10,S[1]+3],[S[0],S[1]-3],5,COL.mus,.92));o.push(ln([S[0]+10,S[1]+3],[S[0],S[1]-3],5,COL.mus,.92))}
  if(k==='épaules'){o.push(ci(J.SR,7,COL.mus,' opacity=".92"'));o.push(ci(J.SL,7,COL.mus,' opacity=".92"'))}
  if(k==='biceps'){o.push(musSeg(J.SR,J.ER,.2,.85,1,0,5.5));o.push(musSeg(J.SL,J.EL,.2,.85,1,0,5.5))}
  if(k==='triceps'){o.push(musSeg(J.SR,J.ER,.2,.85,1,2.5,4));o.push(musSeg(J.SL,J.EL,.2,.85,-1,2.5,4))}
  if(k==='avant-bras'){o.push(musSeg(J.ER,J.WR,.1,.7,1,0,5));o.push(musSeg(J.EL,J.WL,.1,.7,1,0,5))}
  if(k==='fessiers'){o.push(ci([P[0]-11,P[1]-2],6,COL.mus,' opacity=".8"'));o.push(ci([P[0]+11,P[1]-2],6,COL.mus,' opacity=".8"'))}
  if(k==='quadriceps'){o.push(musSeg(J.HR,J.KR,.15,.85,1,0,8));o.push(musSeg(J.HL,J.KL,.15,.85,1,0,8))}
  if(k==='adducteurs'){o.push(musSeg(J.HR,J.KR,.1,.65,1,-3.5,4.5));o.push(musSeg(J.HL,J.KL,.1,.65,-1,-3.5,4.5))}
  if(k==='ischios'){o.push(musSeg(J.HR,J.KR,.2,.85,1,2,4));o.push(musSeg(J.HL,J.KL,.2,.85,-1,2,4))}
  if(k==='mollets'){o.push(musSeg(J.KR,J.AR,.1,.55,1,2,5));o.push(musSeg(J.KL,J.AL,.1,.55,-1,2,5))}}
 return o.join('')}
function bodySide(J,m,ghost){const c=ghost?{far:COL.far,body:COL.far,near:COL.far}:COL,o=[];
 o.push(ln(J.S,J.E2,7.5,c.far),ln(J.E2,J.W2,6.5,c.far),ci(J.Hd2,3.6,c.far));
 o.push(ln(J.P,J.K2,11,c.far),ln(J.K2,J.A2,8.5,c.far),ln(J.A2,J.T2,4.5,c.far));
 o.push(ln(J.P,J.S,19,c.body),ci(J.P,9.5,c.body),ln(J.S,pt(J.S,J.H,.5),7,c.body),ci(J.H,8.5,c.body));
 o.push(ln(J.P,J.K,12,c.near),ln(J.K,J.A,9,c.near),ln(J.A,J.T,5,c.near));
 if(!ghost)o.push(musclesSide(J,m));
 o.push(ln(J.S,J.E,8,c.near),ln(J.E,J.W,7,c.near),ci(J.Hd,3.8,c.near));
 if(!ghost&&m.some(k=>['biceps','triceps','avant-bras','épaules'].includes(k)))o.push(musclesSide(J,m.filter(k=>['biceps','triceps','avant-bras','épaules'].includes(k))));
 return o.join('')}
function bodyFront(J,m,ghost){const c=ghost?COL.far:COL.body,cn=ghost?COL.far:COL.near,o=[],S=J.S,P=J.P;
 o.push(`<polygon points="${f1(J.SL[0]-2)},${f1(J.SL[1]-3)} ${f1(J.SR[0]+2)},${f1(J.SR[1]-3)} ${f1(P[0]+12)},${f1(P[1]+3)} ${f1(P[0]-12)},${f1(P[1]+3)}" fill="${c}" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`);
 o.push(ln(J.HR,J.KR,11,cn),ln(J.KR,J.AR,8.5,cn),ln(J.HL,J.KL,11,cn),ln(J.KL,J.AL,8.5,cn));
 o.push(ln(J.AR,[J.AR[0]+7,J.AR[1]+1],5,cn),ln(J.AL,[J.AL[0]-7,J.AL[1]+1],5,cn));
 o.push(ln(S,pt(S,J.H,.5),7,c),ci(J.H,8.5,c));
 o.push(ln(J.SR,J.ER,7.5,cn),ln(J.ER,J.WR,6.5,cn),ci(J.HdR,3.6,cn));
 o.push(ln(J.SL,J.EL,7.5,cn),ln(J.EL,J.WL,6.5,cn),ci(J.HdL,3.6,cn));
 if(!ghost)o.push(musclesFront(J,m));
 return o.join('')}
/* ---------- equipment ---------- */
function jp(J,at){if(Array.isArray(at))return at;return J[at]}
function eqDraw(e,J,view){const o=[];
 switch(e.k){
  case 'bench':{const a=e.a,b=e.b;o.push(ln(a,b,7,COL.eq));(e.legs??[a,b]).forEach(q=>o.push(ln([q[0],q[1]+3],[q[0],FLOOR],3.5,COL.dark)));break}
  case 'pad':{const q=e.on?pt(J[e.on[0]],J[e.on[1]],e.f??.85):jp(J,e.at);o.push(ci(q,e.r||6,COL.eq2,` stroke="${COL.dark}" stroke-width="2"`));if(e.arm)o.push(ln(e.arm,q,4,COL.eq),ci(e.arm,4,COL.dark));break}
  case 'line':o.push(ln(e.a,e.b,e.w||4,e.c||COL.dark));break;
  case 'rect':o.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.r||3}" fill="${e.c||COL.dark}"/>`);break;
  case 'bar':{if(view==='front'){const a=J.HdL,b=J.HdR,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,ext=e.ext??36;
    const A=[a[0]-ux*ext,a[1]-uy*ext],B=[b[0]+ux*ext,b[1]+uy*ext];o.push(ln(A,B,2.6,COL.eq2));
    if(!e.empty)[[A,-1],[B,1]].forEach(([q,s])=>{const c1=[q[0]-ux*s*7,q[1]-uy*s*7];o.push(ln(c1,[c1[0]+ux*s*4,c1[1]+uy*s*4],17,COL.eq),ln([c1[0]-ux*s*3,c1[1]-uy*s*3],[c1[0]-ux*s*1,c1[1]-uy*s*1],12,COL.eq))})}
   else{const q=jp(J,e.at||'Hd');if(!e.empty)o.push(ci(q,e.r||13,COL.eq,` stroke="${COL.dark}" stroke-width="2"`));o.push(ci(q,2.6,COL.eq2))}break}
  case 'db':{if(view==='front'){[['WR','ER','HdR'],['WL','EL','HdL']].forEach(([w,el,hd])=>{const q=J[hd],a=ang(J[el],J[w])+(e.rot??90);const p1=ad(q,a,7),p2=ad(q,a,-7);o.push(ln(p1,p2,2.5,COL.eq2),ln(ad(p1,a,1.5),ad(p1,a,3),9,COL.eq),ln(ad(p2,a,-1.5),ad(p2,a,-3),9,COL.eq))})}
   else{const q=jp(J,e.at||'Hd'),a=(e.rot!==undefined?e.rot:ang(J.E,J.W)+(e.rr??90));const p1=ad(q,a,6),p2=ad(q,a,-6);o.push(ln(p1,p2,2.5,COL.eq2),ln(p1,ad(p1,a,2),9,COL.eq),ln(p2,ad(p2,a,-2),9,COL.eq))}break}
  case 'kb':{const q=jp(J,e.at||'Hd');o.push(ci([q[0],q[1]+8],7,COL.eq),`<path d="M${f1(q[0]-4)} ${f1(q[1]+3)} Q${f1(q[0])} ${f1(q[1]-5)} ${f1(q[0]+4)} ${f1(q[1]+3)}" stroke="${COL.eq}" stroke-width="2.5" fill="none"/>`);break}
  case 'cable':{const q=jp(J,e.at||'Hd');o.push(ln(e.from,q,1.4,COL.eq2),ci(e.from,4.5,COL.dark,` stroke="${COL.eq2}" stroke-width="1.5"`));if(e.at2){const q2=jp(J,e.at2);o.push(ln(e.from,q2,1.4,COL.eq2))}
   if(e.handle!=='none')o.push(ln(ad(q,0,-5),ad(q,0,5),e.handle==='bar'?3:3,COL.eq2));break}
  case 'lever':{const q=jp(J,e.at||'Hd');o.push(ln(e.piv,q,e.w||6,COL.eq),ci(e.piv,4.5,COL.dark,` stroke="${COL.eq2}" stroke-width="1.5"`));
   if(e.plate!==undefined){const pp=pt(e.piv,q,e.plate);o.push(ci(pp,11,COL.eq,` stroke="${COL.dark}" stroke-width="2"`),ci(pp,2.5,COL.eq2))}o.push(ci(q,3.2,COL.eq2));break}
  case 'foot':{const a=J.A,t=J.T,u=ang(a,t);o.push(ln(ad(a,u,-7),ad(t,u,6),5,COL.eq2));if(e.rail)o.push(ln(e.rail[0],e.rail[1],3,COL.dark));break}
  case 'hbar':o.push(view==='front'?ln([e.at[0]-46,e.at[1]],[e.at[0]+46,e.at[1]],3.5,COL.eq2):ci(e.at,3.5,COL.eq2));if(e.post)o.push(ln(e.post[0],e.post[1],4,COL.dark));break;
  case 'rope':{const q=jp(J,e.at||'Hd');o.push(ln(e.from,q,1.4,COL.eq2),ci(e.from,4.5,COL.dark,` stroke="${COL.eq2}" stroke-width="1.5"`),ln(q,ad(q,-90,6),3,'#B08A55'));break}
  case 'wheel':{const q=jp(J,e.at||'Hd');o.push(ci([q[0],q[1]+5],8,'none',` stroke="${COL.eq2}" stroke-width="3"`));break}
  case 'band':{o.push(ln(e.a,e.b,e.w||8,e.c||COL.eq));break}
 }return o.join('')}
/* ---------- arrow along the main moving contact ---------- */
function arrowSvg(f){if(!f.mv)return '';const v=f.v||'side',Ja=joints(f.a,v),Jb=joints(f.b,v),a=Ja[f.mv],b=Jb[f.mv];if(!a||!b)return '';
 const d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<6)return '';const u=ang(a,b),side=f.as??1,n=dv(u+90*side,f.ao??15);
 const p0=ad([a[0]+n[0],a[1]+n[1]],u,d*.12),p1=ad([a[0]+n[0],a[1]+n[1]],u,d*.88),h1=ad(p1,u+150,6),h2=ad(p1,u-150,6);
 return `<g opacity=".95">${ln(p0,p1,2.4,COL.ac)}<path d="M${f1(p1[0])} ${f1(p1[1])} L${f1(h1[0])} ${f1(h1[1])} L${f1(h2[0])} ${f1(h2[1])} Z" fill="${COL.ac}" stroke="${COL.ac}" stroke-width="1.5" stroke-linejoin="round"/></g>`}
function figFrame(f,p,ghost){const v=f.v||'side',J=joints(p,v),m=ghost?[]:(f.m||[]);
 const back=(f.eq||[]).filter(e=>!e.front).map(e=>eqDraw(e,J,v)).join(''),front=(f.eq||[]).filter(e=>e.front).map(e=>eqDraw(e,J,v)).join('');
 const touch=ghost?'':(f.touch||[]).map(k=>{const q=J[k==='W'?'Hd':k==='W2'?'Hd2':k];if(v==='front'&&k==='W'&&!f.one)return ci(J.HdR,6.5,'none',` stroke="${COL.ac}" stroke-width="2"`)+ci(J.HdL,6.5,'none',` stroke="${COL.ac}" stroke-width="2"`);if(v==='front'&&k==='A'&&!f.one)return ci(J.AR,6.5,'none',` stroke="${COL.ac}" stroke-width="2"`)+ci(J.AL,6.5,'none',` stroke="${COL.ac}" stroke-width="2"`);return q?ci(q,6.5,'none',` stroke="${COL.ac}" stroke-width="2"`):''}).join('');
 return back+(v==='front'?bodyFront(J,m,ghost):bodySide(J,m,ghost))+front+touch}
function figSvg(id,opts={}){const f=FIG[id];if(!f)return '';const t=opts.t??1;
 const pose=lerpPose(f.a,f.b,t),vb=f.vb||'0 0 200 170';
 const ghost=opts.ghost?`<g opacity=".28">${figFrame(f,f.a,true)}</g>`:'';
 return `<svg viewBox="${vb}" ${opts.size?`width="${opts.size}" height="${Math.round(opts.size*.85)}"`:'width="100%"'} role="img" aria-label="${esc(opts.label||'Illustration du mouvement')}" style="display:block">
 <rect x="-50" y="-50" width="300" height="270" fill="${COL.bg}"/>${f.floor===false?'':`<line x1="-50" y1="${FLOOR+1.5}" x2="250" y2="${FLOOR+1.5}" stroke="#2A2D2D" stroke-width="3"/>`}
 ${ghost}${figFrame(f,pose,false)}${opts.arrow===false?'':arrowSvg(f)}</svg>`}
/* exercises without their own drawing (created by the user) borrow one of the same main muscle */
const FIGBY={pectoraux:'chestpress',dorsaux:'tirage',épaules:'epaules',biceps:'curlh',triceps:'triceps',quadriceps:'presse',ischios:'legcurl',fessiers:'hipthrust',adducteurs:'adduction',mollets:'mollets',abdos:'crunch',obliques:'woodchop',lombaires:'lombaires',trapèzes:'shrug','avant-bras':'curlpoignet'};
const figId=id=>FIG[id]?id:FIGBY[exo(id).m[0]];
const thumb=(id,cls='')=>{const f=figId(id);return `<span class="thumb ${cls}" aria-hidden="true">${f?figSvg(f,{t:1,arrow:false}).replace('role="img"','focusable="false"'):''}</span>`};
/* animated demo: one at a time */
let demoRAF=0;
function startDemo(id,el='demo'){cancelAnimationFrame(demoRAF);const box=document.getElementById(el);id=figId(id);if(!box||!id)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce||view.demoPause){box.innerHTML=figSvg(id,{t:1,ghost:true,label:'Mouvement de '+exo(id).n});return}
 const T0=performance.now(),seq=[[0,0,500],[0,1,1100],[1,1,450],[1,0,1400]],tot=seq.reduce((s,x)=>s+x[2],0);
 const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
 const loop=now=>{if(!document.getElementById(el))return;let e=(now-T0)%tot,t=0;for(const [a,b,d] of seq){if(e<=d){t=lerp(a,b,ease(e/d));break}e-=d}
  box.innerHTML=figSvg(id,{t,label:'Mouvement de '+exo(id).n});demoRAF=requestAnimationFrame(loop)};demoRAF=requestAnimationFrame(loop)}
</script>
<script>{
/* ================= exercise illustrations : poses =================
   side view faces right; angles in degrees, 0 = right, 90 = up, -90 = down.
   po({...}) builds a pose; W / A (and W2 / A2 for the far limbs) place a hand or ankle at a point,
   ws / ls choose the side the elbow / knee bends to (+1 counter-clockwise, -1 clockwise). */
function ik(B,T,l1,l2,s){const d=Math.max(1,Math.min(Math.hypot(T[0]-B[0],T[1]-B[1]),l1+l2-.01)),a0=ang(B,T),
 al=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))))/D2R,u=a0+s*al,E=ad(B,u,l1);return [u,ang(E,T)]}
function po(o){const p=Object.assign({ua:-90,fa:-90,th:-90,sh:-90,t:90},o),v=o.v||'side';
 const P=[p.x,p.y],S=ad(P,p.t,SEG.to*(p.tL??1));
 const Sr=v==='front'?[S[0]+(p.sw??15),S[1]+3+(p.sy||0)]:S,Hr=v==='front'?[P[0]+9,P[1]]:P;
 if(o.W){[p.ua,p.fa]=ik(Sr,o.W,SEG.ua*(p.uaL??1),SEG.fa*(p.faL??1),o.ws??-1)}
 if(o.W2){[p.ua2,p.fa2]=ik(v==='front'?[S[0]-(p.sw??15),S[1]+3+(p.sy||0)]:S,o.W2,SEG.ua,SEG.fa,o.ws2??o.ws??-1)}
 if(o.A){[p.th,p.sh]=ik(Hr,o.A,SEG.th*(p.thL??1),SEG.sh*(p.shL??1),o.ls??1)}
 if(o.A2){[p.th2,p.sh2]=ik(v==='front'?[P[0]-9,P[1]]:P,o.A2,SEG.th,SEG.sh,o.ls2??o.ls??1)}
 ['W','W2','A','A2','ws','ws2','ls','ls2','v'].forEach(k=>delete p[k]);return p}
/* bench pad behind the torso of pose p (fractions along hip→shoulder, offset to the back) */
function padBehind(p,f0=-.15,f1=1.3,off=10.5,legs=true){const P=[p.x,p.y],S=ad(P,p.t,SEG.to),n=dv(p.t+90,off),a=pt(P,S,f0),b=pt(P,S,f1);
 const A=[a[0]+n[0],a[1]+n[1]],B=[b[0]+n[0],b[1]+n[1]];return {k:'bench',a:A,b:B,legs:legs?[A,B]:[]}}
const seat=(x0,x1,y,legs=true)=>({k:'bench',a:[x0,y],b:[x1,y],legs:legs?[[x0+8,y],[x1-8,y]]:[]});
const FLAT={k:'bench',a:[40,113.5],b:[136,113.5],legs:[[50,113],[126,113]]};
const D=(id,f)=>{FIG[id]=f};
/* lying on a flat bench, head left */
const lie=o=>po(Object.assign({x:122,y:104,t:180,A:[150,163],ls:-1},o));
/* standing, feet under hips */
const stand=o=>po(Object.assign({x:95,y:82,t:90,A:[97,163],A2:[93,163],ls:1},o));
/* sitting on a seat at y≈121, feet on the floor */
const sit=o=>po(Object.assign({x:80,y:110,t:90,A:[118,163],ls:1},o));
/* front view standing / sitting */
const fstand=o=>po(Object.assign({v:'front',x:100,y:84,t:90,ua:-95,fa:-92,th:-92,sh:-90},o));
const fsit=o=>po(Object.assign({v:'front',x:100,y:112,t:90,ua:-95,fa:-92,th:-70,sh:-90,thL:.45},o));

/* ---------- PECTORAUX ---------- */
D('couche',{m:['pectoraux','triceps','épaules'],a:lie({W:[101,90],ws:1}),b:lie({W:[96,53],ws:1}),eq:[FLAT,{k:'bar',front:1}],touch:['W'],mv:'W'});
D('couchedb',{m:['pectoraux','triceps','épaules'],a:lie({W:[102,92],ws:1}),b:lie({W:[90,53],ws:1}),eq:[FLAT,{k:'db',rot:0,front:1}],touch:['W'],mv:'W'});
D('couchesserre',{m:['triceps','pectoraux','épaules'],a:lie({W:[104,92],ws:1}),b:lie({W:[98,53],ws:1}),eq:[FLAT,{k:'bar',front:1}],touch:['W'],mv:'W'});
D('smithbench',{m:['pectoraux','triceps','épaules'],a:lie({W:[100,92],ws:1}),b:lie({W:[100,55],ws:1}),eq:[{k:'line',a:[100,8],b:[100,164],w:3},FLAT,{k:'bar',front:1}],touch:['W'],mv:'W'});
const INC={x:116,y:112,t:140,A:[150,163],ls:-1};
const incPad=padBehind(po(INC),-.05,1.28);
D('incline_b',{m:['pectoraux','épaules','triceps'],a:po({...INC,W:[96,74],ws:1}),b:po({...INC,W:[84,38],ws:1}),eq:[incPad,seat(96,132,122.5,false),{k:'bar',front:1}],touch:['W'],mv:'W'});
D('incline',{m:['pectoraux','épaules','triceps'],a:po({...INC,W:[97,76],ws:1}),b:po({...INC,W:[82,38],ws:1}),eq:[incPad,seat(96,132,122.5,false),{k:'db',rot:0,front:1}],touch:['W'],mv:'W'});
const DEC={x:122,y:96,t:198,A:[156,128],ls:1};
D('decline',{m:['pectoraux','triceps'],a:po({...DEC,W:[100,100],ws:1}),b:po({...DEC,W:[88,64],ws:1}),
 eq:[padBehind(po(DEC),-.25,1.3),{k:'pad',at:'A',r:6},{k:'line',a:[156,134],b:[156,164],w:3.5},{k:'bar',front:1}],touch:['W','A'],mv:'W'});
D('chestpress',{m:['pectoraux','triceps','épaules'],a:sit({t:98,W:[88,72],ws:-1}),b:sit({t:98,W:[132,66],ws:-1}),
 eq:[seat(56,104,121.5),padBehind(sit({t:98}),.05,1.25,10.5,false),{k:'line',a:[60,60],b:[60,164],w:5},{k:'lever',piv:[88,16],at:'Hd',plate:.5,front:1}],touch:['W'],mv:'W'});
D('chestinc',{m:['pectoraux','épaules','triceps'],a:sit({t:100,W:[86,64],ws:-1}),b:sit({t:100,W:[124,40],ws:-1}),
 eq:[seat(56,104,121.5),padBehind(sit({t:100}),.05,1.25,10.5,false),{k:'line',a:[60,60],b:[60,164],w:5},{k:'lever',piv:[58,6],at:'Hd',plate:.55,front:1}],touch:['W'],mv:'W'});
D('pecdeck',{v:'front',m:['pectoraux','épaules'],a:fsit({ua:-3,fa:90}),b:fsit({ua:175,uaL:.42,fa:90}),
 eq:[{k:'rect',x:88,y:40,w:24,h:84,r:6,c:'#2E3331'},seat(70,130,123,true)],touch:['W'],mv:'W',as:-1});
D('ecarte',{m:['pectoraux','épaules'],a:lie({ua:-100,uaL:.3,fa:-95,faL:.45}),b:lie({ua:86,fa:92}),eq:[FLAT,{k:'db',rot:0,front:1}],touch:['W'],mv:'W',as:-1});
D('crossover',{v:'front',m:['pectoraux'],a:fstand({ua:28,fa:15}),b:fstand({ua:-118,uaL:.75,fa:-165,faL:.6}),
 eq:[{k:'cable',from:[178,6],at:'HdR',handle:'none'},{k:'cable',from:[22,6],at:'HdL',handle:'none'},{k:'line',a:[178,6],b:[178,164],w:4},{k:'line',a:[22,6],b:[22,164],w:4}],touch:['W'],mv:'W',as:-1});
const PUSH_UP={x:96,y:129,t:24,A:[22,161],ls:1};
D('pompes',{m:['pectoraux','triceps','épaules'],a:po({x:101,y:146,t:10,A:[22,161],ls:1,W:[136,162],ws:1}),b:po({...PUSH_UP,W:[136,162],ws:1}),eq:[],touch:['W','A'],mv:'S',as:1,ao:-20});
D('dips',{m:['pectoraux','triceps','épaules'],a:po({x:96,y:104,t:78,W:[106,86],ws:1,A:[84,146],ls:-1}),b:po({x:98,y:80,t:86,W:[106,86],ws:1,A:[86,122],ls:-1}),
 eq:[{k:'line',a:[66,90],b:[146,90],w:4,c:'#8C918E'},{k:'line',a:[72,92],b:[72,164],w:3.5},{k:'line',a:[140,92],b:[140,164],w:3.5}],touch:['W'],mv:'S',as:-1,ao:-30});
D('pulloverdb',{m:['pectoraux','dorsaux'],a:lie({ua:172,fa:172}),b:lie({ua:88,fa:90}),eq:[FLAT,{k:'db',rot:90,front:1}],touch:['W'],mv:'W',as:-1});
/* point on the torso of pose p: fraction f from hip, offset off to the front (+) or back (−) */
const tp=(p,f,off=0)=>{const P=[p.x,p.y],S=ad(P,p.t,SEG.to*(p.tL??1)),q=pt(P,S,f),n=dv(p.t-90,off);return [q[0]+n[0],q[1]+n[1]]};
const HANG='-10 -42 220 207',TALL='0 -30 200 195';
/* ---------- DOS ---------- */
D('tractions',{v:'front',vb:HANG,m:['dorsaux','biceps'],a:po({v:'front',x:100,y:57,t:90,W:[142,-30],ws:1,th:-96,sh:-92,thL:.9,shL:.75}),b:po({v:'front',x:100,y:31,t:90,W:[142,-30],ws:-1,th:-96,sh:-92,thL:.9,shL:.75}),
 eq:[{k:'hbar',at:[100,-30]}],touch:['W'],mv:'P',as:1,ao:58});
D('chinup',{vb:HANG,m:['dorsaux','biceps'],a:po({x:98,y:66,t:92,W:[110,-30],ws:1,A:[80,140],ls:1}),b:po({x:98,y:30,t:94,W:[110,-30],ws:-1,A:[80,104],ls:1}),
 eq:[{k:'hbar',at:[110,-30],post:[[150,-30],[150,164]]},{k:'line',a:[110,-30],b:[150,-30],w:3}],touch:['W'],mv:'P',as:-1,ao:22});
const FS={v:'front',x:100,y:112,t:90,th:-70,sh:-90,thL:.45};
D('tirage',{v:'front',vb:TALL,m:['dorsaux','biceps'],a:po({...FS,W:[143,22],ws:1}),b:po({...FS,W:[138,66],ws:-1}),
 eq:[seat(70,130,123,true),{k:'rect',x:72,y:92,w:56,h:7,r:3,c:'#5E6461'},{k:'cable',from:[100,-22],at:'mid',handle:'none'},{k:'bar',ext:14,empty:1,front:1}],touch:['W'],mv:'W',as:1});
D('tirageserre',{vb:TALL,m:['dorsaux','biceps'],a:sit({t:96,W:[108,12],ws:1}),b:sit({t:98,W:[100,66],ws:-1}),
 eq:[seat(56,104,121.5),{k:'rect',x:86,y:94,w:30,h:7,r:3,c:'#5E6461'},{k:'cable',from:[108,-22],at:'Hd',handle:'bar'}],touch:['W'],mv:'W',as:-1});
const ROWM={x:72,y:110,t:92,A:[118,163],ls:1};
D('rowing',{m:['dorsaux','trapèzes','biceps'],a:po({...ROWM,W:[146,72],ws:-1}),b:po({...ROWM,W:[104,78],ws:-1}),
 eq:[seat(48,96,121.5),{k:'rect',x:86,y:58,w:9,h:40,r:4,c:'#5E6461'},{k:'line',a:[90,98],b:[90,164],w:4},{k:'lever',piv:[160,150],at:'Hd',plate:.55,front:1}],touch:['W'],mv:'W',as:1});
const ROWC={x:62,y:134,A:[134,140],ls:1};
D('rowpoulie',{m:['dorsaux','trapèzes','biceps'],a:po({...ROWC,t:68,W:[152,118],ws:-1}),b:po({...ROWC,t:95,W:[92,112],ws:-1}),
 eq:[seat(30,96,145),{k:'line',a:[146,128],b:[146,164],w:5},{k:'cable',from:[176,142],at:'Hd'}],touch:['W','A'],mv:'W',as:1,ao:-14});
const BENT={x:88,y:86,t:28,A:[104,163],A2:[98,163],ls:1};
D('rowbarre',{m:['dorsaux','trapèzes','lombaires'],a:po({...BENT,W:[129,134],ws:1}),b:po({...BENT,W:[110,108],ws:1}),eq:[{k:'bar',front:1}],touch:['W'],mv:'W',as:-1});
D('tbar',{m:['dorsaux','trapèzes'],a:po({...BENT,W:[129,134],ws:1}),b:po({...BENT,W:[112,108],ws:1}),eq:[{k:'lever',piv:[22,160],at:'Hd',plate:.86,w:4,front:1}],touch:['W'],mv:'W',as:-1});
const ROW1={x:82,y:98,t:6,A:[80,163],ls:1,W2:[132,118],ws2:1,A2:[44,119],ls2:-1};
D('rowdb',{m:['dorsaux','biceps'],a:po({...ROW1,W:[128,146],ws:1}),b:po({...ROW1,W:[112,108],ws:1}),eq:[seat(36,150,125),{k:'db',front:1}],touch:['W','W2'],mv:'W',as:-1});
D('pullover',{vb:TALL,m:['dorsaux'],a:stand({t:84,W:[136,2],ws:-1}),b:stand({t:86,W:[108,86],ws:1}),eq:[{k:'cable',from:[168,-24],at:'Hd',handle:'bar'}],touch:['W'],mv:'W',as:-1});
D('souleve',{m:['lombaires','ischios','fessiers','dorsaux'],a:po({x:76,y:112,t:42,A:[100,163],A2:[96,163],ls:1,W:[108,150],ws:1}),b:stand({W:[100,90],ws:1}),eq:[{k:'bar',front:1}],touch:['W','A'],mv:'P',as:1,ao:-30});
const SH={v:'front',x:100,y:84,t:90,th:-92,sh:-90};
D('shrug',{v:'front',m:['trapèzes'],a:po({...SH,W:[123,100],ws:1}),b:po({...SH,sy:-8,W:[123,92],ws:1}),eq:[{k:'db',rot:90,front:1}],touch:['W'],mv:'SR',as:-1,ao:14});
D('shrugb',{v:'front',m:['trapèzes'],a:po({...SH,W:[120,100],ws:1}),b:po({...SH,sy:-8,W:[120,92],ws:1}),eq:[{k:'bar',ext:30,front:1}],touch:['W'],mv:'SR',as:-1,ao:14});
D('facepull',{m:['épaules','trapèzes'],a:stand({t:86,W:[146,30],ws:-1}),b:stand({t:92,W:[110,22],ws:1}),eq:[{k:'rope',from:[178,26],at:'Hd'}],touch:['W'],mv:'W',as:1});
const RC={x:100,y:92,A:[52,154],ls:-1,A2:[48,154]};
D('lombaires',{m:['lombaires','fessiers','ischios'],a:po({...RC,t:-48,ua:-130,fa:20}),b:po({...RC,t:38,ua:-40,fa:100}),
 eq:[{k:'rect',x:96,y:96,w:14,h:9,r:4,c:'#5E6461'},{k:'line',a:[100,105],b:[100,164],w:4},{k:'line',a:[40,160],b:[64,148],w:5,c:'#5E6461'}],touch:['P','A'],mv:'H',as:-1});
D('goodmorning',{m:['ischios','lombaires','fessiers'],a:stand({W:[84,40],ws:1}),b:po({x:82,y:86,t:12,A:[100,163],A2:[96,163],ls:1,W:[118,72],ws:1}),eq:[{k:'bar',at:'Bk',front:1}],touch:['Bk'],mv:'S',as:1});
D('inverserow',{m:['dorsaux','biceps','trapèzes'],a:po({x:96,y:140,t:8,A:[28,160],ls:1,W:[128,82],ws:1}),b:po({x:100,y:118,t:20,A:[28,160],ls:1,W:[128,82],ws:-1}),
 eq:[{k:'hbar',at:[130,82],post:[[150,82],[150,164]]},{k:'line',a:[130,82],b:[150,82],w:3}],touch:['W','A'],mv:'S',as:1,ao:-16});
/* ---------- ÉPAULES ---------- */
D('militaire',{vb:TALL,m:['épaules','triceps'],a:stand({W:[110,36],ws:-1}),b:stand({W:[99,-8],ws:-1}),eq:[{k:'bar',front:1}],touch:['W'],mv:'W',as:1});
D('epaulesdb',{v:'front',vb:TALL,m:['épaules','triceps'],a:fsit({ua:-10,fa:88}),b:fsit({ua:72,fa:86}),eq:[seat(70,130,123,true),{k:'db',rot:90,front:1}],touch:['W'],mv:'W',as:1,ao:-24});
D('epaules',{vb:TALL,m:['épaules','triceps'],a:sit({t:95,W:[98,30],ws:-1}),b:sit({t:95,W:[92,-16],ws:-1}),
 eq:[seat(56,104,121.5),padBehind(sit({t:95}),.05,1.3,10.5,false),{k:'line',a:[60,60],b:[60,164],w:5},{k:'lever',piv:[30,-6],at:'Hd',plate:.5,front:1}],touch:['W'],mv:'W',as:1});
D('arnold',{v:'front',vb:TALL,m:['épaules','triceps'],a:fsit({ua:-150,uaL:.45,fa:90}),b:fsit({ua:72,fa:86}),eq:[seat(70,130,123,true),{k:'db',rot:90,front:1}],touch:['W'],mv:'W',as:1,ao:-24});
D('elev',{v:'front',m:['épaules'],a:fstand({ua:-80,fa:-82}),b:fstand({ua:0,fa:4}),eq:[{k:'db',rot:90,front:1}],touch:['W'],mv:'W',as:1});
D('elevpoulie',{v:'front',one:1,m:['épaules'],a:fstand({ua:-115,uaL:.85,fa:-120,ua2:-80,fa2:-70}),b:fstand({ua:2,fa:6,ua2:-80,fa2:-70}),eq:[{k:'cable',from:[48,158],at:'HdR',handle:'none'}],touch:['W'],mv:'W',as:1});
D('elevmachine',{v:'front',m:['épaules'],a:fsit({ua:-82,fa:-30}),b:fsit({ua:-2,fa:-10}),eq:[seat(70,130,123,true),{k:'pad',at:'ER',r:5,front:1},{k:'pad',at:'EL',r:5,front:1}],touch:['E','EL'],mv:'E',as:1});
D('frontale',{m:['épaules'],a:stand({W:[103,88],ws:1}),b:stand({W:[147,38],ws:1}),eq:[{k:'db',front:1}],touch:['W'],mv:'W',as:1});
D('oiseaudb',{v:'front',m:['épaules','trapèzes'],a:po({v:'front',x:100,y:92,t:90,tL:.42,hL:.35,ua:-92,fa:-92,th:-92,sh:-88,thL:.92}),b:po({v:'front',x:100,y:92,t:90,tL:.42,hL:.35,ua:-4,fa:-6,th:-92,sh:-88,thL:.92}),eq:[{k:'db',rot:90,front:1}],touch:['W'],mv:'W',as:1});
D('oiseau',{v:'front',m:['épaules','trapèzes'],a:fsit({ua:175,uaL:.42,fa:175,faL:.4}),b:fsit({ua:0,fa:0}),eq:[{k:'rect',x:88,y:40,w:24,h:84,r:6,c:'#2E3331'},seat(70,130,123,true)],touch:['W'],mv:'W',as:1});
D('uprow',{v:'front',m:['épaules','trapèzes'],a:po({...SH,W:[110,100],ws:1}),b:po({...SH,W:[108,50],ws:1}),eq:[{k:'bar',ext:30,front:1}],touch:['W'],mv:'W',as:-1,ao:24});
/* ---------- BICEPS ---------- */
D('curlb',{m:['biceps','avant-bras'],a:stand({ua:-88,fa:-86}),b:stand({ua:-84,fa:70}),eq:[{k:'bar',front:1}],touch:['W'],mv:'W',as:1});
D('curlh',{m:['biceps','avant-bras'],a:stand({ua:-88,fa:-86}),b:stand({ua:-84,fa:70}),eq:[{k:'db',front:1}],touch:['W'],mv:'W',as:1});
D('marteau',{m:['biceps','avant-bras'],a:stand({ua:-88,fa:-86}),b:stand({ua:-84,fa:70}),eq:[{k:'db',rr:0,front:1}],touch:['W'],mv:'W',as:1});
D('curl',{m:['biceps','avant-bras'],a:sit({t:95,ua:-42,fa:-38}),b:sit({t:95,ua:-42,fa:95}),eq:[seat(56,104,121.5),{k:'line',a:[82,76],b:[106,96],w:8,c:'#5E6461'},{k:'line',a:[100,96],b:[100,164],w:4},{k:'bar',front:1,r:9}],touch:['W','E'],mv:'W',as:1});
const CI={x:100,y:110,t:122,A:[140,163],ls:-1};
D('curlinc',{m:['biceps'],a:po({...CI,ua:-92,fa:-92}),b:po({...CI,ua:-92,fa:60}),eq:[padBehind(po(CI),-.05,1.28),seat(84,118,120.5,false),{k:'db',front:1}],touch:['W'],mv:'W',as:1});
D('curlpoulie',{m:['biceps','avant-bras'],a:stand({ua:-86,fa:-80}),b:stand({ua:-82,fa:72}),eq:[{k:'cable',from:[164,158],at:'Hd',handle:'bar'}],touch:['W'],mv:'W',as:1});
D('curlconc',{m:['biceps'],a:sit({t:58,ua:-72,fa:-86}),b:sit({t:58,ua:-72,fa:70}),eq:[seat(50,104,121.5),{k:'db',front:1}],touch:['W','E'],mv:'W',as:1});
/* ---------- TRICEPS ---------- */
D('triceps',{m:['triceps'],a:stand({t:84,ua:-96,fa:62}),b:stand({t:84,ua:-96,fa:-88}),eq:[{k:'cable',from:[126,-2],at:'Hd',handle:'bar'}],touch:['W'],mv:'W',as:1});
D('tricorde',{m:['triceps'],a:stand({t:84,ua:-96,fa:62}),b:stand({t:84,ua:-96,fa:-88}),eq:[{k:'rope',from:[126,-2],at:'Hd'}],touch:['W'],mv:'W',as:1});
D('barrefront',{m:['triceps'],a:lie({ua:100,fa:205}),b:lie({ua:100,fa:96}),eq:[FLAT,{k:'bar',front:1,r:9}],touch:['W'],mv:'W',as:-1});
D('extnuque',{vb:TALL,m:['triceps'],a:sit({t:92,ua:96,fa:-120}),b:sit({t:92,ua:96,fa:92}),eq:[seat(56,104,121.5),{k:'db',rr:0,front:1}],touch:['W'],mv:'W',as:-1});
D('dipsbanc',{m:['triceps','pectoraux'],a:po({x:80,y:140,t:94,A:[156,161],ls:1,W:[66,112],ws:1}),b:po({x:80,y:116,t:94,A:[156,161],ls:1,W:[66,112],ws:1}),eq:[seat(40,84,120)],touch:['W','A'],mv:'S',as:1,ao:-22});
const KB={x:86,y:86,t:22,A:[104,163],A2:[78,163],ls:1};
D('kickback',{m:['triceps'],a:po({...KB,ua:195,fa:-92}),b:po({...KB,ua:195,fa:192}),eq:[{k:'db',front:1}],touch:['W'],mv:'W',as:1});
D('tricmachine',{m:['triceps'],a:sit({t:95,ua:-32,fa:92}),b:sit({t:95,ua:-32,fa:-32}),eq:[seat(56,104,121.5),{k:'line',a:[82,76],b:[106,90],w:8,c:'#5E6461'},{k:'line',a:[100,92],b:[100,164],w:4},{k:'lever',piv:[100,84],at:'Hd',front:1}],touch:['W','E'],mv:'W',as:-1});
/* ---------- AVANT-BRAS ---------- */
D('curlpoignet',{m:['avant-bras'],a:sit({t:80,ua:-62,fa:-4,ha:-60}),b:sit({t:80,ua:-62,fa:-4,ha:50}),eq:[seat(56,104,121.5),{k:'bar',front:1,r:9}],touch:['W'],mv:'Hd',as:1,ao:10});
D('farmer',{m:['avant-bras','trapèzes','abdos'],a:stand({A:[116,163],A2:[76,163],ls:1,ua:-92,fa:-90}),b:stand({A:[76,163],A2:[116,163],ls:1,ua:-92,fa:-90}),eq:[{k:'db',rr:90,front:1}],touch:['W'],mv:'P',as:1,ao:-40});
/* ---------- JAMBES ---------- */
const SQB={x:70,y:124,t:52,A:[98,163],A2:[94,163],ls:1};
const sqDeep=o=>po(Object.assign({},SQB,o));
D('squat',{m:['quadriceps','fessiers','lombaires'],a:stand({W:[84,40],ws:1}),b:sqDeep({W:tp(sqDeep({}),1,-6),ws:1}),eq:[{k:'bar',at:'Bk',front:1}],touch:['Bk','A'],mv:'P',as:-1,ao:30});
D('frontsquat',{m:['quadriceps','fessiers'],a:stand({W:tp(stand({}),.92,10),ws:1}),b:sqDeep({t:64,W:tp(sqDeep({t:64}),.92,10),ws:1}),eq:[{k:'bar',at:'Fr',front:1}],touch:['Fr','A'],mv:'P',as:-1,ao:30});
D('goblet',{m:['quadriceps','fessiers'],a:stand({W:tp(stand({}),.8,12),ws:-1}),b:sqDeep({t:66,W:tp(sqDeep({t:66}),.8,12),ws:-1}),eq:[{k:'db',rr:0,front:1}],touch:['W','A'],mv:'P',as:-1,ao:30});
D('smithsquat',{m:['quadriceps','fessiers'],a:stand({x:92,W:[80,40],ws:1}),b:po({x:72,y:122,t:58,A:[102,163],A2:[98,163],ls:1,W:tp(po({x:72,y:122,t:58}),1,-6),ws:1}),eq:[{k:'line',a:[80,-10],b:[80,164],w:3},{k:'bar',at:'Bk',front:1}],touch:['Bk','A'],mv:'P',as:-1,ao:30});
const HK={t:104,A:[128,158],ls:1};
D('hack',{m:['quadriceps','fessiers'],a:po({...HK,x:96,y:80,W:tp(po({...HK,x:96,y:80}),.95,6),ws:1}),b:po({...HK,x:102,y:114,W:tp(po({...HK,x:102,y:114}),.95,6),ws:1}),
 eq:[padBehind(po({...HK,x:96,y:80}),-.8,1.25,11,false),{k:'line',a:[60,164],b:[82,74],w:4},{k:'line',a:[112,164],b:[146,152],w:6,c:'#5E6461'}],touch:['A','W'],mv:'P',as:1,ao:-30});
const LP={x:84,y:128,t:142};
D('presse',{m:['quadriceps','fessiers'],a:po({...LP,A:[118,94],ls:-1,ft:130,W:[100,132],ws:1}),b:po({...LP,A:[150,64],ls:-1,ft:130,W:[100,132],ws:1}),
 eq:[padBehind(po(LP),-.2,1.25,10.5,false),{k:'line',a:[60,140],b:[118,140],w:7,c:'#5E6461'},{k:'line',a:[70,145],b:[70,164],w:4},{k:'foot',rail:[[112,150],[196,66]]}],touch:['A'],mv:'A',as:1});
D('legext',{m:['quadriceps'],a:sit({t:100,A:[116,158],ls:1,W:[86,122],ws:1}),b:sit({t:100,A:[158,104],ls:1,W:[86,122],ws:1}),
 eq:[seat(52,124,121.5),padBehind(sit({t:100}),.05,1.2,10.5,false),{k:'pad',on:['K','A'],f:.88,r:6,arm:[121,112],front:1}],touch:['A'],mv:'A',as:1});
const LUN={x:92,y:86,t:90,A:[124,163],A2:[60,160],ls:1,ls2:1,ft2:-30};
D('fentes',{m:['quadriceps','fessiers'],a:po({...LUN,ua:-92,fa:-90}),b:po({...LUN,y:116,ua:-92,fa:-90}),eq:[{k:'db',front:1}],touch:['A'],mv:'P',as:-1,ao:30});
D('fentesmarche',{m:['quadriceps','fessiers'],a:po({...LUN,x:86,ua:-92,fa:-90}),b:po({...LUN,x:98,y:116,ua:-92,fa:-90}),eq:[{k:'db',front:1}],touch:['A'],mv:'P',as:-1,ao:30});
const BUL={x:96,y:84,t:88,A:[124,163],A2:[52,116],ls:1,ls2:1,ft2:-10};
D('bulgare',{m:['quadriceps','fessiers'],a:po({...BUL,ua:-92,fa:-90}),b:po({...BUL,y:112,x:92,ua:-92,fa:-90}),eq:[seat(24,66,123),{k:'db',front:1}],touch:['A'],mv:'P',as:-1,ao:30});
D('stepup',{vb:TALL,m:['quadriceps','fessiers'],a:po({x:92,y:96,t:84,A:[128,128],A2:[84,163],ls:1,ua:-92,fa:-90}),b:po({x:118,y:52,t:90,A:[124,128],A2:[100,110],ls:1,ls2:1,ua:-92,fa:-90}),
 eq:[{k:'rect',x:104,y:130,w:52,h:34,r:3,c:'#5E6461'},{k:'db',front:1}],touch:['A'],mv:'P',as:-1,ao:30});
D('legcurl',{m:['ischios'],a:sit({t:100,A:[160,112],ls:1,W:[86,122],ws:1}),b:sit({t:100,A:[112,156],ls:1,W:[86,122],ws:1}),
 eq:[seat(52,124,121.5),padBehind(sit({t:100}),.05,1.2,10.5,false),{k:'rect',x:92,y:94,w:30,h:7,r:3,c:'#5E6461'},{k:'pad',on:['K','A'],f:.92,r:6,arm:[121,112],front:1}],touch:['A'],mv:'A',as:1});
const PR={x:98,y:110,t:0,W:[166,128],ws:1};
D('legcurlallonge',{m:['ischios'],a:po({...PR,th:178,sh:178}),b:po({...PR,th:178,sh:70}),eq:[seat(40,160,121),{k:'pad',on:['K','A'],f:.9,r:6,front:1}],touch:['A','W'],mv:'A',as:1});
D('sdtr',{m:['ischios','fessiers','lombaires'],a:stand({W:[100,90],ws:1}),b:po({x:80,y:86,t:24,A:[100,163],A2:[96,163],ls:1,W:[120,132],ws:1}),eq:[{k:'bar',front:1}],touch:['W','A'],mv:'P',as:-1,ao:20});
D('nordic',{m:['ischios'],a:po({x:100,y:118,t:90,th:-90,sh:180,ft:-90,ua:-60,fa:30}),b:po({x:133.6,y:135.5,t:35,th:-145,sh:180,ft:-90,ua:-30,fa:-60}),
 eq:[{k:'rect',x:84,y:156,w:30,h:8,r:3,c:'#5E6461'},{k:'pad',at:'A',r:5,front:1}],touch:['A'],mv:'S',as:1});
D('hipthrust',{m:['fessiers','ischios'],a:po({x:92,y:140,t:129.5,A:[140,163],ls:1,W:[92,128],ws:1}),b:po({x:110,y:104,t:182.5,A:[140,163],ls:1,W:[110,92],ws:1}),
 eq:[seat(26,70,113.5),{k:'bar',at:'P',front:1}],touch:['A'],mv:'P',as:1,ao:-24});
D('pont',{m:['fessiers','ischios'],a:po({x:84,y:152,t:178,A:[122,162],ls:1,ua:-178,fa:-178}),b:po({x:92,y:132,t:162,A:[124,162],ls:1,ua:-160,fa:-178}),eq:[],touch:['A'],mv:'P',as:1,ao:-24});
const FSL={v:'front',x:100,y:112,t:90,sh:-90,thL:.48};
D('abduction',{v:'front',m:['fessiers'],a:po({...FSL,th:-84}),b:po({...FSL,th:-36}),eq:[seat(70,130,123,true),{k:'pad',at:'KR',r:5,front:1},{k:'pad',at:'KL',r:5,front:1}],touch:['K','KL'],mv:'K',as:-1});
D('adduction',{m:['adducteurs'],v:'front',a:po({...FSL,th:-36}),b:po({...FSL,th:-84}),eq:[seat(70,130,123,true),{k:'pad',at:'KR',r:5,front:1},{k:'pad',at:'KL',r:5,front:1}],touch:['K','KL'],mv:'K',as:1});
D('kickpoulie',{m:['fessiers','ischios'],a:stand({t:80,A:[96,163],A2:[92,163],W:[128,60],ws:-1}),b:stand({t:76,A:[38,130],ls:1,A2:[94,163],W:[128,60],ws:-1}),eq:[{k:'line',a:[140,0],b:[140,164],w:4},{k:'cable',from:[18,158],at:'A',handle:'none'}],touch:['A','W'],mv:'A',as:1});
const CALF={x:95,y:72,t:90,W:[88,32],ws:-1};
D('mollets',{m:['mollets'],a:po({...CALF,A:[95,150],A2:[93,150],ls:1,ft:12,ft2:12}),b:po({...CALF,y:62,A:[95,140],A2:[93,140],ls:1,ft:-50,ft2:-50}),
 eq:[{k:'rect',x:96,y:152,w:26,h:12,r:2,c:'#5E6461'},{k:'pad',at:'S',r:6,front:1},{k:'line',a:[70,30],b:[70,164],w:5}],touch:['S','T'],mv:'S',as:-1});
D('molletsassis',{m:['mollets'],a:sit({t:92,A:[118,150],ls:1,ft:14,W:[110,104],ws:-1}),b:sit({t:92,y:104,A:[118,142],ls:1,ft:-44,W:[110,98],ws:-1}),
 eq:[seat(56,104,121.5),{k:'rect',x:110,y:150,w:24,h:14,r:2,c:'#5E6461'},{k:'pad',at:'K',r:6,front:1}],touch:['K','T'],mv:'K',as:1});
const LPS={x:84,y:128,t:142,A:[150,64],ls:-1,W:[100,132],ws:1};
D('molletspresse',{m:['mollets'],a:po({...LPS,ft:150}),b:po({...LPS,ft:85}),eq:[padBehind(po(LPS),-.2,1.25,10.5,false),{k:'line',a:[60,140],b:[118,140],w:7,c:'#5E6461'},{k:'line',a:[70,145],b:[70,164],w:4},{k:'foot',rail:[[112,150],[196,66]]}],touch:['T'],mv:'T',as:1});
/* ---------- ABDOS ---------- */
D('crunch',{m:['abdos','obliques'],a:sit({t:96,W:tp(sit({t:96}),.92,12),ws:-1}),b:sit({t:58,W:tp(sit({t:58}),.92,12),ws:-1}),eq:[seat(56,104,121.5),{k:'pad',at:'W',r:6}],touch:['W'],mv:'S',as:1});
const CS={x:96,y:154,A:[132,162],ls:1};
D('crunchsol',{m:['abdos'],a:po({...CS,t:178,W:tp(po({...CS,t:178}),1.05,-2),ws:1}),b:po({...CS,t:146,W:tp(po({...CS,t:146}),1.05,-2),ws:1}),eq:[],touch:['A'],mv:'S',as:-1});
const KN={x:96,y:122,th:-90,sh:180,ft:-90};
D('crunchpoulie',{vb:TALL,m:['abdos','obliques'],a:po({...KN,t:92,W:tp(po({...KN,t:92}),1.02,8),ws:-1}),b:po({...KN,t:20,W:tp(po({...KN,t:20}),1.02,8),ws:-1}),eq:[{k:'rope',from:[110,-24],at:'Hd'}],touch:['W'],mv:'S',as:1});
const HG={x:98,y:66,t:92,W:[100,-30],ws:1};
D('releve',{vb:HANG,m:['abdos'],a:po({...HG,th:-92,sh:-92}),b:po({...HG,th:4,sh:2}),eq:[{k:'hbar',at:[100,-30],post:[[140,-30],[140,164]]},{k:'line',a:[100,-30],b:[140,-30],w:3}],touch:['W'],mv:'A',as:1});
D('relevegenoux',{m:['abdos'],a:po({x:92,y:88,t:92,ua:-90,fa:2,th:-94,sh:-92}),b:po({x:92,y:88,t:94,ua:-90,fa:2,th:52,sh:-70}),
 eq:[padBehind(po({x:92,y:88,t:92}),-.3,1.1,11,false),{k:'line',a:[90,73],b:[124,73],w:7,c:'#5E6461'},{k:'line',a:[72,40],b:[72,164],w:4}],touch:['E','W'],mv:'K',as:1});
const PL={x:90,y:138,t:4,A:[26,158],ls:1,ua:-90,fa:6};
D('gainage',{m:['abdos','obliques'],a:po(PL),b:po({...PL,y:136}),eq:[],touch:['E','A'],mv:null});
const RT={v:'front',x:100,y:132,t:90,tL:.82,th:-30,sh:-120,thL:.6,shL:.6};
D('russian',{v:'front',m:['obliques','abdos'],a:po({...RT,W:[140,118],ws:-1,W2:[136,116],ws2:-1,t:96}),b:po({...RT,W:[64,116],ws:1,W2:[60,118],ws2:1,t:84}),eq:[{k:'db',rot:0,front:1}],touch:['W'],mv:'W',as:-1,one:1});
D('roue',{m:['abdos'],a:po({x:82,y:118,t:58,th:-90,sh:180,ft:-90,W:[106,156],ws:1}),b:po({x:117.5,y:138.5,t:12,th:-150,sh:180,ft:-90,W:[166,156],ws:1}),eq:[{k:'wheel',front:1}],touch:['W','K'],mv:'W',as:-1});
D('woodchop',{v:'front',vb:TALL,m:['obliques','abdos'],a:fstand({t:86,W:[148,6],ws:1,W2:[142,0],ws2:1}),b:fstand({t:96,W:[62,118],ws:1,W2:[56,112],ws2:1}),eq:[{k:'cable',from:[170,-22],at:'HdR',handle:'none'}],touch:['W'],mv:'W',as:1,one:1});

}</script>
