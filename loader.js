 'use strict';
// Small compatibility shims run before any application module, including offline.
if(!Array.prototype.at)Object.defineProperty(Array.prototype,'at',{value:function(i){i=Math.trunc(i)||0;return this[i<0?this.length+i:i];},configurable:true,writable:true});
if(!String.prototype.replaceAll)Object.defineProperty(String.prototype,'replaceAll',{value:function(a,b){return a instanceof RegExp?this.replace(a,b):this.split(a).join(b);},configurable:true,writable:true});
for(const proto of [Element.prototype,DocumentFragment.prototype])if(!proto.replaceChildren)Object.defineProperty(proto,'replaceChildren',{value:function(...nodes){while(this.firstChild)this.removeChild(this.firstChild);this.append(...nodes);},configurable:true,writable:true});
if(typeof ResizeObserver!=='function')window.ResizeObserver=class{constructor(callback){this.callback=callback;this.nodes=new Set();this.update=()=>this.callback([...this.nodes].map(target=>({target,contentRect:target.getBoundingClientRect()})));window.addEventListener('resize',this.update);}observe(node){this.nodes.add(node);requestAnimationFrame(this.update);}unobserve(node){this.nodes.delete(node);}disconnect(){this.nodes.clear();window.removeEventListener('resize',this.update);}};

window.cleanAtlasCaches=async function(){
 if(!('caches'in window))return;
 try{const names=await window.caches.keys();await Promise.all(names.filter(name=>name.startsWith('solar-atlas-demo-')&&name!=='solar-atlas-demo-v43').map(name=>window.caches.delete(name)));}catch{}
};
window.finishAtlasBoot=async function(){
 if(document.body.classList.contains('mapPhotoPage')){
  const photograph=new Image();photograph.src=window.ATLAS_PHOTOS?.['stations/510000-15.webp']||'photos/stations/510000-15.webp';
  await Promise.race([photograph.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1600))]);
 }
 if(document.fonts)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,500))]);
 cleanAtlasCaches();
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 document.getElementById('atlas').removeAttribute('inert');document.querySelector('main').removeAttribute('inert');document.querySelector('main').removeAttribute('aria-busy');
 document.documentElement.dataset.atlasBoot='ready';document.getElementById('atlasLoading').hidden=true;window.ATLAS_REFINEMENTS_READY=true;
 if(location.protocol!=='file:'&&'serviceWorker'in navigator)navigator.serviceWorker.getRegistration().then(registration=>registration&&navigator.serviceWorker.register('sw.js?v=43',{updateViaCache:'none'})).catch(()=>{});
};
window.loadAtlasAsset=async function(asset){
 const compressed=typeof DecompressionStream==='function',urls=compressed?[asset.url+'.gz',asset.url]:[asset.url];
 // Hashed data URLs are immutable. Reuse validated data without a network round trip.
 let cache;try{if('caches'in window)cache=await caches.open('solar-atlas-data-v1');}catch{}
 async function decode(response){const bytes=new Uint8Array(await response.arrayBuffer());return bytes[0]===31&&bytes[1]===139?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(bytes));}
 for(const url of urls){try{const saved=await cache?.match(url);if(saved)return await decode(saved);}catch{try{await cache?.delete(url);}catch{}}}
 let failure;
 for(const url of urls){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),url.endsWith('.gz')?10000:20000);try{const response=await fetch(url,{signal:controller.signal,cache:'force-cache'});if(!response.ok)throw Error('数据请求未完成');const copy=response.clone(),data=await decode(response);cache?.put(url,copy).catch(()=>{});return data;}catch(error){failure=error;}finally{clearTimeout(timer);}}
 throw failure||Error('数据请求未完成');
};
// ONLINE_START
if('serviceWorker'in navigator)navigator.serviceWorker.getRegistration().then(reg=>{if(reg)navigator.serviceWorker.register('sw.js?v=43',{updateViaCache:'none'}).catch(()=>{});}).catch(()=>{});

let startingAtlas=false;
async function startAtlas(){
 if(startingAtlas)return;startingAtlas=true;
 const status=document.getElementById('loadStatus');status.textContent='正在载入全国图谱，精细县界将按需呈现…';
 document.getElementById('retryAtlas').hidden=true;
 try{
  window.ATLAS=await loadAtlasAsset(ATLAS_ASSETS.core);
  status.textContent='正在准备地图与分析界面…';
  const script=document.createElement('script');script.src='atlas-runtime.js?v=43';
  const fail=()=>{startingAtlas=false;status.textContent='页面未加载完成，请重新加载。';document.getElementById('retryAtlas').hidden=false;};
  script.onerror=fail;script.onload=()=>{if(!window.ATLAS_RUNTIME_INITIALIZED){fail();return;}finishAtlasBoot().catch(fail);};
  document.body.append(script);
 }catch(error){startingAtlas=false;status.textContent='地图数据暂未加载完成，请检查网络后重试。';document.getElementById('retryAtlas').hidden=false;}
}
document.getElementById('retryAtlas').onclick=()=>location.reload();startAtlas();
