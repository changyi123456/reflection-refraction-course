(function(){
'use strict';
const D=window.MaterialData,$=s=>document.querySelector(s),frame=$('#course-frame'),shell=$('#shell');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>'<i data-lucide="'+n+'"></i>';
const routeFiles={overview:'教材總覽.html',book:'index.html',student:'學生探究.html',practice:'核心練習.html',projection:'教師投影.html',extension:'延伸資源.html',backup:'教師備援.html'};
const titles={overview:'教材首頁',book:'整合教科書',student:'學生操作網頁',practice:'核心教學題目',projection:'教師同步投影',extension:'延伸資源',backup:'無設備備援'};
let current={type:'overview',anchor:''},trail=[],trailIndex=-1,loadedFile='教材總覽.html';
function link(type,anchor,label,symbol='file-text'){return '<a class="nav-item" href="#/'+type+(anchor?'/'+encodeURIComponent(anchor):'')+'">'+icon(symbol)+'<span>'+esc(label)+'</span></a>';}
function group(label,items,symbol='book-open',open=false){return '<details class="nav-group" '+(open?'open':'')+'><summary>'+icon(symbol)+'<span>'+esc(label)+'</span>'+icon('chevron-right')+'</summary><div class="nav-children">'+items+'</div></details>';}
function lessonResources(l){return link('student','l'+l,'學生操作網頁','monitor')+link('projection','l'+l+'-s0','教師同步投影','presentation')+link('backup','l'+l,'無設備備援','clipboard-list');}
$('#tree').innerHTML='<div class="nav-label">開始</div>'+link('overview','','教材首頁','house')+'<div class="nav-label">整合教科書</div>'+link('book','p0','封面','book-open')+[1,2].map(l=>group('第'+l+'節 '+(l===1?'由光線到二維波':'折射率、定律與應用'),D.nodes.filter(n=>n.lesson===l).map(n=>link('book','p'+Number(n.id),n.id+' '+n.name,l===1?'waves':'scan-line')).join(''),'book-open',l===1)).join('')+link('book','p11','資料來源與模型條件','file-check')+'<div class="nav-label">兩節課</div>'+[1,2].map(l=>group('第'+l+'節 '+(l===1?'反射與波前折射':'折射率、定律與應用'),lessonResources(l),'graduation-cap')).join('')+'<div class="nav-label">核心教學題目</div>'+group('K01–K05 核心練習',['波前與折射方向','波速、頻率與波長','折射率與光速','斯乃爾定律的基本計算','視深與入眼光路'].map((t,i)=>link('practice','K0'+(i+1),'K0'+(i+1)+' '+t,'pencil-line')).join(''),'pencil-line')+'<div class="nav-label">延伸資源</div>'+link('extension','reader','高三與普通物理','telescope');
function narrow(){return matchMedia('(max-width:1050px)').matches;}
function sidebar(open){if(narrow())shell.classList.toggle('sidebar-open',open);else shell.classList.toggle('sidebar-hidden',!open);$('#sidebar-toggle').setAttribute('aria-expanded',String(open));$('#sidebar').inert=!open;$('#course-main').inert=narrow()&&open;if(narrow()&&open)$('#close-sidebar').focus();}
$('#sidebar-toggle').onclick=()=>sidebar(narrow()?!shell.classList.contains('sidebar-open'):shell.classList.contains('sidebar-hidden'));
$('#close-sidebar').onclick=()=>{sidebar(false);$('#sidebar-toggle').focus();};$('#scrim').onclick=()=>sidebar(false);
matchMedia('(max-width:1050px)').addEventListener('change',()=>sidebar(!narrow()));
function parse(hash=location.hash){const legacy={top:'overview',textbook:'book/p0',lessons:'overview/lessons',practice:'practice/K01',teacher:'overview',extension:'extension/reader',downloads:'overview'};let value=hash.replace(/^#\/?/,'');value=legacy[value]||value;const bits=value.split('/');let anchor;try{anchor=decodeURIComponent(bits.slice(1).join('/'));}catch{anchor='';}return {type:routeFiles[bits[0]]?bits[0]:'overview',anchor};}
function routeKey(r){return '#/'+r.type+(r.anchor?'/'+encodeURIComponent(r.anchor):'');}
function select(){let anchor=current.anchor;if(current.type==='book')anchor=anchor.split('-')[0];$('#tree').querySelectorAll('a').forEach(a=>{const r=parse(a.hash||a.getAttribute('href')),active=r.type===current.type&&r.anchor===anchor;if(active){a.setAttribute('aria-current','page');a.closest('details')?.setAttribute('open','');}else a.removeAttribute('aria-current');});}
function historyButtons(){$('#history-back').disabled=trailIndex<=0;$('#history-next').disabled=trailIndex>=trail.length-1;}
function navigate(r,record=true){current=r;const key=routeKey(r);if(record&&trail[trailIndex]!==key){trail=trail.slice(0,trailIndex+1);trail.push(key);trailIndex=trail.length-1;}historyButtons();$('#crumb-section').textContent=titles[r.type];$('#crumb-title').textContent=r.type==='book'?(D.nodes.find(n=>'p'+Number(n.id)===r.anchor.split('-')[0])?.name||titles.book):titles[r.type];frame.title=titles[r.type]+'：反射與折射';select();
 const file=routeFiles[r.type];if(file===loadedFile){frame.contentWindow?.postMessage({type:'optics-shell-route',hash:r.anchor},'*');}else{loadedFile=file;$('#frame-status').hidden=false;frame.setAttribute('aria-busy','true');frame.src=file+'?embedded=1&v=forest-4'+(r.anchor?'#'+r.anchor:'');}if(narrow())sidebar(false);
}
window.addEventListener('hashchange',()=>navigate(parse()));
$('#history-back').onclick=()=>{if(trailIndex>0){trailIndex--;history.replaceState(null,'',trail[trailIndex]);navigate(parse(),false);}};
$('#history-next').onclick=()=>{if(trailIndex<trail.length-1){trailIndex++;history.replaceState(null,'',trail[trailIndex]);navigate(parse(),false);}};
frame.addEventListener('load',()=>{$('#frame-status').hidden=true;frame.removeAttribute('aria-busy');frame.contentWindow?.postMessage({type:'optics-shell-context',theme:'forest'},'*');});
function fallbackAI(){$('#overview-prompt').value='我正在閱讀光和波的反射與折射教材中的「'+$('#crumb-title').textContent+'」。請先讓我說出觀察、圖示或列式，再用對應的物理概念與適用條件追問。每次只問一個問題，等我回答後再追問。';if(!$('#shell-ai').open)$('#shell-ai').showModal();}
$('#ai-toggle').onclick=()=>{if(current.aiAvailable!==false&&['book','student','practice'].includes(current.type))frame.contentWindow?.postMessage({type:'optics-shell-action',action:'ai'},'*');else fallbackAI();};$('#ai-close').onclick=()=>$('#shell-ai').close();
$('#copy-overview').onclick=async()=>{const text=$('#overview-prompt').value;try{await navigator.clipboard.writeText(text);$('#ai-copy-status').textContent='已複製提問';}catch{$('#overview-prompt').select();$('#ai-copy-status').textContent='請複製上方已選取的提問。';}};
$('#fullscreen').onclick=()=>{const promise=document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.();promise?.catch(()=>{});};
window.addEventListener('message',e=>{if(e.source!==frame.contentWindow)return;const m=e.data;if(!m||typeof m!=='object')return;if(m.type==='optics-child-navigate'&&routeFiles[m.route?.type]){location.hash=routeKey(m.route);return;}if(m.type==='optics-child-state'){if(typeof m.label==='string'&&m.label)$('#crumb-title').textContent=m.label;const anchor=String(m.hash||'').replace(/^#/,'');if(anchor!==current.anchor){current.anchor=anchor;history.replaceState(null,'',routeKey(current));select();}if(m.aiAvailable!==undefined)current.aiAvailable=m.aiAvailable;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&narrow()&&shell.classList.contains('sidebar-open')){sidebar(false);$('#sidebar-toggle').focus();}});
window.OpticsShell={navigate,parse,routeFiles,get current(){return current;}};
lucide.createIcons();sidebar(!narrow());navigate(parse());
})();
