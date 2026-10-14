(function(g){
'use strict';
const embedded=new URLSearchParams(location.search).get('embedded')==='1'&&g.parent!==g;
const files={'教材總覽.html':'overview','教材入口.html':'overview','index.html':'book','學生探究.html':'student','核心練習.html':'practice','教師投影.html':'projection','延伸資源.html':'extension','教師備援.html':'backup'};
let last='',scheduled=false;
function navigate(type,anchor=''){if(embedded)g.parent.postMessage({type:'optics-child-navigate',route:{type,anchor}},'*');else location.href='教材入口.html#/'+type+(anchor?'/'+encodeURIComponent(anchor):'');}
function update(){
 document.querySelectorAll('dialog').forEach(d=>{const title=d.querySelector('h2')?.textContent||'';if(title.includes('AI')||d.classList.contains('ai-drawing-dialog'))d.classList.add('template-ai-dialog');});
 let label=g.TemplateDocuments?.label||document.querySelector('.screen-title h1,.flow-heading h2,.practice-heading h1,.projection-title h1')?.textContent||document.title;
 if(g.TeacherProjection?.current)label=g.TeacherProjection.current.title;
 const aiAvailable=!g.ScreenBook?.current||!!g.ScreenBook.current.node&&g.ScreenBook.current.node.id!=='01';
 const state={type:'optics-child-state',hash:location.hash,label,aiAvailable};const serialized=JSON.stringify(state);if(embedded&&serialized!==last){last=serialized;g.parent.postMessage(state,'*');}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update();});}
function init(){
 if(!document.body)return;
 document.body.dataset.template='forest';document.body.dataset.embedded=String(embedded);
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||!embedded||a.hasAttribute('download')||a.target==='_blank')return;let url;try{url=new URL(a.href,location.href);}catch{return;}
  if(url.protocol!==location.protocol||url.host!==location.host)return;
  const filename=decodeURIComponent(url.pathname.split('/').pop());const type=files[filename];if(!type||filename===decodeURIComponent(location.pathname.split('/').pop()))return;
  e.preventDefault();const legacy={teacher:'overview',extension:'extension',lessons:'overview',textbook:'book',practice:'practice'};if(filename==='教材入口.html'&&legacy[url.hash.slice(1)])navigate(legacy[url.hash.slice(1)],url.hash.slice(1)==='teacher'?'core':url.hash.slice(1)==='extension'?'reader':'');else navigate(type,url.hash.slice(1));
 });
 g.addEventListener('message',e=>{if(!embedded||e.source!==g.parent)return;const m=e.data;if(!m||typeof m!=='object')return;
  if(m.type==='optics-shell-route'){const value=String(m.hash||'');if(value.includes('://')||value.length>200)return;if(location.hash.slice(1)!==value)location.hash=value;else g.TemplateDocuments?.go(value);update();}
  if(m.type==='optics-shell-action'&&m.action==='ai'){const button=document.querySelector('#ai-open')||document.querySelector('#ai-help');if(button&&!button.disabled)button.click();else document.querySelector('[data-ai-open]')?.click();update();}
 });
 g.addEventListener('hashchange',schedule);new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});update();
 if(embedded)g.dispatchEvent(new Event('resize'));
}
g.TemplateBridge={embedded,navigate,update};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
