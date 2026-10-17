 'use strict';
// Small compatibility shims run before any application module, including offline.
if(!Array.prototype.at)Object.defineProperty(Array.prototype,'at',{value:function(i){i=Math.trunc(i)||0;return this[i<0?this.length+i:i];},configurable:true,writable:true});
if(!String.prototype.replaceAll)Object.defineProperty(String.prototype,'replaceAll',{value:function(a,b){return a instanceof RegExp?this.replace(a,b):this.split(a).join(b);},configurable:true,writable:true});
for(const proto of [Element.prototype,DocumentFragment.prototype])if(!proto.replaceChildren)Object.defineProperty(proto,'replaceChildren',{value:function(...nodes){while(this.firstChild)this.removeChild(this.firstChild);this.append(...nodes);},configurable:true,writable:true});
if(typeof ResizeObserver!=='function')window.ResizeObserver=class{constructor(callback){this.callback=callback;this.nodes=new Set();this.update=()=>this.callback([...this.nodes].map(target=>({target,contentRect:target.getBoundingClientRect()})));window.addEventListener('resize',this.update);}observe(node){this.nodes.add(node);requestAnimationFrame(this.update);}unobserve(node){this.nodes.delete(node);}disconnect(){this.nodes.clear();window.removeEventListener('resize',this.update);}};

window.cleanAtlasCaches=async function(){
 const controlled=!!navigator.serviceWorker?.controller;
 try{if('serviceWorker'in navigator){const registrations=await navigator.serviceWorker.getRegistrations();await Promise.all(registrations.filter(r=>new URL(r.scope).origin===location.origin).map(r=>r.unregister()));}}catch{}
 try{if('caches'in window){const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('solar-atlas-')).map(n=>caches.delete(n)));}}catch{}
 if(controlled&&location.protocol!=='file:'){const url=new URL(location.href);if(url.searchParams.get('release')!=='46'){url.searchParams.set('release','46');location.replace(url.href);return false;}}
 return true;
};
window.finishAtlasBoot=async function(){
 cleanAtlasCaches();
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 document.getElementById('atlas').removeAttribute('inert');document.querySelector('main').removeAttribute('inert');document.querySelector('main').removeAttribute('aria-busy');
 document.documentElement.dataset.atlasBoot='ready';document.getElementById('atlasLoading').hidden=true;window.ATLAS_REFINEMENTS_READY=true;
};
window.loadAtlasAsset=async function(asset){
 const urls=[asset.url+'.gz',asset.url];let failure;
 for(const url of urls){let timer;const controller=typeof AbortController==='function'?new AbortController():null;try{
  const bytes=await Promise.race([(async()=>{const response=await fetch(url,{cache:'default',...(controller?{signal:controller.signal}:{})});if(!response.ok)throw Error('数据请求未完成');return new Uint8Array(await response.arrayBuffer());})(),new Promise((_,reject)=>timer=setTimeout(()=>{controller?.abort();reject(Error('网络请求超时'));},15000))]);
  let decoded;
  if(bytes[0]===31&&bytes[1]===139){
   if(typeof DecompressionStream==='function')try{decoded=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();}catch{}
   if(decoded===undefined)decoded=window.pako.ungzip(bytes,{to:'string'});
  }else decoded=new TextDecoder().decode(bytes);
  return JSON.parse(decoded);
 }catch(error){failure=error;}finally{clearTimeout(timer);}}
 throw failure||Error('数据请求未完成');
};
// ONLINE_START

let startingAtlas=false;
async function startAtlas(){
 if(startingAtlas)return;startingAtlas=true;
 const status=document.getElementById('loadStatus');status.textContent='正在载入全国图谱，精细县界将按需呈现…';
 document.getElementById('retryAtlas').hidden=true;
 try{
  window.ATLAS=await loadAtlasAsset(ATLAS_ASSETS.core);
  status.textContent='正在准备地图与分析界面…';
  const script=document.createElement('script');script.src=window.ATLAS_BUILD?.runtime||'atlas-runtime.js?v=46';
  const fail=()=>{startingAtlas=false;status.textContent='页面未加载完成，请重新加载。';document.getElementById('retryAtlas').hidden=false;};
  script.onerror=fail;script.onload=()=>{if(!window.ATLAS_RUNTIME_INITIALIZED){fail();return;}finishAtlasBoot().catch(fail);};
  document.body.append(script);
 }catch(error){startingAtlas=false;status.textContent='地图数据暂未加载完成，请检查网络后重试。';document.getElementById('retryAtlas').hidden=false;}
}
document.getElementById('retryAtlas').onclick=()=>{const url=new URL(location.href);url.searchParams.set('refresh',Date.now());location.replace(url.href);};cleanAtlasCaches().then(ready=>{if(ready)startAtlas();}).catch(startAtlas);
