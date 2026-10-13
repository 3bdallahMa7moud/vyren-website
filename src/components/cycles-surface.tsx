'use client';
import { useEffect, useRef } from 'react';
import { CyclesFrameCache } from '@/lib/cycles-frame-cache';
import { studioFraming } from '@/lib/studio-framing';
import { CriticalFrameSurface } from '@/lib/critical-frame-surface';
import type { FrameBundleSpec } from '@/lib/frame-bundle-store';

export type SurfaceDiagnostics = ReturnType<CyclesFrameCache['diagnostics']> & { desiredFrame: number; displayedFrame: number; draws: number; averageDrawMs: number; active: boolean; variant: string; previewDraws: number; atlasBytes: number; fullResolution: boolean };
export function CyclesSurface({ frame, count, path, prefix = '', circular = false, fit: surfaceFit, bundle, label, className = '', diagnostics, onPresent }: { frame: number; count: number; path: string; prefix?: string; circular?: boolean; fit?: 'cover' | 'contain'; bundle?: FrameBundleSpec; label: string; className?: string; diagnostics?: (read: (() => SurfaceDiagnostics) | null) => void; onPresent?: (frame: number) => void }) {
  const slot = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(frame), seek = useRef<() => void>(() => {}), callbacks = useRef({ diagnostics, onPresent });
  useEffect(() => { callbacks.current = { diagnostics, onPresent }; }, [diagnostics, onPresent]);
  useEffect(() => { target.current = frame; seek.current(); }, [frame]);
  useEffect(() => {
    if (bundle) {
      const surface = new CriticalFrameSurface(slot.current!, canvas.current!, { frame: target.current, count, path, prefix, bundle, fit: surfaceFit, onPresent: index => callbacks.current.onPresent?.(index) });
      seek.current = () => surface.seek(target.current);
      callbacks.current.diagnostics?.(() => surface.diagnostics());
      return () => { surface.dispose(); seek.current = () => {}; callbacks.current.diagnostics?.(null); };
    }
    const element = slot.current!, output = canvas.current!, ctx = output.getContext('2d');
    if (!ctx) return;
    let mobile = innerWidth <= 768, active = false, displayed = -1, held: ImageBitmap | undefined, raf = 0, draws = 0, drawMs = 0, atlas:ImageBitmap|undefined, atlasController:AbortController|undefined, atlasBytes=0, previewDraws=0, fullResolution=false;
    const url = (index: number) => `${path}/${mobile ? 'mobile' : 'desktop'}/${prefix}${String(index).padStart(3, '0')}.webp`;
    let cache: CyclesFrameCache;
    const frameLimit=()=>(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData?2:mobile?5:6;
    const normalize = (i: number) => circular ? (i + count) % count : Math.max(0, Math.min(count - 1, i));
    const desired = () => normalize(Math.round(target.current));
    const releaseAtlas=()=>{atlasController?.abort();atlasController=undefined;atlas?.close();atlas=undefined;};
    const loadAtlas=()=>{
      if(!circular||atlas||atlasController||(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData)return;
      const controller=new AbortController();atlasController=controller;
      void fetch(`${path}/atlas-${mobile?'mobile':'desktop'}.webp`,{signal:controller.signal,cache:'force-cache'}).then(async r=>{
        if(!r.ok)throw new Error('Overview unavailable');const blob=await r.blob(),bitmap=await createImageBitmap(blob);
        if(controller.signal.aborted){bitmap.close();return;}atlas=bitmap;atlasBytes+=blob.size;update();
      }).catch(()=>{});
    };
    const draw = () => {
      raf = 0; if (!active || document.hidden) return;
      const nowMobile = innerWidth <= 768;
      if (mobile !== nowMobile) { cache.dispose(); releaseAtlas();mobile = nowMobile; cache = new CyclesFrameCache(frameLimit(), 2, update); held = undefined; }
      loadAtlas();
      const index = desired(), saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      const candidates = [0, 1, -1, 2, -2].slice(0, saveData ? 1 : 5).map(n => normalize(index + n));
      cache.request(candidates.map(url));
      const nearest = Array.from({ length: count }, (_, i) => i).sort((a, b) => { const d = (i: number) => circular ? Math.min(Math.abs(i - index), count - Math.abs(i - index)) : Math.abs(i - index); return d(a) - d(b); }).find(i => cache.get(url(i)));
      const bitmap = nearest === undefined ? undefined : cache.get(url(nearest));
      const exact=cache.get(url(index));fullResolution=!!exact;
      if (bitmap) { held = bitmap; displayed = nearest!; }
      if(!exact&&atlas)displayed=index;
      if (!held&&!atlas) return; // The authentic HTML poster remains visible until a decoded frame exists.
      const r = element.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (!w || !h) return;
      const started = performance.now(); output.width = w; output.height = h;
      ctx.clearRect(0, 0, w, h);
      if(!exact&&atlas){
        const cw=atlas.width/8,ch=atlas.height/9,f=studioFraming(r.width,r.height,mobile);
        ctx.drawImage(atlas,(index%8)*cw,Math.floor(index/8)*ch,cw,ch,f.x*dpr,f.y*dpr,f.width*dpr,f.height*dpr);previewDraws++;
      }else{const image=exact??held!;
        if(circular){const f=studioFraming(r.width,r.height,mobile);ctx.drawImage(image,f.x*dpr,f.y*dpr,f.width*dpr,f.height*dpr);}
        else{const fit=surfaceFit==='cover'||(!surfaceFit&&prefix==='light-')?Math.max:Math.min,scale=fit(w/image.width,h/image.height);ctx.drawImage(image,(w-image.width*scale)/2,(h-image.height*scale)/2,image.width*scale,image.height*scale);}
      }
      element.dataset.ready = 'true'; element.dataset.displayedFrame = String(displayed); draws++; drawMs += performance.now() - started; callbacks.current.onPresent?.(displayed);
    };
    function update() { if (!raf && active && !document.hidden) raf = requestAnimationFrame(draw); }
    cache = new CyclesFrameCache(frameLimit(), 2, update); seek.current = update;
    const observer = new IntersectionObserver(entries => { active = entries.some(e => e.isIntersecting); if (active) update(); else { held = undefined; cache.release();releaseAtlas(); } }, { rootMargin: '200px 0px' });
    const resize = new ResizeObserver(update); observer.observe(element); resize.observe(element);
    const visibility = () => { if (document.hidden) { held = undefined; cache.release();releaseAtlas(); } else update(); };
    document.addEventListener('visibilitychange', visibility);
    callbacks.current.diagnostics?.(() => ({ ...cache.diagnostics(), desiredFrame: desired(), displayedFrame: displayed, draws, averageDrawMs: drawMs / Math.max(1, draws), active, variant: mobile ? 'mobile' : 'desktop',previewDraws,atlasBytes,fullResolution }));
    return () => { cancelAnimationFrame(raf); observer.disconnect(); resize.disconnect(); document.removeEventListener('visibilitychange', visibility); cache.dispose();releaseAtlas(); seek.current = () => {}; callbacks.current.diagnostics?.(null); };
  }, [count, path, prefix, circular, surfaceFit, bundle]);
  return <div ref={slot} className={`cycles-surface ${className}`}><canvas ref={canvas} role="img" aria-label={label} /></div>;
}
