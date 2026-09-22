import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Database, Eye, Layers3, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import maplibregl, { type Map as MapInstance } from 'maplibre-gl'
import { searchCatalog, type CatalogScene } from './api'
import './discovery.css'

type Bounds = [number, number, number, number]
const WAYANAD: Bounds = [76.02, 11.48, 76.25, 11.72]
const UPPER_LAKE: Bounds = [77.24, 23.20, 77.37, 23.32]
const EXAMPLES: CatalogScene[] = [
  { id: 'example-optical', source: 'Sentinel-2 · example', date: '2024-07-26', cloud: 12, resolution_m: 10, mode: 'optical', thumbnail: null, bbox: WAYANAD },
  { id: 'example-radar', source: 'Sentinel-1 · example', date: '2024-08-04', cloud: null, resolution_m: 10, mode: 'sar', thumbnail: null, bbox: WAYANAD },
  { id: 'example-earlier', source: 'Sentinel-2 · example', date: '2024-07-16', cloud: 8, resolution_m: 10, mode: 'optical', thumbnail: null, bbox: WAYANAD },
]

function footprint(scene: CatalogScene) {
  const [w, s, e, n] = scene.bbox!
  return { type: 'Feature' as const, properties: { id: scene.id }, geometry: { type: 'Polygon' as const, coordinates: [[[w,s],[e,s],[e,n],[w,n],[w,s]]] } }
}

export default function DiscoveryPage({ proceed, back }: { proceed: (scenes: CatalogScene[]) => void; back: () => void }) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<MapInstance | null>(null)
  const viewport = useRef<Bounds>(WAYANAD)
  const request = useRef<AbortController | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [scenes, setScenes] = useState<CatalogScene[]>([])
  const [selected, setSelected] = useState<CatalogScene[]>([])
  const [active, setActive] = useState<CatalogScene | null>(null)
  const [filters, setFilters] = useState(false)
  const [visual, setVisual] = useState(false)
  const [mode, setMode] = useState('all')
  const [dateFrom, setDateFrom] = useState('2024-07-01')
  const [dateTo, setDateTo] = useState('2024-08-31')
  const [cloud, setCloud] = useState(30)
  const [location, setLocation] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'live'|'example'|'error'>('idle')
  const [showFootprint, setShowFootprint] = useState(true)
  const [opacity, setOpacity] = useState(20)
  const [mapError, setMapError] = useState(false)
  const [prepared, setPrepared] = useState(false)

  const useUpperLake = () => {
    setPrepared(true); setLocation('23.26, 77.30'); setDateFrom('2021-05-01'); setDateTo('2021-11-30')
    viewport.current = UPPER_LAKE
    map.current?.fitBounds([[UPPER_LAKE[0],UPPER_LAKE[1]],[UPPER_LAKE[2],UPPER_LAKE[3]]], {padding:40})
    setNotice('Upper Lake source pack selected. Search this area for downloadable Sentinel rasters.')
  }

  useEffect(() => {
    if (!container.current) return
    const instance = new maplibregl.Map({ container: container.current, center: [76.135, 11.6], zoom: 10,
      style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } }, layers: [{ id: 'basemap', type: 'raster', source: 'osm', paint: { 'raster-saturation': -.4 } }] } })
    map.current = instance
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    instance.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    const updateBounds = () => { const b = instance.getBounds(); viewport.current = [Math.max(-180,b.getWest()), Math.max(-85,b.getSouth()), Math.min(180,b.getEast()), Math.min(85,b.getNorth())] }
    instance.on('moveend', updateBounds)
    instance.on('error', () => setMapError(true))
    instance.on('load', () => { updateBounds(); setMapReady(true) })
    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(container.current)
    return () => { request.current?.abort(); observer.disconnect(); instance.remove(); map.current = null }
  }, [])

  useEffect(() => {
    const instance = map.current
    if (!mapReady || !instance) return
    const data = { type: 'FeatureCollection' as const, features: active?.bbox ? [footprint(active)] : [] }
    const source = instance.getSource('observation') as maplibregl.GeoJSONSource | undefined
    if (source) source.setData(data)
    else {
      instance.addSource('observation', { type: 'geojson', data })
      instance.addLayer({ id: 'observation-fill', type: 'fill', source: 'observation', paint: { 'fill-color': '#1765ed', 'fill-opacity': .2 } })
      instance.addLayer({ id: 'observation-edge', type: 'line', source: 'observation', paint: { 'line-color': '#1765ed', 'line-width': 2 } })
    }
    for (const layer of ['observation-fill','observation-edge']) instance.setLayoutProperty(layer, 'visibility', showFootprint ? 'visible' : 'none')
    instance.setPaintProperty('observation-fill', 'fill-opacity', opacity / 100)
  }, [active, mapReady, showFootprint, opacity])

  const focusScene = (scene: CatalogScene) => {
    setActive(scene); setVisual(false)
    if (scene.bbox) map.current?.fitBounds([[scene.bbox[0],scene.bbox[1]],[scene.bbox[2],scene.bbox[3]]], { padding: 100, maxZoom: 12, duration: 400 })
  }
  const toggleSelected = (scene: CatalogScene) => setSelected(items => {
    if (items.some(item => item.id === scene.id)) return items.filter(item => item.id !== scene.id)
    if (items.length >= 2) {
      setNotice('Choose up to two observations. SatQuery can compare two dates or combine one optical and one SAR scene.')
      return items
    }
    return [...items, scene]
  })
  const loadExamples = () => {
    request.current?.abort()
    setScenes(EXAMPLES); setStatus('example'); setNotice('Example catalogue · footprints and metadata only, not downloaded satellite pixels.'); setFilters(false)
    focusScene(EXAMPLES[0])
  }
  const locate = (event: React.FormEvent) => {
    event.preventDefault()
    if (location.trim().toLowerCase() === 'wayanad') { map.current?.fitBounds([[WAYANAD[0],WAYANAD[1]],[WAYANAD[2],WAYANAD[3]]], { padding: 80 }); setNotice('Map centred on Wayanad. Search this area to find observations.'); return }
    const parts = location.trim().split(/[,\s]+/).map(Number)
    if (parts.length !== 2 || !parts.every(Number.isFinite) || Math.abs(parts[0]) > 85 || Math.abs(parts[1]) > 180) { setNotice('Enter latitude, longitude (for example 11.60, 76.13), or use the Wayanad shortcut.'); return }
    const upperLake = parts[0] >= UPPER_LAKE[1] && parts[0] <= UPPER_LAKE[3] && parts[1] >= UPPER_LAKE[0] && parts[1] <= UPPER_LAKE[2]
    if (upperLake) { useUpperLake(); return }
    setPrepared(false); map.current?.flyTo({ center: [parts[1],parts[0]], zoom: 10, duration: 600 }); setNotice('Location updated. Live catalogue results are previews until their GeoTIFFs are uploaded.')
  }
  const runSearch = async () => {
    if (!dateFrom || !dateTo || dateFrom > dateTo) { setNotice('Choose a valid date range: start must be before end.'); return }
    request.current?.abort()
    const controller = new AbortController(); request.current = controller
    setStatus('loading'); setNotice(''); setActive(null); setVisual(false); setScenes([])
    try {
      const typed = location.trim().split(/[,\s]+/).map(Number)
      const preparedSearch = prepared || (typed.length === 2 && typed[0] >= UPPER_LAKE[1] && typed[0] <= UPPER_LAKE[3] && typed[1] >= UPPER_LAKE[0] && typed[1] <= UPPER_LAKE[2])
      if (preparedSearch) {
        setPrepared(true); setDateFrom('2021-05-01'); setDateTo('2021-11-30')
        const response = await fetch('/api/studio/collection', {signal:controller.signal})
        if (!response.ok) throw new Error('Collection unavailable')
        const items: CatalogScene[] = await response.json()
        const [w,s,e,n] = viewport.current
        setScenes(items.filter(item => item.bbox && item.bbox[0] <= e && item.bbox[2] >= w && item.bbox[1] <= n && item.bbox[3] >= s && item.date >= '2021-05-01' && item.date <= '2021-11-30' && (mode === 'all' || mode === item.mode) && (item.cloud === null || item.cloud <= cloud)))
        setStatus('live'); setNotice('Prepared Sentinel collection · real cropped rasters, ready to analyse.'); return
      }
      const result = await searchCatalog({ bbox: viewport.current, date_from: dateFrom, date_to: dateTo, sources: mode === 'optical' ? ['sentinel-2-l2a'] : mode === 'sar' ? ['sentinel-1-grd'] : ['sentinel-2-l2a','sentinel-1-grd'], max_cloud: mode === 'sar' ? 100 : cloud, limit: 12 }, controller.signal)
      if (controller.signal.aborted) return
      if (!result.live) { setStatus('error'); setNotice('Live catalogue is unavailable. Retry or open the example collection below.'); return }
      setScenes(result.scenes); setStatus('live'); setFilters(false)
      setNotice(result.scenes.length ? 'Select an observation to inspect its coverage.' : 'No observations found. Try a wider area or date range.')
    } catch { if (!controller.signal.aborted) { setStatus('error'); setNotice('Could not reach the catalogue service. Retry or use the example collection.')} }
  }

  return <section className="discovery" aria-label="Imagery discovery">
    <aside className="discovery-panel">
      <header><span className="discovery-eyebrow">PROJECT DATA</span><h1>Discover imagery</h1><p>Find observations. Bring them into your question.</p></header>
      <button className="discovery-filter-toggle" onClick={useUpperLake}><Layers3 size={16}/><span>{prepared ? 'Upper Lake rasters ready ✓' : 'Use real Upper Lake rasters'}<small>23.26, 77.30 · May–November 2021</small></span></button>
      <div className="discovery-tabs" role="group" aria-label="Sensor type">{[['all','All sensors'],['optical','Optical'],['sar','Radar · SAR']].map(([id,label]) => <button key={id} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>)}</div>
      <button className="discovery-filter-toggle" aria-expanded={filters} onClick={() => setFilters(v => !v)}><SlidersHorizontal size={16} /><span>Dates & filters<small>{dateFrom} — {dateTo}</small></span><ChevronDown size={16} /></button>
      {filters && <div className="discovery-filters"><label>From<input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label><label>To<input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>{mode !== 'sar' && <label className="cloud-filter">Optical cloud cover ≤ {cloud}%<input aria-label="Maximum cloud cover" type="range" min="0" max="100" value={cloud} onChange={e => setCloud(Number(e.target.value))} /></label>}<small>{mode === 'sar' ? 'Sentinel-1 GRD · radar observations' : mode === 'optical' ? 'Sentinel-2 L2A · multispectral observations' : 'Sentinel-2 optical + Sentinel-1 radar'}</small></div>}
      <button className="discovery-search" disabled={status === 'loading' || !mapReady} onClick={runSearch}><Search size={16}/>{status === 'loading' ? 'Searching…' : 'Search this map area'}</button>
      <div className="discovery-list-heading"><b>{scenes.length ? `${scenes.length} observations` : 'Observations'}</b><span>{status === 'live' ? (prepared ? 'Prepared collection' : 'Live catalogue') : status === 'example' ? 'Example collection' : 'Sentinel archive'}</span></div>
      <div className="discovery-list">
        {!scenes.length && <div className="discovery-empty"><MapPin size={30}/><h2>{status === 'loading' ? 'Finding observations' : 'Start with a place'}</h2><p>Move the map or enter coordinates, then search for imagery in this area.</p><span>Optical for surface detail.<br/>Radar for all-weather observations.</span></div>}
        {scenes.filter(scene => mode === 'all' || scene.mode === mode).map(scene => <article className={active?.id === scene.id ? 'is-active' : ''} key={scene.id}>
          <button className="discovery-scene" onClick={() => focusScene(scene)} aria-label={`Inspect ${scene.source} ${scene.date}`}><span className="discovery-thumbnail">{scene.thumbnail ? <img src={scene.thumbnail} alt="Scene preview" onError={e => { e.currentTarget.style.display = 'none' }} /> : <Layers3 size={25}/>}</span><span><small>{scene.sample_id ? 'RASTER READY' : scene.mode === 'sar' ? 'RADAR PREVIEW' : 'OPTICAL PREVIEW'}</small><b>{scene.source}</b><span>{scene.date} · {scene.resolution_m} m</span>{scene.cloud !== null && <span>Cloud cover {Math.round(scene.cloud)}%</span>}</span></button>
          <button className="discovery-select" aria-label={`Select ${scene.source} ${scene.date}`} aria-pressed={selected.some(s => s.id === scene.id)} onClick={() => toggleSelected(scene)}>{selected.some(s => s.id === scene.id) ? <Check size={15}/> : '+'}</button>
        </article>)}
      </div>
      <div className="discovery-example"><Database size={16}/><span>Preparing a walkthrough?</span><button onClick={loadExamples}>Use example data</button></div>
      <footer className="discovery-attach"><span><b>{selected.length} selected</b><small>Ready for your analysis workspace</small></span><button disabled={!selected.length} onClick={() => proceed(selected)}>Continue<ArrowRight size={17}/></button></footer>
    </aside>
    <div className="discovery-canvas">
      <div ref={container} className="discovery-map" />
      <form className="discovery-location" onSubmit={locate}><Search size={18}/><input aria-label="Find coordinates" value={location} onChange={e => setLocation(e.target.value)} placeholder="Latitude, longitude or Wayanad"/><button type="submit" aria-label="Go to location"><ArrowRight size={17}/></button></form>
      <button className="discovery-back" onClick={back}><ArrowLeft size={15}/>Back to analysis</button>
      {notice && <div className="discovery-notice" role="status">{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}><X size={14}/></button></div>}
      {mapError && <div className="discovery-map-warning">Some map tiles could not load. Check your connection.</div>}
      {!active && <div className="discovery-map-hint"><MapPin size={18}/><span><b>Your area, your evidence</b>Search the visible map area. Select a scene to inspect its footprint.</span></div>}
      {active && <div className="discovery-inspector">
        <div className="discovery-inspector-title"><div><small>{active.mode === 'sar' ? 'RADAR OBSERVATION' : 'OPTICAL OBSERVATION'}</small><h2>{active.source}</h2><p>{active.date} · {active.resolution_m} m · {active.bbox ? 'Coverage shown on map' : 'No footprint available'}</p></div><button aria-label="Close observation" onClick={() => {setActive(null);setVisual(false)}}><X size={18}/></button></div>
        {active.thumbnail && <img className="discovery-provider-preview" src={active.thumbnail} alt={active.sample_id ? 'Preview generated from downloadable source raster' : 'Provider preview, not a georeferenced map overlay'}/>}
        <p className={`discovery-data-status ${active.sample_id ? 'ready' : ''}`}>{active.sample_id ? 'Raster ready · selecting this observation attaches its source GeoTIFF.' : 'Preview only · upload the matching GeoTIFF before analysis.'}</p>
        <div className="discovery-inspector-actions"><button aria-expanded={visual} onClick={() => setVisual(v => !v)}><SlidersHorizontal size={16}/>Display options<ChevronDown size={14}/></button><button onClick={() => toggleSelected(active)}>{selected.some(s => s.id === active.id) ? <Check size={16}/> : <Layers3 size={16}/>} {selected.some(s => s.id === active.id) ? 'Selected' : 'Use observation'}</button></div>
        {visual && <div className="discovery-display"><label><input type="checkbox" checked={showFootprint} onChange={e => setShowFootprint(e.target.checked)}/><Eye size={15}/>Scene footprint</label><label>Footprint opacity · {opacity}%<input aria-label="Footprint opacity" type="range" min="0" max="70" value={opacity} onChange={e => setOpacity(Number(e.target.value))}/></label><div><b>{active.mode === 'sar' ? 'VV · VH · composite' : 'True colour · false colour · NDVI · NDWI'}</b><p>Band rendering becomes available when raster assets are connected. Catalogue thumbnails are previews, not analysis layers.</p></div></div>}
      </div>}
    </div>
  </section>
}
