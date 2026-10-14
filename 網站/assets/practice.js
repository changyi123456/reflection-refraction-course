(function(){
'use strict';
const D=window.PracticeData,KEY='optics-core-practice-v1',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),$=s=>document.querySelector(s);
let state={version:D.version,questions:{},events:[]},current=0,caseIndex=0,board=null,loadGeneration=0,storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.questions)state=saved;}catch(e){storageOK=false;}
const links={K01:'index.html#p5',K02:'index.html#p5',K03:'index.html#p6',K04:'index.html#p7',K05:'index.html#p8'};
const brief={K01:'畫出折射波前與前進方向，再比較間距。',K02:'求兩區頻率、波長，並在圖上標示波長。',K03:'求折射率，比較光速、波長與偏折方向。',K04:'列式求折射角及折射率，檢查偏折方向。',K05:'畫入眼光路與反向延長線，判斷虛像與視深。'};
const q=()=>D.questions[current];
function drawingLegend(){
 const note={K01:'實線表示波前；箭頭表示傳播方向；虛線表示法線。',K02:'量取相鄰波前的垂直間距；列式保留數值與單位。',K03:'列式保留光速單位；折射率沒有單位。',K04:'入射角與折射角皆由法線量取；保留列式與角度單位。',K05:'實線表示實際光路；虛線表示入眼光線的反向延長線。'}[q().id];
 return '<p class="drawing-legend"><strong>橘筆：原先作答</strong>；<em>綠筆：修正</em>。'+note+'</p>';
}
function record(){return state.questions[q().id]||(state.questions[q().id]={ink:{},images:{},answers:{},initial:{},revisions:[],aiQuestions:[]});}
const slot=()=>q().cases.length?'case'+caseIndex:'work';
function persist(message='已保存在這個瀏覽器'){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;}$('#save-status').textContent=storageOK?message:'本機儲存不可用，請下載紀錄保留作答';}
function event(type,extra={}){state.events.push({time:new Date().toISOString(),type,question:q().id,case:slot(),...extra});if(state.events.length>800)state.events.shift();}
function status(){const r=record(),s=slot();return !!(r.ink?.[s]?.length||r.answers?.[s]?.trim());}
function fit(){
const host=board?.stage.parentElement;if(!host)return;
const w=Math.max(1,Math.min(host.clientWidth,host.clientHeight*2));board.stage.style.width=w+'px';board.stage.style.height=w/2+'px';
}
function dialog(title,body,onOpen){const el=document.createElement('dialog');el.innerHTML='<button class="close">關閉 ×</button><h2>'+esc(title)+'</h2>'+body;document.body.append(el);el.querySelector('.close').onclick=()=>el.close();el.onclose=()=>el.remove();el.showModal();onOpen?.(el);return el;}
async function copy(value){try{await navigator.clipboard.writeText(value);}catch(e){const area=document.createElement('textarea');area.value=value;document.body.append(area);area.select();document.execCommand('copy');area.remove();}}
function questionDialog(){const x=q();dialog(x.id+' '+x.title,'<p>'+esc(x.intro)+'</p><ol>'+x.tasks.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol>'+(x.values?'<p>'+esc(x.values)+'</p>':'')+'<p>先自行作圖或列式，再使用AI追問檢查；教師評量時請獨立作答。</p>');}
function ai(){
const x=q(),r=record(),s=slot();
if(!status()){dialog('我該如何問 AI','<p>先在本題畫出一個方向或寫下你的列式，再讓AI針對自己的想法追問。可以先用「題目與條件」核對已知資料。</p>');return;}
if(!r.initial[s])saveAnswer();
const activeCase=x.cases[caseIndex],context=x.intro+(activeCase?'\n目前情境：'+activeCase.label+' '+activeCase.conditions:'')+'\n'+x.tasks.join('\n')+(x.values?'\n'+x.values:'');
const body='<p>請先儲存自己的初稿，將下面提問貼到你使用的AI，並附上題目與自己的圖或列式。網頁只提供提問，不會連接AI服務。</p><textarea id="ai-prompt" aria-label="可複製的提問" readonly>'+esc(context+'\n\n'+x.prompt+(r.answers[s]?'\n我的列式或作答：'+r.answers[s]:''))+'</textarea><div class="dialog-actions"><button id="copy-prompt">複製提問</button><a href="'+links[x.id]+'" target="_blank" rel="noopener">回看對應概念</a></div><label for="ai-note">記下AI給我的追問 選填</label><textarea id="ai-note" placeholder="只記下你想保留的追問；外部對話不會自動存入。"></textarea><button id="save-ai-note">保存追問</button>';
dialog('我該如何問 AI',body,el=>{
el.querySelector('#copy-prompt').onclick=async()=>{await copy(el.querySelector('#ai-prompt').value);event('copyPrompt');persist('已複製提問');el.querySelector('#copy-prompt').textContent='已複製';};
el.querySelector('#save-ai-note').onclick=()=>{const value=el.querySelector('#ai-note').value.trim();if(value){r.aiQuestions.push({time:new Date().toISOString(),case:s,text:value});persist('已保存這次追問');el.close();}};
});
}
function saveAnswer(){
if(!status()){dialog('先留下自己的作答','<p>請先畫圖，或在列式欄寫下你的計算。儲存不判斷正誤。</p>');return;}
const r=record(),s=slot();board.snapshot();const snap={time:new Date().toISOString(),ink:JSON.parse(JSON.stringify(r.ink[s]||[])),answer:r.answers[s]||'',image:board.image()};
if(!r.initial[s])r.initial[s]=snap;
r.revisions.push({case:s,...snap});event('saveAnswer');persist('已儲存作答；第一次初稿另行保留');
}
function initial(){const r=record(),s=slot(),old=r.initial[s];if(!old){dialog('初稿對照','<p>按「儲存這次作答」後，第一次初稿就會保留。之後可擦除或修正目前圖。</p>');return;}dialog('第一次初稿','<p>這是首次儲存的原稿；清除目前圖不會改動此份紀錄。</p><img alt="首次儲存的作圖" src="'+old.image+'"><p>'+esc(old.answer)+'</p>');}
function enlarge(){
const d=document.createElement('dialog');d.className='enlarge-drawing';d.innerHTML='<div><button id="close-enlarge" style="float:right">完成作圖 ×</button><b>'+esc(q().id+' '+q().title)+'</b></div><div class="drawing-host"></div><div class="tools-host"></div>'+drawingLegend()+'';
const origin=board.stage.parentElement,tools=board.tools.parentElement;document.body.append(d);d.querySelector('.drawing-host').append(board.stage);d.querySelector('.tools-host').append(board.tools);d.showModal();d.querySelector('#close-enlarge').onclick=()=>d.close();d.onclose=()=>{origin.append(board.stage);tools.append(board.tools);d.remove();fit();};requestAnimationFrame(fit);
}
function render(){
const gen=++loadGeneration,x=q(),r=record(),s=slot(),c=x.cases[caseIndex];
$('#practice-tabs').innerHTML=D.questions.map((v,i)=>'<button data-q="'+i+'" aria-current="'+(i===current)+'">'+v.id+' <span>'+esc(v.title)+'</span></button>').join('');
$('#practice-tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{current=+b.dataset.q;caseIndex=0;location.hash=q().id;render();});
$('#practice-main').innerHTML='<div class="practice-heading"><div><p>'+esc(x.group)+' · '+(current+1)+' / 5</p><h1>'+esc(x.title)+'</h1></div><button class="ai-prominent" id="ai-open">我該如何問 AI ↗</button></div><div class="workspace"><section class="question-copy"><p class="intro">'+esc(x.intro)+'</p><ol class="task-list">'+x.tasks.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol>'+(x.values?'<p class="values">'+esc(x.values)+'</p>':'')+'<button class="compact-question" id="question-open">題目與條件 ↗</button>'+(c?'<p class="case-conditions">'+esc(c.label)+'<br>'+esc(c.conditions)+'</p>':'')+'<div class="copy-actions"><a href="'+links[x.id]+'" target="_blank" rel="noopener">回看概念與公式</a><button id="question-open-desktop">查看完整題目</button></div></section><section class="work-area" aria-label="作答區">'+(x.cases.length>1?'<div class="case-tabs">'+x.cases.map((v,i)=>'<button data-case="'+i+'" aria-pressed="'+(i===caseIndex)+'">'+esc(v.label)+'</button>').join('')+'</div>':'')+'<div class="drawing-host" id="drawing-host"></div><div id="tools-host"></div>'+drawingLegend()+''+(x.id!=='K01'&&x.id!=='K05'?'<div class="answer-row"><label for="answer">列式與數值 可手寫或輸入</label><textarea id="answer" placeholder="保留列式、數值與單位">'+esc(r.answers[s]||'')+'</textarea></div>':'')+'<div class="work-actions"><div><button id="enlarge">放大作圖</button> <button id="initial">初稿對照</button></div><button class="save-answer" id="save-answer">儲存這次作答</button></div></section></div>';
$('.case-tabs')?.querySelectorAll('button').forEach(b=>b.onclick=()=>{caseIndex=+b.dataset.case;render();});
const summary=document.createElement('p');summary.className='compact-summary';summary.textContent=brief[x.id];$('.question-copy').prepend(summary);
$('#question-open').onclick=questionDialog;$('#question-open-desktop').onclick=questionDialog;$('#ai-open').onclick=ai;$('#save-answer').onclick=saveAnswer;$('#initial').onclick=initial;
$('#answer')?.addEventListener('input',e=>{r.answers[s]=e.target.value;persist();});
const base=document.createElement('canvas');base.width=960;base.height=480;base.setAttribute('aria-label',x.id+'作答底圖');base.className='diagram-base';
function mount(){if(gen!==loadGeneration)return;board=DrawingBoard.mount($('#drawing-host'),r,s,{canvas:base,toolbarHost:$('#tools-host'),onSave:()=>{event('drawingChange');persist();}});$('#enlarge').onclick=enlarge;requestAnimationFrame(fit);}
if(c){const image=new Image();image.onload=()=>{base.getContext('2d').drawImage(image,0,0,960,480);mount();};image.onerror=()=>{$('#save-status').textContent='題圖載入失敗，請回教材入口重新開啟';};image.src=c.figure;}
else{DrawingBoard.background(base.getContext('2d'),'formula');mount();}
$('#previous').disabled=current===0;$('#next').disabled=current===D.questions.length-1;window.TemplateBridge?.update();
}
function download(name,type,data){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportHTML(){const content=D.questions.map(x=>{const r=state.questions[x.id];if(!r)return '';return '<section><h2>'+esc(x.id+' '+x.title)+'</h2><p>'+esc(x.intro)+'</p>'+Object.keys(r.ink).map(s=>'<h3>'+esc(x.cases[+s.replace('case','')]?.label||'作答')+'</h3>'+(r.initial[s]?'<p>首次儲存 '+esc(r.initial[s].time)+'</p><img src="'+r.initial[s].image+'"><p>'+esc(r.initial[s].answer)+'</p>':'')+(r.images[s]?'<p>目前作圖</p><img src="'+r.images[s]+'">':'')+'<p>'+esc(r.answers[s]||'')+'</p>').join('')+(r.aiQuestions.length?'<h3>保留的AI追問</h3><ul>'+r.aiQuestions.map(n=>'<li>'+esc(n.text)+'</li>').join('')+'</ul>':'')+'</section>';}).join('');
download('光的反射折射_核心練習作答紀錄.html','text/html','<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>核心練習作答紀錄</title><style>body{max-width:950px;margin:30px auto;padding:20px;font-family:PingFang TC,sans-serif;line-height:1.7}img{width:100%;height:auto}section{break-before:page;border-top:1px solid #ccc}</style><h1>光的反射折射核心練習作答紀錄</h1><p>本機作答紀錄；不含外部AI完整對話，不作自動評分。</p>'+content+'</html>');}
$('#records-open').onclick=()=>dialog('作答紀錄','<p>作答只保存在這個瀏覽器。首次儲存的初稿與後續儲存的版本會分別保留；每張圖的橡皮擦、清除與復原不影響其他題。</p><div class="dialog-actions"><button id="export-json">下載完整 JSON</button><button id="export-html">下載可閱讀紀錄</button></div><button id="clear-all">清除全部練習紀錄</button>',el=>{el.querySelector('#export-json').onclick=()=>download('光的反射折射_核心練習作答紀錄.json','application/json',JSON.stringify(state,null,2));el.querySelector('#export-html').onclick=exportHTML;el.querySelector('#clear-all').onclick=()=>{if(confirm('清除這個瀏覽器的五題練習紀錄？請先下載需要保留的資料。')){state={version:D.version,questions:{},events:[]};persist('已清除全部練習紀錄');el.close();render();}};});
$('#previous').onclick=()=>{current--;caseIndex=0;location.hash=q().id;render();};$('#next').onclick=()=>{current++;caseIndex=0;location.hash=q().id;render();};
addEventListener('resize',fit);addEventListener('hashchange',()=>{const index=D.questions.findIndex(x=>x.id===location.hash.slice(1));if(index>=0&&index!==current){current=index;caseIndex=0;render();}});
current=Math.max(0,D.questions.findIndex(x=>x.id===location.hash.slice(1)));render();persist();
})();
