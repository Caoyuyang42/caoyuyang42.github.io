'use strict';
// Match the reference dashboard without observing or walking the county map.
(()=>{
 if(window.ATLAS_REFERENCE_CHARTS_READY||typeof svg!=='function')return;
 const palette=Object.freeze({
  '#294d61':'#165984','#397580':'#147f9b','#72a79e':'#11a9b1','#d3ba7b':'#48d4bb','#ffb454':'#ffc44d',
  '#a8cbd8':'#165984','#77bac8':'#147f9b','#91c9b8':'#11a9b1','#dec48a':'#48d4bb','#ffc378':'#ffc44d',
  '#75d5ce':'#1ee1bd','#79cfc9':'#1ee1bd','#74d9d2':'#1ee1bd','#7dcac4':'#23d7be','#80bcb0':'#23d7be',
  '#e5bc7c':'#1bcab9','#e5bf79':'#ffc44d','#ffd08a':'#ffc44d','#ffe0a5':'#ffdb7c','#ffbb60':'#ffc44d',
  '#baa5e5':'#779bff','#ec9d8f':'#ff986e',
  '#163447':'#0d2355','#294c5e':'#15356c','#3f6173':'#194577','#263b4c':'#20477b','#2a3c4d':'#20477b',
  '#6b8997':'#4388c4','#628da1':'#3b91dc','#608495':'#3b91dc','#628b9f':'#3b91dc','#6a93a1':'#3b91dc','#89a8b1':'#3b91dc','#6f9aaa':'#3b91dc',
  '#c8dde5':'#d0e7ff','#bad4df':'#c8e6ff','#b9d0db':'#c8e6ff','#c1d9e2':'#d4eaff','#d7e6ea':'#e0f1ff','#dcebf0':'#e0f1ff','#eaf1f7':'#e0f1ff',
  '#93b3c1':'#8fb8e2','#99aabd':'#91b6df','#96aabd':'#91b6df','#a6c3d2':'#a2c5ed','#b9d3df':'#c6e3ff',
  '#9bbdcc':'#91b6df','#96bbcb':'#91b6df','#a9c8d5':'#a4c8eb','#e9d2ad':'#ffdb7c'
 });
 const remap=value=>{
  if(typeof value!=='string')return value;
  const input=value.trim().toLowerCase(),base=input.slice(0,7);
  return palette[input]||(palette[base]&&/^#[0-9a-f]{8}$/.test(input)?palette[base]+input.slice(7):value);
 };
 const attributes=['fill','stroke','stop-color','flood-color'];
 // All chart redraws already use this small factory, so colors are normalized
 // as nodes are created. There are no background chart sweeps or map observers.
 const create=svg;
 svg=function(tag,attrs,text){
  if(attrs){let themed=null;for(const key of attributes){if(!(key in attrs))continue;const next=remap(attrs[key]);if(next!==attrs[key]){themed??={...attrs};themed[key]=next;}}if(themed)attrs=themed;}
  return create(tag,attrs,text);
 };
 function applyChart(chart){
  if(!chart||chart.id==='map'||chart.closest('#map'))return;
  for(const node of [chart,...chart.querySelectorAll('[fill],[stroke],[stop-color],[flood-color]')])for(const key of attributes){const value=node.getAttribute(key);if(value===null)continue;const next=remap(value);if(next!==value)node.setAttribute(key,next);}
 }
 // This one-time pass handles charts created before this optional theme module.
 for(const chart of document.querySelectorAll('svg'))applyChart(chart);
 const cards=document.getElementById('multiCountyCards');
 const themeCards=()=>{if(!cards)return;for(const card of cards.querySelectorAll('.multiCountyCard')){const previous=card.style.getPropertyValue('--county-color'),next=remap(previous);if(next!==previous)card.style.setProperty('--county-color',next);}};
 themeCards();
 // Only the visible, paginated county-card strip needs an HTML style update.
 // Its child list is bounded to eight cards and this observer ignores styles.
 if(cards)new MutationObserver(themeCards).observe(cards,{childList:true});
 window.ATLAS_REFERENCE_CHARTS={palette,remap,applyChart};
 window.ATLAS_REFERENCE_CHARTS_READY=true;
})();
