/* Height-aware pagination. Content is measured, split and retained, never clipped to hide overflow. */
(()=>{'use strict';
class PageFlow {
  constructor(root,onChange=()=>{}) {
    this.root=root;this.onChange=onChange;this.index=0;this.pages=[];this.source=[];this.values={};this.version=0;
    this.observer=new ResizeObserver(()=>this.schedule());this.observer.observe(root);
    document.fonts?.ready.then(()=>this.schedule());
    root.addEventListener('load',()=>this.schedule(),true);
    root.addEventListener('input',e=>{if(e.target.id)this.values[e.target.id]=e.target.value});
  }
  set(nodes,index=0) {this.source=Array.from(nodes).map(n=>n.cloneNode(true));const mark=(el,key)=>{if(el.nodeType!==1)return;el.dataset.flowSource=key;Array.from(el.children).forEach((c,i)=>mark(c,key+'-'+i))};this.source.forEach((el,i)=>mark(el,String(i)));this.index=index;this.values={};this.pages=[];this.pack();}
  schedule(){cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(()=>this.pack());}
  pack(){
    const W=this.root.clientWidth,H=this.root.clientHeight;
    if(!W||!H||!this.source.length)return;
    const anchor=this.pages[this.index]?.querySelector('[data-flow-key]')?.dataset.flowKey;
    const probe=document.createElement('div');probe.className='flow-page flow-probe';probe.style.width=W+'px';probe.style.height=H+'px';this.root.replaceChildren(probe);
    const content=document.createElement('div');content.className='flow-content';probe.append(content);
    const fits=()=>content.getBoundingClientRect().height<=H-2 && content.scrollWidth<=W+1;
    const wrap=(node,chain)=>{let result=node.cloneNode(true);for(let i=chain.length-1;i>=0;i--){const c=chain[i].cloneNode(false);if(c.id){c.dataset.flowAnchor=c.id;c.removeAttribute('id')}c.classList.add('flow-fragment');c.append(result);result=c}return result};
    const test=node=>{content.replaceChildren(node);return fits()};
    let key=0;
    const atom=(node,chain)=>{const x=wrap(node,chain);x.dataset.flowKey=node.dataset.flowKey||node.dataset.flowSource||String(key++);return x};
    const split=(node,chain=[],depth=0,force=false)=>{
      if(node.nodeType!==1)return [];
      let trial=wrap(node,chain);content.replaceChildren(trial);
      if(getComputedStyle(trial).display==='none'||!trial.getBoundingClientRect().height)return [];
      if(fits()&&!force)return [atom(node,chain)];
      // Grid columns become full-width rows only when the intact layout cannot fit.
      const children=Array.from(node.children);
      const atomic=node.matches('svg,canvas,video,iframe,img,.media-placeholder,.preview-model,.palette,textarea,input,select,button,a.download,.audio-empty');
      if(!atomic&&children.length&&!Array.from(node.childNodes).some(n=>n.nodeType===3&&n.textContent.trim())&&depth<12){
        const shell=node.cloneNode(false);shell.classList.add('flow-stack');
        const output=[];let pending=null;
        for(const child of children){
          // Keep small headings/labels with their first following block whenever they fit together.
          if(pending){const group=document.createElement('div');group.append(pending.cloneNode(true),child.cloneNode(true));if(test(wrap(group,chain.concat(shell)))){output.push(atom(group,chain.concat(shell)));pending=null;continue}output.push(...split(pending,chain.concat(shell),depth+1));pending=null}
          if(child.matches('h1,h2,h3,h4,label,.block-label,.lesson-kicker')&&child!==children.at(-1)){pending=child;continue}
          output.push(...split(child,chain.concat(shell),depth+1));
        }
        if(pending)output.push(...split(pending,chain.concat(shell),depth+1));
        if(output.length)return output;
      }
      // Long prose is split at a measured character boundary without reducing font size.
      if(!atomic&&!node.querySelector('svg,input,textarea,button,video,iframe')&&node.textContent.trim().length>1){
        const chars=Array.from(node.textContent),out=[];let start=0;
        while(start<chars.length){let lo=1,hi=chars.length-start,best=0;while(lo<=hi){const n=Math.floor((lo+hi)/2),part=node.cloneNode(false);part.textContent=chars.slice(start,start+n).join('');if(test(wrap(part,chain))){best=n;lo=n+1}else hi=n-1}if(!best)break;const part=node.cloneNode(false);part.textContent=chars.slice(start,start+best).join('');if(start&&part.id){part.dataset.flowAnchor=part.id;part.removeAttribute('id')}const fragment=atom(part,chain);fragment.dataset.flowKey=(node.dataset.flowSource||node.dataset.flowKey||'text')+'-char-'+start;out.push(fragment);start+=best}
        if(start===chars.length)return out;
      }
      // Indivisible media only: fit its complete bounds into the available viewport.
      trial=atom(node,chain);content.replaceChildren(trial);let scale=Math.min(1,(H-4)/content.getBoundingClientRect().height,W/Math.max(W,content.scrollWidth));
      const box=document.createElement('div');box.className='flow-atomic-fit';box.dataset.scale=scale.toFixed(3);box.dataset.flowKey=trial.dataset.flowKey;trial.style.transform=`scale(${scale})`;trial.style.transformOrigin='top left';trial.style.width=W+'px';box.style.height=(content.getBoundingClientRect().height*scale)+'px';box.append(trial);return [box];
    };
    const atoms=[];this.source.forEach(n=>{const parts=split(n);if(this.root.dataset.flowSections&&parts[0])parts[0].dataset.flowBreak='true';atoms.push(...parts)});content.replaceChildren();const groups=[];let group=[];
    const queue=atoms.slice();
    while(queue.length){const a=queue.shift();if(a.dataset.flowBreak){if(group.length){groups.push(group);group=[];content.replaceChildren()}delete a.dataset.flowBreak}content.append(a);if(!fits()&&group.length){
      a.remove();
      if(a.children.length>1&&!a.matches('.flow-atomic-fit,.media-placeholder,.preview-model,table,button,a')){
        const pieces=split(a,[],0,true);content.replaceChildren(...group);
        if(pieces.length>1){queue.unshift(...pieces);continue}
      }
      groups.push(group);group=[];content.replaceChildren(a);
    }group.push(a)}if(group.length)groups.push(group);
    this.root.replaceChildren();this.pages=groups.map(g=>{const page=document.createElement('div');page.className='flow-page';const body=document.createElement('div');body.className='flow-content';body.append(...g);page.append(body);this.root.append(page);return page});
    this.pages.forEach(p=>p.querySelectorAll('textarea,input').forEach(el=>{if(Object.hasOwn(this.values,el.id))el.value=this.values[el.id]}));
    let next=anchor?this.pages.findIndex(p=>p.querySelector(`[data-flow-key="${anchor}"]`)):-1;
    if(next<0&&anchor)next=this.pages.findIndex(p=>Array.from(p.querySelectorAll('[data-flow-source]')).some(el=>el.dataset.flowSource===anchor));this.show(next<0?this.index:next);this.version++;this.root.dataset.flowReady=String(this.version);
  }
  show(i){this.index=Math.max(0,Math.min(this.pages.length-1,i===Infinity?this.pages.length-1:i));this.pages.forEach((p,n)=>p.hidden=n!==this.index);this.onChange(this.index,this.pages.length);}
  step(delta){const i=this.index+delta;if(i<0||i>=this.pages.length)return false;this.show(i);return true;}
  goTo(id){const n=this.pages.findIndex(p=>Array.from(p.querySelectorAll('[id],[data-flow-anchor]')).some(e=>e.id===id||e.dataset.flowAnchor===id));if(n>=0)this.show(n);return n>=0;}
}
window.PageFlow=PageFlow;
})();
