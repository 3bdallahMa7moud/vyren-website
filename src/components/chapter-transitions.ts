import gsap from 'gsap';

/** Photographic handoffs share scroll distance with the existing chapters.
 * Camera wrappers keep these transforms independent of the frame studies.
 */
export function chapterTransitions(root: HTMLDivElement, desktop: boolean) {
  const cleanups: (() => void)[] = [];
  const handoff = (id: string, trigger: string, start = 'top 72%', end = 'top 44%') => {
    const element = root.querySelector<HTMLElement>(trigger)!;
    const section = element.closest<HTMLElement>('section')!;
    section.dataset.handoff = id;
    cleanups.push(() => { delete section.dataset.handoff; delete section.dataset.handoffProgress; });
    const timeline = gsap.timeline({
      scrollTrigger: {
        id: `handoff-${id}`, trigger: element, start, end,
        scrub: desktop ? .22 : .12, invalidateOnRefresh: true,
      },
      onUpdate: function () { section.dataset.handoffProgress = this.progress().toFixed(4); },
      defaults: { ease: 'power2.inOut', duration: 1 },
    });
    return timeline;
  };

  // Ivory rises in the page while the silhouette settles into the editorial.
  handoff('01-02', '.manifesto')
    .fromTo('.manifesto', { clipPath: 'inset(12svh 0 0 0)' }, { clipPath: 'inset(0svh 0 0 0)' }, 0)
    .fromTo('.manifesto-product', { scale: 1.09 }, { scale: 1 }, 0)
    .to('.hero-bottom > *', { opacity: 0, ease: 'none' }, 0);

  // The existing dark curtain covers the editorial; the next macro opens wide.
  handoff('02-03', '.case-film', 'top 85%', 'top 55%')
    .fromTo('.craft-camera', { scale: 1.15, clipPath: 'inset(0 12% 0 0)' }, { scale: 1, clipPath: 'inset(0 0% 0 0)' }, 0);

  // Move off the crown and open a view into the dial, with no blur on the metal.
  handoff('03-04', '.movement')
    .to('.craft-handoff', { scale: 1.08, xPercent: -3, opacity: .35 }, 0)
    .fromTo('.movement-camera', { scale: 1.13, xPercent: 4, clipPath: 'inset(9% 0 0 18%)' }, { scale: 1, xPercent: 0, clipPath: 'inset(0% 0 0 0%)' }, 0)
    .to('.craft-bottom', { opacity: .25, ease: 'none' }, 0);

  // StoryFilm retreats through its real Cycles camera frames during this handoff.
  handoff('04-05', '.assembly')
    .to('.movement-image', { scale: .94, opacity: .3 }, 0)
    .to('.movement-footer', { opacity: 0, ease: 'none' }, 0)
    .fromTo('.assembly-camera', { scale: .92, yPercent: 4, clipPath: 'inset(0 0 12% 0)' }, { scale: 1, yPercent: 0, clipPath: 'inset(0 0 0% 0)' }, 0);

  // Reassembly finishes in chapter five before the next surface moves closer.
  handoff('05-06', '.materials')
    .to('.assembly-slot', { scale: 1.09, opacity: .35 }, 0)
    .to('.assembly-footer', { opacity: .2, ease: 'none' }, 0)
    .fromTo('.material-titanium .material-camera', { scale: 1.13, xPercent: -3 }, { scale: 1, xPercent: 0 }, 0);

  // Pull back from the strap. The Studio stops moving before its controls arrive.
  handoff('06-07', '.viewer')
    .to('.material-rubber .material-camera', { scale: .96, opacity: .35 }, 0)
    .fromTo('.studio-shell', { clipPath: 'inset(8% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }, 0)
    .fromTo('.studio-image-area', { scale: 1.06 }, { scale: 1 }, 0);

  // The original front photograph dissolves into its matching mesh projection.
  // Blueprint owns that image blend once it has decoded; this owns the camera.
  handoff('07-08', '.dimension-image', 'top 82%', 'top 54%')
    .fromTo('.dimension-image > .product-media', { scale: 1.06 }, { scale: 1 }, 0);

  // The drawing dims and the rim-lit finale arrives before its own turn begins.
  handoff('08-09', '.finale')
    .to('.dimension-image', { opacity: .3, ease: 'none' }, 0)
    .fromTo('.final-product', { opacity: 0, y: desktop ? 18 : 10 }, { opacity: 1, y: 0 }, 0);

  return () => cleanups.forEach(cleanup => cleanup());
}
