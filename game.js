import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const mount = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd2e1);
scene.fog = new THREE.Fog(0x9bd2e1, 22, 85);
const camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, .1, 180);
camera.position.set(0, 8, 13);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe6f8ff, 0x4e6c4e, 2.0));
const sun = new THREE.DirectionalLight(0xfff0d6, 3.2);
sun.position.set(-9, 18, 8); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const waterMat = new THREE.MeshStandardMaterial({color:0x3e9eae,roughness:.32,metalness:.08});
const sandMat=mat(0xe6d4a0), grassMat=mat(0x6caa79), darkGrass=mat(0x4f8d70), woodMat=mat(0x9c6c48), leafMat=mat(0x2d796c), stoneMat=mat(0x8aa4a6), crystalMat=new THREE.MeshStandardMaterial({color:0x9df7ed,emissive:0x38b7ad,emissiveIntensity:1.1,roughness:.25,metalness:.2});
const world = new THREE.Group(); scene.add(world);
const water = new THREE.Mesh(new THREE.PlaneGeometry(260,260,32,32),waterMat); water.rotation.x=-Math.PI/2; water.position.y=-.28; world.add(water);
const islands=[], shards=[], keys={}; let collected=Number(localStorage.getItem('driftwood-shards')||0), islesFound=Number(localStorage.getItem('driftwood-isles')||1), raftLevel=Number(localStorage.getItem('driftwood-raft')||0), started=false, toastTimer;
let targetYaw=0, yaw=0, targetPitch=.26, pitch=.26, dragging=false, lastX=0,lastY=0;
const player = new THREE.Group(); world.add(player);
const body = new THREE.Mesh(new THREE.CapsuleGeometry(.28,.65,4,8),mat(0x345d72)); body.position.y=.68; body.castShadow=true; player.add(body);
const head = new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),mat(0xf0c89a)); head.position.set(0,1.28,0); head.castShadow=true; player.add(head);
const hat = new THREE.Mesh(new THREE.ConeGeometry(.24,.27,8),mat(0xe8a56a)); hat.position.set(0,1.56,0); hat.castShadow=true; player.add(hat);
const pack = new THREE.Mesh(new THREE.BoxGeometry(.28,.34,.17),woodMat); pack.position.set(0,.77,.27); player.add(pack);
const islandMat=grassMat;
function addIsland(x,z,r=5,seed=1,main=false){
 const g=new THREE.Group(); g.position.set(x,0,z); world.add(g);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(r*.86,r*.97,.72,12,1),sandMat); base.position.y=-.02;base.castShadow=true;base.receiveShadow=true;g.add(base);
 const top=new THREE.Mesh(new THREE.CylinderGeometry(r*.82,r*.86,.28,12,1),islandMat);top.position.y=.42;top.castShadow=true;top.receiveShadow=true;g.add(top);
 // low-poly grass tufts and rocks
 for(let i=0;i<Math.floor(r*2.5);i++){const a=i*2.399+seed, rr=r*.72*(.3+((i*37%17)/20)); const h=.16+(i%4)*.045;const tuft=new THREE.Mesh(new THREE.ConeGeometry(.12,h,4),i%3?darkGrass:grassMat);tuft.position.set(Math.cos(a)*rr,.58+h*.5,Math.sin(a)*rr);tuft.rotation.z=(i%3-.8)*.2;g.add(tuft)}
 // tree clusters
 const count=main?5:2;
 for(let i=0;i<count;i++){const a=i*2.4+seed,rr=r*.4;const tx=Math.cos(a)*rr,tz=Math.sin(a)*rr;
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.17,.9,6),woodMat);trunk.position.set(tx,1.05,tz);trunk.castShadow=true;g.add(trunk);
 for(let j=0;j<3;j++){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.55-j*.06,0),j===1?leafMat:darkGrass);crown.position.set(tx+(j%2-.5)*.12,1.55+j*.27,tz);crown.scale.set(1,.85,1);crown.castShadow=true;g.add(crown)}}
 // scattered rocks
 for(let i=0;i<Math.floor(r);i++){const a=i*3.8+seed*2,rr=r*.6;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.22+(i%3)*.07,0),stoneMat);rock.position.set(Math.cos(a)*rr,.62,Math.sin(a)*rr);rock.rotation.set(a,a*.7,0);rock.castShadow=true;g.add(rock)}
 islands.push({x,z,r,g});
 return {x,z,r,g};
}
const mainIsland=addIsland(0,0,5.5,2,true); player.position.set(0,.62,1.5);
function makeShard(x,z){const group=new THREE.Group();const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.32,0),crystalMat);gem.position.y=.95;gem.castShadow=true;group.add(gem);const ring=new THREE.Mesh(new THREE.TorusGeometry(.45,.025,6,24),new THREE.MeshBasicMaterial({color:0xc3fff3,transparent:true,opacity:.7}));ring.rotation.x=Math.PI/2;ring.position.y=.72;group.add(ring);group.position.set(x,.58,z);world.add(group);shards.push({group,gem,ring,active:true});}
function randomShardOn(island,idx){const a=idx*2.399+1.3,r=island.r*.58;makeShard(island.x+Math.cos(a)*r,island.z+Math.sin(a)*r)}
for(let i=0;i<7;i++)randomShardOn(mainIsland,i);
function generateIsles(){const count=5;for(let i=0;i<count;i++){const a=i*2.399+1.1,dist=13+(i%3)*3;const isl=addIsland(Math.cos(a)*dist,Math.sin(a)*dist,2.6+(i%3)*.45,i+7,false);randomShardOn(isl,i+10);if(i%2===0)randomShardOn(isl,i+15)}}
generateIsles();
function makeBeacon(){const g=new THREE.Group();g.position.set(-1.5,.58,-1.1);const base=new THREE.Mesh(new THREE.CylinderGeometry(.5,.65,.35,8),stoneMat);base.position.y=.18;g.add(base);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,2.5,6),woodMat);pole.position.y=1.5;g.add(pole);const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.28,1),crystalMat);orb.position.y=2.85;g.add(orb);const light=new THREE.PointLight(0x78fff0,0,8);light.position.y=2.8;g.add(light);world.add(g);return {g,orb,light}}
const beacon=makeBeacon();
function showToast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function updateUI(){document.querySelector('#shards').textContent=collected;document.querySelector('#shard-total').textContent=collected;document.querySelector('#progress-fill').style.width=Math.min(100,collected/5*100)+'%';document.querySelector('#isles').textContent=islesFound;document.querySelector('#day').textContent=String(Math.max(1,Math.floor(collected/3)+1)).padStart(2,'0');const button=document.querySelector('#upgrade');if(collected>=5&&raftLevel===0){button.disabled=false;button.classList.add('ready');button.textContent='BUILD';document.querySelector('#raft-title').textContent='Build your raft';document.querySelector('#raft-desc').textContent='Wake the beacon and set sail.'}else if(raftLevel>0){button.disabled=true;button.classList.remove('ready');button.textContent='BUILT';document.querySelector('#raft-title').textContent='Wayfinder raft';document.querySelector('#raft-desc').textContent='The beacon is awake. Keep wandering.'}else{button.disabled=true;button.classList.remove('ready');button.textContent='LOCKED'}document.querySelector('#status').textContent=collected>=5?'The beacon is waiting for you.': 'The sea is calm. Start exploring.';document.querySelector('#goal').textContent=5;}
updateUI();
document.querySelector('#upgrade').addEventListener('click',()=>{if(collected>=5&&!raftLevel){raftLevel=1;localStorage.setItem('driftwood-raft',raftLevel);beacon.light.intensity=3;showToast('The old beacon wakes ✦');document.querySelector('#hint').textContent='A new path appears beyond the reef.';document.querySelector('#status').textContent='Beacon lit. The horizon is yours.';updateUI();}});
document.querySelector('#start').addEventListener('click',()=>{const cover=document.querySelector('#start-screen');if(cover.classList.contains('hidden'))return;document.body.classList.add('is-entering');cover.classList.add('hidden');window.setTimeout(()=>{started=true;showToast('The world is yours to wander');},280);});
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['w','a','s','d','shift','arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;targetYaw-=(e.clientX-lastX)*.006;targetPitch=Math.max(-.05,Math.min(.7,targetPitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY});
let lastTime=0,walk=0;
function nearestShard(){let best=null,bd=1.3;for(const s of shards){if(!s.active)continue;const d=Math.hypot(player.position.x-s.group.position.x,player.position.z-s.group.position.z);if(d<bd){bd=d;best=s}}return best}
function animate(t){requestAnimationFrame(animate);const dt=Math.min((t-lastTime)/1000||.016,.04);lastTime=t;
 water.position.y=-.28+Math.sin(t*.00045)*.04;
 for(const s of shards){if(s.active){s.group.position.y=.58+Math.sin(t*.0018+s.group.position.x)*.12;s.gem.rotation.y+=dt*.7;s.ring.rotation.z+=dt*.5}}
 beacon.orb.rotation.y+=dt*.6;beacon.orb.position.y=2.85+Math.sin(t*.002)*.1;
 yaw+=(targetYaw-yaw)*.09;pitch+=(targetPitch-pitch)*.09;
 if(started){const f=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);if(f||side){const speed=(keys.shift?7.2:4.2)*dt;const dx=(Math.sin(yaw)*f+Math.cos(yaw)*side)*speed,dz=(Math.cos(yaw)*f-Math.sin(yaw)*side)*speed;player.position.x+=dx;player.position.z+=dz;player.rotation.y=Math.atan2(dx,dz);walk+=dt*12;body.position.y=.68+Math.abs(Math.sin(walk))*.06;head.position.y=1.28+Math.abs(Math.sin(walk))*.04}
 const s=nearestShard();if(s){s.active=false;world.remove(s.group);collected++;localStorage.setItem('driftwood-shards',collected);updateUI();showToast('Starshard found ✦');document.querySelector('#hint').textContent=collected>=5?'Five found. Build your raft.':'Something bright joins your collection.'}
 // Discover nearby islands once
 for(const isl of islands.slice(1)){if(!isl.discovered&&Math.hypot(player.position.x-isl.x,player.position.z-isl.z)<isl.r+1.2){isl.discovered=true;islesFound++;localStorage.setItem('driftwood-isles',islesFound);updateUI();showToast('A new isle discovered');}}
 }
 const dist=raftLevel?11:10;const cp=new THREE.Vector3(player.position.x+Math.sin(yaw)*dist*Math.cos(pitch),player.position.y+5+dist*Math.sin(pitch),player.position.z+Math.cos(yaw)*dist*Math.cos(pitch));camera.position.lerp(cp,.09);camera.lookAt(player.position.x,player.position.y+.6,player.position.z);
 renderer.render(scene,camera)}
// Mark known island count without overwriting saved discoveries
islands.forEach((i,idx)=>i.discovered=idx===0);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
animate(0);
