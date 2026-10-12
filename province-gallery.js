'use strict';
(()=>{
 const ids=[['630000','qinghai-talatan'],['150000','inner-mongolia-dalat'],['520000','guizhou-panjang'],['130000','hebei-huanghua']];
 const cases=ids.map(([provinceId,caseId])=>{const province=window.ATLAS_PROVINCE_EXAMPLES[provinceId],entry=province?.cases.find(c=>c.id===caseId);return entry?{provinceId,province:province.name,...entry,image:entry.images.find(i=>i.sourceKind==='source-photo')}:null;}).filter(c=>c?.image);
 const launch=document.createElement('button');launch.id='openStationGallery';launch.className='stationGalleryLaunch';launch.textContent='全国电站实景对照 ↗';document.querySelector('.compactMapBar').append(launch);
 const dialog=document.createElement('dialog');dialog.id='stationGallery';dialog.innerHTML='<div class="dialogHead"><div><div class="eyebrow">FIELD ATLAS / 从高原、沙漠到山地、水面</div><h2>四种地貌，四座光伏电站</h2></div><button aria-label="关闭电站实景对照">×</button></div><div class="stationGalleryGrid">'+cases.map((c,i)=>'<article><button class="stationGalleryPhoto" data-station-image="'+i+'" aria-label="放大查看'+esc(c.province+' '+c.title)+'"><img decoding="async" referrerpolicy="no-referrer" src="'+esc(c.image.url)+'" alt="'+esc(c.image.alt)+'"><span>查看大图 ↗</span></button><div class="stationGalleryCaption"><small>'+esc(c.province+' · '+c.type)+'</small><h3>'+esc(c.title)+'</h3><p>'+esc(c.location)+'</p><a href="'+esc(c.image.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(c.image.credit)+' · 图片来源 ↗</a></div></article>').join('')+'</div>';document.body.append(dialog);
 const big=$('photoDialog');
 function showImage(index){const c=cases[index],img=big.querySelector('img');img.src=c.image.url;img.alt=c.image.alt;big.querySelector('h2').textContent=c.province+' · '+c.title;big.querySelector('.photoDialogCaption').innerHTML=esc(c.location+' · '+c.type+' · '+c.image.credit)+' · <a href="'+esc(c.image.sourceUrl)+'" target="_blank" rel="noopener noreferrer">查看图片来源 ↗</a>';big.showModal();}
 for(const button of dialog.querySelectorAll('[data-station-image]'))button.onclick=()=>showImage(+button.dataset.stationImage);
 launch.onclick=()=>dialog.showModal();dialog.querySelector('.dialogHead>button').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 window.ATLAS_STATION_GALLERY={cases,showImage,open:()=>dialog.showModal()};window.ATLAS_GALLERY_READY=true;
})();
