import asyncio
from pathlib import Path
from unittest.mock import patch
import numpy as np
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from backend.main import app, _analyze_paths
from backend.studio import Question, route

def observation(modality='optical', date='2021-05-06'):
    return {'label':'Test scene','modality':modality,'date':date,'image':'data:image/png;base64,eA==','crs':'EPSG:32643','bounds':[0,0,2560,2560]}

def test_single_query_routes():
    assert route(Question(query='Describe this scene',observations=[observation()])) == 'single-image'

def test_temporal_dates_required():
    with pytest.raises(HTTPException, match='distinct acquisition dates'):
        route(Question(query='What changed?',observations=[observation(),observation()]))

def test_temporal_requires_pair():
    with pytest.raises(HTTPException, match='two dated observations'):
        route(Question(query='Has built-up area increased?',observations=[observation()]))

def test_cross_modal_routes():
    assert route(Question(query='Use both sensors together',observations=[observation(),observation('sar')])) == 'cross-modal'

def test_cross_modal_cannot_claim_temporal_change():
    with pytest.raises(HTTPException, match='cross-sensor pair'):
        route(Question(query='What changed?',observations=[observation(),observation('sar')]))

def test_cloud_requires_authenticated_team(monkeypatch):
    monkeypatch.delenv('SATQUERY_LOCAL_DEMO',raising=False)
    response=TestClient(app).post('/api/studio/answer',json={'query':'Describe', 'observations':[observation()]})
    assert response.status_code == 401

def test_invalid_bands_rejected():
    root=Path('backend/samples')
    with pytest.raises(HTTPException,match='distinct positive band'):
        _analyze_paths(root/'lake-before.tif',root/'lake-after.tif',0,4)

def test_shifted_grid_rejected():
    from backend.main import _read_tiff
    root=Path('backend/samples')
    bands, metadata=_read_tiff(root/'lake-before.tif')
    shifted={**metadata, 'bounds':[value+10 for value in metadata['bounds']]}
    with patch('backend.main._read_tiff',side_effect=[(bands,metadata),(bands,shifted)]):
        with pytest.raises(HTTPException,match='grids differ'):
            _analyze_paths(root/'lake-before.tif',root/'lake-after.tif')

def test_all_nodata_rejected():
    from backend.main import _read_tiff
    root=Path('backend/samples')
    bands, metadata=_read_tiff(root/'lake-before.tif')
    bands[:]=np.nan
    with patch('backend.main._read_tiff',return_value=(bands,metadata)):
        with pytest.raises(HTTPException,match='No common valid pixels'):
            _analyze_paths(root/'lake-before.tif',root/'lake-after.tif')

def test_samples_are_actual_registered_rasters():
    from backend.main import _read_tiff
    root=Path('backend/samples')
    before,bmeta=_read_tiff(root/'lake-before.tif')
    after,ameta=_read_tiff(root/'lake-after.tif')
    sar,smeta=_read_tiff(root/'lake-sar.tif')
    assert before.shape == after.shape == (4,256,256)
    assert sar.shape == (2,256,256)
    assert bmeta['bounds'] == ameta['bounds'] == smeta['bounds']
    assert bmeta['crs'] == ameta['crs'] == smeta['crs']
