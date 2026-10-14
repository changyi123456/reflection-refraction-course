/* Finite wavefront packets. Coordinates use downward-positive screen y. */
(function(g){
 'use strict';
 const rad=d=>d*Math.PI/180;
 const SPEED=80,LAMBDA=70,HALF=180,WALL=350;
 function parameters(angle){const a=rad(angle),sin=Math.sin(a),cos=Math.cos(a);return {a,sin,cos,D:Math.max(210,HALF*Math.tan(a)+60),incident:[sin,cos],reflected:[sin,-cos],tangent:[cos,-sin],reflectedTangent:[cos,sin]};}
 function duration(angle,kind='straight'){if(kind==='circle')return (250+2*LAMBDA-40+160)/SPEED;const p=parameters(angle);return (p.D+2*LAMBDA+HALF*Math.tan(p.a)+160)/SPEED;}
 function point(angle,time,index,q){
  const p=parameters(angle),distance=SPEED*time,d=p.D+index*LAMBDA;
  const start=[480-p.sin*d+p.cos*q,WALL-p.cos*d-p.sin*q],hitDistance=d+q*Math.tan(p.a),hit=[480+q/p.cos,WALL];
  if(distance<hitDistance)return {xy:[start[0]+p.sin*distance,start[1]+p.cos*distance],hit,hitTime:hitDistance/SPEED,reflected:false};
  return {xy:[hit[0]+p.sin*(distance-hitDistance),WALL-p.cos*(distance-hitDistance)],hit,hitTime:hitDistance/SPEED,reflected:true};
 }
 function straight(angle,time){
  const p=parameters(angle),waves=[];
  for(let i=0;i<3;i++){
   const qs=Array.from({length:61},(_,j)=>-HALF+2*HALF*j/60),cut=Math.abs(p.sin)>1e-8?(SPEED*time-p.D-i*LAMBDA)/Math.tan(p.a):null;
   if(cut!==null&&cut>-HALF&&cut<HALF)qs.push(cut);qs.sort((a,b)=>a-b);
   const incoming=[],reflected=[];
   for(const q of qs){const x=point(angle,time,i,q);if(Math.abs(time-x.hitTime)<1e-8){incoming.push(x.xy);reflected.push(x.xy);}else(x.reflected?reflected:incoming).push(x.xy);}
   waves.push({incoming,reflected,index:i});
  }
  const before=p.D-HALF*Math.tan(p.a),after=p.D+2*LAMBDA+HALF*Math.tan(p.a),d=SPEED*time;
  return {waves,tracked:point(angle,time,0,0),phase:d<before?'before':d>after?'after':'contact',...p};
 }
 function circle(time){return {source:[410,100],image:[410,600],wall:WALL,radii:[0,1,2].map(i=>40+SPEED*time-i*LAMBDA).filter(r=>r>0),phase:40+SPEED*time<250?'before':40+SPEED*time-2*LAMBDA>250?'after':'contact'};}
 function stageProgress(angle,kind,stage){if(stage===0)return 0;const d=kind==='circle'?250-40+LAMBDA:parameters(angle).D+LAMBDA;return Math.min(100,(d/SPEED+(stage===2?LAMBDA/SPEED+(kind==='circle'?0:HALF*Math.tan(rad(angle))/SPEED)+1.2:0))/duration(angle,kind)*100);}
 const api={SPEED,LAMBDA,HALF,WALL,parameters,duration,point,straight,circle,stageProgress};g.Reflection=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
