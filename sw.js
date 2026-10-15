'use strict';
const CACHE='solar-atlas-demo-v29';
const SHELL=['./','index.html','style.css?v=29','asset-manifest.js?v=29','loader.js?v=29','app.js?v=29','competition.css?v=29','competition.js?v=29','case-study.js?v=29','province-examples.js?v=29','journey.js?v=29','journey.css?v=29','usability.js?v=29','model-lab.js?v=29','dashboard.js?v=29','analysis-studio.js?v=29','analysis-studio.css?v=29','scoring-guide.js?v=29','scoring-guide.css?v=29','province-gallery.js?v=29','province-gallery.css?v=29','readability.css?v=29','media/solar-context-poster.jpg','difference-attribution.js?v=29','visual-dashboard.js?v=29','visual-dashboard.css?v=29','photos/gansu.png','photos/guizhou.png'];
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
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
   try{const response=await fetch(event.request,{signal:AbortSignal.timeout(4000)});if(response.ok)return response;}catch{}
   return cached||await cache.match(new URL('./',self.registration.scope).href)||Response.error();
  }
  return cached||fetch(event.request);
 })());
});
