"""Add wider lake/urban Sentinel crops while preserving the existing sample pack."""
import json
from pathlib import Path
import httpx
import numpy as np
import rasterio
from rasterio.windows import Window
from rasterio.warp import transform

DEST = Path(__file__).resolve().parents[1] / 'backend' / 'samples'

def main():
    manifest = json.loads((DEST / 'manifest.json').read_text())
    for original in list(manifest[:2]):
        sample_id = original['id'].replace('lake-', 'wide-')
        item = httpx.get(original['stac'], timeout=30).json()
        arrays = []
        for band in ['B02', 'B03', 'B04', 'B08']:
            signed = httpx.get('https://planetarycomputer.microsoft.com/api/sas/v1/sign', params={'href':item['assets'][band]['href']}, timeout=30)
            signed.raise_for_status()
            with rasterio.open(signed.json()['href']) as source:
                x, y = transform('EPSG:4326', source.crs, [77.30], [23.26])
                row, col = source.index(x[0], y[0])
                window = Window(col-256, row-256, 512, 512)
                raw = source.read(1, window=window)
                data = raw.astype('float32') * .0001
                data[raw == 0] = np.nan
                arrays.append(data)
                profile = dict(driver='GTiff', width=512, height=512, count=4, dtype='float32', crs=source.crs, transform=source.window_transform(window), nodata=float('nan'), compress='deflate')
        with rasterio.open(DEST / f'{sample_id}.tif', 'w', **profile) as output:
            output.write(np.stack(arrays))
        entry = {**original, 'id':sample_id, 'label':'Upper Lake · landscape view', 'processing':'512x512 crop, 10 m, B02/B03/B04/B08 surface reflectance (DN/10000). Same source scenes as the shoreline pair; wider, different footprint. No cloud mask.'}
        manifest = [v for v in manifest if v['id'] != sample_id] + [entry]
        print(sample_id, original['source'])
    (DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')

if __name__ == '__main__':
    main()
