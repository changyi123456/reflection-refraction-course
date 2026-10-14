(function(g){
 'use strict';
 const C={ink:'#16302d',blue:'#2b7fc1',green:'#167c78',red:'#e16f50',gray:'#627773',gold:'#b87916'};
 function background(ctx,kind){
  const W=960,H=480;ctx.clearRect(0,0,W,H);ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,W,H);
  function line(a,b,color=C.gray,width=2,dash=[]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();ctx.setLineDash([]);}
  function text(s,x,y,color=C.ink,size=20){ctx.fillStyle=color;ctx.font=size+'px "Noto Sans TC","PingFang TC",sans-serif';ctx.fillText(s,x,y);}
  function point(x,y,label,color=C.red){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,7,0,2*Math.PI);ctx.fill();text(label,x+13,y-12,color);}
  function eye(x,y){ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,19,11,0,0,2*Math.PI);ctx.stroke();point(x,y,'眼睛',C.ink);}
  if(kind==='geometry'){
   const a=25*Math.PI/180,b=Math.asin(.65*Math.sin(a)),A=[250,245],B=[670,245],l1=420*Math.sin(a),l2=420*Math.sin(b);
   ctx.fillStyle='#edf4f1';ctx.fillRect(0,245,W,235);line([20,245],[940,245]);text('第1區',25,40,C.blue);text('第2區',25,455,C.green);
   function family(angle,spacing,origin,top,bottom,color){ctx.save();ctx.beginPath();ctx.rect(20,top,920,bottom-top);ctx.clip();for(let k=-4;k<=4;k++){const n=[Math.sin(angle),Math.cos(angle)],u=[Math.cos(angle),-Math.sin(angle)],p=[origin[0]+k*spacing*n[0],origin[1]+k*spacing*n[1]];line([p[0]-1400*u[0],p[1]-1400*u[1]],[p[0]+1400*u[0],p[1]+1400*u[1]],color,k===0?4:2);}ctx.restore();}
   family(a,l1,A,0,245,C.blue);family(b,l2,B,245,480,C.green);line(A,B,C.gold,4);point(...A,'A');point(...B,'B');
   text('入射波前 AC',410,95,C.blue,19);text('折射波前 DB',530,355,C.green,19);text('AB = L',435,231,C.gold,20);
  }else if(kind==='depth'){
   const model=g.Optics.depthImage(100,45),ex=350+1.5*model.eyeX;ctx.fillStyle='#deedf4';ctx.fillRect(0,170,W,310);line([0,170],[W,170],C.ink);text('空氣',30,40);text('水',30,455,C.blue);point(350,320,'實物');eye(ex,80);
  }else if(kind==='sugar'||kind==='mirage'){
   ctx.fillStyle='#e9f2f5';ctx.fillRect(70,45,560,380);line([70,425],[630,425],C.ink);text(kind==='sugar'?'糖水（側視）':'大氣光路（縱向放大）',70,28);
   const Y=y=>425-380*y/(kind==='sugar'?2.3:6);point(70,Y(1),kind==='sugar'?'物體':'船上標記');eye(630,Y(1));
   if(kind==='mirage'){line([60,Y(.4)],[80,Y(.4)],C.ink,8);line([70,Y(.4)],[70,Y(1.5)],C.ink,3);}
   text('上方折射率較小',705,90,C.green,19);text('下方折射率較大',705,400,C.green,19);line([685,45],[685,425],'#cedbd6');text('先畫光路與所見位置',705,245,C.gray,18);
  }else if(kind==='formula'){
   ctx.strokeStyle='#cedbd6';ctx.lineWidth=1;for(let y=120;y<480;y+=120)line([25,y],[935,y],'#cedbd6');
  }
 }
 function mount(container,record,slot,options={}){
  record.ink=record.ink||{};record.ink[slot]=record.ink[slot]||[];let strokes=record.ink[slot],mode=options.tool||'pen',color=options.color||C.red,draft=null,eraseGesture=null;const history=[],clone=()=>JSON.parse(JSON.stringify(strokes)),remember=before=>{history.push(before);if(history.length>60)history.shift();};
  const base=options.canvas||document.createElement('canvas'),own=!options.canvas;if(own){base.width=960;base.height=480;}
  if(own){base.className='diagram-base';background(base.getContext('2d'),options.kind);container.append(base);}
  else if(base.parentElement!==container)container.append(base);
  const stage=document.createElement('div');stage.className='sketch-stage';base.replaceWith(stage);stage.append(base);
  const overlay=document.createElement('canvas');overlay.width=960;overlay.height=480;overlay.className='drawing-overlay';overlay.setAttribute('aria-label',options.label||'作圖區');stage.append(overlay);const ctx=overlay.getContext('2d');
  const tools=document.createElement('div');tools.className='drawing-tools';tools.setAttribute('aria-label','作圖工具');tools.innerHTML=[['pen','手寫'],['line','實線'],['dash','虛線'],['arrow','箭頭'],['point','標點'],['erase','橡皮擦']].map(([k,v])=>'<button data-tool="'+k+'" '+(k==='erase'?'title="擦除碰到的學生筆劃；題圖不會被擦除" ':'')+'aria-pressed="'+(k===mode)+'">'+v+'</button>').join('')+'<span class="tool-separator"></span><span class="pen-color-label">筆色</span><button data-color="'+C.red+'" aria-label="橘色筆：預測與幾何作圖" title="橘色筆：預測與幾何作圖" aria-pressed="'+(color===C.red)+'" class="ink-color" style="--ink:'+C.red+'">橘</button><button data-color="'+C.green+'" aria-label="綠色筆：修正作圖與推導數學式" title="綠色筆：修正作圖與推導數學式" aria-pressed="'+(color===C.green)+'" class="ink-color" style="--ink:'+C.green+'">綠</button><button data-undo title="復原上一筆或最近一次擦除、清除">復原</button><button data-clear title="清除目前這張圖的學生筆劃；可按復原還原">清除本圖</button>';
  if(options.toolbarHost)options.toolbarHost.append(tools);else stage.after(tools);if(options.locked){tools.hidden=true;overlay.classList.add('locked');}
  function draw(s,override){ctx.strokeStyle=override||s.color;ctx.fillStyle=override||s.color;ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash(s.mode==='dash'?[10,7]:[]);ctx.beginPath();s.points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.setLineDash([]);const a=s.points[0],b=s.points.at(-1);if(s.mode==='point'){ctx.beginPath();ctx.arc(...b,6,0,2*Math.PI);ctx.fill();}if(s.mode==='arrow'&&s.points.length>1){const th=Math.atan2(b[1]-a[1],b[0]-a[0]);ctx.beginPath();ctx.moveTo(b[0]-13*Math.cos(th-.4),b[1]-13*Math.sin(th-.4));ctx.lineTo(...b);ctx.lineTo(b[0]-13*Math.cos(th+.4),b[1]-13*Math.sin(th+.4));ctx.stroke();}}
  function render(){ctx.clearRect(0,0,960,480);(options.underlay||[]).forEach(s=>draw(s,options.underlayColor||C.blue));strokes.forEach(s=>draw(s));if(draft)draw(draft);tools.querySelector('[data-undo]').disabled=!strokes.length&&!history.length;tools.querySelector('[data-clear]').disabled=!strokes.length;}
  function image(){const cv=document.createElement('canvas');cv.width=960;cv.height=480;const q=cv.getContext('2d');q.drawImage(base,0,0,960,480);q.drawImage(overlay,0,0);return cv.toDataURL();}
  function saved(){record.images=record.images||{};record.images[slot]=image();options.onSave?.();}
  const pos=e=>{const r=overlay.getBoundingClientRect();return [Math.max(0,Math.min(960,(e.clientX-r.left)*960/r.width)),Math.max(0,Math.min(480,(e.clientY-r.top)*480/r.height))];};
  function segmentDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/n)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
  function erase(p){const radius=Math.max(10,12*960/overlay.getBoundingClientRect().width);for(let i=strokes.length-1;i>=0;i--){const s=strokes[i],pts=s.points,hit=pts.some((a,j)=>segmentDistance(p,a,pts[Math.min(j+1,pts.length-1)])<=radius);if(hit){strokes.splice(i,1);eraseGesture.changed=true;}}render();}
  function endErase(){if(!eraseGesture)return;if(eraseGesture.changed){remember(eraseGesture.before);saved();}eraseGesture=null;render();}
  overlay.onpointerdown=e=>{if(options.locked)return;options.onStart?.();e.preventDefault();overlay.setPointerCapture(e.pointerId);if(mode==='erase'){eraseGesture={before:clone(),changed:false};erase(pos(e));return;}draft={mode,color,points:[pos(e)]};render();};
  overlay.onpointermove=e=>{if(eraseGesture){erase(pos(e));return;}if(!draft)return;const p=pos(e);if(mode==='pen')draft.points.push(p);else draft.points=[draft.points[0],p];render();};
  overlay.onpointerup=e=>{if(eraseGesture){endErase();return;}if(!draft)return;if(draft.points.length===1)draft.points.push(pos(e));remember(clone());strokes.push(draft);draft=null;render();saved();};
  overlay.onpointercancel=()=>{endErase();draft=null;render();};
  tools.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{options.onStart?.();mode=b.dataset.tool;tools.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  tools.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color;tools.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});tools.querySelector('[data-undo]').onclick=()=>{options.onStart?.();if(history.length)strokes.splice(0,strokes.length,...history.pop());else strokes.pop();render();saved();};tools.querySelector('[data-clear]').onclick=()=>{options.onStart?.();remember(clone());strokes.splice(0);render();saved();};render();
  return {canvas:overlay,base,stage,tools,render,image,hasDrawing:()=>strokes.length>0,snapshot:saved};
 }
 g.DrawingBoard={mount,background};
})(window);
