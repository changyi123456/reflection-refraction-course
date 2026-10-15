(function(g){
 'use strict';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const questions=[
  {id:'K01',lesson:1,title:'波前圖像判讀',answer:'B',
   stem:'同一波源產生的直線波由第 1 區進入第 2 區，兩區介質均勻且各向同性，界面固定。已知 <span class="check-math">v<sub>2</sub> = 0.50v<sub>1</sub></span>。下列哪一圖正確表示兩區在同一時刻的波峰波前？',
   figure:'assets/概念檢核/K01_題圖.svg',figureAlt:'第1區的入射波前向右上傾斜；傳播方向指向右下，與界面法線夾角為30度。第2區的折射波前尚未繪出。',
   note:'藍色與綠色線表示相鄰的波峰波前，虛線表示法線。各選項使用相同的空間比例。',
   options:[
    {key:'A',image:'assets/概念檢核/K01_選項A.svg',alt:'第2區波前延續第1區的傾斜方向與垂直間距。'},
    {key:'B',image:'assets/概念檢核/K01_選項B.svg',alt:'第2區波前與界面的夾角較小，波前的垂直間距為第1區的一半。'},
    {key:'C',image:'assets/概念檢核/K01_選項C.svg',alt:'第2區波前與界面的夾角較大，波前的垂直間距為第1區的1.5倍。'},
    {key:'D',image:'assets/概念檢核/K01_選項D.svg',alt:'第2區波前向右下傾斜，垂直間距為第1區的一半。'}
   ],
   explanation:'傳播方向垂直於波前。進入較慢的介質後，傳播方向偏向法線，波前與界面的夾角減小。固定界面前後頻率不變，由 v = fλ 可知波長減為原來的一半；波長須沿垂直於波前的方向量取。',
   errors:{A:'A 的波前方向與間距均未改變，對應兩區波速相同。',C:'C 所對應的傳播方向偏離法線，且波長增大，對應進入較快的介質。',D:'D 的波前傾斜方向顛倒，所對應的向下傳播方向指向左下方，與本題折射條件不符。'}},
  {id:'K02',lesson:1,title:'波速、頻率與波長',answer:'D',
   stem:'波源頻率為 12 Hz。波通過固定界面後，波速由 0.60 m/s 變為 0.30 m/s。折射波的頻率與波長分別為何？',
   options:[{key:'A',text:'6 Hz、5.0 cm。'},{key:'B',text:'12 Hz、5.0 cm。'},{key:'C',text:'6 Hz、2.5 cm。'},{key:'D',text:'12 Hz、2.5 cm。'}],
   explanation:'固定界面前後的頻率不變，折射波頻率仍為 12 Hz。由 λ = v/f，得 λ = 0.30/12 = 0.025 m = 2.5 cm。'},
  {id:'K03',lesson:2,title:'折射率與光速',answer:'C',
   stem:'真空中的光速為 <span class="check-math">3.00 × 10<sup>8</sup> m/s</span>，光在介質甲中的速率為 <span class="check-math">2.00 × 10<sup>8</sup> m/s</span>，介質乙的折射率為 1.33。兩介質均勻且界面平坦。同一頻率的光由乙斜射入甲時，下列何者正確？',
   options:[{key:'A',text:'甲的折射率為 1.50，折射方向偏離法線。'},{key:'B',text:'甲的折射率約為 0.67，折射方向偏向法線。'},{key:'C',text:'甲的折射率為 1.50，折射方向偏向法線。'},{key:'D',text:'甲的折射率約為 0.67，折射方向偏離法線。'}],
   explanation:'由 n = c/v，得甲的折射率為 3.00/2.00 = 1.50，沒有單位。光由乙進入折射率較大的甲時，速率減小，折射方向偏向法線。'},
  {id:'K04',lesson:2,title:'斯乃爾定律',answer:'A',
   stem:'光由空氣（折射率 1.00）射入玻璃（折射率 1.50），入射角為 30°。折射角約為多少？角度均由法線量起。',
   options:[{key:'A',text:'19.5°。'},{key:'B',text:'30.0°。'},{key:'C',text:'45.0°。'},{key:'D',text:'48.6°。'}],
   explanation:'由斯乃爾定律 n₁ sin θ₁ = n₂ sin θ₂，得 sin θ₂ = (1.00/1.50) × sin 30° ≈ 0.333，因此 θ₂ ≈ 19.5°，小於入射角，符合偏向法線的判斷。'},
  {id:'K05',lesson:2,title:'視深與虛像的判定',answer:'C',
   stem:'觀察者在空氣中斜視平坦水面下的物點 P。下列何者正確說明虛像 P′ 的判定方式？',
   options:[{key:'A',text:'只將一條出水光線反向延長，即可唯一決定 P′。'},{key:'B',text:'將兩條水中入射光線向空氣中延長，其交點就是 P′。'},{key:'C',text:'將兩條相鄰的出水折射光線向水中反向延長，其交點近似為 P′。'},{key:'D',text:'將兩條出水光線沿傳播方向延長，其交點就是水中的實像 P′。'}],
   explanation:'虛像由入眼光線的反向延長線判定。將兩條相鄰的出水折射光線向水中反向延長，其交點近似為局部虛像 P′；單一光線不能唯一決定像的位置。實際光路用實線，反向延長線用虛線。'}
 ];
 // Preserve answers during page turns and responsive repagination; no server submission.
 const responses={};
 function render(q,index,total){
  const choices=q.options.map(o=>'<div class="check-choice"><label class="check-option"><span class="check-option-head"><input type="radio" name="'+q.id+'" value="'+o.key+'" aria-label="選項 '+o.key+(o.text?'：'+esc(o.text):'')+'"><b>'+o.key+'</b>'+(o.text?'<span>'+esc(o.text)+'</span>':'')+'</span>'+(o.image?'<img src="'+o.image+'" alt="'+esc(o.alt)+'" width="620" height="360">':'')+'</label>'+(o.image?'<button class="check-image-zoom" type="button" aria-label="放大選項 '+o.key+'">放大圖示 ↗</button>':'')+'</div>').join('');
  return '<div class="concept-check" data-check="'+q.id+'"><div class="check-meta"><span>第 '+q.lesson+' 節課末</span><span>第 '+(index+1)+' 題／共 '+total+' 題 · 單選題</span></div><form class="check-form"><fieldset><legend><b>'+(index+1)+'</b> '+esc(q.title)+'</legend><div class="check-layout'+(q.figure?' check-image-layout':'')+'"><div class="check-question"><p class="check-stem">'+q.stem+'</p>'+(q.figure?'<figure class="check-figure"><img src="'+q.figure+'" alt="'+esc(q.figureAlt)+'" width="620" height="360"><figcaption><button class="check-image-zoom" type="button">放大題圖 ↗</button></figcaption></figure><p class="check-note">'+esc(q.note)+'</p>':'')+'</div><div class="check-options'+(q.figure?' check-image-options':'')+'">'+choices+'</div></div></fieldset><div class="check-actions"><button class="check-answers" type="submit">檢查答案</button></div><div class="check-feedback" role="status" aria-live="polite" hidden></div></form></div>';
 }
 function bind(root,openFigure){
  const area=root.querySelector('[data-check]');if(!area)return;
  const q=questions.find(q=>q.id===area.dataset.check),form=area.querySelector('form'),feedback=area.querySelector('.check-feedback');
  const state=responses[q.id]||(responses[q.id]={selected:'',checked:false});
  function paint(){
   area.querySelectorAll('input[type="radio"]').forEach(input=>{input.checked=input.value===state.selected;input.closest('.check-option').classList.toggle('is-selected',input.checked);});
   feedback.hidden=!state.checked;
   if(state.checked){const correct=state.selected===q.answer;feedback.classList.toggle('is-correct',correct);feedback.innerHTML='<h2>'+(correct?'答對了。':'答案需修正。')+'正確答案：'+q.answer+'</h2>'+(q.errors?.[state.selected]?'<p>'+esc(q.errors[state.selected])+'</p>':'')+'<p>'+esc(q.explanation)+'</p>';}
  }
  form.addEventListener('change',e=>{if(e.target.type!=='radio')return;state.selected=e.target.value;state.checked=false;paint();});
  form.onsubmit=e=>{e.preventDefault();if(!state.selected){feedback.hidden=false;feedback.classList.remove('is-correct');feedback.textContent='請先選擇一個選項，再檢查答案。';}else{state.checked=true;paint();}feedback.scrollIntoView({block:'nearest',behavior:'smooth'});};
  area.querySelectorAll('.check-image-zoom').forEach(button=>button.onclick=()=>openFigure(button.closest('.check-choice,.check-figure').querySelector('img')));
  paint();
 }
 function pages(lesson,frame){
  const list=questions.filter(q=>q.lesson===lesson),base='p'+(lesson===1?5:9)+'-check';
  const node={id:'check-'+lesson,name:'概念檢核',lesson};
  return list.map((q,i)=>({key:base+(i?'-'+q.id:''),node,kind:'check',questionId:q.id,stage:'第'+lesson+'節概念檢核 '+(i+1)+' / '+list.length,html:frame(node,'代表性課本試題',render(q,i,list.length))}));
 }
 g.ConceptChecks={questions,render,bind,pages};
})(window);
