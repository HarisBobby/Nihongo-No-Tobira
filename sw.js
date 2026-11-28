/* 日本語の扉 · Service Worker
   Setiap kali merilis update, ganti nilai BUILD di bawah (mis. '2026-12-05.1').
   Perubahan pada file ini membuat browser mengunduh versi baru aplikasi. */
const BUILD='2026-11-28.1';
const CACHE='pbj-'+BUILD;
const CORE=['index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    /* cache:'reload' melewati cache HTTP supaya yang tersimpan benar-benar versi terbaru */
    await Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const ks=await caches.keys();
    await Promise.all(ks.filter(k=>k.startsWith('pbj-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;           /* GA, dll. tidak dicegat */
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const hit=r.mode==='navigate'?await c.match('index.html'):await c.match(r);
    if(hit)return hit;                              /* cache-first: cepat dan bisa offline */
    try{
      const res=await fetch(r);
      if(res&&res.ok&&res.type==='basic')c.put(r.mode==='navigate'?'index.html':r,res.clone());
      return res;
    }catch(err){
      const fb=await c.match('index.html');
      if(r.mode==='navigate'&&fb)return fb;
      throw err;
    }
  })());
});
