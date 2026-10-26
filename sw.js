// Nota Service - cache agar halaman bisa dibuka tanpa internet.
const CACHE='nota-service-mvoktnt7';
const FILES=['./','index.html','app.js?v=mvoktnt7','manifest.webmanifest','icon-192.png','icon-512.png','favicon.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('nota-service-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url); if(u.origin!==location.origin)return; // Google Fonts & Apps Script tidak disentuh
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:false})||(r.mode==='navigate'?await c.match('index.html'):null);
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res;}).catch(()=>null);
    return hit||net.then(res=>res||new Response('Sedang offline dan halaman belum tersimpan.',{status:503,headers:{'content-type':'text/plain;charset=utf-8'}}));
  }));
});
