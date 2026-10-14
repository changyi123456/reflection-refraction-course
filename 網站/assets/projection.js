(function(g){
 'use strict';
 function start(h){
  const {D,S,esc}=h;let lesson=1,current=0,live=[],cache={},observer,slides=[];
  const $=s=>document.querySelector(s),A=g.Classroom.assets;
  function item(title,time,student,say,tip,extra={}){return {title,time,student,say,tip,...extra};}
  function build(){
   if(lesson===1)return [
    item('上課準備','0–2','開啟教材；學習單只記錄Q1波前折射。','反射與折射是先備知識，今天把光線方向連到波前。','先備知識、反射及最短時間比喻採教師引導，不另加學習單題目。',{lead:'由光線到波前',bullets:['反射與折射作為先備','波前與前進方向始終垂直','Q1 先畫預測，再看模型答案']}),
    item('光線與法線','2–5','指出法線與光線的夾角。','入射角、反射角都從法線量起。','此段口頭回顧即可，不要求填答。',{image:A.prior,lead:'角度由法線量起'}),
    item('波前與前進方向','5–9','比較圓形波和直線波；指出直角記號。','圓形波沿半徑前進；直線波整列前進。方向都垂直波前。','圓弧表示同相位的位置，不是光線的軌跡。',{sim:'A01',bullets:['換波前形狀','追蹤前進方向','方向垂直波前']}),
    item('二維波反射示範','9–14','觀察整列波前到達障礙物及反射。','先到達障礙物的部分先反射；仍可用法線量角。','教師示範直線波後可切換圓形波；不另設POE填答。',{sim:'A02',set:{kind:'straight',angle:25,progress:0},bullets:['前進、接觸、反射','箭頭共用法線上的入射點','入射角等於反射角']}),
    item('光為什麼會折射？','14–20','比較走直線與在快區多走一些的路徑。','兩區速率不同，耗時最少的路徑不一定是直線。','以救生員比喻定性說明；不填距離與時間表。完整定律下一節推導。',{sim:'A03',set:{x:48},presets:[['直線路徑',{x:48}],['改變入水位置',{x:70}]],bullets:['陸上與水中速率不同','比較總耗時','連到波前跨界的速度差']}),
    item('Q1 預測 快區進慢區','20–24','畫出第2區的三條相鄰波前與前進方向。','先只看入射側，畫出跨界後的樣子。','畫完才進下一頁。入射角25°、波速比0.5；此頁不顯示折射波前或折射角。',{sim:'A04',conceal:true,set:{angle:25,ratio:.5},bullets:['第2區較慢','在第2區畫相鄰波前','補前進方向箭頭']}),
    item('Q1 模型答案 快區進慢區','24–28','看模型答案，對照原預測。','同一波前各部分先後進入慢區，前進距離不同。','觀察方向與間距即可，不填文字或資料表。',{sim:'A04',set:{angle:25,ratio:.5},bullets:['對照保留的預測','比較相鄰波前間距','方向垂直波前']}),
    item('Q1 預測 慢區進快區','28–30','保持入射角25°，畫出進快區的預測。','只改第2區波速，再畫一次。','波速比1.25，此角度未發生全反射；不預先顯示答案。',{sim:'A04',conceal:true,set:{angle:25,ratio:1.25},bullets:['入射角相同','第2區變快','保留預測圖']}),
    item('Q1 模型答案 慢區進快區','30–34','看模型答案，比較與上一組的差異。','兩區波速的大小關係改變，方向與間距如何改變？','若討論頻率，追蹤波源每秒送出的波峰數；不要求文字填答。',{sim:'A04',set:{angle:25,ratio:1.25},bullets:['比較快到慢與慢到快','核對法線兩側的角度','比較波長']}),
    item('Q1 預測 垂直入射','34–36','畫出垂直入射後的波前與方向。','波前平行界面時，各部分會在何時跨界？','只顯示入射側；把方向與波前間距分開預測。',{sim:'A04',conceal:true,set:{angle:0,ratio:.5},bullets:['入射角0°','第2區較慢','先畫再看']}),
    item('Q1 模型答案 垂直入射','36–39','看模型答案，比較原預測的方向與間距。','波速改變，傳播方向仍可能不偏折。','不要說「沒有折射」；此例波速與波長改變，但方向不偏折。',{sim:'A04',set:{angle:0,ratio:.5},bullets:['比較間距','看前進方向','核對頻率不變']}),
    item('Q1 三種情況對照','39–47','回看三組預測，對照模型的方向與間距。','預測完成後只比較模型答案，不另外增加作圖或填答。','教師以模型整理頻率不變、方向垂直波前及三種情況。判讀間距時沿前進方向量。',{sim:'A04',set:{angle:25,ratio:.5},bullets:['比較方向是否偏折','比較兩區波前間距','回看三種入射情況']}),
    item('保存作圖','47–50','保存Q1三組作圖；網頁可下載，紙本直接保留。','第一次看答案前的預測會保留；目前作圖可擦除、清除與復原。','不以段落文字或欄位完整度判定完成；以圖上的方向、間距與垂直關係判讀。',{lead:'保留預測，對照模型答案'})
   ];
   return [
    item('折射率','0–6','觀察三種介質中同頻率的波前。','n = c/v；折射率越大，同頻率下速度與波長越小。','折射率是比值，沒有單位。此段口頭辨認，不另設排序或文字填答。',{sim:'A05',bullets:['說清楚c與v','頻率由光源決定','比較波速與波長']}),
    item('斯乃爾 作垂線','6–10','從B向AC、從A向DB作垂線，標C、D與直角。','兩個直角三角形取自整列入射與折射波前。','學生先作圖；不是POE活動。圖中25°用來清楚呈現垂足。',{blank:'geometry',lead:'用作圖找兩個直角三角形',bullets:['B到AC的垂足是C','A到DB的垂足是D','標出共同斜邊AB']}),
    item('斯乃爾 波長與正弦比','10–14','標θ₁、θ₂、λ₁、λ₂與共同斜邊L，寫兩個正弦比。','選定角正對面的邊是對邊，直角對面的邊是斜邊。','BC與AD沿前進方向，垂直於波前。不要把沿界面的AB當波長。',{sim:'A06',set:{angle:25,ratio:.65,step:1},derivation:true,bullets:['先辨認兩角的位置','θ₁對邊BC、θ₂對邊AD','兩三角形的斜邊都是AB']}),
    item('斯乃爾 消去共斜邊','14–18','由正弦比消去L，以頻率不變及n = c/v整理數學式。','從幾何得到波長比，再轉成波速比與折射率比。','寫數學式即可，沒有文字解釋欄。完整式檢查垂直入射，避免0除以0。',{sim:'A06',set:{angle:25,ratio:.65,step:3},derivation:true,bullets:['消去L','λ₁/λ₂ = v₁/v₂','v₁/v₂ = n₂/n₁']}),
    item('視深 先看實拍','18–20','觀察水面上下的位置與方向差異。','先看見現象，再用光路判讀所見位置。','預測完成前不顯示延長線或虛像。此頁只看實拍。',{photo:'depth',lead:'水底看起來在哪裡？'}),
    item('視深 畫預測','20–22','標出所見位置，試畫由實物經水面到眼睛的光路。','先保留自己的位置與光路預測。','題圖中的實物與眼睛和模型採同一位置。',{blank:'depth',lead:'在題圖上畫預測',bullets:['實物位置固定','光由物體傳入眼睛','先標可能看見的位置']}),
    item('視深 模型答案','22–26','看模型的實際光路、反向延長線與局部虛像，對照預測。','實線走到眼睛；虛線反向延長，交點表示局部虛像。','水到空氣偏離法線；同一點兩條相近光線用來求局部表觀位置。',{sim:'A07',set:{depth:100,view:45,step:3},bullets:['實線：實際光路','虛線：反向延長線','標點：局部虛像']}),
    item('視深 斜看與近鉛直對照','26–32','比較不同入眼方向的模型答案，不另作圖。','眼睛依入眼方向判斷所見位置，虛線不是實際光路。','初始入眼方向為45°，作圖題與模型的眼睛位置相同。接近鉛直時才可用約0.75倍。',{sim:'A07',set:{depth:100,view:45,step:3},presets:[['斜看45°',{view:45,step:3}],['近鉛直10°',{view:10,step:3}]],bullets:['看反向延長線交點','比較局部虛像位置','回看原預測']}),
    item('海市蜃樓 先看實拍','32–34','指出遠方影像被抬高、拉長或重複的部分。','先描述所見差異，再試畫光路。','以海面上蜃景為主，熱路面下蜃景為補充。',{photo:'mirage',lead:'遠方影像的位置與形狀為何改變？'}),
    item('海市蜃樓 畫預測','34–36','依下方折射率較大的條件，畫光路與表觀位置。','比較真正的物點位置與可能的所見位置。','本圖只追蹤船上一個物點；不要在此便判定整船倒立。',{blank:'mirage',lead:'先畫到眼睛的光路',bullets:['近海面較冷，n較大','畫出物點到眼睛的光路','標可能所見的位置']}),
    item('糖水到大氣 連續折射','36–41','先比較均勻糖水與梯度糖水，再看海面光路。','光路彎向折射率較大的區域。','糖水與大氣的尺度及剖面不同；用相同的梯度概念對照，不把模型當實拍。',{sim:'A08',set:{strength:0,step:1},presets:[['均勻糖水',{strength:0,step:1}],['梯度糖水',{strength:1,step:1}]],bullets:['均勻介質：直線','有梯度：連續偏折','回到海面的折射率條件']}),
    item('海市蜃樓 模型答案','41–47','看彎曲光路、反向延長虛線與表觀位置，對照原預測。','表觀位置由入眼方向判斷；完整形狀須比較物體不同點的光路。','預測完成後，模型直接顯示延長線與表觀位置；不另設解釋作圖。單一物點不能判定倒像。',{sim:'A09',set:{strength:1,kind:'superior',step:3},presets:[['完整答案與眼睛所見',{step:3}]],bullets:['實線：彎曲的實際光路','虛線：反向直線延長','標點：表觀位置']}),
    item('保存推導與光路圖','47–50','保存幾何推導，以及視深與海市蜃樓的預測圖。','把定律、真正光路與反向延長線在圖上連起來。','紙本共3頁。評量看作圖、標記及數學式，不要求長篇文字。',{lead:'用圖與數學式整理本節概念'})
   ];
  }
  function dispose(){observer?.disconnect();live.forEach(sim=>{cache[sim.id]={...sim.state};sim.dispose();});live=[];}
  function shell(){
   slides=build();document.body.classList.add('projection');
   document.body.innerHTML='<a class="skip-link" href="#projection-main">跳到目前投影片</a><header class="projection-header"><div class="brand"><span class="brand-wave" aria-hidden="true"></span><div><p>光和波的反射與折射 · 第 '+lesson+' 節</p><h1>'+(lesson===1?'由光線到二維波':'折射率、斯乃爾定律與成像')+'</h1></div></div><div class="teacher-tools"><select id="projection-lesson" aria-label="切換投影課程"><option value="1">第1節</option><option value="2">第2節</option></select><a class="tool-button" href="學生探究.html#l'+lesson+'" target="_blank" rel="noopener">學生互動學習單</a><button class="tool-button" id="timer-toggle">開始計時</button><output id="timer-output">00:00</output><button class="tool-button" id="fullscreen-toggle">全螢幕</button><a class="tool-button" href="教材入口.html">教材入口</a></div></header><div class="projection-shell"><aside class="slide-rail" aria-label="教學流程"><p class="rail-label">50 分鐘 · 與作圖學習單同步</p><ol id="slide-list">'+slides.map((s,i)=>'<li><button data-go="'+i+'"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+esc(s.title)+'<small>'+s.time+'</small></span></button></li>').join('')+'</ol><p class="rail-tip">方向鍵換頁<br><kbd>Space</kbd> 顯示教師提示</p></aside><main id="projection-main" tabindex="-1"></main></div><footer class="projection-footer"><div><span>學生現在做</span><p id="student-action"></p></div><div><span>教師可以說</span><p id="teacher-line"></p></div><nav aria-label="投影片控制"><button id="prev-slide">上一頁</button><button id="reveal-toggle" aria-pressed="false">顯示教師提示</button><button id="next-slide">下一頁</button></nav></footer>';
   $('#projection-lesson').value=String(lesson);$('#projection-lesson').onchange=()=>{dispose();lesson=+$('#projection-lesson').value;current=0;shell();show(0);};
   document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(+b.dataset.go));
   $('#prev-slide').onclick=()=>show(current-1);$('#next-slide').onclick=()=>show(current+1);
   $('#reveal-toggle').onclick=toggle;
   $('#fullscreen-toggle').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch(e){$('#fullscreen-toggle').textContent='瀏覽器不支援';}};
   timer();
  }
  let timerFrame=0,running=false,started=0,elapsed=0;
  function timer(){cancelAnimationFrame(timerFrame);running=false;elapsed=0;const button=$('#timer-toggle'),output=$('#timer-output');function tick(){const sec=Math.floor((elapsed+(running?performance.now()-started:0))/1000);output.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');if(running)timerFrame=requestAnimationFrame(tick);}button.onclick=()=>{if(running){elapsed+=performance.now()-started;running=false;cancelAnimationFrame(timerFrame);button.textContent='繼續計時';}else{started=performance.now();running=true;button.textContent='暫停計時';tick();}};}
  function fit(){
   const body=$('.slide-body');if(!body)return;
   document.querySelectorAll('.projection-media .sim-canvas').forEach(canvas=>{const host=canvas.closest('.simulation'),height=host.parentElement.clientHeight,other=[...host.children].filter(x=>x!==canvas).reduce((s,x)=>s+x.getBoundingClientRect().height,0);canvas.style.maxHeight=Math.max(90,height-other-4)+'px';});
  }
  function toggle(){const revealed=$('.slide').classList.toggle('is-revealed');$('#reveal-toggle').setAttribute('aria-pressed',String(revealed));$('#reveal-toggle').textContent=revealed?'隱藏教師提示':'顯示教師提示';fit();}
  function show(next){
   dispose();current=Math.max(0,Math.min(slides.length-1,next));const s=slides[current];
   const notes='<div class="projection-notes script-panel">'+(s.lead?'<h2>'+esc(s.lead)+'</h2>':'<h2>'+esc(s.title)+'</h2>')+(s.text?'<p class="projection-question">'+esc(s.text)+'</p>':'')+(s.bullets?'<ol>'+s.bullets.map(b=>'<li>'+esc(b)+'</li>').join('')+'</ol>':'')+(s.presets?'<div class="projection-presets">'+s.presets.map(([title,values])=>'<button data-preset="'+esc(JSON.stringify(values))+'">'+title+'</button>').join('')+'</div>':'')+(s.derivation?'<div class="projection-presets"><button id="geometry-prev">← 上一步</button><button id="geometry-next">下一步 →</button></div><button id="wavefront-compare">對照完整波前圖 ↗</button>':'')+'</div>';
   let media=s.blank?'<figure class="projection-media diagram-card"><canvas id="projection-blank" width="960" height="480" aria-label="作圖題圖"></canvas></figure>':s.sim?'<div class="projection-media"><div data-host="'+s.sim+'"></div></div>':s.image?'<figure class="projection-media diagram-card"><img src="'+s.image+'" alt="'+esc(s.title)+'題圖"></figure>':s.photo?'<div class="projection-media projection-photos">'+h.gallery(s.photo,true)+'</div>':'';
   $('#projection-main').innerHTML='<section class="slide is-active" tabindex="-1"><div class="slide-head"><p>'+s.time+' · '+esc(s.title)+'</p><span>第'+lesson+'節 · '+(current+1)+' / '+slides.length+'</span></div><div class="slide-body '+(media?'projection-split':'projection-opening')+'">'+media+notes+'</div><div class="teacher-reveal"><strong>教師提示</strong><p>'+esc(s.tip)+'</p></div></section>';
   $('#student-action').textContent=s.student;$('#teacher-line').textContent=s.say;$('#prev-slide').disabled=current===0;$('#next-slide').disabled=current===slides.length-1;$('#reveal-toggle').textContent='顯示教師提示';$('#reveal-toggle').setAttribute('aria-pressed','false');
   document.querySelectorAll('#slide-list li').forEach((li,i)=>li.classList.toggle('is-active',i===current));
   if(s.sim){
    const sim=S.mount(document.querySelector('[data-host]'),s.sim,{conceal:!!s.conceal});if(cache[s.sim])sim.set(cache[s.sim]);if(s.set)sim.set(s.set);sim.pause();live.push(sim);if(s.conceal){const host=document.querySelector('[data-host]');[...host.querySelector('.sim-controls').children].forEach((n,i)=>n.hidden=i!==0);host.querySelector('.sim-desc').hidden=true;}
    if(['A07','A08','A09'].includes(s.sim))document.querySelector('.projection-notes').append(document.querySelector('.sim-controls'));
    if(['A06','A07','A08','A09'].includes(s.sim)){const explanation=document.querySelector('.sim-explanation');explanation.classList.add('projection-explanation');document.querySelector('.projection-notes').append(explanation);}
    document.querySelectorAll('[data-preset]').forEach(button=>button.onclick=()=>{sim.pause();sim.set(JSON.parse(button.dataset.preset));requestAnimationFrame(fit);});
    if(s.derivation){$('#geometry-prev').onclick=()=>{sim.pause();sim.set({step:Math.max(0,sim.state.step-1)});};$('#geometry-next').onclick=()=>{sim.pause();sim.set({step:Math.min(6,sim.state.step+1)});};$('#wavefront-compare').onclick=()=>{const dialog=document.createElement('dialog');dialog.className='projection-diagram-dialog';dialog.innerHTML='<button>關閉 ×</button><img src="'+A.wavefront+'" alt="同一組點位的完整波前圖">';dialog.querySelector('button').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();};}
   }
   if(s.blank)g.DrawingBoard.background($('#projection-blank').getContext('2d'),s.blank);
   observer=new MutationObserver(()=>requestAnimationFrame(fit));document.querySelectorAll('.sim-explanation').forEach(x=>observer.observe(x,{childList:true}));
   h.bindPhotos();history.replaceState(null,'','#l'+lesson+'-s'+current);fit();g.TeacherProjection.current={lesson,slide:current,title:s.title};g.TeacherProjection.slides=slides;g.TemplateBridge?.update();
  }
  function route(){const hash=location.hash,m=hash.match(/^#l([12])(?:-s(\d+))?/);if(m){lesson=+m[1];current=+(m[2]||0);}else if(hash==='#p6')lesson=2;}
  route();shell();show(current);
  document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)||document.querySelector('dialog[open]'))return;if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();show(current+1);}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(current-1);}if(e.key===' '){e.preventDefault();toggle();}});
  window.addEventListener('resize',fit);document.addEventListener('input',()=>requestAnimationFrame(fit));document.addEventListener('click',()=>requestAnimationFrame(fit));
  window.addEventListener('hashchange',()=>{route();dispose();shell();show(current);});
 }
 g.TeacherProjection={start,current:null,slides:[]};
})(window);
