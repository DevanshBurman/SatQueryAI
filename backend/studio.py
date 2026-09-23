"""Query-driven recording workspace. Cloud credentials never cross the API boundary."""
import json
import logging
import os
import time
from datetime import date
from pathlib import Path
from typing import Literal

import httpx
import numpy as np
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError, PartialCredentialsError
from fastapi import APIRouter, File, Form, Header, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field, field_validator
from backend.vision import Observation, VisionRequest, invoke, image_block

router = APIRouter(prefix='/api/studio', tags=['Analysis workspace'])
logger = logging.getLogger(__name__)
SAMPLES = Path(__file__).parent / 'samples'
# These are the WGS84 footprints of the bundled Upper Lake GeoTIFF crops.
# Keeping them alongside the manifest avoids requiring rasterio in the Vercel
# function just to transform fixed, known sample bounds at request time.
SAMPLE_BOUNDS = {
    'lake-before': [77.30223530891462, 23.223325166115295, 77.32763719274776, 23.246799634140256],
    'lake-after': [77.30223530891462, 23.223325166115295, 77.32763719274776, 23.246799634140256],
    'lake-sar': [77.30223530891462, 23.223325166115295, 77.32763719274776, 23.246799634140256],
    'wide-before': [77.27452730821419, 23.23654607568641, 77.3253366982593, 23.28349131709571],
    'wide-after': [77.27452730821419, 23.23654607568641, 77.3253366982593, 23.28349131709571],
}

class Evidence(Observation):
    date: str = ''
    source: str = ''
    crs: str | None = None
    bounds: list[float] | None = Field(default=None, min_length=4, max_length=4)

    @field_validator('date')
    @classmethod
    def valid_date(cls, value):
        if value:
            date.fromisoformat(value)
        return value

class Question(BaseModel):
    query: str = Field(min_length=1, max_length=4000)
    observations: list[Evidence] = Field(min_length=1, max_length=2)

def route(question: Question) -> str:
    q = question.query.lower().strip()
    if not q:
        raise HTTPException(422, 'Enter a question about the selected observations.')
    modes = {o.modality for o in question.observations}
    temporal = any(word in q for word in ['change', 'between', 'increased', 'decreased', 'before', 'after', 'compare', 'two dates'])
    paired = any(word in q for word in ['together', 'fusion', 'both sensors', 'optical and sar'])
    if temporal and len(question.observations) != 2:
        raise HTTPException(422, 'Select two dated observations to answer a change question.')
    if paired and modes != {'optical', 'sar'}:
        raise HTTPException(422, 'This question needs one optical and one SAR observation.')
    if modes == {'optical', 'sar'}:
        if temporal and not (paired and not any(word in q for word in ['change','increased','decreased','before','after','two dates'])):
            raise HTTPException(422, 'A cross-sensor pair cannot establish temporal change. Select two corresponding images from the same modality.')
        a, b = question.observations
        if not a.crs or a.crs != b.crs or not a.bounds or not b.bounds or not np.allclose(a.bounds,b.bounds,rtol=0,atol=1e-7):
            raise HTTPException(422, 'Paired sensor analysis requires matching georeferenced coverage. Upload aligned optical and SAR crops.')
        return 'cross-modal'
    if len(question.observations) == 2:
        a, b = question.observations
        if not a.date or not b.date or a.date == b.date:
            raise HTTPException(422, 'Provide distinct acquisition dates for temporal comparison.')
        if a.date > b.date:
            raise HTTPException(422, 'Order the earlier observation first; use Swap dates.')
        return 'temporal'
    return 'single-image'

def plan(question: Question) -> dict:
    task = route(question)
    return {'task': task, 'steps': [
        {'tool': 'input-validator', 'detail': f'{len(question.observations)} observation(s); {task} configuration'},
        {'tool': 'bedrock.converse', 'detail': f'Answer the submitted question from {task} visual evidence'},
        {'tool': 'evidence-report', 'detail': 'Return the answer, source references, limitations and executed parameters'}]}

@router.get('/status')
def status():
    return {'configured': bool(os.getenv('AWS_REGION') and os.getenv('BEDROCK_MODEL_ID')),
            'provider': 'Amazon Bedrock', 'model': os.getenv('BEDROCK_MODEL_ID', ''),
            'credentialsVerified': False,
            'local': os.getenv('SATQUERY_LOCAL_DEMO') == 'true' and not os.getenv('VERCEL')}

def bedrock_failure_detail(exc: Exception) -> str:
    """Return an actionable public error without exposing provider messages or account data."""
    if isinstance(exc, (NoCredentialsError, PartialCredentialsError)):
        return 'Bedrock credentials are missing on the server. Configure server-side AWS credentials in Vercel Production and redeploy.'
    if isinstance(exc, ClientError):
        code = exc.response.get('Error', {}).get('Code', '')
        hints = {
            'AccessDeniedException': 'Bedrock denied model invocation. Check IAM permissions, model access and any inference-profile destination regions.',
            'UnrecognizedClientException': 'AWS rejected the server credentials. Check the access key, secret key and session token.',
            'InvalidClientTokenId': 'AWS rejected the server access key or session token.',
            'ExpiredTokenException': 'The server AWS session token expired. Refresh all temporary credentials and redeploy.',
            'SignatureDoesNotMatch': 'AWS could not validate the request signature. Check the server access key and secret key.',
            'ValidationException': 'Bedrock rejected the request. Check the model ID, region, inference-profile requirements and image limits.',
            'ResourceNotFoundException': 'The configured Bedrock model or inference profile was not found in this region.',
            'ThrottlingException': 'Bedrock is throttling requests. Check quota and retry later.',
            'ServiceUnavailableException': 'Bedrock is temporarily unavailable. Retry later.',
            'ModelTimeoutException': 'The Bedrock model timed out. Retry with a smaller request.',
        }
        if code in hints:
            return f'{code}: {hints[code]} No substitute answer was generated.'
    if isinstance(exc, BotoCoreError):
        return 'The server could not connect to Bedrock or load AWS credentials. Check server configuration and function logs.'
    return 'The model call failed. Check the server function logs; no substitute answer was generated.'

@router.post('/plan')
def get_plan(question: Question):
    return plan(question)

def authorize(request: Request, authorization: str | None):
    # The recording server is explicitly launched on loopback. This shortcut is
    # never enabled in production, even if its environment is copied accidentally.
    if (os.getenv('SATQUERY_LOCAL_DEMO') == 'true' and not os.getenv('VERCEL')
            and request.client and request.client.host in {'127.0.0.1','::1'}
            and request.headers.get('origin', '') in {'','http://127.0.0.1:5173','http://localhost:5173'}):
        return
    url = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
    key = os.getenv('SUPABASE_ANON_KEY') or os.getenv('VITE_SUPABASE_PUBLISHABLE_KEY')
    if not url or not key or not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Sign in to use the connected model, or run the local recording server.')
    try:
        response = httpx.get(f'{url.rstrip("/")}/auth/v1/user', headers={'apikey':key,'Authorization':authorization}, timeout=8)
        if response.status_code != 200 or not response.json().get('id'):
            raise HTTPException(401, 'Your sign-in has expired. Sign in again.')
        allowed = {v.strip().lower() for v in os.getenv('SATQUERY_DEMO_EMAILS','').split(',') if v.strip()}
        if not allowed or response.json().get('email','').lower() not in allowed:
            raise HTTPException(403, 'Cloud analysis is limited to the configured recording team.')
    except httpx.HTTPError as exc:
        raise HTTPException(503, 'Could not verify your account.') from exc

@router.post('/answer')
def answer(question: Question, request: Request, authorization: str | None = Header(default=None)):
    authorize(request, authorization)
    workflow = plan(question)
    for observation in question.observations:
        image_block(observation)
    if not status()['configured']:
        raise HTTPException(503, 'Configure AWS_REGION and BEDROCK_MODEL_ID on the backend.')
    import boto3
    from botocore.config import Config
    start = time.monotonic()
    try:
        client = boto3.client('bedrock-runtime', region_name=os.environ['AWS_REGION'],
                              config=Config(connect_timeout=5, read_timeout=60, retries={'max_attempts':0}))
        payload = VisionRequest(query=question.query, task=workflow['task'], observations=[
            Observation(label=f'{o.label} | {o.date} | {o.source}'[:160], modality=o.modality, image=o.image) for o in question.observations])
        result = invoke(payload, client)
    except HTTPException:
        raise
    except Exception as exc:
        # Provider exception messages may contain account identifiers. Log only
        # the exception class; known AWS error codes are safely mapped above.
        logger.warning('Bedrock invocation failed (%s)', type(exc).__name__)
        raise HTTPException(502, bedrock_failure_detail(exc)) from exc
    return {**result, 'query': question.query, 'elapsedSeconds': round(time.monotonic()-start, 2),
            'sources': [o.model_dump(exclude={'image'}) for o in question.observations], 'plan': workflow}

@router.post('/inspect')
async def inspect(file: UploadFile = File(...)):
    from backend.main import _save_upload, _read_tiff, _raster_preview
    if Path(file.filename or '').suffix.lower() not in {'.tif','.tiff'}:
        raise HTTPException(422, 'Upload a GeoTIFF/TIFF. Benchmark images are a separate input mode.')
    path = await _save_upload(file)
    try:
        bands, meta = _read_tiff(path)
        return {'image': _raster_preview(bands), 'width':meta['width'], 'height':meta['height'],
                'bands':len(bands), 'crs':meta['crs'], 'bounds':meta['bounds'],
                'note':'Preview uses bands 3/2/1 when available; confirm band order before interpreting.'}
    except (ValueError, OSError) as exc:
        raise HTTPException(422, 'The TIFF could not be decoded.') from exc
    finally:
        path.unlink(missing_ok=True)

@router.get('/samples')
def samples():
    from backend.main import _read_tiff, _raster_preview
    manifest = SAMPLES / 'manifest.json'
    if not manifest.exists():
        return []
    items = json.loads(manifest.read_text(encoding='utf-8'))
    for item in items:
        bands, meta = _read_tiff(SAMPLES / f'{item["id"]}.tif')
        item.update(image=_raster_preview(bands), crs=meta['crs'], bounds=meta['bounds'])
    return items

@router.get('/collection')
def collection():
    return [{ 'id': item['id'], 'sample_id': item['id'], 'source': item['label'], 'date': item['date'],
              'cloud': item.get('cloud'), 'resolution_m': 10, 'mode': item['modality'], 'thumbnail': item['image'],
              'bbox': SAMPLE_BOUNDS[item['id']] } for item in samples()]

def _sample_file(sample_id: str):
    from fastapi.responses import FileResponse
    allowed = {item['id'] for item in json.loads((SAMPLES / 'manifest.json').read_text())}
    if sample_id not in allowed or not (SAMPLES / f'{sample_id}.tif').exists():
        raise HTTPException(404, 'Sample not found')
    return FileResponse(SAMPLES / f'{sample_id}.tif', media_type='image/tiff', filename=f'{sample_id}.tif')

@router.get('/sample-file')
def sample_file_query(sample_id: str):
    """Vercel-safe sample download route using a query parameter."""
    return _sample_file(sample_id)

@router.get('/sample/{sample_id}')
def sample_file(sample_id: str):
    return _sample_file(sample_id)

@router.post('/render')
async def render(file: UploadFile = File(...), preset: Literal['rgb','false-color','ndvi','ndwi'] = Form('rgb')):
    from backend.main import _save_upload, _read_tiff, _raster_preview
    from PIL import Image
    import base64
    import io
    path = await _save_upload(file)
    try:
        bands, meta = _read_tiff(path)
        if len(bands) < 4:
            raise HTTPException(422, 'This preset requires band order blue, green, red, NIR. SAR needs a radar-specific renderer.')
        valid = np.isfinite(bands[:4]).all(axis=0)
        if meta['nodata'] is not None:
            valid &= (bands[:4] != meta['nodata']).all(axis=0)
        if preset == 'rgb':
            image = _raster_preview(bands)
        elif preset == 'false-color':
            image = _raster_preview(np.stack([bands[1], bands[2], bands[3]]))
        else:
            a, b = (bands[3], bands[2]) if preset == 'ndvi' else (bands[1], bands[3])
            valid &= np.abs(a+b) > 1e-6
            index = np.divide(a-b, a+b, out=np.zeros_like(a), where=valid)
            t = np.clip((index+1)/2, 0, 1)
            rgb = np.stack([210*(1-t), 70+150*t, 55+180*t if preset == 'ndwi' else 60*(1-t)], axis=-1)
            rgb[~valid] = 0
            buffer = io.BytesIO(); Image.fromarray(rgb.astype('uint8')).save(buffer, format='PNG')
            image = 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode()
        return {'image':image, 'preset':preset, 'note':{'rgb':'RGB: red / green / blue','false-color':'False colour: NIR / red / green','ndvi':'NDVI = (NIR − red) / (NIR + red); scale −1 to +1','ndwi':'NDWI = (green − NIR) / (green + NIR); scale −1 to +1'}[preset]}
    finally:
        path.unlink(missing_ok=True)

@router.post('/water')
async def water(file: UploadFile = File(...), green_band: int = Form(2), nir_band: int = Form(4), threshold: float = Form(.15)):
    from backend.main import _save_upload, _read_tiff, _mask_png, _pixel_area
    if min(green_band, nir_band) < 1 or green_band == nir_band or not -1 <= threshold <= 1:
        raise HTTPException(422, 'Invalid band mapping or threshold.')
    path = await _save_upload(file)
    try:
        bands, meta = _read_tiff(path)
        if max(green_band, nir_band) > len(bands):
            raise HTTPException(422, 'Green and near-infrared bands are required for a water mask.')
        g, n = bands[green_band-1].astype(float), bands[nir_band-1].astype(float)
        valid = np.isfinite(g) & np.isfinite(n) & (np.abs(g+n) > 1e-6)
        if meta['nodata'] is not None:
            valid &= (g != meta['nodata']) & (n != meta['nodata'])
        if not valid.any():
            raise HTTPException(422, 'No valid pixels in the selected bands.')
        mask = valid & ((g-n)/(g+n+1e-6) > threshold)
        area, divisor, unit, method = _pixel_area(meta)
        return {'answer': f'Highlighted water-index candidates cover {mask.sum()*area/divisor:.2f} {unit}. Cyan shows pixels above NDWI {threshold:.2f}. Shadows and clouds can cause errors; this is spectral water extraction, not a trained grounding model.',
                'task':'water-grounding', 'maskPng':_mask_png(mask), 'mode':'Measured spectral index',
                'trace':[{'tool':'NDWI', 'parameters':{'greenBand':green_band,'nirBand':nir_band,'threshold':threshold}, 'status':'complete'}, {'tool':'pixel-area','method':method,'status':'complete'}],
                'limitations':['Confirm green/NIR band mapping and reflectance scaling. Cloud masking is not applied.']}
    finally:
        path.unlink(missing_ok=True)
