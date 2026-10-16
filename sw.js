'use strict';
const CACHE='solar-atlas-demo-v34';
const SHELL=['./','index.html','style.css?v=34','asset-manifest.js?v=34','loader.js?v=34','app.js?v=34','competition.css?v=34','competition.js?v=34','case-study.js?v=34','province-examples.js?v=34','journey.js?v=34','journey.css?v=34','usability.js?v=34','model-lab.js?v=34','dashboard.js?v=34','analysis-studio.js?v=34','analysis-studio.css?v=34','scoring-guide.js?v=34','scoring-guide.css?v=34','province-gallery.js?v=34','province-gallery.css?v=34','context-data.js?v=34','context-dashboard.js?v=34','context-dashboard.css?v=34','readability.css?v=34','media/solar-context-poster.jpg','difference-attribution.js?v=34','visual-dashboard.js?v=34','visual-dashboard.css?v=34','findings-compact.js?v=34','findings-compact.css?v=34','ranking-neighbors.js?v=34','ranking-neighbors.css?v=34','portrait-refinement.js?v=34','portrait-refinement.css?v=34','page-layout.js?v=34','page-layout.css?v=34','gdp-page.js?v=34','gdp-page.css?v=34','decision-pages.js?v=34','decision-pages.css?v=34','reference-theme.css?v=34','reference-charts.js?v=34','nightlights-map.js?v=34','nightlights-map.css?v=34','photos/gansu.png','photos/guizhou.png'];
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
