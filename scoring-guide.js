'use strict';
(()=>{
 const meta=model.priorityRevision,keys=meta.displayKeys||['carbon','land6','land3','slope','gdp','coord','solar'];
 const fields=[
  ['减排需求强度','单位 GDP 碳排放指数','减排需求越强，评价值越高'],
  ['碳汇覆盖占比','林地、草地、湿地与灌木占比','碳汇型土地覆盖越多，评价值越高'],
  ['适宜开发土地','不可用土地占比反向转换','土地可用评价 = 1 − 归一化不可用占比'],
  ['坡度适宜指标','以 25° 为阈值处理后的县域指标','适宜坡度占比越高，评价值越高'],
  ['经济基础指数','统计 GDP 优先，灯光模型补齐缺失','GDP 统一到全国经济刻度'],
  ['耦合协调度','资源与低碳两系统的联合状态','系统得分 → 耦合度 C → 协调度 D'],
  ['自然光伏潜力','辐射、坡度、保护区与土地的空间叠加','栅格四因子相乘，再经县域汇总']
 ];
 const math=(body,label)=>'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="'+label+'">'+body+'</math>';
 const symbol=s=>'<mi>'+s+'</mi>',number=s=>'<mn>'+s+'</mn>',op=s=>'<mo>'+s+'</mo>';
 const row=s=>'<mrow>'+s+'</mrow>',sup=(a,b)=>'<msup>'+a+b+'</msup>',sub=(a,b)=>'<msub>'+a+b+'</msub>';
 const fraction=(a,b)=>'<mfrac>'+row(a)+row(b)+'</mfrac>',root=a=>'<msqrt>'+row(a)+'</msqrt>';
 const vector=s=>'<mi mathvariant="bold">'+s+'</mi>',zi=sub(vector('z'),symbol('i'));
 const ai=sign=>sup(vector('A'),op(sign)),di=sign=>'<msubsup>'+symbol('D')+symbol('i')+op(sign)+'</msubsup>';
 const eps=p=>sup(number('10'),row(op('−')+number(p)));
 const normFraction=fraction(sub(symbol('x'),row(symbol('i')+symbol('j')))+op('−')+sub(symbol('m'),symbol('j')),sub(symbol('M'),symbol('j'))+op('−')+sub(symbol('m'),symbol('j')));
 const normalize=math(sub(symbol('z'),row(symbol('i')+symbol('j')))+op('=')+normFraction,'正向指标：县域原始值减全国最小值，除以全国极差');
 const reverse=math(sub(symbol('z'),row(symbol('i')+symbol('j')))+op('=')+number('1')+op('−')+normFraction,'反向指标：一减县域原始值的全国极差归一化值');
 const covariance=math(symbol('Σ')+op('=')+symbol('Cov')+op('(')+vector('Z')+op(')')+op('+')+eps('6')+symbol('I'),'正则协方差矩阵，协方差加十的负六次方单位矩阵');
 const ideal=sign=>math(sub(ai(sign),symbol('j'))+op('=')+sub(symbol(sign==='+'?'max':'min'),symbol('i'))+sub(symbol('z'),row(symbol('i')+symbol('j'))),'各项指标的'+(sign==='+'?'全国最大值构成正理想解':'全国最小值构成负理想解'));
 const mahalanobis=sign=>{
  const delta=row(op('(')+zi+op('−')+ai(sign)+op(')'));
  return math(di(sign)+op('=')+root(sup(delta,symbol('T'))+sup(symbol('Σ'),row(op('−')+number('1')))+delta),'县域到'+(sign==='+'?'正':'负')+'理想解的马氏距离');
 };
 const scoreFormula=math(sub(symbol('S'),symbol('i'))+op('=')+fraction(di('−'),di('+')+op('+')+di('−')+op('+')+eps('10')),'综合得分等于负理想距离除以正负理想距离之和');
 const flow='<div class="scoreFlow"><div><em>01</em><b>七项指标</b><small>基础条件 · 自然潜力 · 协调状态</small></div><div><em>02</em><b>同向归一化</b><small>全国共同刻度 0–1</small></div><div><em>03</em><b>马氏 TOPSIS</b><small>纳入相关性，衡量理想解距离</small></div><div><em>04</em><b>得分与优先级</b><small>连续得分 → 全国五分位</small></div></div>';
 const inputCards='<div class="scoreInputGrid">'+fields.map((f,i)=>'<article><span>'+String(i+1).padStart(2,'0')+' / '+(meta.directions[i]<0?'反向转换':'正向评价')+'</span><h3>'+f[0]+'</h3><p>'+f[1]+'</p><small>'+f[2]+'</small></article>').join('')+'</div>';
 const normalization='<div class="scoreFormulaBand"><div><small>正向指标 · 全国 min–max 归一化</small>'+normalize+'</div><div><small>不可用土地占比 · 反向转换</small>'+reverse+'</div></div><p class="scoreNotation">i 表示县域，j 表示指标；m、M 分别为该项指标的全国最小值、最大值。</p>';
 const section=document.createElement('section');section.id='scoringGuide';section.className='scoringGuide panel';
 section.innerHTML='<div class="sectionHeading"><div><div class="eyebrow">SCORING / 七项指标，形成县域综合评价</div><h2>综合得分如何计算？</h2><p>将七项指标统一到全国刻度，纳入指标间相关性，得到综合得分和开发优先级。</p></div><button id="showScoringDemo" class="casePrimary">展开计算说明 ↗</button></div>'+flow+inputCards+'<div class="scoreGuideActions"><button id="guideComparison" class="active">当前 A/B 对照</button><button id="guideExample">波密 × 贡觉示例</button><button id="guideSelected">查看地图所选县</button><span>支持选择任意两县 · 七项评价值共用全国刻度</span></div><div id="scoreWorkedExample"></div><div class="scoreRoleStrip"><span><b>自然光伏潜力</b>四因子空间叠加与县域汇总</span><span><b>保护区实际边界</b>呈现空间约束与筛选条件</span><span><b>综合优先级</b>七指标马氏 TOPSIS ＋ 五分位</span><span><b>协调类型</b>耦合协调度 K-means 分类</span></div>';
 document.querySelector('.modelDiagnostics').before(section);
 const format=v=>valid(v)?Number(v).toFixed(4):'暂无数据',exampleIds=['540424','540322'];let exampleMode='comparison',exampleKey='';
 const inverse=meta.covarianceInverse||meta.inverse,positiveIdeal=meta.positiveIdeal||meta.idealBest,negativeIdeal=meta.negativeIdeal||meta.idealWorst,epsilon=1e-10;
 function distance(z,ideal){const delta=z.map((v,i)=>v-ideal[i]);let square=0;for(let i=0;i<delta.length;i++)for(let j=0;j<delta.length;j++)square+=delta[i]*inverse[i][j]*delta[j];return Math.sqrt(Math.max(0,square));}
 function compute(c){
  const source=c?.v3?.scoringInputs||c?.v3?.scoreZ;
  const z=source?source.slice():keys.map((key,i)=>{const x=val(c,key);if(!valid(x))return null;const span=meta.high[i]-meta.low[i],n=span?(x-meta.low[i])/span:0;return meta.directions[i]<0?1-n:n;});
  if(z.some(v=>!valid(v)))return {c,z,positive:null,negative:null,score:null};
  const positive=distance(z,positiveIdeal),negative=distance(z,negativeIdeal);
  return {c,z,positive,negative,score:negative/(positive+negative+epsilon)};
 }
 function comparisonCounties(){return ['compareA','compareB'].map(id=>regionById.get($(id)?.value)).filter(Boolean);}
 function currentExamples(){
  const pair=comparisonCounties();
  let chosen=exampleMode==='example'?exampleIds.map(id=>regionById.get(id)):pair;
  if(exampleMode==='selected'&&selected){const other=pair.find(c=>c.id!==selected.id);chosen=other?[selected,other]:[selected];}
  if(!chosen.length)chosen=exampleIds.map(id=>regionById.get(id));
  return chosen.filter(Boolean).map(compute);
 }
 function inputTable(a){return '<div class="tableWrap"><table class="scoreInputTable"><thead><tr><th>七项同向评价值</th>'+a.map(r=>'<th>'+esc(r.c.name)+'</th>').join('')+'<th>方向</th></tr></thead><tbody>'+fields.map((f,i)=>'<tr><td>'+f[0]+'</td>'+a.map(r=>'<td>'+format(r.z[i])+'</td>').join('')+'<td>'+(meta.directions[i]<0?'反向转换':'正向评价')+'</td></tr>').join('')+'</tbody></table></div>';}
 function resultCards(a){return '<div class="scoreResultGrid">'+a.map(r=>'<article><h3>'+esc(r.c.name)+'</h3><p><span>到正理想解 D<sup>+</sup></span><b>'+format(r.positive)+'</b></p><p><span>到负理想解 D<sup>−</sup></span><b>'+format(r.negative)+'</b></p><div class="scoreResultHeadline"><strong>'+format(r.score)+'</strong><span>'+(valid(val(r.c,'priority'))?val(r.c,'priority')+'级 · 全国第 '+r.c.priorityRank+' 位':'指标待补齐')+'</span></div></article>').join('')+'</div>';}
 const grades='<div class="scoreQuintiles">'+colors.map((color,i)=>'<div style="--grade-color:'+color+'"><b>'+String(i+1)+'级</b><span>'+['后约20%','20%–40%','40%–60%','60%–80%','前约20%'][i]+'</span></div>').join('')+'</div>';
 function detailedInputs(a){return '<details class="scoreMathDetails"><summary>查看七项评价值与计算细节</summary>'+normalization+inputTable(a)+'<div class="scoreIdealGrid"><div><small>正理想解 · 各项最佳评价</small>'+ideal('+')+'</div><div><small>负理想解 · 各项最低评价</small>'+ideal('−')+'</div></div><p class="scoreNotation">全国 '+meta.samples+' 县共用一套协方差矩阵与理想解。五分位得分界线：'+meta.thresholds.slice(1,-1).map(v=>v.toFixed(6)).join(' / ')+'。</p></details>';}
 function exampleHTML(a){return '<p class="scoreExampleNote">'+(exampleMode==='example'?'示例：':'当前对照：')+a.map(r=>esc(r.c.name)).join(' × ')+'<span>可在县域对照中选择任意两县</span></p><div class="scoreCovarianceBand"><div><small>相关性进入距离计算</small>'+covariance+'</div><p>以全国七维评价矩阵 Z 计算协方差；正则化后求逆，得到共同的距离尺度。</p></div><div class="scoreDistanceFormula"><div><small>到正理想解的距离</small>'+mahalanobis('+')+'</div><div><small>到负理想解的距离</small>'+mahalanobis('−')+'</div><div class="scoreFinalFormula"><small>综合得分 · 越接近最佳条件越高</small>'+scoreFormula+'</div></div>'+resultCards(a)+grades+detailedInputs(a);}
 function update(){const a=currentExamples(),key=version+'|'+exampleMode+'|'+a.map(r=>r.c.id).join('|');$('guideSelected').disabled=!selected;for(const [id,mode]of [['guideComparison','comparison'],['guideExample','example'],['guideSelected','selected']])$(id).classList.toggle('active',exampleMode===mode);if(key===exampleKey)return;exampleKey=key;$('scoreWorkedExample').innerHTML=exampleHTML(a);if(dialog.open)$('scoreDemoDistance').innerHTML=exampleHTML(a);}
 $('guideComparison').onclick=()=>{exampleMode='comparison';update();};$('guideExample').onclick=()=>{exampleMode='example';update();};$('guideSelected').onclick=()=>{exampleMode='selected';update();};
 const originalDetail=renderDetail;renderDetail=function(){originalDetail();update();};
 const originalComparison=renderComparison;renderComparison=function(){originalComparison();if(exampleMode==='comparison')update();};
 const dialog=document.createElement('dialog');dialog.id='scoringDemo';dialog.innerHTML='<div class="dialogHead"><div><div class="eyebrow">七指标 · 正则马氏 TOPSIS</div><h2>从指标，到县域开发优先级</h2></div><button aria-label="关闭评分计算过程">×</button></div><div class="scoreDemoPages"><div class="scoreDemoTabs"><button data-score-step="0" class="active">01 七项输入与共同刻度</button><button data-score-step="1">02 综合得分与等级</button><button data-score-step="2">03 耦合协调度与类型</button></div><div id="scoreDemoInput"></div><div id="scoreDemoDistance" hidden></div><div id="scoreDemoCoord" hidden></div></div>';document.body.append(dialog);
 const aFormula=math(symbol('A')+op('=')+number('0.4')+symbol('r')+op('+')+number('0.3')+symbol('s')+op('+')+number('0.2')+symbol('l')+op('+')+number('0.1')+symbol('g'),'资源系统为辐射、坡度适宜、土地可用、经济基础的加权和');
 const bFormula=math(symbol('B')+op('=')+number('0.5')+op('(')+number('1')+op('−')+symbol('c')+op(')')+op('+')+number('0.3')+symbol('h')+op('+')+number('0.2')+op('(')+number('1')+op('−')+symbol('e')+op(')'),'低碳系统为反向碳强度、碳汇覆盖、反向用电强度的加权和');
 const cFormula=math(symbol('C')+op('=')+fraction(number('2')+root(symbol('A')+symbol('B')),symbol('A')+op('+')+symbol('B')+op('+')+eps('10')),'耦合度等于二倍两系统乘积的平方根除以系统得分之和');
 const tFormula=math(symbol('T')+op('=')+number('0.6')+symbol('A')+op('+')+number('0.4')+symbol('B'),'综合发展水平为资源系统与低碳系统的加权和');
 const dFormula=math(symbol('D')+op('=')+root(symbol('C')+symbol('T')),'耦合协调度等于耦合度与综合发展水平乘积的平方根');
 const coordPage=$('scoreDemoCoord');coordPage.innerHTML='<div class="scoreCoordSystems"><article><small>资源系统 A</small><h3>辐射 · 地形 · 土地 · 经济</h3>'+aFormula+'<p>r 辐射，s 坡度适宜，l 土地可用，g 经济基础</p></article><article><small>低碳相关系统 B</small><h3>碳强度 · 碳汇 · 用电强度</h3>'+bFormula+'<p>c 碳强度，h 碳汇覆盖，e 用电强度</p></article></div><div class="scoreDistanceFormula scoreCoordFormula"><div><small>两系统耦合度</small>'+cFormula+'</div><div><small>综合发展水平</small>'+tFormula+'</div><div class="scoreFinalFormula"><small>耦合协调度</small>'+dFormula+'</div></div><div class="scoreCoordTypes"><h3>K-means：按协调度形成五种相对类型</h3><div>'+['低位型','偏低型','中位型','偏高型','高位型'].map((name,i)=>'<span style="border-top-color:'+colors[i]+'">'+name+'</span>').join('')+'</div><p>系统得分 → 耦合协调度 → 协调类型；连续协调度同时进入七指标综合评价。</p></div><div class="scoreCoordRelation"><h3>地区之间的相似与近邻</h3><p class="scoreRelationWeights"><b>65%</b> 指标相似度 <span>＋</span> <b>35%</b> 空间接近度</p><details class="scoreMathDetails"><summary>查看地区关联计算</summary><p>指标相似度：七项归一化指标的均方根欧氏距离 d，经 exp(−2d) 转换。空间接近度：县域质心距离经指数衰减转换。</p></details></div>';
 function showStep(step){$('scoreDemoInput').hidden=step!==0;$('scoreDemoDistance').hidden=step!==1;coordPage.hidden=step!==2;dialog.scrollTop=0;for(const b of dialog.querySelectorAll('[data-score-step]'))b.classList.toggle('active',+b.dataset.scoreStep===step);}
 for(const b of dialog.querySelectorAll('[data-score-step]'))b.onclick=()=>showStep(+b.dataset.scoreStep);
 $('showScoringDemo').onclick=()=>{const a=currentExamples();$('scoreDemoInput').innerHTML=flow+inputCards+'<div class="scoreInputExplanation"><h3>统一量纲与方向，共用全国刻度</h3><p>每项指标按全国最小值、最大值归一化到 0–1；不可用土地占比反向转换为可用程度。</p></div><details class="scoreMathDetails"><summary>查看归一化公式与自然潜力合成</summary>'+normalization+'<div class="scoreNaturalFormula"><small>自然光伏潜力的空间合成</small>'+math(sub(symbol('P'),symbol('k'))+op('=')+sub(symbol('R'),symbol('k'))+op('×')+sub(symbol('S'),symbol('k'))+op('×')+sub(symbol('PA'),symbol('k'))+op('×')+sub(symbol('LU'),symbol('k')),'自然潜力在各栅格上由辐射、坡度、保护区约束和土地利用系数相乘')+'<p>k 表示栅格。辐射 R、坡度适宜性 S、保护区约束 PA 与土地系数 LU 逐栅格相乘，再汇总至县域并归一化。</p></div></details>';$('scoreDemoDistance').innerHTML=exampleHTML(a);showStep(0);dialog.showModal();};
 dialog.querySelector('.dialogHead>button').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 window.ATLAS_SCORING_GUIDE={compute,currentExamples,showStep};update();window.ATLAS_SCORING_READY=true;
})();
