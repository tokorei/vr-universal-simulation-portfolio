import * as THREE from 'three';
import { buildCampusGeometry } from './campus-geometry.js';
import { dampVector3, smoothProgress } from './camera-motion.js';

// A connected illustrative campus, not a measured site or a manufacturer model.
export function startScene(initiallyPaused = false) {
  const wrap = document.getElementById('scene-wrap');
  const shell = document.getElementById('campus-shell');
  const home = document.getElementById('campus-home');
  const host = document.getElementById('portfolio-scene');
  const portfolio = document.getElementById('products');
  const articles = [...document.querySelectorAll('.product-article')];
  const label = document.getElementById('campus-zone-label');
  const overviewButton = document.getElementById('campus-view-toggle');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 801 ? 1.25 : 1.6));
  renderer.setClearColor(0, 0);
  wrap.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 600);
  const world = new THREE.Group();
  scene.add(world);
  const campus = buildCampusGeometry();
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(campus.grid, 3));
  world.add(new THREE.LineSegments(gridGeometry, new THREE.LineBasicMaterial({ color: '#547386', transparent: true, opacity: .18 })));
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(campus.positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(campus.colors,3));
  geometry.setAttribute('area',new THREE.Float32BufferAttribute(campus.areas,1));
  geometry.setAttribute('feature',new THREE.Float32BufferAttribute(campus.features,1));
  const material=new THREE.ShaderMaterial({
    uniforms:{scan:{value:-70},pixelRatio:{value:renderer.getPixelRatio()},focusArea:{value:0},fromFeature:{value:1},toFeature:{value:1},focusMix:{value:0},focusStrength:{value:0}},
    vertexShader:`attribute vec3 color;attribute float area;attribute float feature;varying vec3 vColor;varying float vX;varying float vFeature;uniform float pixelRatio;void main(){vColor=color;vX=position.x;vFeature=feature;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(155./-mv.z,1.05,2.6)*pixelRatio;}`,
    fragmentShader:`varying vec3 vColor;varying float vX;varying float vFeature;uniform float scan;uniform float fromFeature;uniform float toFeature;uniform float focusMix;uniform float focusStrength;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float glow=1.-smoothstep(0.,1.4,abs(vX-scan));float a=1.-step(.5,abs(vFeature-fromFeature));float b=1.-step(.5,abs(vFeature-toFeature));float chosen=mix(a,b,focusMix);float context=vFeature<.5?.46:.2;float emphasis=mix(1.,mix(context,1.,chosen),focusStrength);gl_FragColor=vec4(mix(vColor,vec3(.05,.7,1.),glow*.5),(.9-r*.45)*emphasis);}`,
    transparent:true,depthWrite:false
  });
  world.add(new THREE.Points(geometry,material));
  const pose=(target,offset,area,name,feature=0,detail='')=>({target:new THREE.Vector3(...target),offset:new THREE.Vector3(...offset),area,name,feature,detail});
  const overview=pose([-2,1,0],[100,91,118],0,'CONNECTED CAMPUS / OVERVIEW',0,'Training · Mobility · Drone systems');
  const views={
    military:pose([-29,2,-21],[23,20,27],1,'01 / TRAINING COMPLEX',1,'Immersive bay · Projection walls · Instructor desk'),
    kia:pose([30,1.7,-15],[14,11,18],2,'02 / VEHICLE ZONE',2,'Tactical vehicle · Mobility course'),
    range:pose([-57,2,-12],[22,21,28],1,'01 / TRAINING COMPLEX',3,'Live-fire lanes · Baffles · Target carriers'),
    mmts:pose([-12,2,-8],[18,15,22],1,'01 / TRAINING COMPLEX',4,'Portable screens · Projector · Control station'),
    vehicle:pose([23,1.8,-30.5],[12,10,16],2,'02 / VEHICLE ZONE',5,'Driving cockpit · Displays · Motion platform'),
    fire:pose([-46,4,-32],[19,19,26],1,'01 / TRAINING COMPLEX',6,'Training tower · Staircase · Hose equipment'),
    police:pose([-13,1.7,-32],[18,16,23],1,'01 / TRAINING COMPLEX',7,'Scenario rooms · Instructor station'),
    drone:pose([-3,5,32],[24,21,29],3,'03 / DRONE ZONE',8,'Detection mast · Antenna array · Ground station'),
    modular:pose([26,7.5,31],[12,10,15],3,'03 / DRONE ZONE',9,'Aerial platform · Camera payload · Landing gear')
  };
  const labels=[...shell.querySelectorAll('.campus-hotspot')];
  const areaAnchors={training:new THREE.Vector3(-31,7,-19),vehicles:new THREE.Vector3(32,5,-15),drones:new THREE.Vector3(18,12,31)};
  let paused=initiallyPaused,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let dirty=true,scrollDirty=true,visible=true,dragging=false,lastX=0,userYaw=0,orbit=0,elapsed=0,previousTime=0,wholeCampus=false,inPortfolio=false,frame,viewId='',orbitSpeed=.014,desiredFocusStrength=0;
  let cachedWidth=1,cachedHeight=1;
  const desiredTarget=overview.target.clone(),desiredOffset=overview.offset.clone();
  const currentTarget=overview.target.clone(),currentOffset=overview.offset.clone(),offset=new THREE.Vector3();
  const targetVelocity=new THREE.Vector3(),offsetVelocity=new THREE.Vector3();
  const detailLabel=document.getElementById('campus-detail-label');
  function updateScroll() {
    scrollDirty=false;
    const rect=portfolio.getBoundingClientRect();
    const shouldDock=rect.top<innerHeight*.72&&rect.bottom>innerHeight*.15;
    if(shouldDock!==inPortfolio){
      const focused=document.activeElement;
      inPortfolio=shouldDock;shell.dataset.mode=inPortfolio?'product':'hero';
      shell.toggleAttribute('inert',inPortfolio);
      if(inPortfolio)shell.setAttribute('aria-hidden','true');else shell.removeAttribute('aria-hidden');
      dragging=false;wrap.classList.remove('dragging');
      if(inPortfolio)host.appendChild(shell);else home.after(shell);
      if(focused&&shell.contains(focused)){
        if(inPortfolio)document.querySelector('.portfolio-nav a[aria-current]')?.focus({preventScroll:true});
        else focused.focus({preventScroll:true});
      }
      resize();
    }
    let active=articles[0],next=articles[0],progress=0;
    const readingLine=innerHeight*(innerWidth<801?.46:.38);
    for(let i=0;i<articles.length;i++){
      if(articles[i].getBoundingClientRect().top<=readingLine){active=articles[i];next=articles[Math.min(i+1,articles.length-1)];}
      else break;
    }
    const a=active.getBoundingClientRect(),b=next.getBoundingClientRect();
    const fraction=Math.max(0,Math.min(1,(readingLine-a.top)/Math.max(1,b.top-a.top)));
    progress=reduced||paused?0:smoothProgress(fraction,.58,1);
    const id=active.id.replace('product-',''),nextId=next.id.replace('product-','');
    if(id!==viewId){viewId=id;wholeCampus=false;overviewButton.setAttribute('aria-pressed','false');overviewButton.setAttribute('aria-label','Show whole campus');overviewButton.firstChild.textContent='Whole campus ';}
    const v=views[id]||overview,n=views[nextId]||v;
    const entrance=smoothProgress(innerHeight*.8-rect.top,0,innerHeight*.65);
    const leaving=smoothProgress(rect.bottom,innerHeight*.15,innerHeight*.65);
    const weight=inPortfolio&&!wholeCampus?Math.min(entrance,leaving):0;
    desiredTarget.copy(v.target).lerp(n.target,progress).lerp(overview.target,1-weight);
    desiredOffset.copy(v.offset).lerp(n.offset,progress);
    const lift=Math.sin(Math.PI*progress)*Math.min(17,v.target.distanceTo(n.target)*.22);
    desiredOffset.y+=lift;
    desiredOffset.x*=1+lift*.009;desiredOffset.z*=1+lift*.009;
    desiredOffset.lerp(overview.offset,1-weight);
    material.uniforms.fromFeature.value=v.feature;
    material.uniforms.toFeature.value=n.feature;
    material.uniforms.focusMix.value=progress;
    desiredFocusStrength=weight;
    material.uniforms.focusArea.value=weight>.7?v.area:0;
    const name=weight>.7?v.name:overview.name;
    if(label.textContent!==name)label.textContent=name;
    const detail=weight>.7?v.detail:overview.detail;
    if(detailLabel.textContent!==detail)detailLabel.textContent=detail;
    shell.dataset.focus=weight>.7?id:'overview';
    dirty=true;
  }
  function placeLabels(){
    const focus=material.uniforms.focusArea.value;
    for(const anchor of labels){
      const key=anchor.dataset.zone,p=areaAnchors[key].clone().project(camera);
      const area={training:1,vehicles:2,drones:3}[key];
      anchor.hidden=p.z>1||p.x<-.86||p.x>.86||p.y<-.78||p.y>.83||(focus>0);
      anchor.style.left=((p.x+1)*.5*cachedWidth)+'px';anchor.style.top=((-p.y+1)*.5*cachedHeight)+'px';
      anchor.classList.toggle('is-focused',focus===area);
    }
  }
  function render(){
    const angle=inPortfolio?orbit*.45:orbit+userYaw;
    const distanceScale=Math.max(1,1.12/camera.aspect);
    offset.copy(currentOffset);offset.x*=distanceScale;offset.z*=distanceScale;
    const x=offset.x*Math.cos(angle)-offset.z*Math.sin(angle),z=offset.x*Math.sin(angle)+offset.z*Math.cos(angle);
    camera.position.set(currentTarget.x+x,currentTarget.y+offset.y,currentTarget.z+z);
    camera.lookAt(currentTarget);renderer.render(scene,camera);placeLabels();
  }
  function resize(){cachedWidth=wrap.clientWidth;cachedHeight=wrap.clientHeight;if(!cachedWidth||!cachedHeight)return;renderer.setSize(cachedWidth,cachedHeight);camera.aspect=cachedWidth/cachedHeight;camera.fov=inPortfolio?39:36;camera.updateProjectionMatrix();dirty=true;}
  new ResizeObserver(resize).observe(wrap);resize();updateScroll();
  currentTarget.copy(desiredTarget);currentOffset.copy(desiredOffset);render();
  document.getElementById('scene-poster').setAttribute('hidden','');
  function animate(time){
    frame=requestAnimationFrame(animate);
    const dt=Math.min(.05,(time-previousTime)/1000||.016);previousTime=time;
    if(document.hidden)return;
    if(scrollDirty)updateScroll();
    if(!visible)return;
    const stopped=paused||reduced;
    const moving=currentTarget.distanceToSquared(desiredTarget)+currentOffset.distanceToSquared(desiredOffset)>.002;
    if(stopped){if(dirty){currentTarget.copy(desiredTarget);currentOffset.copy(desiredOffset);targetVelocity.set(0,0,0);offsetVelocity.set(0,0,0);material.uniforms.focusStrength.value=desiredFocusStrength;render();dirty=false;}return;}
    dampVector3(currentTarget,desiredTarget,targetVelocity,.65,dt,120);
    dampVector3(currentOffset,desiredOffset,offsetVelocity,.7,dt,90);
    orbitSpeed+=( (moving?.0035:.014)-orbitSpeed )*(1-Math.exp(-dt*2.5));
    const focus=desiredFocusStrength*(1-Math.min(.72,currentTarget.distanceTo(desiredTarget)/35));
    material.uniforms.focusStrength.value+=(focus-material.uniforms.focusStrength.value)*(1-Math.exp(-dt*4));
    if(!dragging){orbit+=dt*orbitSpeed;elapsed+=dt;material.uniforms.scan.value=Math.sin(elapsed*.14)*72;}
    render();dirty=false;
  }
  frame=requestAnimationFrame(animate);
  window.addEventListener('scroll',()=>{scrollDirty=true;},{passive:true});
  window.addEventListener('resize',()=>{scrollDirty=true;dirty=true;});
  window.addEventListener('hashchange',()=>{scrollDirty=true;});
  wrap.addEventListener('pointerdown',event=>{if(inPortfolio)return;if(event.pointerType==='mouse'&&event.button!==0)return;dragging=true;lastX=event.clientX;wrap.classList.add('dragging');if(event.pointerType==='mouse')wrap.setPointerCapture(event.pointerId);});
  wrap.addEventListener('pointermove',event=>{if(inPortfolio||!dragging)return;userYaw+=(event.clientX-lastX)*.005;lastX=event.clientX;dirty=true;render();});
  const endDrag=()=>{dragging=false;wrap.classList.remove('dragging');};
  for(const event of ['pointerup','pointercancel','pointerleave'])wrap.addEventListener(event,endDrag);
  document.addEventListener('vru-motion',event=>{paused=event.detail;scrollDirty=true;dirty=true;});
  document.addEventListener('vru-reset',()=>{userYaw=0;orbit=0;wholeCampus=false;targetVelocity.set(0,0,0);offsetVelocity.set(0,0,0);overviewButton.setAttribute('aria-pressed','false');overviewButton.setAttribute('aria-label','Show whole campus');overviewButton.firstChild.textContent='Whole campus ';scrollDirty=true;dirty=true;});
  overviewButton.addEventListener('click',()=>{wholeCampus=!wholeCampus;overviewButton.setAttribute('aria-pressed',String(wholeCampus));overviewButton.setAttribute('aria-label',wholeCampus?'Return to product area':'Show whole campus');overviewButton.firstChild.textContent=wholeCampus?'Product area ':'Whole campus ';scrollDirty=true;dirty=true;});
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',event=>{reduced=event.matches;scrollDirty=true;dirty=true;if(reduced){paused=true;const button=document.getElementById('motion-toggle');button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','Resume scene motion');document.getElementById('motion-icon').textContent='▷';}});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){scrollDirty=true;dirty=true;}},{threshold:0}).observe(wrap);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);document.getElementById('scene-poster').removeAttribute('hidden');renderer.domElement.hidden=true;for(const id of ['motion-toggle','scene-reset','campus-view-toggle'])document.getElementById(id).disabled=true;shell.querySelector('.campus-hotspots').hidden=true;});
}
