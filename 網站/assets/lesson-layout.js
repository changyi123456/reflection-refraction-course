(function(g){
 'use strict';
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cards={
  '01':[
   ['① 先找法線','通過入射點、垂直鏡面的虛線，就是量角的基準。'],
   ['② 再看兩個角','入射角與反射角分別由光線和法線量起，兩者相等。'],
   ['③ 辨認光線','圖中的箭頭表示光前進的方向。這一頁先用光線回顧反射。']
  ],
  '02':[
   ['圓形波','點波源向外傳波，波前是圓弧；前進方向沿半徑。',{kind:'circle'},'A01'],
   ['直線波','波前是一組平行直線，整列波前沿垂直方向前進。',{kind:'straight'},'A01'],
   ['看移動的直角記號','先選一個波前上的標記點。播放時，看箭頭與波前是否仍成 90°。']
  ],
  '03':[
   ['① 前進','先看入射波前移向障礙物。尚未接觸時，沒有反射波前。','stage:0','A02'],
   ['② 接觸','同一波前各部分先後碰到障礙物，反射波前逐段形成。','stage:1','A02'],
   ['③ 離開','反射波前向外前進；方向箭頭與反射波前仍然垂直。','stage:2','A02'],
   ['換成圓形波','改看點波源。每一處反射都依局部的前進方向和法線判斷。',{kind:'circle',progress:0},'A02']
  ],
  '04':[
   ['A：直線路徑','先比較總距離與時間，再和 B、C 對照。',{x:48},'A03'],
   ['B：較晚入水','陸上跑得快，水中游得慢。距離較長的路徑，可能花較少時間。',{x:70},'A03'],
   ['C：再延後入水','不是陸上路徑越長就越快；要把兩段耗時相加。',{x:80},'A03']
  ],
  '05':[
   ['快區進慢區','比較波前間距，並從法線量取兩區的方向。',{angle:35,ratio:.5},'A04'],
   ['慢區進快區','只改波速比，觀察方向與波前間距如何改變。',{angle:35,ratio:1.25},'A04'],
   ['垂直入射','波前平行界面，各部分同時跨界；方向不偏折。',{angle:0,ratio:.5},'A04']
  ],
  '06':[
   ['空氣：n 約為 1','光速接近 c，作為這組比較的基準。',{medium:0},'A05'],
   ['水：n 約為 1.33','n 較大，光速較小；光源頻率相同，波長也較短。',{medium:1},'A05'],
   ['玻璃：此例 n = 1.50','比較相同時間內波前前進的距離與相鄰波前間距。',{medium:2},'A05']
  ],
  '07':[
   ['1　找波前','AC 是入射波前，A 先到達界面。',{step:0},'A06'],
   ['2　看 △ABC','C 為直角；θ₁ 的對邊是 BC，斜邊是 AB。',{step:1},'A06'],
   ['3　看 △ADB','D 為直角；θ₂ 的對邊是 AD，斜邊也是 AB。',{step:2},'A06'],
   ['4　消去共斜邊','兩個正弦比共用 AB = L，取比值後消去 L。',{step:3},'A06'],
   ['5　用頻率不變','由 v = fλ，把波長比換成波速比。',{step:4},'A06'],
   ['6　代入折射率','n = c/v，所以波速比等於折射率的反比。',{step:5},'A06'],
   ['7　完整定律','移項得到斯乃爾定律。角度都由法線量起。',{step:6},'A06']
  ],
  '08':[
   ['1　只看實物','先對照你在照片中預測的表觀位置。',{step:0},'A07'],
   ['2　追蹤入眼光線','實線從實物出發，經水面折射後進入眼睛。',{step:1},'A07'],
   ['3　反向延長','眼睛依入眼方向判斷位置；把空氣中的光線反向延長。',{step:2},'A07'],
   ['4　判讀虛像','相近光線的延長線交會，決定局部表觀位置。',{step:3},'A07']
  ]
 };
 const conclusions={
  '01':'入射角等於反射角。量角的基準是法線。',
  '02':'在本節採用的均勻、各向同性介質中，波的前進方向始終垂直於波前。',
  '03':'反射改變前進方向；同一介質中的波速、頻率與波長不變。反射前後，方向都垂直於各自的波前。',
  '04':'最短距離不一定是最短時間。救生員路徑用來比較兩區速度不同時的跨界路徑。',
  '05':'跨界時頻率不變。波速改變，波長跟著改變；斜入射時，波前方向也會改變。',
  '06':'折射率 n = c/v，沒有單位。n 越大，光速越小；同頻率下，波長也越短。',
  '07':'先辨認直角、對邊與共斜邊，再寫正弦比。完整定律可直接處理垂直入射。',
  '08':'虛像由入眼光線的反向延長決定；光並未從虛像位置發出。接近鉛直觀看的小角度近似，才可用固定視深比例。'
 };
 const ask={
  '01':'看圖時，兩個角應由鏡面量起，還是由法線量起？',
  '02':'波前的形狀改變時，前進方向與波前的關係會改變嗎？',
  '03':'反射波前在什麼時刻開始出現？它往哪個方向前進？',
  '04':'三條路徑中，最短的一條一定最快嗎？',
  '05':'進入波速不同的區域後，哪個量不变，哪個量會改變？',
  '06':'相同頻率的光，進入折射率較大的介質後，光速與波長如何？',
  '07':'圖中的兩個直角三角形，共用了哪一條邊？'
 };
 function focusCards(list){return '<div class="focus-cards">'+list.map(([title,text,set,id],i)=>{const attrs=set?' data-connect="'+id+'" '+(typeof set==='string'?'data-stage="'+set.split(':')[1]+'"':'data-set="'+escape(JSON.stringify(set))+'"')+' aria-pressed="false"':'';return '<'+(set?'button':'article')+' class="focus-card"'+attrs+'><span class="focus-index">'+(i+1)+'</span><span><b>'+title+'</b><span>'+text+'</span></span></'+(set?'button':'article')+'>';}).join('')+'</div>';}
 function takeaway(text){return '<aside class="takeaway"><b>重點整理</b><p>'+text+'</p></aside>';}
 function bench(id,list,question){return '<section class="concept-workbench"><div class="workbench-media"><div data-host="'+id+'"></div></div><div class="workbench-notes"><p class="look-here">'+question+'</p>'+focusCards(list)+'<p class="connect-hint">點選重點框，對照畫面；再用下方控制項比較。</p></div></section>';}
 function fullText(n,helpers){return '<details class="full-reading"><summary>完整定義與適用條件</summary><div>'+n.paragraphs.map(helpers.paragraph).join('')+'<p><b>適用條件：</b>'+escape(n.conditions)+'</p></div></details>'+helpers.promptCard(n.name);}
 function render(n,h){
  const application=n.id==='08'||n.id==='09';
  const deck=application?(n.id==='08'?'先看水面上下的影像，再預測物體的表觀位置。':'先找出照片中的抬升、拉長或重複影像，再用光路檢查解釋。'):ask[n.id].replace('不变','不變');
  let content='<section class="book-page guided-page"><div class="page-number">'+n.id+'</div><div class="chapter-head compact"><p class="chapter-kicker">第 '+n.lesson+' 節 · 節點 '+n.id+'</p><h1>'+escape(n.name)+'</h1><p class="chapter-deck">'+deck+'</p></div><div class="guided-content">',ids=[];
  if(n.id==='01')content+='<section class="concept-workbench"><figure class="static-ray"><img src="assets/diagrams/光線反射與法線.svg" alt="光線反射圖：入射光線、法線、反射光線及兩個角"><figcaption>依圖中的 ①、②、③，先回顧光線與法線。</figcaption></figure><div class="workbench-notes">'+focusCards(cards['01'])+'</div></section>'+takeaway(conclusions['01'])+fullText(n,h);
  else if(application){
   content+='<section class="photo-first"><h2>① 先觀察照片</h2><p>先描述看見的差異，再提出原因；照片本身沒有提供完整光路。</p>'+h.gallery(n.id==='08'?'depth':'mirage',true)+'</section><aside class="predict-box"><h2>② 畫出光路與位置預測</h2><p>'+(n.id==='08'?'水面上下，哪些位置或方向看起來不連續？水中物體看起來較淺、較深，還是相同？':'遠方影像哪些部分被拉長或重複？光從物體到眼睛的途中，可能如何改變方向？')+'</p><p>可先在學習單或 <a href="學生探究.html#'+(n.id==='08'?'l2-depth':'l2-mirage')+'">學生互動學習單</a>畫出預測，再開啟下方模型。</p></aside><details class="model-reveal"><summary>③ 留下預測後，開啟光路模型與說明</summary><div class="revealed-models">';
   if(n.id==='08'){content+=bench('A07',cards['08'],'按 1 → 4 追蹤同一組入眼光線。')+takeaway(conclusions['08']);}
   else{
    const stages=id=>[['1　實物與眼睛','先確定實物與觀察者的位置。',{step:0},id],['2　實際光路','比較均勻介質與有折射率梯度的光路。',{step:1},id],['3　入眼方向','把入眼方向反向延長，對照預測位置。',{step:2},id],['4　眼睛所見','物體上下各點的入眼方向，共同決定影像。',{step:3},id]];
    content+='<h2>糖水：由均勻介質到連續折射</h2>'+bench('A08',stages('A08'),'先把梯度設為零，再逐步增加。')+takeaway('折射率隨高度改變時，光路可連續彎曲。糖水模型中，光路彎向折射率較大的下方。')+'<h2>海面上蜃景：從光路判讀影像</h2>'+bench('A09',stages('A09'),'對照上方照片：影像位置與變形，是否符合入眼方向？')+takeaway('冷海面附近折射率較大，近水平光路可向下彎曲。倒像或重複影像須比較多條光路，不能只憑一條彎曲光線判斷。');
   }
   content+=fullText(n,h)+'</div></details>';
  }else{
   const id={'02':'A01','03':'A02','04':'A03','05':'A04','06':'A05','07':'A06'}[n.id];ids=[id];content+=bench(id,cards[n.id],({'02':'選一點，看方向箭頭與波前的直角。','03':'依序看前進、接觸與離開的畫面。','04':'按 A、B、C，對照總距離與耗時。','05':'按三種情況，比較方向與波前間距。','06':'點選介質，比較同頻率的光速與波長。','07':'按步驟，把正弦比對應到圖中的邊。'}[n.id]))+takeaway(conclusions[n.id])+fullText(n,h);
  }
  return {content:content+'</div></section>',ids};
 }
 function bind(root,mount,getSim,unmount=sim=>sim.dispose()){
  root.querySelectorAll('[data-connect]').forEach(button=>button.onclick=()=>{const sim=getSim(button.dataset.connect);if(!sim)return;const values=button.dataset.stage?{progress:Reflection.stageProgress(sim.state.angle,sim.state.kind,+button.dataset.stage)}:JSON.parse(button.dataset.set);sim.pause();sim.set(values);root.querySelectorAll('[data-connect="'+button.dataset.connect+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
  root.querySelectorAll('.model-reveal').forEach(details=>{let local=[];details.addEventListener('toggle',()=>{if(details.open){local=[...details.querySelectorAll('[data-host]')].map(host=>mount(host,host.dataset.host));}else{local.forEach(unmount);local=[];details.querySelectorAll('[data-host]').forEach(host=>{host.innerHTML='';host.classList.remove('simulation');});}});});
 }
 g.BookLayouts={render,bind,focusCards,takeaway};
})(window);
