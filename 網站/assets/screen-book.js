(function(g){
 'use strict';
 const diagrams={
  '01':'assets/diagrams/光線反射與法線.svg','02':'assets/備援/圓形波.png',
  '03':'assets/備援/直線波反射_接觸.png','04':'assets/備援/最短時間.png',
  '05':'assets/備援/波前折射.png','06':'assets/備援/折射率.png',
  '07':'assets/diagrams/斯乃爾_完整波前與三角形_25度.svg','08':'assets/備援/視深.png',
  '09':'assets/備援/上蜃景光路.png'
 };
 const integratedModels={'02':'A01','03':'A02','04':'A03','05':'A04','06':'A05','08':'A07'};
 const groupTitles={
  '01':['反射與法線','量角與光線'],
  '02':['波前、波長與方向','惠更斯原理'],
  '03':['直線波如何反射','圓形波與反射前後的物理量'],
  '04':['折射與跨界路徑','距離、時間與費馬原理'],
  '05':['波前轉向','頻率、波速與波長'],
  '06':['折射率的定義','光速、波長與光疏光密'],
  '07':['波前與兩個直角三角形','正弦比與斯乃爾定律'],
  '08':['入眼光線與虛像','視深近似及限制'],
  '09':['連續折射與糖水','大氣分層與海市蜃樓']
 };
 const math=body=>'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'+body+'</math>';
 const mi=x=>'<mi>'+x+'</mi>',sub=(x,s)=>'<msub>'+mi(x)+'<mtext>'+s+'</mtext></msub>',frac=(a,b)=>'<mfrac>'+a+b+'</mfrac>';
 const formula=(title,value,note='')=>'<div class="concept-equation"><b>'+title+'</b>'+value+(note?'<p>'+note+'</p>':'')+'</div>';
 const extra={
  '01':{1:formula('反射定律',math(sub('θ','i')+'<mo>=</mo>'+sub('θ','r')),'θᵢ、θᵣ 分別為由法線量取的入射角與反射角。')},
  '03':{3:formula('固定障礙物、同一介質',math(sub('v','i')+'<mo>=</mo>'+sub('v','r')+'<mspace width="1em"/>'+sub('f','i')+'<mo>=</mo>'+sub('f','r')+'<mspace width="1em"/>'+sub('λ','i')+'<mo>=</mo>'+sub('λ','r')),'i、r 分別表示入射波與反射波。')},
  '05':{2:formula('固定界面兩側的關係',math(sub('f','1')+'<mo>=</mo>'+sub('f','2'))+math(frac(sub('v','1'),sub('v','2'))+'<mo>=</mo>'+frac(sub('λ','1'),sub('λ','2'))),'由 v = fλ 與頻率不變，可比較兩區的波前間距。')},
  '06':{0:formula('折射率',g.Simulations.equations.index,'c 為真空光速，v 為介質中的相位傳播速度；n 沒有單位。'),3:formula('固定界面前後頻率不變',g.Simulations.equations.wave,'同一頻率下，光速越小，波長越短。')},
  '08':{3:formula('接近垂直觀看的小角度近似',math(sub('d','視')+'<mo>≈</mo>'+sub('d','實')+'<mo>×</mo>'+frac(sub('n','觀'),sub('n','物'))),'n觀、n物 分別為觀察者與物體所在介質的折射率。此式不直接套用於一般斜視。')}
 };
 function start(h){
  const {D,S,mode,esc}=h,states={},live=[];let pages=[],current=0,resizing=false,explanationWatcher;
  document.body.classList.add('screen-book');
  document.body.innerHTML='<a class="skip-link" href="#book-main">跳至內容</a><header class="book-header screen-header"><div class="book-brand"><span>高中物理 · '+(mode==='teacher'?'教師同步投影':'整合多模態教科書')+'</span><b>光和波的反射與折射</b></div><nav class="page-tabs" aria-label="教材章節"><button data-target="p0">封面</button><button data-target="p1">第1節</button><button data-target="p6">第2節</button><button data-target="p11">資料來源</button></nav><div class="screen-actions"><button id="contents" aria-haspopup="dialog">章節目錄</button><button id="ai-help" aria-haspopup="dialog">我該如何問 AI</button></div></header><main id="book-main" tabindex="-1"></main><footer class="book-footer screen-footer"><button id="prev">← 上一頁</button><div><span id="page-label"></span><i><b id="progress"></b></i><small id="reading-stage"></small></div><button id="next">下一頁 →</button></footer>';
  const main=document.querySelector('#book-main'),$=s=>document.querySelector(s);
  function dispose(){explanationWatcher?.disconnect();live.forEach(sim=>{states[sim.id]={...sim.state};sim.dispose();});live.length=0;}
  function mount(host,id){const sim=S.mount(host,id,{profileKind:id==='A09'?(pages[current]?.initialSet?.kind||'superior'):undefined,onChange:e=>states[id]={...e.state},onFrame:e=>main.querySelectorAll('[data-stage]').forEach(b=>b.classList.toggle('phase-active',+b.dataset.stage===({before:0,contact:1,after:2}[e.phase])))});if(states[id])sim.set(states[id]);else if(id==='A06')sim.set({angle:25});else if(id==='A07'&&host.closest('.integrated-reading'))sim.set({step:3});sim.pause();live.push(sim);return sim;}
  function title(n,label){return '<header class="screen-title"><div><p>第 '+n.lesson+' 節 · '+label+'</p><h1>'+esc(n.name)+'</h1></div>'+(/^0[2-9]$/.test(n.id)?'<button class="node-ai" data-ai-open aria-haspopup="dialog"><b>我該如何問 AI</b><span>用提問檢查這一節的想法 ↗</span></button>':'')+'</header>';}
  function frame(n,label,body){return '<section class="book-page screen-page" data-node="'+n.id+'">'+title(n,label)+'<div class="screen-body">'+body+'</div></section>';}
  function visual(n,model=integratedModels[n.id]){if(model)return '<div class="reading-animation"><div data-host="'+model+'"></div></div>';return '<figure class="reading-visual"><img src="'+diagrams[n.id]+'" alt="'+esc(n.name)+'的對照圖"><figcaption>'+(n.id==='07'?'藍、綠線是完整波前。下一個推導動畫只取同一組 A、B、C、D 與粗線，逐步找出正弦比。':'對照圖中的方向、標記與下列說明。')+'</figcaption><div class="figure-tools">'+(n.id==='07'?'<button class="diagram-bridge" data-target="p7-model1">用同一組點進入逐步推導 →</button>':'')+'<button class="zoom-figure" type="button">放大圖示</button></div></figure>';}
  function readingFrame(n,blocks,model=integratedModels[n.id],label){const integrated=!!model;return frame(n,label||(integrated?'概念、公式與操作':'概念與公式'),'<div class="screen-reading'+(integrated?' integrated-reading':'')+'">'+visual(n,model)+'<div class="reading-copy">'+blocks.map(b=>b.html).join('')+'</div></div>');} 
  function blocksFor(n){
   const out=[],mid=n.id==='07'?2:n.id==='06'?2:n.id==='09'?2:n.id==='08'?3:2;
   n.paragraphs.forEach((p,i)=>{
    const head=i===0?'<h2>'+groupTitles[n.id][0]+'</h2>':i===mid?'<h2>'+groupTitles[n.id][1]+'</h2>':'';
    if(typeof p==='object'){out[out.length-1].html+=h.paragraph(p);out[out.length-1].equations.push(p.equation);}
    else out.push({key:i,html:head+h.paragraph(p),text:p,equations:[],paragraphIndex:i});
    if(extra[n.id]?.[i])out.push({key:'formula'+i,html:extra[n.id][i],text:'',equations:['supplement']});
   });
   out.push({key:'conditions',html:'<aside class="reading-conditions"><h2>適用條件與判讀</h2><p>'+esc(n.conditions)+'</p></aside>',text:n.conditions,equations:[]});
   return out;
  }
  function paginate(n,options={}){
   const source=options.blocks||blocksFor(n),model=options.sim||integratedModels[n.id],chunks=[];let chunk=[];
   const probe=document.createElement('div');probe.className='screen-probe';main.append(probe);probe.innerHTML=readingFrame(n,[],model,options.label);const copy=probe.querySelector('.reading-copy');
   function fits(list){copy.innerHTML=list.map(x=>x.html).join('');return copy.scrollHeight<=copy.clientHeight+1;}
   function split(block){
    if(block.equations.length||!block.text)return [block];
    const sentences=block.text.match(/[^。；！？]+[。；！？]?/g)||[block.text],parts=[];let text='';
    sentences.forEach(sentence=>{const candidate={...block,html:h.paragraph(text+sentence),text:text+sentence};if(text&&!fits([candidate])){parts.push({...block,key:block.key+'s'+parts.length,html:h.paragraph(text),text});text=sentence;}else text+=sentence;});
    if(text)parts.push({...block,key:block.key+'s'+parts.length,html:h.paragraph(text),text});
    return parts.length?parts:[block];
   }
   for(const block of source){
    if(fits([...chunk,block])){chunk.push(block);continue;}
    if(chunk.length){chunks.push(chunk);chunk=[];}
    for(const part of fits([block])?[block]:split(block)){
     if(chunk.length&&!fits([...chunk,part])){chunks.push(chunk);chunk=[];}
     chunk.push(part);
    }
   }
   if(chunk.length)chunks.push(chunk);probe.remove();
   return chunks.map((blocks,i)=>({key:'p'+Number(n.id)+'-'+(options.key||'c')+i,node:n,stage:(options.label||(model?'概念、公式與操作':'概念與公式'))+' '+(i+1)+' / '+chunks.length,kind:'reading',sim:model,initialSet:options.initialSet,blocks,html:readingFrame(n,blocks,model,options.label)}));
  }
  function observations(n){
   const parsed=document.createElement('div');parsed.innerHTML=g.BookLayouts.render(n,h).content;const out=[];
   if(n.id==='08'||n.id==='09'){
    parsed.querySelectorAll('.photo-first .photo-grid figure').forEach((photo,i)=>{
     const label=photo.querySelector('b').textContent;
     out.push({key:i===0?'p'+Number(n.id):'p'+Number(n.id)+'-photo'+(i+1),node:n,stage:'先看實拍 · '+label,kind:'photo',html:frame(n,'實拍觀察','<div class="screen-photo">'+photo.outerHTML+'<aside class="photo-inquiry"><h2>先描述，再提出原因</h2><p>'+ (n.id==='08'?'指出水面上下的位置或方向差異。物體的位置真的改變了嗎？':'指出遠方影像被抬升、拉長、倒立或重複的部分。光從物體到眼睛，可能如何改變方向？')+'</p><p>先保留觀察與想法，後面的模型用來檢查光路。</p></aside></div>')});
    });
    const prediction=parsed.querySelector('.predict-box').outerHTML;
    out.push({key:'p'+Number(n.id)+'-predict',node:n,stage:'先畫出預測',kind:'prediction',html:frame(n,'P 預測','<div class="screen-prediction">'+prediction+'<aside class="prediction-order"><h2>接著如何觀察</h2><p>'+ (n.id==='08'?'依序看實物、實際入眼光線、反向延長線與虛像。':'先比較均勻糖水與有濃度梯度的糖水，再看大氣分層與多條入眼光路。')+'</p><p>先在紙本或作圖學習單畫出光路與所見位置的預測，再翻頁進入模型。</p></aside></div>')});
   }
   const benches=[...parsed.querySelectorAll('.concept-workbench')];
   benches.forEach((bench,i)=>{
    const id=bench.querySelector('[data-host]')?.dataset.host;
    bench.querySelectorAll('.connect-hint').forEach(x=>x.remove());
    const count=bench.querySelectorAll('.focus-card').length,compact=innerWidth<=760,short=innerHeight<=760,limit=compact?2:3;
    const sets=n.id==='07'?[null]:compact||short?Array.from({length:Math.ceil(count/limit)},(_,k)=>Array.from({length:limit},(_,j)=>k*limit+j).filter(v=>v<count)):[null];
    sets.forEach((indices,j)=>{
     const clone=bench.cloneNode(true);if(indices)clone.querySelectorAll('.focus-card').forEach((b,k)=>{if(!indices.includes(k))b.remove();});
     if(n.id==='07'){const strip=clone.querySelector('.focus-cards');strip.classList.add('derivation-steps');strip.querySelectorAll('button').forEach((b,k)=>{b.title=b.innerText||b.textContent;b.setAttribute('aria-label',b.title);b.innerHTML='<span>'+(k+1)+'</span>';});const bridge=document.createElement('aside');bridge.className='wavefront-bridge';bridge.innerHTML='<b>從完整波前取出同一組 A、B、C、D</b><p>藍色 AC、綠色 DB 是波前；橘色 BC、AD 是沿前進方向量到的波長。</p><button class="compare-wavefronts">對照完整波前圖 ↗</button>';strip.before(bridge);const heading=document.createElement('h2');heading.className='derivation-step-title';strip.after(heading);const proof=document.createElement('button');proof.className='proof-open';proof.textContent='閱讀完整推導與適用條件';proof.dataset.proofOpen='';heading.after(proof);}
     const key='p'+Number(n.id)+'-model'+(i+1)+(j?'-'+(j+1):'');
     const step=n.id==='07'?indices?indices[0]:0:(n.id==='08'||n.id==='09')&&(compact||short)?indices[0]:undefined;
     out.push({key,node:n,stage:id?(n.id==='07'?'逐步幾何推導':'觀察與操作'+(sets.length>1?' '+(j+1)+' / '+sets.length:'')):'先看光線圖',kind:'observation',sim:id,initialStep:step,html:frame(n,id?'觀察與操作':'光線示意圖',clone.outerHTML)});
    });
   });return out;
  }
  function cover(){return '<section class="book-page cover-page screen-cover"><img class="cover-background" src="assets/封面/光和波的反射與折射_封面主視覺.png" alt="生成情境圖：單一白光束穿過平坦水面"><div class="cover-content"><p class="cover-subject">高中物理 · 多模態教科書</p><h1>光和波的<br>反射與折射現象</h1><p class="cover-deck">從光線到波前，從波速差到成像</p><div class="cover-rule"></div><ol class="cover-sections"><li><b>01</b><span>由光線到二維波</span></li><li><b>02</b><span>折射率、定律與應用</span></li></ol><button class="cover-start" data-target="p1">開始閱讀 →</button></div><div class="cover-footer"><p>兩節課 · 幾何推導與三項預測作圖</p><small>封面為生成情境圖；實拍觀察另附來源。</small></div></section>';}
  function resourcePages(){
   const out=[],p=document.createElement('div');
   const source={id:'11',name:'資料來源與模型條件',lesson:2};p.innerHTML=h.refs();
   const blocks=[...p.querySelectorAll('p')].map((x,i)=>({key:i,html:x.outerHTML}));let group=[];
   const probe=document.createElement('div');probe.className='screen-probe';main.append(probe);
   function resource(list){return frame(source,'來源與模型條件','<div class="screen-sources source-list">'+list.map(x=>x.html).join('')+'</div>');}
   blocks.unshift({key:'scope',html:'<p>波動時間、空間比例與大氣縱向尺寸按教學需要縮放。模型圖與實拍分別判讀。</p>'});
   for(const block of blocks){probe.innerHTML=resource([...group,block]);const area=probe.querySelector('.screen-sources');if(group.length&&area.scrollHeight>area.clientHeight+1){out.push({key:out.some(x=>x.kind==='sources')?'p11-'+group[0].key:'p11',stage:'資料來源',kind:'sources',html:resource(group)});group=[];}group.push(block);}
   if(group.length)out.push({key:out.some(x=>x.kind==='sources')?'p11-'+group[0].key:'p11',stage:'資料來源',kind:'sources',html:resource(group)});probe.remove();return out;
  }
  function rebuild(){
   const previous=pages[current],oldKey=previous?.key||location.hash.slice(1),oldBlock=previous?.blocks?.[0]?.key;
   dispose();main.innerHTML='';pages=[{key:'p0',stage:'封面',kind:'cover',html:cover()}];
   D.nodes.forEach(n=>{
    const observation=observations(n);let list;
    if(n.id==='07')list=observation.filter(p=>p.sim==='A06');
    else if(n.id==='09'){
     const blocks=blocksFor(n),sugar=blocks.filter(b=>b.paragraphIndex<2),sea=blocks.filter(b=>b.paragraphIndex>=2&&b.paragraphIndex<4||b.key==='conditions'),optional=blocks.filter(b=>b.paragraphIndex===4);
     optional[0].html='<h2>選讀：熱路面下蜃景</h2>'+optional[0].html+'<p><button class="enlarge-photo" data-photo="P05">對照P05熱路面實拍 ↗</button></p><p>此對照不列課堂必答作圖。</p>';
     list=[...observation.filter(p=>p.kind!=='observation'),...paginate(n,{blocks:sugar,sim:'A08',key:'sugar',label:'糖水與連續折射',initialSet:{step:3}}),...paginate(n,{blocks:sea,sim:'A09',key:'sea',label:'海面上蜃景',initialSet:{kind:'superior',step:3}}),...paginate(n,{blocks:optional,sim:'A09',key:'optional',label:'熱路面下蜃景（選讀）',initialSet:{kind:'inferior',step:3}})];
    }else{
     const reading=paginate(n);
     list=n.id==='08'?[...observation.filter(p=>p.kind!=='observation'),...reading]:reading;
    }
    if(list.length)list[0].key='p'+Number(n.id);pages.push(...list);
   });pages.push(...resourcePages());
   let found=pages.findIndex(x=>x.key===oldKey);if(previous?.kind==='reading'){const matched=pages.findIndex(x=>x.node?.id===previous.node.id&&x.blocks?.some(b=>b.key===oldBlock));if(matched>=0)found=matched;}
   if(found<0&&oldKey)found=pages.findIndex(p=>p.key===oldKey.split('-')[0]);current=found<0?0:found;g.ScreenBook.pages=pages;render(false);
  }
  function fitMedia(){
   const area=main.querySelector('.screen-body');if(!area)return;
   const derivation=live.find(sim=>sim.id==='A06');
   if(derivation){
    const step=derivation.state.step,names=['找入射波前','入射側的正弦比','折射側的正弦比','消去共同斜邊','頻率不變，換成波速比','代入折射率','完整斯乃爾定律'];
    main.querySelector('.derivation-step-title').textContent=(step+1)+'　'+names[step];
    main.querySelectorAll('.derivation-steps button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===step)));
    const formulas=[...main.querySelectorAll('.derivation-explanation math')];formulas.forEach((eq,i)=>eq.hidden=step===3&&i<2);
   }
   main.querySelectorAll('[data-sim="A08"],[data-sim="A09"]').forEach(host=>{
    host.querySelector('.sim-explanation').style.display='none';
    let button=host.querySelector('.pov-open');if(!button){button=document.createElement('button');button.className='pov-open';button.textContent='查看眼睛所見';button.onclick=()=>openPOV(host);host.querySelector('.sim-controls').append(button);}
    button.hidden=!host.querySelector('.pov canvas');
   });
   const depth=live.find(sim=>sim.id==='A07');
   if(depth)main.querySelectorAll('[data-sim="A07"] .sim-controls button').forEach(button=>{const step=['實物','實際光路','反向延長線','虛像'].indexOf(button.textContent);if(step>=0)button.setAttribute('aria-pressed',String(step===depth.state.step));});
   main.querySelectorAll('.sim-canvas').forEach(canvas=>{
    const host=canvas.closest('.simulation'),height=Math.min(area.clientHeight,host.parentElement.clientHeight),other=[...host.children].filter(x=>x!==canvas).reduce((total,x)=>total+x.getBoundingClientRect().height,0);
    canvas.style.maxHeight=Math.max(95,height-other-3)+'px';
   });
  }
  function render(writeHash=true){
   dispose();const page=pages[current];main.innerHTML=page.html;
   main.querySelectorAll('[data-host]').forEach(host=>{const sim=mount(host,host.dataset.host);if(page.initialStep!==undefined)sim.set({step:page.initialStep});if(page.initialSet)sim.set(page.initialSet);});
   main.querySelectorAll('[data-sim="A09"] [data-control="kind"]').forEach(control=>control.hidden=true);
   g.BookLayouts.bind(main,mount,id=>live.find(x=>x.id===id));h.bindPhotos();
   main.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>go(b.dataset.target));
   main.querySelectorAll('[data-ai-open]').forEach(b=>b.onclick=()=>$('#ai-help').onclick());
   main.querySelectorAll('[data-proof-open]').forEach(b=>b.onclick=()=>dialog('<h2>斯乃爾定律：完整推導</h2>'+blocksFor(page.node).map(b=>b.html).join(''),'proof-dialog'));
   main.querySelectorAll('.compare-wavefronts').forEach(b=>b.onclick=()=>openFigure({src:diagrams['07']}));
   main.querySelectorAll('.zoom-figure').forEach(b=>b.onclick=()=>openFigure(b.closest('figure').querySelector('img')));
   main.querySelectorAll('.simulation').forEach(host=>{const b=document.createElement('button');b.className='screen-zoom';b.textContent='放大圖示';b.onclick=()=>openFigure(host.querySelector('canvas'));host.querySelector('.sim-heading').append(b);});
   const geometric=main.querySelector('[data-sim="A06"]');if(geometric){const explanation=geometric.querySelector('.sim-explanation');explanation.classList.add('derivation-explanation');main.querySelector('.workbench-notes').append(explanation);}
   explanationWatcher=new MutationObserver(()=>requestAnimationFrame(fitMedia));main.querySelectorAll('.sim-explanation').forEach(x=>explanationWatcher.observe(x,{childList:true}));
   $('#prev').disabled=current===0;$('#next').disabled=current===pages.length-1;$('#page-label').textContent=(current+1)+' / '+pages.length;$('#progress').style.width=(current+1)/pages.length*100+'%';$('#reading-stage').textContent=page.stage;
   $('#ai-help').hidden=!page.node||page.node.id==='01';
   document.querySelectorAll('[data-target]').forEach(b=>b.classList.toggle('is-active',b.dataset.target==='p'+(page.node?.lesson===1?1:page.node?.lesson===2?6:page.kind==='downloads'?10:page.kind==='sources'?11:0)));
   if(writeHash&&location.hash.slice(1)!==page.key)history.replaceState(null,'','#'+page.key);fitMedia();
   g.ScreenBook.current=page;g.TemplateBridge?.update();
  }
  function go(key){if(key==='p10')key='p11';if(/^p[1-9]-model/.test(key)&&!pages.some(p=>p.key===key)){key=key.split('-')[0];}const target=pages.findIndex(p=>p.key===key);if(target>=0){current=target;render();}}
  function dialog(content,cls){const d=document.createElement('dialog');d.className='screen-dialog '+cls;d.innerHTML='<button class="close-dialog" aria-label="關閉">關閉 ×</button>'+content;document.body.append(d);d.querySelector('.close-dialog').onclick=()=>d.close();d.onclose=()=>d.remove();d.showModal();return d;}
  function openFigure(image){const src=image instanceof HTMLCanvasElement?image.toDataURL():image.src;dialog('<img src="'+src+'" alt="放大的教材圖示">','figure-dialog');}
  function openPOV(host){const canvas=host.querySelector('.pov canvas');if(canvas){const explanation=host.querySelector('.sim-explanation'),caption=[...explanation.querySelectorAll('p')].map(p=>p.outerHTML).join('');dialog('<h2>眼睛所見</h2><img src="'+canvas.toDataURL()+'" alt="由入眼方向計算的表觀影像">'+caption,'figure-dialog');}}
  $('#contents').onclick=()=>{const d=dialog('<h2>章節目錄</h2><div class="contents-list">'+D.nodes.map(n=>'<button data-topic="p'+Number(n.id)+'"><small>第'+n.lesson+'節</small>'+esc(n.name)+'</button>').join('')+'</div><p><a href="教材入口.html">教材入口</a> · <a href="學生探究.html">學生互動學習單</a></p>','contents-dialog');d.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>{d.close();go(b.dataset.topic);});};
  $('#ai-help').onclick=()=>{const name=pages[current].node?.name||D.title,d=dialog('<h2>我該如何問 AI</h2><p class="ai-context">目前主題：'+esc(name)+'</p>'+h.promptCard(name),'ai-dialog');const details=d.querySelector('details'),content=document.createElement('div');content.className='prompt-card';content.innerHTML=[...details.children].filter(x=>x.tagName!=='SUMMARY').map(x=>x.outerHTML).join('');details.replaceWith(content);h.bindPrompts();};
  $('#prev').onclick=()=>{if(current>0){current--;render();}};$('#next').onclick=()=>{if(current<pages.length-1){current++;render();}};
  document.querySelectorAll('.screen-header [data-target]').forEach(b=>b.onclick=()=>go(b.dataset.target));
  window.addEventListener('hashchange',()=>go(location.hash.slice(1)));
  main.addEventListener('input',()=>requestAnimationFrame(fitMedia));
  main.addEventListener('click',event=>{requestAnimationFrame(()=>{fitMedia();const host=main.querySelector('[data-sim="A08"],[data-sim="A09"]');const target=event.target.closest('button');if(host&&target&&(target.textContent==='眼睛所見'||target.dataset.set&&JSON.parse(target.dataset.set).step===3))openPOV(host);});});
  window.addEventListener('resize',()=>{clearTimeout(resizing);resizing=setTimeout(rebuild,150);});
  rebuild();document.fonts.ready.then(rebuild);
 }
 g.ScreenBook={start,pages:[],current:null};
})(window);
