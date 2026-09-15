import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, Blend, Bot, Box, Brush, Check, ChevronDown,
  Clock3, Cloud, Crosshair, Database, Eraser, Eye, FileText, HelpCircle, History,
  Image as ImageIcon, Layers, LayoutDashboard, LocateFixed, Map, MapPin, Moon,
  MoreHorizontal, PanelLeft, Plus, Radar, RefreshCw, Search, Send, Settings,
  SlidersHorizontal, Sparkles, SquareDashedMousePointer, Sun, Upload, User,
  WandSparkles, Zap, TrendingUp, AlertTriangle, Wifi,
} from 'lucide-react'
import './analysis-workspace.css'
import './premium.css'

// ─── types ────────────────────────────────────────────────────────────────────
type Section  = 'dashboard' | 'copilot' | 'change' | 'fusion' | 'geo' | 'reports' | 'settings'
type Theme    = 'dark' | 'light'
type Asset    = { id: string; name: string; meta: string; kind: 'optical' | 'sar' | 'raster' }
type Pin      = { x: number; y: number } | null
type Msg      = { q: string; a: string; zone: string; ndwi?: string; ndvi?: string; confidence: string; trace: { label: string; detail: string; status: 'ok'|'pending' }[] }
type DemoData = { beforeWaterHa:number; afterWaterHa:number; expandedAreaHa:number; changePercent:number; threshold:number; crs:string; answer:string; summary:string; maskPng?:string; trace:{label:string;detail:string}[] }

const API = 'http://127.0.0.1:8000'

// ─── constants ────────────────────────────────────────────────────────────────
const assets: Asset[] = [
  { id:'before', name:'Supaul · before', meta:'12 Aug 2023 · Sentinel-2 L2A', kind:'optical' },
  { id:'after',  name:'Supaul · after',  meta:'28 Aug 2023 · Sentinel-2 L2A', kind:'optical' },
  { id:'sar',    name:'Supaul · radar',  meta:'16 Aug 2023 · Sentinel-1 GRD',  kind:'sar'     },
]
const navItems = [
  ['dashboard','Dashboard',           'Overview & recent work',    LayoutDashboard],
  ['copilot',  'SatQuery Copilot',    'Click image · ask anything',Bot           ],
  ['change',   'Change Intelligence', 'Compare dates',             Activity       ],
  ['fusion',   'Multimodal Fusion',   'Optical + SAR',             Blend          ],
  ['geo',      'Geo Intelligence',    'Measure & inspect',         Map            ],
  ['reports',  'Intelligence Reports','Review & export',           FileText       ],
] as const
const titles: Record<Section,[string,string]> = {
  dashboard:['Mission overview',     'Your imagery, analyses and evidence in one place'   ],
  copilot:  ['SatQuery Copilot',     'Click anywhere on the image, then ask your question'],
  change:   ['Change Intelligence',  'Drag the split-line — see exactly what changed'     ],
  fusion:   ['Multimodal Fusion',    'Optical + SAR cross-sensor analysis'                ],
  geo:      ['Geo Intelligence',     'Inspect geospatial data and run deterministic measurements'],
  reports:  ['Intelligence Reports', 'Turn completed analyses into reviewable briefs'     ],
  settings: ['Settings',             'Appearance, map defaults and workspace preferences' ],
}



// ─── tiny shared components ───────────────────────────────────────────────────
function Mark() {
  return (
    <svg className="sq-mark" viewBox="0 0 60 58" aria-hidden="true">
      <path fill="#f89a38" d="M5 26C10 4 37 20 53 4C53 25 23 13 5 26Z"/>
      <path fill="currentColor" d="M4 39C12 16 40 33 54 17C53 38 22 26 4 39Z"/>
      <path fill="#35b98b" d="M3 52C13 29 40 45 53 31C51 52 22 39 3 52Z"/>
    </svg>
  )
}
function Status({tone='ready',children}:{tone?:'ready'|'working'|'draft';children:React.ReactNode}){
  return <span className={`status-badge ${tone}`}><i/>{children}</span>
}

// ─── AppRail ──────────────────────────────────────────────────────────────────
function AppRail({current,setCurrent,home}:{current:Section;setCurrent:(s:Section)=>void;home:()=>void}){
  return (
    <aside className="app-rail">
      <button className="rail-brand" onClick={home}><Mark/><span><b>SatQuery</b> AI</span></button>
      <nav>
        {navItems.map(([id,label,hint,Icon])=>(
          <button key={id} className={current===id?'active':''} onClick={()=>setCurrent(id)} title={label}>
            <Icon/><span><b>{label}</b><small>{hint}</small></span>
          </button>
        ))}
      </nav>
      <div className="rail-foot">
        <button className={current==='settings'?'active':''} onClick={()=>setCurrent('settings')}>
          <Settings/><span><b>Settings</b><small>Preferences & layers</small></span>
        </button>
        <button className="profile-row">
          <span className="avatar">DK</span>
          <span><b>Devansh Kumar</b><small>Prototype workspace</small></span>
          <MoreHorizontal/>
        </button>
      </div>
    </aside>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({open}:{open:(s:Section)=>void}){
  return (
    <div className="dashboard page-scroll">
      <section className="welcome-strip">
        <div>
          <span className="eyebrow"><Sparkles/> EARTH OBSERVATION WORKSPACE</span>
          <h2>Good evening, Devansh.</h2>
          <p>Continue a prepared investigation or start with imagery from your computer.</p>
        </div>
        <button className="primary" onClick={()=>open('copilot')}><Plus/> New investigation</button>
      </section>
      <section className="metric-grid">
        {([[Database,'Saved assets','08','3 optical · 2 radar · 3 rasters'],[Activity,'Analysis runs','04','1 prepared demo · 3 local drafts'],[MapPin,'Saved areas','03','Supaul · Dhemaji · Bhopal'],[FileText,'Reports','02','Both ready for review']] as const).map(([Icon,label,value,note])=>(
          <article key={label as string} className="metric-card">
            <span><Icon/>{label as string}</span>
            <strong>{value as string}</strong>
            <small>{note as string}</small>
          </article>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="surface recent-work">
          <div className="section-head"><div><span className="eyebrow">RECENT WORK</span><h3>Investigations</h3></div><button>View all <ArrowRight/></button></div>
          <button className="project-row" onClick={()=>open('change')}><span className="project-thumb before"/><span><b>Flood assessment · Supaul</b><small>Change Intelligence · 2 optical scenes</small></span><Status>Prepared</Status><span className="row-time">12 min ago</span><ArrowRight/></button>
          <button className="project-row" onClick={()=>open('fusion')}><span className="project-icon"><Radar/></span><span><b>Monsoon evidence cross-check</b><small>Multimodal Fusion · Optical + SAR</small></span><Status tone="draft">Draft</Status><span className="row-time">Yesterday</span><ArrowRight/></button>
          <button className="project-row" onClick={()=>open('geo')}><span className="project-icon"><Map/></span><span><b>Dhemaji raster inspection</b><small>Geo Intelligence · GeoTIFF</small></span><Status>Complete</Status><span className="row-time">04 Sep</span><ArrowRight/></button>
        </section>
        <section className="surface activity-panel">
          <div className="section-head"><div><span className="eyebrow">ACTIVITY</span><h3>Current status</h3></div><button><RefreshCw/></button></div>
          <div className="run-item"><span className="run-icon working"><Activity/></span><div><b>Supaul scene alignment</b><small>Prepared inputs validated</small><div className="progress"><i style={{width:'78%'}}/></div></div><Status tone="working">Processing</Status></div>
          <div className="run-item"><span className="run-icon"><Check/></span><div><b>GeoTIFF area calculation</b><small>Deterministic result stored</small></div><Status>Complete</Status></div>
          <div className="activity-note"><Cloud/><span><b>Local prototype session</b><small>Files remain in this browser session.</small></span></div>
        </section>
      </div>
      <section className="tool-section">
        <div className="section-head"><div><span className="eyebrow">QUICK START</span><h3>Choose the job, not the technology</h3></div></div>
        <div className="tool-grid">
          {navItems.slice(1,5).map(([id,label,hint,Icon],i)=>(
            <button key={id} onClick={()=>open(id)}>
              <span className="tool-number">0{i+1}</span>
              <Icon/><b>{label}</b>
              <small>{hint}. Open the purpose-built workspace.</small>
              <ArrowRight/>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── UploadTile / AssetLibrary ─────────────────────────────────────────────── 
function UploadTile({label,onFile}:{label:string;onFile:(f:File)=>void}){
  return (
    <label className="upload-tile">
      <Upload/><span><b>{label}</b><small>PNG, JPG or GeoTIFF · up to 500 MB</small></span>
      <input type="file" accept="image/*,.tif,.tiff" onChange={e=>e.target.files?.[0]&&onFile(e.target.files[0])}/>
    </label>
  )
}
function AssetLibrary({mode,onFile,active,setActive}:{mode:Section;onFile:(f:File)=>void;active:string;setActive:(s:string)=>void}){
  const list = mode==='fusion'?assets:mode==='change'?assets.slice(0,2):assets.slice(1,2)
  return (
    <aside className="asset-panel">
      <div className="panel-title"><div><span className="eyebrow">INPUTS</span><h3>{mode==='change'?'Scene pair':mode==='fusion'?'Sensor inputs':mode==='geo'?'Raster assets':'Imagery'}</h3></div><button><Search/></button></div>
      <div className="source-switch"><button className="active"><History/> Recent</button><button><Cloud/> Catalogue</button></div>
      <UploadTile label={mode==='change'?'Add comparison image':mode==='fusion'?'Add sensor image':mode==='geo'?'Add geospatial raster':'Add your image'} onFile={onFile}/>
      <div className="asset-list-label"><span>Prepared demo assets</span><small>Illustrative</small></div>
      <div className="asset-list">
        {list.map((a,i)=>(
          <button key={a.id} className={active===a.id?'selected':''} onClick={()=>setActive(a.id)}>
            <span className={`asset-thumb ${a.id}`}/>
            <span><b>{mode==='change'?(i?'After scene':'Before scene'):a.name}</b><small>{a.meta}</small><em>{a.kind}</em></span>
            {active===a.id&&<Check/>}
          </button>
        ))}
      </div>
      <p className="prepared-note"><HelpCircle/> Prepared assets demonstrate interaction only.</p>
    </aside>
  )
}

// ─── CopilotPin ───────────────────────────────────────────────────────────────
function CopilotPin({x,y,zone}:{x:number;y:number;zone?:string}){
  return (
    <div className="copilot-pin" style={{left:`${x}%`,top:`${y}%`}}>
      <div className="pin-ring r1"/>
      <div className="pin-ring r2"/>
      <div className="pin-core"><Crosshair/></div>
      <div className="pin-label">{zone||`${x.toFixed(1)}%, ${y.toFixed(1)}%`}</div>
    </div>
  )
}

// ─── Change overlay — SVG showing newly flooded areas ──────────────────────── 
function ChangeOverlay({visible}:{visible:boolean}){
  if(!visible) return null
  return (
    <svg className="change-overlay" viewBox="0 0 1000 800" preserveAspectRatio="none">
      {/* Newly flooded — red/orange */}
      <path className="co-new"   d="M290 320 L380 280 L490 260 L530 310 L560 380 L510 450 L460 480 L370 460 L300 400 Z"/>
      <path className="co-new"   d="M550 380 L640 350 L700 370 L720 440 L680 500 L610 520 L560 480 Z"/>
      {/* Permanent water — blue */}
      <path className="co-water" d="M420 250 L510 210 L590 240 L630 320 L600 405 L660 470 L610 550 L510 565 L450 500 L390 425 Z"/>
      {/* Recovery — green */}
      <path className="co-rec"   d="M180 500 L270 480 L310 540 L290 600 L200 610 L160 560 Z"/>
    </svg>
  )
}

// ─── ImageCanvas ─────────────────────────────────────────────────────────────
function ImageCanvas({mode,url,maskTool,onPin,pin,sarVisible,setSarVisible,demoData,changeTriggered,lastMsg}:{
  mode:Section;url?:string;maskTool:string;
  onPin?:(x:number,y:number)=>void;pin:Pin;
  sarVisible:boolean;setSarVisible:(v:boolean)=>void;
  demoData:DemoData|null;
  changeTriggered:boolean;
  lastMsg:Msg|null;
}){
  const [zoom,setZoom]     = useState(1)
  const [split,setSplit]   = useState(50)
  const [compare,setCompare] = useState(mode==='change')
  const [showMask,setShowMask] = useState(mode!=='change')
  const style = url?({'--canvas-image':`url("${url}")`} as CSSProperties):undefined
  const showChangeBadge = mode==='change' && compare && split < 52
  const showChangeOverlay = mode==='change' && compare && split < 70

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if(mode!=='copilot' || maskTool!=='point') return
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onPin?.(
      Math.round((e.clientX-r.left)/r.width*1000)/10,
      Math.round((e.clientY-r.top)/r.height*1000)/10,
    )
  }

  return (
    <section
      className={`image-canvas${mode==='copilot'&&maskTool==='point'?' canvas-crosshair':''}`}
      style={style}
      onClick={handleClick}
    >
      {/* topbar */}
      <div className="canvas-topbar">
        <div><MapPin/><span><b>Supaul, Bihar</b><small>26.1267° N · 86.6050° E</small></span></div>
        <div className="canvas-controls">
          <button title="Search"><Search/></button>
          <button title="Layers"><Layers/> Layers</button>
          <button title="Locate"><LocateFixed/></button>
        </div>
      </div>

      {/* image layers */}
      <div className="canvas-image base"/>
      {mode==='change'&&compare&&<div className="canvas-image after" style={{clipPath:`inset(0 0 0 ${split}%)`}}/>}
      {mode==='fusion'&&sarVisible&&<div className="sar-overlay"/>}

      {/* change overlay (newly flooded polygons) */}
      {mode==='change'&&<ChangeOverlay visible={showChangeOverlay}/>}

      {/* copilot region selection */}
      {(mode==='copilot'||mode==='geo')&&showMask&&(
        <svg className="selection-mask" viewBox="0 0 1000 800" preserveAspectRatio="none">
          <path d="M430 260L500 215 580 245 620 325 600 405 665 472 612 548 515 565 450 505 392 428 405 338Z"/>
        </svg>
      )}

      {/* copilot pin */}
      {mode==='copilot'&&pin&&<CopilotPin x={pin.x} y={pin.y} zone={lastMsg?.zone}/>}

      {/* compare drag handle */}
      {mode==='change'&&compare&&(
        <div className="compare-line" style={{left:`${split}%`}}>
          <button onPointerDown={e=>{
            const root=e.currentTarget.closest('.image-canvas') as HTMLElement
            const mv=(x:PointerEvent)=>{const b=root.getBoundingClientRect();setSplit(Math.max(5,Math.min(95,(x.clientX-b.left)/b.width*100)))}
            const up=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up)}
            window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up)
          }}><ArrowLeft/><ArrowRight/></button>
        </div>
      )}

      {/* scene labels */}
      <div className="scene-labels">
        <span>{mode==='change'?'12 Aug 2023 · Before':url?'Uploaded image':'Prepared optical scene'}</span>
        {mode==='change'&&<span>28 Aug 2023 · After</span>}
      </div>

      {/* toolbox */}
      <div className="canvas-toolbox">
        {(mode==='copilot'||mode==='geo')&&<>
          <button className={maskTool==='point'?'active':''} title="Point query"><MapPin/></button>
          <button className={maskTool==='box'?'active':''} title="Box select"><Box/></button>
          <button className={maskTool==='brush'?'active':''} title="Brush"><Brush/></button>
          <button title="Erase"><Eraser/></button>
        </>}
        {mode==='change'&&<>
          <button className={compare?'active':''} onClick={()=>setCompare(true)} title="Split view"><PanelLeft/></button>
          <button onClick={()=>setCompare(false)} title="After only"><Eye/></button>
        </>}
        {mode==='fusion'&&(
          <button className={sarVisible?'active':''} onClick={()=>setSarVisible(!sarVisible)} title="Toggle SAR overlay"><Radar/></button>
        )}
        <span/>
        <button onClick={()=>setZoom(v=>Math.min(2.5,v+.25))} title="Zoom in"><Plus/></button>
        <button onClick={()=>setZoom(v=>Math.max(1,v-.25))} title="Zoom out">−</button>
      </div>

      {/* foot */}
      <div className="canvas-foot">
        <span><b>N</b> ↑</span>
        <span>Prepared imagery · {zoom.toFixed(2)}×</span>
        <span>10 m / px</span>
      </div>

      {/* copilot selection tag */}
      {mode==='copilot'&&(
        <div className="selection-tag">
          <SquareDashedMousePointer/>
          <span><b>{pin?`Zone: ${lastMsg?.zone||'Analysed'}`:'Selected river corridor'}</b><small>{pin?`Click point · ${pin.x.toFixed(1)}%, ${pin.y.toFixed(1)}%`:'27.1 km² · user-defined'}</small></span>
          <button onClick={()=>setShowMask(v=>!v)}>{showMask?'Hide':'Show'}</button>
        </div>
      )}

      {/* fusion legend */}
      {mode==='fusion'&&(
        <div className="fusion-legend">
          <span><i className="optical-dot"/> Optical surface detail</span>
          {sarVisible&&<span><i className="sar-dot"/> SAR backscatter overlay</span>}
          <small>Dual-sensor illustrative blend</small>
        </div>
      )}

      {/* change-detected badge */}
      {showChangeBadge&&(
        <div className="change-detected-badge">
          <span className="cbd-dot"/>
          <div>
            <b>Change detected</b>
            <small>{demoData?`+${demoData.expandedAreaHa.toFixed(1)} ha · ${demoData.changePercent.toFixed(0)}% water expansion`:'Water extent increased — drag to inspect'}</small>
          </div>
          {demoData&&<div className="cbd-stat"><strong>+{demoData.changePercent.toFixed(0)}%</strong><small>change</small></div>}
        </div>
      )}

      {/* copilot click hint */}
      {mode==='copilot'&&!pin&&maskTool==='point'&&(
        <div className="click-hint">
          <Crosshair/> Click anywhere on the image to drop a query point
        </div>
      )}
    </section>
  )
}

// ─── EvidencePanel ────────────────────────────────────────────────────────────
function EvidencePanel({mode,pin,demoData,demoLoading,onPinClear,lastMsg,setLastMsg}:{
  mode:Section;pin:Pin;demoData:DemoData|null;demoLoading:boolean;
  onPinClear:()=>void;
  lastMsg:Msg|null;setLastMsg:(m:Msg|null)=>void;
}){
  const [q,setQ]         = useState('')
  const [busy,setBusy]   = useState(false)
  const [traceOpen,setTraceOpen] = useState(true)
  const scrollRef        = useRef<HTMLDivElement>(null)

  useEffect(()=>{scrollRef.current?.scrollTo({top:scrollRef.current.scrollHeight,behavior:'smooth'})},[lastMsg,busy])

  const submit = async () => {
    const query = q.trim()
    if(!query||busy) return
    setQ('')
    setBusy(true)
    
    try {
      const res = await fetch(`${API}/api/agent/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode, context: { pin, demoData } })
      })
      if (!res.ok) throw new Error("Request failed")
      const msg: Msg = await res.json()
      setLastMsg(msg)
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  // Quick prompt chips
  const chips:Record<string,string[]> = {
    copilot:['What is this area?','Is there surface water here?','Describe the land cover'],
    change: ['What changed between the two dates?','How much did water expand?','Where is the new flooding?'],
    fusion: ['Do optical and SAR agree?','What does the SAR reveal differently?','Identify water-covered regions'],
    geo:    ['What can be measured here?','What is the CRS of this raster?'],
  }

  // Change mode stat bar
  const showStats = (mode==='change'||mode==='fusion') && demoData

  return (
    <aside className="evidence-panel">
      {/* brand bar */}
      <div className="evidence-brand">
        <Mark/>
        <span><b>SatQuery</b><small>Evidence workspace</small></span>
        <Status tone={demoLoading?'working':demoData?'ready':'draft'}>
          {demoLoading?'Loading…':demoData?'Live data':'Prepared'}
        </Status>
      </div>

      {/* change timeline */}
      {mode==='change'&&(
        <div className="change-timeline">
          <div className="tl-dot active-dot"/><b>12 Aug 2023</b><small>Before · Sentinel-2</small>
          <div className="tl-line"/>
          <div className="tl-dot after-tdot"/><b>28 Aug 2023</b><small>After · Sentinel-2</small>
        </div>
      )}

      {/* fusion sensor cards */}
      {mode==='fusion'&&(
        <div className="fusion-sensor-row">
          <div className="sensor-card optical-card"><Layers/><span><b>Optical</b><small>Sentinel-2 · 10 m</small></span><span className="sc-badge opt-badge">Surface</span></div>
          <div className="sc-plus">⊕</div>
          <div className="sensor-card sar-card"><Radar/><span><b>SAR</b><small>Sentinel-1 · 10 m</small></span><span className="sc-badge sar-badge">Backscatter</span></div>
        </div>
      )}

      {/* live stats bar */}
      {showStats&&(
        <div className="stats-bar">
          <div className="stat-item"><small>Before</small><strong>{demoData!.beforeWaterHa.toFixed(1)}</strong><small>ha water</small></div>
          <div className="stat-arrow"><ArrowRight/></div>
          <div className="stat-item after"><small>After</small><strong>{demoData!.afterWaterHa.toFixed(1)}</strong><small>ha water</small></div>
          <div className="stat-delta"><TrendingUp/><span>+{demoData!.expandedAreaHa.toFixed(1)} ha<small>+{demoData!.changePercent.toFixed(0)}%</small></span></div>
        </div>
      )}

      {/* scrollable body */}
      <div className="evidence-scroll" ref={scrollRef}>
        <span className="eyebrow">YOUR QUESTION</span>

        {lastMsg?(
          <>
            <h3>{lastMsg.q}</h3>
            {/* zone badge */}
            <div className="zone-badge"><MapPin/> {lastMsg.zone}</div>
            {/* spectral indices */}
            {(lastMsg.ndwi||lastMsg.ndvi)&&(
              <div className="spectral-row">
                {lastMsg.ndwi&&<span className="si-chip ndwi"><b>NDWI</b> {lastMsg.ndwi}</span>}
                {lastMsg.ndvi&&<span className="si-chip ndvi"><b>NDVI</b> {lastMsg.ndvi}</span>}
                <span className="si-chip conf"><b>Confidence</b> {lastMsg.confidence}</span>
              </div>
            )}
            <div className="answer-block">
              <span className="answer-label"><WandSparkles/> SATQUERY ANALYSIS</span>
              <p style={{whiteSpace:'pre-line'}}>{lastMsg.a}</p>
            </div>
            <div className="confidence-row">
              <span className="conf-chip high">● {lastMsg.confidence} confidence</span>
              <span className="conf-chip">Remote-sensing adapted</span>
              {mode==='change'&&<span className="conf-chip">Bi-temporal NDWI</span>}
              {mode==='fusion'&&<span className="conf-chip">Cross-modal</span>}
            </div>
          </>
        ):(
          <>
            <h3>
              {mode==='copilot'? (pin?`Point selected at ${pin.x.toFixed(1)}%, ${pin.y.toFixed(1)}%`:'Click the image to select a point') :
               mode==='change' ? 'What changed between these two dates?' :
               mode==='fusion' ? 'Use optical and SAR to identify surface conditions' :
               'Ask about this evidence'}
            </h3>
            <div className="answer-block">
              <span className="answer-label"><WandSparkles/> PREPARED DEMONSTRATION</span>
              <p>
                {mode==='copilot'   ? (pin?'Point registered. Ask your question below to get a zone-specific analysis.':'Click anywhere on the satellite image above, then type your question.') :
                 mode==='change'    ? (demoData?`Drag the slider to compare scenes. ${demoData.summary}`:  'Drag the split handle on the image to compare the two observations.') :
                 mode==='fusion'    ? 'Optical imagery and SAR are both loaded. Ask a question to run cross-modal analysis.'  :
                 'Upload a GeoTIFF to inspect its bands, CRS and calculate area statistics.'}
              </p>
              {demoData&&(mode==='change'||mode==='fusion')&&(
                <div><strong>{demoData.expandedAreaHa.toFixed(1)}</strong><small>ha newly flooded</small></div>
              )}
            </div>
          </>
        )}

        {/* quick chips */}
        {!lastMsg&&(chips[mode]??[]).length>0&&(
          <div className="quick-chips">
            <small>Try asking:</small>
            <div>{(chips[mode]??[]).map(c=><button key={c} className="quick-chip" onClick={()=>setQ(c)}>{c}</button>)}</div>
          </div>
        )}

        <div className="evidence-chips">
          <button><Layers/> Selected region</button>
          <button><ImageIcon/> Source imagery</button>
          {lastMsg&&<button onClick={()=>{setLastMsg(null);onPinClear()}}><Eraser/> Clear</button>}
        </div>

        {/* trace */}
        <button className="trace-head" onClick={()=>setTraceOpen(v=>!v)}>
          <span><Activity/> Analysis trace</span>
          <span>{lastMsg?`${lastMsg.trace.filter(t=>t.status==='ok').length}/${lastMsg.trace.length}`:'3 / 4'} <ChevronDown className={traceOpen?'':'closed'}/></span>
        </button>
        {traceOpen&&(
          <div className="trace-list">
            {(lastMsg?.trace??[
              {label:'Input accepted',  detail:'Metadata attached to this run',      status:'ok' as const},
              {label:'Region grounded', detail:'User selection preserved',           status:'ok' as const},
              {label:'Evidence prepared',detail:'Prototype narrative only',          status:'ok' as const},
              {label:'Model inference', detail:'Not connected in this build',        status:'pending' as const},
            ]).map(({label,detail,status})=>(
              <p key={label} className={status==='pending'?'pending':''}>
                {status==='ok'?<Check/>:<Clock3/>}
                <span><b>{label}</b><small>{detail}</small></span>
              </p>
            ))}
          </div>
        )}

        {busy&&(
          <div className="evidence-loading">
            <span className="loading-orb"/>
            <span>Analysing {mode==='copilot'?'selected point…':mode==='change'?'scene pair…':mode==='fusion'?'sensor data…':'…'}</span>
          </div>
        )}
      </div>

      {/* composer */}
      <div className="composer">
        <div>
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder={
              mode==='copilot'?(pin?'Ask about this point…':'Click the image first, then ask…'):
              mode==='change'?'Ask about these two scenes…':
              mode==='fusion'?'Ask about optical and SAR…':'Ask about this evidence'
            }
            disabled={busy}
          />
          <button onClick={submit} disabled={busy||!q.trim()} className={q.trim()&&!busy?'send-active':''}>
            <Send/>
          </button>
        </div>
        <small>
          {mode==='copilot'&&!pin?'← Click the image to select a point first':'Grounded in Supaul, Bihar · August 2023 flood event.'}
        </small>
      </div>
    </aside>
  )
}

// ─── Workbench ────────────────────────────────────────────────────────────────
function Workbench({mode}:{mode:Section}){
  const [active,setActive]         = useState(mode==='change'?'after':mode==='fusion'?'sar':'after')
  const [url,setUrl]               = useState<string>()
  const [tool,setTool]             = useState('point') // default to point for copilot
  const [pin,setPin]               = useState<Pin>(null)
  const [lastMsg,setLastMsg]       = useState<Msg|null>(null)
  const [sarVisible,setSarVisible] = useState(true)
  const [demoData,setDemoData]     = useState<DemoData|null>(null)
  const [demoLoading,setDemoLoading] = useState(false)
  const [changeTriggered,setChangeTriggered] = useState(false)

  useEffect(()=>{
    if(mode!=='change'&&mode!=='fusion') return
    setDemoLoading(true)
    fetch(`${API}/api/demo/analysis`)
      .then(r=>r.ok?r.json():null)
      .then(d=>{setDemoData(d);setDemoLoading(false)})
      .catch(()=>setDemoLoading(false))
  },[mode])

  useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url])
  const onFile=(f:File)=>setUrl(old=>{if(old)URL.revokeObjectURL(old);setActive('upload');return URL.createObjectURL(f)})

  const handlePin=(x:number,y:number)=>{
    setPin({x,y})
    setLastMsg(null) // clear previous answer when new point selected
  }

  return (
    <div className="workbench">
      <AssetLibrary mode={mode} onFile={onFile} active={active} setActive={setActive}/>
      <div className="canvas-column">
        <div className="mode-toolbar">
          <div><span className="eyebrow">ACTIVE WORKFLOW</span><b>{titles[mode][0]}</b></div>
          {(mode==='copilot'||mode==='geo')&&(
            <div className="mask-tools">
              <span>Selection</span>
              {([['point',MapPin],['box',Box],['brush',Brush]] as const).map(([id,Icon])=>(
                <button key={id} onClick={()=>setTool(id)} className={tool===id?'active':''}><Icon/><span>{id}</span></button>
              ))}
            </div>
          )}
          <button className="quiet"><SlidersHorizontal/> View</button>
        </div>
        <ImageCanvas
          mode={mode} url={url} maskTool={tool}
          onPin={handlePin} pin={pin}
          sarVisible={sarVisible} setSarVisible={setSarVisible}
          demoData={demoData}
          changeTriggered={changeTriggered}
          lastMsg={lastMsg}
        />
      </div>
      <EvidencePanel
        mode={mode} pin={pin} demoData={demoData} demoLoading={demoLoading}
        onPinClear={()=>setPin(null)}
        lastMsg={lastMsg} setLastMsg={setLastMsg}
      />
    </div>
  )
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function Reports({open}:{open:(s:Section)=>void}){
  return (
    <div className="reports page-scroll">
      <div className="reports-toolbar">
        <div className="segmented"><button className="active">All reports</button><button>Ready</button><button>Drafts</button></div>
        <button className="primary"><Plus/> Create report</button>
      </div>
      <section className="surface report-table">
        <div className="table-head"><span>Report</span><span>Workflow</span><span>Status</span><span>Updated</span><span/></div>
        {[['Supaul flood evidence brief','Change Intelligence','Ready','12 min ago','change'],['Monsoon sensor cross-check','Multimodal Fusion','Draft','Yesterday','fusion'],['Dhemaji raster inspection','Geo Intelligence','Ready','04 Sep','geo']].map(([name,flow,status,time,target])=>(
          <button key={name} onClick={()=>open(target as Section)}>
            <span><FileText/><span><b>{name}</b><small>Prepared prototype document</small></span></span>
            <span>{flow}</span>
            <Status tone={status==='Draft'?'draft':'ready'}>{status}</Status>
            <span>{time}</span><ArrowRight/>
          </button>
        ))}
      </section>
    </div>
  )
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────
function SettingsPage({theme,setTheme}:{theme:Theme;setTheme:(t:Theme)=>void}){
  const [labels,setLabels]=useState(true),[roads,setRoads]=useState(false),[save,setSave]=useState(true)
  return (
    <div className="settings-page page-scroll">
      <section className="settings-section"><span className="eyebrow">APPEARANCE</span><h3>Interface theme</h3><p>Choose the workspace appearance. Your preference is saved locally.</p>
        <div className="theme-grid">{([['dark',Moon,'Dark','Low-glare imagery review'],['light',Sun,'Light','Bright office environments']] as const).map(([id,Icon,name,note])=>(
          <button key={id} className={theme===id?'selected':''} onClick={()=>setTheme(id)}>
            <span className={`theme-preview ${id}`}><i/><i/><i/></span>
            <span><Icon/><b>{name}</b><small>{note}</small></span>
            {theme===id&&<Check/>}
          </button>
        ))}</div>
      </section>
      <section className="settings-section"><span className="eyebrow">MAP DEFAULTS</span><h3>Workspace layers</h3><p>Set which contextual layers appear when a georeferenced asset is opened.</p>
        <label className="setting-row"><span><Map/><span><b>Place labels</b><small>Districts, towns and geographic names</small></span></span><input type="checkbox" checked={labels} onChange={e=>setLabels(e.target.checked)}/></label>
        <label className="setting-row"><span><Layers/><span><b>Roads and settlements</b><small>Additional reference context</small></span></span><input type="checkbox" checked={roads} onChange={e=>setRoads(e.target.checked)}/></label>
      </section>
      <section className="settings-section"><span className="eyebrow">SESSION</span><h3>Local workspace</h3>
        <label className="setting-row"><span><Cloud/><span><b>Auto-save drafts</b><small>Keep prototype state in this browser</small></span></span><input type="checkbox" checked={save} onChange={e=>setSave(e.target.checked)}/></label>
      </section>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AnalysisWorkspace({home}:{home:()=>void}){
  const [section,setSection] = useState<Section>('dashboard')
  const [theme,setTheme]     = useState<Theme>(()=>(localStorage.getItem('satquery-theme') as Theme)||'dark')
  useEffect(()=>localStorage.setItem('satquery-theme',theme),[theme])
  const [title,subtitle]     = titles[section]
  const content = useMemo(()=>
    section==='dashboard'?<Dashboard open={setSection}/>:
    section==='reports'  ?<Reports   open={setSection}/>:
    section==='settings' ?<SettingsPage theme={theme} setTheme={setTheme}/>:
    <Workbench key={section} mode={section}/>
  ,[section,theme])
  return (
    <main className="product-shell" data-theme={theme}>
      <AppRail current={section} setCurrent={setSection} home={home}/>
      <header className="product-header">
        <div><h1>{title}</h1><p>{subtitle}</p></div>
        <div className="header-actions">
          <button><Search/></button><button><Zap/></button>
          <span className="session"><Cloud/> Local session</span>
          <button className="user-button"><User/><ChevronDown/></button>
        </div>
      </header>
      <div className="product-content">{content}</div>
    </main>
  )
}
