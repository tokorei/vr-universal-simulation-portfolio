import * as THREE from 'three';

// Original schematic geometry: these spaces illustrate applications, not a
// measured campus, supplied architecture or exact manufacturer equipment.
export function buildCampusGeometry() {
  const positions = [], colors = [], areas = [], features = [], grid = [];
  const white = new THREE.Color('#e3edf2'), grey = new THREE.Color('#7e99a8'), blue = new THREE.Color('#00aeef');
  let seed = 93017, area = 0, feature = 0;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function point(x, y, z, color = white) {
    positions.push(x, y, z); areas.push(area); features.push(feature);
    const strength = .64 + random() * .36;
    colors.push(color.r * strength, color.g * strength, color.b * strength);
  }
  function line(a, b, color = white, step = .22) {
    const n = Math.max(1, Math.ceil(Math.hypot(b[0]-a[0], b[1]-a[1], b[2]-a[2])/step));
    for(let i=0;i<=n;i++){const t=i/n;point(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,color);}
  }
  function quad(a,b,c,d,color=white,step=.3) {
    const u=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/step));
    const v=Math.max(1,Math.ceil(Math.hypot(d[0]-a[0],d[1]-a[1],d[2]-a[2])/step));
    for(let i=0;i<=u;i++)for(let j=0;j<=v;j++){const s=i/u,t=j/v;point(a[0]*(1-s)*(1-t)+b[0]*s*(1-t)+c[0]*s*t+d[0]*(1-s)*t,a[1]*(1-s)*(1-t)+b[1]*s*(1-t)+c[1]*s*t+d[1]*(1-s)*t,a[2]*(1-s)*(1-t)+b[2]*s*(1-t)+c[2]*s*t+d[2]*(1-s)*t,color);}
  }
  function box(x,y,z,w,h,d,color=white,step=.4) {
    for(let a=0;a<=w;a+=step)for(let b=0;b<=h;b+=step){if(random()>.12)point(x+a-w/2,y+b,z-d/2,color);if(random()>.12)point(x+a-w/2,y+b,z+d/2,color);}
    for(let a=0;a<=d;a+=step)for(let b=0;b<=h;b+=step){if(random()>.12)point(x-w/2,y+b,z+a-d/2,color);if(random()>.12)point(x+w/2,y+b,z+a-d/2,color);}
    for(let a=0;a<=w;a+=step)for(let b=0;b<=d;b+=step)if(random()>.2)point(x+a-w/2,y+h,z+b-d/2,color);
  }
  function circle(x,y,z,r,color=blue,plane='xz',step=.07) {
    for(let a=0;a<Math.PI*2;a+=step)point(x+(plane==='yz'?0:Math.cos(a)*r),y+(plane==='xz'?0:(plane==='xy'?Math.sin(a):Math.cos(a))*r),z+(plane==='xy'?0:Math.sin(a)*r),color);
  }
  function ellipsoid(x,y,z,rx,ry,rz,color=white,step=.22) {
    for(let a=0;a<=Math.PI;a+=step)for(let b=0;b<Math.PI*2;b+=step)point(x+Math.sin(a)*Math.cos(b)*rx,y+Math.cos(a)*ry,z+Math.sin(a)*Math.sin(b)*rz,color);
  }
  function tripod(x,y,z,height,color=grey) {
    for(const [dx,dz] of [[-.7,.6],[.7,.6],[0,-.7]])line([x+dx,y,z+dz],[x,y+height,z],color,.15);
  }
  function consoleDesk(x,z) {
    box(x,0,z,2.6,1.25,1.2,grey,.22);box(x,1.3,z-.35,2.3,1.3,.12,blue,.15);
    box(x,1.3,z+.35,1.6,.07,.4,white,.18);
  }
  function trainee(x,z,headset=false) {
    ellipsoid(x,2.35,z,.3,.34,.3,white,.25);
    if(headset)box(x,2.25,z-.28,.7,.34,.2,blue,.1);
    box(x,1.15,z,.65,.85,.4,grey,.2);
    for(const side of [-1,1]){
      line([x+side*.2,1.2,z],[x+side*.3,.15,z+.15],white,.12);
      line([x+side*.32,1.9,z],[x+side*.6,1.5,z-.4],white,.12);
      line([x+side*.6,1.5,z-.4],[x+side*.24,1.55,z-.9],white,.12);
    }
    if(headset)line([x-.3,1.55,z-.9],[x+.3,1.55,z-.9],blue,.08);
  }
  function targetBoard(x,z) {
    box(x,1,z,2,2.8,.08,grey,.22);circle(x,3.15,z+.06,.3,white,'xy');
    for(const dx of [-.4,.4])line([x+dx,2,z+.06],[x+dx,2.8,z+.06],blue,.12);
    line([x-.4,2.8,z+.06],[x+.4,2.8,z+.06],blue,.1);
    line([x,0,z],[x,1,z],white,.16);
  }

  // Shared ground and roads keep orientation legible between focus areas.
  for(let x=-74;x<=70;x+=1.6)for(let z=-54;z<=57;z+=1.6)if(random()>.22)point(x,-.55+Math.sin(x*.16)*Math.cos(z*.12)*.08,z,grey);
  for(let x=-69;x<65;x+=.45)for(const z of [4,12])point(x,-.05,z,grey);
  for(let x=-67;x<64;x+=2.5)line([x,.01,8],[x+1.1,.01,8],blue,.18);
  for(const x of [-29,29])for(let z=-37;z<4;z+=.45)for(const dx of [-3,3])point(x+dx,-.05,z,grey);
  for(let z=12;z<52;z+=.45)for(const x of [11,19])point(x,-.05,z,grey);
  for(let x=-72;x<=72;x+=6)grid.push(x,-.65,-54,x,-.65,60);
  for(let z=-54;z<=60;z+=6)grid.push(-72,-.65,z,72,-.65,z);

  // TRAINING: VR projection bay, live-fire lanes, portable screens and two
  // different scenario structures all sit within the same connected area.
  area=1;box(-35,-.3,-19,60,.3,39,grey,.85);
  feature=1;
  box(-29,0,-27.5,25,6,.18,grey,.4);box(-41.5,0,-20,.18,4,15,grey,.4);
  for(const x of [-37,-29,-21]){
    quad([x-3,1,-27.3],[x+3,1,-27.3],[x+3,4.8,-27.3],[x-3,4.8,-27.3],blue,.22);
    circle(x,2.9,-27.2,.8,white,'xy');circle(x,2.9,-27.18,.4,white,'xy');
    box(x,5.5,-24,.8,.35,.8,white,.16);
    for(let z=-24;z<=-13;z+=.25)point(x,.05,z,blue);
  }
  for(const x of [-33,-25])box(x,0,-20,.12,1.2,14,grey,.35);
  trainee(-29,-18.5,true);trainee(-37,-20,true);consoleDesk(-20,-15);
  for(const [x,z] of [[-40,-26],[-18,-26],[-40,-12],[-18,-12]]){tripod(x,0,z,2.4);box(x,2.4,z,.4,.25,.4,blue,.1);}
  // Live-fire annex: overhead baffles, target carrier rails and backstop.
  feature=3;box(-57,-.25,-12,16,.25,27,grey,.7);
  quad([-65,0,-25],[-49,0,-25],[-49,5.6,-27],[-65,5.6,-27],grey,.3);
  for(const x of [-62,-57,-52]){
    targetBoard(x,-22);
    line([x,4.7,-23],[x,4.7,-1],blue,.17);
    box(x,-.01,-2,3.2,1.15,1.3,white,.25);
    for(let z=-23;z<=0;z+=.3)point(x,.04,z,white);
  }
  for(const x of [-64.5,-59.5,-54.5,-49.5])box(x,0,-12,.12,2.4,25,grey,.4);
  for(const z of [-20,-14,-8])box(-57,5.3,z,16,.3,1.4,white,.35);
  // Portable marksmanship bay: three folding screens, projector and cases.
  feature=4;
  quad([-16,1.2,-11],[-9,1.2,-11],[-9,5.2,-11],[-16,5.2,-11],blue,.2);
  quad([-20,1.2,-8],[-16,1.2,-11],[-16,5.2,-11],[-20,5.2,-8],grey,.22);
  quad([-9,1.2,-11],[-5,1.2,-8],[-5,5.2,-8],[-9,5.2,-11],grey,.22);
  for(const x of [-16,-9]){line([x,0,-11],[x,5.2,-11],white,.16);line([x-1.2,0,-11],[x+1.2,0,-11],white,.15);}
  tripod(-12.5,0,-4,1.8);box(-12.5,1.8,-4,1.4,.45,1.1,white,.16);
  circle(-12.5,2.05,-4.6,.16,blue,'xy');consoleDesk(-6,-4);
  for(const x of [-19,-16]){box(x,0,-3,2.1,.8,1.4,grey,.22);line([x-.45,.85,-3],[x+.45,.85,-3],white,.1);}
  // Fire training tower: open levels, staircase, standpipe and hose equipment.
  feature=6;
  for(const y of [0,3.4,6.8,10.2])box(-46,y,-33,8,.2,8,grey,.4);
  for(const x of [-49.8,-42.2])for(const z of [-36.8,-29.2])box(x,0,z,.22,10.4,.22,white,.25);
  quad([-50,0,-37],[-42,0,-37],[-42,10.4,-37],[-50,10.4,-37],grey,.4);
  for(const y of [0,3.4,6.8]){
    line([-49,y+1.2,-29],[-47,y+1.2,-29],white);line([-45,y+1.2,-29],[-43,y+1.2,-29],white);
    for(let i=0;i<12;i++)box(-51.5,y+i*.28,-36+i*.62,2.3,.12,.65,white,.25);
    line([-52.6,y+1,-36],[-52.6,y+4.1,-29.2],grey,.18);
  }
  line([-41.5,.2,-35],[-41.5,10,-35],blue,.14);
  box(-44,0,-26,2,.9,1.5,white,.2);for(const r of [.6,.8,1])circle(-46,1.2,-26,r,blue,'xy');
  // Police training: open two-room scenario house with a visible route.
  feature=7;box(-13,0,-32,11,.2,10,grey,.5);
  box(-13,0,-37,11,3.8,.16,white,.35);box(-18.5,0,-32,.16,3.8,10,grey,.35);
  box(-13,0,-32,.16,3.2,6,grey,.35);box(-15.3,0,-30,4.4,3.2,.16,grey,.35);
  for(const x of [-16,-10]){box(x,0,-27.1,1.4,3.2,.16,white,.3);targetBoard(x,-35.5);}
  line([-16,.06,-26],[-16,.06,-32],blue,.15);line([-16,.06,-32],[-10,.06,-32],blue,.15);
  trainee(-10,-30);consoleDesk(-5,-33);

  // VEHICLES: tapered body, glazing, grille, doors, wheels and test obstacles.
  area=2;feature=0;box(31,-.3,-18,43,.3,36,grey,.85);
  function vehicle(x,z,angle){
    const transform=(a,y,b)=>[x+a*Math.cos(angle)-b*Math.sin(angle),y,z+a*Math.sin(angle)+b*Math.cos(angle)];
    const stations=[[-4,2.6,1.5],[-2,2.9,1.75],[-1.2,4,1.55],[1.3,4,1.55],[2.5,2.6,1.7],[4,2.2,1.4]];
    for(let i=0;i<stations.length-1;i++){
      const a=stations[i],b=stations[i+1];
      quad(transform(a[0],a[1],-a[2]),transform(b[0],b[1],-b[2]),transform(b[0],b[1],b[2]),transform(a[0],a[1],a[2]),i===3?blue:white,.18);
      for(const side of [-1,1])quad(transform(a[0],.9,side*a[2]),transform(b[0],.9,side*b[2]),transform(b[0],b[1],side*b[2]),transform(a[0],a[1],side*a[2]),grey,.2);
    }
    quad(transform(4,.9,-1.4),transform(4,.9,1.4),transform(4,2.2,1.4),transform(4,2.2,-1.4),grey,.18);
    for(const y of [1.2,1.45,1.7])line(transform(4.05,y,-.8),transform(4.05,y,.8),white,.12);
    for(const side of [-1,1]){
      const zside=side*1.77;
      for(const xx of [-1.6,1.3])line(transform(xx,1.2,zside),transform(xx,3.4,zside),white,.14);
      line(transform(-1.6,1.2,zside),transform(1.3,1.2,zside),white,.14);
      line(transform(-1,2.5,zside),transform(.9,2.5,zside),blue,.1);
      line(transform(.6,2.1,zside),transform(1,2.1,zside),white,.08);
      for(const axle of [-2.7,2.7])for(const depth of [-.18,0,.18])for(const r of [.78,.95,1.1])for(let a=0;a<Math.PI*2;a+=.09)point(...transform(axle+Math.cos(a)*r,1.05+Math.sin(a)*r,side*1.85+depth),r>.98?white:grey);
      for(const axle of [-2.7,2.7])for(let a=0;a<Math.PI*2;a+=.08)point(...transform(axle+Math.cos(a)*.38,1.05+Math.sin(a)*.38,side*2.06),blue);
      for(let a=0;a<Math.PI*2;a+=.12)point(...transform(4.08,1.95+Math.cos(a)*.2,side*1.05+Math.sin(a)*.2),white);
    }
  }
  feature=2;vehicle(30,-15,-.25);vehicle(43,-23,.45);
  for(const z of [-8,-4])for(let x=16;x<=47;x+=.22)point(x,.04,z,white);
  for(const x of [17,22,27,32,37,42,47])box(x,0,-5.8,.4,.65,.4,blue,.2);
  for(let n=0;n<5;n++)box(43,.1,-12+n*1.5,3,.2+n*.18,1,grey,.25);
  // Vehicle simulator: cut-away control bay, cockpit, screens and platform.
  feature=5;
  box(23,0,-35,16,4,.16,grey,.4);box(15,0,-31,.16,4,8,grey,.4);box(23,0,-31,16,.15,8,grey,.7);
  box(23,.2,-30,4,.35,4.4,white,.22);
  for(const x of [21.6,24.4]){line([x,.1,-31.5],[x,.7,-28.6],blue,.15);line([x,.7,-31.5],[x,.1,-28.6],blue,.15);}
  box(23,.7,-28.9,1.4,.35,1.5,grey,.18);box(23,.9,-28.1,1.4,1.6,.28,white,.18);
  box(23,1.4,-30.4,2.6,.5,.55,grey,.18);circle(23,1.9,-30,.55,blue,'xy');
  for(const dx of [-1.8,0,1.8]){box(23+dx,1.8,-32,1.7,1.4,.1,blue,.15);line([23+dx,.7,-32],[23+dx,1.8,-32],white,.15);}
  consoleDesk(28,-30.5);

  // DRONES: detection infrastructure and a separate aerial platform focus.
  area=3;feature=0;box(16,-.3,33,49,.3,34,grey,.85);
  feature=8;
  box(-3,0,29,6,3.5,7,white,.35);box(-3,3.5,29,.65,9,.65,blue,.25);
  box(-3,1.1,32.6,3.8,1.5,.12,blue,.2);line([-5.4,0,32.6],[-5.4,2.8,32.6],white,.16);
  for(let a=0;a<Math.PI*2;a+=.09)for(let r=.3;r<3.2;r+=.25)point(-3+Math.cos(a)*r,12.3+Math.sin(a)*r,29+Math.cos(a)*.25,white);
  for(const r of [5,8,11])for(let a=-.8;a<.8;a+=.04)point(-3+Math.sin(a)*r,12.3+Math.cos(a)*.2,29+Math.cos(a)*r,blue);
  for(const [x,z] of [[-8,40],[1,45]]){
    tripod(x,0,z,3);line([x,3,z],[x,10,z],white,.15);
    for(const dx of [-.6,0,.6])line([x+dx,7,z],[x+dx,10.5,z],blue,.12);
    line([x-1,7,z],[x+1,7,z],grey,.12);
  }
  feature=9;
  for(const [x,z,r] of [[26,31,8],[8,39,5]]){
    circle(x,.06,z,r,blue);circle(x,.06,z,r-.45,grey);
    line([x-2,.08,z-2],[x-2,.08,z+2]);line([x+2,.08,z-2],[x+2,.08,z+2]);line([x-2,.08,z],[x+2,.08,z]);
  }
  ellipsoid(26,7.7,31,1.7,.65,1.2,white,.18);box(26,8.2,31,1.5,.25,.9,grey,.16);
  for(const dx of [-3.6,3.6])for(const dz of [-3.6,3.6]){
    line([26,7.8,31],[26+dx,7.8,31+dz],white,.12);
    line([26,7.6,31],[26+dx,7.6,31+dz],grey,.14);
    circle(26+dx,8,31+dz,1.8,blue,'xz',.065);
    line([26+dx-1.6,8,31+dz],[26+dx+1.6,8,31+dz],white,.12);
    line([26+dx,8,31+dz-1.6],[26+dx,8,31+dz+1.6],grey,.12);
  }
  ellipsoid(26,6.7,30.7,.5,.45,.5,grey,.18);circle(26,6.7,30.15,.28,blue,'xy');
  for(const dx of [-1.2,1.2]){line([26+dx,7.3,30.4],[26+dx,5.9,29.7],white,.12);line([26+dx,7.3,31.6],[26+dx,5.9,32.3],white,.12);line([26+dx,5.9,29.3],[26+dx,5.9,32.7],blue,.12);}
  box(34,0,39,3,1,2.1,grey,.2);line([33.2,1.1,39],[34.8,1.1,39],white,.12);
  ellipsoid(30.5,.6,40,.5,.5,.65,white,.2);circle(30.5,.6,40.7,.28,blue,'xy');
  return { positions, colors, areas, features, grid };
}
