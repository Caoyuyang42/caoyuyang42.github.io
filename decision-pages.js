'use strict';
(()=>{
 const pages=window.ATLAS_NAVIGATION?.pages;
 if(!pages?.candidates||!pages?.decision)return;
 const studio=$('analysisStudio'),lab=$('modelLab'),diagnostics=document.querySelector('.modelDiagnostics');
 pages.candidates.append(studio);pages.decision.append(diagnostics,lab);
 pages.candidates.classList.add('candidatePage');pages.decision.classList.add('decisionPage');
 const navigate=page=>{if(location.hash!=='#'+page)history.pushState(null,'','#'+page);ATLAS_NAVIGATION.show(page);};
 const heading=studio.querySelector('.studioHeading');heading.querySelector('h2').textContent='候选县域 · 条件筛选';heading.querySelector('.eyebrow').textContent='逐光 / CANDIDATE EXPLORER';heading.querySelector('p').textContent='设定资源与土地门槛，浏览满足条件的全部县域。';$('closeStudio').hidden=true;
 const filterTools=document.createElement('div');filterTools.className='candidateFilterTools';
 const filterConfig=[['sun','太阳辐射至少','sunFilter',false],['land','土地可用至少','landFilter',true],['reserve','保护区覆盖至多','reserveFilter',true]];
 filterTools.innerHTML='<label class="candidateScopeLabel">研究范围<select id="candidateScope"><option value="">全国</option>'+provinces.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('')+'</select></label>'+filterConfig.map(([key,label,id,pct])=>'<label>'+label+'<output id="candidateFilterValue-'+key+'"></output><input id="candidateFilter-'+key+'" type="range" min="0" max="1" step="0.01" aria-label="'+label+'"></label>').join('');heading.after(filterTools);
 const actionRow=document.createElement('div');actionRow.className='candidateFilterActions';const switcher=studio.querySelector('.studioSwitch');if(switcher)actionRow.append(switcher);filterTools.after(actionRow);studio.querySelector('.studioFilters').hidden=true;
 const tableView=document.createElement('section');tableView.id='candidateListView';tableView.className='candidateListView';
 const candidateHeading=studio.querySelector('.candidateHeading'),headerActions=candidateHeading?.querySelector('div');if(headerActions){headerActions.classList.add('candidateHeaderActions');heading.append(headerActions);candidateHeading.hidden=true;}
 const charts=studio.querySelector('.studioCharts');charts.id='candidateResourceView';charts.hidden=true;
 for(const node of [candidateHeading,studio.querySelector('.candidateBrowse'),$('candidateNote'),studio.querySelector('.candidateTable'),studio.querySelector('.candidatePagination')])if(node)tableView.append(node);
 const tabs=document.createElement('div');tabs.className='candidatePageTabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','候选县域查看方式');tabs.innerHTML='<button type="button" role="tab" data-candidate-view="list" aria-selected="true" aria-controls="candidateListView">候选清单</button><button type="button" role="tab" data-candidate-view="resource" aria-selected="false" aria-controls="candidateResourceView">资源分布与省域画像</button><span id="candidateScopeSummary"></span>';
 studio.append(tabs,tableView,charts);let view='list',loadingLab=null;
 function setCandidateView(value){view=value==='resource'?'resource':'list';tableView.hidden=view!=='list';charts.hidden=view!=='resource';for(const b of tabs.querySelectorAll('button')){b.setAttribute('aria-selected',String(b.dataset.candidateView===view));b.tabIndex=b.dataset.candidateView===view?0:-1;}if(view==='resource')ATLAS_FILTERS.setState(ATLAS_FILTERS.getState());}
 for(const b of tabs.querySelectorAll('button'))b.onclick=()=>setCandidateView(b.dataset.candidateView);
 tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...tabs.querySelectorAll('button')],next=e.key==='Home'?0:e.key==='End'?1:view==='list'?1:0;buttons[next].click();buttons[next].focus();});
 function syncCandidateControls(){const state=ATLAS_FILTERS.getState();for(const[key,,id,pct]of filterConfig){$('candidateFilter-'+key).value=$(id).value;$('candidateFilterValue-'+key).textContent=pct?Math.round(+$(id).value*100)+'%':(+$(id).value).toFixed(2);}const scope=selectedProv&&mode==='province'?selectedProv.id:pid;$('candidateScope').value=scope||'';$('candidateScopeSummary').textContent=(provinces.find(p=>p.id===scope)?.name||'全国')+' · '+ATLAS_FILTERS.getCandidates().length+'县满足条件';const check=$('applyCandidates');if(check)check.closest('label').title='同时作用于地图页候选高亮';}
 for(const[key,,id]of filterConfig){const input=$('candidateFilter-'+key);for(const type of ['input','change'])input.addEventListener(type,()=>{$(id).value=input.value;$(id).dispatchEvent(new Event(type,{bubbles:true}));$('candidateFilterValue-'+key).textContent=key==='sun'?(+input.value).toFixed(2):Math.round(+input.value*100)+'%';});}
 $('candidateScope').onchange=()=>{pid=$('candidateScope').value;selected=null;selectedProv=null;mode='county';$('province').value=pid;ATLAS_CANDIDATES.setState({...ATLAS_CANDIDATES.getState(),province:'',page:1});render();syncCandidateControls();};
 $('openStudio').onclick=()=>navigate('candidates');$('backToMap').onclick=()=>navigate('atlas');
 const previousReset=$('resetStudio').onclick;$('resetStudio').onclick=()=>{previousReset?.();syncCandidateControls();};
 // Existing row, scatter and province handlers retain their selection behavior; navigation follows it.
 studio.addEventListener('click',e=>{const button=e.target.closest('[data-locate]');if(button){requestAnimationFrame(()=>navigate('atlas'));return;}if(e.target.closest('[data-province]'))requestAnimationFrame(syncCandidateControls);});
 let plotPointer=null;$('resourcePlot').addEventListener('pointerdown',e=>{plotPointer={x:e.clientX,y:e.clientY,id:e.target.closest('circle[data-county]')?.dataset.county};});
 $('resourcePlot').addEventListener('pointerup',e=>{if(plotPointer?.id&&Math.hypot(e.clientX-plotPointer.x,e.clientY-plotPointer.y)<8)requestAnimationFrame(()=>navigate('atlas'));plotPointer=null;});
 $('resourcePlot').addEventListener('pointercancel',()=>plotPointer=null);
 $('resourcePlot').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.county)requestAnimationFrame(()=>navigate('atlas'));});
 window.addEventListener('atlas:filters-changed',syncCandidateControls);

 diagnostics.classList.add('decisionHeading');diagnostics.querySelector('h2').textContent='决策推演 · 偏好、稳健性与空间结构';diagnostics.querySelector('.eyebrow').textContent='逐光 / DECISION STUDIO';
 const loadState=document.createElement('section');loadState.className='decisionLoadState';loadState.hidden=true;loadState.innerHTML='<strong>正在准备决策数据…</strong><p>资源偏好、情景频率与空间检验将显示在这里。</p><button type="button" hidden>重新载入</button>';diagnostics.after(loadState);loadState.querySelector('button').onclick=()=>openDecision();
 const methodDialog=document.createElement('dialog');methodDialog.id='decisionMethodDialog';methodDialog.innerHTML='<div class="decisionDialogHeading"><h2 id="decisionMethodTitle">方法说明</h2><button type="button" aria-label="关闭方法说明">×</button></div><div class="decisionMethodBody"></div>';document.body.append(methodDialog);
 let methodReturn=null;function closeMethod(){methodDialog.close();}
 methodDialog.querySelector('button').onclick=closeMethod;methodDialog.addEventListener('click',e=>{if(e.target===methodDialog)closeMethod();});methodDialog.addEventListener('close',()=>{if(methodReturn){methodReturn.anchor.after(methodReturn.node);methodReturn.node.hidden=true;methodReturn=null;}});
 function methodButton(pane,title){const store=document.createElement('div');store.className='decisionMethodStore';store.hidden=true;pane.append(store);const anchor=document.createComment('decision method home');store.before(anchor);const nodes=[...pane.children].filter(n=>n!==store&&(n.matches('.modelRoles,.labNotice')||(n.tagName==='P'&&n.id!=='labWeightNote')));for(const node of nodes)store.append(node);const button=document.createElement('button');button.type='button';button.className='decisionMethodButton';button.textContent='方法与计算说明';button.onclick=()=>{if(methodReturn)closeMethod();methodReturn={node:store,anchor};$('decisionMethodTitle').textContent=title;store.hidden=false;methodDialog.querySelector('.decisionMethodBody').append(store);methodDialog.showModal();};return button;}
 function enhanceLab(){if(!window.ATLAS_LAB_READY||lab.dataset.compactReady)return;lab.dataset.compactReady='true';lab.classList.add('compactDecisionLab');lab.querySelector(':scope>.sectionHeading').hidden=true;
  const paneTitles=['协调类型如何形成','偏好与情景如何计算','空间集聚如何检验'];
  for(let i=0;i<3;i++){const pane=$('labPane'+i),footer=document.createElement('div');footer.className='decisionPaneFooter';const originalActions=[...pane.children].filter(n=>n.matches('button,.labActions'));footer.append(methodButton(pane,paneTitles[i]),...originalActions);pane.append(footer);}
  const selection=document.createElement('details');selection.className='decisionSelection';selection.innerHTML='<summary>所选县决策信息 <b id="decisionSelectionName"></b></summary>';lab.append(selection);selection.append($('labSelected'));
  const downloads=document.createElement('div');downloads.className='decisionDownloads';for(const a of [...lab.children].filter(n=>n.tagName==='A'))downloads.append(a);lab.append(downloads);
  for(const button of lab.querySelectorAll('[data-lab-layer]'))button.addEventListener('click',()=>navigate('atlas'));
  for(const button of lab.querySelectorAll('[data-lab-tab]'))button.addEventListener('click',()=>{lab.dataset.activeTab=button.dataset.labTab;});lab.dataset.activeTab=lab.querySelector('[data-lab-tab][aria-selected="true"]')?.dataset.labTab||'0';
  updateSelectedLabel();
 }
 function updateSelectedLabel(){if($('decisionSelectionName'))$('decisionSelectionName').textContent=selected?.name||'点击地图选择县域';}
 const originalOpen=$('openModelLab').onclick;$('openModelLab').onclick=async()=>{if(loadingLab)return loadingLab;loadingLab=Promise.resolve(originalOpen()).then(()=>{enhanceLab();if(document.body.dataset.page!=='decision')lab.hidden=true;}).finally(()=>loadingLab=null);return loadingLab;};
 async function openDecision(){loadState.hidden=!!window.ATLAS_LAB_READY;loadState.querySelector('button').hidden=true;loadState.querySelector('strong').textContent='正在准备决策数据…';lab.hidden=!window.ATLAS_LAB_READY;if(!window.ATLAS_LAB_READY)await $('openModelLab').onclick();enhanceLab();if(document.body.dataset.page!=='decision'){lab.hidden=true;loadState.hidden=true;return;}loadState.hidden=!!window.ATLAS_LAB_READY;lab.hidden=!window.ATLAS_LAB_READY;if(!window.ATLAS_LAB_READY){loadState.querySelector('strong').textContent='决策数据尚未载入';loadState.querySelector('button').hidden=false;}window.scrollTo({top:0,behavior:'instant'});}
 window.addEventListener('atlas:lab-ready',enhanceLab);const beforeDetail=renderDetail;renderDetail=function(){beforeDetail();updateSelectedLabel();};
 function activate(page){const candidates=page==='candidates',decision=page==='decision';studio.hidden=!candidates;lab.hidden=!decision;loadState.hidden=true;$('openStudio').setAttribute('aria-expanded',String(candidates));if(candidates){ATLAS_FILTERS.setState(ATLAS_FILTERS.getState());syncCandidateControls();}if(decision)openDecision();}
 window.addEventListener('atlas:page-changed',e=>activate(e.detail?.page));
 window.ATLAS_DECISION_PAGES={activate,setCandidateView,getState:()=>({candidateView:view,labReady:!!window.ATLAS_LAB_READY,activeTab:lab.dataset.activeTab||'0'})};window.ATLAS_DECISION_PAGES_READY=true;activate(document.body.dataset.page);syncCandidateControls();
})();
