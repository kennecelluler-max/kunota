// Nota Service - cache agar halaman bisa dibuka tanpa internet.
const CACHE='nota-service-mwznxdl8';
const FILES=['./','index.html','pemuat.js?v=mwznxdl8','a-3d19cfe5c0.bin','m-4051731f03.bin','manifest.webmanifest','icon-192.png','icon-512.png','favicon.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('nota-service-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url); if(u.origin!==location.origin)return; // Google Fonts & Apps Script tidak disentuh
  if(u.pathname.indexOf('/nota/')>=0)return; // halaman nota pelanggan selalu dari jaringan, tidak diganti halaman depan
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:false});
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res;}).catch(()=>null);
    if(hit)return hit;
    const res=await net; if(res)return res;
    // tanpa jaringan: halaman yang belum tersimpan diganti halaman depan (aplikasi), bukan galat kosong
    const fb=r.mode==='navigate'?await c.match('index.html'):null;
    return fb||new Response('Sedang offline dan halaman belum tersimpan.',{status:503,headers:{'content-type':'text/plain;charset=utf-8'}});
  }));
});
