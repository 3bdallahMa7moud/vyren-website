'use client';
import { useEffect,useRef } from 'react';
import Image from 'next/image';
import { CyclesSequence } from '@/lib/cycles-sequence';

declare global {interface Window {__VYREN_SEQUENCE?:{diagnostics:()=>ReturnType<CyclesSequence['diagnostics']>};}}
export function AssemblySequence() {
  const slot=useRef<HTMLDivElement>(null);const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    if(!slot.current||!canvas.current)return;
    const engine=new CyclesSequence(slot.current,canvas.current);
    window.__VYREN_SEQUENCE={diagnostics:()=>engine.diagnostics()};
    let alive=true,restoreRaf=0;
    const remember=()=>{
      const section=slot.current?.closest<HTMLElement>('.assembly');if(!section)return;
      const p=(scrollY-section.offsetTop)/Math.max(1,section.offsetHeight-innerHeight);
      try{if(p>=0&&p<=1)sessionStorage.setItem('vyren-assembly-progress',String(p));else sessionStorage.removeItem('vyren-assembly-progress');}catch{}
    };
    window.addEventListener('pagehide',remember);
    // Fragment alignment can override native restoration on a deep-scroll refresh.
    const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
    if(navigation?.type==='reload'&&location.hash==='#assembly'){
      let saved:string|null=null;try{saved=sessionStorage.getItem('vyren-assembly-progress');}catch{}
      if(saved!==null){const p=Number(saved);if(Number.isFinite(p)&&p>=0&&p<=1)void document.fonts.ready.then(()=>{
        if(!alive)return;restoreRaf=requestAnimationFrame(()=>{restoreRaf=requestAnimationFrame(()=>{
          if(!alive)return;const section=slot.current?.closest<HTMLElement>('.assembly');
          if(section)window.scrollTo({top:section.offsetTop+Math.max(0,section.offsetHeight-innerHeight)*p,behavior:'instant'});
        });});
      });}
    }
    return()=>{alive=false;cancelAnimationFrame(restoreRaf);window.removeEventListener('pagehide',remember);engine.dispose();delete window.__VYREN_SEQUENCE;};
  },[]);
  return <div ref={slot} className="assembly-slot sequence-slot" role="img" aria-label="The component layers of the NOCTIS 01">
    <div className="assembly-camera">
    <picture className="sequence-poster"><source media="(max-width:768px)" srcSet="/assets/exploded-cycles/poster-mobile.webp" /><Image unoptimized src="/assets/exploded-cycles/poster-desktop.webp" width={1600} height={1200} alt="NOCTIS 01, assembled" loading="lazy" /></picture>
    <canvas ref={canvas} className="sequence-canvas" data-vyren-sequence="true" aria-hidden="true" />
    </div>
  </div>;
}
