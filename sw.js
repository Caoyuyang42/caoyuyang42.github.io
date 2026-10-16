'use strict';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('solar-atlas-'))await caches.delete(name);
 await self.clients.claim();await self.registration.unregister();
 for(const client of await self.clients.matchAll({type:'window'})){const url=new URL(client.url);if(url.origin===self.location.origin&&url.searchParams.get('release')!=='45'){url.searchParams.set('release','45');await client.navigate(url.href);}}
})()));
