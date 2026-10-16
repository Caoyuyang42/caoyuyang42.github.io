'use strict';
const CACHE='solar-atlas-demo-v35';
const SHELL=['./','index.html','style.css?v=35','asset-manifest.js?v=35','loader.js?v=35','app.js?v=35','competition.css?v=35','competition.js?v=35','case-study.js?v=35','province-examples.js?v=35','journey.js?v=35','journey.css?v=35','usability.js?v=35','model-lab.js?v=35','dashboard.js?v=35','analysis-studio.js?v=35','analysis-studio.css?v=35','scoring-guide.js?v=35','scoring-guide.css?v=35','province-gallery.js?v=35','province-gallery.css?v=35','context-data.js?v=35','context-dashboard.js?v=35','context-dashboard.css?v=35','readability.css?v=35','media/solar-context-poster.jpg','difference-attribution.js?v=35','visual-dashboard.js?v=35','visual-dashboard.css?v=35','findings-compact.js?v=35','findings-compact.css?v=35','ranking-neighbors.js?v=35','ranking-neighbors.css?v=35','portrait-refinement.js?v=35','portrait-refinement.css?v=35','page-layout.js?v=35','page-layout.css?v=35','gdp-page.js?v=35','gdp-page.css?v=35','decision-pages.js?v=35','decision-pages.css?v=35','reference-theme.css?v=35','reference-charts.js?v=35','nightlights-map.js?v=35','nightlights-map.css?v=35','county-workbench.js?v=35','county-workbench.css?v=35','photos/gansu.png','photos/guizhou.png'];
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
