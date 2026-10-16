'use strict';
const CACHE='solar-atlas-demo-v32';
const SHELL=['./','index.html','style.css?v=32','asset-manifest.js?v=32','loader.js?v=32','app.js?v=32','competition.css?v=32','competition.js?v=32','case-study.js?v=32','province-examples.js?v=32','journey.js?v=32','journey.css?v=32','usability.js?v=32','model-lab.js?v=32','dashboard.js?v=32','analysis-studio.js?v=32','analysis-studio.css?v=32','scoring-guide.js?v=32','scoring-guide.css?v=32','province-gallery.js?v=32','province-gallery.css?v=32','context-data.js?v=32','context-dashboard.js?v=32','context-dashboard.css?v=32','readability.css?v=32','media/solar-context-poster.jpg','difference-attribution.js?v=32','visual-dashboard.js?v=32','visual-dashboard.css?v=32','findings-compact.js?v=32','findings-compact.css?v=32','ranking-neighbors.js?v=32','ranking-neighbors.css?v=32','portrait-refinement.js?v=32','portrait-refinement.css?v=32','page-layout.js?v=32','page-layout.css?v=32','gdp-page.js?v=32','gdp-page.css?v=32','decision-pages.js?v=32','decision-pages.css?v=32','reference-theme.css?v=32','reference-charts.js?v=32','photos/gansu.png','photos/guizhou.png'];
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
