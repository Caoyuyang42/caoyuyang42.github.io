'use strict';
(()=>{
 if(window.ATLAS_PORTRAIT_REFINEMENT_READY)return;
 const rawKeys=['solar','radiation','slope','land3','gdp','carbonTotal','land6','protected'];
 const profileKeys=['solar','slope','land3','gdp','carbonTotal','land6','coord'];
 const descriptions={
  solar:'把光照、地形、可建土地和保护区等条件合在一起看。数值越高，表示这些自然条件与可开发规模共同形成的光伏潜力越大。',
  radiation:'看一个地方获得太阳能的多少。这里把2016年平均地表辐射换成统一指数，数值越高，太阳能资源越丰富。',
  slope:'看县域内适合建设的平缓地形有多少。原始坡度以25°为界处理，再汇总成指数；数值越高，适宜坡度条件越好。',
  land3:'看土地中受到开发约束的部分有多少。林地、水域、冰川、湿地等类型参与土地利用统计；占比越高，可用土地越少。',
  gdp:'看当地经济活动的相对规模。优先采用已有统计GDP，缺失县域用夜间灯光模型补齐，再转换成全国统一指数。',
  carbonTotal:'看县域一年排放的二氧化碳总量，单位为吨CO₂。采用2023年记录，部分县域采用2022年记录；数值越大，排放总量越高。',
  land6:'看林地、草地、湿地、灌木等碳汇型土地占多大比例。占比越高，县域内这类生态空间越多。',
  protected:'看保护区与县域实际重合的面积占比。切到“实际边界”可以查看保护区的位置，点击县域可以查看重合面积。'
 };
 const shortNotes={solar:'自然条件与开发规模合成',radiation:'2016年地表辐射指数',slope:'25°阈值处理后的适宜坡度指数',land3:'占比越高，可用土地越少',gdp:'全国统一经济指数',carbonTotal:'年度二氧化碳排放总量',land6:'碳汇型土地占县域面积比例',protected:'保护区相交面积 / 县域面积',coord:'县内两个系统的匹配程度'};
 const help=document.createElement('div');help.id='layerPlainHelp';help.className='layerPlainHelp';help.setAttribute('role','tooltip');help.hidden=true;document.body.append(help);
 let helpTarget=null;
 function hideHelp(){if(helpTarget)helpTarget.removeAttribute('aria-describedby');helpTarget=null;help.hidden=true;}
 function showHelp(button){const key=button?.dataset.metric;if(!descriptions[key])return;helpTarget=button;button.removeAttribute('title');button.setAttribute('aria-describedby',help.id);help.innerHTML='<strong>'+esc(defs[key][0])+'</strong><p>'+esc(descriptions[key])+'</p>';help.hidden=false;const b=button.getBoundingClientRect(),w=help.getBoundingClientRect().width,h=help.getBoundingClientRect().height;let x=b.right+10;if(x+w>innerWidth-10)x=Math.max(10,b.left-w-10);help.style.left=x+'px';help.style.top=Math.max(10,Math.min(b.top,innerHeight-h-10))+'px';}
 function prepareHelp(){for(const button of document.querySelectorAll('#metrics [data-metric]')){const text=descriptions[button.dataset.metric];if(!text)continue;button.removeAttribute('title');button.setAttribute('aria-description',text);}}
 document.addEventListener('pointerover',e=>{const b=e.target.closest?.('#metrics [data-metric]');if(b&&b!==helpTarget)showHelp(b);});
 document.addEventListener('pointerout',e=>{if(helpTarget&&!helpTarget.contains(e.relatedTarget)&&helpTarget.contains(e.target))hideHelp();});
 document.addEventListener('focusin',e=>{const b=e.target.closest?.('#metrics [data-metric]');if(b)showHelp(b);});
 document.addEventListener('focusout',e=>{if(helpTarget?.contains(e.target))hideHelp();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hideHelp();});window.addEventListener('resize',hideHelp);window.addEventListener('hashchange',hideHelp);
 const caches=new Map();
 function nationalPercentile(value,key){if(!valid(value))return null;const cacheKey=version+'|'+key;let sorted=caches.get(cacheKey);if(!sorted){sorted=counties.map(c=>val(c,key)).filter(valid).sort((a,b)=>a-b);caches.set(cacheKey,sorted);}if(!sorted.length)return null;if(sorted.length===1)return 50;let a=0,b=sorted.length;while(a<b){const m=(a+b)>>1;if(sorted[m]<value)a=m+1;else b=m;}const lower=a;b=sorted.length;while(a<b){const m=(a+b)>>1;if(sorted[m]<=value)a=m+1;else b=m;}return Math.max(0,Math.min(100,(lower+a-1)/2/(sorted.length-1)*100));}
 function scopeRows(){return selected&&mode==='county'?[selected]:selectedProv?provRows(selectedProv):areaRows();}
 function scopeValue(list,key){if(selected&&mode==='county')return val(selected,key);if(key==='carbonTotal'){const v=list.map(c=>val(c,key)).filter(valid);return v.length?v.reduce((a,b)=>a+b,0):null;}if(key==='protected'){const area=list.reduce((s,c)=>s+(valid(c.area_km2)?c.area_km2:0),0);return area?list.reduce((s,c)=>s+(valid(c.protected_km2)?c.protected_km2:0),0)/area:null;}return avg(list,key);}
 function rawNumber(value,key){if(!valid(value))return '暂无记录';if(key==='carbonTotal')return value.toLocaleString('zh-CN',{maximumFractionDigits:0})+' <small>吨 CO₂</small>';return esc(display(value,key));}
 function renderValues(list){const detail=$('detail');if(!detail)return;for(const e of detail.querySelectorAll('.indicator'))e.remove();let values=detail.querySelector('.conditionValues');if(!values){values=document.createElement('section');values.className='conditionValues';values.setAttribute('aria-label','八项基础指标数值');const anchor=detail.querySelector('.gdpEstimate,.portraitExplanation');anchor?anchor.before(values):detail.append(values);}const single=mode==='county'&&!!selected;values.innerHTML='<div class="conditionValuesHeading"><strong>基础指标</strong><span>'+(single?'当前县域原值':'当前范围汇总')+'</span></div><div class="conditionValueGrid">'+rawKeys.map(key=>{const value=scopeValue(list,key),note=key==='carbonTotal'?(single?(selected.carbonTotalYear||'统计')+'年':list.filter(c=>valid(val(c,key))).length+'县合计'):key==='protected'&&!single?'按面积汇总':shortNotes[key];return '<div class="conditionValue" data-condition-key="'+key+'"><span>'+esc(defs[key][0])+'</span><b>'+rawNumber(value,key)+'</b><small>'+esc(note)+'</small></div>';}).join('')+'</div>';}
 let profileKey='';
 function renderProfile(list,force=false){const host=$('regionalRosette');if(!host)return;const key=[selected?.id,selectedProv?.id,pid,mode,version].join('|');if(key===profileKey&&!force)return;profileKey=key;host.classList.add('profileRefined');let content=host.querySelector('.conditionList');if(!content){content=document.createElement('div');content.className='conditionList';host.append(content);}const single=mode==='county'&&!!selected;content.innerHTML='<div class="conditionListHeading"><strong>七维条件画像</strong><span>指标数值 · 全国分位</span></div><p class="conditionListScope">'+esc(single?selected.name:(selectedProv?.name||provinces.find(p=>p.id===pid)?.name||'全国'))+(single?'的指标在全国县域中的位置':'：县域均值在全国县域中的位置')+'</p>'+profileKeys.map(key=>{const v=single?val(selected,key):avg(list,key),p=nationalPercentile(v,key);return '<div class="conditionProfileRow" data-profile-key="'+key+'"><div><span>'+esc(defs[key][0])+'</span><b>'+rawNumber(v,key)+'</b></div><div class="conditionProfileScale"><i style="width:'+(valid(p)?p:0)+'%"></i><span>'+(valid(p)?p.toFixed(1)+' 分位':'暂无记录')+'</span></div></div>';}).join('')+'<p class="conditionListReading">分位越高，该项数值越高；不可用土地占比越低，可用土地越多。</p>';
 const more=document.querySelector('.profileMore');if(more){more.querySelector('summary').textContent='查看画像与综合评价的指标口径';let note=more.querySelector('.portraitModelNote');if(!note){note=document.createElement('div');note.className='portraitModelNote';more.append(note);}note.innerHTML='<p>画像沿用地图指标名称，展示原值及其全国分位。碳排放总量反映县域排放规模。</p><p>综合评价的七项输入为自然光伏潜力、土地坡度、不可用土地占比、GDP经济指数、单位GDP碳排放、碳汇覆盖占比和耦合协调度。其中土地占比按反向处理，碳排放项使用单位GDP强度。</p>';}}
 function scrolling(){const fold=document.querySelector('.detailFold'),tabs=document.querySelector('.inspectorTabs');if(!fold)return;fold.classList.add('portraitScrollable');const tabHeight=tabs?.getBoundingClientRect().height||0;if(tabs)fold.style.setProperty('--portrait-tabs-height',tabHeight+'px');if(innerWidth>760){const height=fold.getBoundingClientRect().height,summary=fold.querySelector(':scope>summary'),summaryHeight=summary&&getComputedStyle(summary).display!=='none'?summary.getBoundingClientRect().height:0;if(height>0){const value=Math.max(80,height-tabHeight-summaryHeight-2)+'px';if(fold.style.getPropertyValue('--portrait-pane-height')!==value)fold.style.setProperty('--portrait-pane-height',value);}}}
 function update(force=false){prepareHelp();scrolling();const list=scopeRows();renderValues(list);renderProfile(list,force);}
 const prior=renderDetail;renderDetail=function(){prior();update(true);};
 window.addEventListener('resize',scrolling);const scrollFold=document.querySelector('.detailFold');if(scrollFold)new ResizeObserver(scrolling).observe(scrollFold);new MutationObserver(()=>{hideHelp();requestAnimationFrame(()=>update(true));}).observe(document.body,{attributes:true,attributeFilter:['data-page']});
 update(true);window.ATLAS_PORTRAIT_REFINEMENT_READY=true;
 window.ATLAS_PORTRAIT_REFINEMENT={update,rawKeys:[...rawKeys],profileKeys:[...profileKeys],descriptions:{...descriptions}};
})();
