# Phase 2 — Performance

Actual separate mouse-drag probe, same Edge 155.0.4283.45, 1440×1000, DPR 1, ANGLE Intel UHD. Before 47.91 FPS; after 45.28 FPS (-5.5%). These are rendered-frame observations during the recorded input path, not field metrics or a promise on every device. The earlier 48.1 FPS report sampled idle rendering; this new before/after samples actual rotation.

Static 3-second rendered-frame count: 145 → 0. Offscreen rendering also suspends. The RAF driver still checks presentation and controls, but expensive WebGL/transmission work is skipped. Absolute transforms are computed from source rest data; no delta accumulation. A tiny signature quantization avoids drawing imperceptible damping residue and does not modify rest transforms.

Draw calls: 167 → 167; peak remains 250 when shadow updates. Source geometry: 360,274 triangles, 85 mesh primitives, 27 materials, 10 assembly groups. Texture count remains 7; PMREM resolution doubles, which costs additional environment memory. Shader programs precompile once before ready. Source GLB remains 15.00 MiB and remains deferred beyond initial Hero.

Moving optical buffer: 1.0; settled: 1.5; Low power: 0.5 + DPR 0.8 + no desktop shadow pass. A first calibration at full optical sampling throughout interaction fell to ~31 FPS; the measured moving-buffer path recovered responsiveness. Native DPR 1 remains intact; high-DPR screens can reduce their cap toward 1 when sustained render intervals exceed 28 ms. This is a documented sampling tradeoff, not a reduction in geometry or glass material fidelity.

Mean CPU render-call time in the latest probe: 6.21 ms versus 1.91 ms. It includes driver work and buffer quality changes; it is not GPU time. LCP/CLS observations are loopback snapshots, not Lighthouse scores: 160 ms / 0.000409. Initial recorded resources: 1,285,364 bytes; Hero orbit adds 900,550 bytes on eligible desktops after the poster, then unmounts. Mobile/reduced-motion/deep links skip it. Original 24 WebP stills stay unchanged.

No Draco/Meshopt/KTX2 or product-detail decimation was applied. Compare source JSON probes and screenshots; no real phone, Safari or mobile GPU performance was available.
