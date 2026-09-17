import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Bot, CalendarDays, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Cloud, Database, Download, Eye, FileText, Folder,
  Gauge, History, Image as ImageIcon, Layers3, LocateFixed, Map, MapPin, Menu,
  MessageSquareText, MoreHorizontal, Pencil, Play, Plus, Radar, RotateCw, Search, Settings,
  Sparkles, Upload, User, WandSparkles, Waves,
} from 'lucide-react'
import maplibregl, { type Map as MapLibreMap, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './analysis-workspace.css'
import { analyzeWaterChange, getServiceHealth, searchCatalog, type CatalogScene, type ServiceHealth, type WaterChangeResult } from './api'

type Section = 'projects' | 'data' | 'analysis' | 'results' | 'library' | 'activity' | 'settings'
type AnalysisStage = 'choose' | 'plan' | 'run'
type Layer = { id: string; title: string; subtitle: string; opacity: number; visible: boolean }

const PROJECTS = [
  { title: 'Wayanad flood assessment', meta: 'Edited 12 min ago', observations: 4, className: 'wayanad' },
  { title: 'Coastal change monitoring', meta: 'Edited 2 days ago', observations: 12, className: 'coast' },
  { title: 'Reservoir watch', meta: 'Edited 5 days ago', observations: 8, className: 'reservoir' },
]

const PREPARED_SCENES: CatalogScene[] = [
  { id: 'S2_WAYANAD_2024_08_12', source: 'Sentinel-2 L2A', date: '2024-08-12', cloud: 12, resolution_m: 10, mode: 'optical', thumbnail: null, bbox: [76.02, 11.48, 76.25, 11.72] },
  { id: 'S1_WAYANAD_2024_08_10', source: 'Sentinel-1 GRD', date: '2024-08-10', cloud: null, resolution_m: 10, mode: 'sar', thumbnail: null, bbox: [76.02, 11.48, 76.25, 11.72] },
  { id: 'L9_WAYANAD_2024_08_05', source: 'Landsat 8/9', date: '2024-08-05', cloud: 8, resolution_m: 30, mode: 'optical', thumbnail: null, bbox: [76.02, 11.48, 76.25, 11.72] },
]

function BrandMark() { return <span className="brand-mark" aria-hidden="true"><i /><i /></span> }
function PreparedBadge({ children = 'Prepared demonstration' }: { children?: ReactNode }) { return <span className="prepared-badge"><Sparkles />{children}</span> }

function SideNavigation({ current, navigate, home }: { current: Section; navigate: (section: Section) => void; home: () => void }) {
  const [expanded, setExpanded] = useState(true)
  const items = [['projects', 'Projects', Folder], ['data', 'Discover', Map], ['library', 'Library', Database], ['activity', 'Activity', Activity]] as const
  return <aside className={`workspace-sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
    <div className="sidebar-brand"><button className="brand-button" onClick={home} aria-label="Return to landing page"><BrandMark /><span>SatQuery</span></button><button className="sidebar-toggle" onClick={() => setExpanded(value => !value)} aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}>{expanded ? <ChevronLeft /> : <Menu />}</button></div>
    <nav aria-label="Main workspace navigation">{items.map(([id, label, Icon]) => <button key={id} className={current === id ? 'active' : ''} onClick={() => navigate(id)}><Icon /><span>{label}</span></button>)}</nav>
    <div className="sidebar-bottom"><button><CircleHelp /><span>Help</span></button><button className={current === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><Settings /><span>Settings</span></button><button className="profile"><span>DK</span><b>Devansh</b><ChevronRight /></button></div>
  </aside>
}

function ProjectHeader({ section, navigate }: { section: Section; navigate: (section: Section) => void }) {
  const insideProject = ['data', 'analysis', 'results'].includes(section)
  return <header className="workspace-header">
    <div className="project-identity"><BrandMark /><b>SatQuery</b>{insideProject && <><i /><button>Wayanad flood assessment<ChevronDown /></button></>}</div>
    {insideProject ? <nav className="project-tabs" aria-label="Project steps">{(['data', 'analysis', 'results'] as const).map((id, index) => <span key={id}><button className={section === id ? 'active' : ''} onClick={() => navigate(id)}>{id[0].toUpperCase() + id.slice(1)}</button>{index < 2 && <i />}</span>)}</nav> : <div className="global-search"><Search /><input aria-label="Search projects" placeholder="Search projects, locations, or imagery…" /></div>}
    <div className="header-context">{insideProject && <><span><MapPin />Wayanad, Kerala, India</span><i /><b>Jan 2024 — Aug 2024</b></>}<button className="header-avatar"><User /></button></div>
  </header>
}

function ProjectsPage({ openData }: { openData: () => void }) {
  return <div className="projects-page page-scroll"><div className="page-title-row"><div><span className="crumb">Workspace / Projects</span><h1>Projects</h1><p>Continue an investigation or start directly from satellite data.</p></div><button className="primary-button"><Plus />New project</button></div>
    <div className="projects-layout"><section className="project-list">{PROJECTS.map((project, index) => <article className={`project-card ${index === 0 ? 'featured' : ''}`} key={project.title}><div className={`project-cover ${project.className}`}><span>10 km</span></div><div className="project-card-copy"><span className="draft-label">Draft</span><h2>{project.title}</h2><div><span><Layers3 />{project.observations} observations</span><span><History />{project.meta}</span></div></div><button className="more-button" aria-label={`More actions for ${project.title}`}><MoreHorizontal /></button>{index === 0 && <button className="open-project" onClick={openData}>Open project<ArrowRight /></button>}</article>)}</section>
      <aside className="start-card"><div className="layer-illustration"><span /><span /><span /></div><h2>Start with data</h2><p>Find public imagery or bring your own GeoTIFF, PNG, or JPEG into a new investigation.</p><button className="primary-button wide" onClick={openData}><Search />Discover public imagery</button><label className="secondary-button wide"><Upload />Upload your own data<input type="file" hidden multiple accept="image/*,.tif,.tiff" /></label><small><Check /> Batch upload supported</small></aside></div>
  </div>
}

function DataMap({ bbox }: { bbox: [number, number, number, number] }) {
  const element = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  useEffect(() => {
    if (!element.current || map.current) return
    const style: StyleSpecification = { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap' } }, layers: [{ id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.28, 'raster-contrast': 0.04, 'raster-brightness-max': 0.94 } }] }
    const instance = new maplibregl.Map({ container: element.current, style, center: [76.12, 11.61], zoom: 9.2, attributionControl: false })
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right'); map.current = instance
    return () => { instance.remove(); map.current = null }
  }, [])
  useEffect(() => { map.current?.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 90, duration: 500, maxZoom: 11 }) }, [bbox])
  return <div className="map-stage"><div ref={element} /><div className="imagery-overlay" /><div className="map-search"><Search /><input aria-label="Search map" placeholder="Search for a place, coordinates, or scene ID…" /></div><button className="locate-button"><LocateFixed /></button><div className="scale-bar">5 km</div><div className="mini-map"><div /></div></div>
}

function DataPage({ proceed }: { proceed: () => void }) {
  const [sources, setSources] = useState({ sentinel2: true, landsat: true, sentinel1: true })
  const [maxCloud, setMaxCloud] = useState(30), [preset, setPreset] = useState('true')
  const [scenes, setScenes] = useState<CatalogScene[]>(PREPARED_SCENES)
  const [catalogStatus, setCatalogStatus] = useState<'ready' | 'loading' | 'live' | 'fallback'>('ready')
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'true', title: 'Sentinel-2 · True color', subtitle: '12 Aug 2024 · optical', opacity: 100, visible: true },
    { id: 'ndwi', title: 'Sentinel-2 · NDWI', subtitle: 'Water index · derived view', opacity: 70, visible: true },
    { id: 'sar', title: 'Sentinel-1 · VV/VH', subtitle: '10 Aug 2024 · radar', opacity: 60, visible: true },
  ])
  const bbox: [number, number, number, number] = [76.02, 11.48, 76.25, 11.72]
  const runSearch = async () => {
    setCatalogStatus('loading'); const selected = [sources.sentinel2 && 'sentinel-2-l2a', sources.sentinel1 && 'sentinel-1-grd'].filter(Boolean) as string[]
    try { const result = await searchCatalog({ bbox, date_from: '2024-01-01', date_to: '2024-08-31', sources: selected.length ? selected : ['sentinel-2-l2a'], max_cloud: maxCloud, limit: 12 }); setScenes(result.scenes.length ? result.scenes : PREPARED_SCENES); setCatalogStatus(result.live ? 'live' : 'fallback') }
    catch { setScenes(PREPARED_SCENES); setCatalogStatus('fallback') }
  }
  const updateLayer = (id: string, patch: Partial<Layer>) => setLayers(items => items.map(item => item.id === id ? { ...item, ...patch } : item))
  return <div className="data-page"><aside className="filter-panel"><div className="panel-heading"><div><span>DATA / DISCOVER</span><h1>Find observations</h1></div><ChevronLeft /></div><p>Search public satellite imagery for your area of interest.</p>
    <section className="filter-section"><header><span><b>1</b>Source</span><ChevronDown /></header><h4>Optical</h4><label><input type="checkbox" checked={sources.sentinel2} onChange={() => setSources(v => ({ ...v, sentinel2: !v.sentinel2 }))} />Sentinel-2</label><label><input type="checkbox" checked={sources.landsat} onChange={() => setSources(v => ({ ...v, landsat: !v.landsat }))} />Landsat 8/9</label><h4>Radar (SAR)</h4><label><input type="checkbox" checked={sources.sentinel1} onChange={() => setSources(v => ({ ...v, sentinel1: !v.sentinel1 }))} />Sentinel-1</label></section>
    <section className="filter-section observation-filter"><header><span><b>2</b>Observation</span><ChevronDown /></header><label className="field-label"><CalendarDays />Jan 2024 — Aug 2024<ChevronDown /></label><label className="field-label"><Map />Intersects with AOI<ChevronDown /></label><div className="cloud-row"><span><Cloud />Cloud</span><b>0 — {maxCloud}%</b></div><input aria-label="Maximum cloud cover" type="range" min="0" max="100" value={maxCloud} onChange={event => setMaxCloud(Number(event.target.value))} /><button className="search-catalog" onClick={runSearch} disabled={catalogStatus === 'loading'}>{catalogStatus === 'loading' ? <RotateCw className="spin" /> : <Search />}{catalogStatus === 'loading' ? 'Searching…' : 'Search this area'}</button></section>
    <div className="results-heading"><b>{scenes.length} observations</b><span>{catalogStatus === 'live' ? 'Live STAC' : catalogStatus === 'fallback' ? 'Prepared fallback' : 'Ready to search'}</span></div><div className="observation-list">{scenes.slice(0, 5).map((scene, index) => <button key={scene.id}><span className={`scene-thumb ${scene.mode} scene-${index}`} style={scene.thumbnail ? { backgroundImage: `url(${scene.thumbnail})` } : undefined} /><span><em className={scene.mode}>{scene.mode === 'sar' ? 'SAR' : 'Optical'}</em><b>{scene.source}</b><small>{scene.date} · {scene.resolution_m} m {scene.cloud == null ? '· VV + VH' : `· Cloud ${Math.round(scene.cloud)}%`}</small></span><MoreHorizontal /></button>)}</div></aside>
    <DataMap bbox={bbox} /><aside className="visual-panel"><section><header><span><b>3</b>Visualization</span><ChevronDown /></header><h4>Optical presets</h4><div className="preset-grid">{[['true','True color'],['false','False color'],['ndvi','NDVI'],['ndwi','NDWI'],['ndbi','NDBI']].map(([id,label]) => <button key={id} className={`${id} ${preset === id ? 'active' : ''}`} onClick={() => setPreset(id)}><span>{preset === id && <Check />}</span><b>{label}</b></button>)}</div><h4 className="sar-title">SAR presets</h4><div className="preset-grid sar-presets">{[['vv','VV'],['vh','VH'],['vvvh','VV/VH composite']].map(([id,label]) => <button key={id} className={id} onClick={() => setPreset(id)}><span /><b>{label}</b></button>)}</div><p className="preset-note"><CircleHelp /> Presets change how sensor bands are rendered; they do not invent new measurements.</p></section>
      <section className="layer-section"><header><span><b>4</b>Project layers</span><ChevronDown /></header>{layers.map(layer => <div className="layer-row" key={layer.id}><button onClick={() => updateLayer(layer.id, { visible: !layer.visible })}><Eye className={layer.visible ? '' : 'muted'} /></button><span><b>{layer.title}</b><small>{layer.subtitle}</small></span><input aria-label={`${layer.title} opacity`} type="range" min="0" max="100" value={layer.opacity} onChange={event => updateLayer(layer.id, { opacity: Number(event.target.value) })} /><em>{layer.opacity}%</em></div>)}<button className="primary-button wide" onClick={proceed}>Add {layers.length} layers to project<ArrowRight /></button></section></aside></div>
}

const ANALYSES = [
  { id: 'visual', icon: WandSparkles, title: 'Visual query', tag: 'Ask one scene', copy: 'Select a point, box, or mask and ask a grounded question about visible features.', chips: ['Optical', 'VLM-ready'], color: 'blue' },
  { id: 'temporal', icon: History, title: 'Temporal change', tag: 'Compare dates', copy: 'Align before and after observations, calculate change, and inspect evidence.', chips: ['Optical', 'Deterministic'], color: 'orange' },
  { id: 'fusion', icon: Radar, title: 'Sensor fusion', tag: 'Optical + SAR', copy: 'Cross-check surface context with cloud-independent radar evidence.', chips: ['Sentinel-2', 'Sentinel-1'], color: 'violet' },
] as const

function ChooseAnalysis({ choose }: { choose: () => void }) {
  return <div className="choose-page page-scroll"><div className="back-crumb">Data / <b>Choose analysis</b></div><div className="analysis-intro"><PreparedBadge /><h1>What do you want to learn?</h1><p>Choose the job. SatQuery will assemble an editable workflow from your question, area, and selected observations.</p></div><div className="analysis-cards">{ANALYSES.map(({ id, icon: Icon, title, tag, copy, chips, color }) => <article key={id} className={color}><div className="analysis-icon"><Icon /></div><span>{tag}</span><h2>{title}</h2><p>{copy}</p><div>{chips.map(chip => <em key={chip}>{chip}</em>)}</div><button onClick={choose}>Build analysis plan<ArrowRight /></button></article>)}</div><section className="batch-banner"><span><Layers3 /></span><div><h3>Need to process many observations?</h3><p>Upload a folder or select a time series. SatQuery will validate every file and build a reviewable batch plan.</p></div><button onClick={choose}>Plan batch workflow<ArrowRight /></button></section></div>
}

const PLAN_STEPS = [
  ['Understand objective', 'Flood extent after heavy rainfall', 'Your question and project area', 'Analysis objective and scope', Gauge],
  ['Validate observations', 'Coverage, dates, CRS, resolution, cloud quality', 'Selected satellite observations', 'Validated and ready to use', Layers3],
  ['Prepare imagery', 'Decode GeoTIFF, align AOI, generate analysis-ready views', 'Validated observations', 'Analysis-ready imagery', Settings],
  ['Route specialists', 'Optical change + Sentinel-1 SAR support', 'Analysis-ready imagery', 'Configured analysis workflow', Bot],
  ['Synthesize evidence', 'Map, measurements, limitations and answer', 'Analysis results from specialists', 'Final map, insights and answer', FileText],
] as const

function PlanPage({ back, run }: { back: () => void; run: () => void }) {
  const [edited, setEdited] = useState<number[]>([])
  return <div className="plan-page"><main><div className="back-crumb"><button onClick={back}><ArrowLeft />Choose analysis</button> / <b>Review plan</b></div><h1>Review analysis plan</h1><p>SatQuery prepared this editable workflow from your question and selected observations.</p><div className="plan-list">{PLAN_STEPS.map(([title, desc, input, output, Icon], index) => <article key={title} className={edited.includes(index) ? 'edited' : ''}><b className="step-number">{index + 1}</b><span className={`step-icon step-${index}`}><Icon /></span><div className="step-copy"><h2>{title}</h2><p>{desc}</p></div><div className="io"><span><small>Input</small>{input}</span><span><small>Output</small>{output}</span></div><button onClick={() => setEdited(items => items.includes(index) ? items.filter(item => item !== index) : [...items, index])}><Pencil />{edited.includes(index) ? 'Saved' : 'Edit'}</button></article>)}</div></main><aside className="selected-evidence"><h2>Selected evidence</h2><div className="evidence-image optical" /><h3>Sentinel-2</h3><p>2024-07-30 · 10:24 UTC<br />Optical · 10 m</p><div className="evidence-image sar" /><h3>Sentinel-1</h3><p>2024-07-28 · 22:17 UTC<br />SAR · 10 m</p><div className="info-callout"><CircleHelp />Optical visibility is limited. Radar support included.</div></aside><footer><button className="secondary-button" onClick={back}>Back</button><div><PreparedBadge>Editable orchestration plan</PreparedBadge><button className="primary-button" onClick={run}>Run analysis<ArrowRight /></button></div></footer></div>
}

function ChangeRunner({ finish }: { finish: () => void }) {
  const [before, setBefore] = useState<File>(), [after, setAfter] = useState<File>()
  const [result, setResult] = useState<WaterChangeResult>(), [status, setStatus] = useState('Waiting for two GeoTIFFs')
  const run = async () => { if (!before || !after) return; setStatus('Running deterministic NDWI analysis…'); try { const response = await analyzeWaterChange(before, after, 2, 4, 0.15); setResult(response); setStatus('Analysis complete') } catch (error) { setStatus(error instanceof Error ? error.message : 'Analysis failed') } }
  return <div className="runner-page page-scroll"><div className="back-crumb">Analysis / <b>Run</b></div><div className="runner-heading"><div><span>CONNECTED WORKFLOW</span><h1>Temporal water-change analysis</h1><p>Use the included demo GeoTIFFs or upload an aligned pair.</p></div><span className={`run-status ${result ? 'complete' : ''}`}><i />{status}</span></div><div className="runner-grid"><section className="upload-pair">{(['before','after'] as const).map(slot => <label key={slot}><Upload /><b>{slot === 'before' ? 'Before observation' : 'After observation'}</b><span>{slot === 'before' ? before?.name || 'Choose a GeoTIFF' : after?.name || 'Choose a GeoTIFF'}</span><input hidden type="file" accept=".tif,.tiff" onChange={event => { const file = event.target.files?.[0]; if (slot === 'before') setBefore(file); else setAfter(file) }} /></label>)}<button className="primary-button" disabled={!before || !after} onClick={run}><Play />Run measured analysis</button></section><section className="run-preview"><div className="analysis-map"><div className={result ? 'water-mask visible' : 'water-mask'} /></div>{result ? <div className="measured-result"><PreparedBadge>Computed from uploaded rasters</PreparedBadge><h2>{result.summary}</h2><div><span><b>{result.expandedAreaHa.toFixed(1)} ha</b>expanded water</span><span><b>{result.changePercent.toFixed(1)}%</b>change</span></div><button className="primary-button" onClick={finish}>Open result<ArrowRight /></button></div> : <div className="empty-run"><Waves /><h2>Evidence will appear here</h2><p>The connected workflow calculates NDWI and returns measured change. No model is required for this step.</p></div>}</section></div></div>
}

function ResultsPage() {
  const [tab, setTab] = useState('combined'), [open, setOpen] = useState('evidence'), [question, setQuestion] = useState('')
  return <div className="results-page"><main><div className="result-heading"><div><span>RESULTS / FLOOD EXTENT</span><h1>Flood extent result <em>Sensor fusion</em></h1></div><PreparedBadge /></div><nav className="result-tabs">{[['combined','Combined result'],['optical','Optical evidence'],['sar','SAR evidence']].map(([id,label]) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}>{label}</button>)}</nav><section className={`result-map ${tab}`}><div className="result-legend"><span><i />Detected water ({tab === 'combined' ? 'sensor fusion' : tab})</span><span><i />Area of interest (AOI)</span></div><div className="flood-overlay" /><div className="aoi-outline" /><span className="result-scale">5 km</span></section><div className="source-strip"><article><div className="source-thumb optical" /><div><b>Sentinel-2 optical</b><p>Surface water and contextual detail.</p><small>30 Jul 2024 · 10 m · Cloud 12%</small></div></article><article><div className="source-thumb sar" /><div><b>Sentinel-1 SAR</b><p>Cloud-independent complementary evidence.</p><small>28 Jul 2024 · VV/VH · 10 m</small></div></article></div><div className="question-bar"><MessageSquareText /><input value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask about this result…" /><button disabled={!question.trim()}><ArrowRight /></button></div></main><aside className="response-panel"><h2>Response</h2><PreparedBadge /><p>In the selected area, the prepared demonstration indicates approximately 12.4 km² of expanded surface water. Optical context is cross-checked with Sentinel-1 SAR evidence to reduce uncertainty under cloud cover.</p><div className="metric"><span>Estimated water expansion</span><b>12.4 km²</b><small>Prepared for interface demonstration</small></div>{[['evidence','Evidence',ImageIcon],['method','Method',Settings],['limits','Limitations',AlertTriangle]].map(([id,label,Icon]) => <div className="result-accordion" key={id as string}><button onClick={() => setOpen(open === id ? '' : id as string)}><Icon /><b>{label as string}</b><ChevronDown /></button>{open === id && <p>{id === 'evidence' ? 'Sentinel-2 optical and Sentinel-1 VV/VH observations over the same AOI.' : id === 'method' ? 'Prepared optical water index and radar-support workflow. Connect the fusion model before treating this as measured output.' : 'Cloud, layover, seasonal water and georegistration can affect interpretation.'}</p>}</div>)}<button className="trace-button"><FileText />View orchestration trace</button><button className="export-button"><Download />Export report</button></aside></div>
}

function LibraryPage() { return <div className="simple-page page-scroll"><div className="page-title-row"><div><span className="crumb">Workspace / Library</span><h1>Data library</h1><p>Reusable observations, uploads, masks, and analysis-ready layers.</p></div><button className="primary-button"><Upload />Upload data</button></div><div className="library-grid">{['Sentinel-2 · Wayanad · 30 Jul','Sentinel-1 · Wayanad · 28 Jul','Water change mask · prepared','Wayanad AOI boundary'].map((name,index) => <article key={name}><div className={`library-preview item-${index}`} /><span>{index < 2 ? 'Observation' : 'Derived asset'}</span><h2>{name}</h2><p>{index < 2 ? 'Public catalog metadata · 10 m' : 'Project asset · demonstration'}</p><button><MoreHorizontal /></button></article>)}</div></div> }
function ActivityPage() { return <div className="simple-page page-scroll"><div className="page-title-row"><div><span className="crumb">Workspace / Activity</span><h1>Activity & reports</h1><p>Review work across projects without mixing it into the analysis workspace.</p></div><button className="secondary-button"><Download />Export log</button></div><section className="activity-table"><header><span>Job</span><span>Project</span><span>Status</span><span>Updated</span></header>{[['Flood extent demonstration','Wayanad flood assessment','Prepared','12 min ago'],['Raster validation','Coastal change monitoring','Complete','Yesterday'],['Catalog search','Reservoir watch','Complete','5 days ago']].map(row => <div key={row[0]}><span><FileText /><b>{row[0]}</b></span><span>{row[1]}</span><span><i />{row[2]}</span><span>{row[3]}<ChevronRight /></span></div>)}</section></div> }
function SettingsPage({ health }: { health: ServiceHealth | null }) { return <div className="simple-page page-scroll"><div className="page-title-row"><div><span className="crumb">Workspace / Settings</span><h1>Workspace settings</h1><p>Connections, map defaults, and prototype disclosures.</p></div></div><div className="settings-grid"><section><Database /><div><h2>Geospatial service</h2><p>{health ? `Connected · Rasterio ${health.rasterio}` : 'Offline · start the local FastAPI service'}</p></div><span className={health ? 'online' : ''}>{health ? 'Online' : 'Offline'}</span></section><section><Map /><div><h2>Basemap</h2><p>OpenStreetMap raster tiles · no Google key required</p></div><button>Change</button></section><section><Bot /><div><h2>Vision-language model</h2><p>Not connected. Prepared outputs remain visibly labelled.</p></div><span>Not connected</span></section></div></div> }

export default function AnalysisWorkspace({ home }: { home: () => void }) {
  const [section, setSection] = useState<Section>('projects'), [analysisStage, setAnalysisStage] = useState<AnalysisStage>('choose'), [health, setHealth] = useState<ServiceHealth | null>(null)
  useEffect(() => { const controller = new AbortController(); getServiceHealth(controller.signal).then(setHealth).catch(() => setHealth(null)); return () => controller.abort() }, [])
  const navigate = (next: Section) => { setSection(next); if (next === 'analysis') setAnalysisStage('choose') }
  const content = useMemo(() => {
    if (section === 'projects') return <ProjectsPage openData={() => setSection('data')} />
    if (section === 'data') return <DataPage proceed={() => { setSection('analysis'); setAnalysisStage('choose') }} />
    if (section === 'analysis') { if (analysisStage === 'plan') return <PlanPage back={() => setAnalysisStage('choose')} run={() => setAnalysisStage('run')} />; if (analysisStage === 'run') return <ChangeRunner finish={() => setSection('results')} />; return <ChooseAnalysis choose={() => setAnalysisStage('plan')} /> }
    if (section === 'results') return <ResultsPage />
    if (section === 'library') return <LibraryPage />
    if (section === 'activity') return <ActivityPage />
    return <SettingsPage health={health} />
  }, [section, analysisStage, health])
  return <main className="satquery-app"><SideNavigation current={section} navigate={navigate} home={home} /><ProjectHeader section={section} navigate={navigate} /><div className="workspace-content">{content}</div></main>
}
