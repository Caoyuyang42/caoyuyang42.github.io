'use strict';
window.cleanAtlasCaches=async function(){
 if(!('caches'in window))return;
 try{const names=await window.caches.keys();await Promise.all(names.filter(name=>name.startsWith('solar-atlas-demo-')&&name!=='solar-atlas-demo-v41').map(name=>window.caches.delete(name)));}catch{}
};
window.finishAtlasBoot=async function(){
 if(document.body.classList.contains('mapPhotoPage')){
  const photograph=new Image();photograph.src=window.ATLAS_PHOTOS?.['stations/510000-15.webp']||'photos/stations/510000-15.webp';
  await Promise.race([photograph.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1600))]);
 }
 if(document.fonts)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,500))]);
 await cleanAtlasCaches();
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 document.getElementById('atlas').removeAttribute('inert');document.querySelector('main').removeAttribute('inert');document.querySelector('main').removeAttribute('aria-busy');
 document.documentElement.dataset.atlasBoot='ready';document.getElementById('atlasLoading').hidden=true;window.ATLAS_REFINEMENTS_READY=true;
 if(location.protocol!=='file:'&&'serviceWorker'in navigator)navigator.serviceWorker.getRegistration().then(registration=>registration&&navigator.serviceWorker.register('sw.js',{updateViaCache:'none'})).catch(()=>{});
};
window.loadAtlasAsset=async function(asset){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
 try{
  const compressed=typeof DecompressionStream==='function';
  const response=await fetch(asset.url+(compressed?'.gz':''),{signal:controller.signal});
  if(!response.ok)throw new Error('数据请求未完成');
  if(!compressed)return await response.json();
  const bytes=new Uint8Array(await response.arrayBuffer());
  // Some hosts decode gzip at the HTTP layer; avoid decompressing twice.
  return bytes[0]===31&&bytes[1]===139?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(bytes));
 }finally{clearTimeout(timer);}
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
  const script=document.createElement('script');script.src='atlas-runtime.js?v=41';
  const fail=()=>{startingAtlas=false;status.textContent='页面未加载完成，请重新加载。';document.getElementById('retryAtlas').hidden=false;};
  script.onerror=fail;script.onload=()=>{if(!window.ATLAS_RUNTIME_INITIALIZED){fail();return;}finishAtlasBoot().catch(fail);};
  document.body.append(script);
 }catch(error){startingAtlas=false;status.textContent='地图数据暂未加载完成，请检查网络后重试。';document.getElementById('retryAtlas').hidden=false;}
}
document.getElementById('retryAtlas').onclick=()=>location.reload();startAtlas();
