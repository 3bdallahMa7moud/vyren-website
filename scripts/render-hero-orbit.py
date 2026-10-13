"""Authentic Cycles camera motion, read-only master. Never saves a .blend file."""
import bpy, math, json, time, argparse
from pathlib import Path
from mathutils import Vector, Matrix
import sys

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
parser=argparse.ArgumentParser();parser.add_argument('--frames',type=int,default=30);options=parser.parse_args(args)
out=Path(__file__).resolve().parents[1]/'qa/phase2-cinematic/hero-frames';out.mkdir(parents=True,exist_ok=True)
s=bpy.context.scene;s.frame_set(1);s.render.engine='CYCLES'
prefs=bpy.context.preferences.addons['cycles'].preferences
backend='CPU'
for candidate in ['OPTIX','CUDA']:
    try:
        prefs.compute_device_type=candidate;prefs.get_devices()
        for device in prefs.devices:device.use=device.type==candidate
        if any(device.type==candidate for device in prefs.devices):backend=candidate;break
    except Exception:pass
s.cycles.device='GPU' if backend!='CPU' else 'CPU'
s.cycles.samples=48;s.cycles.use_denoising=True;s.cycles.adaptive_threshold=.035
s.render.resolution_x=1280;s.render.resolution_y=960;s.render.resolution_percentage=100
s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA'
s.render.use_persistent_data=True
cam=bpy.data.objects['CAM_HERO'];s.camera=cam;original=cam.matrix_world.copy();target=Vector((0,0,-.016))
stats=[]
for i in range(options.frames):
    phase=i/(options.frames-1) if options.frames>1 else 0
    angle=math.radians(2.1)*math.sin(math.pi*phase)**2
    # Rotate the real camera about its original optical target. The product is untouched.
    cam.matrix_world=Matrix.Translation(target)@Matrix.Rotation(angle,4,'Z')@Matrix.Translation(-target)@original
    destination=out/f'{i:03}.png';s.render.filepath=str(destination)
    started=time.time();bpy.ops.render.render(write_still=True)
    stats.append({'frame':i,'degrees':math.degrees(angle),'seconds':round(time.time()-started,3),'cameraMatrix':list(map(list,cam.matrix_world))})
    (out/'render.json').write_text(json.dumps({'source':bpy.data.filepath,'backend':backend,'samples':48,'resolution':[1280,960],'frames':stats,'savedBlend':False},indent=2))
    print('VYREN_ORBIT_FRAME',i,stats[-1]['seconds'],flush=True)
cam.matrix_world=original
