const CACHE_NAME='frm-idpw-v1-2';
const APP_FILES=['./','./index.html','./manifest.json','./icon.svg','./mascots-hero.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(cache=>cache.put(e.request,copy));return r;}).catch(()=>caches.match('./index.html'))));});
