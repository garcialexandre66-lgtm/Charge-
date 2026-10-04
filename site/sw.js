/* Charge 5.0 — cache hors ligne.
   - Seules les réponses HTTP valides (2xx, non opaques) entrent dans le cache : une erreur ne remplace jamais une copie qui marche.
   - La page est gardée sous une seule clé, './' (Cloudflare Pages redirige index.html vers /, et Safari refuse une page en cache issue d'une redirection).
   - Ouverture : réseau, mais si rien n'arrive en 2,5 s on sert la copie en cache. Autres fichiers : cache d'abord, puis réseau.
   - Chaque écriture du cache est attendue (waitUntil) : elle n'est pas perdue si le navigateur arrête le service worker. */
const C='charge-v5.0',PAGE='./',FILES=['manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
const good=res=>res&&res.ok&&res.type!=='opaque'&&res.type!=='opaqueredirect';
const clean=async res=>res.redirected?new Response(await res.clone().blob(),{status:res.status,statusText:res.statusText,headers:res.headers}):res.clone();
async function put(key,res){if(!good(res))return;try{const c=await caches.open(C);await c.put(key,await clean(res))}catch(e){}}
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(C);
 await put(PAGE,await fetch(PAGE,{cache:'reload'}));await Promise.all(FILES.map(f=>fetch(f,{cache:'reload'}).then(r=>put(f,r)).catch(()=>{})));
 if(!await c.match(PAGE))throw new Error('page non mise en cache');await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const OFFLINE=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Charge</title><body style="background:#EEF1EC;color:#18233A;font:16px system-ui;padding:32px"><h1 style="font-size:28px">Hors ligne</h1><p>Charge n'est pas encore enregistrée sur cet appareil. Ouvre-la une fois avec du réseau : ensuite elle marchera sans connexion.</p></body>`;
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
 if(r.mode==='navigate'){const net=fetch(r);
  e.waitUntil(net.then(res=>put(PAGE,res)).catch(()=>{}));
  e.respondWith((async()=>{const cached=await caches.match(PAGE);
   const live=net.then(res=>good(res)?res.clone():(cached||res));
   if(!cached)return live.catch(()=>new Response(OFFLINE,{headers:{'Content-Type':'text/html; charset=utf-8'}}));
   return Promise.race([live.catch(()=>cached),new Promise(ok=>setTimeout(()=>ok(cached),2500))])})());return}
 e.respondWith((async()=>{const m=await caches.match(r);if(m)return m;const res=await fetch(r);e.waitUntil(put(r,res.clone()));return res})())});
