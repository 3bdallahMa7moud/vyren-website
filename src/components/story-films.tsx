'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CyclesSurface, type SurfaceDiagnostics } from './cycles-surface';
import { materialStops, materialStudyLength, storyAssetPath, storyFrames } from '@/lib/story-timing';

gsap.registerPlugin(ScrollTrigger);
type Film = keyof typeof storyFrames;
declare global { interface Window { __VYREN_STORY?: Partial<Record<Film, () => SurfaceDiagnostics>>; } }
export function StoryFilm({ kind, materialIndex }: { kind: Film; materialIndex?: number }) {
  const element = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const count = storyFrames[kind];
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 769px)' }, context => {
      if (!element.current) return;
      if (!context.conditions?.motion) { setFrame(kind === 'movement' ? 30 : 9); return; }
      const horizontal = materialIndex !== undefined && context.conditions.desktop;
      const section = element.current.closest<HTMLElement>(kind === 'movement' ? '.movement' : horizontal ? '.materials' : '.material-panel');
      if (!section) return;
      const play = { frame: 0, exit: 0 };
      const present = () => setFrame(Math.round(play.frame * (1 - play.exit)));
      const span = () => Math.max(1, section.offsetHeight - innerHeight);
      gsap.fromTo(play, { frame: 0 }, {
        frame: count - 1, ease: 'none', onUpdate: present,
        scrollTrigger: {
          id: `story-${kind}`, trigger: section,
          start: horizontal ? () => `top+=${span() * materialStops[materialIndex!]} top` : kind === 'movement' ? 'top top' : 'top 72%',
          end: horizontal ? () => `+=${span() * materialStudyLength}` : kind === 'movement' ? 'bottom bottom' : 'bottom 42%',
          scrub: context.conditions.desktop ? .3 : .18, invalidateOnRefresh: true,
        },
      });
      // The study reaches its final frame first. At the next chapter boundary,
      // its original camera path runs back out of the mechanism or strap.
      if (kind === 'movement' || (kind === 'rubber' && context.conditions.desktop)) {
        gsap.fromTo(play, { exit: 0 }, {
          exit: 1, ease: 'none', onUpdate: present,
          scrollTrigger: { id: `exit-${kind}`, trigger: kind === 'movement' ? '.assembly' : '.viewer', start: 'top 72%', end: 'top 44%', scrub: context.conditions.desktop ? .22 : .12, invalidateOnRefresh: true },
        });
      }
    });
    return () => media.revert();
  }, [kind, materialIndex, count]);
  return <div ref={element} className={`story-film story-${kind}`}>
    <CyclesSurface frame={frame} count={count} path={storyAssetPath} prefix={`${kind}-`} fit="cover" diagnostics={read => {
      if (read) { window.__VYREN_STORY ??= {}; window.__VYREN_STORY[kind] = read; }
      else if (window.__VYREN_STORY) delete window.__VYREN_STORY[kind];
    }} label={kind === 'movement' ? 'Original Cycles camera approach and moving balance with its anchored hairspring' : `Original Cycles ${kind} camera and reflection study`} />
  </div>;
}
