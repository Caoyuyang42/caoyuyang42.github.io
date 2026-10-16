'use strict';
const CACHE='solar-atlas-demo-v43';
const SHELL=["./","index.html","atlas-ui.css?v=43","atlas-runtime.js?v=43","asset-manifest.js?v=43","loader.js?v=43","media/solar-context-poster.jpg","photos/stations/110000-01-thumb.webp","photos/stations/110000-01.webp","photos/stations/120000-replacement-b545d7ddbe-thumb.webp","photos/stations/120000-replacement-b545d7ddbe.webp","photos/stations/130000-03-thumb.webp","photos/stations/130000-03.webp","photos/stations/140000-04-thumb.webp","photos/stations/140000-04.webp","photos/stations/210000-05-thumb.webp","photos/stations/210000-05.webp","photos/stations/220000-06-thumb.webp","photos/stations/220000-06.webp","photos/stations/230000-07-thumb.webp","photos/stations/230000-07.webp","photos/stations/310000-08-thumb.webp","photos/stations/310000-08.webp","photos/stations/350000-09-thumb.webp","photos/stations/350000-09.webp","photos/stations/360000-10-thumb.webp","photos/stations/360000-10.webp","photos/stations/370000-11-thumb.webp","photos/stations/370000-11.webp","photos/stations/430000-12-thumb.webp","photos/stations/430000-12.webp","photos/stations/450000-13-thumb.webp","photos/stations/450000-13.webp","photos/stations/460000-14-thumb.webp","photos/stations/460000-14.webp","photos/stations/500000-16-thumb.webp","photos/stations/500000-16.webp","photos/stations/500000-17-thumb.webp","photos/stations/500000-17.webp","photos/stations/510000-15-thumb.webp","photos/stations/510000-15.webp","photos/stations/610000-replacement-a10fbbd110-thumb.webp","photos/stations/610000-replacement-a10fbbd110.webp","photos/gansu.png","photos/guizhou.png"];
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
async function timedFetch(request,milliseconds){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),milliseconds);try{return await fetch(request,{cache:'no-cache',signal:controller.signal});}finally{clearTimeout(timer);}}
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('solar-atlas-demo-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('message',event=>{
 if(event.data?.type!=='PREPARE'||!event.ports[0])return;
 const port=event.ports[0];
 event.waitUntil((async()=>{try{const cache=await caches.open(CACHE),urls=[...new Set([...SHELL,...(event.data.assets||[])])];let done=0;
  for(const path of urls){const url=new URL(path,self.registration.scope);if(url.origin!==self.location.origin)throw Error('离线资源必须来自当前网站');const response=await fetch(url.href,{cache:'reload'});if(!response.ok)throw Error('部分资源未完成下载');await cache.put(url.href,response);port.postMessage({type:'progress',done:++done,total:urls.length});}
  port.postMessage({type:'done'});
 }catch(error){port.postMessage({type:'error',message:error.message});}})());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(event.request);
  if(event.request.mode==='navigate'){
   try{const response=await timedFetch(event.request,3000);if(response.ok)return response;}catch{}
   return cached||await cache.match(new URL('./',self.registration.scope).href)||Response.error();
  }
  if(event.request.destination==='script'||event.request.destination==='style'){
   // Exact versioned URLs can be served immediately; old versions never match.
   if(cached&&new URL(event.request.url).searchParams.has('v'))return cached;
   try{const response=await timedFetch(event.request,10000);if(response.ok){if(new URL(event.request.url).searchParams.has('v'))await cache.put(event.request,response.clone());return response;}}catch{}
   return cached||Response.error();
  }
  return cached||fetch(event.request);
 })());
});
