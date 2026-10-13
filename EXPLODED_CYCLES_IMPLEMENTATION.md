# VYREN cinematic exploded sequence

This section is a scroll-controlled, pre-rendered Blender Cycles animation of the original watch. It is not freely interactive 3D. The independent Three.js viewer in `#experience` retains rotation, presets, zoom and power controls.

## Source and rendering

The read-only script `D:\VYREN\02_BLENDER\scripts\render_exploded_scroll.py` loads `D:\VYREN\02_BLENDER\Projects\VYREN_NOCTIS_01_MASTER.blend`, sets its assembled pose at frame 1, clears the ten supported groups' old animation in memory, and applies absolute offsets from `D:\VYREN\05_WEB_EXPORT\assembly_transforms.json`. It never saves either original `.blend`. Every part's world matrix is checked at both endpoints. The returned pose must have zero matrix delta.

The first frame uses the original `CAM_HERO`, 66 mm lens, original orientation, materials, studio lights, world, AgX Medium High Contrast, +0.25 EV and gamma 1. The hero reference originates from the 1920×1440 transparent Cycles render in `04_RENDER_OUTPUT\Hero`, compressed to `hero-1600.webp`. Its 160-sample source and the new 128-sample, 1600×1200 render differ; visual similarity is measured without claiming pixel identity.

A 49-frame, 800×600, 32-sample preview was inspected before production. Production has 161 timeline positions, 128 samples, adaptive threshold 0.012, denoising and OptiX GPU rendering when available. Original light bounce settings are inherited. Identical static poses are rendered once and reused. Source PNGs and camera, assembly, anchor and provenance metadata remain in `D:\VYREN\04_RENDER_OUTPUT\Exploded_Scroll\production`.

The camera settles from 10%, the sapphire and crown start separating at 15%, supported groups stagger through 65%, all groups hold at 65–80%, and all groups return with smoothstep easing at 80–100%. A continuous camera bridge widens from 66 to 46 mm to fit the actual separated layers. At the end the original camera and assembly pose return. No new watch geometry or independent flat component images are used.

## Presentation and loading

`src\components\assembly-sequence.tsx` presents a responsive poster and a 2D canvas. The poster is the exact first delivery image. Transparent RGBA WebP frames composite on the existing `#14191e` background. Desktop uses 1600×1200. Mobile uses a verified uncropped-product portrait extraction `[350,0,1250,1200]`, delivered at 600×800. Canvas uses contain scaling at every width.

WebP quality 90 / method 4 was chosen after measuring both methods on the first production frame: method 4 took 0.30 s and 58,672 bytes versus method 6 at 2.59 s and 57,126 bytes. Both retained the alpha exactly; mean composited RGB errors were about 0.24/255. Method 4 preserves the quality target with a small size tradeoff and much shorter encoding time. The benchmark and comparison files are retained in `qa\exploded-cycles\encoding-evaluation`.

The existing `vyren-assembly` GSAP ScrollTrigger is the single playhead: section top to top, bottom to bottom, with existing scrub 0.55 desktop / 0.22 mobile. Frame index is `round(clamp(progress,0,1) * 160)`. Geometry easing is already baked into the Blender source. Forward and reverse navigation therefore use the same deterministic mapping.

`src\lib\cycles-sequence.ts` preloads within 900 px of the section, prioritizes the requested frame and four neighbours in either direction, fetches at concurrency 3 desktop / 2 mobile, and bounds decoded images at 12 desktop / 10 mobile. Superseded requests are aborted. Evicted ImageBitmaps are explicitly closed. Leaving the section or hiding the document releases decoded frames and pauses the rendering loop; the canvas retains its last valid presentation. Returning reloads only nearby frames, normally from the browser HTTP cache. The canvas draws only on frame or size changes. Hashed frames are immutable, while posters and manifest revalidate.

While a requested image is unavailable, the nearest ready pose toward the requested index can advance the presentation; otherwise the last valid frame remains. This prevents a slow first pass from freezing while frames arrive just behind the moving playhead. At rest the exact requested frame wins. The footer and projected labels always follow the displayed frame. Decoded anchors from Blender move the original labels and leaders. No video element, video controls or timer advances the animation. Reduced motion uses the existing explicit Separate layers / Reassemble buttons with static assembled and fully exploded images. Save-Data selects even timeline positions, including prefetched neighbours, to visit a smaller frame set.

The landing page does not wait for this sequence. The other eight sections' markup, motion, styling, assets and viewer source are preserved; assembly-only changes and exact file checks are included in the delivery audit.

## Reproduce

Run from PowerShell, keeping the loaded master unchanged:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background 'D:\VYREN\02_BLENDER\Projects\VYREN_NOCTIS_01_MASTER.blend' --python 'D:\VYREN\02_BLENDER\scripts\render_exploded_scroll.py' -- --mode preview --preview-frames 49
python D:\VYREN\06_WEBSITE\scripts\prepare-exploded-sequence.py --mode preview
# Inspect the preview and storyboard before the next command.
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background 'D:\VYREN\02_BLENDER\Projects\VYREN_NOCTIS_01_MASTER.blend' --python 'D:\VYREN\02_BLENDER\scripts\render_exploded_scroll.py' -- --mode production --count 161
python D:\VYREN\06_WEBSITE\scripts\prepare-exploded-sequence.py --mode production
```

The production script resumes existing PNGs. Use a fresh output folder if changing the camera, geometry, schedule or renderer settings, so existing frames cannot be mixed with new settings. Preview review status is reset by a new preview preparation and must be reinspected.

From `D:\VYREN\06_WEBSITE`:

```powershell
npm run typecheck
npm run lint
npm run build
npm run test:exploded
node scripts/capture-exploded.mjs after http://127.0.0.1:3001
node scripts/measure-exploded.mjs http://127.0.0.1:3001
```

The test config launches a local production server on port 3001 if needed. Measurements, screenshots, actual forward/reverse recordings, frame reviews, transfer logs and the final Arabic report are organized under `qa\exploded-cycles`. Desktop Edge viewport and touch emulation do not replace physical phone/tablet or Safari testing. Download stalls can hold a frame during fast seeking; the browser does not promise to display every rendered timeline position during a fast gesture.

The rollback entry is `D:\VYREN\08_BACKUPS\EXPLODED_CYCLES_ENTRY_20261010_232258`. Its 74 files have a verified SHA-256 manifest. The final source audit rechecks the protected Blender, assembly, GLB and CGI assets against the entry checkpoint.
