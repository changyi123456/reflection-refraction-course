/* All coordinates in the gradient solver use height upward and distance from the eye. */
(function (g) {
  'use strict';
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  function snell(angle, v1, v2) {
    const s = v2 / v1 * Math.sin(rad(angle));
    return Math.abs(s) <= 1 ? deg(Math.asin(s)) : null;
  }
  function rescue(x) {
    const land = Math.hypot(x,30), water = Math.hypot(80-x,20);
    return {land,water,distance:land+water,time:land/6+water/2};
  }
  function fastest() { let lo=0,hi=80; for(let i=0;i<80;i++){let a=(2*lo+hi)/3,b=(lo+2*hi)/3;if(rescue(a).time<rescue(b).time)hi=b;else lo=a;}return (lo+hi)/2; }
  function crossing(ox, depth, ex, eyeHeight, n1=1.333, n2=1) {
    let lo=Math.min(ox,ex),hi=Math.max(ox,ex);
    for(let i=0;i<70;i++){let x=(lo+hi)/2;let f=n1*(x-ox)/Math.hypot(x-ox,depth)-n2*(ex-x)/Math.hypot(ex-x,eyeHeight);if(f>0)hi=x;else lo=x;}
    return (lo+hi)/2;
  }
  function depthImage(depth, view=30, n=1.333) {
    const h=60,airAngle=rad(view),waterAngle=Math.asin(Math.sin(airAngle)/n),ex=depth*Math.tan(waterAngle)+h*Math.tan(airAngle);
    const rays=[ex-2.5,ex+2.5].map(e=>({e,x:crossing(0,depth,e,h,n)}));
    const a=(rays[0].e-rays[0].x)/h,b=(rays[1].e-rays[1].x)/h;
    const y=(rays[1].x-rays[0].x)/(a-b),x=rays[0].x+a*y;
    return {rays,x,y,eyeX:ex,eyeHeight:h};
  }
  function profile(kind,strength=1) {
    if(kind==='sugar')return {name:'糖水',minHeight:0,maxHeight:2.3,n:y=>1.42-0.035*strength*y,dn:y=>-0.035*strength};
    if(kind==='inferior')return {name:'熱路面下蜃景',n:y=>1.00028-0.000055*strength*Math.exp(-y/0.45),dn:y=>0.000055*strength/0.45*Math.exp(-y/0.45)};
    const center=2.0,width=0.28,dn=0.00006*strength;
    return {name:'海面上蜃景',n:y=>1.00025+dn*(1-Math.tanh((y-center)/width))/2,dn:y=>-dn/2/width/(Math.cosh((y-center)/width)**2)};
  }
  function trace(angle,distance,eye,prof,steps=800,collect=false) {
    let y=eye,u=Math.tan(rad(angle)),dx=distance/steps;const path=collect?[[0,y]]:null;
    const acc=(yy,uu)=>prof.dn(yy)/prof.n(yy)*(1+uu*uu);
    for(let i=0;i<steps;i++){
      const k1y=u,k1u=acc(y,u),k2y=u+dx*k1u/2,k2u=acc(y+dx*k1y/2,u+dx*k1u/2),k3y=u+dx*k2u/2,k3u=acc(y+dx*k2y/2,u+dx*k2u/2),k4y=u+dx*k3u,k4u=acc(y+dx*k3y,u+dx*k3u);
      y+=dx*(k1y+2*k2y+2*k3y+k4y)/6;u+=dx*(k1u+2*k2u+2*k3u+k4u)/6;
      if(!Number.isFinite(y)||Math.abs(u)>10)return {y:NaN,u,hitGround:true,path};
      if(prof.minHeight!==undefined&&(y<prof.minHeight||y>prof.maxHeight))return {y:NaN,u,hitGround:true,path};
      if(kindGround(prof)&&y<0)return {y,u,hitGround:true,path};
      if(path)path.push([(i+1)*dx,y]);
    }return {y,u,path,hitGround:false};
  }
  function kindGround(p){return p.name!=='糖水';}
  function findRays(target,distance,eye,prof,range=1,steps=500) {
    let results=[],a=-range,ta=trace(a,distance,eye,prof,steps);
    for(let i=1;i<=400;i++){
      let b=-range+2*range*i/400,tb=trace(b,distance,eye,prof,steps);
      if(!ta.hitGround&&!tb.hitGround&&Number.isFinite(ta.y)&&Number.isFinite(tb.y)&&(ta.y-target)*(tb.y-target)<=0){
        let lo=a,hi=b,flo=ta.y-target;for(let j=0;j<28;j++){let mid=(lo+hi)/2,t=trace(mid,distance,eye,prof,steps);if((t.y-target)*flo>0){lo=mid;flo=t.y-target;}else hi=mid;}
        let angle=(lo+hi)/2;if(!results.some(r=>Math.abs(r.angle-angle)<1e-6))results.push({angle,apparentHeight:eye+distance*Math.tan(rad(angle)),...trace(angle,distance,eye,prof,steps,true)});
      }a=b;ta=tb;
    }return results;
  }
  const api={rad,deg,snell,rescue,fastest,crossing,depthImage,profile,trace,findRays};g.Optics=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
