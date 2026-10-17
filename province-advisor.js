'use strict';
(()=>{
 const page=ATLAS_NAVIGATION.pages.decision,old=$('countyAdvisor'),policyData=ATLAS_PROVINCE_POLICIES,keys=['solar','radiation','slope','land3','gdp','carbonTotal','land6','protected'];
 old.hidden=true;old.setAttribute('aria-hidden','true');
 const panel=document.createElement('section');panel.id='provinceDecision';page.append(panel);
 const available=provinces.filter(p=>!['710000','810000','820000'].includes(p.id)&&counties.some(c=>c.pid===p.id&&valid(val(c,'score'))));
 let current=available.some(p=>p.id===pid)?pid:'630000',tab='analysis',chosenCounty=null;
 panel.innerHTML='<div class="provinceDecisionHead"><h2>省域开发分析</h2><label>分析省份<select id="decisionProvince" aria-label="分析省份">'+available.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('')+'</select></label><span>全省研判 → 分县落实</span><button id="exportProvinceAdvice">导出开发分析</button></div><div id="provinceDecisionBody"></div>';
 const mean=(rows,k)=>{const a=rows.map(c=>val(c,k)).filter(valid);return a.length?a.reduce((s,v)=>s+v,0)/a.length:null;},pct=v=>valid(v)?(v*100).toFixed(1)+'%':'暂无记录',num=(v,k)=>valid(v)?display(v,k):'暂无记录';
 const national=Object.fromEntries(keys.map(k=>[k,mean(counties,k)]));
 const ranks=new Map();for(const k of keys)ranks.set(k,counties.map(c=>val(c,k)).filter(valid).sort((a,b)=>a-b));
 function rank(v,k){if(!valid(v))return null;const a=ranks.get(k);let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>1;if(a[m]<=v)lo=m+1;else hi=m;}return a.length?lo/a.length*100:0;}
 function scenario(c){const land=valid(c.land3)?1-c.land3:null;
  if(valid(c.protected)&&c.protected>=.05)return {name:'生态边界优先核查',action:'先叠置保护区边界；只在核实后的合规空间研究项目',reason:'保护区覆盖'+pct(c.protected)};
  if(valid(land)&&land<.5)return {name:'既有建筑与分散场景',action:'先盘点工商业及公共建筑屋顶，核实产权、荷载与日间用电',reason:'可用土地约'+pct(land)+'，连续用地需要逐地块核实'};
  if(rank(val(c,'slope'),'slope')<35)return {name:'局部平缓地块示范',action:'先找平缓且交通可达地块，核查遮挡和施工，再决定规模',reason:'坡度条件位于全国较低区间'};
  if(rank(val(c,'radiation'),'radiation')>=60)return {name:'连片场址前期论证',action:'先勘查可连片空间，取得场址及接网调查结论后分期推进',reason:'辐射全国分位'+rank(val(c,'radiation'),'radiation').toFixed(0)+'，可用土地约'+pct(land)};
  return {name:'用能场景匹配试点',action:'先匹配稳定日间负荷或合规场址，完成小范围示范后再评估扩展',reason:'需把资源、场址与实际用能条件放在一起判断'};
 }
 const gradeActions={1:'先补查约束，确认可行场景后再试点',2:'选择条件成熟场景做小范围验证',3:'分阶段示范，验证场址和接网条件',4:'重点储备，优先落实场址与用能条件',5:'优先组织前期论证，成熟一批推进一批'};
 const position=(v,k)=>{const r=rank(v,k);return valid(r)?r.toFixed(0)+'%':'暂无记录';};
 // Choose the development approach from this province's resource and constraint evidence.
 function developmentProfile(a){
  const n=Math.max(a.rows.length,1),radiation=rank(a.values.radiation,'radiation'),gdp=rank(a.values.gdp,'gdp'),carbon=rank(a.values.carbonTotal,'carbonTotal');
  if(a.eco/n>=.35)return {key:'ecology',direction:'生态分区在前，合规场址分批储备',reason:a.eco+'个县的保护区覆盖达到5%及以上，占全省县域'+pct(a.eco/n)+'，生态边界核验是本省前期工作的重点',task:'把候选场址与保护区边界逐一叠置，区分可研究空间与应避让空间',pilot:'在已核实生态边界、具备接网条件的场址开展小范围验证',gate:'边界未核清的场址留在约束清单，不能用县域总分代替地块合规结论'};
  if(a.space/n>=.5)return {key:'land',direction:'存量空间优先，分布式场景先行',reason:a.space+'个县的不可用土地超过50%，全省土地可用程度均值约为'+pct(a.land)+'，应先解决场址落地问题',task:'先盘点工商业和公共建筑屋顶、已有建设空间，核实产权、结构荷载与日间负荷',pilot:'选择产权、屋面条件和自用负荷清楚的场景先做分布式试点',gate:'缺少连续合规用地的县先储备，不以资源优势直接推定适合连片开发'};
  if(a.rough/n>=.4)return {key:'terrain',direction:'平缓地块优先，施工条件决定试点规模',reason:a.rough+'个县的坡度适宜性处于全国后35%区间，地形条件是省内县域需要重点区分的短板',task:'围绕局部平缓地块核查坡向、遮挡、交通与施工可达性，并比较地面与屋顶场景',pilot:'在交通可达、遮挡少且坡面施工条件可控的地块先验证投资与运维成本',gate:'地形条件偏弱的县先做地块筛查，避免按县域资源均值统一安排建设规模'};
  if(valid(radiation)&&radiation>=65&&valid(a.land)&&a.land>=.5)return {key:'resource',direction:'资源优势县先行，连片场址分期论证',reason:'太阳辐射均值对应全国县域'+radiation.toFixed(0)+'%分位，土地可用程度均值约为'+pct(a.land)+'，资源与场址组合值得优先调查',task:'优先核查资源优势县的连续合规空间，同时摸清送出通道、可接入容量和消纳去向',pilot:'在土地与接网结论均明确的场址分期试点，先验证发电与消纳表现',gate:'新增规模跟随可接入容量和实际消纳条件安排，不能只按资源排名扩大项目'};
  if(valid(gdp)&&gdp>=65&&valid(carbon)&&carbon>=60)return {key:'demand',direction:'用能侧牵引，经济与减排需求协同',reason:'GDP经济指数均值对应全国县域'+gdp.toFixed(0)+'%分位，碳排放总量均值对应'+carbon.toFixed(0)+'%分位，可优先调查用能与减排需求同时较高的场景',task:'将候选县与工商业用电场景对接，核实用电曲线、屋顶资源和企业参与意愿',pilot:'从日间负荷与发电匹配度较好的工商业场景起步，比较自用、上网与改造成本',gate:'碳排放规模只是需求线索，项目收益和减排量应以实际发电及用电数据复核'};
  if(a.high>=.4)return {key:'portfolio',direction:'高等级县成组调研，成熟项目分批推进',reason:'4—5级县占有效评价县'+pct(a.high)+'，优势县较集中，应把调研资源优先投向条件较均衡的县',task:'将高等级县按场址类型组织联合调研，统一核查土地、生态与接网，形成可实施的项目储备',pilot:'从约束较少、场址与用能条件清楚的县启动试点，再比较相近县的复制条件',gate:'高等级只确定调研先后，未形成场址与接网结论的项目仍留在储备阶段'};
  return {key:'selective',direction:'优势县择点试验，短板县先补条件',reason:'4—5级县仅占有效评价县'+pct(a.high)+'，全省自然光伏潜力均值对应全国县域'+position(a.values.solar,'solar')+'分位，适合先集中验证少数场景',task:'先把资源、可用土地和真实日间负荷叠加比选，找出能形成明确场址的少数县',pilot:'优先开展投资较小、场址条件可核实的示范，比较发电、消纳与建设成本后再扩展',gate:'对短板未改善的县保留研究与储备安排，不平均分配开发规模'};
 }
 function secondaryAction(o){
  if(o.eco)return '先叠置保护区边界，确定可研究空间，再讨论项目规模';
  if(o.weak[0]==='土地可用程度')return '先调查既有建筑或分散场址，核实产权与用地条件';
  if(o.weak[0]==='坡度适宜性')return '先筛平缓、少遮挡且交通可达的地块，补做施工与运维成本比较';
  if(o.weak[0]==='GDP经济指数')return '先核实本地负荷、接网容量与电力消纳去向，避免只凭资源安排规模';
  return '先测算实际辐射、遮挡与发电收益，确认经济性后再安排示范';
 }
 function analyze(id){
  const p=provinces.find(p=>p.id===id),rows=counties.filter(c=>c.pid===id),validRows=rows.filter(c=>valid(val(c,'score'))),values=Object.fromEntries(keys.map(k=>[k,mean(rows,k)]));
  const counts=[5,4,3,2,1].map(g=>validRows.filter(c=>val(c,'priority')===g).length),high=(counts[0]+counts[1])/Math.max(validRows.length,1),land=valid(values.land3)?1-values.land3:null;
  const ranked=validRows.slice().sort((a,b)=>val(b,'score')-val(a,'score')||a.id.localeCompare(b.id));
  const eco=rows.filter(c=>valid(c.protected)&&c.protected>=.05).length,space=rows.filter(c=>valid(c.land3)&&c.land3>.5).length,rough=rows.filter(c=>{const r=rank(val(c,'slope'),'slope');return valid(r)&&r<35;}).length;
  const a={id,p,rows,validRows,values,counts,high,land,ranked,eco,space,rough},profile=developmentProfile(a);
  const dimensions=c=>{const lr=rank(val(c,'land3'),'land3');return [['太阳辐射',rank(val(c,'radiation'),'radiation')],['坡度适宜性',rank(val(c,'slope'),'slope')],['土地可用程度',valid(lr)?100-lr:null],['GDP经济指数',rank(val(c,'gdp'),'gdp')],['自然光伏潜力',rank(val(c,'solar'),'solar')]].filter(d=>valid(d[1]));};
  const focus=ranked.filter(c=>val(c,'priority')>=4&&rank(val(c,'radiation'),'radiation')>=60&&rank(val(c,'slope'),'slope')>=40&&valid(c.land3)&&c.land3<=.5&&valid(c.protected)&&c.protected<.05).slice(0,4);
  const secondary=ranked.map(c=>{const d=dimensions(c).sort((a,b)=>b[1]-a[1]);return d.length<2?null:{c,strong:d[0],weak:d[d.length-1],eco:valid(c.protected)&&c.protected>=.05,gap:d[0][1]-d[d.length-1][1]};}).filter(o=>o&&!focus.includes(o.c)&&o.strong[1]>=80&&(o.weak[1]<=20||o.eco)).sort((a,b)=>b.gap-a.gap||val(b.c,'score')-val(a.c,'score')).slice(0,3);
  const first=(focus.length?focus:ranked).slice(0,2).map(c=>c.name).join('、');
  const conclusion=p.name+'建议采用“'+profile.direction+'”。'+profile.reason+'。全省4—5级共'+(counts[0]+counts[1])+'县（'+pct(high)+'），先从'+first+'的具体场景开展核查。';
  const focusParagraphs=focus.length?[
   '优先调查'+focus.slice(0,3).map(c=>c.name).join('、')+'。这些县同时达到4—5级，辐射全国分位不低于60%，坡度适宜性不低于40%，不可用土地不超过50%，保护区覆盖低于5%。',
   ...focus.slice(0,2).map(c=>c.name+'为'+val(c,'priority')+'级，辐射全国分位'+position(val(c,'radiation'),'radiation')+'，土地可用程度约'+pct(1-c.land3)+'。'+scenario(c).action+'。')
  ]:[
   '本省暂无同时达到资源、土地、生态及4—5级条件的县，不能直接划出成熟开发区。先从综合评价靠前的'+first+'寻找可验证场景。',
   ...ranked.slice(0,2).map(c=>c.name+'为'+val(c,'priority')+'级，建议从“'+scenario(c).name+'”入手。'+scenario(c).reason+'；'+scenario(c).action+'。')
  ];
  const secondaryParagraphs=secondary.length?secondary.slice(0,2).map(o=>o.c.name+'的'+o.strong[0]+'达到全国'+o.strong[1].toFixed(0)+'%分位，但'+(o.eco?'保护区覆盖为'+pct(o.c.protected):o.weak[0]+'仅为全国'+o.weak[1].toFixed(0)+'%分位')+'。'+secondaryAction(o)+'。'):[
   '本省未识别出“单项位于全国前20%、另一项位于后20%或保护区覆盖达到5%”的典型县，不强行认定次优区域。',
   '可围绕'+ranked.slice(2,4).map(c=>c.name).join('、')+'继续核查场址与接网条件，以实际可落地空间决定是否进入下一轮调研。'
  ];
  const scheduleParagraphs=[
   '第一步：以'+first+'为起点，'+profile.task+'；形成“一县一张场址与约束清单”，确定可继续论证的项目。',
   '第二步：'+profile.pilot+'。优先论证5级'+counts[0]+'县及4级'+counts[1]+'县；3级'+counts[2]+'县择点示范，1—2级'+(counts[3]+counts[4])+'县先补短板。',
   '第三步：用试点的发电、接网、成本及用地核查结果复评储备清单，再决定向哪些相近场景扩展。'+profile.gate+'。'
  ];
  const sections=[focusParagraphs,secondaryParagraphs,scheduleParagraphs];
  return {...a,profile,direction:profile.direction,scene:profile.task,conclusion,focus,secondary,sections,route:sections.map(ps=>ps.join('\n'))};
 }
 function policyHTML(a){const local=policyData.local[a.id],items=[...(local?[local]:[]),...policyData.national];return '<div class="provincePolicyIntro">核验日期 '+policyData.checked+' · 点击标题查看官方来源</div>'+(!local?'<p class="provincePolicyMissing">本次未核实到近期省级正式文件，先列国家依据；省内实施和接网规则仍需向主管部门核对。</p>':'')+items.map(p=>'<article class="provincePolicy"><small>'+esc(p.kind)+' · '+esc(p.date)+'</small><a target="_blank" rel="noopener noreferrer" href="'+esc(p.url)+'">'+esc(p.title)+' ↗</a><p>'+esc(p.note)+'</p><strong>落实到本省县域</strong><p>'+esc(p.action)+'</p></article>').join('');}
 function countyCard(c){const s=scenario(c),g=val(c,'priority');return '<button class="provinceCounty" data-province-county="'+c.id+'"><span><b>'+esc(c.name)+'</b><em>'+g+'级</em><small>'+esc(c.id)+'</small></span><strong>'+esc(s.name)+'</strong><small>'+esc(s.reason)+'</small></button>';}
 function render(){const a=analyze(current);$('decisionProvince').value=current;const max=Math.max(...a.counts,1),top=a.ranked.slice(0,8),local=policyData.local[current];
  $('provinceDecisionBody').innerHTML='<article class="provinceEvidence wbPanel"><div class="wbHeading"><h3>'+esc(a.p.name)+' · 条件概览</h3><span>'+a.validRows.length+' / '+a.rows.length+'县有评价</span></div><p class="provinceChartNote">白线为全国县域均值的位置</p><div class="provinceEvidenceRows">'+keys.map(k=>{const v=a.values[k],pos=rank(v,k),ref=rank(national[k],k);return '<div><span>'+esc(defs[k][0])+'</span><strong>'+esc(num(v,k))+'</strong><i class="'+(['land3','protected'].includes(k)?'provinceConstraint':'')+'"><b style="width:'+(pos??0)+'%"></b><em style="left:'+(ref??0)+'%" title="全国县域均值 '+esc(num(national[k],k))+'"></em></i></div>';}).join('')+'</div></article><section class="provinceAllocation"><article class="wbPanel provinceGrade"><div class="wbHeading"><h3>省内县域开发优先级</h3></div>'+a.counts.map((n,i)=>'<div class="provinceGradeRow"><span>'+(5-i)+'级</span><i><b style="width:'+n/max*100+'%;background:'+colors[4-i]+'"></b></i><strong>'+n+'县</strong><small>'+pct(n/Math.max(a.validRows.length,1))+'</small></div>').join('')+'</article><article class="wbPanel provinceCountyPanel"><div class="wbHeading"><h3>建议先调研的县</h3><span>按综合得分排序 · 点击地图定位</span></div><div class="provinceCountyList">'+top.map(countyCard).join('')+'</div><p class="provinceChartNote">清单为研究模型的前期调研顺序；项目开工还需核实场址与最新接网条件。</p></article></section><article class="wbPanel provinceStrategy"><div class="provinceStrategyTabs"><button data-province-tab="analysis">开发结论与落实</button><button data-province-tab="policy">政策依据'+(local?'':' · 国家层面')+'</button></div><div id="provinceStrategyContent"></div></article>';
  const showTab=()=>{for(const b of panel.querySelectorAll('[data-province-tab]'))b.setAttribute('aria-selected',String(b.dataset.provinceTab===tab));$('provinceStrategyContent').innerHTML=tab==='policy'?policyHTML(a):'<div class="provinceRouteLead" data-development-profile="'+a.profile.key+'"><h3>建议推进路线</h3><strong class="provinceRouteConclusion">'+esc(a.direction)+'</strong><p>'+esc(a.conclusion)+'</p></div><div class="provinceSteps provinceThreeSteps">'+a.sections.map((paragraphs,i)=>'<article><b>'+['01 · 重点区域','02 · 次优区域','03 · 推进安排'][i]+'</b>'+paragraphs.map(text=>'<p>'+esc(text)+'</p>').join('')+'</article>').join('')+'</div>';
  };for(const b of panel.querySelectorAll('[data-province-tab]'))b.onclick=()=>{tab=b.dataset.provinceTab;showTab();};showTab();
  for(const b of panel.querySelectorAll('[data-province-county]'))b.onclick=()=>{const c=a.rows.find(c=>c.id===b.dataset.provinceCounty);if(!c)return;chosenCounty=c.id;ATLAS_NAVIGATION.show('atlas');history.replaceState(null,'','#atlas');pid=c.pid;$('province').value=pid;metric='solar';selectCounty(c);};
 }
 $('decisionProvince').onchange=e=>{current=e.target.value;chosenCounty=null;render();};
 $('exportProvinceAdvice').onclick=()=>{const a=analyze(current),policies=[...(policyData.local[current]?[policyData.local[current]]:[]),...policyData.national],text='# '+a.p.name+' · 光伏开发分析\n\n'+a.conclusion+'\n\n'+a.route.map((t,i)=>['重点区域','次优区域','推进安排'][i]+'\n'+t).join('\n\n')+'\n\n## 建议先调研的县\n'+a.ranked.slice(0,8).map(c=>c.name+'（'+val(c,'priority')+'级）：'+scenario(c).action+'；'+gradeActions[val(c,'priority')]).join('\n')+'\n\n## 政策依据（核验 '+policyData.checked+'）\n'+policies.map(p=>p.title+' · '+p.date+'\n'+p.url+'\n'+p.note+'\n'+p.action).join('\n\n'),url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='光域智图-'+a.p.name+'-开发分析.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const analyzeProvince=id=>{if(available.some(p=>p.id===id)){current=id;render();}};
 ATLAS_WORKBENCH.analyzeCounty=id=>{const c=counties.find(c=>c.id===id);if(c){chosenCounty=id;analyzeProvince(c.pid);}};
 window.ATLAS_PROVINCE_ADVISOR={analyze:analyzeProvince,getState:()=>({province:current,tab,county:chosenCounty}),summary:analyze};render();
})();
