'use strict';
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
async function startAtlas(){
 const status=document.getElementById('loadStatus');status.textContent='正在载入全国图谱，精细县界将按需呈现…';
 document.getElementById('retryAtlas').hidden=true;
 try{
  window.ATLAS=await loadAtlasAsset(ATLAS_ASSETS.core);
  const script=document.createElement('script');script.src='app.js?v=11';
  script.onerror=()=>{status.textContent='地图程序未加载完成，请重试。';document.getElementById('retryAtlas').hidden=false;};
  script.onload=()=>{document.getElementById('atlasLoading').hidden=true;document.getElementById('atlas').removeAttribute('inert');};
  document.body.append(script);
 }catch(error){status.textContent='地图数据暂未加载完成，请检查网络后重试。';document.getElementById('retryAtlas').hidden=false;}
}
document.getElementById('retryAtlas').onclick=startAtlas;startAtlas();
