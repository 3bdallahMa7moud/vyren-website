'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CyclesSurface, type SurfaceDiagnostics } from './cycles-surface';
import { Media } from './media';

gsap.registerPlugin(ScrollTrigger);
const assetPath = '/assets/finale-reveal-v1';
const count = 72;
const revealLength = .76;
declare global { interface Window { __VYREN_FINALE?: () => SurfaceDiagnostics; } }
function FinaleArrow() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.25" /></svg>;
}

export function FinaleScene() {
  const section = useRef<HTMLElement>(null);
  const topline = useRef<HTMLDivElement>(null);
  const [toplineVisible, setToplineVisible] = useState(true);
  const [frame, setFrame] = useState(count - 1);
  const [litFramePresented, setLitFramePresented] = useState(false);
  const [motionActive, setMotionActive] = useState(false);
  // The scroll asks for the camera pose before the network may have delivered
  // it. Keep the closing copy together with a genuinely presented lit frame.
  const copyFrame = Math.ceil(.66 / revealLength * (count - 1));
  const presented = useCallback((index: number) => setLitFramePresented(index >= copyFrame), [copyFrame]);
  const copyWaiting = motionActive && frame >= copyFrame && !litFramePresented;
  useEffect(() => {
    const row = topline.current, navigation = document.querySelector<HTMLElement>('.navigation');
    if (!row || !navigation) return;
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      const clearance = Math.ceil(navigation.getBoundingClientRect().height) + 4;
      observer = new IntersectionObserver(([entry]) => {
        setToplineVisible(entry.isIntersecting && entry.intersectionRatio >= .999);
      }, { rootMargin: `-${clearance}px 0px 0px 0px`, threshold: 1 });
      observer.observe(row);
    };
    const resize = new ResizeObserver(observe);
    resize.observe(navigation); observe();
    return () => { observer?.disconnect(); resize.disconnect(); };
  }, []);
  useEffect(() => {
    if (!section.current) return;
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 769px)', short: '(max-height: 650px)' }, context => {
      const element = section.current!;
      setMotionActive(!!context.conditions?.motion);
      if (!context.conditions?.motion) { setFrame(count - 1); return; }
      element.dataset.motion = 'true';
      const play = { frame: 0 };
      // One playhead keeps the original camera, lighting, title and action in order.
      const timeline = gsap.timeline({ scrollTrigger: { id: 'story-finale', trigger: element, start: context.conditions.short ? 'top 75%' : 'top top', end: 'bottom bottom', scrub: context.conditions.desktop ? .35 : .2, invalidateOnRefresh: true } });
      timeline.fromTo(play, { frame: 0 }, { frame: count - 1, ease: 'none', duration: revealLength, onUpdate: () => setFrame(Math.round(play.frame)) }, 0)
        .fromTo('.final-atmosphere', { opacity: .18 }, { opacity: 1, duration: .65, ease: 'none' }, 0)
        .fromTo('.final-copy h2', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .12, ease: 'power2.out' }, .66)
        .fromTo('.final-copy p', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .1 }, .77)
        .fromTo('.final-copy .button', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .1 }, .82)
        .fromTo('.final-footer', { opacity: .35, borderColor: 'rgba(241,238,232,0)' }, { opacity: 1, borderColor: 'rgba(241,238,232,.18)', duration: .12 }, .8)
        .to({}, { duration: .08 }, .92);
      return () => { delete element.dataset.motion; setFrame(count - 1); setMotionActive(false); };
    }, section);
    return () => media.revert();
  }, []);
  return <section ref={section} id="moment" className="finale finale-reveal scene" aria-labelledby="final-title">
    <div className="finale-sticky">
      <div className="final-atmosphere" aria-hidden="true" />
      <div ref={topline} className="final-topline" style={{ visibility: toplineVisible ? 'visible' : 'hidden' }}><div className="eyebrow"><span className="scene-number">09</span><span>The final chapter</span></div><span className="small-label">NOCTIS 01 / VYREN</span></div>
      <div className="final-composition">
        <div className="final-product">
          <Media name="finale-reveal-v1/poster-complete" className="final-poster-complete" alt="The complete VYREN NOCTIS 01 under studio lighting" sizes="(max-width:768px) 90vw, 640px" />
          <Media name="finale-reveal-v1/poster-rim" className="final-poster-rim" alt="The rim and crown of the NOCTIS 01 emerge from darkness" sizes="(max-width:768px) 90vw, 640px" />
          <CyclesSurface frame={frame} count={count} path={assetPath} prefix="reveal-" fit="contain" label="The VYREN NOCTIS 01 turns slowly as studio lighting reveals its dial, crown and complete strap" onPresent={presented} diagnostics={read => { if (read) window.__VYREN_FINALE = read; else delete window.__VYREN_FINALE; }} />
        </div>
        <div className="final-copy" data-copy-waiting={copyWaiting} inert={copyWaiting} aria-hidden={copyWaiting || undefined} style={copyWaiting ? { opacity: 0 } : undefined}>
          <h2 id="final-title"><span>Own the</span> <em>moment.</em></h2>
          <p>VYREN NOCTIS 01 — An exploration of precision.</p>
          <a className="button button-ivory" href="#experience">Enter the Studio <FinaleArrow /></a>
        </div>
      </div>
      <div className="final-footer"><span className="wordmark">VYREN</span><span>TIME, REDEFINED.</span><a href="#watch">Back to top <FinaleArrow /></a></div>
    </div>
  </section>;
}
