// Delivery copy: bounded floating-point precision; source topology/images/materials stay intact.
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const source = fs.readFileSync('public/assets/vyren-noctis-01.glb');
const jsonLength = source.readUInt32LE(12);
const original = JSON.parse(source.subarray(20,20+jsonLength));
const gltf = structuredClone(original), bin = source.subarray(28+jsonLength);
const parts = []; let bytes = 0, placeholder = 0, compressedViews = 0;
const precision=[];
const semantics=new Map();
for(const mesh of gltf.meshes) for(const p of mesh.primitives) for(const [name,accessor] of Object.entries(p.attributes)) semantics.set(accessor,name);
const imageCopies=new Map(), imageChecks=[];
for(const image of gltf.images) {
  const view=gltf.bufferViews[image.bufferView], data=bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);
  const webp=await sharp(data).webp({lossless:true,effort:6}).toBuffer();
  const before=await sharp(data).ensureAlpha().raw().toBuffer(), after=await sharp(webp).ensureAlpha().raw().toBuffer();
  if(!before.equals(after)) throw new Error(`Image pixels changed: ${image.name}`);
  imageCopies.set(image.bufferView,webp); image.mimeType='image/webp'; imageChecks.push({name:image.name,pixelsIdentical:true,beforeBytes:data.length,afterBytes:webp.length});
}
for(const texture of gltf.textures) { texture.extensions={...texture.extensions,EXT_texture_webp:{source:texture.source}}; delete texture.source; }
const append = data => { const offset=bytes; parts.push(Buffer.from(data)); bytes+=data.length; const pad=(4-bytes%4)%4; parts.push(Buffer.alloc(pad)); bytes+=pad; return offset; };
const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}, sizes={5121:1,5123:2,5125:4,5126:4};
for (const [index,view] of gltf.bufferViews.entries()) {
  const data=imageCopies.get(index)??bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);
  const accessors=gltf.accessors.filter(a=>a.bufferView===index);
  if (!accessors.length) { view.byteOffset=append(data); view.byteLength=data.length; continue; }
  const a=accessors[0], stride=view.byteStride??components[a.type]*sizes[a.componentType];
  const mode=view.target===34963?'INDICES':'ATTRIBUTES';
  if ((mode==='ATTRIBUTES' && stride%4) || data.length%stride) throw new Error('Unexpected layout');
  const count=data.length/stride, semantic=semantics.get(gltf.accessors.indexOf(a));
  let input=data, filter='NONE';
  if(mode==='ATTRIBUTES'&&a.componentType===5126&&accessors.length===1) {
    const floats=new Float32Array(data.buffer,data.byteOffset,data.length/4);
    input=MeshoptEncoder.encodeFilterExp(floats,count,stride,semantic==='POSITION'?20:semantic==='NORMAL'||semantic==='TANGENT'?14:16,'SharedComponent');
    filter='EXPONENTIAL';
  }
  const encoded=MeshoptEncoder.encodeGltfBuffer(input,count,stride,mode);
  const decoded=new Uint8Array(data.length);
  MeshoptDecoder.decodeGltfBuffer(decoded,count,stride,encoded,mode,filter);
  if(filter==='NONE'&&!Buffer.from(decoded).equals(data)) throw new Error(`Lossless check failed: ${index}`);
  if(filter!=='NONE') {
    const aFloats=new Float32Array(data.buffer,data.byteOffset,data.length/4), bFloats=new Float32Array(decoded.buffer);
    let maxError=0; for(let i=0;i<aFloats.length;i++) maxError=Math.max(maxError,Math.abs(aFloats[i]-bFloats[i]));
    if(semantic==='POSITION'&&maxError>1e-6) throw new Error(`Position error exceeds 1 micrometre: ${maxError}`);
    precision.push({view:index,semantic,maxAbsoluteError:maxError});
  }
  const offset=append(encoded);
  view.buffer=1; view.byteOffset=placeholder; placeholder+=view.byteLength; placeholder=(placeholder+3)&~3;
  view.extensions={...view.extensions,EXT_meshopt_compression:{buffer:0,byteOffset:offset,byteLength:encoded.length,byteStride:stride,count,mode,filter}};
  compressedViews++;
}
gltf.buffers=[{byteLength:bytes},{byteLength:placeholder,extensions:{EXT_meshopt_compression:{fallback:true}}}];
gltf.extensionsUsed=[...new Set([...(gltf.extensionsUsed??[]),'EXT_meshopt_compression','EXT_texture_webp'])];
gltf.extensionsRequired=[...new Set([...(gltf.extensionsRequired??[]),'EXT_meshopt_compression','EXT_texture_webp'])];
const json=Buffer.from(JSON.stringify(gltf)), padded=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const binary=Buffer.concat(parts), result=Buffer.alloc(28+padded.length+binary.length);
result.writeUInt32LE(0x46546c67,0); result.writeUInt32LE(2,4); result.writeUInt32LE(result.length,8);
result.writeUInt32LE(padded.length,12); result.writeUInt32LE(0x4e4f534a,16); padded.copy(result,20);
result.writeUInt32LE(binary.length,20+padded.length); result.writeUInt32LE(0x004e4942,24+padded.length); binary.copy(result,28+padded.length);
fs.writeFileSync('public/assets/vyren-noctis-01-meshopt.glb',result);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={method:'EXT_meshopt_compression. Lossless indices; EXPONENTIAL filter with 20-bit positions, 16-bit UVs and 14-bit normals/tangents. Every decoded position bounded below 1 micrometre. Texture pixels identical after lossless WebP encoding. Node transforms, triangle order, meshes, materials and original file unchanged.',compressedViews,precision,imageChecks,maxPositionErrorM:Math.max(...precision.filter(p=>p.semantic==='POSITION').map(p=>p.maxAbsoluteError)),original:{bytes:source.length,gzipBytes:zlib.gzipSync(source).length,sha256:sha(source)},optimized:{bytes:result.length,gzipBytes:zlib.gzipSync(result).length,sha256:sha(result)},sourceMetadataVerified:['nodes','meshes','materials','accessors'].every(k=>JSON.stringify(gltf[k])===JSON.stringify(original[k]))};
fs.writeFileSync('src/lib/viewer-asset.json',JSON.stringify({path:'/assets/vyren-noctis-01-meshopt.glb',bytes:result.length}));
fs.mkdirSync('qa/section-seven-fixes',{recursive:true}); fs.writeFileSync('qa/section-seven-fixes/optimization.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,precision:undefined}));
