(function(){
 'use strict';
 const D=window.MaterialData,S=window.Simulations,mode=document.body.dataset.mode||'book';
 const $=s=>document.querySelector(s);let live=[],page=0;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const eq={sine_definition:'sine',triangle1:'t1',triangle2:'t2',common_hypotenuse:'common',wave_ratio:'ratio',snell:'snell',sine_geometry:'ratio'};
 function downloads(){return '';}
 function dispose(){live.forEach(x=>x.dispose());live=[];}
 function sims(ids,callback,restored={}){ids.forEach(id=>document.querySelectorAll('[data-host="'+id+'"]').forEach(h=>{const sim=S.mount(h,id,{onChange:callback,onFrame:event=>{if(mode==='book'||mode==='teacher'){document.querySelectorAll('[data-stage]').forEach(b=>b.classList.toggle('phase-active',+b.dataset.stage===({before:0,contact:1,after:2}[event.phase])));}}});if(restored[id])sim.set(restored[id]);live.push(sim);}));}
 function emphasize(s){const spans=[];for(const word of MaterialData.emphasis||[]){const i=s.indexOf(word);if(i>=0&&!spans.some(([a,b])=>i<b&&i+word.length>a))spans.push([i,i+word.length]);if(spans.length===2)break;}spans.sort((a,b)=>a[0]-b[0]);let last=0,text='';for(const [a,b] of spans){text+=esc(s.slice(last,a))+'<strong>'+esc(s.slice(a,b))+'</strong>';last=b;}return text+esc(s.slice(last));}
 const aiGuides={
  '02':'請先讓我在圓形波與直線波圖中指出波前、波源與前進方向，再問我相鄰波前間距怎麼量。引導我用半徑方向或垂直線，說明前進方向與波前的關係；不要把波前當成光線的傳播路徑。',
  '03':'請先讓我預測同一波前各部分何時碰到平面障礙物，再依前進、接觸、反射離開的畫面檢查。讓我從法線量角，並指出方向線與波前的直角；最後比較反射前後的波速、頻率與波長。圓形波以局部半徑方向及鏡像波源討論。',
  '04':'請用陸地跑得快、水中游得慢的救生員路徑，先問我最短距離是否必然最省時間。讓我比較 A、B、C 的各段路程與耗時，再說明兩區速率不同時，最快路徑為何可能轉向。將比喻接到平界面的光路，勿把光說成主動選擇道路。',
  '05':'請先讓我預測直線波由快區進慢區、由慢區進快區及垂直入射時的波前。依同一波前兩端先後跨界與相同時間內的前進距離，追問方向如何改變；再用頻率不變與 v = fλ 檢查波長。這一節先定性觀察，不直接給完整斯乃爾推導。',
  '06':'請從 n = c/v 問我每個符號及單位的意義，再讓我比較空氣、水與玻璃中的光速。接著問固定界面前後頻率、波速及波長如何變化。若我把光疏、光密當成質量密度大小，請用水相對空氣及玻璃的例子讓我修正。',
  '07':'請依教材圖逐步引導我推導斯乃爾定律。先讓我指出 C、D 的直角與共斜邊 AB；再逐一辨認 θ₁、θ₂ 的對邊，寫出正弦比。確認這兩步後，才引導我消去共斜邊，依頻率不變換成波速比，再代入折射率。最後用垂直入射檢查完整定律。不要一次提供整段推導。',
  '08':'請先讓我描述水面上下照片的差異與初始預測，再在模型中追蹤由實物到眼睛的兩條相近光線。讓我區分實際光路與反向延長線，據此說明虛像及視深。使用視深近似式前，先問我是否接近垂直觀看、小角度；不要把 0.75 倍套用到所有觀察方向。',
  '09':'請先讓我描述海市蜃樓照片中的影像並提出預測，再比較均勻糖水與有折射率梯度的光路。引導我對照折射率隨高度的變化、彎曲方向與入眼方向；討論上蜃景時，讓我比較物體上下各點的多條光路，不只憑一條彎曲光線就判定倒像。熱路面下蜃景只作延伸。'
 };
 function aiNode(name){const legacy=D.poe.find(a=>a.name===name);return D.nodes.find(n=>n.name===name)||D.nodes.find(n=>n.id===legacy?.conceptNode)||null;}
 function prompt(name){const n=aiNode(name);return '我正在學習「'+(n?.name||name)+'」。'+(aiGuides[n?.id]||'請讓我先說出觀察與理由，再檢查所用的物理概念。')+'每次只問一個問題，等我回答後再追問。請依高中物理教材範圍，用我的圖示或觀察證據檢查解釋；不引入微積分，也不要直接代替我作答。';}
 function promptCard(name){const practiceLink={'02':'K01','05':'K01','06':'K03','07':'K04','08':'K05'}[aiNode(name)?.id];if(aiNode(name)?.id==='01')return '';return '<details class="prompt-card"><summary>我該如何問 AI</summary><p>'+esc(prompt(name))+'</p><button class="copy-prompt">複製提問</button><span role="status"></span>'+(practiceLink?'<p><a href="核心練習.html#'+practiceLink+'">練習這一節的題目 →</a></p>':'')+'</details>';}
 function bindPrompts(){document.querySelectorAll('.copy-prompt').forEach(b=>b.onclick=async()=>{const value=b.parentElement.querySelector('p').textContent;try{await navigator.clipboard.writeText(value);b.nextElementSibling.textContent=' 已複製';}catch(e){b.nextElementSibling.textContent=' 請選取上方文字複製。';}});}
 function paragraph(p){return typeof p==='string'?'<p>'+emphasize(p)+'</p>':S.equations[eq[p.equation]]||'';}
 function gallery(topic,prediction=false){const photos=(D.photos||[]).filter(p=>p.topic===topic&&!p.optional);return '<section class="real-photos"><p class="chapter-kicker">實拍觀察 · 與模型分開判讀</p><h2>'+ (topic==='depth'?'水面折射與表觀深度':'真實海市蜃樓')+'</h2><div class="photo-grid">'+photos.map(p=>'<figure><button class="enlarge-photo" data-photo="'+p.id+'" aria-label="放大：'+esc(p.title)+'"><img loading="lazy" width="'+p.width+'" height="'+p.height+'" src="'+photoSrc(p)+'" alt="'+esc(p.title)+'"></button><figcaption><b>'+esc(p.title)+'</b><p>'+esc(prediction?({'P01':'比較水面上下的磁磚與扶手：你看見哪些位置或方向差異？','P02':'水面上下的筆身，看起來是否連成一直線？','P03':'請看远方海岸：哪些部分似乎被抬高或拉長？前景帆船供距離對照。','P04':'比較近處旗幟與遠方影像，找出被拉長或重複的部分。','P05':'路面上看似有水的區域，與車輛下方的影像有何關係？'}[p.id]||p.caption).replace('远','遠'):p.caption)+'</p><small>實拍 '+p.width+' × '+p.height+'　'+esc(p.author)+'／<a href="'+p.license_url+'" target="_blank" rel="noreferrer">'+p.license+'</a>　<a href="'+p.source+'" target="_blank" rel="noreferrer">原始來源</a>。未裁切、未修改。</small></figcaption></figure>').join('')+'</div></section>';}
 function photoSrc(p){return D.photoSources?.[p.id]||'assets/photos/'+p.id+'.jpg';}
 function bindPhotos(){document.querySelectorAll('.enlarge-photo').forEach(b=>b.onclick=()=>{const p=D.photos.find(x=>x.id===b.dataset.photo),d=document.createElement('dialog');d.className='photo-dialog';d.innerHTML='<button class="close-photo" aria-label="關閉照片">關閉 ×</button><h2>'+esc(p.title)+'</h2><img src="'+photoSrc(p)+'" alt="'+esc(p.title)+'"><p>'+esc(p.caption)+'</p><a href="'+photoSrc(p)+'" target="_blank">開啟完整解析度原圖</a>';document.body.append(d);d.querySelector('button').onclick=()=>d.close();d.onclose=()=>d.remove();d.showModal();});}
 function refs(){return '<div class="source-list">'+Object.entries(D.references).filter(([id])=>id.startsWith('O')||id.startsWith('C')).map(([,r])=>'<p><b>'+esc(r.name||r.title||'參考資料')+'</b><br>'+esc(r.note||'')+(r.url?'<br><a href="'+esc(r.url)+'" target="_blank" rel="noreferrer">查看原始來源</a>':'')+'</p>').join('')+'</div>';}
 function header(teacher=false){return '<header class="book-header"><div class="book-brand"><span>高中物理 · '+(teacher?'教師同步投影':'整合多模態教科書')+'</span><b>光和波的反射與折射</b></div><nav class="page-tabs" aria-label="教材章節"><button data-go="0">封面</button><button data-go="1">第1節</button><button data-go="6">第2節</button><button data-go="11">資料來源</button></nav><div class="header-actions"><a href="教材入口.html">教材入口</a><a href="'+(teacher?'index.html':'學生探究.html')+'">'+(teacher?'整合教科書':'學生互動學習單')+'</a></div></header>';}
 const helpers={D,S,mode,esc,downloads,paragraph,gallery,refs,promptCard,bindPhotos,bindPrompts};
 if(mode==='book')ScreenBook.start(helpers);
 else if(mode==='teacher')TeacherProjection.start(helpers);
 else Classroom.start(helpers);
})();
