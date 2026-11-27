/* Service worker 日本語の扉. Naikkan VERSION setiap kali index.html diperbarui agar pengguna menerima versi baru. */
const VERSION='pbj-v3';
const ASSETS=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  if(new URL(r.url).origin!==location.origin)return;
  const key=r.mode==='navigate'?new Request('./index.html'):r;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(key,{ignoreSearch:true});
    if(hit)return hit;
    try{const res=await fetch(r);if(res&&res.ok)c.put(key,res.clone());return res}
    catch(err){if(r.mode==='navigate')return c.match('./index.html');throw err}
  }));
});
