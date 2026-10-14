(function(g){
 'use strict';
 const assets={wavefront:'assets/diagrams/斯乃爾_完整波前與三角形_25度.svg',prior:'assets/diagrams/光線反射與法線.svg',prediction:['assets/題圖/POE0.png','assets/題圖/POE1.png','assets/題圖/POE2.png','assets/題圖/POE3.png']};
 const cases=[{id:'slow',name:'快區進慢區',angle:25,ratio:.5},{id:'fast',name:'慢區進快區',angle:25,ratio:1.25},{id:'normal',name:'垂直入射',angle:0,ratio:.5}];
 const tasks={wave:{title:'Q1 波前折射觀察',time:'20–47分',node:'波速改變與波前折射'},depth:{title:'視深光路預測',time:'18–32分',node:'視深與折射形成的虛像'},mirage:{title:'海市蜃樓光路預測',time:'32–47分',node:'連續折射與海市蜃樓'}};
 function hasWork(r,topic,step=0){
  const ink=r?.ink||{};
  if(topic==='geometry')return step===0?!!ink.construction?.length:step===1?!!ink.equations?.length:!!(ink.construction?.length||ink.equations?.length);
  return !!(ink.P?.length||r?.initialInk?.length);
 }
 function start(h){
  const {D,S,esc}=h,key='optics-drawing-v3';let data,live=[],boards=[],lesson=1,topic='wave',caseIndex=0,medium='mirage',fitObserver=null,geometryObserver=null,expanded=false,photoIndex=0,completedView=false;
  try{data=JSON.parse(localStorage.getItem(key))||{};}catch(e){data={};}
  data.records=data.records||{};data.geometry=data.geometry||{};data.meta=data.meta||{};data.navigation=data.navigation||{};
  const $=s=>document.querySelector(s),stamp=()=>new Date().toISOString();
  function save(){data.schemaVersion='3.0';data.updatedAt=stamp();data.navigation[lesson]={topic,caseIndex,medium,completion:completedView};try{localStorage.setItem(key,JSON.stringify(data));if($('#save-state'))$('#save-state').textContent='已儲存';}catch(e){if($('#save-state'))$('#save-state').textContent='請下載保存';}}
  function flush(){boards.forEach(b=>b.snapshot());save();}
  function dispose(){fitObserver?.disconnect();geometryObserver?.disconnect();live.forEach(s=>s.dispose());live=[];boards=[];expanded=false;}
  function record(){const id=topic==='wave'?'wave-'+cases[caseIndex].id:topic==='mirage'?medium:topic;return data.records[id]||(data.records[id]={phase:'P',kind:id});}
  function route(){const hash=location.hash;if(hash==='#depth'||hash==='#mirage'){lesson=2;topic=hash.slice(1);return;}const m=hash.match(/^#l([12])(?:-(geometry|depth|mirage|wave))?(?:-(slow|fast|normal|sugar))?/);lesson=m?+m[1]:+(document.body.dataset.lesson||1);const nav=data.navigation[lesson]||{};topic=m?.[2]||nav.topic||(lesson===1?'wave':'geometry');caseIndex=m?.[3]&&topic==='wave'?Math.max(0,cases.findIndex(c=>c.id===m[3])):(nav.caseIndex||0);medium=m?.[3]==='sugar'?'sugar':nav.medium||'mirage';if(lesson===1)topic='wave';completedView=!!nav.completion&&(!m?.[2]||m[2]===nav.topic)&&(!m?.[3]||m[3]===cases[nav.caseIndex||0]?.id);}
  function go(name){flush();topic=name;photoIndex=0;completedView=false;render();}
  function switchCase(i){flush();caseIndex=i;completedView=false;render();}
  function header(){
   return '<header class="app-header"><div class="brand-block"><div class="brand-mark">λ</div><div><p class="eyebrow">第'+lesson+'節 · 學生互動學習單</p><h1>'+(lesson===1?'波前折射觀察':'幾何推導與光路作圖')+'</h1></div></div><div class="header-tools"><select id="lesson" class="lesson-switch" aria-label="切換課程"><option value="1">第1節</option><option value="2">第2節</option></select><span id="save-state" class="save-state" role="status"></span><button id="download-open" class="header-download">下載作圖</button><a href="教材入口.html" class="entry-link">教材入口</a><button class="icon-btn" id="toggle-menu" aria-label="開啟課程目錄" aria-expanded="false">☰</button></div></header>';
  }
  function nav(){
   const list=lesson===1?cases.map((c,i)=>({id:String(i),name:c.name,done:!!data.records['wave-'+c.id]?.completedAt,active:caseIndex===i,sub:'入射角 '+c.angle+'°'})):[{id:'geometry',name:'斯乃爾定律',done:!!data.geometry.completedAt,active:topic==='geometry',sub:'幾何作圖 → 公式'},{id:'depth',name:'視深',done:!!data.records.depth?.completedAt,active:topic==='depth',sub:'光路與局部虛像'},{id:'mirage',name:'海市蜃樓',done:!!data.records.mirage?.completedAt,active:topic==='mirage',sub:'入眼方向與表觀位置'}];
   return '<aside class="lesson-nav" id="lesson-nav"><div class="nav-intro"><p class="nav-label">'+(lesson===1?'Q1 · 三種入射情況':'本節學習順序')+'</p><p>'+(lesson===1?'各組先畫預測，再看模型答案。':'每次完成一項作圖，再接到下一個現象。')+'</p></div><nav>'+list.map((a,i)=>'<button class="stage-link '+(a.active?'is-active':'')+'" '+(lesson===1?'data-case':'data-topic')+'="'+a.id+'"><span class="stage-number">'+(a.done?'✓':i+1)+'</span><span><b>'+a.name+'</b><small>'+a.sub+'</small></span></button>').join('')+'</nav>'+(lesson===2&&topic==='mirage'?'<div class="nav-comparison"><p>延伸對照</p><button id="medium-toggle" class="text-btn">'+(medium==='mirage'?'比較糖水光路 →':'← 回到海面上蜃景')+'</button></div>':'')+'<div class="nav-footer"><a href="index.html#'+(lesson===1?'p5':'p7')+'">整合教科書 ↗</a><a href="下載/'+(lesson===1?'第1節_光與二維波的反射折射':'第2節_折射率斯乃爾定律與應用')+'_學習單_v1.0.pdf" download>下載紙本學習單</a><p>落筆後會自動保存。<br>離開前可下載作圖紀錄。</p></div></aside>';
  }
  function shell(){
   document.body.classList.add('classroom','drawing-classroom','flow-classroom');document.body.innerHTML='<a class="skip-link" href="#lesson-main">跳到目前作圖</a>'+header()+'<div class="app-shell">'+nav()+'<main id="lesson-main"><section class="lesson-stage is-visible" id="current-stage"></section></main></div>';
   $('#lesson').value=String(lesson);$('#lesson').onchange=e=>{flush();lesson=+e.target.value;const n=data.navigation[lesson]||{};topic=lesson===1?'wave':n.topic||'geometry';caseIndex=n.caseIndex||0;medium=n.medium||'mirage';completedView=false;render();};$('#download-open').onclick=downloadDialog;
   document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>switchCase(+b.dataset.case));document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>go(b.dataset.topic));$('#toggle-menu').onclick=()=>{const isOpen=$('#lesson-nav').classList.toggle('is-open');$('#toggle-menu').setAttribute('aria-expanded',String(isOpen));};if($('#medium-toggle'))$('#medium-toggle').onclick=()=>{flush();medium=medium==='mirage'?'sugar':'mirage';photoIndex=0;completedView=false;render();};
  }
  function canViewAnswer(r){return !!(r.predictedAt||r.initialImage);}
  function stageHeading(title,detail,node){return '<div class="flow-heading"><div><p>'+detail+'</p><h2>'+title+'</h2></div><button id="ai-open" class="ai-open">我該如何問 AI ↗</button></div>';}
  function stepNav(labels,index,allowed){return '<nav class="flow-steps" aria-label="目前操作步驟">'+labels.map((label,i)=>'<button data-step="'+i+'" '+(!allowed(i)?'disabled':'')+' aria-current="'+(i===index?'step':'false')+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+label+'</button>').join('')+'</nav>';}
  function penLegend(){
   const content=topic==='geometry'?['幾何圖：垂線、角度與邊名','推導：補幾何標記、寫數學式']:['畫原先的預測','需要時修正預測圖'];
   return '<div class="pen-guide" aria-label="作答筆色用途"><span class="pen-purpose orange"><b>橘筆</b>'+content[0]+'</span><span class="pen-purpose green"><b>綠筆</b>'+content[1]+'</span></div>';
  }
  function workspace(instruction,details,options={}){
   return '<div class="flow-workspace"><aside class="task-guide"><div class="task-heading"><span>'+options.badge+'</span><h3>'+instruction+'</h3></div>'+details+'<div id="guide-extra"></div></aside><div class="diagram-panel"><div class="diagram-bar"><strong id="diagram-label">'+(options.label||'作圖區')+'</strong><div class="diagram-actions"><button id="compare-prediction" '+(!options.compare?'hidden':'')+'>對照原預測</button><button id="expand-diagram">放大作圖 ↗</button><button id="close-expanded" hidden>縮回畫面 ×</button></div></div><div class="tool-row"><div id="drawing-tools-host"></div><div id="model-tools"></div></div>'+(options.penLegend===false?'':penLegend())+'<div id="canvas-space" class="canvas-space"></div><div id="model-readout" class="model-readout"></div></div></div>';
  }
  function footer(back,next,note='作圖會自動保存'){return '<footer class="flow-footer"><button id="flow-back" class="flow-back" '+(!back?'disabled':'')+'>← '+(back||'上一步')+'</button><div><span id="flow-note">'+note+'</span><p id="validation" role="alert"></p></div><button id="advance" class="flow-next">'+next+' →</button></footer>';}
  function bindCommon(node){
   if($('#ai-open'))$('#ai-open').onclick=()=>{flush();const r=topic==='geometry'?data.geometry:record();if(!hasWork(r,topic,r.uiStep||0)){dialog('<h2>先留下自己的圖或列式</h2><p>先完成本步的預測圖、幾何標記或數學式，再使用AI針對自己的作答追問。</p>','ai-drawing-dialog');return;}const d=dialog('<h2>我該如何問 AI</h2>'+h.promptCard(node),'ai-drawing-dialog');const details=d.querySelector('details');if(details)details.open=true;h.bindPrompts();};
   if($('#expand-diagram'))$('#expand-diagram').onclick=()=>{expanded=true;$('#current-stage').classList.add('workspace-expanded');$('#close-expanded').hidden=false;$('#expand-diagram').hidden=true;fit();};
   if($('#close-expanded'))$('#close-expanded').onclick=()=>{expanded=false;$('#current-stage').classList.remove('workspace-expanded');$('#close-expanded').hidden=true;$('#expand-diagram').hidden=false;fit();};
   $('#current-stage').querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{flush();if(topic==='geometry')data.geometry.uiStep=+b.dataset.step;else{const r=record(),steps=topic==='wave'?['P','O']:['photo','P','O'],value=steps[+b.dataset.step];r.showPhoto=value==='photo';if(value!=='photo'){r.phase=value;if(topic!=='wave')r.photosSeenAt=r.photosSeenAt||stamp();}}completedView=false;render();});
  }
  function dialog(html,cls=''){
   const d=document.createElement('dialog');d.className='flow-dialog '+cls;d.innerHTML='<button class="dialog-close" aria-label="關閉">關閉 ×</button>'+html;document.body.append(d);d.querySelector('.dialog-close').onclick=()=>d.close();d.onclose=()=>d.remove();d.showModal();return d;
  }
  function predictionDialog(r){dialog('<h2>原預測圖</h2><p>首次開啟模型前的預測已保留；之後修改作圖也不會覆寫這張原稿。</p><img src="'+r.initialImage+'" alt="保留的原預測圖">','prediction-dialog');}
  function downloadDialog(){
   flush();const name=(lesson===1?'第1節_光與二維波的反射折射':'第2節_折射率斯乃爾定律與應用')+'_學習單_v1.0',d=dialog('<h2>下載作圖紀錄</h2><p>包含目前兩節課已保存的圖，不會清除裝置上的作答。</p><label class="signature-label">班級／座號（可留白）<input id="signature" type="text" value="'+esc(data.meta.signature||'')+'"></label><div class="download-choices"><button data-export="html"><b>可閱讀的作圖紀錄</b><span>開啟即可看預測圖、模型答案與幾何推導</span></button><button data-export="json"><b>完整作圖紀錄</b><span>保留筆劃、模型設定與原預測</span></button></div>','download-dialog');
   d.querySelector('#signature').oninput=e=>{data.meta.signature=e.target.value;save();};d.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>{exportFile(b.dataset.export);});
  }
  function fit(){
   const space=$('#canvas-space');if(!space)return;const style=getComputedStyle(space),width=space.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),height=space.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom),w=Math.max(0,Math.min(width,height*2)),stage=space.querySelector('.sketch-stage');if(stage){stage.style.width=Math.floor(w)+'px';stage.style.height=Math.floor(w/2)+'px';}
   const plain=space.querySelector(':scope > .model-base');if(plain){plain.style.width=Math.floor(w)+'px';plain.style.height=Math.floor(w/2)+'px';}
  }
  function observeFit(){fitObserver=new ResizeObserver(fit);fitObserver.observe($('#canvas-space'));requestAnimationFrame(fit);}
  function prepareModel(id,r,set,conceal=false){
   const host=document.createElement('div');host.className='model-staging';host.hidden=true;host.dataset.host=id;$('#current-stage').append(host);const sim=S.mount(host,id,{conceal,profileKind:id==='A09'?'superior':undefined,onChange:e=>{r.settings={...e.state};save();}});sim.set(set);r.settings={...sim.state};sim.pause();live.push(sim);const readout=host.querySelector('.sim-readout');$('#model-readout').append(readout);return {sim,host};
  }
  function putPlay(host,sim,label='觀察模型'){const play=host.querySelector('.sim-controls button');$('#model-tools').innerHTML='<span>'+label+'</span>';$('#model-tools').append(play);play.addEventListener('click',()=>{const note=$('#flow-note');if(note)note.textContent=play.textContent==='暫停'?'模型播放中；落筆會自動暫停':'模型已暫停，可對照原預測';});}
  function adjustDialog(host,sim,id){
   sim.pause();const d=dialog('<h2>調整模型</h2><p>先完成指定條件，再比較參數改變時的結果。</p><div class="model-adjust"></div>','adjust-dialog'),slot=d.querySelector('.model-adjust'),controls=[...host.querySelectorAll('.sim-controls .control')].filter(x=>id!=='A09'||x.dataset.control!=='kind');controls.forEach(x=>slot.append(x));const reset=document.createElement('button');reset.className='flow-back';reset.textContent='還原指定初始條件';reset.onclick=()=>{const values=id==='A04'?{angle:cases[caseIndex].angle,ratio:cases[caseIndex].ratio,arrows:true}:id==='A07'?{depth:100,view:45,step:3}:{strength:1,kind:'superior',step:3};sim.set(values);const r=record();r.settings={...sim.state};save();};slot.append(reset);
   d.addEventListener('close',()=>{controls.forEach(x=>host.querySelector('.sim-controls').append(x));});
  }
  function bindBoard(r,slot,opts={}){
   const board=g.DrawingBoard.mount($('#canvas-space'),r,slot,{...opts,toolbarHost:$('#drawing-tools-host'),onSave:save,onStart:()=>{live.forEach(s=>s.pause());if($('#flow-note'))$('#flow-note').textContent='模型已暫停；作圖會自動保存';}});boards.push(board);observeFit();return board;
  }
  function guideDetails(phase){
   if(topic==='wave')return '<div class="given-condition"><b>指定初始條件</b><p><span>入射角 '+cases[caseIndex].angle+'°</span><span>波速比 v₂ / v₁ = '+cases[caseIndex].ratio+'</span><span>波源頻率固定</span></p></div>'+(phase==='P'?'<ol><li>在第2區畫三條波前。</li><li>補上前進方向箭頭。</li></ol>':'<ol><li>播放模型，比較波前方向。</li><li>比較兩區的波前間距。</li><li>按「對照原預測」查看原稿。</li></ol>');
   if(topic==='depth')return phase==='P'?'<ol><li>標可能看見的位置。</li><li>試畫實物到眼睛的光路。</li></ol><p>眼睛斜看水中實物；本題的初始入眼方向與鉛直夾角為45°。</p>':'<p><b>實線</b>是實物經水面折射後進入眼睛的光路。</p><p><b>虛線</b>是入眼光線的反向延長線，交點表示<b>局部虛像</b>。</p><p>比較原預測與模型的所見位置；不另作解釋圖。</p>';
   return '<div class="given-condition"><b>'+(medium==='sugar'?'糖水折射率向下增加':'近海面較冷，折射率較大')+'</b></div>'+(phase==='P'?'<ol><li>試畫物點到眼睛的光路。</li><li>標可能所見的位置。</li></ol>':'<p><b>實線</b>為彎曲的實際光路；<b>虛線</b>沿入眼方向反向直線延長，標點表示<b>表觀位置</b>。</p><p>完整影像的形狀須比較物體不同點的光路。</p>');
  }
  function photoStep(r){
   const kind=topic==='depth'?'depth':'mirage',photos=(D.photos||[]).filter(p=>p.topic===kind&&!p.optional),p=photos[photoIndex%photos.length];
   const caption={'P01':'比較水面上下的磁磚與扶手。位置與方向看起來有何差異？','P02':'水面上下的筆身看起來是否連成直線？','P03':'遠方海岸哪些部分看起來被抬高或拉長？','P04':'哪些遠方影像看起來被拉長或重複？','P05':'路面看似有水的區域和車輛下方影像有何關係？'}[p.id];
   $('#current-stage').innerHTML=stageHeading(tasks[topic].title,'第2節 · '+tasks[topic].time,tasks[topic].node)+stepNav(['看實拍','畫預測','看模型答案'],0,i=>i<2||i===2&&canViewAnswer(r))+'<div class="photo-workspace"><aside class="task-guide"><div class="task-heading"><span>先觀察</span><h3>'+caption+'</h3></div><p>先指圖描述看見的差異。下一步再畫自己的光路與所見位置預測。</p><div class="photo-choices">'+photos.map((x,i)=>'<button data-photo-choice="'+i+'" aria-pressed="'+(x.id===p.id)+'">'+esc(x.title)+'</button>').join('')+'</div></aside><figure class="one-photo"><button class="enlarge-photo" data-photo="'+p.id+'" aria-label="放大照片"><img src="'+(D.photoSources?.[p.id]||'assets/photos/'+p.id+'.jpg')+'" alt="'+esc(p.title)+'"></button><figcaption><b>'+esc(p.title)+'</b><small>'+esc(p.author)+'／<a href="'+p.license_url+'" target="_blank" rel="noreferrer">'+p.license+'</a> · <a href="'+p.source+'" target="_blank" rel="noreferrer">原始來源</a>。原圖未裁切、未修改。</small></figcaption></figure></div>'+footer(null,'開始畫預測','先看照片，這一步不填文字');
   document.querySelectorAll('[data-photo-choice]').forEach(b=>b.onclick=()=>{photoIndex=+b.dataset.photoChoice;render();});$('#advance').onclick=()=>{r.photosSeenAt=r.photosSeenAt||stamp();r.showPhoto=false;r.phase='P';save();render();};bindCommon(tasks[topic].node);h.bindPhotos();
  }
  function activity(){
   const r=record();if(r.phase==='E')r.phase='O';
   if(topic==='depth'&&r.viewRevision!=='oblique-1'){if(r.settings)r.previousDepthSettings={...r.settings};r.settings={...r.settings,depth:100,view:45,step:3};r.viewRevision='oblique-1';}
   if(topic!=='wave'&&((!r.photosSeenAt&&!r.predictedAt)||r.showPhoto)){photoStep(r);return;}
   const phase=r.phase==='O'?'O':'P',labels=topic==='wave'?['畫預測','看模型答案']:['看實拍','畫預測','看模型答案'],index=(phase==='P'?0:1)+(topic==='wave'?0:1),node=tasks[topic].node;
   const title=topic==='mirage'&&medium==='sugar'?'糖水光路預測':tasks[topic].title,detail=lesson===1?'情況 '+(caseIndex+1)+' / 3 · '+cases[caseIndex].name:'第2節 · '+tasks[topic].time;
   const next=topic==='wave'?(caseIndex<2?'看完答案，進入'+cases[caseIndex+1].name:'完成 Q1，整理作圖'):topic==='depth'?'看完答案，進入海市蜃樓':'完成活動，整理紀錄';
   $('#current-stage').innerHTML=stageHeading(title,detail,node)+stepNav(labels,index,i=>topic==='wave'?i===0||canViewAnswer(r):i<2||canViewAnswer(r))+workspace(phase==='P'?'先畫出你的預測':'對照模型答案',guideDetails(phase),{badge:phase==='P'?'預測':'答案',label:phase==='P'?'預測作圖區':'模型答案',compare:!!r.initialImage,penLegend:phase==='P'})+footer(phase==='P'?(topic==='wave'?null:'看實拍'):'返回修改預測',phase==='P'?'保留預測，看模型答案':next,phase==='P'?'畫錯可用橡皮擦或清除本圖；清除後可復原':'對照原預測即可，不需另畫觀察或解釋圖');
   let sim,host,canvas,board;
   if(phase==='O'||topic==='wave'){
    const id=topic==='wave'?'A04':topic==='depth'?'A07':medium==='sugar'?'A08':'A09',set=topic==='wave'?{angle:cases[caseIndex].angle,ratio:cases[caseIndex].ratio,...(phase==='P'?{}:r.settings)}:topic==='depth'?{depth:100,view:45,...r.settings,step:3}:{strength:1,...r.settings,kind:'superior',step:3};
    ({sim,host}=prepareModel(id,r,set,phase==='P'));canvas=sim.canvas;
    if(topic==='wave'){putPlay(host,sim,phase==='P'?'入射波前':'波前模型');if(phase==='O'){const key=document.createElement('p');key.className='original-color-key';key.innerHTML='模型波前：<b class="incoming-key">藍＝入射</b>、<b class="refracted-key">綠＝折射</b>。';$('.task-heading').append(key);}}
    if(phase==='O'){const button=document.createElement('button');button.textContent='調整條件';button.id='adjust-model';button.onclick=()=>adjustDialog(host,sim,id);$('#model-tools').append(button);}
   }
   if(phase==='P'){board=bindBoard(r,'P',{canvas,kind:topic==='depth'?'depth':medium,label:title+' 預測作圖區',tool:'line',color:'#e16f50'});if(sim)requestAnimationFrame(()=>sim.render());}
   else{
    canvas.className='model-base';$('#canvas-space').append(canvas);observeFit();sim.render();r.answerImage=canvas.toDataURL();
    if(topic==='mirage'){const pov=document.createElement('button');pov.id='view-model-image';pov.textContent='看眼睛所見';pov.onclick=()=>{sim.render();const cv=host.querySelector('.pov canvas');if(cv)dialog('<h2>模型計算的眼睛所見</h2><img src="'+cv.toDataURL()+'" alt="由物體上下各點光路計算的影像"><p>橘色為物體下部，藍色為上部。完整形狀由多條光路的入眼方向共同決定。</p>');};$('#model-tools').append(pov);}
   }
   $('#compare-prediction').onclick=()=>predictionDialog(r);
   $('#flow-back').onclick=()=>{flush();if(phase==='P')r.showPhoto=true;else r.phase='P';render();};
   $('#advance').onclick=()=>{
    if(phase==='P'){
     board.snapshot();if(!board.hasDrawing()){$('#validation').textContent='先在圖上留下預測，再開啟模型。';return;}
     if(!r.predictedAt){r.predictedAt=stamp();r.initialInk=JSON.parse(JSON.stringify(r.ink.P));r.initialImage=board.image();}r.phase='O';save();render();
    }else{sim.render();r.answerImage=canvas.toDataURL();r.observedAt=stamp();r.completedAt=stamp();save();if(topic==='wave'&&caseIndex<2){caseIndex++;render();}else if(topic==='depth'){topic='mirage';medium='mirage';render();}else{completedView=true;render();}}
   };bindCommon(node);
  }
  function geometry(){
   const r=data.geometry,step=Math.max(0,Math.min(2,r.uiStep||0)),node='直線波幾何與斯乃爾定律';r.uiStep=step;
   const titles=['畫垂線與幾何標記','由圖寫出數學式','用動畫核對推導'],info=[['從 B 向入射波前 AC 作垂線，標 C；從 A 向折射波前 DB 作垂線，標 D。','標 C、D 的直角，以及波前與界面的 θ₁、θ₂；在 A 補法線與前進方向，核對兩組角度。','標 BC = λ₁、AD = λ₂，圈出共斜邊 AB = L。'],['依對邊／斜邊寫兩個正弦比。','消去共同的 L，再用頻率不變換成波速比。','代入 n = c/v，整理成斯乃爾定律。'],['在動畫中找同一組 A、B、C、D。','依序核對對邊、共斜邊、波長比與折射率比。','用完整定律檢查垂直入射。']];
   const equations=step===1?'<div class="given-equations">'+S.equations.sine+S.equations.wave+S.equations.index+'</div>':'';
   $('#current-stage').innerHTML=stageHeading('斯乃爾定律幾何推導','第2節 · 6–18分 · 作圖與數學式',node)+stepNav(['作幾何圖','寫正弦比與定律','核對推導'],step,()=>true)+workspace(titles[step],'<ol>'+info[step].map(t=>'<li>'+t+'</li>').join('')+'</ol>'+equations,{badge:'0'+(step+1),label:step===0?'幾何作圖區':step===1?'數學式手寫區':'推導模型',penLegend:step<2})+footer(step?'上一步':null,step===0?'保存幾何圖，接著寫公式':step===1?'保存數學式，核對推導':'完成推導，進入視深',step===1?'只寫數學式，不填文字段落':'作圖會自動保存');
   if(step<2){bindBoard(r,step===0?'construction':'equations',{kind:step===0?'geometry':'formula',label:step===0?'斯乃爾定律幾何作圖':'數學式手寫區',tool:'pen',color:step===0?'#e16f50':'#167c78'});}
   else{
    const {sim,host}=prepareModel('A06',r,{angle:25,ratio:.65,step:r.modelStep||0}),cv=sim.canvas;cv.className='model-base';$('#canvas-space').append(cv);
    const controls=host.querySelector('.sim-controls'),buttons=[...controls.querySelectorAll('button')];$('#model-tools').innerHTML='<span>推導步驟</span>';buttons.filter(x=>['上一步','下一步'].includes(x.textContent)).forEach(x=>$('#model-tools').append(x));const current=document.createElement('output');current.id='geometry-model-step';$('#model-tools').append(current);
    const explanation=host.querySelector('.sim-explanation');$('#guide-extra').append(explanation);
    function status(){r.modelStep=sim.state.step;current.textContent=(sim.state.step+1)+' / 7';save();}
    buttons.forEach(b=>b.addEventListener('click',status));status();geometryObserver=new MutationObserver(()=>{status();});geometryObserver.observe(explanation,{childList:true});observeFit();
    $('#drawing-tools-host').innerHTML='<button id="view-construction">查看我的幾何圖</button><button id="view-equations">查看我的數學式</button>';
    $('#view-construction').onclick=()=>dialog('<h2>我的幾何圖</h2>'+(r.images?.construction?'<img src="'+r.images.construction+'" alt="保存的幾何作圖">':'<p>尚未留下作圖，可回到第一步。</p>'));
    $('#view-equations').onclick=()=>dialog('<h2>我的數學式</h2>'+(r.images?.equations?'<img src="'+r.images.equations+'" alt="保存的數學式">':'<p>尚未留下數學式，可回到第二步。</p>'));
   }
   $('#flow-back').onclick=()=>{flush();r.uiStep--;render();};$('#advance').onclick=()=>{flush();r.savedAt=stamp();if(step<2){r.uiStep++;render();}else{r.completedAt=stamp();topic='depth';save();render();}};bindCommon(node);
  }
  function completion(){
   const list=lesson===1?cases.map(c=>({label:'Q1 '+c.name,r:data.records['wave-'+c.id]})):[{label:'斯乃爾定律幾何推導',r:data.geometry},{label:'視深光路作圖',r:data.records.depth},{label:'海市蜃樓光路作圖',r:data.records.mirage}];
   $('#current-stage').innerHTML='<div class="completion-view"><span class="completion-mark">✓</span><p class="stage-kicker">第'+lesson+'節 · 整理作圖</p><h2>作圖已保留</h2><p>可下載紀錄，或回到各活動檢查圖上的幾何關係。</p><ul>'+list.map(x=>'<li><span>'+ (x.r?.completedAt?'✓':'○')+'</span><b>'+x.label+'</b><small>'+(x.r?.completedAt?'已完成':'可回到活動查看')+'</small></li>').join('')+'</ul><button class="flow-next" id="finish-download">下載作圖紀錄 →</button><button id="next-lesson" class="text-btn">'+(lesson===1?'進入第2節 →':'回教材入口 →')+'</button></div>';
   $('#finish-download').onclick=downloadDialog;$('#next-lesson').onclick=()=>{if(lesson===1){lesson=2;topic=data.navigation[2]?.topic||'geometry';completedView=false;render();}else if(g.TemplateBridge?.embedded)g.TemplateBridge.navigate('overview');else location.href='教材入口.html';};
  }
  function exportFile(kind){
   boards.forEach(b=>b.snapshot());save();let legacy;try{legacy=JSON.parse(localStorage.getItem('optics-poe-v1'));}catch(e){}
   const payload={unit:D.title,...data,exportedAt:stamp(),...(legacy?{legacyRecord:legacy}:{})};let content=JSON.stringify(payload,null,2),type='application/json';
   if(kind==='html'){const names={'wave-slow':'Q1 快區進慢區','wave-fast':'Q1 慢區進快區','wave-normal':'Q1 垂直入射',depth:'視深',mirage:'海面上蜃景',sugar:'糖水光路對照'};let body='<h1>光的反射折射 作圖紀錄</h1><p>'+esc(data.meta.signature||'')+'</p>';for(const [id,r] of Object.entries({geometry:data.geometry,...data.records})){body+='<h2>'+esc(names[id]||'斯乃爾定律幾何推導')+'</h2>';if(r.initialImage)body+='<h3>保留的預測圖</h3><img src="'+r.initialImage+'">';if(r.answerImage)body+='<h3>模型答案</h3><img src="'+r.answerImage+'">';for(const [k,img] of Object.entries(r.images||{})){if(!['P','construction','equations'].includes(k))continue;body+='<h3>'+esc({P:'目前預測圖',construction:'幾何作圖',equations:'數學式推導'}[k])+'</h3><img src="'+img+'">';}}content='<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>作圖紀錄</title><style>body{max-width:1000px;margin:30px auto;font:18px/1.7 sans-serif;padding:20px}img{width:100%;border:1px solid #cedbd6}</style><body>'+body+'</body></html>';type='text/html';}
   const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download='光的反射折射_作圖紀錄.'+kind;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function render(){dispose();shell();if(completedView)completion();else if(topic==='geometry')geometry();else activity();save();history.replaceState(null,'','#l'+lesson+'-'+topic+(topic==='wave'?'-'+cases[caseIndex].id:topic==='mirage'&&medium==='sugar'?'-sugar':''));g.Classroom.current={lesson,topic,caseIndex,medium,phase:topic==='geometry'?data.geometry.uiStep||0:record().phase};g.TemplateBridge?.update();}
  route();window.addEventListener('hashchange',()=>{flush();route();completedView=false;render();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded&&!document.querySelector('dialog[open]')){$('#close-expanded')?.click();}});render();g.Classroom.exportFile=exportFile;
 }
 g.Classroom={start,assets,tasks,cases,hasWork,current:null};
})(window);
