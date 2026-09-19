export type ServiceHealth = {
  status: 'ok'
  service: string
  engine: string
}

export type RasterStatistic = {
  band: number
  min: number
  max: number
  mean: number
}

export type RasterInspection = {
  filename: string
  width: number
  height: number
  bands: number
  dtype: string
  crs: string | null
  bounds: [number, number, number, number]
  nodata: number | null
  statistics: RasterStatistic[]
}

export type AnalysisTrace = {
  label: string
  detail: string
  status: string
}

export type WaterChangeResult = {
  mode: string
  summary: string
  beforeWaterHa: number
  afterWaterHa: number
  expandedAreaHa: number
  changePercent: number
  threshold: number
  crs: string
  areaMethod: string
  areaUnit: 'ha' | 'pixels'
  beforePreviewPng: string
  afterPreviewPng: string
  maskPng: string
  trace: AnalysisTrace[]
}

export type CatalogScene = {
  id: string
  source: string
  date: string
  cloud: number | null
  resolution_m: number
  mode: 'optical' | 'sar'
  thumbnail: string | null
  bbox: [number, number, number, number] | null
}

export type CatalogSearchRequest = {
  bbox: [number, number, number, number]
  date_from: string
  date_to: string
  sources: string[]
  max_cloud: number
  limit: number
}

export type CatalogSearchResult = {
  provider: string
  live: boolean
  scenes: CatalogScene[]
}

async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`
    try {
      const payload = await response.json() as { detail?: string }
      if (payload.detail) detail = payload.detail
    } catch {
      // Preserve the HTTP status when the API does not return JSON.
    }
    throw new Error(detail)
  }
  return response.json() as Promise<T>
}

export function getServiceHealth(signal?: AbortSignal) {
  return apiRequest<ServiceHealth>('/api/health', { signal })
}

export function inspectRaster(file: File, signal?: AbortSignal) {
  const body = new FormData()
  body.append('file', file)
  return apiRequest<RasterInspection>('/api/raster/inspect', { method: 'POST', body, signal })
}

export function analyzeWaterChange(before: File, after: File, greenBand: number, nirBand: number, threshold: number, signal?: AbortSignal) {
  const body = new FormData()
  body.append('before', before)
  body.append('after', after)
  body.append('green_band', String(greenBand))
  body.append('nir_band', String(nirBand))
  body.append('threshold', String(threshold))
  return apiRequest<WaterChangeResult>('/api/analysis/water-change', { method: 'POST', body, signal })
}

export function searchCatalog(request: CatalogSearchRequest, signal?: AbortSignal) {
  return apiRequest<CatalogSearchResult>('/api/catalog/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })
}
