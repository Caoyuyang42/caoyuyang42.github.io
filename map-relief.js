'use strict';
(()=>{
 const source=window.ATLAS_PHOTOS?.['stations/510000-15.webp']||'photos/stations/510000-15.webp';
 document.documentElement.style.setProperty('--atlas-map-photo','url("'+source+'")');
 for(const canvas of document.querySelectorAll('.mapCanvas,.nightMapCanvas')){const background=document.createElement('div');background.className='pvPhotoBackdrop';background.setAttribute('aria-hidden','true');canvas.prepend(background);canvas.classList.add('photographicMap');}
 const sun=document.querySelector('.brand .sun');if(sun){sun.innerHTML='<svg viewBox="64 64 384 384" role="img" aria-label="逐光太阳标志"><g fill="#ddbd7b" stroke="#f1d68e" stroke-width="1">'+Array.from({length:8},(_,i)=>'<path d="M250 74H262L267 138H245Z" transform="rotate('+i*45+' 256 256)"/>').join('')+'<circle cx="256" cy="256" r="86"/></g></svg>';sun.classList.add('goldSun');}
 const maps=new Map();let frame=0;
 function create(id){const chart=$(id);if(!chart)return;const root=svg('g',{class:'mapRelief','aria-hidden':'true','pointer-events':'none'}),layers=[],selectedLayers=[];
  for(const[depth,color]of [[9,'#062443'],[6,'#0b4564'],[3,'#13768c']]){const group=svg('g',{class:'mapReliefStep',fill:color}),paths=new Map();for(const p of provinces){const node=svg('path',{d:p.path,'fill-rule':'evenodd',stroke:depth===9?'#3ebacc':'none','stroke-width':'.55','vector-effect':'non-scaling-stroke'});paths.set(p.id,node);group.append(node);}root.append(group);layers.push({group,paths,depth});}
  for(const[depth,color]of [[8,'#063650'],[5,'#0b6781'],[2,'#52c9d7']]){const path=svg('path',{class:'selectedReliefStep',fill:color,stroke:depth===8?'#97f2ec':'none','stroke-width':'.7','vector-effect':'non-scaling-stroke','fill-rule':'evenodd'});root.append(path);selectedLayers.push({path,depth});}
  const regions=id==='map'?$('regions'):$('nightRegions');regions.before(root);maps.set(id,{chart,root,layers,selectedLayers,key:'',geometryBuilds:1,updates:0});
 }
 create('map');create('nightMap');
 function update(id){const entry=maps.get(id);if(!entry||!entry.chart.getBoundingClientRect().width)return;const{chart,layers,selectedLayers}=entry,box=chart.viewBox.baseVal,r=chart.getBoundingClientRect();if(!box.width||!box.height)return;const unit=Math.max(box.width/Math.max(1,r.width),box.height/Math.max(1,r.height)),mobile=innerWidth<761?.72:1,shift=unit*mobile;for(const layer of layers)layer.group.setAttribute('transform',`translate(${layer.depth*.24*shift} ${layer.depth*shift})`);
  const main=id==='map',focus=main?(mode==='county'?selected:selectedProv):null,node=main?(focus?regionPath(focus.id):null):chart.querySelector('.nightSelected'),path=node?.getAttribute('d')||'',scope=main?pid:'',key=[scope,main?mode:'night',focus?.id||'',path].join('|');
  if(key!==entry.key){entry.key=key;for(const layer of layers)for(const[p,node]of layer.paths){const opacity=scope&&p!==scope?'.12':'1';if(node.getAttribute('opacity')!==opacity)node.setAttribute('opacity',opacity);}for(const layer of selectedLayers){layer.path.setAttribute('d',path);layer.path.style.display=path?'':'none';}}
  for(const layer of selectedLayers)layer.path.setAttribute('transform',`translate(${layer.depth*.22*shift} ${layer.depth*shift})`);entry.updates++;
 }
 function schedule(id){if(id){update(id==='night'?'nightMap':'map');return;}cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{for(const id of maps.keys())update(id);});}
 const beforeView=setView;setView=function(){beforeView();schedule();};const beforeMap=renderMap;renderMap=function(){beforeMap();schedule();};const beforeMarks=sizeRelationMarks;sizeRelationMarks=function(){beforeMarks();schedule();};
 window.addEventListener('resize',()=>schedule());window.addEventListener('atlas:page-changed',()=>schedule());
 window.ATLAS_MAP_RELIEF={sync:schedule,getState:()=>[...maps].map(([id,m])=>({id,geometryBuilds:m.geometryBuilds,paths:m.root.querySelectorAll('path').length,updates:m.updates,background:!!m.chart.closest('.photographicMap')}))};schedule();
})();

