'use client';
import { useEffect, useRef, useState } from 'react';
import { studioFraming } from '@/lib/studio-framing';
import { STUDIO_HOTSPOT_MASKS } from '@/lib/studio-hotspot-visibility';
type Projection={frame:number;frontVisible:boolean;points:[number,number][]};
const names=['Crown','Dial','Open-heart movement','Case / strap'];
export function StudioHotspots({frame,area,onInspect}:{frame:number;area:React.RefObject<HTMLDivElement|null>;onInspect:(index:number,button:HTMLButtonElement)=>void}) {
  const [frames,setFrames]=useState<Projection[]>([]),[size,setSize]=useState({width:0,height:0,mobile:false});const layer=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const element=area.current;if(!element)return;let alive=true,started=false;const controller=new AbortController();
    const resize=new ResizeObserver(()=>{const r=element.getBoundingClientRect();setSize({width:r.width,height:r.height,mobile:innerWidth<=768});});resize.observe(element);
    const observer=new IntersectionObserver(entries=>{if(!started&&entries.some(e=>e.isIntersecting)){started=true;void fetch('/assets/studio-cycles/hotspots.json',{signal:controller.signal}).then(r=>r.json()).then(data=>{if(alive)setFrames(data.frames);}).catch(()=>{});}},{rootMargin:'200px'});observer.observe(element);
    return()=>{alive=false;controller.abort();resize.disconnect();observer.disconnect();};
  },[area]);
  const projection=frames[Math.max(0,frame)];
  const f=studioFraming(size.width,size.height,size.mobile),mask=frame<0?0:STUDIO_HOTSPOT_MASKS[frame]??0;
  return <div ref={layer} className="studio-hotspots" hidden={!projection || !mask} aria-label="Watch detail hotspots">{projection?.points.map(([x,y],i)=>(mask&(1<<i))?<button key={names[i]} aria-label={`Inspect ${names[i]}`} style={{left:f.x+(x*1600-(size.mobile?347:0))*f.scale,top:f.y+y*1200*f.scale}} onClick={e=>onInspect(i,e.currentTarget)}><span aria-hidden="true">{i+1}</span></button>:null)}</div>;
}
