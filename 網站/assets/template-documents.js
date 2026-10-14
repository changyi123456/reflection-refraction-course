(function(g){
'use strict';
const $=s=>document.querySelector(s),file=decodeURIComponent(location.pathname.split('/').pop()),home=file==='教材總覽.html',resource=file==='教師題庫與引導.html',backup=file==='教師備援.html';
let entries=[],entryIndex=0,flow,root,select,pagerLabel,selectionAnchor='',currentLabel='',changing=false;
const icon=n=>'<i data-lucide="'+n+'"></i>';
function tableLabels(node){node.querySelectorAll('table').forEach(table=>{const heading=[...table.querySelectorAll('thead th')].map(c=>c.textContent.trim());table.querySelectorAll('tbody tr').forEach(row=>[...row.children].forEach((cell,i)=>{if(heading[i])cell.dataset.column=heading[i];}));});}
function controls(){
 const nav=document.createElement('nav');nav.className='template-source-nav';nav.setAttribute('aria-label','文件章節');nav.innerHTML='<a href="教材入口.html">'+icon('house')+' 教材首頁</a><label for="document-section">'+(home?'教材總覽':resource?'教師資源':'章節與文件')+'</label><select id="document-section" aria-label="選擇章節或文件"></select>';
 const viewport=document.createElement('div');viewport.className='template-flow-viewport';root=document.createElement('main');root.className='template-flow-root';root.id='flow-root';if(home)root.dataset.flowSections='true';root.tabIndex=-1;viewport.append(root);
 const footer=document.createElement('footer');footer.className='template-pager';footer.innerHTML='<button id="document-prev" type="button">'+icon('arrow-left')+' 上一頁</button><div class="page-count" id="document-page" role="status" aria-live="polite"></div><button id="document-next" type="button">下一頁 '+icon('arrow-right')+'</button>';
 if(!resource)document.body.append(nav);document.body.append(viewport,footer);select=$('#document-section');pagerLabel=$('#document-page');
 $('#document-prev').onclick=()=>step(-1);$('#document-next').onclick=()=>step(1);
 select?.addEventListener('change',()=>choose(+select.value,0,true));
}
function onPage(i,n){
 const label=currentLabel;pagerLabel.textContent=(i+1)+' / '+n;const small=document.createElement('small');small.textContent=label;pagerLabel.append(small);
 $('#document-prev').disabled=i===0&&entryIndex===0;$('#document-next').disabled=i===n-1&&entryIndex===entries.length-1;
 g.TeacherResources?.bindActions(root);
 if(g.lucide)lucide.createIcons();g.TemplateBridge?.update();
}
function choose(index,page=0,hash=true){
 entryIndex=Math.max(0,Math.min(entries.length-1,index));const entry=entries[entryIndex];currentLabel=entry.label;if(select)select.value=String(entryIndex);
 const nodes=entry.nodes.map(x=>x.cloneNode(true));nodes.forEach(tableLabels);changing=true;flow.set(nodes,page);changing=false;
 if(selectionAnchor){flow.goTo(selectionAnchor);selectionAnchor='';}
 if(hash&&!home&&!resource)history.replaceState(null,'','#'+entry.id);
 g.TemplateBridge?.update();
}
function step(delta){if(flow.step(delta))return;const next=entryIndex+delta;if(next>=0&&next<entries.length)choose(next,delta<0?Infinity:0);}
function go(anchor){
 if(resource)return;
 if(home){if(anchor&&flow.goTo(anchor))return;choose(0,0,false);return;}
 const id=anchor==='reader'?'section-1':anchor;const index=entries.findIndex(e=>e.id===id||e.nodes.some(n=>n.id===id||n.querySelector('[id="'+CSS.escape(id)+'"]')));
 if(index>=0){selectionAnchor=id;choose(index,0,false);}
}
function refresh(){
 if(!resource||!flow)return;
 const source=g.TeacherResources?.raw||$('#resource-content');if(!source)return;
 const active=$('#resource-tabs [aria-selected=true]');currentLabel=active?.textContent||'教師資源';entries=[{id:location.hash.slice(1),label:currentLabel,nodes:[...source.children]}];entryIndex=0;flow.set(entries[0].nodes);g.TemplateBridge?.update();
}
function init(){
 if(!g.PageFlow)return;document.body.classList.add(home?'template-home':'template-document');
 if(home){const source=$('#template-source');entries=[{id:'overview',label:'教材首頁',nodes:[...source.children]}];source.remove();}
 else if(resource){const tabs=$('#resource-tabs');document.body.append(tabs);entries=[{id:'core',label:'教師資源',nodes:[]}];$('main')?.remove();document.querySelector('.teacher-resource-footer')?.remove();}
 else if(backup){let nodes=[],id='l1';for(const n of [...document.body.children]){if(['SCRIPT','STYLE'].includes(n.tagName))continue;if(n.id==='l2'){entries.push({id,label:'第1節 無設備備援',nodes});nodes=[];id='l2';}nodes.push(n);}entries.push({id,label:'第2節 無設備備援',nodes});entries.forEach(e=>e.nodes.forEach(n=>n.remove()));}
 else{entries=[...document.querySelectorAll('section.chapter')].filter(n=>n.id!=='downloads').map(n=>({id:n.id,label:n.querySelector('h2')?.textContent||n.id,nodes:[n]}));document.querySelector('.resource-shell')?.remove();document.querySelector('.resource-header')?.remove();}
 controls();if(select)select.innerHTML=entries.map((e,i)=>'<option value="'+i+'">'+e.label.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</option>').join('');
 flow=new PageFlow(root,onPage);if(resource)refresh();else{choose(0,0,false);go(location.hash.slice(1));}
 root.addEventListener('click',e=>{const a=e.target.closest('a');if(a?.getAttribute('href')?.startsWith('#')){const anchor=decodeURIComponent(a.getAttribute('href').slice(1));e.preventDefault();go(anchor);if(!home)history.replaceState(null,'','#'+anchor);}});
 window.addEventListener('hashchange',()=>{if(!changing)go(location.hash.slice(1));});
 document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]'))return;if(e.key==='ArrowRight'){e.preventDefault();step(1);}if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}});
 g.TemplateBridge?.update();
}
g.TemplateDocuments={refresh,go,get label(){return currentLabel;},get flow(){return flow;},get entries(){return entries;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
