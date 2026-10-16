'use strict';
(()=>{
 const pages=ATLAS_NAVIGATION.pages,workspace=$('atlas'),intro=document.querySelector('.intro'),insights=document.querySelector('.mapInsights');
 const priorityPage=pages.priority;
 let lastAtlasMetric=metric==='priority'?'score':metric,lastMapPage='';
 document.body.classList.add('separatePriority');
 $('networkNav')?.remove();
 $('metrics').querySelector('[data-metric="priority"]')?.remove();
 const remaining=[...$('metrics').querySelectorAll('button[data-metric]')];
 remaining.forEach((b,i)=>{const number=b.querySelector('em');if(number)number.textContent=String(i+1).padStart(2,'0');});
 const introAnchor=document.createComment('map introduction'),workspaceAnchor=document.createComment('indicator workspace');
 intro.before(introAnchor);workspace.before(workspaceAnchor);
 const chartHome=document.createElement('div');chartHome.id='priorityChartHome';chartHome.hidden=true;priorityPage.append(chartHome);chartHome.append(insights);
 const priorityLead=document.createElement('div');priorityLead.className='priorityLead';priorityLead.innerHTML='<span><i></i>全国同一评价尺度</span><span>1级 · 较低优先 → 5级 · 较高优先</span><button id="priorityMethod">查看评分方法</button>';
 document.querySelector('.compactMapBar').append(priorityLead);
 $('priorityMethod').onclick=()=>$('showScoringDemo').click();
 const summary=document.querySelector('.detailFold>summary');if(summary)summary.textContent='地区画像与指标排行';
 const focusTip=document.createElement('div');focusTip.className='mapFocusTip';focusTip.textContent='点击县域看条件与近邻 · 点击省份看实景 · 点击空白返回全国';document.querySelector('.mapCanvas').append(focusTip);
 const methods=document.createElement('div');methods.id='methodStorage';methods.hidden=true;document.body.append(methods);methods.append($('scoringGuide'));
 pages.gdp.append($('modelSection'));
 const mapTools=document.createElement('details');mapTools.id='mapExportMenu';mapTools.className='mapExportMenu';mapTools.innerHTML='<summary>对照与导出</summary><div class="mapExportContents"></div>';
 for(const node of [document.querySelector('.selectionActions'),document.querySelector('.analysisStateTools'),document.querySelector('.exportTools')])if(node)mapTools.lastElementChild.append(node);
 const scoreOpen=document.createElement('button');scoreOpen.className='mapScoreMethod';scoreOpen.textContent='综合得分如何计算？';scoreOpen.onclick=()=>$('showScoringDemo').click();mapTools.lastElementChild.prepend(scoreOpen);
 document.querySelector('.compactMapBar').append(mapTools);
 for(const id of ['dashboardModelJump','modelJump'])$(id).onclick=()=>document.querySelector('[data-page-link="gdp"]').click();
 for(const node of document.querySelectorAll('.rankingExplanation,.scoreMathDetails'))node.open=false;
 function activate(page){
  if(page==='atlas'||page==='priority'){
   const priority=page==='priority',changed=lastMapPage!==page;
   if(!priority&&lastMapPage==='atlas'&&metric!=='priority')lastAtlasMetric=metric;
   if(priority&&lastMapPage==='atlas'&&metric!=='priority')lastAtlasMetric=metric;
   if(priority){priorityPage.prepend(intro,workspace);workspace.append(insights);insights.hidden=false;metric='priority';}
   else{introAnchor.after(intro);workspaceAnchor.after(workspace);chartHome.append(insights);insights.hidden=true;if(metric==='priority')metric=lastAtlasMetric;}
   intro.querySelector('h1').textContent=priority?'中国县域光伏 · 开发优先级':'中国县域光伏 · 地图与模型';
   intro.querySelector('.eyebrow').textContent=priority?'逐光 / PRIORITY ATLAS':'逐光 / MULTIDIMENSIONAL ATLAS';
   for(const b of $('metrics').querySelectorAll('[data-metric]'))b.classList.toggle('active',b.dataset.metric===metric);
   lastMapPage=page;
   ATLAS_DASHBOARD_INSPECTOR.responsive();
   render();if(priority)$('controlSummary').textContent='联合筛选';
   if(changed&&priority&&!selected)ATLAS_DASHBOARD_INSPECTOR.show('ranking');
   requestAnimationFrame(()=>{if(!selected&&!selectedProv)fit();if(priority)ATLAS_DASHBOARD_INSPECTOR.drawAnalytics(true);window.ATLAS_PORTRAIT_REFINEMENT?.update?.();});
  }
 }
 const beforeMap=renderMap;renderMap=function(){if(document.body.dataset.page==='atlas'&&metric==='priority')metric=lastAtlasMetric;beforeMap();if(document.body.dataset.page==='atlas'&&metric!=='priority')lastAtlasMetric=metric;};
 window.ATLAS_PAGE_LAYOUT={activate,getState:()=>({page:document.body.dataset.page,lastAtlasMetric,workspacePage:workspace.closest('.appPage')?.dataset.page,chartsPage:insights.closest('.appPage')?.dataset.page})};
 activate(document.body.dataset.page||'context');
 window.addEventListener('atlas:filters-changed',()=>{if(document.body.dataset.page==='priority')$('controlSummary').textContent='联合筛选';});window.ATLAS_PAGES_READY=true;
})();
