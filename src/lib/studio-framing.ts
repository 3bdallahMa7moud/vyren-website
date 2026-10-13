// Union of alpha > 16 bounds in all 72 authentic 1600 × 1200 frames.
// A constant subject fit keeps scale stable throughout rotation.
export const STUDIO_BOUNDS = { left: 404, top: 210, right: 1191, bottom: 995 };
export function studioFraming(width: number, height: number, mobile: boolean) {
  const inset = mobile ? 8 : 36, top = mobile ? 54 : 52, bottom = mobile ? 30 : 38;
  const scale = Math.max(.01, Math.min(1, (width - inset * 2) / 787, (height - top - bottom) / 785));
  const sourceWidth = mobile ? 900 : 1600;
  const centerX = 797.5 - (mobile ? 347 : 0), centerY = 602.5;
  return { scale, x: width / 2 - centerX * scale, y: (height + top - bottom) / 2 - centerY * scale, width: sourceWidth * scale, height: 1200 * scale };
}

// Source CAM_HERO matrix (frame 0), rotated around the source Y axis.
// Blender (X,Y,Z) maps to glTF (X,Z,-Y). Lens: 66 mm, sensor: 36 mm.
export function studioCamera(frame: number) {
  const a = frame / 72 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
  return {
    position: [(.11830000579357147 * c + .22100001387298106 * s), -.016 + (-.11830000579357147 * s + .22100001387298106 * c), .15469999611377716],
    up: [-.4557463526725769 * c + .6611414551734924 * s, .4557463526725769 * s + .6611414551734924 * c, -.5959758758544922],
    target: [0, -.016, 0],
  };
}
