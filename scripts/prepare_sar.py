"""Fetch a public Sentinel-1 RTC window and resample onto the optical sample grid."""
import json
from pathlib import Path
import httpx
import numpy as np
import rasterio
from rasterio.vrt import WarpedVRT
from rasterio.enums import Resampling

ROOT = Path(__file__).resolve().parents[1] / 'backend' / 'samples'
def main():
    records = json.loads((ROOT / 'manifest.json').read_text())
    date = records[0]['date']
    year_month = date[:7]
    response = httpx.post('https://planetarycomputer.microsoft.com/api/stac/v1/search', json={
        'collections':['sentinel-1-rtc'], 'bbox':[77.31,23.23,77.32,23.24],
        'datetime': f'{year_month}-01T00:00:00Z/{year_month}-28T23:59:59Z', 'limit':20}, timeout=30)
    response.raise_for_status()
    features = response.json()['features']
    item = min(features, key=lambda f: abs(int(f['properties']['datetime'][8:10]) - int(date[8:10])))
    with rasterio.open(ROOT / 'lake-before.tif') as optical:
        profile = optical.profile.copy(); profile.update(count=2)
    output = []
    for key in ['vv','vh']:
        href = item['assets'][key]['href']
        signed = httpx.get('https://planetarycomputer.microsoft.com/api/sas/v1/sign', params={'href':href}, timeout=30)
        signed.raise_for_status()
        with rasterio.open(signed.json()['href']) as source:
            with WarpedVRT(source, crs=profile['crs'], transform=profile['transform'],
                           width=256,height=256,resampling=Resampling.bilinear,nodata=float('nan')) as vrt:
                data = vrt.read(1)
                data = np.where(data > 0, 10*np.log10(np.maximum(data,1e-10)), np.nan).astype('float32')
                if np.isfinite(data).mean() < .95:
                    raise RuntimeError('Radar scene does not cover the sample sufficiently.')
                output.append(data)
    with rasterio.open(ROOT / 'lake-sar.tif','w',**profile) as target:
        target.write(np.stack(output))
    records = [r for r in records if r['id'] != 'lake-sar']
    records.append({'id':'lake-sar','label':'Upper Lake · radar','date':item['properties']['datetime'][:10],
                    'modality':'sar','source':item['id'], 'bands':['VV dB','VH dB'],
                    'stac':f'https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-1-rtc/items/{item["id"]}',
                    'processing':'Sentinel-1 RTC VV/VH converted to dB. Bilinear resampling to the optical 10 m grid does not improve native radar resolution. Terrain corrected, not independently validated co-registration.'})
    (ROOT/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
    print('Saved public SAR crop:', item['id'])
if __name__=='__main__': main()
