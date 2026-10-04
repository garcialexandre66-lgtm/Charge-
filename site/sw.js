/* Charge 4.3 — cache hors ligne.
   - Seules les réponses HTTP valides (2xx, non opaques) entrent dans le cache : une erreur 404/500 ne remplace jamais une copie qui marche.
   - Ouverture de l'appli : réseau, mais si rien n'arrive en 2,5 s on sert la copie en cache (secours hors ligne rapide).
   - Autres fichiers : cache d'abord, puis réseau. */
const C='charge-v4.3',SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const good=res=>res&&res.ok&&res.type!=='opaque'&&res.type!=='opaqueredirect';
/* Safari refuse d'afficher une page en cache issue d'une redirection : on en garde une copie « propre » */
const clean=async res=>res.redirected?new Response(await res.clone().blob(),{status:res.status,statusText:res.statusText,headers:res.headers}):res.clone();
async function put(key,res){if(!good(res))return;try{const c=await caches.open(C);await c.put(key,await clean(res))}catch(e){}}
const OFFLINE=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Charge</title><body style="background:#0B0C0D;color:#F4F3EF;font:16px system-ui;padding:32px"><h1 style="font-size:28px">Hors ligne</h1><p>Charge n'est pas encore enregistrée sur cet appareil. Ouvre-la une fois avec du réseau : ensuite elle marchera sans connexion.</p></body>`;
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
 if(r.mode==='navigate'){e.respondWith((async()=>{const cached=await caches.match('index.html')||await caches.match('./');
  const net=fetch(r).then(async res=>{if(good(res)){await put('index.html',res);return res}return cached||res});
  const fallback=cached||new Response(OFFLINE,{headers:{'Content-Type':'text/html; charset=utf-8'}});
  if(!cached)return net.catch(()=>fallback);
  return Promise.race([net.catch(()=>cached),new Promise(ok=>setTimeout(()=>ok(cached),2500))])})());return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{put(r,res);return res})))});
