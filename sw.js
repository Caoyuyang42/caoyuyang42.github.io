'use strict';
const CACHE='solar-atlas-demo-v31';
const SHELL=['./','index.html','style.css?v=31','asset-manifest.js?v=31','loader.js?v=31','app.js?v=31','competition.css?v=31','competition.js?v=31','case-study.js?v=31','province-examples.js?v=31','journey.js?v=31','journey.css?v=31','usability.js?v=31','model-lab.js?v=31','dashboard.js?v=31','analysis-studio.js?v=31','analysis-studio.css?v=31','scoring-guide.js?v=31','scoring-guide.css?v=31','province-gallery.js?v=31','province-gallery.css?v=31','context-data.js?v=31','context-dashboard.js?v=31','context-dashboard.css?v=31','readability.css?v=31','media/solar-context-poster.jpg','difference-attribution.js?v=31','visual-dashboard.js?v=31','visual-dashboard.css?v=31','findings-compact.js?v=31','findings-compact.css?v=31','ranking-neighbors.js?v=31','ranking-neighbors.css?v=31','portrait-refinement.js?v=31','portrait-refinement.css?v=31','page-layout.js?v=31','page-layout.css?v=31','gdp-page.js?v=31','gdp-page.css?v=31','decision-pages.js?v=31','decision-pages.css?v=31','photos/gansu.png','photos/guizhou.png'];
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
