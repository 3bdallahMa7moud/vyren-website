export type ViewPreset = 'front' | 'rear' | 'detail' | 'hero' | 'movement' | 'strap' | 'crown';
export const experience = {
  assembly: 0,
  assemblyScroll: 0,
  viewerActive: false,
  preset: 'front' as ViewPreset,
  presetVersion: 0,
  reducedMotion: false,
  lowPower: false,
  zoomVersion: 0,
  zoomDirection: 0,
  manualAssembly: null as number | null,
  studioOrbit: false,
  studioFrame: 0,
};
export function requestPreset(preset: ViewPreset) { experience.preset = preset; experience.presetVersion++; }
export function requestZoom(direction: number) { experience.zoomDirection = direction; experience.zoomVersion++; }
