"""Download small real pre-baseline-04 Sentinel-2 crops from Planetary Computer."""
import json
from pathlib import Path
import httpx
import numpy as np
import rasterio
from rasterio.windows import Window
from rasterio.warp import transform

DEST = Path(__file__).resolve().parents[1] / 'backend' / 'samples'

def main():
    DEST.mkdir(exist_ok=True)
    scenes = []
    for period in ['2021-05-01/2021-05-31', '2021-10-01/2021-11-30']:
        start, end = period.split('/')
        response = httpx.post('https://planetarycomputer.microsoft.com/api/stac/v1/search', json={
            'collections': ['sentinel-2-l2a'], 'bbox': [77.31,23.23,77.32,23.24],
            'datetime': f'{start}T00:00:00Z/{end}T23:59:59Z', 'limit': 20,
            'query': {'eo:cloud_cover': {'lt': 5}}}, timeout=30)
        response.raise_for_status()
        choices = [item for item in response.json()['features'] if float(item['properties']['s2:processing_baseline']) < 4]
        item = sorted(choices, key=lambda f: f['properties']['eo:cloud_cover'])[0]
        arrays = []
        for band in ['B02','B03','B04','B08']:
            asset = item['assets'][band]
            signed = httpx.get('https://planetarycomputer.microsoft.com/api/sas/v1/sign', params={'href':asset['href']}, timeout=30)
            signed.raise_for_status()
            with rasterio.open(signed.json()['href']) as source:
                xs, ys = transform('EPSG:4326', source.crs, [77.315], [23.235])
                row, col = source.index(xs[0], ys[0])
                window = Window(col-128, row-128, 256, 256)
                raw = source.read(1, window=window)
                # Processing baseline <04: BOA reflectance = DN / 10000, no offset.
                data = raw.astype('float32') * .0001
                data[raw == 0] = np.nan
                arrays.append(data)
                profile = dict(driver='GTiff', width=256, height=256, count=4, dtype='float32',
                               crs=source.crs, transform=source.window_transform(window), nodata=float('nan'))
        sample_id = 'lake-before' if not scenes else 'lake-after'
        with rasterio.open(DEST / f'{sample_id}.tif', 'w', **profile) as output:
            output.write(np.stack(arrays))
        scenes.append({'id': sample_id, 'label': 'Upper Lake, Bhopal', 'date': item['properties']['datetime'][:10],
                       'modality': 'optical', 'source': item['id'], 'cloud': item['properties']['eo:cloud_cover'],
                       'stac': f'https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-2-l2a/items/{item["id"]}', 'bands': ['blue','green','red','nir'],
                       'processing': '256x256 crop, 10 m; pre-baseline-04 BOA reflectance = DN/10000. Scene cloud percentage is not a crop cloud mask.'})
        print(sample_id, item['id'])
    (DEST / 'manifest.json').write_text(json.dumps(scenes, indent=2), encoding='utf-8')

if __name__ == '__main__':
    main()
