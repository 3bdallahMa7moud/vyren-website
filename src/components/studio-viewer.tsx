'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import dynamic from 'next/dynamic';
import { CyclesSurface, type SurfaceDiagnostics } from './cycles-surface';
import { Media } from './media';
import { StudioHotspots } from './studio-hotspots';
import { experience, requestPreset, requestZoom, type ViewPreset } from '@/lib/experience-state';
import { studioFraming } from '@/lib/studio-framing';

const ProductStage = dynamic(() => import('./product-stage'), { ssr: false });
const wrap = (f: number) => (f % 72 + 72) % 72;
const subscribeCapabilities=()=>()=>{};
const orbitCapability=()=>typeof createImageBitmap==='function';
const serverCapability=()=>true;
const presets = [{ name: 'Front', frame: 66 }, { name: '3/4 View', frame: 0 }, { name: 'Side', frame: 12 }, { name: 'Back', frame: 24 }];
const details = [
  { name: 'Crown', image: 'crown', copy: 'Machined flutes and the engraved V. A compact study of polished edges against satin titanium.' },
  { name: 'Dial', image: 'dial', copy: 'Applied markers, sculptural hands and fine typography against the anthracite dial.' },
  { name: 'Open-heart movement', image: 'movement', copy: 'Balance, spring and bridge geometry seen through the dial aperture. An illustrative mechanical composition.' },
  { name: 'Case / strap', image: 'strap', copy: 'The integrated rubber curve meets the angular case connection. Soft texture, precisely framed.' },
];
declare global { interface Window { __VYREN_STUDIO?: { diagnostics: () => SurfaceDiagnostics & { mode: string; angle: number; fullscreen: boolean }; seek: (frame: number) => void }; } }

export function StudioViewer() {
  const [mode, setMode] = useState<'studio' | 'free'>('studio'), [frame, setFrame] = useState(0), [shown, setShown] = useState(-1);
  const [macro, setMacro] = useState<number | null>(null), [immersive, setImmersive] = useState(false), [interacting, setInteracting] = useState(false);
  const [status, setStatus] = useState('waiting'), [quality, setQuality] = useState(false), [preset, setPreset] = useState<ViewPreset>('front');
  const [freeLoaded, setFreeLoaded] = useState(false);
  const [visibleMode, setVisibleMode] = useState<'studio' | 'free'>('studio');
  const visibleModeRef = useRef(visibleMode), transitionVersion = useRef(-1);
  const orbitSupported=useSyncExternalStore(subscribeCapabilities,orbitCapability,serverCapability);
  const host = useRef<HTMLDivElement>(null), close = useRef<HTMLButtonElement>(null), dialog = useRef<HTMLDialogElement>(null), opener = useRef<HTMLElement | null>(null);
  const imageArea=useRef<HTMLDivElement>(null);
  const fullscreenOpener=useRef<HTMLElement|null>(null);
  const playhead = useRef(0), animation = useRef(0), cache = useRef<(() => SurfaceDiagnostics) | null>(null), modeRef = useRef(mode), immersiveRef = useRef(immersive);
  const drag = useRef<{ id: number; x: number; y: number; last: number; time: number; velocity: number; intent: boolean } | null>(null);
  const publish = useCallback((f: number) => { playhead.current = wrap(f); setFrame(Math.round(playhead.current) % 72); }, []);
  const cancel = useCallback(() => { cancelAnimationFrame(animation.current); animation.current = 0; }, []);
  const seek = useCallback((target: number) => {
    cancel(); const from = playhead.current, delta = ((target - from + 108) % 72) - 36;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { publish(target); return; }
    const start = performance.now(); const step = (now: number) => { const p = Math.min(1, (now - start) / 680); publish(from + delta * (1 - (1 - p) ** 3)); if (p < 1) animation.current = requestAnimationFrame(step); else animation.current = 0; }; animation.current = requestAnimationFrame(step);
  }, [cancel, publish]);
  const report = useCallback((read: (() => SurfaceDiagnostics) | null) => { cache.current = read; }, []);
  useEffect(() => { modeRef.current = mode; immersiveRef.current = immersive; visibleModeRef.current = visibleMode; }, [mode, immersive, visibleMode]);
  useEffect(() => {
    const element=imageArea.current!;
    const update=()=>{const r=element.getBoundingClientRect(),f=studioFraming(r.width,r.height,innerWidth<=768);
      for(const [key,value] of Object.entries({x:f.x,y:f.y,width:f.width,height:f.height}))element.style.setProperty(`--studio-image-${key}`,`${value}px`);
    };
    const observer=new ResizeObserver(update);observer.observe(element);update();return()=>observer.disconnect();
  },[]);
  const present = useCallback((index:number)=>{
    setShown(index);
    if(modeRef.current==='studio' && index===Math.round(playhead.current)%72){visibleModeRef.current='studio';setVisibleMode('studio');}
  },[]);
  useEffect(() => {
    window.__VYREN_STUDIO = { diagnostics: () => ({ ...(cache.current?.() ?? { cacheFrames: 0, cacheLimit: 6, decodedBytes: 0, peakDecodedBytes: 0, peakCacheFrames: 0, pending: 0, downloadedBytes: 0, fetches: 0, failedFrames: 0, abortedRequests: 0, desiredFrame: 0, displayedFrame: -1, draws: 0, averageDrawMs: 0, active: false, variant: 'desktop',previewDraws:0,atlasBytes:0,fullResolution:false }), mode: modeRef.current, angle: playhead.current * 5, fullscreen: immersiveRef.current }), seek };
    const studioStatus = (e: Event) => setStatus((e as CustomEvent<string>).detail);
    const freePresented = (e: Event) => { if(modeRef.current==='free' && (e as CustomEvent<number>).detail===transitionVersion.current){visibleModeRef.current='free';setVisibleMode('free');} };
    const finish = () => { experience.viewerActive = false; setInteracting(false); document.querySelector<HTMLButtonElement>('.interaction-button')?.focus({ preventScroll: true }); };
    window.addEventListener('vyren-studio-status', studioStatus); window.addEventListener('vyren-finish-exploring', finish); window.addEventListener('vyren-studio-presented',freePresented);
    return () => { cancel(); experience.viewerActive = false; delete window.__VYREN_STUDIO; window.removeEventListener('vyren-studio-status', studioStatus); window.removeEventListener('vyren-finish-exploring', finish); window.removeEventListener('vyren-studio-presented',freePresented); };
  }, [cancel, seek]);
  useEffect(() => {
    if (macro === null) return;
    const element = dialog.current!, previous=document.body.style.overflow; element.showModal();document.body.style.overflow='hidden';
    return () => { element.close();document.body.style.overflow=previous; opener.current?.focus({ preventScroll: true }); };
  }, [macro]);
  useEffect(() => {
    const changed = () => { if (!document.fullscreenElement) setImmersive(false); };
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  useEffect(() => {
    if (!immersive) return;
    close.current?.focus({ preventScroll: true }); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !dialog.current?.open) { setImmersive(false); if (document.fullscreenElement) void document.exitFullscreen(); fullscreenOpener.current?.focus({ preventScroll: true }); }
      if (e.key === 'Tab' && !dialog.current?.open) { const items = Array.from(host.current!.querySelectorAll<HTMLElement>('button:not(:disabled),[tabindex="0"]')).filter(e => e.getClientRects().length); const first = items[0], last = items[items.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    window.addEventListener('keydown', key);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key); fullscreenOpener.current?.focus({ preventScroll: true }); };
  }, [immersive]);
  const switchMode = (next: 'studio' | 'free') => {
    if (next === modeRef.current) return; cancel(); experience.viewerActive = false; setInteracting(false);
    modeRef.current=next;
    if (next === 'free') { experience.studioFrame = Math.round(playhead.current)%72; experience.studioOrbit = true; requestPreset('hero'); transitionVersion.current=experience.presetVersion; setFreeLoaded(true); if (!freeLoaded) setStatus('waiting'); }
    else {
      const d = window.__VYREN?.diagnostics();
      if (d?.ready && visibleModeRef.current==='free') { const x = d.camera[0] - d.target[0], z = d.camera[1] - d.target[1]; publish(Math.round(wrap((Math.atan2(x, z) - Math.atan2(.091, .17)) / (Math.PI * 2) * 72))%72); }
      experience.studioOrbit = false;
      if(!orbitSupported){visibleModeRef.current='studio';setVisibleMode('studio');}
    }
    setMode(next);
  };
  const down = (e: PointerEvent<HTMLDivElement>) => { if (!orbitSupported || e.button !== 0) return; cancel(); drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, last: e.clientX, time: performance.now(), velocity: 0, intent: false }; if (e.pointerType === 'mouse') e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    if (!d.intent) { const x = Math.abs(e.clientX - d.x), y = Math.abs(e.clientY - d.y); if (y > x && y > 8) { drag.current = null; return; } if (x < 5) return; d.intent = true; e.currentTarget.setPointerCapture(e.pointerId); }
    const now = performance.now(), delta = -(e.clientX - d.last) / e.currentTarget.clientWidth * 85;
    d.velocity = delta / Math.max(8, now - d.time); d.last = e.clientX; d.time = now; publish(playhead.current + delta);
  };
  const up = () => {
    const d = drag.current; drag.current = null;
    if (!d?.intent || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let velocity = Math.max(-.075, Math.min(.075, d.velocity)), last = performance.now();
    const step = (now: number) => { const dt = Math.min(32, now - last); last = now; velocity *= Math.exp(-dt / 140); publish(playhead.current + velocity * dt); if (Math.abs(velocity) > .001) animation.current = requestAnimationFrame(step); else animation.current = 0; }; animation.current = requestAnimationFrame(step);
  };
  const inspect = (index: number, button: HTMLButtonElement) => { cancel(); opener.current = button; setMacro(index); };
  return <section id="experience" className="viewer scene" aria-labelledby="viewer-title">
    <div className="viewer-heading"><div className="eyebrow"><span className="scene-number">07</span><span>THE INTERACTIVE STUDIO</span></div><h2 id="viewer-title">Make time <em>yours.</em></h2><p>A closer look changes everything.</p></div>
    <div ref={host} className={`studio-shell ${immersive ? 'studio-immersive' : ''}`} role={immersive ? 'dialog' : undefined} aria-modal={immersive || undefined} aria-label={immersive ? 'Immersive watch studio' : undefined}>
      <div className="studio-toolbar"><div className="studio-modes" role="group" aria-label="Viewing mode"><button aria-pressed={mode === 'studio'} onClick={() => switchMode('studio')}>Studio</button><button aria-pressed={mode === 'free'} onClick={() => switchMode('free')}>Free 3D</button></div><span className="studio-render-label">{mode === 'studio' ? 'SOFT STUDIO / CYCLES' : 'LIVE MODEL / FREE ORBIT'}</span><button ref={close} className="studio-fullscreen" onClick={async e => { fullscreenOpener.current = e.currentTarget; if (immersive) { setImmersive(false); if (document.fullscreenElement) await document.exitFullscreen(); } else { setImmersive(true); try { await host.current?.requestFullscreen(); } catch { /* The fixed inspection layout is the API fallback. */ } } }}>{immersive ? 'Exit fullscreen' : 'Fullscreen'} <span aria-hidden="true">{immersive ? '↙' : '↗'}</span></button></div>
      <div className={`viewer-body ${interacting ? 'is-interacting' : ''}`}>
        <span className="viewer-coordinate">NOCTIS 01<br /><span>41 MM / CONCEPT STUDY</span></span>
        <div ref={imageArea} className="studio-image-area" data-visible-mode={visibleMode} data-transitioning={mode!==visibleMode}>
          <div className="studio-orbit" hidden={mode !== 'studio' && visibleMode !== 'studio'} aria-hidden={visibleMode !== 'studio'} tabIndex={mode === 'studio' ? 0 : -1} role="slider" aria-label="Watch rotation" aria-valuemin={0} aria-valuemax={355} aria-valuenow={frame * 5} aria-valuetext={`${frame * 5} degrees around the watch`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; cancel(); }} onKeyDown={e => { if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) { e.preventDefault(); seek(e.key === 'Home' ? 0 : e.key === 'End' ? 71 : wrap(playhead.current + (e.key === 'ArrowRight' ? 1 : -1))); } }}>
            <picture className="studio-poster"><source media="(max-width:768px)" srcSet="/assets/studio-cycles/poster-mobile.webp" /><img src="/assets/studio-cycles/poster-desktop.webp" width="1600" height="1200" alt="The original NOCTIS 01 in its Blender studio" loading="lazy" /></picture>
            {orbitSupported && <CyclesSurface frame={frame} count={72} path="/assets/studio-cycles" circular label="Authentic Cycles orbit of NOCTIS 01" diagnostics={report} onPresent={present} />}
          </div>
          <div className="webgl-slot viewer-slot" data-stage="viewer" hidden={mode !== 'free' && visibleMode !== 'free'} aria-hidden={visibleMode !== 'free'} aria-label="Interactive 3D view of VYREN NOCTIS 01"><picture className="product-media viewer-poster"><source media="(max-width:768px)" srcSet="/assets/studio-cycles/poster-mobile.webp" /><img src="/assets/studio-cycles/poster-desktop.webp" width="1600" height="1200" alt="Original watch studio preview while Free 3D loads" loading="lazy" /></picture></div>
          {mode==='studio'&&visibleMode==='studio'&&<StudioHotspots frame={shown} area={imageArea} onInspect={inspect} />}
          <span className="studio-angle" aria-hidden="true" hidden={visibleMode!=='studio'}>{String(shown < 0 ? 0 : shown * 5).padStart(3, '0')}° <i /> 360° ORBIT</span>
        </div>
        <div className="viewer-footer"><span id="viewer-instruction" className="viewer-instruction">{mode === 'studio' ? 'Drag horizontally to rotate · Arrow keys for precision' : interacting ? 'Drag / arrow keys to rotate · + / − to zoom · Esc to finish' : 'Explore freely in three dimensions.'}</span>{mode === 'free' ? <button className="interaction-button" disabled={status !== 'ready' || mode!==visibleMode} aria-pressed={interacting} onClick={() => { experience.viewerActive = !interacting; setInteracting(!interacting); if (!interacting) requestAnimationFrame(() => document.querySelector<HTMLCanvasElement>('[data-vyren-canvas]')?.focus({ preventScroll: true })); }}>{interacting ? 'Finish exploring' : 'Interact with the watch'} <span className="orbit-icon" aria-hidden="true">↔</span></button> : <span className="studio-ready" role="status">{!orbitSupported ? 'Studio photograph · choose Free 3D to rotate' : shown < 0 ? 'Studio photograph · loading orbit' : shown !== frame ? 'Refining your angle…' : 'Your angle. Your perspective.'}</span>}</div>
      </div>
      {mode === 'studio' ? <div className="studio-presets" role="group" aria-label="Studio angles">{presets.map(p => <button key={p.name} disabled={!orbitSupported} aria-pressed={frame === p.frame} onClick={() => seek(p.frame)}>{p.name}</button>)}<button disabled={!orbitSupported} onClick={() => seek(0)}>Reset</button></div> : <><div id="viewer-feedback" className="viewer-feedback" /><fieldset className="viewer-controls" aria-label="3D viewer controls" disabled={status !== 'ready' || mode!==visibleMode}><div className="preset-controls">{(['front', 'rear', 'detail'] as const).map(view => <button key={view} aria-pressed={preset === view} onClick={() => { experience.studioOrbit = false; setPreset(view); requestPreset(view); }}>{view === 'detail' ? 'Dial detail' : `${view} view`}</button>)}<button onClick={() => { experience.studioOrbit = false; setPreset('front'); requestPreset('front'); }}>Reset</button></div><div className="utility-controls"><button aria-label="Zoom out" onClick={() => requestZoom(1)}>−</button><button aria-label="Zoom in" onClick={() => requestZoom(-1)}>+</button><button className="quality-control" aria-pressed={quality} onClick={() => { experience.lowPower = !quality; setQuality(!quality); }}>Low power</button></div></fieldset></>}
      <div className="studio-loupe"><span className="small-label">WATCHMAKER’S LOUPE</span><div>{details.map((detail, i) => <button key={detail.name} onClick={e => inspect(i, e.currentTarget)}>{detail.name} <span aria-hidden="true">+</span></button>)}</div></div>
      {freeLoaded && <ProductStage />}
      {macro !== null && <dialog ref={dialog} className="macro-dialog" onCancel={() => setMacro(null)} onClick={e => { if (e.target === e.currentTarget) setMacro(null); }} aria-labelledby="macro-title"><button className="macro-close" onClick={() => setMacro(null)} autoFocus>Close inspection <span aria-hidden="true">×</span></button><div className="macro-authentic"><Media name={details[macro].image} alt={`Original Cycles macro: ${details[macro].name}`} sizes="(max-width:768px) 100vw, 1200px" /></div><div className="macro-caption"><span className="small-label">NOCTIS 01 / DETAIL STUDY</span><h3 id="macro-title">{details[macro].name}</h3><p>{details[macro].copy}</p></div></dialog>}
    </div>
    <p className="viewer-note">Original geometry. Studio photographs rendered in Blender. Free 3D offers unconstrained inspection of the same watch.</p>
  </section>;
}
