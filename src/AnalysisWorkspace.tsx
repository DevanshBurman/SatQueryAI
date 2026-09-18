import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bot, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Database, Download, Eye, FileText, Folder,
  Gauge, History, Home, Image as ImageIcon, Layers3, Map, MapPin,
  MessageSquareText, MoreHorizontal, Pencil, Play, Plus, RotateCw, Search, Settings,
  Sparkles, Upload, User, Waves, X,
} from 'lucide-react'
import DataPage from './DiscoveryPage'
import 'maplibre-gl/dist/maplibre-gl.css'
import './analysis-workspace.css'
import './workspace-layout.css'
import { analyzeWaterChange, getServiceHealth, type CatalogScene, type ServiceHealth, type WaterChangeResult } from './api'

type Section = 'projects' | 'data' | 'analysis' | 'results' | 'library' | 'activity' | 'settings'
type AnalysisStage = 'choose' | 'plan' | 'run'

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

function BrandMark() { return <span className="sq-brand-mark" aria-hidden="true"><i /><i /></span> }
function PreparedBadge({ children = 'Prepared demonstration' }: { children?: ReactNode }) { return <span className="prepared-badge"><Sparkles />{children}</span> }

function SideNavigation({ current, navigate, home }: { current: Section; navigate: (section: Section) => void; home: () => void }) {
  const items = [['projects', 'Home', Home], ['analysis', 'Analysis', BarChart3], ['data', 'Data', Database], ['results', 'Results', FileText]] as const
  return <aside className="workspace-sidebar" aria-label="Workspace navigation">
    <div className="sidebar-brand"><button className="brand-button" onClick={home} aria-label="Return to landing page"><BrandMark /><span>SatQuery</span></button></div>
    <nav aria-label="Main workspace navigation">{items.map(([id, label, Icon]) => <button key={id} className={current === id ? 'active' : ''} onClick={() => navigate(id)}><Icon /><span>{label}</span></button>)}</nav>
    <div className="sidebar-bottom"><button><CircleHelp /><span>Help</span></button><button className={current === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><Settings /><span>Settings</span></button><button className="profile"><span>DK</span><b>Devansh</b><ChevronRight /></button></div><ChevronRight className="rail-peek" />
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


const ANALYSES = [
  { id: 'visual', icon: Eye, title: 'Visual query', tag: 'Optical or SAR', copy: 'Ask about one optical or SAR observation.', color: 'blue' },
  { id: 'temporal', icon: Activity, title: 'Temporal change', tag: 'Two or more dates', copy: 'Compare the same area across dates.', color: 'orange' },
  { id: 'fusion', icon: Layers3, title: 'Sensor fusion', tag: 'Optical + radar', copy: 'Combine optical and radar evidence.', color: 'violet' },
] as const

function WorkflowPreview({ kind }: { kind: 'visual' | 'temporal' | 'fusion' }) {
  return <svg className={`workflow-preview ${kind}`} viewBox="0 0 190 105" role="img" aria-label={`Illustrative ${kind} output, not a measured result`}>
    <rect width="190" height="105" fill={kind === 'fusion' ? '#46604f' : '#e4ebf0'} />
    <g fill="none" stroke={kind === 'fusion' ? '#829580' : '#fff'} strokeWidth="1.3" opacity=".8">
      <path d="M0 18L24 27 49 16 76 31 110 12 146 21 190 8M0 68L27 61 46 81 82 67 101 81 137 57 190 73M19 0L32 30 20 55 36 105M68 0L58 39 79 57 65 105M146 0L135 30 158 64 141 105M0 92L53 87 99 97 150 86 190 98" />
      <path d="M0 46L35 40 64 48 93 35 126 46 150 37 190 47M101 0L89 23 108 53 95 105" strokeWidth="2" />
    </g>
    {kind === 'visual' ? <>
      <path d="M37 34L59 29 72 40 67 56 48 64 30 51Z" fill="#91b9fb" fillOpacity=".7" stroke="#3379ec" strokeWidth="1.5" />
      <path d="M113 0V105" stroke="#cfdbe7" /><rect x="119" y="13" width="64" height="79" rx="3" fill="white" />
      <text x="125" y="27" fontSize="7" fill="#263e57" fontWeight="600">Selected region</text>
      <text x="125" y="43" fontSize="6" fill="#667d94">Inspect features</text><text x="125" y="55" fontSize="6" fill="#667d94">Review evidence</text><text x="125" y="67" fontSize="6" fill="#667d94">Ask a follow-up</text>
    </> : <>
      <path d="M88 -5L79 14 93 26 80 40 97 53 88 67 109 82 101 110" stroke={kind === 'fusion' ? '#52b6fc' : '#85b9e1'} strokeWidth="12" fill="none" />
      <path d="M89 27L114 22 129 32M93 54L64 60 48 48M105 82L131 73 153 83" stroke={kind === 'fusion' ? '#52b6fc' : '#85b9e1'} strokeWidth="6" fill="none" />
      <path d="M78 10L70 19 84 28 70 41 80 52M88 60L78 70 97 83 89 96M64 56L48 42 38 48" stroke={kind === 'fusion' ? '#91d3ff' : '#e58c9c'} strokeWidth="6" fill="none" />
      <rect x="6" y="86" width="71" height="13" rx="2" fill="#fff" fillOpacity=".92" /><circle cx="12" cy="92" r="2" fill={kind === 'fusion' ? '#52b6fc' : '#e58c9c'} /><text x="18" y="95" fontSize="7" fill="#475f77">Example overlay</text>
    </>}
  </svg>
}

function ChooseAnalysis({ choose, openData, observations }: { choose: () => void; openData: () => void; observations: CatalogScene[] }) {
  const [selectedJob, setSelectedJob] = useState('temporal')
  const [sourceOpen, setSourceOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [uploads, setUploads] = useState<string[]>([])
  const [selectedAssets, setSelectedAssets] = useState<string[]>(() => observations.map(scene => scene.id))
  const [prompt, setPrompt] = useState('Map flood extent after the July rainfall and compare it with the earlier observation')
  const selectedCount = selectedAssets.length + uploads.length
  const toggleAsset = (id: string) => setSelectedAssets(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id])
  return <div className="analysis-home">
    <main className="analysis-job-main"><div className="analysis-job-heading"><span>ANALYSIS</span><h1>Choose an analysis</h1><p>Turn satellite data into insight. Select a workflow to get started.</p></div>
      <div className="job-list">{ANALYSES.map(({ id, icon: Icon, title, copy, tag, color }) => <button key={id} aria-pressed={selectedJob === id} className={`job-row ${color} ${selectedJob === id ? 'selected' : ''}`} onClick={() => setSelectedJob(id)}>
        <span className="job-icon"><Icon /></span><span className="job-copy"><b>{title}<ChevronRight /></b><small>{copy}</small><em>{tag}</em></span>
        <span className={`job-diagram diagram-${id}`} title="Workflow illustrations — not analysis results">{id === 'visual' ? <><span className="flow-node"><i className="scene one" /><small>Single observation</small></span><ArrowRight /><span className="flow-node"><WorkflowPreview kind="visual" /><small>Answer and visual context</small></span></> : id === 'temporal' ? <><span className="flow-node"><i className="scene before" /><small>Earlier date</small></span><b>···</b><span className="flow-node"><i className="scene after" /><small>Later date</small></span><ArrowRight /><span className="flow-node"><WorkflowPreview kind="temporal" /><small>Change map and insights</small></span></> : <><span className="sensor-pair"><span className="flow-node"><i className="scene optical" /><small>Optical</small></span><span className="flow-node"><i className="scene sar" /><small>SAR</small></span></span><b className="fusion-brace">{'}'}</b><ArrowRight /><span className="flow-node"><WorkflowPreview kind="fusion" /><small>Combined analysis and insights</small></span></>}</span>
      </button>)}</div>
    </main>
    <aside className="analysis-inputs"><div className="inputs-heading"><div><span>INPUTS</span><h2>Selected observations</h2></div><b>{selectedCount} ready</b></div>
      {observations.filter(scene => selectedAssets.includes(scene.id)).map(scene => <article className="selected-observation" key={scene.id}><div className={`observation-image ${scene.mode}`} style={scene.thumbnail ? { backgroundImage: `url(${scene.thumbnail})` } : undefined} /><button onClick={() => toggleAsset(scene.id)} aria-label={`Remove ${scene.source} observation`}><X /></button><h3>{scene.source}</h3><p>{scene.date}</p><small>{scene.mode === 'sar' ? 'SAR' : 'Optical'} · {scene.resolution_m} m{scene.cloud == null ? '' : ` · Cloud ${Math.round(scene.cloud)}%`}</small></article>)}
      {selectedAssets.includes('boundary') && <article className="uploaded-observation"><Map /><span><b>District AOI boundary</b><small>Vector boundary from Library</small></span><button onClick={() => toggleAsset('boundary')} aria-label="Remove district AOI boundary"><X /></button></article>}
      {uploads.map(name => <article className="uploaded-observation" key={name}><FileText /><span><b>{name}</b><small>Uploaded to this project</small></span><button onClick={() => setUploads(items => items.filter(item => item !== name))} aria-label={`Remove ${name}`}><X /></button></article>)}
      <button className="add-observations" onClick={() => setSourceOpen(value => !value)}><Plus /><span><b>Add more observations</b><small>Discover, upload, or reuse project data</small></span><ChevronDown /></button>
      {sourceOpen && <div className="input-actions"><button onClick={openData}><Search /><span><b>Discover imagery</b><small>Search public Sentinel and Landsat data</small></span><ChevronRight /></button><label><Upload /><span><b>Upload your data</b><small>PNG, JPG, GeoTIFF or multiple files</small></span><Plus /><input type="file" hidden multiple accept="image/*,.tif,.tiff" onChange={event => setUploads(items => [...items, ...Array.from(event.target.files || []).map(file => file.name).filter(name => !items.includes(name))])} /></label><button onClick={() => setLibraryOpen(value => !value)}><Folder /><span><b>Choose from Library</b><small>Reuse uploads and prepared project assets</small></span><ChevronDown /></button></div>}
      {sourceOpen && libraryOpen && <div className="library-picker"><span>PROJECT LIBRARY</span>{observations.map(scene => <label key={scene.id}><input type="checkbox" checked={selectedAssets.includes(scene.id)} onChange={() => toggleAsset(scene.id)} /><span><b>{scene.source} · {scene.date}</b><small>{scene.mode === 'sar' ? 'SAR observation' : 'Optical observation'}</small></span></label>)}<label><input type="checkbox" checked={selectedAssets.includes('boundary')} onChange={() => toggleAsset('boundary')} /><span><b>District AOI boundary</b><small>Vector boundary</small></span></label></div>}
    </aside>
    <footer className="analysis-builder"><div className="analysis-prompt"><MessageSquareText /><input value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Or describe what you need to know…" /></div><div className="builder-summary"><span><b>{ANALYSES.find(job => job.id === selectedJob)?.title}</b><small>{selectedCount} observations selected</small></span><button className="primary-button" disabled={selectedCount === 0} onClick={choose}>Build analysis plan<ArrowRight /></button></div></footer>
  </div>
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
  const [section, setSection] = useState<Section>('analysis'), [analysisStage, setAnalysisStage] = useState<AnalysisStage>('choose'), [health, setHealth] = useState<ServiceHealth | null>(null)
  const [projectScenes, setProjectScenes] = useState<CatalogScene[]>(PREPARED_SCENES.slice(0, 2))
  useEffect(() => { const controller = new AbortController(); getServiceHealth(controller.signal).then(setHealth).catch(() => setHealth(null)); return () => controller.abort() }, [])
  const navigate = (next: Section) => { setSection(next); if (next === 'analysis') setAnalysisStage('choose') }
  const content = useMemo(() => {
    if (section === 'projects') return <ProjectsPage openData={() => setSection('data')} />
    if (section === 'data') return <DataPage back={() => setSection('analysis')} proceed={scenes => { setProjectScenes(scenes); setSection('analysis'); setAnalysisStage('choose') }} />
    if (section === 'analysis') { if (analysisStage === 'plan') return <PlanPage back={() => setAnalysisStage('choose')} run={() => setAnalysisStage('run')} />; if (analysisStage === 'run') return <ChangeRunner finish={() => setSection('results')} />; return <ChooseAnalysis choose={() => setAnalysisStage('plan')} openData={() => setSection('data')} observations={projectScenes} /> }
    if (section === 'results') return <ResultsPage />
    if (section === 'library') return <LibraryPage />
    if (section === 'activity') return <ActivityPage />
    return <SettingsPage health={health} />
  }, [section, analysisStage, health, projectScenes])
  return <main className="satquery-app"><SideNavigation current={section} navigate={navigate} home={home} /><ProjectHeader section={section} navigate={navigate} /><div className="workspace-content">{content}</div></main>
}
