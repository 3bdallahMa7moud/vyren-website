'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// A once-only, authentic Cycles camera orbit. The original still is always underneath.
export function HeroOrbit() {
  const [enabled,setEnabled]=useState(false);
  const [visible,setVisible]=useState(false);
  const timers=useRef<number[]>([]);
  useEffect(()=>{
    let alive=true;
    const cleanupTimers=timers.current;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');
    const eligible=()=>!reduce.matches && innerWidth>768 && (!location.hash || location.hash==='#watch') && !(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData;
    const poster=document.querySelector<HTMLImageElement>('.hero-product .product-media img');
    poster?.decode().then(()=>{if(alive&&eligible())setEnabled(true);}).catch(()=>{});
    const changed=()=>{if(reduce.matches){setEnabled(false);setVisible(false);}};
    reduce.addEventListener('change',changed);
    return()=>{alive=false;reduce.removeEventListener('change',changed);cleanupTimers.forEach(clearTimeout);};
  },[]);
  if(!enabled)return null;
  return <Image unoptimized loading="eager" className={`hero-orbit ${visible?'hero-orbit-visible':''}`} src="/assets/hero-orbit.webp" width={1280} height={960} alt="" aria-hidden="true" decoding="async" fetchPriority="low" onLoad={()=>{setVisible(true);timers.current.push(window.setTimeout(()=>{setVisible(false);timers.current.push(window.setTimeout(()=>setEnabled(false),220));},1240));}} />;
}
