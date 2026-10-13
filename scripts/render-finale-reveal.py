"""Read-only Cycles finale: a 20 degree camera turn and staged studio lighting.
All source meshes/materials are preserved. Never saves or replaces a blend file.
"""
import argparse, bpy, hashlib, json, math, sys, time
from pathlib import Path
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view

p = argparse.ArgumentParser()
p.add_argument('--preview', action='store_true')
p.add_argument('--start', type=int, default=0)
p.add_argument('--stop', type=int, default=72)
p.add_argument('--force', action='store_true')
a = p.parse_args(sys.argv[sys.argv.index('--') + 1:])
out = Path('D:/VYREN/04_RENDER_OUTPUT/Finale_Reveal_v1') / ('preview' if a.preview else 'production')
out.mkdir(parents=True, exist_ok=True)
source = Path(bpy.data.filepath)
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
s = bpy.context.scene
s.frame_set(1)
s.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
backend = 'CPU'
for candidate in ['OPTIX', 'CUDA']:
    try:
        prefs.compute_device_type = candidate
        prefs.get_devices()
        for device in prefs.devices:
            device.use = device.type == candidate
        if any(d.type == candidate for d in prefs.devices):
            backend = candidate
            break
    except Exception:
        pass
s.cycles.device = 'GPU' if backend != 'CPU' else 'CPU'
s.cycles.samples = 32 if a.preview else 40
s.cycles.use_denoising = True
s.cycles.use_animated_seed = False
s.cycles.adaptive_threshold = .035
s.render.resolution_x = s.render.resolution_y = 800 if a.preview else 1200
s.render.resolution_percentage = 100
s.render.film_transparent = True
s.render.image_settings.file_format = 'PNG'
s.render.image_settings.color_mode = 'RGBA'
s.render.use_persistent_data = True
camera = bpy.data.objects['CAM_HERO']
s.camera = camera
original = camera.matrix_world.copy()
target = Vector((0, 0, -.016))
lights = {o.name: (o.matrix_world.copy(), o.data.energy) for o in s.objects if o.type == 'LIGHT'}
world = [(n, n.inputs['Strength'].default_value) for n in s.world.node_tree.nodes if n.type == 'BACKGROUND'] if s.world and s.world.use_nodes else []
objects = [o for o in bpy.data.objects['WATCH_ROOT'].children_recursive if o.type in ('MESH', 'FONT', 'CURVE') and not o.hide_render]
coords = [o.matrix_world @ Vector(c) for o in objects for c in o.bound_box]

def smooth(start, end, x):
    t = max(0, min(1, (x - start) / (end - start)))
    return t * t * (3 - 2 * t)

def camera_pose(t, distance):
    base = original.copy()
    base.translation = target + (original.translation - target) * distance
    angle = math.radians(-18 + 20 * smooth(.12, .9, t))
    camera.matrix_world = Matrix.Translation(target) @ Matrix.Rotation(angle, 4, 'Y') @ Matrix.Translation(-target) @ base
    bpy.context.view_layer.update()
    return math.degrees(angle)

# One fixed distance fits the complete original watch at every camera angle.
distance = .64
while True:
    trial = []
    for t in [0, .25, .5, .75, 1]:
        camera_pose(t, distance)
        points = [world_to_camera_view(s, camera, co) for co in coords]
        trial.append([min(q.x for q in points), min(q.y for q in points), max(q.x for q in points), max(q.y for q in points)])
    if all(b[0] >= .075 and b[1] >= .075 and b[2] <= .925 and b[3] <= .925 for b in trial):
        break
    distance += .02
    if distance > 1.6:
        raise RuntimeError('Finale framing failed')

def pose(index):
    t = index / 71
    angle = camera_pose(t, distance)
    key = smooth(.1, .58, t)
    fill = smooth(.28, .78, t)
    for name, (matrix, energy) in lights.items():
        light = bpy.data.objects[name]
        light.matrix_world = matrix.copy()
        if name == 'STRIP_rim':
            factor = .85 - .4 * key
        elif name == 'STRIP_right':
            factor = .55 + .25 * key
        elif name == 'SOFTBOX_key':
            factor = .015 + .985 * key
            light.matrix_world = Matrix.Rotation(math.radians(-12 + 24 * smooth(.12, .72, t)), 4, 'Z') @ matrix
        elif name in ('CARD_movement', 'CARD_readability'):
            factor = .015 + .985 * fill
        elif name == 'CARD_front':
            factor = .01 + .7 * fill
        else:
            factor = .015 + .6 * fill
        light.data.energy = energy * factor
    for node, strength in world:
        node.inputs['Strength'].default_value = strength * (.015 + .985 * fill)
    bpy.context.view_layer.update()
    return {'frame': index, 'progress': t, 'degrees': angle, 'key': key, 'fill': fill, 'cameraMatrix': [list(row) for row in camera.matrix_world], 'lights': {name: bpy.data.objects[name].data.energy for name in lights}}

manifest = out / 'render.json'
data = json.loads(manifest.read_text()) if manifest.exists() else {'source': str(source), 'sourceSha256': source_hash, 'savedBlend': False, 'engine': 'CYCLES', 'blender': bpy.app.version_string, 'backend': backend, 'samples': s.cycles.samples, 'resolution': [s.render.resolution_x, s.render.resolution_y], 'distanceScale': distance, 'cameraTurnDegrees': 20, 'count': 72, 'renders': []}
data.update(samples=s.cycles.samples, resolution=[s.render.resolution_x, s.render.resolution_y])
indices = [0, 24, 46, 71] if a.preview else list(dict.fromkeys([71] + list(range(a.start, a.stop))))
for index in indices:
    settings = pose(index)
    dest = out / f'reveal-{index:03}.png'
    started = time.time()
    if not dest.exists() or a.force:
        s.render.filepath = str(dest)
        bpy.ops.render.render(write_still=True)
    settings.update(name=dest.stem, seconds=round(time.time() - started, 3), bytes=dest.stat().st_size, samples=s.cycles.samples, resolution=[s.render.resolution_x, s.render.resolution_y])
    data['renders'] = [r for r in data['renders'] if r['frame'] != index] + [settings]
    manifest.write_text(json.dumps(data, indent=2))
    print('FINALE_FRAME', index, settings['seconds'], 'DISTANCE', distance, flush=True)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
