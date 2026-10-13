# Phase 2 — Visual fidelity

The source GLB and 16 protected originals remain SHA256-identical. Every watch image is an authentic Blender render of the actual master. The new 30-frame Hero orbit rotates only the real camera in a read-only background Blender process; geometry, materials and studio lighting are unchanged. Source edits and .blend saves are absent.

Scene screenshot pairs: viewport 1440×1000 / mobile 390×844, DPR 1, same normalized scene progress and controls. Scene heights, camera framing and light calibration intentionally differ. The larger watch and changed spacing mean pixel scroll positions differ; these are editorial before/after comparisons, not radiometric tests. Hero is back at its original pose after the once-only orbit.

WebGL reference pairs: same original camera positions/up vectors, target, sensor/lens-derived FOV, source aspect and background, assembled transforms, and the real renderer. Existing reference poses are stored separately from the new viewer presets. Capture uses settled optical quality, not moving-buffer quality. Exposure/light/normal calibration changed and is disclosed in the cinematic report. Original PBR maps, metallic factors and dielectric lens properties remain intact.

| View | Before RGB difference | After RGB difference |
|---|---:|---:|
| hero | 7.917 | 8.058 |
| front | 8.009 | 8.036 |
| rear | 10.695 | 10.706 |
| movement | 28.108 | 30.545 |
| strap | 19.372 | 17.992 |
| crown | 25.927 | 24.339 |

Mean absolute whole-image RGB difference includes background and lighting. It is not a realism score, percentage match or photographic-equivalence test. Inspect the actual triptychs in `qa/phase2-cinematic/comparisons/fidelity-*.jpg`.

Observed limits: broad titanium reflections can still appear flatter than Cycles; screen-space solid-glass transmission softens the smallest text and fine edges; multi-bounce occlusion and microfinish anisotropy remain weaker. The existing Cycles macro images preserve those details. No invisible-glass shortcut, new approximation watch or unsupported mechanical animation was used. The fictional calibre is not certified or claimed mechanically functional.
