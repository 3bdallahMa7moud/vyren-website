'use client';
import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { experience } from '@/lib/experience-state';
import { craftSurfaceLength, materialStops, materialStudyLength, materialTravelLength } from '@/lib/story-timing';
import { chapterTransitions } from './chapter-transitions';

gsap.registerPlugin(ScrollTrigger);
declare global { interface Window { __VYREN_MOTION?: () => { triggers: number; assemblyTriggers: number; lenis: boolean; reducedMotion: boolean }; } }
export function useMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!root.current) return;
    let alive = true;
    const initialHash = location.hash;
    const isAssemblyReload = initialHash === '#assembly' && (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'reload';
    const media = gsap.matchMedia();
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
    experience.reducedMotion = reducedQuery.matches;
    media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 769px)' }, context => {
      const { motion, desktop } = context.conditions!;
      experience.reducedMotion = !motion;
      if (!motion) return;
      experience.manualAssembly = null;
      if (desktop) {
        lenis = new Lenis({ duration: .88, smoothWheel: true, anchors: { offset: -76 }, prevent: node => !!node.closest('.viewer-body.is-interacting, .mobile-menu, .studio-immersive, .macro-dialog') });
        lenis.on('scroll', ScrollTrigger.update);
        tick = time => lenis?.raf(time * 1000); gsap.ticker.add(tick);
      }
      const scrub = desktop ? .55 : .22;
      // Introduce the copy over the static product image.
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo('.hero h1 .line-mask > span', { yPercent: 105 }, { yPercent: 0, duration: 1.12, stagger: .13 }, .12)
        .fromTo('.hero-label', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .65 }, .2)
        .fromTo('.hero-copy > p, .hero-actions', { opacity: 0 }, { opacity: 1, stagger: .12, duration: .55 }, .88)
        .fromTo('.hero-bottom', { opacity: 0 }, { opacity: 1, duration: .6 }, 1.1);
      const heroExit = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub } });
      heroExit.to('.hero-product', { yPercent: desktop ? 9 : 4, xPercent: desktop ? -2 : 0, ease: 'none', duration: 1 }, 0)
        .to('.hero-copy', { yPercent: -12, ease: 'none', duration: 1 }, 0);
      // Independent text baselines and a separate product plane keep every word readable.
      const editorial = gsap.timeline({ scrollTrigger: { trigger: '.manifesto', start: 'top 85%', end: 'bottom 20%', scrub } });
      editorial.fromTo('.manifesto-word:first-child', { xPercent: desktop ? -5 : -2, yPercent: -8, clipPath:'inset(0 0 100% 0)', letterSpacing: '-.07em' }, { xPercent: 0, yPercent:0, clipPath:'inset(0 0 0% 0)', letterSpacing: '-.045em', ease: 'none', duration: .6 }, 0)
        .fromTo('.manifesto-word:last-child', { xPercent: desktop ? 5 : 2, yPercent:8, clipPath:'inset(100% 0 0 0)', letterSpacing: '-.02em' }, { xPercent: 0, yPercent:0, clipPath:'inset(0% 0 0 0)', letterSpacing: '-.045em', ease: 'none', duration: .6 }, .07)
        .fromTo('.manifesto-product', { yPercent: 8 }, { yPercent: -4, ease: 'none', duration: 1 }, 0);
      const curtain = root.current!.querySelector<HTMLElement>('.ivory-exit')!;
      const navigation = root.current!.querySelector<HTMLElement>('.navigation')!;
      const syncCurtainNavigation = () => {
        const rect = curtain.getBoundingClientRect();
        const navCenter = navigation.offsetHeight / 2;
        const dark = rect.height > 1 && rect.top <= navCenter && rect.bottom >= navCenter;
        if (dark) {
          if (document.documentElement.dataset.editorialExit !== 'dark') document.documentElement.dataset.editorialExit = 'dark';
        } else if (document.documentElement.dataset.editorialExit) delete document.documentElement.dataset.editorialExit;
      };
      gsap.fromTo(curtain, { scaleY: 0 }, { scaleY: 1, ease: 'none', onUpdate: syncCurtainNavigation, scrollTrigger: { trigger: '.manifesto', start: 'bottom 72%', end: 'bottom 44%', scrub: desktop ? .22 : .12, onRefresh: syncCurtainNavigation } });
      // The real lighting frames travel with the first photograph; the crown
      // sits above that plane so its reveal remains visible in both directions.
      const titanium = gsap.timeline({ scrollTrigger: { trigger: '.case-film', start: 'top 80%', end: 'bottom 25%', scrub, invalidateOnRefresh: true } });
      titanium.fromTo('.case-image', { scale: 1.14, xPercent: -3, yPercent: 2 }, { scale: 1.04, xPercent: 1, yPercent: -1.5, ease: 'none', duration: craftSurfaceLength }, 0)
        .fromTo('.case-crown', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'power2.inOut', duration: .3 }, .48)
        .fromTo('.case-crown-image', { scale: 1.025, xPercent: -1, yPercent: .5 }, { scale: 1.12, xPercent: 2, yPercent: -2, ease: 'none', duration: .52 }, .48)
        .fromTo('.macro-label-one i', { scaleX: 0 }, { scaleX: 1, duration: .22 }, .08)
        .fromTo('.macro-label-one', { opacity: 0 }, { opacity: 1, duration: .14 }, .08)
        .to('.macro-label-one', { opacity: 0, duration: .1 }, .48)
        .fromTo('.macro-label-two', { opacity: 0 }, { opacity: 1, duration: .2 }, .7)
        .fromTo('.macro-label-two i', { scaleX: 0 }, { scaleX: 1, duration: .22 }, .7);
      // The camera approach and the balance rig live in genuine Cycles frames.
      // Copy leaves room for the mechanism; its two callouts arrive in order.
      const heart = gsap.timeline({ scrollTrigger: { trigger: '.movement', start: 'top top', end: 'bottom bottom', scrub, invalidateOnRefresh: true } });
      heart.to({}, { duration: 1 }, 0)
        .fromTo('.movement-rule', { scaleX: 0 }, { scaleX: 1, duration: .16 }, .02)
        .fromTo('.movement-annotation', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .12 }, .3)
        .to('.movement-annotation', { opacity: 0, duration: .1 }, .66)
        .fromTo('.movement-bridge-callout', { clipPath: 'inset(0 100% 0 0)', opacity: 0 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: .16 }, .74)
        .to('.movement-copy .movement-detail', { opacity: 0, duration: .14 }, .28)
        .to('.movement-copy h2', { yPercent: -4, ease: 'none', duration: .4 }, .6);
      // One reversible playhead maps directly to pre-rendered Cycles frames.
      // Annotations and the existing footer follow the displayed frame if loading lags.
      const assembly = gsap.timeline({ scrollTrigger: { id: 'vyren-assembly', trigger: '.assembly', start: 'top top', end: 'bottom bottom', scrub, invalidateOnRefresh: true } });
      assembly.fromTo(experience, { assemblyScroll: 0 }, { assemblyScroll: 1, ease: 'none', duration: 1 }, 0)
        .fromTo(experience, { assembly: 0 }, { assembly: 1, ease: 'none', duration: .50 }, .15)
        .to(experience, { assembly: 0, ease: 'none', duration: .20 }, .80);
      const panels = gsap.utils.toArray<HTMLElement>('.material-panel');
      if (desktop) {
        const width = () => root.current!.querySelector<HTMLElement>('.materials-window')!.clientWidth;
        const setProgress = gsap.quickSetter('.material-progress span', 'scaleX');
        const counter = root.current!.querySelector('.material-counter');
        const materials = gsap.timeline({ scrollTrigger: { trigger: '.materials', start: 'top top', end: 'bottom bottom', scrub: .3, invalidateOnRefresh: true }, onUpdate: function () { const p = this.progress(); setProgress(p); if (counter) counter.textContent = `0${p < .22 ? 1 : p < .5 ? 2 : p < .78 ? 3 : 4} — 04`; } });
        materials.to({}, { duration: 1 }, 0);
        [1,2,3].forEach(i => materials.to('.materials-track', { x: () => -width() * i, ease: 'power2.inOut', duration: materialTravelLength }, materialStops[i - 1] + materialStudyLength));
        panels.forEach((panel, i) => {
          const at = i ? materialStops[i] - materialTravelLength : 0;
          materials.fromTo(panel.querySelector('.material-name'), { clipPath: 'inset(0 0 100% 0)', y: 18 }, { clipPath: 'inset(0 0 0% 0)', y: 0, ease: 'power2.out', duration: i ? materialTravelLength : .07 }, at)
            .fromTo(panel.querySelector('.material-copy p'), { opacity: .35 }, { opacity: 1, duration: .1 }, materialStops[i])
            .fromTo(panel.querySelector('.material-line'), { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: materialStudyLength }, materialStops[i]);
        });
      } else {
        panels.forEach((panel,i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 85%', end: 'top 30%', toggleActions: 'play none none reverse' } });
          tl.fromTo(panel.querySelector('.material-image'), { clipPath: i % 2 ? 'inset(8% 0 0 0)' : 'inset(0 8% 0 0)' }, { clipPath: 'inset(0% 0% 0 0)', duration: .7, ease: 'power2.out' })
            .fromTo(panel.querySelector('.material-name'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .5 }, .2)
            .fromTo(panel.querySelector('.material-line'), { scaleX: 0 }, { scaleX: 1, duration: .6 }, .3);
        });
      }
      // Short entrances finish even if the visitor pauses at a section boundary.
      // The existing ivory curtain and the photographic sequences keep their own
      // scroll choreography; these establish the next chapter's text and plane.
      const entrances = [
        { trigger: '.craftsmanship', copy: '.craft-heading', plane: '.case-film' },
        { trigger: '.movement', copy: '.movement-copy', plane: null },
        { trigger: '.assembly', copy: '.assembly-heading', plane: null },
        { trigger: '.materials', copy: '.materials .section-top', plane: null },
        { trigger: '.details', copy: '.details > h2', plane: null },
      ];
      entrances.forEach(({ trigger, copy, plane }) => {
        const enter = gsap.timeline({ scrollTrigger: { trigger, start: 'top 72%', toggleActions: 'play none none reverse' } });
        enter.fromTo(copy, { y: desktop ? 30 : 16, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, 0);
        if (plane) enter.fromTo(plane, { y: 24 }, { y: 0, duration: .9, ease: 'power3.out' }, .1);
      });
      const clearHandoffs = chapterTransitions(root.current!, !!desktop);
      gsap.fromTo('.viewer-heading h2', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'power3.out', duration: .9, scrollTrigger: { trigger: '.viewer', start: 'top 78%', toggleActions: 'play none none reverse' } });
      const measure = gsap.timeline({ scrollTrigger: { trigger: '.dimension-image', start: 'top 70%', toggleActions: 'play none none reverse' } });
      measure.fromTo('.dimension-line', { scaleX: 0 }, { scaleX: 1, duration: .9, ease: 'power2.inOut' })
        .fromTo('.dimension-number', { opacity: 0 }, { opacity: 1, duration: .35 }, .65)
        .fromTo('.dimension-caption', { clipPath: 'inset(0 50% 0 50%)' }, { clipPath: 'inset(0 0% 0 0%)', duration: .7 }, .3);
      gsap.fromTo('.specifications dl > div', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .55, stagger: .07, scrollTrigger: { trigger: '.specifications', start: 'top 75%', toggleActions: 'play none none reverse' } });
      return () => { clearHandoffs(); if (tick) gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; experience.assembly = 0; experience.assemblyScroll = 0; delete document.documentElement.dataset.editorialExit; };
    }, root);
    window.__VYREN_MOTION = () => ({ triggers: ScrollTrigger.getAll().length, assemblyTriggers: ScrollTrigger.getAll().filter(t => t.vars.id === 'vyren-assembly').length, lenis: !!lenis, reducedMotion: experience.reducedMotion });
    const resize = () => ScrollTrigger.refresh();
    document.fonts.ready.then(() => {
      if (!alive) return;
      resize();
      if (initialHash && location.hash === initialHash && !isAssemblyReload) {
        const target = document.getElementById(initialHash.slice(1));
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 76, behavior: 'instant' });
      }
    });
    const reducedChanged = () => { experience.reducedMotion = reducedQuery.matches; };
    reducedQuery.addEventListener('change', reducedChanged);
    return () => { alive = false; media.revert(); if (tick) gsap.ticker.remove(tick); lenis?.destroy(); reducedQuery.removeEventListener('change', reducedChanged); delete window.__VYREN_MOTION; };
  }, [root]);
}
