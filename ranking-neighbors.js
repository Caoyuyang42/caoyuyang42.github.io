'use strict';
(()=>{
 if(!window.ATLAS_VISUAL_DASHBOARD_READY){console.warn('Ranking and neighbors require the map dashboard.');return;}
 const countyIndex=new Map(counties.map(c=>[c.id,c])),nationalCache=new Map();
 let rankKey='',neighborKey='',weightRevision=0,lastRanking=[],lastNeighbors=[],rankingFirst=null;
 const rankingScope=()=>selectedProv&&mode==='province'?provRows(selectedProv):areaRows();
 const scopeName=()=>selectedProv&&mode==='province'?selectedProv.name:provinces.find(p=>p.id===pid)?.name||'全国';
 const sortingKey=()=>metric==='priority'?'score':metric;
 const compare=(a,b,k)=>val(b,k)-val(a,k)||(valid(val(b,'score'))&&valid(val(a,'score'))?val(b,'score')-val(a,'score'):0)||a.id.localeCompare(b.id);
 function nationalRanking(){const k=sortingKey(),key=[version,k,k==='experimentScore'?weightRevision:0].join('|');let result=nationalCache.get(key);if(result)return result;const ordered=counties.filter(c=>valid(val(c,k))).slice().sort((a,b)=>compare(a,b,k)),positions=new Map(ordered.map((c,i)=>[c.id,i+1]));result={ordered,positions,key};nationalCache.set(key,result);return result;}
 function renderRanking(){
  const title=$('rankingTitle'),target=$('ranking'),tab=$('inspector-tab-ranking');if(!title||!target)return;
  if(tab)tab.textContent=metric==='priority'?'优选县域':'指标排行';
  if(metric==='spatialPattern'){title.textContent='空间集聚类别';target.innerHTML='<p class="rankingEmpty">切换数值图层，查看县域排行。</p>';lastRanking=[];return;}
  const national=nationalRanking(),pool=rankingScope(),scope=scopeName(),key=[national.key,metric,mode,pid,selectedProv?.id||''].join('|');if(key===rankKey&&target.firstElementChild===rankingFirst)return;rankKey=key;
  const ordered=pool.filter(c=>national.positions.has(c.id)).slice().sort((a,b)=>compare(a,b,sortingKey())),top=ordered.slice(0,5);
  title.textContent=metric==='priority'?'开发优先级 · 综合得分前五':defs[metric][0]+' · 数值前五';
  title.title=metric==='priority'?'全国五分位等级内按连续综合得分排序':'按当前指标数值从高到低排列';
  lastRanking=top.map((c,i)=>({id:c.id,name:c.name,value:val(c,metric),score:val(c,'score'),scopeRank:i+1,nationalRank:national.positions.get(c.id)}));
  target.innerHTML=top.map((c,i)=>'<button type="button" class="rank" data-id="'+c.id+'" data-position="'+String(i+1).padStart(2,'0')+'" data-national-rank="'+national.positions.get(c.id)+'" aria-label="定位'+esc(c.province+' '+c.name)+'，'+esc(defs[metric][0])+'全国第'+national.positions.get(c.id)+'位"><span>'+esc(c.name)+'<small>'+esc(c.province)+' · '+(scope==='全国'?'全国第'+national.positions.get(c.id)+'位':esc(scope)+'第'+(i+1)+'位 · 全国第'+national.positions.get(c.id)+'位')+'</small></span><b>'+display(val(c,metric),metric)+(metric==='priority'?'<small>得分 '+display(val(c,'score'),'score')+'</small>':'')+'</b></button>').join('')||'<p class="rankingEmpty">当前范围暂无有效值。</p>';
  rankingFirst=target.firstElementChild;for(const b of target.querySelectorAll('button'))b.onclick=()=>selectCounty(countyIndex.get(b.dataset.id));
 }
 window.ATLAS_RANKING_UI=renderRanking;

 // Keep legacy nodes mounted for saved analysis states; the focused view owns their presentation.
 const oldTab=$('inspector-tab-relations'),oldPane=$('inspector-relations');
 if(oldTab){oldTab.hidden=true;oldTab.tabIndex=-1;oldTab.setAttribute('aria-hidden','true');}
 if(oldPane){oldPane.hidden=true;oldPane.setAttribute('aria-hidden','true');}
 if(oldTab?.getAttribute('aria-selected')==='true')$('inspector-tab-portrait')?.click();
 const overlays=document.querySelector('.overlayControls');
 if(overlays){const reserveLabel=$('showReserves')?.closest('label');if(reserveLabel)document.querySelector('.mapControlContents')?.append(reserveLabel);overlays.hidden=true;}
 const details=document.createElement('details');details.id='selectedCountyNeighbors';details.className='selectedCountyNeighbors';details.hidden=true;
 details.innerHTML='<summary><span>近邻县域</span><small id="selectedNeighborCount"></small></summary><p class="selectedNeighborIntro">在附近县域中，综合比较发展条件与地理距离，选出关联较强的县。</p><div id="selectedNeighborList"></div><button type="button" class="frameNeighbors">查看近邻范围 ↗</button><details class="neighborMethod"><summary>关联度如何读取</summary><p>先找地理位置最近的8个县，再按“65%指标相似度 + 35%空间接近度”选出关联最高的4个。相似度越高，七项评价条件越接近；空间接近度随县域中心距离增加而降低。</p></details>';
 $('inspector-portrait')?.append(details);
 function neighborRows(){if(mode!=='county'||!selected)return [];return (selected.relations?.[version]||[]).map(r=>({...r,county:countyIndex.get(r.id)})).filter(r=>r.county).sort((a,b)=>b.strength-a.strength||a.id.localeCompare(b.id)).slice(0,4);}
 function renderNeighborList(){
  const current=mode==='county'?selected:null,list=neighborRows(),key=[current?.id||'',version].join('|');lastNeighbors=list.map(r=>({id:r.id,name:r.county.name,strength:r.strength,similarity:r.similarity,distance:r.distance}));
  details.hidden=!current;if(key===neighborKey)return;neighborKey=key;details.open=false;
  $('selectedNeighborCount').textContent=list.length+'县';
  $('selectedNeighborList').innerHTML=list.map(r=>'<button type="button" data-neighbor-county="'+r.id+'" aria-label="查看近邻县'+esc(r.county.name)+'"><span>'+esc(r.county.name)+'<small>'+r.distance.toFixed(0)+' km · 指标相似 '+r.similarity.toFixed(3)+'</small></span><b>'+r.strength.toFixed(3)+'<small>关联度</small></b></button>').join('')||'<p class="rankingEmpty">该县的近邻关联数据待补充。</p>';
  for(const b of $('selectedNeighborList').querySelectorAll('button'))b.onclick=()=>selectCounty(countyIndex.get(b.dataset.neighborCounty));
  details.querySelector('.frameNeighbors').hidden=!list.length;
 }
 function fitNeighbors(){const list=neighborRows();if(!selected||!list.length)return;const regions=[selected,...list.map(r=>r.county)],bounds=regions.map(c=>cachedRegionBounds(regionPath(c.id))).filter(Boolean);if(!bounds.length)return;const left=Math.min(...bounds.map(b=>b.x)),top=Math.min(...bounds.map(b=>b.y)),right=Math.max(...bounds.map(b=>b.x+b.width)),bottom=Math.max(...bounds.map(b=>b.y+b.height));fitBounds({x:left,y:top,width:right-left,height:bottom-top});}
 details.querySelector('.frameNeighbors').onclick=fitNeighbors;
 renderRelations=function(){const inline=$('inlineRelations');if(inline)inline.hidden=true;renderNeighborList();};
 let overlayKey='';
 renderOverlays=function(){
  renderReserveOverlay();const focus=mode==='county'?selected:null,list=neighborRows(),key=[focus?.id||'',mode,version,...list.map(r=>r.id)].join('|');
  $('showLinks').checked=!!focus;const status=$('linkStatus');if(status)status.textContent=focus?focus.name+' · '+list.length+'个近邻县':'选中县域后显示其近邻县';
  if(key===overlayKey)return;overlayKey=key;const layer=$('linksLayer');layer.replaceChildren();$('labelsLayer').replaceChildren();
  for(const r of list){const p=svg('path',{d:r.county.path,class:'selectedNeighborOutline','fill-rule':'evenodd','data-neighbor':r.id});p.append(svg('title',{},r.county.name+' · 与'+focus.name+'关联度 '+r.strength.toFixed(3)));layer.append(p);}
 };
 // Detailed county boundaries arrive after selection; keep the overlay on the same geometry.
 const beforeMarkSize=sizeRelationMarks;sizeRelationMarks=function(){beforeMarkSize();for(const p of $('linksLayer').querySelectorAll('.selectedNeighborOutline')){const county=countyIndex.get(p.dataset.neighbor);if(county&&p.getAttribute('d')!==county.path)p.setAttribute('d',county.path);}};
 const beforeDetail=renderDetail;renderDetail=function(){beforeDetail();renderRanking();renderNeighborList();};
 const inspector=document.querySelector('.inspectorTabs');inspector?.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();const tabs=[...inspector.querySelectorAll('button')].filter(b=>!b.hidden),active=tabs.findIndex(b=>b.getAttribute('aria-selected')==='true'),at=e.key==='Home'?0:e.key==='End'?tabs.length-1:(active+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;tabs[at]?.click();tabs[at]?.focus();},true);
 window.addEventListener('atlas:weights-committed',()=>{weightRevision++;rankKey='';if(metric==='experimentScore')renderRanking();});
 const refresh=()=>{rankKey='';overlayKey='';neighborKey='';renderRanking();renderNeighborList();renderOverlays();};
 window.ATLAS_RANKING_NEIGHBORS={refresh,getRanking:()=>lastRanking.map(r=>({...r})),getNeighbors:()=>lastNeighbors.map(r=>({...r})),fitNeighbors};
 window.ATLAS_RANKING_NEIGHBORS_READY=true;refresh();
})();
