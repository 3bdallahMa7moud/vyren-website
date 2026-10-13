# Visual fidelity — real website compared with Cycles

Six image pairs were captured from the actual production Three.js scene and visually reviewed: hero, front, rear, movement, strap and crown. Reference PNGs are the existing controlled final-master Cycles renders under `04_RENDER_OUTPUT/Comparison_Final/Controlled/after`. Browser captures use matching camera positions, target orientation, lens/sensor-derived field of view, source aspect ratio, product dimensions, assembled state and a #343c42 background. Interface overlays are hidden only during comparison captures; the real renderer/model/materials remain in use.

The comparison script normalizes the browser image to the reference dimensions and measures mean absolute RGB difference. This includes the background and lighting, so it is **not a realism score, percent match or proof of radiometric equivalence**.

| View | Mean absolute RGB difference, 0–255 scale |
|---|---:|
| hero | 7.924 |
| front | 8.014 |
| rear | 10.701 |
| movement | 28.130 |
| strap | 19.388 |
| crown | 25.948 |

## Observed strengths and weaknesses

- **Hero:** the watch silhouette, case/crown proportions, integrated strap and dial layout agree closely. Browser metal is darker and flatter in its broad reflections; the deployant face reflects a darker studio region. The website hero/finale therefore use the actual Cycles render.
- **Front:** markers, hands, open-heart position and the 41mm case are faithful. Web transmission still softens small typography and bright edges; it is clearer at larger framing but does not equal Cycles. Both solid crystals remain present with transmission 1, IOR 1.76 and exported volume thickness (1.2mm front, 0.7mm rear).
- **Rear:** rotor/bridge geometry and strap silhouette are consistent. Browser glass, reduced multi-bounce shading and less indirect occlusion make the movement look shallower/brighter than Cycles.
- **Movement:** fine source geometry remains identifiable. The baked web microfinish, screen-space refraction and simple key shadows do not reproduce ray-traced contact shading or anisotropy. The website's extreme movement scene uses the actual Cycles macro.
- **Strap:** matte black rubber and the sculptural lug connection are preserved. Directional microfinish and interface shadows remain weaker/different; the key light can accentuate the baked normal response. Cycles supplies the material photograph.
- **Crown:** the flutes, engraved V and guard geometry match. Broad titanium gradients and polished-edge reflection layout are less photographic in the browser. Cycles supplies the craftsmanship macro.

## Website calibration choices

Existing Blender rectangle geometry/radiance reconstructed into a PMREM environment, Three.js AgX, sRGB output, 2^0.25 exposure; environment intensity adjusted from the asset harness's 0.35 to 0.45 for the website. Neutral fill 0.25 plus a restrained 0.8 key adds a 1024px PCF shadow pass on desktop. Static shadows are cached; assembly changes invalidate the map. Mobile and low-power mode omit this pass.

Source normal and roughness/metallic atlases are retained with their original non-color texture interpretation. A documented web approximation changes only the sapphire micro-roughness from 0.012 to 0.004 and uses a 1.5x transmission render target to improve clarity. Reflection, transmission, IOR, lens geometry and thickness remain intact. No invisible sapphire or alpha-glass shortcut is used.

The hybrid uses optimized still Cycles renders, animated with layered framing, masks and typography. No new Blender video/image sequence is claimed. A brief dark cut avoids crossfading incompatible product poses when the real-time slot becomes ready. There is no claim of photographic parity; the actual paired JPGs are in `qa/comparisons`.
