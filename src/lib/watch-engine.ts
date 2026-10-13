import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import gsap from 'gsap';
import { experience, type ViewPreset } from './experience-state';
import viewerAsset from './viewer-asset.json';
import { studioCamera, studioFraming } from './studio-framing';

type AssemblyEntry = { start_frame: number; fully_exploded_frame: number; gltf_local_exploded_offset_m: [number, number, number] };
type AssemblyData = { assemblies: Record<string, AssemblyEntry> };
type StudioCard = { matrix: number[][]; energy: number; size: number; size_y: number; color: [number, number, number] };
type Pose = { position: [number, number, number]; target: [number, number, number]; up: [number, number, number]; fov: number };
export type EngineCallbacks = { progress: (loaded: number, total: number) => void; ready: () => void; error: (message: string) => void };
const REFERENCE_POSES: Record<ViewPreset, Pose> = {
  front: { position: [0, .175, .0001], target: [0, -.009, 0], up: [0, 0, -1], fov: 29 },
  rear: { position: [.085, -.156, .1], target: [0, -.018, 0], up: [0, 1, 0], fov: 29.6 },
  detail: { position: [.012, .084, .026], target: [0, .0015, -.001], up: [0, 0, -1], fov: 22.14 },
  hero: { position: [.091, .154, .119], target: [0, -.016, 0], up: [0, 1, 0], fov: 22.5 },
  movement: { position: [-.015, .047, .023], target: [-.0066, .0004, .0065], up: [0, 1, 0], fov: 19.46 },
  strap: { position: [.038, .037, .057], target: [.007, -.002, .021], up: [0, 1, 0], fov: 16.7 },
  crown: { position: [.07, .026, .033], target: [.021, 0, 0], up: [0, 1, 0], fov: 13.99 },
};
const POSES: Record<ViewPreset, Pose> = {
  ...REFERENCE_POSES,
  front: { position: [.028, .135, .055], target: [0, -.009, 0], up: [0, 0, -1], fov: 29 },
  rear: { position: [.05, -.125, .07], target: [0, -.013, 0], up: [0, 0, -1], fov: 29.6 },
  detail: { position: [.008, .079, .017], target: [0, .0015, -.001], up: [0, 0, -1], fov: 23.5 },
};

export class WatchEngine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(29, 1, .0001, 5);
  readonly controls: OrbitControls;
  private model?: THREE.Group;
  private productPoints = new Float32Array();
  private fitCache = new Map<string, number>();
  private assemblies: { object: THREE.Object3D; rest: THREE.Vector3; restMatrix: THREE.Matrix4; offset: THREE.Vector3; start: number; end: number }[] = [];
  private anchors: { object: THREE.Object3D; point: THREE.Vector3; label: HTMLElement; line: SVGLineElement | null }[] = [];
  private lastPresentation = '';
  private renderedIntervals: number[] = [];
  private adaptiveDpr = Math.min(devicePixelRatio, 1.5);
  private abort = new AbortController();
  private studioCards?: Record<string, StudioCard>;
  private contextVersion = 0;
  private movingUntil = 0;
  private lastAssemblyScroll = 0;
  private pmremTarget?: THREE.WebGLRenderTarget;
  private raf = 0;
  private disposed = false;
  private ready = false;
  private lost = false;
  private activeSlot: HTMLElement | null = null;
  private activeType = '';
  private slots: HTMLElement[];
  private resizeObserver: ResizeObserver;
  private animation?: gsap.core.Tween;
  private poseVersion = -1;
  private renderedPresetVersion = -1;
  private zoomVersion = -1;
  private quality = false;
  private lastSize = '';
  private lastRender = 0;
  private started = 0;
  private frameTimes: number[] = [];
  private frameCount = 0;
  private peakRenderCalls = 0;
  private shadowUpdates = 0;
  private testPose = false;
  private assembledFactor = 0;
  private metadata: Record<string, unknown> = {};
  private keyLight: THREE.DirectionalLight;
  private onContextLost = (e: Event) => {
    e.preventDefault(); this.contextVersion++; this.lost = true; this.ready = false;
    this.controls.enabled = false; this.animation?.kill();
    this.slots.forEach(slot => slot.dataset.ready = 'false'); this.renderer.domElement.style.visibility = 'hidden';
    this.callbacks.error('The studio is reconnecting. You can also try again.');
  };
  private onContextRestored = async () => {
    const version = this.contextVersion;
    if (this.disposed) return;
    this.lost = false;
    try {
      // Three recreates its context; generated lighting and cached shadow targets
      // have no source pixels to re-upload, so recreate these GPU resources too.
      this.pmremTarget?.dispose();
      if (this.studioCards) this.setupStudio(this.studioCards);
      this.keyLight.shadow.dispose(); this.keyLight.shadow.map = null;
      this.renderer.shadowMap.needsUpdate = true;
      if (this.model) {
        await this.renderer.compileAsync(this.scene, this.camera);
        if (this.disposed || this.lost || version !== this.contextVersion) return;
        this.ready = true; this.lastPresentation = ''; this.lastRender = 0; this.callbacks.ready();
      }
    } catch (e) { if (!this.disposed) this.callbacks.error(e instanceof Error ? e.message : 'Please try the studio again.'); }
  };
  private onKeyDown = (e: KeyboardEvent) => {
    if (!experience.viewerActive || !this.ready || this.lost || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Escape') { e.preventDefault(); experience.viewerActive = false; window.dispatchEvent(new Event('vyren-finish-exploring')); return; }
    if (['+', '=', '-', '_'].includes(e.key)) { e.preventDefault(); experience.zoomDirection = ['+', '='].includes(e.key) ? -1 : 1; experience.zoomVersion++; return; }
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
    e.preventDefault(); this.animation?.kill(); this.clearInertia();
    const toY = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0,1,0));
    const offset = this.camera.position.clone().sub(this.controls.target).applyQuaternion(toY);
    const spherical = new THREE.Spherical().setFromVector3(offset), step = Math.PI / 30;
    spherical.theta += e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0), this.controls.minPolarAngle, this.controls.maxPolarAngle);
    this.camera.position.copy(this.controls.target).add(offset.setFromSpherical(spherical).applyQuaternion(toY.invert()));
    this.camera.lookAt(this.controls.target); this.controls.update(); this.movingUntil = performance.now() + 150;
  };

  constructor(private host: HTMLDivElement, private callbacks: EngineCallbacks) {
    this.slots = Array.from(document.querySelectorAll<HTMLElement>('.webgl-slot'));
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMappingExposure = 2 ** .25;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.transmissionResolutionScale = 1.5;
    this.renderer.info.autoReset = false;
    this.scene.background = new THREE.Color('#14191e');
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x252a30, .12));
    this.keyLight = new THREE.DirectionalLight(0xf0f7ff, .8);
    this.keyLight.position.set(-.072, .095, .045); this.keyLight.target.position.set(0, -.005, 0);
    this.keyLight.castShadow = true; this.keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(this.keyLight.shadow.camera, { left: -.1, right: .1, top: .1, bottom: -.1, near: .001, far: .5 });
    this.keyLight.shadow.camera.updateProjectionMatrix();
    this.keyLight.shadow.bias = -.000008; this.keyLight.shadow.normalBias = .00004; this.keyLight.shadow.radius = 3;
    this.scene.add(this.keyLight, this.keyLight.target);
    const edgeFill = new THREE.DirectionalLight(0xfff2e0, .26);
    edgeFill.position.set(.075, .015, -.08); this.scene.add(edgeFill);
    this.renderer.shadowMap.enabled = innerWidth > 768; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false; this.renderer.shadowMap.needsUpdate = true;
    this.host.appendChild(this.renderer.domElement);
    this.renderer.domElement.dataset.vyrenCanvas = 'true';
    Object.assign(this.renderer.domElement.style, { position: 'absolute', inset: '0', zIndex: '3' });
    this.renderer.domElement.setAttribute('aria-label', 'VYREN NOCTIS 01 interactive 3D canvas');
    this.renderer.domElement.setAttribute('role', 'img');
    this.renderer.domElement.setAttribute('aria-describedby', 'viewer-instruction');
    this.renderer.domElement.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown + - Escape');
    this.renderer.domElement.tabIndex = -1;
    this.renderer.domElement.addEventListener('keydown', this.onKeyDown);
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);
    this.camera.up.set(0, 0, -1);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; this.controls.dampingFactor = .065;
    this.controls.enablePan = false; this.controls.enableZoom = false;
    this.controls.minDistance = .06; this.controls.maxDistance = .5;
    this.controls.minPolarAngle = .08; this.controls.maxPolarAngle = Math.PI - .08;
    this.controls.rotateSpeed = .48; this.controls.enabled = false;
    this.resizeObserver = new ResizeObserver(() => { this.lastSize = ''; });
    this.slots.forEach(slot => this.resizeObserver.observe(slot));
    this.applyPose('front', false);
    void this.load();
    this.raf = requestAnimationFrame(this.frame);
  }

  private async load() {
    try {
      const [assembly, lights] = await Promise.all([
        this.fetchWithRetry('/assets/assembly.json').then(r => r.json() as Promise<AssemblyData>),
        this.fetchWithRetry('/assets/studio.json').then(r => r.json() as Promise<Record<string, StudioCard>>),
      ]);
      if (this.disposed) return;
      this.studioCards = lights;
      if (!this.lost) this.setupStudio(lights);
      const buffer = await this.fetchWithRetry(viewerAsset.path, true) as ArrayBuffer;
      if (this.disposed) return;
      this.callbacks.progress(buffer.byteLength, buffer.byteLength);
      const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buffer, '/assets/');
      if (this.disposed) { this.disposeModel(gltf.scene); return; }
      this.model = gltf.scene; this.scene.add(this.model);
      this.model.updateMatrixWorld(true);
      this.assemblies = Object.entries(assembly.assemblies).map(([name, entry]) => {
        const object = gltf.scene.getObjectByName(name);
        if (!object) throw new Error(`Missing assembly: ${name}`);
        object.updateMatrix();
        return { object, rest: object.position.clone(), restMatrix: object.matrix.clone(), offset: new THREE.Vector3(...entry.gltf_local_exploded_offset_m), start: entry.start_frame, end: entry.fully_exploded_frame };
      });
      const materials = new Set<THREE.Material>(); let meshes = 0; let triangles = 0;
      const points: number[] = [], point = new THREE.Vector3();
      this.model.traverse(object => {
        if (object instanceof THREE.Mesh) {
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
          object.castShadow = !objectMaterials.some(m => m instanceof THREE.MeshPhysicalMaterial && m.transmission > .5);
          object.receiveShadow = object.castShadow;
          meshes++; triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
          const positions = object.geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) { point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld); points.push(point.x, point.y, point.z); }
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
        }
      });
      this.productPoints = new Float32Array(points);
      // Retain the polished source lens. A small web roughness compensation keeps
      // the dial readable through Three's screen-space transmission buffer.
      materials.forEach(material => {
        if (material instanceof THREE.MeshPhysicalMaterial && material.name.includes('SAPPHIRE')) material.roughness = .006;
        // Retain the atlases and channel interpretation; soften overpronounced web microfinish.
        if (material instanceof THREE.MeshStandardMaterial && material.name.includes('TITANIUM') && material.name.includes('exterior_BAKED') && material.normalMap) material.normalScale.setScalar(.75);
      });
      this.anchors = Array.from(document.querySelectorAll<HTMLElement>('.assembly-labels > [data-anchor]')).flatMap(label => {
        const object = gltf.scene.getObjectByName(label.dataset.anchor!); if (!object) return [];
        const point = object.worldToLocal(new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3()));
        const line = document.querySelector<SVGLineElement>(`.assembly-leaders line[data-anchor="${label.dataset.anchor}"]`);
        return [{ object, point, label, line }];
      });
      const sapphire = [...materials].filter(m => m instanceof THREE.MeshPhysicalMaterial && m.name.includes('SAPPHIRE')).map(m => { const physical = m as THREE.MeshPhysicalMaterial; return { name: m.name, transmission: physical.transmission, ior: physical.ior, thickness: physical.thickness, opacity: physical.opacity, roughness: physical.roughness, sourceRoughness: .012 }; });
      const caseObject = this.model.getObjectByName('case_main');
      this.metadata = { meshes, materials: materials.size, geometryTriangles: triangles, assemblies: this.assemblies.length, sapphire, normalCalibration: .75, caseMm: caseObject ? new THREE.Box3().setFromObject(caseObject).getSize(new THREE.Vector3()).multiplyScalar(1000).toArray() : null, threeRevision: THREE.REVISION };
      if (this.lost) return;
      await this.renderer.compileAsync(this.scene, this.camera);
      if (this.disposed || this.lost) return;
      this.started = performance.now(); this.ready = true; this.callbacks.ready();
    } catch (e) { if (!this.disposed) this.callbacks.error(e instanceof Error ? e.message : 'The 3D studio is unavailable.'); }
  }

  private async fetchWithRetry(url: string): Promise<Response>;
  private async fetchWithRetry(url: string, model: true): Promise<ArrayBuffer>;
  private async fetchWithRetry(url: string, model = false): Promise<Response | ArrayBuffer> {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch(url, { signal: this.abort.signal });
        if (!response.ok) throw new Error(`Studio asset unavailable (${response.status})`);
        if (!model) return response;
        this.callbacks.progress(0, viewerAsset.bytes);
        if (!response.body) return await response.arrayBuffer();
        const reader = response.body.getReader(), chunks: Uint8Array[] = []; let loaded = 0;
        try {
          for (;;) {
            const { done, value } = await reader.read(); if (done) break;
            chunks.push(value); loaded += value.byteLength; this.callbacks.progress(loaded, viewerAsset.bytes);
          }
        } finally { reader.releaseLock(); }
        const bytes = new Uint8Array(loaded); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
        return bytes.buffer;
      } catch (error) {
        if (this.disposed || this.abort.signal.aborted || attempt >= 2) throw error;
        await new Promise<void>((resolve, reject) => {
          const abort = () => { clearTimeout(timer); reject(this.abort.signal.reason); };
          const timer = setTimeout(() => { this.abort.signal.removeEventListener('abort', abort); resolve(); }, 500 * (attempt + 1));
          this.abort.signal.addEventListener('abort', abort, { once: true });
        });
      }
    }
  }

  private setupStudio(cards: Record<string, StudioCard>) {
    const studio = new THREE.Scene(); studio.background = new THREE.Color(.0456, .057, .0684);
    const conversion = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
    for (const [name, spec] of Object.entries(cards)) {
      const radiance = spec.energy / (Math.PI * spec.size * spec.size_y);
      const gain = name === 'SOFTBOX_key' ? .92 : name === 'CARD_front' ? .78 : 1;
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(spec.size * 30, spec.size_y * 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(...spec.color).multiplyScalar(radiance * gain), side: THREE.DoubleSide }));
      const matrix = new THREE.Matrix4().fromArray(spec.matrix.flat()).transpose().premultiply(conversion);
      matrix.elements[12] *= 30; matrix.elements[13] *= 30; matrix.elements[14] *= 30;
      panel.matrixAutoUpdate = false; panel.matrix.copy(matrix); studio.add(panel);
    }
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.pmremTarget = pmrem.fromScene(studio, 0, .01, 100, { size: 512 });
    this.scene.environment = this.pmremTarget.texture; this.scene.environmentIntensity = .62;
    studio.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); } });
    pmrem.dispose();
  }

  private applyAssembly(factor: number) {
    if (Math.abs(this.assembledFactor - factor) > 1e-6) this.renderer.shadowMap.needsUpdate = true;
    this.assembledFactor = factor;
    // Metadata frame timing preserves the source stagger and the exact local hierarchy.
    const frame = 44 + factor * 71;
    this.assemblies.forEach(({ object, rest, offset, start, end }) => {
      const t = THREE.MathUtils.clamp((frame - start) / (end - start), 0, 1);
      const smooth = t * t * (3 - 2 * t);
      object.position.copy(rest).addScaledVector(offset, smooth);
    });
  }

  private clearInertia() {
    const position = this.camera.position.clone(), target = this.controls.target.clone();
    this.controls.enableDamping = false; this.controls.update(); this.controls.enableDamping = true;
    this.camera.position.copy(position); this.controls.target.copy(target); this.camera.lookAt(target);
  }

  private applyPose(name: ViewPreset, animate = true, reference = false) {
    if (experience.studioOrbit && !reference) { this.applyStudioPose(); return; }
    this.animation?.kill();
    this.camera.clearViewOffset();
    this.clearInertia();
    const pose = (reference ? REFERENCE_POSES : POSES)[name];
    this.camera.up.fromArray(pose.up);
    const from = { px: this.camera.position.x, py: this.camera.position.y, pz: this.camera.position.z, tx: this.controls.target.x, ty: this.controls.target.y, tz: this.controls.target.z, fov: this.camera.fov };
    const to = { px: pose.position[0], py: pose.position[1], pz: pose.position[2], tx: pose.target[0], ty: pose.target[1], tz: pose.target[2], fov: pose.fov * (!reference && name === 'detail' && this.camera.aspect < .8 ? 1.22 : 1) };
    // Complete-product presets fit with a margin at every aspect. Detail and
    // Blender reference cameras retain their deliberately authored framing.
    if (!reference && this.model && (name === 'front' || name === 'rear')) {
      const target = new THREE.Vector3(...pose.target), direction = new THREE.Vector3(...pose.position).sub(target);
      const distance = direction.length(); direction.normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(...pose.up), direction).normalize();
      const up = new THREE.Vector3().crossVectors(direction, right).normalize();
      const tan = Math.tan(THREE.MathUtils.degToRad(pose.fov) / 2), key = `${name}:${this.camera.aspect.toFixed(5)}`;
      let fitted = this.fitCache.get(key) ?? distance;
      if (!this.fitCache.has(key)) {
        const point = new THREE.Vector3();
        for (let i = 0; i < this.productPoints.length; i += 3) {
          point.fromArray(this.productPoints, i).sub(target);
          fitted = Math.max(fitted, point.dot(direction) + Math.max(Math.abs(point.dot(up)) / tan, Math.abs(point.dot(right)) / (tan * this.camera.aspect)) / .88);
        }
        if (this.fitCache.size > 16) this.fitCache.clear();
        this.fitCache.set(key, fitted);
      }
      const position = target.addScaledVector(direction, fitted); to.px = position.x; to.py = position.y; to.pz = position.z;
    }
    const update = () => {
      this.camera.position.set(from.px, from.py, from.pz); this.controls.target.set(from.tx, from.ty, from.tz);
      this.camera.fov = from.fov; this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.controls.target);
    };
    if (animate && !experience.reducedMotion) this.animation = gsap.to(from, { ...to, duration: .95, ease: 'power2.inOut', onUpdate: update });
    else { Object.assign(from, to); update(); }
  }

  private applyStudioPose() {
    this.animation?.kill(); this.clearInertia();
    const pose=studioCamera(experience.studioFrame),r=this.activeSlot?.getBoundingClientRect();
    this.controls.target.fromArray(pose.target);this.camera.position.fromArray(pose.position);this.camera.up.fromArray(pose.up);
    const width=r?.width || 1600,height=r?.height || 1200,mobile=innerWidth<=768,f=studioFraming(width,height,mobile);
    const baseTan=36/(2*66*4/3);
    this.camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(baseTan*height/(1200*f.scale)));
    // The same small alpha-centering translation used by the image compositor.
    this.camera.setViewOffset(width,height, width/2-(f.x+(mobile?450:800)*f.scale),height/2-(f.y+600*f.scale),width,height);
    this.camera.updateProjectionMatrix(); this.camera.lookAt(this.controls.target); this.controls.update(); this.lastPresentation = '';
  }

  private assemblyCamera(progress: number) {
    const mobile = innerWidth < 769;
    const align = THREE.MathUtils.smoothstep(progress, .04, .14);
    const separate = this.assembledFactor;
    const resolve = THREE.MathUtils.smoothstep(progress, .91, 1);
    const orbit = Math.sin(Math.PI * THREE.MathUtils.smoothstep(progress, .15, .9));
    const distance = mobile ? 1.16 : 1;
    this.camera.up.set(0, 1, 0);
    this.camera.position.set((.083 + .013 * align + .007 * orbit - .013 * resolve) * distance, (.147 - .034 * align + .016 * separate + .034 * resolve) * distance, (.12 + .018 * align + .003 * orbit - .018 * resolve) * distance);
    this.controls.target.set(0, -.009 + .017 * separate, 0);
    this.camera.fov = this.camera.aspect < 1 ? 38 : 29.5;
    this.camera.lookAt(this.controls.target); this.camera.updateProjectionMatrix();
  }

  private positionLabels(rect: DOMRect) {
    if (!this.activeSlot || !this.anchors.length) return;
    const parent = this.activeSlot.parentElement!;
    const base = parent.getBoundingClientRect();
    this.model!.updateMatrixWorld(true); this.camera.updateMatrixWorld(true);
    let previous = 0;
    for (const { object, point, label, line } of this.anchors) {
      const p = object.localToWorld(point.clone()).project(this.camera);
      const x = rect.left - base.left + (p.x + 1) * rect.width / 2;
      const y = rect.top - base.top + (1 - p.y) * rect.height / 2;
      const top = Math.max(previous + (innerWidth < 769 ? 32 : 64), Math.min(base.height - 140, Math.max(innerWidth < 769 ? base.height * .45 : 150, y)));
      previous = top; label.style.top = `${top}px`;
      if (line && innerWidth > 768) { line.setAttribute('x1', `${x}`); line.setAttribute('y1', `${y}`); line.setAttribute('x2', `${base.width - 220}`); line.setAttribute('y2', `${top + 6}`); }
    }
  }

  private frame = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.frame);
    if (!this.ready || this.lost || document.hidden) return;
    const candidate = this.slots.map(slot => ({ slot, rect: slot.getBoundingClientRect() })).filter(({ rect }) => rect.bottom > 0 && rect.top < innerHeight && rect.width > 0).sort((a, b) => Math.min(b.rect.bottom, innerHeight) - Math.max(b.rect.top, 0) - (Math.min(a.rect.bottom, innerHeight) - Math.max(a.rect.top, 0)))[0];
    if (!candidate) { this.renderer.domElement.style.visibility = 'hidden'; this.controls.enabled = false; this.lastRender = 0; return; }
    const { slot, rect } = candidate;
    if (this.activeSlot !== slot) {
      this.activeSlot?.setAttribute('data-ready', 'false');
      this.activeSlot = slot; this.activeType = slot.dataset.stage ?? ''; this.testPose = false;
      // Move the same canvas, renderer and model into the active composition.
      // Local stacking keeps editorial annotations above it, including sticky scenes.
      slot.appendChild(this.renderer.domElement);
      slot.dataset.ready = 'false'; this.lastSize = ''; this.lastPresentation = ''; this.poseVersion = experience.presetVersion;
      this.applyAssembly(0); this.applyPose(this.activeType === 'viewer' ? experience.preset : 'hero', false);
    }
    this.renderer.domElement.style.visibility = 'visible';
    const sizeKey = `${Math.round(rect.width)}:${Math.round(rect.height)}`;
    if (sizeKey !== this.lastSize) {
      this.lastSize = sizeKey; this.renderer.setSize(rect.width, rect.height);
      this.host.style.width = `${rect.width}px`; this.host.style.height = `${rect.height}px`;
      this.camera.aspect = rect.width / rect.height; this.camera.updateProjectionMatrix();
      if (this.activeType === 'viewer' && !experience.viewerActive) this.applyPose(experience.preset, false);
    }
    const low = experience.lowPower;
    const shadows = innerWidth > 768 && !low;
    if (this.renderer.shadowMap.enabled !== shadows) { this.renderer.shadowMap.enabled = shadows; this.renderer.shadowMap.needsUpdate = true; }
    if (this.quality !== low) { this.quality = low; this.renderer.transmissionResolutionScale = low ? .5 : 1.5; this.lastPresentation = ''; }
    if (this.lastRender && now - this.lastRender < (low ? 32 : 16)) return;
    if (!this.testPose) {
      if (this.activeType === 'assembly') {
        this.applyAssembly(experience.manualAssembly ?? experience.assembly);
        this.assemblyCamera(experience.assemblyScroll);
      } else {
        this.applyAssembly(0);
        if (experience.presetVersion !== this.poseVersion) { this.poseVersion = experience.presetVersion; this.applyPose(experience.preset); }
        if (experience.zoomVersion !== this.zoomVersion) {
          this.zoomVersion = experience.zoomVersion;
          if (experience.zoomDirection) {
            this.animation?.kill(); this.clearInertia();
            const direction = this.camera.position.clone().sub(this.controls.target); const distance = THREE.MathUtils.clamp(direction.length() * (experience.zoomDirection < 0 ? .84 : 1.19), .06, this.controls.maxDistance);
            const position = this.controls.target.clone().add(direction.setLength(distance));
            if (experience.reducedMotion) this.camera.position.copy(position);
            else this.animation = gsap.to(this.camera.position, { x: position.x, y: position.y, z: position.z, duration: .38, ease: 'power2.out', onUpdate: () => this.camera.lookAt(this.controls.target) });
          }
        }
      }
    }
    this.controls.enabled = this.activeType === 'viewer' && experience.viewerActive && !this.testPose && !this.animation?.isActive();
    this.renderer.domElement.tabIndex = experience.viewerActive ? 0 : -1;
    this.renderer.domElement.setAttribute('role', experience.viewerActive ? 'application' : 'img');
    this.renderer.domElement.style.pointerEvents = this.controls.enabled ? 'auto' : 'none';
    this.renderer.domElement.style.touchAction = this.controls.enabled ? 'none' : 'pan-y';
    if (this.controls.enabled && this.controls.update()) this.movingUntil = now + 150;
    if (this.activeType === 'assembly' && Math.abs(experience.assemblyScroll - this.lastAssemblyScroll) > 1e-7) this.movingUntil = now + 150;
    this.lastAssemblyScroll = experience.assemblyScroll;
    // Full optical sampling when settled; a native-resolution optical buffer during movement.
    // The lens, transmission, IOR and PBR maps are identical in both paths.
    const opticalScale = low ? .5 : this.animation?.isActive() || now < this.movingUntil ? 1 : 1.5;
    if (this.renderer.transmissionResolutionScale !== opticalScale) { this.renderer.transmissionResolutionScale = opticalScale; this.lastPresentation = ''; }
    const moving = this.animation?.isActive() || now < this.movingUntil;
    const dpr = low ? .8 : moving ? this.adaptiveDpr : Math.min(devicePixelRatio, 2);
    if (this.renderer.getPixelRatio() !== dpr) { this.renderer.setPixelRatio(dpr); this.lastPresentation = ''; }
    // No repeated transmission or shadow passes for a completely static presentation.
    const presentation = [this.poseVersion, this.activeType, this.lastSize, this.quality, opticalScale, this.assembledFactor, this.camera.fov, ...[...this.camera.position.toArray(), ...this.camera.quaternion.toArray(), ...this.controls.target.toArray()].map(v => Math.round(v * 1e7))].join(':');
    if (presentation === this.lastPresentation && !(this.renderer.shadowMap.enabled && this.renderer.shadowMap.needsUpdate)) return;
    this.lastPresentation = presentation;
    const interval = now - this.lastRender;
    if (this.lastRender && interval < 120) { this.renderedIntervals.push(interval); if (this.renderedIntervals.length > 180) this.renderedIntervals.shift(); }
    // High-DPR displays can settle at a gentler resolution; retain a full pixel on ordinary screens.
    if (!low && this.adaptiveDpr > 1 && this.renderedIntervals.length >= 90 && this.renderedIntervals.reduce((a,b) => a+b,0) / this.renderedIntervals.length > 28) {
      this.adaptiveDpr = Math.max(1, this.adaptiveDpr - .15); this.renderedIntervals = []; this.lastPresentation = '';
    }
    this.lastRender = now;
    if (this.activeType === 'assembly') this.positionLabels(rect);
    const start = performance.now();
    if (this.renderer.shadowMap.enabled && this.renderer.shadowMap.needsUpdate) this.shadowUpdates++;
    this.renderer.info.reset(); this.renderer.render(this.scene, this.camera); this.peakRenderCalls = Math.max(this.peakRenderCalls, this.renderer.info.render.calls);
    slot.dataset.ready = 'true';
    this.renderedPresetVersion=this.poseVersion;
    if(this.activeType==='viewer')window.dispatchEvent(new CustomEvent('vyren-studio-presented',{detail:this.renderedPresetVersion}));
    this.frameTimes.push(performance.now() - start); if (this.frameTimes.length > 180) this.frameTimes.shift(); this.frameCount++;
  };

  diagnostics() {
    this.metadata.fov = this.camera.fov; this.metadata.up = this.camera.up.toArray();
    const restDelta = Math.max(0, ...this.assemblies.map(({ object, rest }) => object.position.distanceTo(rest)));
    const restMatrixDelta = Math.max(0, ...this.assemblies.flatMap(({object,restMatrix}) => { object.updateMatrix(); return object.matrix.elements.map((v,i) => Math.abs(v - restMatrix.elements[i])); }));
    return { ready: this.ready, renderedPresetVersion: this.renderedPresetVersion, contextLost: this.lost, activeStage: this.activeType, assemblyFactor: this.assembledFactor, assemblyScroll: experience.assemblyScroll, restDelta, restMatrixDelta, camera: this.camera.position.toArray(), target: this.controls.target.toArray(), controlsEnabled: this.controls.enabled, ...this.metadata, drawCalls: this.renderer.info.render.calls, peakRenderCalls: this.peakRenderCalls, shadowUpdates: this.shadowUpdates, renderedTriangles: this.renderer.info.render.triangles, textures: this.renderer.info.memory.textures, dpr: this.renderer.getPixelRatio(), opticalBufferScale: this.renderer.transmissionResolutionScale, canvas: this.renderer.getSize(new THREE.Vector2()).toArray(), demandRendering: true, averageRenderedIntervalMs: this.renderedIntervals.reduce((a,b) => a+b,0) / Math.max(1,this.renderedIntervals.length), averageCpuRenderMs: this.frameTimes.reduce((a, b) => a + b, 0) / Math.max(1, this.frameTimes.length), activeFrames: this.frameCount, elapsedMs: performance.now() - this.started, lighting: { exposure: this.renderer.toneMappingExposure, environmentIntensity: this.scene.environmentIntensity, toneMapping: 'AgX', shadows: this.renderer.shadowMap.enabled, cachedShadows: true, keyIntensity: this.keyLight.intensity, pmremSize: 512, source: 'Original Blender studio cards, calibrated front/key cards, calibrated sapphire roughness, soft key shadow and warm edge fill' } };
  }
  capturePose(name: ViewPreset, factor = 0) {
    this.testPose = true; this.applyAssembly(factor); this.applyPose(name, false, true); this.lastPresentation = '';
    // Matched reference shots use the reference sensor/lens and aspect, with the source background.
    this.scene.background = new THREE.Color('#343c42');
    const lens = { hero: 66, front: 72, rear: 68, detail: 92, movement: 105, strap: 92, crown: 110 }[name];
    this.camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(36 / (2 * lens * this.camera.aspect))); this.camera.updateProjectionMatrix();
    this.renderer.info.reset(); this.renderer.render(this.scene, this.camera); return this.diagnostics();
  }
  releaseCapture() { this.testPose = false; this.scene.background = new THREE.Color('#14191e'); this.lastPresentation = ''; this.applyPose(experience.preset, false); }
  private disposeModel(model: THREE.Object3D) {
    const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(); const textures = new Set<THREE.Texture>();
    model.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material)); } });
    materials.forEach(material => { Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); }); material.dispose(); });
    textures.forEach(texture => texture.dispose()); geometries.forEach(geometry => geometry.dispose());
  }
  dispose() {
    this.disposed = true; cancelAnimationFrame(this.raf); this.animation?.kill(); this.controls.dispose(); this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.abort.abort();
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
    this.renderer.domElement.removeEventListener('keydown', this.onKeyDown);
    this.slots.forEach(slot => slot.dataset.ready = 'false');
    if (this.model) this.disposeModel(this.model); this.keyLight.shadow.dispose(); this.pmremTarget?.dispose(); this.renderer.dispose(); this.renderer.domElement.remove();
  }
}

