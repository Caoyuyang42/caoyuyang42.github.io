'use strict';
const CACHE='solar-atlas-demo-v36';
const SHELL=['./','index.html','style.css?v=36','asset-manifest.js?v=36','loader.js?v=36','app.js?v=36','competition.css?v=36','competition.js?v=36','case-study.js?v=36','province-examples.js?v=36','journey.js?v=36','journey.css?v=36','usability.js?v=36','model-lab.js?v=36','dashboard.js?v=36','analysis-studio.js?v=36','analysis-studio.css?v=36','scoring-guide.js?v=36','scoring-guide.css?v=36','province-gallery.js?v=36','province-gallery.css?v=36','context-data.js?v=36','context-dashboard.js?v=36','context-dashboard.css?v=36','readability.css?v=36','media/solar-context-poster.jpg','difference-attribution.js?v=36','visual-dashboard.js?v=36','visual-dashboard.css?v=36','findings-compact.js?v=36','findings-compact.css?v=36','ranking-neighbors.js?v=36','ranking-neighbors.css?v=36','portrait-refinement.js?v=36','portrait-refinement.css?v=36','page-layout.js?v=36','page-layout.css?v=36','gdp-page.js?v=36','gdp-page.css?v=36','decision-pages.js?v=36','decision-pages.css?v=36','reference-theme.css?v=36','reference-charts.js?v=36','nightlights-map.js?v=36','nightlights-map.css?v=36','county-workbench.js?v=36','county-workbench.css?v=36','presentation-refinements.js?v=36','presentation-refinements.css?v=36','province-additions.js?v=36','photos/stations/110000-01-thumb.webp','photos/stations/110000-01.webp','photos/stations/120000-02-thumb.webp','photos/stations/120000-02.webp','photos/stations/130000-03-thumb.webp','photos/stations/130000-03.webp','photos/stations/140000-04-thumb.webp','photos/stations/140000-04.webp','photos/stations/210000-05-thumb.webp','photos/stations/210000-05.webp','photos/stations/220000-06-thumb.webp','photos/stations/220000-06.webp','photos/stations/230000-07-thumb.webp','photos/stations/230000-07.webp','photos/stations/310000-08-thumb.webp','photos/stations/310000-08.webp','photos/stations/350000-09-thumb.webp','photos/stations/350000-09.webp','photos/stations/360000-10-thumb.webp','photos/stations/360000-10.webp','photos/stations/370000-11-thumb.webp','photos/stations/370000-11.webp','photos/stations/430000-12-thumb.webp','photos/stations/430000-12.webp','photos/stations/450000-13-thumb.webp','photos/stations/450000-13.webp','photos/stations/460000-14-thumb.webp','photos/stations/460000-14.webp','photos/stations/500000-16-thumb.webp','photos/stations/500000-16.webp','photos/stations/500000-17-thumb.webp','photos/stations/500000-17.webp','photos/stations/510000-15-thumb.webp','photos/stations/510000-15.webp','photos/stations/610000-18-thumb.webp','photos/stations/610000-18.webp','photos/gansu.png','photos/guizhou.png'];
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
