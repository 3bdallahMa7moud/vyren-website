import { experience } from './experience-state';
import { CriticalFrameStream } from './critical-frame-stream';
import { assemblyBundle } from './frame-bundles';
import { deviceStreamProfile } from './frame-stream-policy';
import type { FilmFrame } from './film-frame';

type Frame = { progress:number; factors:Record<string,number>; anchors:Record<string,[number,number]>; restMatrixDelta:number|null };
type Variant = { width:number; height:number; crop:[number,number,number,number]; limit:number; urls:string[] };
type Manifest = { frameCount:number; variants:Record<'desktop'|'mobile',Variant>; frames:Frame[] };

/** Only decoded neighbouring frames are resident. ScrollTrigger owns the playhead. */
export class CyclesSequence {
  private manifest?:Manifest;
  private variant?:Variant;
  private mobile=false;
  private stream?:CriticalFrameStream;
  private fullResolution=false;
  private previewDraws=0;
  private desired=0;
  private displayed=-1;
  private lastBitmap?:ImageBitmap;
  private active=false;
  private warming=false;
  private disposed=false;
  private raf=0;
  private width=0;
  private height=0;
  private resizePending=true;
  private manifestController=new AbortController();
  private manifestLoading=false;
  private manifestRetryAfter=0;
  private context:CanvasRenderingContext2D;
  private visible:IntersectionObserver;
  private preload:IntersectionObserver;
  private resize:ResizeObserver;
  private draws=0;
  private waits=0;
  private renderTimes:number[]=[];
  private progressElement:HTMLElement|null;
  private caption:HTMLElement|null;
  private anchorElements:{name:string;label:HTMLElement;line:SVGLineElement|null}[];
  private onVisibility=()=>{if(document.hidden){this.pause();this.stream?.setWarm(false);}else{this.stream?.setWarm(this.warming||this.active);if(this.active)this.startLoop();}};

  constructor(private slot:HTMLDivElement,private canvas:HTMLCanvasElement) {
    const context=canvas.getContext('2d',{alpha:true});
    if(!context)throw new Error('Canvas presentation is unavailable');
    this.context=context;context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
    const section=slot.closest('.assembly')!;
    this.progressElement=section.querySelector<HTMLElement>('.assembly-progress span');
    this.caption=section.querySelector<HTMLElement>('.assembly-step');
    this.anchorElements=Array.from(section.querySelectorAll<HTMLElement>('.assembly-labels > [data-anchor]')).map(label=>({name:label.dataset.anchor!,label,line:section.querySelector<SVGLineElement>(`.assembly-leaders line[data-anchor="${label.dataset.anchor}"]`)}));
    this.preload=new IntersectionObserver(entries=>{this.warming=entries.some(e=>e.isIntersecting);if(this.warming){void this.load();this.stream?.setWarm(!document.hidden);}else if(!this.active)this.stream?.setWarm(false);},{rootMargin:`${deviceStreamProfile(innerWidth<=768).warmMargin}px 0px`});
    this.visible=new IntersectionObserver(entries=>{this.active=entries.some(e=>e.isIntersecting);if(this.active){void this.load();this.stream?.setWarm(!document.hidden);this.startLoop();}else{this.pause();if(!this.warming)this.stream?.setWarm(false);}});
    this.resize=new ResizeObserver(()=>{this.resizePending=true;if(this.active)this.startLoop();});
    this.preload.observe(slot);this.visible.observe(slot);this.resize.observe(slot);
    document.addEventListener('visibilitychange',this.onVisibility);
  }
  private async load() {
    if(this.manifest||this.disposed||this.manifestLoading||performance.now()<this.manifestRetryAfter)return;
    this.manifestLoading=true;
    try {
      const response=await fetch('/assets/exploded-cycles/manifest.json',{signal:this.manifestController.signal});
      if(!response.ok)throw new Error('Sequence manifest unavailable');
      this.manifest=await response.json() as Manifest;
      if(this.disposed)return;
      delete this.slot.dataset.sequenceError;
      this.selectVariant();this.updateTarget();
    } catch(e) {if(!this.disposed&&!(e instanceof DOMException&&e.name==='AbortError')){this.slot.dataset.sequenceError='true';this.manifestRetryAfter=performance.now()+2000;}}
    finally {this.manifestLoading=false;}
  }
  private selectVariant() {
    const mobile=innerWidth<=768;
    if(this.variant&&mobile===this.mobile)return;
    this.stream?.dispose();this.mobile=mobile;this.variant=this.manifest!.variants[mobile?'mobile':'desktop'];this.displayed=-1;this.lastBitmap=undefined;this.resizePending=true;
    this.stream=new CriticalFrameStream(this.variant.urls,assemblyBundle.variants[mobile?'mobile':'desktop'],deviceStreamProfile(mobile),()=>{if(this.active)this.startLoop();});
    this.stream.setTarget(this.desired);this.stream.setWarm((this.warming||this.active)&&!document.hidden);
  }
  private updateTarget() {
    if(!this.manifest)return;
    const p=experience.reducedMotion?(experience.manualAssembly===1?.72:0):experience.assemblyScroll;
    const requested=Math.round(Math.max(0,Math.min(1,p))*(this.manifest.frameCount-1));
    this.desired=requested;this.slot.dataset.desiredFrame=String(requested);this.stream?.setTarget(requested);
  }
  private startLoop() {if(!this.raf&&!this.disposed&&!document.hidden)this.raf=requestAnimationFrame(this.tick);}
  private pause() {cancelAnimationFrame(this.raf);this.raf=0;}
  private tick=()=>{
    this.raf=0;if(!this.active||document.hidden||this.disposed)return;
    if(!this.manifest)void this.load();
    if(this.manifest){
      this.selectVariant();this.updateTarget();
      if(this.resizePending){
        const held=document.createElement('canvas');held.width=this.canvas.width;held.height=this.canvas.height;held.getContext('2d')?.drawImage(this.canvas,0,0);
        this.width=this.slot.clientWidth;this.height=this.slot.clientHeight;
        const scale=Math.min(this.width/this.variant!.width,this.height/this.variant!.height);const dpr=Math.min(devicePixelRatio,1.5,1/scale);
        this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.context.setTransform(dpr,0,0,dpr,0,0);this.context.imageSmoothingEnabled=true;this.context.imageSmoothingQuality='high';
        const heldScale=Math.min(this.width/held.width,this.height/held.height);this.context.drawImage(held,(this.width-held.width*heldScale)/2,(this.height-held.height*heldScale)/2,held.width*heldScale,held.height*heldScale);
        this.resizePending=false;this.displayed=-1;
      }
      const frame=this.stream?.getFrame();if(frame)this.present(frame);else this.waits++;
    }
    this.startLoop();
  };
  private present(frame:FilmFrame) {
    if(this.displayed!==frame.index||this.fullResolution!==frame.fullResolution||this.lastBitmap!==frame.bitmap){
      this.draw(frame);this.displayed=frame.index;this.fullResolution=frame.fullResolution;this.lastBitmap=frame.bitmap;
      this.slot.dataset.sequenceReady='true';this.slot.dataset.displayedFrame=String(frame.index);this.slot.dataset.fullResolution=String(frame.fullResolution);
    }
  }
  private draw(frame:FilmFrame) {
    const start=performance.now();const scale=Math.min(this.width/frame.width,this.height/frame.height);const w=frame.width*scale,h=frame.height*scale,x=(this.width-w)/2,y=(this.height-h)/2;
    this.context.clearRect(0,0,this.width,this.height);
    this.context.drawImage(frame.bitmap,x,y,w,h);
    this.draws++;this.positionLabels(frame.index);this.renderTimes.push(performance.now()-start);if(this.renderTimes.length>180)this.renderTimes.shift();
  }
  private positionLabels(index:number) {
    const frame=this.manifest!.frames[index];const variant=this.variant!;
    const p=frame.progress;
    const spotlight=this.slot.parentElement?.querySelector('.component-spotlight');
    if(spotlight){
      const stage=frame.factors.ASSEMBLY_MOVEMENT>.95?['MOVEMENT / VN-01','Bridge, balance and spring geometry sit between dial and caseback.']:frame.factors.ASSEMBLY_DIAL>.35?['DIAL / ANTHRACITE','Hands and applied markers separate from the dial plane.']:frame.factors.ASSEMBLY_CRYSTAL>.35?['CRYSTAL / OPTICAL LAYER','The lens lifts to reveal the bezel, chapter ring and dial beneath.']:['ASSEMBLED / NOCTIS 01','Ten component groups. One complete silhouette.'];
      spotlight.querySelector('span')!.textContent=stage[0];spotlight.querySelector('p')!.textContent=stage[1];
    }
    if(this.progressElement)this.progressElement.style.transform=`scaleX(${p})`;
    if(this.caption)this.caption.textContent=experience.reducedMotion?(experience.manualAssembly===1?'In balance / 04':'Assembled / 01'):p<.10?'Assembled / 01':p<.15?'Aligning / 02':p<.65?'Revealing / 03':p<.80?'In balance / 04':p<.995?'Returning / 05':'Whole again / 06';
    const parent=this.slot.parentElement!;const width=parent.clientWidth,height=parent.clientHeight;
    const scale=Math.min(this.width/variant.width,this.height/variant.height);const drawnWidth=variant.width*scale,drawnHeight=variant.height*scale;
    let previous=this.mobile?height*.39:110;
    for(const {name,label,line} of this.anchorElements){
      const point=frame.anchors[name];if(!point)continue;
      const x=this.slot.offsetLeft+(this.width-drawnWidth)/2+(point[0]*1600-variant.crop[0])/(variant.crop[2]-variant.crop[0])*drawnWidth;
      const y=this.slot.offsetTop+(this.height-drawnHeight)/2+point[1]*drawnHeight;
      const top=Math.max(previous+(this.mobile?31:58),Math.min(height-140,y));previous=top;label.style.top=`${top}px`;
      const factor=name==='case_main'?frame.factors.ASSEMBLY_MOVEMENT:frame.factors[name];const opacity=Math.max(0,Math.min(1,(factor-.7)/.3));label.style.opacity=`${opacity}`;
      if(line){line.style.opacity=`${opacity}`;line.setAttribute('x1',`${x}`);line.setAttribute('y1',`${y}`);line.setAttribute('x2',`${width-220}`);line.setAttribute('y2',`${top+6}`);}
    }
  }
  diagnostics() {
    const stream=this.stream?.diagnostics()??{cacheFrames:0,cacheLimit:0,peakCacheFrames:0,decodedBytes:0,peakDecodedBytes:0,pending:0,downloadedBytes:0,fetches:0,failedFrames:0,abortedRequests:0};
    return {...stream,ready:!!this.manifest,active:this.active,variant:this.mobile?'mobile':'desktop',frameCount:this.manifest?.frameCount??0,desiredFrame:this.desired,displayedFrame:this.displayed,fullResolution:this.fullResolution,previewDraws:this.previewDraws,displayedProgress:this.manifest?.frames[this.displayed]?.progress??null,displayedFactors:this.manifest?.frames[this.displayed]?.factors??null,restMatrixDelta:this.manifest?.frames[this.displayed]?.restMatrixDelta??null,waitingRafChecks:this.waits,draws:this.draws,averageDrawMs:this.renderTimes.reduce((a,b)=>a+b,0)/Math.max(1,this.renderTimes.length),progressSource:'Existing GSAP ScrollTrigger; reduced motion uses explicit endpoint controls'};
  }
  dispose() {
    this.disposed=true;this.pause();this.manifestController.abort();this.preload.disconnect();this.visible.disconnect();this.resize.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);this.stream?.dispose();delete this.slot.dataset.sequenceReady;delete this.slot.dataset.sequenceError;delete this.slot.dataset.displayedFrame;delete this.slot.dataset.desiredFrame;delete this.slot.dataset.fullResolution;
  }
}
