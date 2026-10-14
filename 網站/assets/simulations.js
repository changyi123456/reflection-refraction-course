(function(g){
 'use strict';
 const P=g.Optics,C={ink:'#16302d',teal:'#167c78',coral:'#e16f50',blue:'#2b7fc1',gold:'#b87916',line:'#cedbd6',muted:'#627773'};
 const titles=['波前與前進方向','二維波到達障礙物後的反射','最短距離與最短時間','波前跨越界面','折射率、波速與波長','由兩個直角三角形推導斯乃爾定律','視深與虛像','糖水中的連續折射','海面上蜃景'];
 const descriptions=[
  '波前連接同一時刻相位相同的點；方向箭頭垂直於波前。相鄰波峰波前沿傳播方向的間距為波長。',
  '追蹤三個波前的前進、接觸與反射。方向箭頭共用法線上的入射點；交會處的直角記號顯示方向垂直於波前。',
  '陸地 6 m/s、水中 2 m/s。起點距岸線 30 m，終點距岸線 20 m，沿岸相隔 80 m。',
  '波源頻率固定。改變入射角與波速比，觀察同一波前先後跨界及相鄰波前的間距。',
  '同一頻率的光在三種介質中傳播。動畫的時間與長度皆按比例縮放；不代表實際可見的光波起伏。',
  'A、B 位於界面，AB 為兩個直角三角形共用的斜邊。角度相等由兩組互相垂直的直線判定。',
  '實線是由物體傳向眼睛的光；虛線是入眼光線的反向延長線。兩條相近光線決定局部表觀位置。',
  '糖水折射率向下增加。光路由折射率梯度計算；眼睛依入眼方向判斷表觀位置。',
  '冷空氣在下、暖空氣在上，以平滑折射率剖面計算多條光線。縱向放大顯示；這是模型資料。'
 ];
 const defaults={A01:{kind:'circle'},A02:{kind:'straight',angle:35,mirror:false,progress:0},A03:{x:48},A04:{angle:35,ratio:.5,arrows:true},A05:{f:1,medium:0},A06:{angle:35,ratio:.65,step:0},A07:{depth:100,view:45,step:0},A08:{strength:1,step:0},A09:{strength:1,kind:'superior',step:0}};
 function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
 function math(s){return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'+s+'</math>';}
 const mi=x=>'<mi>'+x+'</mi>',mn=x=>'<mn>'+x+'</mn>',mo=x=>'<mo>'+x+'</mo>',sub=(x,n)=>'<msub>'+mi(x)+mn(n)+'</msub>',frac=(a,b)=>'<mfrac><mrow>'+a+'</mrow><mrow>'+b+'</mrow></mfrac>',sin=n=>'<mi mathvariant="normal">sin</mi>'+sub('θ',n);
 const equations={
  sine:math(mi('sin')+mi('θ')+mo('=')+frac('<mtext>對邊</mtext>','<mtext>斜邊</mtext>')),
  t1:math(sin(1)+mo('=')+frac(mi('BC'),mi('AB'))+mo('=')+frac(sub('λ',1),mi('L'))),
  t2:math(sin(2)+mo('=')+frac(mi('AD'),mi('AB'))+mo('=')+frac(sub('λ',2),mi('L'))),
  common:math(mi('L')+mo('=')+frac(sub('λ',1),sin(1))+mo('=')+frac(sub('λ',2),sin(2))),
  ratio:math(frac(sin(1),sin(2))+mo('=')+frac(sub('λ',1),sub('λ',2))+mo('=')+frac(sub('v',1),sub('v',2))),
  index:math(mi('n')+mo('=')+frac(mi('c'),mi('v'))),
  snell:math(sub('n',1)+sin(1)+mo('=')+sub('n',2)+sin(2)),
  wave:math(mi('v')+mo('=')+mi('f')+mi('λ'))
 };
 function mount(host,id,options={}){
  const s={...defaults[id],...(id==='A09'&&options.profileKind?{kind:options.profileKind}:{})}, num=Number(id.slice(1));let t=0,playing=num<=5&&num!==2&&!matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,disposed=false,frame,dirty=true;
  host.innerHTML='';host.classList.add('simulation');host.dataset.sim=id;
  const heading=el('div','sim-heading');heading.append(el('span','sim-id',id),el('h3','',titles[num-1]));host.append(heading);
  const desc=el('p','sim-desc',descriptions[num-1]);host.append(desc);
  const canvas=el('canvas','sim-canvas');canvas.width=960;canvas.height=480;canvas.setAttribute('aria-label',titles[num-1]+'示意圖');host.append(canvas);
  const ctr=el('div','sim-controls'), readout=el('div','sim-readout'), explanation=el('div','sim-explanation');host.append(ctr,readout,explanation);
  const ctx=canvas.getContext('2d');
  function button(label,fn,cls=''){const b=el('button',cls,label);b.type='button';b.onclick=()=>{fn();if(options.onChange)options.onChange({id,action:label,state:{...s}});};ctr.append(b);return b;}
  const play=button(playing?'暫停':num>=6?'逐步播放':'播放',()=>{playing=!playing;if(playing&&num>=6){s.step=0;t=0;}if(playing&&num===2&&s.progress>=100)s.progress=0;play.textContent=playing?'暫停':num>=6?'逐步播放':'播放';dirty=true;});
  button('重設',()=>{Object.assign(s,defaults[id]);if(id==='A09'&&options.profileKind)s.kind=options.profileKind;t=0;playing=false;play.textContent=num>=6?'逐步播放':'播放';controlsUpdate();dirty=true;});
  const fields=[];
  function slider(label,key,min,max,step,unit=''){const box=el('label','control');box.dataset.control=key;const name=el('span','',label),out=el('output');const input=el('input');input.type='range';input.min=min;input.max=max;input.step=step;input.value=s[key];input.setAttribute('aria-label',label);input.oninput=()=>{s[key]=+input.value;out.textContent=input.value+unit;dirty=true;t=0;if(id==='A02'){playing=false;play.textContent='播放';if(key==='angle')s.progress=0;controlsUpdate();}if(options.onChange)options.onChange({id,action:label,state:{...s}});};out.textContent=input.value+unit;box.append(name,input,out);ctr.append(box);fields.push(()=>{input.value=s[key];out.textContent=(key==='progress'?Math.round(s[key]):s[key])+unit;});return input;}
  function select(label,key,opts){const box=el('label','control'),n=el('span','',label),input=el('select');box.dataset.control=key;input.setAttribute('aria-label',label);opts.forEach(([val,name])=>{const o=el('option','',name);o.value=val;input.append(o);});input.value=s[key];input.onchange=()=>{s[key]=input.value;dirty=true;t=0;if(id==='A02'){s.progress=0;playing=false;play.textContent='播放';controlsUpdate();}if(options.onChange)options.onChange({id,action:label,state:{...s}});};box.append(n,input);ctr.append(box);fields.push(()=>input.value=s[key]);}
  function check(label,key){const l=el('label','check'),i=el('input');i.type='checkbox';i.checked=s[key];i.onchange=()=>{s[key]=i.checked;dirty=true;if(options.onChange)options.onChange({id,action:label,state:{...s}});};l.append(i,document.createTextNode(label));ctr.append(l);fields.push(()=>i.checked=s[key]);}
  function controlsUpdate(){fields.forEach(fn=>fn());if(id==='A02'){const angle=ctr.querySelector('[data-control="angle"]');if(angle)angle.hidden=s.kind!=='straight';const mirror=ctr.querySelector('.check');if(mirror)mirror.hidden=s.kind!=='circle';}}
  if(id==='A01')select('波的種類','kind',[['circle','點波源的圓形波'],['straight','直線波']]);
  if(id==='A02'){select('波前形狀','kind',[['straight','直線波'],['circle','圓形波']]);slider('入射角','angle',0,60,1,'°');slider('時間進度','progress',0,100,1,'%');check('顯示鏡像波源','mirror');}
  if(id==='A03'){slider('入水位置 x','x',0,80,.1,' m');[['A：直線',48],['B：範例',70],['C：範例',80],['連續路徑中最快',P.fastest()]].forEach(([n,x])=>button(n,()=>{s.x=x;controlsUpdate();t=0;dirty=true;}));}
  if(id==='A04'){slider('入射角','angle',0,75,1,'°');slider('波速比 v₂ / v₁','ratio',.4,1.5,.05);check('顯示方向箭頭','arrows');[['快 → 慢',.5,35],['慢 → 快',1.25,35],['垂直入射',.5,0]].forEach(([n,r,a])=>button(n,()=>{s.ratio=r;s.angle=a;controlsUpdate();dirty=true;t=0;}));}
  if(id==='A05')select('強調介質','medium',[['0','空氣'],['1','水'],['2','玻璃']]);
  if(id==='A06'){slider('入射角','angle',10,65,1,'°');button('上一步',()=>{s.step=Math.max(0,s.step-1);dirty=true;});button('下一步',()=>{s.step=Math.min(6,s.step+1);dirty=true;});}
  if(id==='A07'){slider('實深','depth',40,160,1,' cm');slider('入眼方向與鉛直的夾角','view',0,55,1,'°');['實物','實際光路','反向延長線','虛像'].forEach((n,i)=>button(n,()=>{s.step=i;dirty=true;}));}
  if(id==='A08'){slider('梯度強度','strength',0,1.5,.1);button('均勻糖水',()=>{s.strength=0;controlsUpdate();dirty=true;});button('向下 n 增加',()=>{s.strength=1;controlsUpdate();dirty=true;});}
  if(id==='A09'){slider('梯度強度','strength',0,1.5,.1);select('大氣條件','kind',[['superior','冷海面：上蜃景'],['inferior','熱路面：下蜃景（補充）']]);}
  if(id==='A08'||id==='A09'){['實物與眼睛','光路','入眼方向','眼睛所見'].forEach((n,i)=>button(n,()=>{s.step=i;dirty=true;}));}
  function line(x1,y1,x2,y2,color=C.ink,width=2,dash=[]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);}
  function text(str,x,y,color=C.ink,size=19,align='left'){ctx.fillStyle=color;ctx.font=size+'px "Noto Sans TC","PingFang TC",sans-serif';ctx.textAlign=align;ctx.fillText(str,x,y);ctx.textAlign='left';}
  function dot(x,y,color=C.coral,r=6){ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();}
  function arrow(x1,y1,x2,y2,color=C.coral){line(x1,y1,x2,y2,color,3);const a=Math.atan2(y2-y1,x2-x1);line(x2,y2,x2-12*Math.cos(a-.4),y2-12*Math.sin(a-.4),color,3);line(x2,y2,x2-12*Math.cos(a+.4),y2-12*Math.sin(a+.4),color,3);}
  function arc(x,y,r,a,b,color,label){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,a,b);ctx.stroke();if(label)text(label,x+(r+22)*Math.cos((a+b)/2),y+(r+22)*Math.sin((a+b)/2),color,18,'center');}
  function clip(rect,fn){ctx.save();ctx.beginPath();ctx.rect(...rect);ctx.clip();fn();ctx.restore();}
  function fronts(theta,lambda,phase,rect,color,originY=240,dir=1){const sx=Math.sin(theta),sy=dir*Math.cos(theta);clip(rect,()=>{for(let q=-30;q<35;q++){const dist=(q+phase)*lambda,px=480+dist*sx,py=originY+dist*sy;line(px-1800*sy,py+1800*sx,px+1800*sy,py-1800*sx,color,2.5);}});}
  function eye(x,y){ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,19,11,0,0,Math.PI*2);ctx.stroke();dot(x,y,C.ink,5);text('眼睛',x,y-20,C.ink,17,'center');}
  function base(){ctx.clearRect(0,0,960,480);ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,960,480);}
  function perpendicularAt(pt,dir,tangent){const z=12;line(pt[0]+z*dir[0],pt[1]+z*dir[1],pt[0]+z*(dir[0]+tangent[0]),pt[1]+z*(dir[1]+tangent[1]),C.ink,1.5);line(pt[0]+z*(dir[0]+tangent[0]),pt[1]+z*(dir[1]+tangent[1]),pt[0]+z*tangent[0],pt[1]+z*tangent[1],C.ink,1.5);dot(...pt,C.gold,4);}
  function normalMarker(pt,dir,tangent,color=C.coral){arrow(pt[0],pt[1],pt[0]+55*dir[0],pt[1]+55*dir[1],color);perpendicularAt(pt,dir,tangent);}
  function reflectionGuide(incident,reflected,angle,arrived){const I=[480,350],L=260;line(I[0],65,...I,C.muted,1.5,[6,6]);arrow(I[0]-L*incident[0],I[1]-L*incident[1],...I,C.blue);if(arrived)arrow(...I,I[0]+L*reflected[0],I[1]+L*reflected[1],C.coral);arc(...I,66,-Math.PI/2-angle,-Math.PI/2,C.blue,'θᵢ');if(arrived)arc(...I,88,-Math.PI/2,-Math.PI/2+angle,C.coral,'θᵣ');text('法線',494,84,C.muted,17);}
  function poly(points,color){if(points.length<2)return;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
  function midpoint(points){return points[Math.floor(points.length/2)];}
  let cacheKey='',cache;
  function draw(){base();let info='',html='';if(id==='A09'){const name=s.kind==='inferior'?'熱路面下蜃景（選讀）':'海面上蜃景';heading.querySelector('h3').textContent=name;canvas.setAttribute('aria-label',name+'示意圖');desc.textContent=s.kind==='inferior'?'近路面熱空氣的折射率較小，上方冷空氣的折射率較大。以平滑折射率剖面計算多條光路。':descriptions[8];}
   if(id==='A01'){
    const phase=(t*.6)%1;
    if(s.kind==='circle'){dot(480,240);text('點波源 S',492,231);for(let i=0;i<8;i++){let r=(i+phase)*42;ctx.strokeStyle=C.teal;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(480,240,r,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,960,55);const r=(3+phase)*42;for(const a of [-Math.PI*.75,-Math.PI*.2,Math.PI*.25,Math.PI*.8]){const d=[Math.cos(a),Math.sin(a)],pt=[480+r*d[0],240+r*d[1]];normalMarker(pt,d,[-d[1],d[0]]);}line(480+r,240,480+r+42,240,C.gold,3);ctx.fillStyle='#fffdf8';ctx.fillRect(480+r-25,252,94,27);text('波長 λ',480+r+21,274,C.gold,18,'center');text('前進方向沿半徑，與圓弧的切線垂直',30,35,C.ink,19);}
    else{line(45,85,45,365,C.ink,7);text('直線形起波器',25,45,C.ink,18);for(let i=0;i<12;i++){const x=115+(i+phase)*66;line(x,80,x,365,C.teal,3);if(i===3||i===7)normalMarker([x,220],[1,0],[0,-1]);}const x=115+(3+phase)*66;line(x,400,x+66,400,C.gold,3);text('波長 λ',x+33,435,C.gold,18,'center');}
    info='綠線：波前　橘色箭頭：前進方向　小方角：90°。播放時，方向與波前始終垂直。';
   }
   if(id==='A02'){
    ctx.fillStyle='#edf4f1';ctx.fillRect(0,350,960,130);line(0,350,960,350,C.ink,5);text('固定平面障礙物',700,390);const a=P.rad(s.angle),x=480;
    const seconds=s.progress/100*Reflection.duration(s.angle,s.kind);let phase;
    if(s.kind==='straight'){
     const packet=Reflection.straight(s.angle,seconds);phase=packet.phase;
     clip([0,0,960,350],()=>{packet.waves.forEach(w=>{poly(w.incoming,C.blue);poly(w.reflected,C.coral);});});
     reflectionGuide(packet.incident,packet.reflected,a,packet.tracked.reflected);
     const crossing=packet.waves.map(w=>Reflection.point(s.angle,seconds,w.index,0)),incoming=crossing.find(p=>!p.reflected&&Math.hypot(p.xy[0]-480,p.xy[1]-350)>24&&Math.hypot(p.xy[0]-480,p.xy[1]-350)<245),reflected=crossing.find(p=>p.reflected&&Math.hypot(p.xy[0]-480,p.xy[1]-350)>24&&Math.hypot(p.xy[0]-480,p.xy[1]-350)<245);
     if(incoming)perpendicularAt(incoming.xy,packet.incident,packet.tangent);if(reflected)perpendicularAt(reflected.xy,packet.reflected,packet.reflectedTangent);
    }else{
     const packet=Reflection.circle(seconds);phase=packet.phase;
     clip([0,0,960,350],()=>{for(const r of packet.radii){ctx.strokeStyle=C.blue;ctx.lineWidth=3;ctx.beginPath();ctx.arc(...packet.source,r,0,2*Math.PI);ctx.stroke();if(r>=250){ctx.strokeStyle=C.coral;ctx.beginPath();ctx.arc(...packet.image,r,0,2*Math.PI);ctx.stroke();}}
     });
     const distance=Math.hypot(70,250),incoming=[70/distance,250/distance],reflected=[70/distance,-250/distance];reflectionGuide(incoming,reflected,Math.atan2(70,250),packet.radii[0]>=distance);
     const blueR=packet.radii.find(r=>r<distance-24),redR=packet.radii.find(r=>r>distance+24&&r<distance+245);if(blueR)perpendicularAt([410+blueR*incoming[0],100+blueR*incoming[1]],incoming,[incoming[1],-incoming[0]]);if(redR)perpendicularAt([480+(redR-distance)*reflected[0],350+(redR-distance)*reflected[1]],reflected,[-reflected[1],reflected[0]]);
     dot(410,100,C.blue);text('點波源 S',426,95,C.blue,18);if(s.mirror){line(410,100,410,465,C.muted,1,[5,5]);text('鏡像波源在障礙物後方',485,438,C.coral,17);}
    }
    host.dataset.phase=phase;text('藍：入射波前',30,28,C.blue,18);text('橘：反射波前',730,28,C.coral,18);text('法線兩側箭頭：入射、反射方向；方角表示與波前垂直',30,454,C.ink,18);
    info=({before:'① 波前正在前進，尚未到達障礙物。',contact:'② 波前接觸障礙物後，逐段形成反射波前。',after:'③ 反射波前離開障礙物，繼續向外前進。'}[phase])+(s.kind==='straight'?' 入射角 = 反射角 = '+s.angle+'°。':' 各處按局部方向量角。');
    if(options.onFrame)options.onFrame({id,state:{...s},phase});
   }
   if(id==='A03'){
    const X=x=>170+7*x,Y=y=>260-5*y,r=P.rescue(s.x),q=P.fastest();ctx.fillStyle='#e8f0db';ctx.fillRect(0,0,960,260);ctx.fillStyle='#deedf4';ctx.fillRect(0,260,960,220);line(0,260,960,260,C.ink);text('陸地：6 m/s',50,60);text('水中：2 m/s',50,450,C.blue);arrow(X(0),Y(30),X(s.x),260,C.teal);arrow(X(s.x),260,X(80),Y(-20),C.blue);dot(X(0),Y(30));dot(X(80),Y(-20));text('起點',X(0)-15,Y(30)-20);text('目標',X(80),Y(-20)+27);text('入水位置 x = '+s.x.toFixed(1)+' m',X(s.x)-100,245);let tt=(t*3)%r.time,xx,yy;if(tt<r.land/6){let k=tt/(r.land/6);xx=X(s.x*k);yy=Y(30*(1-k));}else{let k=(tt-r.land/6)/(r.water/2);xx=X(s.x+(80-s.x)*k);yy=Y(-20*k);}dot(xx,yy,C.gold,9);
    info='陸地 '+r.land.toFixed(2)+' m；水中 '+r.water.toFixed(2)+' m；總距離 '+r.distance.toFixed(2)+' m；總時間 '+r.time.toFixed(2)+' s。';html='<p>目前計時 '+tt.toFixed(1)+' s。連續調整下最快入水位置約 '+q.toFixed(1)+' m；範例 B 只是在 A、B、C 中最快。</p>';
   }
   if(id==='A04'){
    const a=P.rad(s.angle),r=P.snell(s.angle,1,s.ratio),reveal=options.conceal!==true;host.dataset.revealed=String(reveal);ctx.fillStyle='#edf4f1';ctx.fillRect(0,240,960,240);line(0,240,960,240,C.ink);fronts(a,62,t*.55,[0,0,960,240],C.blue);if(reveal&&r!==null)fronts(P.rad(r),62*s.ratio,t*.55,[0,240,960,240],C.teal);line(480,30,480,455,C.muted,2,[7,7]);text('第1區：v₁',35,35,C.blue);text('第2區：v₂',35,455,C.teal);text('法線',492,35);
    arc(480,240,62,-Math.PI/2-a,-Math.PI/2,C.blue,s.angle+'°');if(reveal&&r!==null)arc(480,240,65,Math.PI/2-P.rad(r),Math.PI/2,C.teal,r.toFixed(1)+'°');if(s.arrows){arrow(480-120*Math.sin(a),240-120*Math.cos(a),480,240,C.blue);if(reveal&&r!==null)arrow(480,240,480+145*Math.sin(P.rad(r)),240+145*Math.cos(P.rad(r)),C.teal);}
    info=r===null?'此入射角與波速比不產生向第2區傳播的折射波，已超出本節模型範圍；請降低入射角或波速比。':'θ₁ = '+s.angle+'°；θ₂ = '+r.toFixed(1)+'°；λ₂ / λ₁ = '+s.ratio.toFixed(2)+'；f₂ = f₁。';html='<p>'+ (s.angle===0?'波前平行界面，各部分同時跨界；波速與波長改變，方向不偏折。':'斜入射時，波前各部分先後進入第2區。第2區波速不同，波前方向隨之改變。')+'</p><p>波前為同相位線；色彩不代表振幅或能量。此圖呈現週期波到達界面後的穩定狀態。</p>';
    if(!reveal){info='只顯示入射波前；請畫出第2區的波前與前進方向。';html='';}
   }
   if(id==='A05'){
    const ns=[1,1.333,1.5],names=['空氣（約 1）','水（約 1.33）','玻璃（此例 1.50）'];ns.forEach((n,i)=>{const y=50+i*140;ctx.fillStyle=i%2?'#edf4f1':'#f7f5ef';ctx.fillRect(0,y-15,960,130);if(+s.medium===i){ctx.strokeStyle=C.gold;ctx.lineWidth=3;ctx.strokeRect(4,y-12,952,124);}text(names[i],25,y+15);text('v / c = '+(1/n).toFixed(3),25,y+48,C.muted,17);const lam=96/n;clip([250,y-15,680,115],()=>{for(let k=-2;k<14;k++){let x=250+(k+t*.6)*lam;line(x,y,x,y+72,[C.coral,C.teal,C.blue][i],3);}});arrow(280,y+88,420,y+88,[C.coral,C.teal,C.blue][i]);});info='頻率由光源決定；本例三區頻率相同。n 越大，v 越小，同頻率下 λ 越短。';html=equations.index+equations.wave;
   }
   if(id==='A06'){
    const a=P.rad(s.angle),b=P.rad(P.snell(s.angle,1,s.ratio)),A=[250,245],B=[670,245],L=420,Cp=[250+L*Math.cos(a)**2,245-L*Math.sin(a)*Math.cos(a)],D=[250+L*Math.sin(b)**2,245+L*Math.sin(b)*Math.cos(b)];ctx.fillStyle='#edf4f1';ctx.fillRect(0,245,960,235);line(20,245,940,245,C.muted,2);text('第1區',35,55,C.blue);text('第2區',35,440,C.teal);dot(...A);dot(...B);text('A',228,239);text('B',682,239);line(...A,...B,C.gold,5);text('共同斜邊 AB = L',460,230,C.gold,18,'center');
    line(...A,...Cp,C.blue,4);text('入射波前 AC',(A[0]+Cp[0])/2-70*Math.sin(a),(A[1]+Cp[1])/2-70*Math.cos(a),C.blue,17,'center');if(s.step>=1){line(...B,...Cp,C.coral,4);text('BC = λ₁',(B[0]+Cp[0])/2+80*Math.cos(a),(B[1]+Cp[1])/2-80*Math.sin(a),C.coral,20,'center');right(Cp,A,B);arc(...A,70,-a,0,C.blue,'θ₁');line(A[0],A[1],A[0],55,C.muted,1,[5,5]);arrow(A[0]-80*Math.sin(a),A[1]-80*Math.cos(a),...A,C.blue);}
    if(s.step>=2){line(...D,...B,C.teal,4);line(...A,...D,C.coral,4);right(D,A,B);text('D',D[0]+12,D[1]+26);text('折射波前 DB',620,330,C.teal,17);text('AD = λ₂',D[0]-85,Math.min(462,D[1]+40),C.coral,20);arc(...B,68,Math.PI-b,Math.PI,C.teal,'θ₂');}
    text('C',Cp[0]-25,Cp[1]-12);info='步驟 '+(s.step+1)+' / 7　θ₁ = '+s.angle+'°；θ₂ = '+P.snell(s.angle,1,s.ratio).toFixed(1)+'°。';
    const explanations=[['同一波前 AC 中，A 先到達界面。B 是下一個到達界面的點；A、B 沿界面相距 L。',''],['回顧正弦比。△ABC 在 C 處為直角：對 θ₁ 而言，對邊為 BC，斜邊為 AB。',equations.sine+equations.t1],['經過一個週期，B 到達界面，A 在第2區傳出的次波半徑為 AD。△ADB 在 D 處為直角：對 θ₂ 的對邊為 AD。',equations.t2],['兩個三角形共用同一斜邊 L，因此取比值可消去 L。',equations.t1+equations.t2+equations.ratio],['波跨界時頻率不變。由 v = fλ，波長比等於波速比。',equations.wave+equations.ratio],['代入折射率 n = c/v，波速比 v₁/v₂ 等於 n₂/n₁。',equations.index],['移項得到完整斯乃爾定律。角度由法線量起；垂直入射直接用本式，避免將 0 除以 0。',equations.snell]];
    html='<p>'+explanations[s.step][0]+'</p>'+explanations[s.step][1];
   }
   if(id==='A07'){
    const image=P.depthImage(s.depth,s.view),scale=1.5,X=x=>350+x*scale,Y=y=>170-y*scale;ctx.fillStyle='#deedf4';ctx.fillRect(0,170,960,310);line(0,170,960,170,C.ink);text('空氣 n ≈ 1',30,45);text('水 n ≈ 1.33',30,455,C.blue);dot(X(0),Y(-s.depth),C.coral,9);text('實物',X(0)-45,Y(-s.depth)+27);eye(X(image.eyeX),Y(60));
    if(s.step>=1)image.rays.forEach((r,i)=>{line(X(0),Y(-s.depth),X(r.x),Y(0),i?C.blue:C.teal,3);arrow(X(r.x),Y(0),X(r.e),Y(60),i?C.blue:C.teal);line(X(r.x),Y(30),X(r.x),Y(-30),C.muted,1,[5,5]);});
    if(s.step>=2)image.rays.forEach((r,i)=>line(X(r.x),Y(0),X(image.x),Y(image.y),i?C.blue:C.teal,2,[7,6]));if(s.step>=3){dot(X(image.x),Y(image.y),C.gold,8);text('局部虛像',X(image.x)+16,Y(image.y),C.gold);}
    info=s.step<3?'依序顯示：實物 → 實際光路 → 反向延長線 → 虛像。':'實深 '+s.depth+' cm；此觀察方向的局部視深約 '+(-image.y).toFixed(1)+' cm。';html='<p>接近鉛直、小角度時，視深約為實深的 0.75 倍。斜看時須依實際光路求局部表觀位置，不能套用固定比例。</p>';
   }
   if(id==='A08'||id==='A09'){
    const sugar=id==='A08',kind=sugar?'sugar':s.kind,prof=P.profile(kind,s.strength),dist=sugar?6:400,eyeh=1,target=sugar?1:1;
    const key=[id,kind,s.strength].join('|');if(key!==cacheKey){const rays=P.findRays(target,dist,eyeh,prof,sugar?30:1,600);const map=[];for(let i=0;i<=320;i++){let angle=(sugar?-12:-.3)+(sugar?32:1.1)*i/320;let tr=P.trace(angle,dist,eyeh,prof,550);map.push({angle,y:tr.hitGround?NaN:tr.y});}cache={rays,map,prof};cacheKey=key;}
    const xmin=70,xmax=630,ymin=45,ymax=425,yr=sugar?2.3:6,X=x=>xmin+(xmax-xmin)*(1-x/dist),Y=y=>ymax-(ymax-ymin)*y/yr;ctx.fillStyle='#e9f2f5';ctx.fillRect(xmin,ymin,xmax-xmin,ymax-ymin);line(xmin,ymax,xmax,ymax,C.ink);text(sugar?'糖水（側視）':'大氣光路（縱向放大）',xmin,26,C.ink,18);text(sugar?'物體':'船上標記',X(dist),Y(target)-20,C.ink,17,'center');dot(X(dist),Y(target),C.coral,8);eye(X(0),Y(eyeh));
    if(!sugar){line(X(dist)-10,Y(.4),X(dist)+10,Y(.4),C.ink,8);line(X(dist),Y(.4),X(dist),Y(1.5),C.ink,3);text(kind==='superior'?'近海面較冷、n 較大':'近路面較熱、n 較小',xmin+10,ymax-12,C.ink,17);}
    if(s.step>=1)cache.rays.forEach((r,i)=>{ctx.beginPath();r.path.forEach(([x,y],j)=>j?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));ctx.strokeStyle=[C.teal,C.coral,C.blue][i%3];ctx.lineWidth=2.5;ctx.stroke();if(s.step>=2){line(X(0),Y(eyeh),X(dist),Y(r.apparentHeight),[C.teal,C.coral,C.blue][i%3],2,[7,5]);dot(X(dist),Y(r.apparentHeight),[C.teal,C.coral,C.blue][i%3],6);if(Math.abs(Y(r.apparentHeight)-Y(target))>20)text('表觀位置',X(dist)+15,Y(r.apparentHeight)-8,[C.teal,C.coral,C.blue][i%3],16);}});
    const left=710,top=60,bottom=425;line(685,35,685,445,C.line);text('折射率剖面',left,27,C.ink,18);const nlo=sugar?1.33:1.00020,nhi=sugar?1.43:1.00035;ctx.beginPath();for(let j=0;j<=180;j++){let y=yr*j/180,n=prof.n(y),x=left+(n-nlo)/(nhi-nlo)*180;j?ctx.lineTo(x,Y(y)):ctx.moveTo(x,Y(y));}ctx.strokeStyle=C.teal;ctx.lineWidth=2.5;ctx.stroke();text('n 較小 ← → n 較大',710,458,C.muted,16);text('高',690,64,C.muted,17);text('低',690,422,C.muted,17);
    if(s.step>=3){html='<div class="pov"><canvas width="640" height="180" aria-label="依實際入眼方向計算的眼睛所見"></canvas><p>眼睛所見：依多條光線的入眼角度呈現物體上下色帶，非手動移動影像。橘色為物體下部，藍色為上部。</p></div>';}
    info=(sugar?'實物距眼睛 6 m（模型尺度）；':'實物距眼睛 400 m；眼高 1 m（模型設定）；')+'由標記到眼睛的有效光路 '+cache.rays.length+' 條。梯度為零時回到直線光路。';
    if(!sugar)html+='<p>本剖面具有非均勻梯度，可出現多條入眼光路。完整影像須比較上下各點的光路；單一光線不足以判定倒像。均勻梯度也不保證形成倒像。</p>';
   }
   readout.textContent=info; if(explanation.dataset.content!==html){explanation.innerHTML=html;explanation.dataset.content=html;}
   if((id==='A08'||id==='A09')&&s.step>=3)drawPOV();
  }
  function right(V,U,W){const a=Math.atan2(U[1]-V[1],U[0]-V[0]),b=Math.atan2(W[1]-V[1],W[0]-V[0]),z=15;line(V[0]+z*Math.cos(a),V[1]+z*Math.sin(a),V[0]+z*(Math.cos(a)+Math.cos(b)),V[1]+z*(Math.sin(a)+Math.sin(b)),C.ink,2);line(V[0]+z*(Math.cos(a)+Math.cos(b)),V[1]+z*(Math.sin(a)+Math.sin(b)),V[0]+z*Math.cos(b),V[1]+z*Math.sin(b),C.ink,2);}
  function drawPOV(){const cv=explanation.querySelector('canvas'),q=cv.getContext('2d');q.fillStyle='#e9f2f5';q.fillRect(0,0,640,180);const hmin=id==='A08'?.55:.4,hmax=id==='A08'?1.45:1.5;
    cache.map.forEach((a,i)=>{if(a.y>=hmin&&a.y<=hmax){const y=175-170*i/(cache.map.length-1);q.fillStyle=a.y<(hmin+hmax)/2?C.coral:C.blue;q.fillRect(235,y,170,2.2);}});
    q.font='17px "PingFang TC",sans-serif';q.fillStyle=C.ink;q.fillText('高入眼方向 ↑',20,25);q.fillText('低入眼方向 ↓',20,165);q.fillText('由模型光路計算',425,25);
  }
  function loop(now){if(disposed)return;let dt=last?Math.min((now-last)/1000,.05):0;last=now;if(playing)t+=dt;if(playing&&num===2){s.progress=Math.min(100,s.progress+100*dt/Reflection.duration(s.angle,s.kind));controlsUpdate();dirty=true;if(s.progress>=100){playing=false;play.textContent='播放';if(options.onChange)options.onChange({id,action:'播放完成',state:{...s}});}}if(playing&&num>=6){const st=Math.min(num===6?6:3,Math.floor(t/4));if(s.step!==st){s.step=st;dirty=true;}if(t>((num===6?6:3)+1)*4){playing=false;play.textContent='逐步播放';}}if(dirty||playing&&num<=5){draw();dirty=false;}frame=requestAnimationFrame(loop);}
  controlsUpdate();draw();frame=requestAnimationFrame(loop);
  return {id,state:s,canvas,render:draw,pause(){playing=false;play.textContent=num>=6?'逐步播放':'播放';},dispose(){disposed=true;cancelAnimationFrame(frame);},set(values){if(id==='A09'&&options.profileKind)values={...values,kind:options.profileKind};if(id==='A02'&&values.kind==='ray')values={...values,kind:'straight'};if(id==='A02'&&values.angle!==undefined)values={...values,angle:Math.max(0,Math.min(60,values.angle))};Object.assign(s,values);controlsUpdate();dirty=true;draw();}};
 }
 g.Simulations={mount,titles,equations};
})(window);
