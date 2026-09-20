import base64
import io
from pathlib import Path
from unittest.mock import patch

import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_collection_has_downloadable_real_crops():
    response = client.get('/api/studio/collection')
    assert response.status_code == 200
    items = response.json()
    assert {'wide-before', 'wide-after', 'lake-sar'} <= {item['sample_id'] for item in items}
    for item in items:
        assert len(item['bbox']) == 4
        assert item['bbox'][0] < item['bbox'][2]
        assert client.get('/api/studio/sample/' + item['sample_id']).status_code == 200
    assert client.get('/api/studio/sample/not-a-sample').status_code == 404

def test_index_formula_and_nodata():
    # NDWI = (0.3 - 0.1)/(0.3 + 0.1) = 0.5; palette t = 0.75.
    bands = np.array([[[.1, np.nan]], [[.3, np.nan]], [[.2, np.nan]], [[.1, np.nan]]], dtype=float)
    with patch('backend.main._read_tiff', return_value=(bands, {'nodata':None})):
        response = client.post('/api/studio/render', files={'file':('test.tif',b'test','image/tiff')},data={'preset':'ndwi'})
    assert response.status_code == 200
    pixels = np.asarray(Image.open(io.BytesIO(base64.b64decode(response.json()['image'].split(',')[1]))))
    assert np.allclose(pixels[0,0], [52,182,190],atol=1)
    assert (pixels[0,1] == 0).all()

def test_presets_render_and_sar_is_rejected():
    for preset in ['rgb','false-color','ndvi','ndwi']:
        with Path('backend/samples/wide-before.tif').open('rb') as raster:
            response=client.post('/api/studio/render',files={'file':('wide.tif',raster,'image/tiff')},data={'preset':preset})
        assert response.status_code == 200
        assert response.json()['preset'] == preset
    with Path('backend/samples/lake-sar.tif').open('rb') as raster:
        response=client.post('/api/studio/render',files={'file':('sar.tif',raster,'image/tiff')},data={'preset':'ndvi'})
    assert response.status_code == 422
