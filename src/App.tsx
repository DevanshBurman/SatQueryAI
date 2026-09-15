import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowRight, BarChart3, BookOpen, Bot, Box, Braces, Check, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, CloudUpload, Code2, Database, Download, Eye,
  FileImage, FileText, Layers3, LocateFixed, Map, MapPinned, Menu, MessageSquareText,
  PanelLeftClose, PanelLeftOpen, Play, Plus, Radar, Search, Send, SlidersHorizontal,
  Sparkles, SquareDashedMousePointer, Upload, Waves, X, Zap,
} from 'lucide-react'
import './styles.css'
import LandingExperience from './LandingExperience'
import './workspace-theme.css'
import AnalysisWorkspace from './AnalysisWorkspace'

type View = 'landing' | 'workspace'
type Modal = 'onboarding' | 'imagery' | 'none'
type Result = {
  summary: string; answer: string; expandedAreaHa: number; changePercent: number;
  beforeWaterHa: number; afterWaterHa: number; maskPng?: string;
  trace: { label: string; detail: string; status: string }[];
  disclosure: string; evidence: string[]; mode: string
}

const tasks = [
  { icon: Eye, title: 'Understand one image', desc: 'Ask what is visible and receive grounded evidence.' },
  { icon: SquareDashedMousePointer, title: 'Locate something', desc: 'Click an object or draw an area to focus the question.' },
  { icon: Clock3, title: 'Compare two dates', desc: 'Measure floods, land-use shifts or new construction.' },
  { icon: Radar, title: 'Combine optical + SAR', desc: 'Cross-check observations when clouds hide the ground.' },
]

const fallbackResult: Result = {
  summary: 'Surface-water extent increased by 91.4% across the aligned scene pair.',
  answer: 'The selected river corridor shows substantial lateral expansion into low-lying agricultural parcels. Prioritise verification near the eastern embankment and the two road crossings visible inside the selected area.',
  expandedAreaHa: 628.2, changePercent: 91.4, beforeWaterHa: 687.3, afterWaterHa: 1315.5,
  disclosure: 'Prepared scenario; quantitative values are calculated live from bundled GeoTIFFs.',
  mode: 'deterministic GIS calculation', evidence: ['Optical scene pair', 'NDWI change mask', 'Georeferenced area'],
  trace: [
    { label: 'Inputs validated', detail: 'Two georeferenced four-band rasters', status: 'complete' },
    { label: 'Scenes aligned', detail: 'Matched to a shared 10 m analysis grid', status: 'complete' },
    { label: 'Water index computed', detail: 'NDWI threshold applied to both dates', status: 'complete' },
    { label: 'Change measured', detail: 'Newly detected water converted to hectares', status: 'complete' },
  ],
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand"><svg className="workspace-brand-mark" viewBox="0 0 60 58" aria-hidden="true"><path fill="#ff9838" d="M5 26C10 4 37 20 53 4C53 25 23 13 5 26Z"/><path fill="#f5fcff" d="M4 39C12 16 40 33 54 17C53 38 22 26 4 39Z"/><path fill="#27bb87" d="M3 52C13 29 40 45 53 31C51 52 22 39 3 52Z"/></svg>{!compact && <span>SatQuery AI</span>}</div>
}

function Landing({ enter }: { enter: () => void }) {
  return <main className="landing">
    <nav className="top-nav"><Brand /><div className="nav-links"><a href="#capabilities">Capabilities</a><a href="#workflow">Workflow</a><a href="/docs" target="_blank">API</a></div><button className="nav-cta" onClick={enter}>Open workspace <ArrowRight size={16}/></button></nav>
    <section className="hero">
      <div className="hero-image" />
      <div className="hero-grid" />
      <div className="hero-copy">
        <div className="eyebrow"><span className="live-dot" /> Earth observation copilot · SIH 26167</div>
        <h1>Ask Earth.<br/><span>Get evidence.</span></h1>
        <p>Turn optical and SAR satellite imagery into grounded, traceable answers—without requiring every officer to be a remote-sensing specialist.</p>
        <div className="hero-actions"><button className="primary" onClick={enter}>Explore prepared flood scenario <ArrowRight size={18}/></button><button className="ghost" onClick={enter}><Play size={16} fill="currentColor"/> Watch product flow</button></div>
        <div className="hero-proof"><div><strong>Optical + SAR</strong><span>Multimodal evidence</span></div><div><strong>GeoTIFF native</strong><span>Coordinates preserved</span></div><div><strong>Visible trace</strong><span>Every tool call shown</span></div></div>
      </div>
      <div className="scan-card"><div className="scan-head"><span>ASSAM · 27 AUG 2024</span><span className="status-chip">ANALYSIS READY</span></div><div className="mini-map"><div className="pulse"/><svg viewBox="0 0 300 135" aria-hidden="true"><path d="M-10 93 C45 42, 75 123, 118 72 S210 24, 315 78"/><path className="scan-fill" d="M-10 94 C45 43,75 124,118 73 S210 25,315 79 L315 105 C210 55,155 116,105 98 S45 70,-10 122Z"/></svg><div className="map-label">628.2 ha new water</div></div><div className="scan-foot"><span><Waves size={15}/> Flood extent</span><b>+91.4%</b></div></div>
      <div className="scroll-cue">SCROLL TO EXPLORE <span/></div>
    </section>
    <section className="capabilities" id="capabilities"><div className="section-kicker">ONE WORKSPACE · FOUR MODES</div><h2>From pixels to operational decisions.</h2><p className="section-lead">A focused interface for analysts and field officers—not a generic chatbot wrapped around a map.</p><div className="feature-grid">{tasks.map(({icon: Icon,title,desc},i)=><article key={title}><div className="feature-no">0{i+1}</div><Icon size={24}/><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
    <section className="workflow" id="workflow"><div><div className="section-kicker">THE SATQUERY DIFFERENCE</div><h2>Answers that show their work.</h2><p>Every result separates deterministic GIS calculation, model inference and source imagery. Officers see an operational trace—not hidden chain-of-thought.</p><button className="text-button" onClick={enter}>Open the workspace <ArrowRight size={17}/></button></div><div className="trace-demo">{['Inputs validated','Scenes aligned','Water index computed','Change measured','Report formed'].map((x,i)=><div key={x}><span>{i+1}</span><p><b>{x}</b><small>{['GeoTIFF + metadata','Shared analysis grid','NDWI / SAR cross-check','Area in hectares','Evidence-linked brief'][i]}</small></p><Check size={16}/></div>)}</div></section>
    <footer><Brand/><span>Decision support for Earth observation</span><span>Prepared for Smart India Hackathon 2026</span></footer>
  </main>
}

function Onboarding({ close, load }: { close:()=>void; load:()=>void }) {
  const [step,setStep]=useState(0)
  return <div className="modal-backdrop"><section className="onboarding modal" role="dialog" aria-modal="true"><button className="close" onClick={close} aria-label="Close"><X/></button>
    <div className="modal-brand"><Brand/></div><div className="progress-dots">{[0,1,2].map(i=><span className={i===step?'active':''} key={i}/>)}</div>
    {step===0 && <><div className="modal-kicker">WELCOME TO SATQUERYAI</div><h2>What do you need to understand?</h2><p>Choose a starting point. You can switch workflows at any time.</p><div className="task-grid">{tasks.map(({icon:Icon,title,desc},i)=><button key={title} className={i===2?'selected':''} onClick={()=>setStep(1)}><Icon/><span><b>{title}</b><small>{desc}</small></span><ChevronRight/></button>)}</div></>}
    {step===1 && <><div className="modal-kicker">GUIDED WORKFLOW</div><h2>Compare two dates, without losing context.</h2><div className="tutorial-layout"><div className="tutorial-visual"><div className="before-after"><span>BEFORE</span><span>AFTER</span></div><div className="tut-river"/><div className="tut-mask"/></div><div className="tutorial-copy">{[['1','Choose scenes','Search public imagery or upload GeoTIFFs.'],['2','Select an area','Click a feature or draw a precise polygon.'],['3','Ask & verify','See the answer, evidence and execution trace.']].map(x=><div key={x[0]}><span>{x[0]}</span><p><b>{x[1]}</b><small>{x[2]}</small></p></div>)}</div></div></>}
    {step===2 && <><div className="ready-icon"><Sparkles/></div><div className="modal-kicker">PREPARED DEMONSTRATION</div><h2>Assam flood extent is ready.</h2><p>Quantitative values are calculated live from bundled synthetic GeoTIFFs. The narrative is clearly labelled as prepared output until the adapted RS model is connected.</p><div className="scenario-summary"><MapPinned/><div><b>Dhemaji, Assam</b><span>18 Jul → 27 Aug 2024 · optical pair · 10 m</span></div><span className="status-chip">READY</span></div></>}
    <div className="modal-actions"><button className="link-button" onClick={close}>Skip tutorial</button><div>{step>0&&<button className="secondary" onClick={()=>setStep(step-1)}>Back</button>}<button className="primary" onClick={()=>step<2?setStep(step+1):load()}>{step<2?'Next':'Load scenario'} <ArrowRight size={16}/></button></div></div>
  </section></div>
}

function Sidebar({collapsed,setCollapsed,setImagery}:{collapsed:boolean;setCollapsed:(v:boolean)=>void;setImagery:()=>void}) {
  const nav=[['Workspace',Map],['Imagery',Layers3],['My areas',Box],['Analysis runs',Activity],['Reports',FileText],['API explorer',Code2]] as const
  return <aside className={'sidebar '+(collapsed?'collapsed':'')}><div className="side-brand"><Brand compact={collapsed}/><button onClick={()=>setCollapsed(!collapsed)} aria-label="Toggle navigation">{collapsed?<PanelLeftOpen/>:<PanelLeftClose/>}</button></div><nav>{nav.map(([label,Icon],i)=><button key={label} className={i===0?'active':''} onClick={label==='Imagery'?setImagery:undefined}><Icon/><span>{label}</span>{label==='Analysis runs'&&<em>1</em>}</button>)}</nav><div className="side-bottom"><button><CircleHelp/><span>Help & tutorial</span></button><div className="profile"><div>AK</div><span><b>Analyst workspace</b><small>Disaster management</small></span></div></div></aside>
}

function ScenePanel({openImagery}:{openImagery:()=>void}) {
  return <aside className="scene-panel"><div className="panel-title"><div><span>ACTIVE WORKFLOW</span><h2>Temporal analysis</h2></div><SlidersHorizontal/></div><div className="location"><MapPinned/><div><b>Dhemaji, Assam</b><span>AOI · 27.1 km²</span></div></div><div className="date-row"><span>SCENE PAIR</span><button onClick={openImagery}>Change</button></div>{[['BEFORE','18 Jul 2024','Sentinel-2 L2A','6.2% cloud'],['AFTER','27 Aug 2024','Sentinel-2 L2A','3.8% cloud']].map((x,i)=><article className="scene-card" key={x[0]}><div className={'scene-thumb scene-'+i}><span>{x[0]}</span></div><div><b>{x[1]}</b><span>{x[2]}</span><small>{x[3]} · 10 m</small></div><Check/></article>)}<button className="add-scene" onClick={openImagery}><Plus/> Add supporting SAR scene</button><div className="layers-title"><span>VISIBLE LAYERS</span><button><Plus/></button></div>{[['True colour',true],['Flood expansion mask',true],['Roads & settlements',false]].map(([x,on])=><label className="layer" key={String(x)}><span className={'layer-swatch '+(on?'on':'')}/><span>{x}</span><input type="checkbox" defaultChecked={Boolean(on)}/></label>)}</aside>
}

function MapViewer({swipe,setSwipe,mask,selecting,setSelecting}:{swipe:number;setSwipe:(n:number)=>void;mask?:string;selecting:boolean;setSelecting:(v:boolean)=>void}) {
  return <section className={'map-view '+(selecting?'selecting':'')} onClick={()=>selecting&&setSelecting(false)}><div className="map-before"/><div className="map-after" style={{clipPath:`inset(0 0 0 ${swipe}%)`}}/>{mask&&<img className="computed-mask" src={mask} alt="Computed flood expansion mask"/>}<svg className="flood-mask" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true"><path d="M80 585 C130 480 190 510 245 422 C310 318 260 245 355 198 C430 160 473 235 515 282 C560 334 615 286 688 326 C770 370 738 445 810 478 C867 504 902 465 980 406 L1000 525 C927 557 878 573 815 548 C742 518 718 466 657 449 C576 426 532 492 459 450 C391 411 410 332 343 323 C278 313 285 431 213 475 C150 513 146 620 80 650Z"/></svg><div className="map-topbar"><div className="crumb"><MapPinned/> Dhemaji, Assam <span>27.54°N, 94.58°E</span></div><div><button title="Search"><Search/></button><button title="Layers"><Layers3/></button><button title="Recenter"><LocateFixed/></button></div></div><div className="map-tools"><button className={selecting?'active':''} onClick={e=>{e.stopPropagation();setSelecting(!selecting)}} title="Select area"><SquareDashedMousePointer/></button><button title="Add imagery"><Plus/></button><button title="Map layers"><Map/></button></div><div className="selection-label"><SquareDashedMousePointer/> Selected river corridor · 27.1 km²</div><div className="swipe"><span>BEFORE</span><input aria-label="Compare before and after" type="range" min="5" max="95" value={swipe} onChange={e=>setSwipe(Number(e.target.value))}/><span>AFTER</span></div><div className="map-legend"><span><i/> Newly detected water</span><span>10 m pixels</span><span>2 km</span></div>{selecting&&<div className="select-help">Click the water body to accept the suggested region</div>}</section>
}

function AnswerPanel({result,loading,run}:{result:Result;loading:boolean;run:()=>void}) {
  const [question,setQuestion]=useState('Where did floodwater expand between these dates, and what needs field verification?')
  return <aside className="answer-panel"><div className="answer-head"><div><Bot/><span><b>SATQUERY</b><small>Evidence workspace</small></span></div><span className="prepared">PREPARED NARRATIVE</span></div><div className="answer-scroll"><div className="query"><span>YOUR QUESTION</span><p>{question}</p><div><span>Selected river corridor</span><span>2 scenes</span></div></div>{loading?<div className="loading-state"><div className="orb"/><h3>Analysing geospatial evidence</h3><p>Running transparent GIS tools on the scene pair…</p></div>:<><div className="answer"><span>ANSWER</span><h3>{result.summary}</h3><p>{result.answer}</p><div className="metric-row"><div><small>NEW WATER</small><b>{result.expandedAreaHa} ha</b></div><div><small>EXTENT CHANGE</small><b>+{result.changePercent}%</b></div></div><div className="evidence">{result.evidence.map(x=><span key={x}><Check/> {x}</span>)}</div></div><div className="disclosure"><CircleHelp/><span><b>{result.mode}</b>{result.disclosure}</span></div><div className="trace"><div className="trace-head"><span>ANALYSIS TRACE</span><span>4/4 complete</span></div>{result.trace.map((t,i)=><div className="trace-item" key={t.label}><span className="trace-icon"><Check/></span><p><b>{t.label}</b><small>{t.detail}</small></p>{i<result.trace.length-1&&<i/>}</div>)}</div><button className="report"><Download/> Export evidence brief</button></>}</div><form className="composer" onSubmit={e=>{e.preventDefault();run()}}><div className="context-chip"><SquareDashedMousePointer/> Selected area <button type="button">×</button></div><textarea value={question} onChange={e=>setQuestion(e.target.value)} aria-label="Ask about the imagery"/><div><button type="button" title="Upload GeoTIFF"><CloudUpload/></button><span>Enter to analyse</span><button className="send" disabled={loading} aria-label="Analyse"><Send/></button></div></form></aside>
}

function ImageryModal({close}:{close:()=>void}) {
  const [tab,setTab]=useState<'catalog'|'upload'|'prepared'>('catalog'); const [searching,setSearching]=useState(false); const [live,setLive]=useState<boolean|null>(null); const [file,setFile]=useState<File|null>(null); const [meta,setMeta]=useState<any>(null)
  async function search(){setSearching(true);try{const r=await fetch('/api/catalog/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});const d=await r.json();setLive(d.live)}catch{setLive(false)}finally{setSearching(false)}}
  async function inspect(f:File){setFile(f);const form=new FormData();form.append('file',f);try{const r=await fetch('/api/raster/inspect',{method:'POST',body:form});setMeta(await r.json())}catch{setMeta({error:'Start the FastAPI service to inspect this raster.'})}}
  return <div className="modal-backdrop right"><section className="imagery-modal" role="dialog" aria-modal="true"><header><div><span>ADD EVIDENCE</span><h2>Imagery & GeoTIFFs</h2></div><button onClick={close}><X/></button></header><div className="tabs"><button className={tab==='catalog'?'active':''} onClick={()=>setTab('catalog')}><Search/> Search catalogue</button><button className={tab==='upload'?'active':''} onClick={()=>setTab('upload')}><Upload/> Upload GeoTIFF</button><button className={tab==='prepared'?'active':''} onClick={()=>setTab('prepared')}><Sparkles/> Prepared</button></div>
    {tab==='catalog'&&<div className="imagery-content"><label>Location, coordinates or scene ID<div className="search-field"><Search/><input defaultValue="Dhemaji, Assam"/><button onClick={search}>{searching?'Searching…':'Search'}</button></div></label><div className="filter-row"><button><Clock3/> Jul–Sep 2024</button><button><Database/> Sentinel-2</button><button><Radar/> Sentinel-1</button><button><SlidersHorizontal/> Cloud ≤ 30%</button></div>{live!==null&&<div className={'catalog-status '+(live?'live':'fallback')}><span/><b>{live?'Live public STAC response':'Offline catalogue fallback'}</b><small>{live?'Element 84 Earth Search':'Prepared scenes remain available for the demonstration'}</small></div>}<div className="source-note"><Waves/><p><b>Recommended prototype source</b><span>Use Sentinel-2 optical and Sentinel-1 SAR through public STAC. Keep Bhoonidhi as a labelled India-source connector; use INSAT only for weather context, not 10 m damage mapping.</span></p></div><div className="catalog-list">{[['18 JUL 2024','Sentinel-2 L2A','6.2% cloud'],['27 AUG 2024','Sentinel-2 L2A','3.8% cloud'],['29 AUG 2024','Sentinel-1 GRD','SAR · cloud-independent']].map((x,i)=><article key={x[0]}><div className={'catalog-thumb c'+i}/><div><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]} · 10 m</small></div><button>{i<2?'Selected':'Add'}</button></article>)}</div></div>}
    {tab==='upload'&&<div className="imagery-content"><label className="dropzone"><input type="file" accept=".tif,.tiff" onChange={e=>e.target.files?.[0]&&inspect(e.target.files[0])}/><FileImage/><h3>{file?file.name:'Drop a GeoTIFF here'}</h3><p>or click to browse · .tif / .tiff · CRS and bands are preserved</p><button>Choose file</button></label>{meta&&<div className="metadata"><b>Raster inspection</b>{meta.error?<p>{meta.error}</p>:<div><span>{meta.width} × {meta.height} px</span><span>{meta.bands} bands</span><span>{meta.crs}</span><span>{meta.dtype}</span></div>}</div>}<div className="privacy-note"><Check/> Files are analysed locally by the prototype API and deleted after inspection.</div></div>}
    {tab==='prepared'&&<div className="imagery-content"><article className="prepared-card"><div className="prepared-image"/><div className="prepared-copy"><span>RECOMMENDED FOR VIDEO</span><h3>Assam flood extent</h3><p>Two bundled, georeferenced synthetic GeoTIFFs designed to demonstrate real alignment, NDWI segmentation and area measurement.</p><div><span>Dhemaji</span><span>2 dates</span><span>Optical</span><span>10 m</span></div><button onClick={close}>Load scenario <ArrowRight/></button></div></article></div>}
    <footer><a href="/docs" target="_blank"><Braces/> Open API documentation</a><span>Public-data connectors are clearly labelled</span></footer></section></div>
}

function Workspace({home}:{home:()=>void}) {
  const [collapsed,setCollapsed]=useState(false), [modal,setModal]=useState<Modal>('onboarding'), [swipe,setSwipe]=useState(51), [selecting,setSelecting]=useState(false), [loading,setLoading]=useState(false), [result,setResult]=useState<Result>(fallbackResult)
  const run=async()=>{setLoading(true);await new Promise(r=>setTimeout(r,650));try{const r=await fetch('/api/demo/analysis');if(r.ok)setResult(await r.json())}catch{}finally{setLoading(false)}}
  const load=()=>{setModal('none');run()}
  return <main className="workspace"><Sidebar collapsed={collapsed} setCollapsed={setCollapsed} setImagery={()=>setModal('imagery')}/><ScenePanel openImagery={()=>setModal('imagery')}/><div className="workspace-main"><div className="workspace-mobile"><button onClick={()=>setCollapsed(!collapsed)}><Menu/></button><Brand/><button onClick={()=>setModal('imagery')}><Plus/></button></div><MapViewer swipe={swipe} setSwipe={setSwipe} mask={result.maskPng} selecting={selecting} setSelecting={setSelecting}/></div><AnswerPanel result={result} loading={loading} run={run}/>{modal==='onboarding'&&<Onboarding close={()=>setModal('none')} load={load}/>} {modal==='imagery'&&<ImageryModal close={()=>setModal('none')}/>}<button className="home-return" onClick={home} title="Back to landing"><ChevronLeft/></button></main>
}

export default function App(){const [view,setView]=useState<View>('landing');useEffect(()=>{window.scrollTo(0,0)},[view]);return view==='landing'?<LandingExperience enter={()=>setView('workspace')}/>:<AnalysisWorkspace home={()=>setView('landing')}/>}
