'use strict';
(() => {
 const example=window.ATLAS_CASE;
 const person=id=>counties.find(c=>c.id===id);
 const caseA=person(example.a.id),caseB=person(example.b.id);
 const casePanel=document.createElement('section');casePanel.id='caseJourney';casePanel.className='caseJourney';
 casePanel.innerHTML=`<div class="caseTop"><div><div class="eyebrow">ONE QUESTION / 一组真实反差</div><h2>光照相近，为什么排序不同？</h2><p>从同省两县出发，沿着指标、协调度与综合排序，读懂一张地图。</p></div><button id="startCase" class="casePrimary">展开故事 ↗</button></div><div id="caseStage" hidden><div class="caseSteps" role="group" aria-label="案例章节">${['看资源','看协调','看排序','看边界'].map((x,i)=>`<button data-case-step="${i}" aria-pressed="false"><small>0${i+1}</small>${x}</button>`).join('')}</div><div class="caseScene"><div><p class="caseKicker" id="caseKicker"></p><h3 id="caseTitle"></h3><p id="caseText"></p><div class="caseNavigation"><button id="casePrev">← 上一步</button><button id="caseNext">下一步 →</button><button id="caseCompare">完整比较两县</button></div></div><div id="caseChart"></div></div><details class="caseMethod"><summary>这个案例如何选出？展开计算依据</summary><p>${esc(example.rule)} 共 ${example.eligiblePairs.toLocaleString()} 组满足条件；${esc(example.note)}</p><div id="caseMath"></div></details></div>`;
 $('atlas').before(casePanel);
 const caseSteps=[
  {metric:'radiation',title:'相近的阳光，不同的起点。',text:`${caseA.name}的辐射指数为 ${caseA.radiation.toFixed(3)}，${caseB.name}为 ${caseB.radiation.toFixed(3)}，绝对差仅 ${Math.abs(caseA.radiation-caseB.radiation).toFixed(3)}。这里只比较归一化辐射，不把它当作发电量。`,key:'radiation',label:'太阳辐射指数',note:'共同刻度 0–1 · 2016 年',kicker:'01 / 资源问题'},
  {metric:'coord',title:'协调度更高，也不等于排名更高。',text:`两县协调度分别为 ${example.a.coord.toFixed(3)} 与 ${example.b.coord.toFixed(3)}。协调度衡量两个系统的联合状态；它单独保留，不再重复进入综合排名。`,key:'coord',label:'县域内耦合协调度 D',note:'共同刻度 0–1 · 统计优先版',kicker:'02 / 系统问题'},
  {metric:'priority',title:'六项输入，按同一标尺比较。',text:`${caseA.name}为 ${example.a.priority} 级，${caseB.name}为 ${example.b.priority} 级。两县自然光伏潜力指数分别为 ${example.a.solar.toFixed(4)} 和 ${example.b.solar.toFixed(4)}，并非同样高。采用六指标等权评分与五分位分组，协调度不重复计入。`,key:'score',label:'综合得分',note:'共同刻度 0–1 · 五分位分组，5级最高',kicker:'03 / 排序问题'},
  {metric:'protected',title:'研究排序之后，再看空间边界。',text:`两县保护区覆盖率分别为 ${(caseA.protected*100).toFixed(1)}% 与 ${(caseB.protected*100).toFixed(1)}%。保护区实际轮廓帮助核查空间约束；本图层没有再次扣减研究得分，也不把整县视为禁建区。`,key:'protected',label:'保护区覆盖率',note:'共同刻度 0–100% · 面积相交比例',kicker:'04 / 空间问题'}
 ];
 let caseIndex=0,caseActive=false,restoreState=null;
 function setMetric(k){metric=k;document.querySelectorAll('#metrics button').forEach(b=>b.classList.toggle('active',b.dataset.metric===k));}
 function framePair(a,b){
  const nodes=[a,b].map(c=>$('regions').querySelector('[data-id="'+c.id+'"]')).filter(Boolean),boxes=nodes.map(n=>n.getBBox());
  if(!boxes.length)return;const x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y));fitBounds({x,y,width:Math.max(...boxes.map(b=>b.x+b.width))-x,height:Math.max(...boxes.map(b=>b.y+b.height))-y});
 }
 function showCase(index){
  if(!caseActive){restoreState={metric,mode,pid,selected,selectedProv,view:[...view],links:$('showLinks').checked,reserves:$('showReserves').checked,protectedView,compareA:$('compareA').value,compareB:$('compareB').value};caseActive=true;}
  caseIndex=index;const step=caseSteps[index];$('caseStage').hidden=false;$('startCase').textContent='退出案例 · 恢复探索';
  document.querySelectorAll('[data-case-step]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.caseStep===index)));
  $('caseKicker').textContent=step.kicker;$('caseTitle').textContent=step.title;$('caseText').textContent=step.text;
  $('casePrev').disabled=index===0;$('caseNext').textContent=index===3?'生成两县结论 →':'下一步 →';
  $('caseChart').innerHTML='<div class="caseChartHeading">'+step.label+'<small>'+step.note+'</small></div>'+[example.a,example.b].map((p,i)=>{const v=p[step.key];return '<div class="caseBar"><span><b>'+esc(p.name)+'</b><strong>'+(step.key==='protected'?(v*100).toFixed(1)+'%':v.toFixed(3))+'</strong></span><div><i style="width:'+(v*100)+'%"></i></div><small>研究优先级 '+p.priority+' 级</small></div>';}).join('');
  pid=caseA.pid;mode='county';selected=caseA;selectedProv=null;$('province').value=pid;setMetric(step.metric);protectedView='footprint';$('showReserves').checked=index===3;$('showLinks').checked=false;render();framePair(caseA,caseB);ensureCountyDetail(pid);
  setComparison(caseA.id,caseB.id);$('caseJourney').scrollIntoView({behavior:'smooth',block:'start'});
 }
 function exitCase(){
  if(!caseActive)return;caseActive=false;$('caseStage').hidden=true;$('startCase').textContent='展开故事 ↗';
  if(restoreState){({metric,mode,pid,selected,selectedProv,view,protectedView}=restoreState);$('province').value=pid;$('showLinks').checked=restoreState.links;$('showReserves').checked=restoreState.reserves;setMetric(metric);render();setView();setComparison(restoreState.compareA,restoreState.compareB);restoreState=null;}
 }
 $('startCase').onclick=()=>caseActive?exitCase():showCase(0);
 document.querySelectorAll('[data-case-step]').forEach(b=>b.onclick=()=>showCase(+b.dataset.caseStep));
 $('casePrev').onclick=()=>showCase(Math.max(0,caseIndex-1));$('caseNext').onclick=()=>caseIndex===3?loadExampleComparison():showCase(caseIndex+1);$('caseCompare').onclick=loadExampleComparison;
 function loadExampleComparison(){setComparison(caseA.id,caseB.id);revealSection($('compareSection'));}
 $('caseMath').innerHTML=`<p>协调度计算可展开到两个系统的加权输入；综合评分通过等权欧氏距离求得，不把得分伪拆成简单指标贡献。</p><div class="caseMathGrid">${[example.a,example.b].map(p=>`<div><h4>${esc(p.name)}</h4><p>PV ${p.pv.toFixed(4)} · CCS ${p.ccs.toFixed(4)} · D ${p.coord.toFixed(4)}</p><ul>${p.pvParts.map(k=>`<li>${k.label}：${k.value.toFixed(4)} × ${k.weight} = ${k.contribution.toFixed(4)}</li>`).join('')}</ul><p>CCS 输入：${p.ccsParts.map(k=>`${k.label} ${k.value.toFixed(4)} × ${k.weight}`).join(' + ')}</p><p>到理想点距离 ${p.idealDistance.toFixed(4)}；到负理想点距离 ${p.antiIdealDistance.toFixed(4)}。</p><p>综合得分 = ${p.antiIdealDistance.toFixed(4)} / (${p.idealDistance.toFixed(4)} + ${p.antiIdealDistance.toFixed(4)}) ≈ ${p.score.toFixed(4)}</p></div>`).join('')}</div>`;
 // Map -> chosen pair -> comparison -> a self-contained result card.
 const actionBar=document.createElement('div');actionBar.className='selectionActions';actionBar.innerHTML='<span>把地图发现带入对照</span><button id="selectAsA">选中县 → A</button><button id="selectAsB">选中县 → B</button><button id="goToCompare">查看 A / B</button><span id="selectionFeedback" role="status"></span>';$('atlas').after(actionBar);
 function markComparison(a,b){
  document.querySelectorAll('#regions .compareARegion,#regions .compareBRegion').forEach(n=>n.classList.remove('compareARegion','compareBRegion'));
  if(mode==='county'){for(const [id,name] of [[a,'compareARegion'],[b,'compareBRegion']])$('regions').querySelector('[data-id="'+id+'"]')?.classList.add(name);}
 }
 function setComparison(a,b){$('compareA').value=a;$('compareB').value=b;renderComparison();markComparison(a,b);updateConclusion();}
 for(const role of ['A','B'])$('selectAs'+role).onclick=()=>{if(!selected){$('selectionFeedback').textContent='请先点击地图选择一个县域。';return;}$('compare'+role).value=selected.id;renderComparison();markComparison($('compareA').value,$('compareB').value);updateConclusion();$('selectionFeedback').textContent=role+' 已设为 '+selected.name;};
 $('goToCompare').onclick=()=>revealSection($('compareSection'));
 const compareTools=document.createElement('div');compareTools.className='compareActions';compareTools.innerHTML='<button id="locateCompareA">地图定位 A</button><button id="locateCompareB">地图定位 B</button><button id="frameComparison">地图同屏看两县</button><button id="saveResultCard" class="casePrimary">导出结论卡 PNG ↓</button><button id="printResultCard">打印 / 存为 PDF</button>';$('comparisonSummary').before(compareTools);
 const result=document.createElement('div');result.className='resultConclusion';result.id='resultConclusion';$('comparisonSource').after(result);
 function conclusionData(){const a=person($('compareA').value),b=person($('compareB').value);return {a,b,lines:[
  `太阳辐射指数：A ${display(a.radiation,'radiation')} / B ${display(b.radiation,'radiation')}。`,
  `研究优先级：A ${display(val(a,'priority'),'priority')} / B ${display(val(b,'priority'),'priority')}；综合得分 ${fmt(val(a,'score'))} / ${fmt(val(b,'score'))}。`,
  `协调度 D：A ${fmt(val(a,'coord'))} / B ${fmt(val(b,'coord'))}；保护区覆盖 ${display(a.protected,'protected')} / ${display(b.protected,'protected')}。`,
  '这些指标描述不同维度，不能以单项数值直接推断优先级或实际发电效果。'
 ]};}
 function updateConclusion(){const {a,b,lines}=conclusionData();result.innerHTML='<small>对照结论 · 根据当前 A / B 自动生成</small><h3>'+esc(a.name)+' × '+esc(b.name)+'</h3><p>'+lines.map(esc).join('<br>')+'</p>';}
 for(const role of ['A','B'])$('locateCompare'+role).onclick=()=>{pid='';$('province').value='';selectCounty(person($('compare'+role).value));revealSection($('atlas'));};
 $('frameComparison').onclick=()=>{const {a,b}=conclusionData();pid='';$('province').value='';mode='county';selected=null;selectedProv=null;render();framePair(a,b);markComparison(a.id,b.id);ensureCountyDetail(a.pid);ensureCountyDetail(b.pid);revealSection($('atlas'));};
 for(const id of ['compareA','compareB','swapCompare','useSelectedCounty'])$(id).addEventListener(id.startsWith('compare')?'change':'click',()=>{updateConclusion();markComparison($('compareA').value,$('compareB').value);});
 // Keep A/B markers after map layers are replaced, without rebuilding geometry.
 const markObserver=new MutationObserver(()=>markComparison($('compareA').value,$('compareB').value));markObserver.observe($('regions'),{childList:true});
 function makeCard(){
  const {a,b,lines}=conclusionData(),canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1480;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#0c1826';ctx.fillRect(0,0,1600,1480);ctx.fillStyle='#ffbb60';ctx.fillRect(70,68,55,5);ctx.font='24px "Microsoft YaHei",sans-serif';ctx.fillText('逐光 / 县域对照结论',145,80);
  function wrap(text,x,y,width,size=24,color='#c6d6df'){ctx.font=size+'px "Microsoft YaHei",sans-serif';ctx.fillStyle=color;let line='';for(const ch of text){if(ctx.measureText(line+ch).width>width){ctx.fillText(line,x,y);line='';y+=size*1.6;}line+=ch;}ctx.fillText(line,x,y);return y+size*1.6;}
  let y=wrap(a.name+' × '+b.name,70,150,1460,38,'#f4ead8');y=wrap('A '+a.id+' · '+a.province+' / B '+b.id+' · '+b.province,70,y+8,1460,21);
  for(const line of lines)y=wrap(line,70,y+14,1460,25);
  y+=20;ctx.strokeStyle='#405668';ctx.beginPath();ctx.moveTo(70,y);ctx.lineTo(1530,y);ctx.stroke();y+=45;
  for(const k of comparisonMetrics){
   ctx.fillStyle='#aec3cf';ctx.font='22px "Microsoft YaHei",sans-serif';ctx.fillText(defs[k][0],70,y);
   ctx.fillStyle='#e7c286';ctx.fillText(display(val(a,k),k),540,y);ctx.fillStyle='#93c4bc';ctx.fillText(display(val(b,k),k),1060,y);y+=51;
  }
  y+=14;y=wrap('GDP：A '+(a.gdpHybridSource||'缺失')+' / B '+(b.gdpHybridSource||'缺失')+'。碳排放年份：A '+(a.carbonTotalYear||'缺失')+' / B '+(b.carbonTotalYear||'缺失')+'。',70,y,1460,20);
  y=wrap('口径：统计GDP优先，仅缺失补估。碳排放总量用于展示；优先级及关联采用六指标等权综合模型，协调度单独保留。保护区相交不代表整县禁建。研究数据为多年份快照。',70,y+8,1460,20);
  wrap('生成日期 '+new Date().toLocaleDateString('zh-CN')+' · 来源：团队论文及配套县域数据 · '+(location.protocol==='file:'?'独立离线演示':location.host),70,y+12,1460,18,'#92aab7');return {canvas,a,b};
 }
 $('saveResultCard').onclick=()=>{const {canvas,a,b}=makeCard();canvas.toBlob(blob=>{if(!blob){$('compareStatus').textContent='图片生成未完成，请重试。';return;}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='逐光-对照结论-'+a.id+'-'+b.id+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);$('compareStatus').textContent='已生成含指标、年份和口径的结论卡。';},'image/png');};
 $('printResultCard').onclick=()=>{const {canvas}=makeCard();let sheet=$('printSheet');if(!sheet){sheet=document.createElement('div');sheet.id='printSheet';document.body.append(sheet);}const img=new Image();img.alt='逐光县域对照结论卡';img.onload=()=>window.print();img.src=canvas.toDataURL('image/png');sheet.replaceChildren(img);};
 // Optional projection layout and intentional offline preparation.
 const stageTools=document.createElement('div');stageTools.className='stageTools';stageTools.innerHTML='<button id="projectionToggle" aria-pressed="false">投影模式</button><button id="prepareOffline">准备离线演示</button><a href="downloads/逐光-离线演示.html" download>下载独立离线版 ↓</a><span id="offlineStatus" role="status"></span>';$('atlas').after(stageTools);
 $('projectionToggle').onclick=()=>{const active=document.body.classList.toggle('projectionMode');$('projectionToggle').setAttribute('aria-pressed',String(active));$('projectionToggle').textContent=active?'退出投影模式':'投影模式';requestAnimationFrame(()=>{if(caseActive)framePair(caseA,caseB);else fit();});};
 function revealSection(element){let parent=element.closest('details');while(parent){parent.open=true;parent=parent.parentElement?.closest('details');}element.scrollIntoView({behavior:'smooth',block:'start'});}
 for(const [id,label] of [['contextSection','研究背景与政策坐标'],['modelSection','模型验证与计算依据'],['passport','数据口径与来源说明']]){const node=$(id),fold=document.createElement('details');fold.className='supportingFold';const summary=document.createElement('summary');summary.textContent=label+' · 展开阅读';node.before(fold);fold.append(summary,node);}
 document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#"]');if(link){const target=$(link.getAttribute('href').slice(1));if(target){e.preventDefault();revealSection(target);}}},true);
 $('modelJump').onclick=()=>revealSection($('modelSection'));$('findingCoverage').onclick=()=>revealSection($('passport'));$('startGuide').onclick=()=>showCase(0);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(caseActive)exitCase();if(document.body.classList.contains('projectionMode'))$('projectionToggle').click();}if(caseActive&&!e.target.closest('input,select,textarea,button,summary')&&!$('about').open){if(e.key==='ArrowRight'&&caseIndex<3){e.preventDefault();showCase(caseIndex+1);}if(e.key==='ArrowLeft'&&caseIndex>0){e.preventDefault();showCase(caseIndex-1);}}});
 $('prepareOffline').onclick=async()=>{
  const status=$('offlineStatus');if(location.protocol==='file:'){status.textContent='当前为独立离线版，已内置数据与边界。';return;}
  if(!('serviceWorker' in navigator)){status.textContent='此浏览器不支持离线缓存，请下载独立离线版。';return;}
  $('prepareOffline').disabled=true;status.textContent='正在准备离线资源…';
  try{await navigator.serviceWorker.register('sw.js');const registration=await navigator.serviceWorker.ready;const channel=new MessageChannel();
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('准备超时，可重试或下载离线版')),120000);channel.port1.onmessage=e=>{const d=e.data;if(d.type==='progress')status.textContent='离线准备 '+d.done+' / '+d.total;if(d.type==='done'){clearTimeout(timer);resolve();}if(d.type==='error'){clearTimeout(timer);reject(new Error(d.message));}};
    const suffix=typeof DecompressionStream==='function'?'.gz':'';registration.active.postMessage({type:'PREPARE',assets:[ATLAS_ASSETS.core.url+suffix,ATLAS_ASSETS.reserves.url+suffix,ATLAS_ASSETS.detail[caseA.pid].url+suffix]},[channel.port2]);});
   status.textContent='离线资源已备妥：全国概览、案例精细县界及保护区。其他省份精细县界仍按需联网。';
  }catch(error){status.textContent='离线准备未完成：'+error.message+'。也可下载独立离线版。';}finally{$('prepareOffline').disabled=false;}
 };
 const share=document.createElement('button');share.textContent='复制这组对照链接';compareTools.append(share);
 share.onclick=async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('a',$('compareA').value);url.searchParams.set('b',$('compareB').value);url.hash='compareSection';try{await navigator.clipboard.writeText(url.href);$('compareStatus').textContent=location.protocol==='file:'?'已复制本机离线对照地址。':'已复制公开对照链接，无需登录即可打开。';}catch{$('compareStatus').replaceChildren(document.createTextNode('可复制此链接：'));const link=document.createElement('a');link.href=url.href;link.textContent=url.href;$('compareStatus').append(link);}};
 const initialQuery=new URLSearchParams(location.search),qa=initialQuery.get('a'),qb=initialQuery.get('b');
 if(person(qa)&&person(qb)){setComparison(qa,qb);requestAnimationFrame(()=>revealSection($('compareSection')));}else updateConclusion();
 if(location.protocol==='file:'){const link=stageTools.querySelector('a');link.href=location.href;$('offlineStatus').textContent='独立离线版 · 已内置全国县界与保护区';}
 window.ATLAS_JOURNEY_READY=true;
})();
// Map-first presentation, fixed map semantics and province field examples.
(() => {
 const legend=document.querySelector('.legend'),canvas=document.querySelector('.mapCanvas');
 const hud=document.createElement('div');hud.className='mapHUD';hud.innerHTML='<div class="hudTop"><strong id="hudLayer"></strong><span id="hudMeta"></span></div>';
 hud.append(legend);canvas.append(hud);
 const meaning=document.createElement('div');meaning.id='mapMeaning';meaning.className='mapMeaning';canvas.append(meaning);
 const years={priority:'多年份综合模型',score:'多年份综合模型',coord:'多年份综合模型',solar:'源表未统一标年',radiation:'2016 年',slope:'源表未统一标年',land3:'源表未统一标年',gdp:'多年份统计 · 缺失补估',carbonTotal:'2023 年 / 部分 2022 年',land6:'源表未统一标年',protected:'所给保护区版本 · 未统一标年'};
 const originalMap=renderMap;
 renderMap=function(){originalMap();$('hudLayer').textContent=$('mapTitle').textContent;
   $('hudMeta').textContent=(metric==='priority'?(mode==='county'?'等级 1–5':'最高等级县域占比 %'):defs[metric][2]==='percent'?'单位：%':isTotal(metric)?'单位：吨 CO₂':'单位：归一化指数')+' · '+years[metric];
   meaning.textContent=metric==='land3'?'金色 = 不可用土地占比较低，土地约束较少':metric==='protected'?(protectedView==='footprint'?'橙金色 = 所给保护区实际边界范围':'橙金色 = 保护区覆盖比例较高'):metric==='priority'?(mode==='county'?'金色 = 综合开发优先级最高（5级）':'金色 = 本省5级县域占比较高'):'金色 = 当前指标数值较高';
 };
 const examples={
  '620000':{name:'甘肃',file:'gansu.png',title:'开阔地表上的光伏阵列',text:'照片可见大面积开阔地表、连续阵列及远处山地。平缓开阔地形便于观察集中式光伏的空间布局；光照条件应结合本省辐射指标判断。'},
  '520000':{name:'贵州',file:'guizhou.png',title:'山地坡面上的光伏阵列',text:'照片可见起伏山地、沿坡铺设的阵列和植被。地形影响布置与施工条件；云量、降雨和辐射水平需结合长期数据分析，照片中的云不能证明全年日照较少。'}
 };
 const photoURL=e=>window.ATLAS_PHOTOS?.[e.file]||'photos/'+e.file;
 let photo=$('provincePhoto');if(!photo){photo=document.createElement('section');photo.id='provincePhoto';photo.hidden=true;$('detail').after(photo);}
 const originalDetail=renderDetail;
 renderDetail=function(){originalDetail();const id=selected?.pid||selectedProv?.id||pid,e=examples[id];photo.hidden=!e;if(!e){photo.replaceChildren();return;}
   photo.innerHTML='<div class="photoHeading"><span>省域实景 / '+e.name+'</span><small>团队提供示例</small></div><button class="photoOpen" aria-label="放大查看'+e.name+'光伏实景"><img loading="lazy" src="'+photoURL(e)+'" alt="'+e.name+'光伏阵列示例：'+e.title+'"><span>查看大图 ↗</span></button><h3>'+e.title+'</h3><p>'+e.text+'</p><small class="photoSource">地区按团队提供信息标注；具体电站名称与拍摄来源待补充。</small>';
   photo.querySelector('button').onclick=()=>{const dialog=$('photoDialog');dialog.querySelector('img').src=photoURL(e);dialog.querySelector('img').alt=e.name+'光伏实景示例';dialog.querySelector('h2').textContent=e.name+' · '+e.title;dialog.showModal();};
 };
 const dialog=document.createElement('dialog');dialog.id='photoDialog';dialog.innerHTML='<div class="dialogHead"><h2></h2><button aria-label="关闭实景照片">×</button></div><img alt="省域光伏实景">';document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close();};
 const controls=document.querySelector('.left');const fold=document.createElement('details');fold.className='mobileLayers';fold.innerHTML='<summary>切换指标与筛选地区</summary>';controls.before(fold);
 function responsive(){if(controls.closest('.mapControlPanel'))return;if(innerWidth<900){fold.append(controls);fold.hidden=false;}else{fold.before(controls);fold.hidden=true;}canvas.style.height=Math.max(280,innerHeight-canvas.getBoundingClientRect().top-window.scrollY-18)+'px';}
 window.addEventListener('resize',responsive);
 document.querySelector('.guidedEntry')?.remove();document.querySelector('.versionBar').hidden=true;
 responsive();renderMap();renderDetail();
})();

// ONLINE_STUDIO_LOADER
const studioScript=document.createElement("script");studioScript.src="analysis-studio.js?v=21";document.body.append(studioScript);
