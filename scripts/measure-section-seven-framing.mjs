import fs from 'node:fs';
import * as THREE from 'three';
const buffer=fs.readFileSync('public/assets/vyren-noctis-01.glb');
const jsonLength=buffer.readUInt32LE(12),gltf=JSON.parse(buffer.subarray(20,20+jsonLength).toString());const binaryOffset=20+jsonLength+8;
const worldMatrices=new Map();
function walk(index,parent){const n=gltf.nodes[index],m=new THREE.Matrix4();if(n.matrix)m.fromArray(n.matrix);else m.compose(new THREE.Vector3(...(n.translation??[0,0,0])),new THREE.Quaternion(...(n.rotation??[0,0,0,1])),new THREE.Vector3(...(n.scale??[1,1,1])));m.premultiply(parent);worldMatrices.set(index,m);for(const c of n.children??[])walk(c,m);}
for(const root of gltf.scenes[gltf.scene??0].nodes)walk(root,new THREE.Matrix4());
const evidence=JSON.parse(fs.readFileSync('qa/section-seven/viewport/evidence.json'));const results=[];
for(const entry of evidence.evidence){
 const d=entry.diagnostics,aspect=d.canvas[0]/d.canvas[1],pose=entry.name,camera=new THREE.PerspectiveCamera(({front:29,rear:29.6,detail:23.5}[pose])*(aspect<.8?1.22:1),aspect,.0001,5);camera.position.fromArray(d.camera);camera.up.set(0,0,-1);camera.lookAt(new THREE.Vector3(...d.target));camera.updateMatrixWorld(true);
 const min=new THREE.Vector3(Infinity,Infinity,Infinity),max=new THREE.Vector3(-Infinity,-Infinity,-Infinity),outside={left:0,right:0,top:0,bottom:0};let vertices=0,meshNodes=0;
 for(const [nodeIndex,world] of worldMatrices){const n=gltf.nodes[nodeIndex];if(n.mesh===undefined)continue;meshNodes++;for(const primitive of gltf.meshes[n.mesh].primitives){const accessor=gltf.accessors[primitive.attributes.POSITION],view=gltf.bufferViews[accessor.bufferView];if(accessor.componentType!==5126||accessor.type!=='VEC3')throw new Error('Unexpected position format');const base=binaryOffset+(view.byteOffset??0)+(accessor.byteOffset??0),stride=view.byteStride??12;
  for(let i=0;i<accessor.count;i++){const offset=base+i*stride,p=new THREE.Vector3(buffer.readFloatLE(offset),buffer.readFloatLE(offset+4),buffer.readFloatLE(offset+8)).applyMatrix4(world).project(camera);min.min(p);max.max(p);vertices++;if(p.x< -1)outside.left++;if(p.x>1)outside.right++;if(p.y>1)outside.top++;if(p.y< -1)outside.bottom++;}
 }}
 results.push({viewport:entry.size,pose,meshNodes,vertices,ndcBounds:{min:min.toArray(),max:max.toArray()},outsideVertices:outside,fullyInside:min.x>=-1&&max.x<=1&&min.y>=-1&&max.y<=1,topOverflowCssPx:Math.max(0,(max.y-1)*d.canvas[1]/2),bottomOverflowCssPx:Math.max(0,(-1-min.y)*d.canvas[1]/2)});
}
fs.writeFileSync('qa/section-seven/framing.json',JSON.stringify({method:'Project every original GLB POSITION vertex with original scene-node transforms and the measured viewer camera; CSS-sized canvas aspect and current preset FOV. Detail closeup is intentionally cropped.',results},null,2));console.log(JSON.stringify(results.filter(r=>r.pose!=='detail')));
