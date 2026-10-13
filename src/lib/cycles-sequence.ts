import { experience } from './experience-state';

type Frame = { progress:number; factors:Record<string,number>; anchors:Record<string,[number,number]>; restMatrixDelta:number|null };
type Variant = { width:number; height:number; crop:[number,number,number,number]; limit:number; urls:string[] };
type Manifest = { frameCount:number; variants:Record<'desktop'|'mobile',Variant>; frames:Frame[] };
type Entry = { bitmap:ImageBitmap; bytes:number; used:number };
type Pending = { controller:AbortController; generation:number };

/** Only decoded neighbouring frames are resident. ScrollTrigger owns the playhead. */
export class CyclesSequence {
  private manifest?:Manifest;
  private variant?:Variant;
  private mobile=false;
  private coarseFrames=false;
  private generation=0;
  private cache=new Map<string,Entry>();
  private pending=new Map<string,Pending>();
  private retry=new Map<string,number>();
  private queue:string[]=[];
  private desired=0;
  private displayed=-1;
  private lastUrl='';
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
  private downloaded=0;
  private fetches=0;
  private failures=0;
  private aborted=0;
  private peakFrames=0;
  private peakBytes=0;
  private draws=0;
  private waits=0;
  private renderTimes:number[]=[];
  private progressElement:HTMLElement|null;
  private caption:HTMLElement|null;
  private anchorElements:{name:string;label:HTMLElement;line:SVGLineElement|null}[];
  private onVisibility=()=>{if(document.hidden){this.pause();this.releaseFrames();this.warming=false;}else if(this.active){this.warming=true;this.startLoop();}};

  constructor(private slot:HTMLDivElement,private canvas:HTMLCanvasElement) {
    const context=canvas.getContext('2d',{alpha:true});
    if(!context)throw new Error('Canvas presentation is unavailable');
    this.context=context;
    const section=slot.closest('.assembly')!;
    this.progressElement=section.querySelector<HTMLElement>('.assembly-progress span');
    this.caption=section.querySelector<HTMLElement>('.assembly-step');
    this.anchorElements=Array.from(section.querySelectorAll<HTMLElement>('.assembly-labels > [data-anchor]')).map(label=>({name:label.dataset.anchor!,label,line:section.querySelector<SVGLineElement>(`.assembly-leaders line[data-anchor="${label.dataset.anchor}"]`)}));
    this.preload=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){this.warming=true;void this.load();this.preload.disconnect();}},{rootMargin:'900px 0px'});
    this.visible=new IntersectionObserver(entries=>{const wasActive=this.active;this.active=entries.some(e=>e.isIntersecting);if(this.active){this.warming=true;void this.load();this.startLoop();}else{this.pause();if(wasActive){this.releaseFrames();this.warming=false;}}});
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
      this.selectVariant();this.updateTarget();this.schedule();
    } catch(e) {if(!this.disposed&&!(e instanceof DOMException&&e.name==='AbortError')){this.slot.dataset.sequenceError='true';this.manifestRetryAfter=performance.now()+2000;}}
    finally {this.manifestLoading=false;}
  }
  private selectVariant() {
    const mobile=innerWidth<=768;
    if(this.variant&&mobile===this.mobile)return;
    this.releaseFrames();this.mobile=mobile;this.variant=this.manifest!.variants[mobile?'mobile':'desktop'];this.displayed=-1;this.lastUrl='';this.resizePending=true;
  }
  private updateTarget() {
    if(!this.manifest)return;
    const p=experience.reducedMotion?(experience.manualAssembly===1?.72:0):experience.assemblyScroll;
    const requested=Math.round(Math.max(0,Math.min(1,p))*(this.manifest.frameCount-1));
    // Save-Data still seeks deterministically, but visits half as many unique frames.
    const saveData=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData;
    this.coarseFrames=!!saveData;
    this.desired=saveData?Math.min(this.manifest.frameCount-1,Math.round(requested/2)*2):requested;
  }
  private schedule() {
    if(!this.variant||!this.warming||this.disposed)return;
    const candidates=[0,1,-1,2,-2,3,-3,4,-4].map(n=>this.desired+n*(this.coarseFrames?2:1)).filter(n=>n>=0&&n<this.manifest!.frameCount);
    const wanted=[...new Set(candidates.map(i=>this.variant!.urls[i]))];
    for(const [url,pending] of this.pending)if(!wanted.includes(url))pending.controller.abort();
    this.queue=wanted.filter(url=>!this.cache.has(url)&&!this.pending.has(url)&&(this.retry.get(url)??0)<=performance.now());
    this.pump();
  }
  private pump() {
    const concurrency=this.mobile?2:3;
    while(!this.disposed&&this.warming&&this.pending.size<concurrency&&this.queue.length){
      const url=this.queue.shift()!;const controller=new AbortController();const generation=this.generation;
      this.pending.set(url,{controller,generation});this.fetches++;
      void (async()=>{
        try {
          const response=await fetch(url,{signal:controller.signal,cache:'force-cache'});
          if(!response.ok)throw new Error('Frame unavailable');
          const blob=await response.blob();this.downloaded+=blob.size;
          const bitmap=await createImageBitmap(blob);
          if(this.disposed||controller.signal.aborted||generation!==this.generation){bitmap.close();return;}
          this.cache.set(url,{bitmap,bytes:bitmap.width*bitmap.height*4,used:performance.now()});this.evict();
          this.peakFrames=Math.max(this.peakFrames,this.cache.size);
          this.peakBytes=Math.max(this.peakBytes,[...this.cache.values()].reduce((n,e)=>n+e.bytes,0));
          this.retry.delete(url);if(this.active)this.startLoop();
        } catch(e) {
          if(controller.signal.aborted)this.aborted++;
          else if(!this.disposed){this.failures++;this.retry.set(url,performance.now()+1000);if(e instanceof DOMException&&e.name==='AbortError')this.aborted++;}
        } finally {this.pending.delete(url);this.pump();}
      })();
    }
  }
  private evict() {
    while(this.cache.size>this.variant!.limit){
      const desiredUrl=this.variant!.urls[this.desired];
      const candidate=[...this.cache.entries()].filter(([url])=>url!==desiredUrl&&url!==this.lastUrl).sort((a,b)=>a[1].used-b[1].used)[0];
      if(!candidate)break;candidate[1].bitmap.close();this.cache.delete(candidate[0]);
    }
  }
  private startLoop() {if(!this.raf&&!this.disposed&&!document.hidden)this.raf=requestAnimationFrame(this.tick);}
  private pause() {cancelAnimationFrame(this.raf);this.raf=0;}
  private releaseFrames() {
    this.generation++;this.queue=[];for(const pending of this.pending.values())pending.controller.abort();
    for(const entry of this.cache.values())entry.bitmap.close();this.cache.clear();
  }
  private tick=()=>{
    this.raf=0;if(!this.active||document.hidden||this.disposed)return;
    if(!this.manifest)void this.load();
    if(this.manifest){
      this.selectVariant();const previous=this.desired;this.updateTarget();
      if(previous!==this.desired||!this.cache.has(this.variant!.urls[this.desired]))this.schedule();
      if(this.resizePending){
        const held=document.createElement('canvas');held.width=this.canvas.width;held.height=this.canvas.height;held.getContext('2d')?.drawImage(this.canvas,0,0);
        this.width=this.slot.clientWidth;this.height=this.slot.clientHeight;
        const scale=Math.min(this.width/this.variant!.width,this.height/this.variant!.height);const dpr=Math.min(devicePixelRatio,1.5,1/scale);
        this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.context.setTransform(dpr,0,0,dpr,0,0);
        const heldScale=Math.min(this.width/held.width,this.height/held.height);this.context.drawImage(held,(this.width-held.width*heldScale)/2,(this.height-held.height*heldScale)/2,held.width*heldScale,held.height*heldScale);
        this.resizePending=false;this.displayed=-1;
      }
      const url=this.variant!.urls[this.desired];const entry=this.cache.get(url);
      if(entry)this.present(entry,this.desired,url);
      else {
        this.waits++;
        // A ready neighbour may arrive just after the scroll playhead has passed it.
        // Present the nearest ready pose toward the target; do not freeze waiting
        // for a moving exact index. At rest the requested index still wins.
        const previous=Math.max(0,this.displayed),direction=this.desired>=previous?1:-1;
        for(let index=this.desired;direction*(index-previous)>=0;index-=direction){
          if(this.coarseFrames&&index%2!==0)continue;
          const nearbyUrl=this.variant!.urls[index],nearby=this.cache.get(nearbyUrl);
          if(nearby){this.present(nearby,index,nearbyUrl);break;}
        }
      }
    }
    this.startLoop();
  };
  private present(entry:Entry,index:number,url:string) {
    entry.used=performance.now();
    if(this.displayed!==index){
      if(this.lastUrl!==url||this.displayed<0)this.draw(entry.bitmap,index);
      else this.positionLabels(index);
      this.displayed=index;this.lastUrl=url;this.slot.dataset.sequenceReady='true';
    }
  }
  private draw(bitmap:ImageBitmap,index:number) {
    const start=performance.now();const scale=Math.min(this.width/bitmap.width,this.height/bitmap.height);const w=bitmap.width*scale,h=bitmap.height*scale;
    this.context.clearRect(0,0,this.width,this.height);this.context.drawImage(bitmap,(this.width-w)/2,(this.height-h)/2,w,h);
    this.draws++;this.positionLabels(index);this.renderTimes.push(performance.now()-start);if(this.renderTimes.length>180)this.renderTimes.shift();
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
    return {ready:!!this.manifest,active:this.active,variant:this.mobile?'mobile':'desktop',frameCount:this.manifest?.frameCount??0,desiredFrame:this.desired,displayedFrame:this.displayed,displayedProgress:this.manifest?.frames[this.displayed]?.progress??null,displayedFactors:this.manifest?.frames[this.displayed]?.factors??null,restMatrixDelta:this.manifest?.frames[this.displayed]?.restMatrixDelta??null,cacheFrames:this.cache.size,cacheLimit:this.variant?.limit??0,peakCacheFrames:this.peakFrames,decodedBytes:[...this.cache.values()].reduce((n,e)=>n+e.bytes,0),peakDecodedBytes:this.peakBytes,pending:this.pending.size,downloadedBytes:this.downloaded,fetches:this.fetches,failedFrames:this.failures,abortedRequests:this.aborted,waitingRafChecks:this.waits,draws:this.draws,averageDrawMs:this.renderTimes.reduce((a,b)=>a+b,0)/Math.max(1,this.renderTimes.length),progressSource:'Existing GSAP ScrollTrigger; reduced motion uses explicit endpoint controls'};
  }
  dispose() {
    this.disposed=true;this.pause();this.manifestController.abort();this.preload.disconnect();this.visible.disconnect();this.resize.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);this.releaseFrames();delete this.slot.dataset.sequenceReady;delete this.slot.dataset.sequenceError;
  }
}
