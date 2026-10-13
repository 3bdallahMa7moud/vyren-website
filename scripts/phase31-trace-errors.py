from pathlib import Path
import zipfile,json
for p in (Path(__file__).resolve().parents[1]/'qa/phase3-1/test-results').rglob('trace.zip'):
    print(p.parent.name)
    with zipfile.ZipFile(p) as z:
        for name in z.namelist():
            if name.endswith('.trace'):
                for line in z.read(name).decode().splitlines():
                    event=json.loads(line)
                    if 'error' in event:print(str(event['error'])[:2000])
