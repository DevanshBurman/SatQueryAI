import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Bot, Check, ChevronDown, Download, Layers3, LoaderCircle, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles, Upload, X } from 'lucide-react'
import { analyzeWaterChange, type CatalogScene } from './api'
import { supabase } from './supabase'
import './analysis-studio.css'
import StudioWelcome from './StudioWelcome'
import { createEvidenceReport } from './evidenceReport'

type Evidence = { id: string; label: string; date: string; modality: 'optical' | 'sar'; image: string; source: string; crs?: string | null; bounds?: number[]; file?: File; processing?: string }
type Answer = { answer: string; task: string; mode: string; trace: unknown[]; limitations?: string[]; maskPng?: string; maskSourceId?: string; query?: string; elapsedSeconds?: number; sources?: unknown[]; evidenceImages?: {label:string;date?:string;image:string}[] }
type Plan = { task: string; steps: { tool: string; detail: string }[] }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {signal:AbortSignal.timeout(90000),...init})
  const text = await response.text()
  let payload
  try { payload = JSON.parse(text) } catch {
    throw new Error('The analysis service is unavailable. Start the backend and try again.')
  }
  if (!response.ok) throw new Error(typeof payload.detail === 'string' ? payload.detail : `Request failed (${response.status})`)
  return payload
}
function download(name: string, value: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([value], { type }))
  const link = document.createElement('a'); link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function metadata(item: Evidence) { const { file: _file, ...rest } = item; return rest }
const prompts = [
  {mode:'single' as const, tag:'1 optical image', text:'Describe the land cover and major visible features in this image.'},
  {mode:'single' as const, tag:'1 multispectral TIFF', text:'Highlight the water body in this image.'},
  {mode:'temporal' as const, tag:'2 optical dates', text:'What changed in water extent between these two dates?'},
  {mode:'fusion' as const, tag:'1 optical + 1 SAR', text:'Use the optical and SAR images together to describe water and built-up regions.'},
]

function ReadableAnswer({ text }: { text: string }) {
  return <div className="studio-answer-copy">{text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => {
    const heading = paragraph.match(/^(Evidence|Limitations|Summary|Answer|Observations|Conclusion):\s*/i)
    return <section key={index}>{heading && <h3>{heading[1]}</h3>}<p>{heading ? paragraph.slice(heading[0].length) : paragraph}</p></section>
  })}</div>
}

export default function AnalysisStudio({ scenes, discover, saveQuery }: { scenes: CatalogScene[]; discover: () => void; saveQuery: (query: string, task: string) => Promise<void> }) {
  const [assets, setAssets] = useState<Evidence[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [active, setActive] = useState('')
  const [query, setQuery] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<Plan>()
  const [elapsed, setElapsed] = useState(0)
  const [rendered, setRendered] = useState<{id:string;image:string;note:string}>()
  const [threshold, setThreshold] = useState(.15)
  const [green, setGreen] = useState(2), [nir, setNir] = useState(4)
  const [overlay, setOverlay] = useState(true)
  const [compare, setCompare] = useState(false)
  const [split, setSplit] = useState(50)
  const [tour, setTour] = useState(false)
  const [welcome, setWelcome] = useState(true)
  const [reading, setReading] = useState(false)
  useEffect(() => {
    if (!reading) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setReading(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [reading])
  const [inputsOpen, setInputsOpen] = useState(false)
  const inputsTray = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const conversation = useRef<HTMLDivElement>(null)
  const usedScenes = useRef(new Set<string>())
  const chosen = selected.map(id => assets.find(asset => asset.id === id)).filter((v): v is Evidence => !!v)
  const shown = assets.find(asset => asset.id === active) || chosen[0]
  const latest = answers.at(-1)
  useEffect(() => {
    if (!inputsOpen) return
    const close = (event: PointerEvent) => { if (!inputsTray.current?.contains(event.target as Node)) setInputsOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setInputsOpen(false); inputsTray.current?.querySelector<HTMLButtonElement>('.studio-input-toggle')?.focus() } }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape) }
  }, [inputsOpen])
  useEffect(() => {
    const container = conversation.current
    if (!container) return
    const target = error ? container.querySelector('.studio-error') : Array.from(container.querySelectorAll('.studio-answer')).at(-1)
    const top = target ? target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop : 0
    container.scrollTo({top,behavior:'instant'})
  }, [answers, error])

  useEffect(() => {
    if (!busy) return
    const start = Date.now(); setElapsed(0)
    const timer = setInterval(() => setElapsed(Math.floor((Date.now()-start)/1000)), 1000)
    return () => clearInterval(timer)
  }, [Boolean(busy)])
  useEffect(() => {
    const fresh = scenes.filter(scene => !usedScenes.current.has(scene.id))
    if (!fresh.length) return
    fresh.forEach(scene => usedScenes.current.add(scene.id))
    const downloadable = fresh.filter(scene => scene.sample_id)
    if (downloadable.length) {
      setBusy(`Downloading ${downloadable.length} source GeoTIFF${downloadable.length === 1 ? '' : 's'}`)
      request<Evidence[]>('/api/studio/samples').then(async all => {
        const items = await Promise.all(downloadable.map(async scene => {
          const item = all.find(value => value.id === scene.sample_id)
          if (!item) throw new Error('Source raster is unavailable')
          const response = await fetch(`/api/studio/sample-file?sample_id=${encodeURIComponent(item.id)}`)
          if (!response.ok) throw new Error('Source raster download failed')
          return {...item,file:new File([await response.blob()],`${item.id}.tif`,{type:'image/tiff'})}
        }))
        add(items)
      }).catch(e => setError((e as Error).message)).finally(() => setBusy(''))
    }
    // Catalog selections retain metadata; a thumbnail is never substituted for a raster.
    const entries: Evidence[] = fresh.filter(scene => !scene.sample_id).map(scene => ({ id: scene.id, label: scene.source, source: scene.id, date: scene.date, modality: scene.mode, image: scene.thumbnail || '', bounds: scene.bbox || undefined, processing: 'Catalog reference. Upload the matching GeoTIFF to analyse its pixels.' }))
    setAssets(previous => [...previous, ...entries])
    if (entries.length) setActive(entries[0].id)
  }, [scenes])

  function add(items: Evidence[]) {
    setAssets(previous => [...previous.filter(old => !items.some(item => old.id === item.id)), ...items])
    setSelected(items.map(item => item.id).slice(0, 2)); setActive(items[0].id); setAnswers([]); setPlan(undefined); setInputsOpen(false)
  }
  async function renderPreset(preset: string) {
    if (!shown?.file) return
    setBusy('Rendering spectral bands'); setError('')
    try {
      const body = new FormData(); body.append('file',shown.file); body.append('preset',preset)
      const result = await request<{image:string;note:string}>('/api/studio/render',{method:'POST',body})
      setRendered({id:shown.id,...result}); setCompare(false)
    } catch(e) {setError((e as Error).message)} finally {setBusy('')}
  }
  async function loadSamples() {
    setBusy('Loading prepared observation catalogue'); setError('')
    try {
      const items = await request<Evidence[]>('/api/studio/samples')
      if (!items.length) throw new Error('The Sentinel sample pack is not installed yet.')
      setBusy(`Downloading ${items.length} source GeoTIFF${items.length === 1 ? '' : 's'}`)
      const loaded = await Promise.all(items.map(async item => {
        const response = await fetch(`/api/studio/sample-file?sample_id=${encodeURIComponent(item.id)}`)
        if (!response.ok) throw new Error('Could not download the sample raster.')
        return { ...item, file: new File([await response.blob()], `${item.id}.tif`, { type: 'image/tiff' }) }
      }))
      add(loaded)
    } catch (e) { setError((e as Error).message) } finally { setBusy('') }
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy('Reading raster metadata and previews'); setError('')
    try {
      const items: Evidence[] = []
      for (const file of Array.from(files)) {
        if (/\.(png|jpe?g)$/i.test(file.name)) {
          if (file.size > 2_000_000) throw new Error('Use a PNG or JPEG smaller than 2 MB.')
          const image = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read this image.')); reader.readAsDataURL(file) })
          items.push({ id: crypto.randomUUID(), label: file.name, source: file.name, date: '', modality: 'optical', file, image, processing: 'Benchmark visual input · no georeferencing or spectral measurements.' })
          continue
        }
        const body = new FormData(); body.append('file', file)
        const inspected = await request<{ image: string; crs: string; bounds: number[]; note: string }>('/api/studio/inspect', { method: 'POST', body })
        items.push({ id: crypto.randomUUID(), label: file.name, source: file.name, date: '', modality: 'optical', file, ...inspected, processing: inspected.note })
      }
      add(items)
    } catch (e) { setError((e as Error).message) } finally { setBusy(''); if (fileInput.current) fileInput.current.value = '' }
  }
  function toggle(id: string) {
    setSelected(previous => previous.includes(id) ? previous.filter(v => v !== id) : [...previous, id].slice(-2))
    setActive(id); setPlan(undefined); setAnswers([])
  }
  function update(id: string, patch: Partial<Evidence>) {
    setAssets(previous => previous.map(item => item.id === id ? { ...item, ...patch } : item)); setPlan(undefined); setAnswers([])
  }
  function preset(mode: 'single' | 'temporal' | 'fusion') {
    const optical = assets.filter(item => item.file && item.modality === 'optical')
    const radar = assets.find(item => item.file && item.modality === 'sar')
    const items = mode === 'fusion' ? [optical[0],radar].filter((item): item is Evidence => !!item) : mode === 'temporal' ? optical.slice(0,2) : optical.slice(-1)
    if (!items.length) return
    setSelected(items.map(item => item.id)); setActive(items[0].id); setAnswers([]); setPlan(undefined); setCompare(false)
  }
  async function run() {
    setError(''); setPlan(undefined)
    if (!query.trim()) { setError('Ask a question first.'); return }
    if (!chosen.length || chosen.some(item => !item.file)) { setError('Upload an image or load the Sentinel sample. Catalog references need their matching imagery.'); return }
    const question = query.trim()
    const started = performance.now()
    setReading(true); setInputsOpen(false)
    setBusy('Validating inputs and choosing tools')
    try {
      let result: Answer
      const water = /water|flood|lake|river/i.test(question)
      const highlighting = /highlight|mask|segment|ground|outline/i.test(question)
      const temporal = /change|between|before|after|increased|decreased|compare/i.test(question)
      if (water && (highlighting || temporal) && chosen.some(item => /\.(png|jpe?g)$/i.test(item.file!.name))) throw new Error('Water masks and measurements need a multispectral GeoTIFF. You can ask visual questions about this benchmark image.')
      const body = { query: question, observations: chosen.map(item => {
        const source = metadata(item)
        return rendered?.id === item.id ? {...source,image:rendered.image,label:`${item.label} | ${rendered.note}`.slice(0,160)} : source
      }) }
      // A two-image water measurement follows the same server-side temporal gate.
      if (water && highlighting && chosen.length === 1 && chosen[0].modality === 'optical') {
        setPlan({ task: 'Water grounding', steps: [{tool:'raster-validation',detail:'Check selected green/NIR bands'}, {tool:'NDWI',detail:`Threshold ${threshold}; spectral water candidates`}, {tool:'evidence-report',detail:'Return a pixel-aligned mask and area'}] })
        setBusy('Computing the water mask from source pixels')
        const form = new FormData(); form.append('file', chosen[0].file!); form.append('green_band', String(green)); form.append('nir_band', String(nir)); form.append('threshold', String(threshold))
        result = await request<Answer>('/api/studio/water', { method:'POST', body:form })
      } else {
        const route = await request<Plan>('/api/studio/plan', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        setPlan(route)
        if (water && temporal && route.task === 'temporal' && chosen.every(item => item.modality === 'optical')) {
          setPlan({ task:'Temporal water change', steps:[{tool:'grid-validator',detail:'Check matching CRS, bounds, dimensions and valid pixels'},{tool:'NDWI change',detail:`Bands ${green}/${nir}; threshold ${threshold}`},{tool:'evidence-report',detail:'Return before/after measurements and expansion mask'}] })
          setBusy('Measuring change on the common raster grid')
          const response = await analyzeWaterChange(chosen[0].file!, chosen[1].file!, green, nir, threshold)
          result = {answer:`${response.summary}\nBefore: ${response.beforeWaterHa} ${response.areaUnit}\nAfter: ${response.afterWaterHa} ${response.areaUnit}\nNew water-index candidates: ${response.expandedAreaHa} ${response.areaUnit}`, task:'temporal-water',mode:response.mode,maskPng:response.maskPng,trace:response.trace,limitations:['Common valid pixels only. Cloud/shadow masking is not applied. Confirm reflectance scale and band mapping.']}
          setActive(chosen[1].id)
        } else {
          setBusy('SatQuery AI is examining the selected observations')
          const session = await supabase?.auth.getSession()
          const token = session?.data.session?.access_token
          result = await request<Answer>('/api/studio/answer', { method:'POST', headers:{'Content-Type':'application/json',...(token ? { Authorization:`Bearer ${token}` } : {})}, body:JSON.stringify(body) })
        }
      }
      result.elapsedSeconds = Math.round((performance.now()-started)/100)/10
      result.query = question; result.sources = chosen.map(item => ({...metadata(item), image:undefined})); result.evidenceImages = chosen.map(item => ({label:item.label,date:item.date,image:rendered?.id === item.id ? rendered.image : item.image})); result.maskSourceId = result.task === 'temporal-water' ? chosen[1]?.id : chosen[0]?.id
      if (rendered && chosen.some(item => item.id === rendered.id) && result.mode === 'Bedrock vision preview') result.trace.unshift({tool:'spectral-render',source:rendered.id,view:rendered.note,status:'complete'})
      setAnswers(previous => [...previous, result]); setOverlay(true); setQuery('')
      void saveQuery(question, result.task).catch(() => setError('Analysis completed, but query history could not be saved.'))
    } catch (e) { setError((e as Error).message) } finally { setBusy('') }
  }

  return <div className="analysis-studio">
    {welcome && <StudioWelcome close={() => setWelcome(false)}/>}
    <header className="studio-heading"><div><span className="studio-eyebrow">SATQUERY / ANALYSIS STUDIO</span><h1>Ask a question. Inspect the evidence.</h1></div><button onClick={() => setTour(true)}><Sparkles size={16}/>How it works</button></header>
    <div className="studio-grid">
      <div className="studio-inputs" ref={inputsTray}>
      <button className="studio-input-toggle" aria-expanded={inputsOpen} aria-controls="studio-input-panel" onClick={() => setInputsOpen(v => !v)}><Plus size={16}/>Inputs · {assets.length}<ChevronDown size={14}/></button>
      {inputsOpen && <aside id="studio-input-panel" className="studio-assets" inert={!!busy} aria-label="Observation inputs"><div className="studio-panel-title"><h2>Add observations</h2><button aria-label="Close inputs" onClick={() => setInputsOpen(false)}><X size={16}/></button></div>
        <p className="studio-help">Choose one image, two dates, or an optical–SAR pair.</p>
        <input type="file" ref={fileInput} hidden accept=".tif,.tiff,.png,.jpg,.jpeg" multiple onChange={e => void upload(e.target.files)}/>
        <button className="studio-add studio-upload" onClick={() => fileInput.current?.click()} disabled={!!busy}><Upload size={20}/><span>Upload observations<small>GeoTIFF / TIFF · PNG / JPEG</small></span></button>
        <p className="studio-help">PNG and JPEG are for benchmark visual questions.</p>
        <button className="studio-sample" onClick={loadSamples} disabled={!!busy}><Layers3 size={17}/><span>Load prepared source pack<small>Upper Lake · five observations · optical + SAR</small></span><ArrowRight size={16}/></button>
        {assets.some(item => item.file) && <div className="studio-presets"><button onClick={() => preset('single')}>Single</button><button onClick={() => preset('temporal')}>Two dates</button><button onClick={() => preset('fusion')}>Optical + SAR</button></div>}
        <div className="studio-asset-list">{[...assets].sort((a,b) => Number(selected.includes(b.id)) - Number(selected.includes(a.id))).map(item => <article className={`studio-asset ${selected.includes(item.id) ? 'selected' : ''}`} key={item.id}>
          <button className="studio-asset-image" aria-label={`Select ${item.label} ${item.date}`} onClick={() => toggle(item.id)}>{item.image ? <img src={item.image} alt={`${item.label} observation`}/> : <Layers3/>}<span>{selected.includes(item.id) ? <Check size={14}/> : <Plus size={14}/>}</span></button>
          <div className="studio-asset-name"><button className="studio-view-source" aria-label={`View ${item.label} ${item.date}`} onClick={() => setActive(item.id)}>{item.label}</button><button aria-label={`Remove ${item.label}`} onClick={() => {setAssets(v => v.filter(a => a.id !== item.id));setSelected(v => v.filter(id => id !== item.id));setAnswers([])}}><X size={14}/></button></div>
          <div className="studio-asset-meta"><select aria-label={`Modality ${item.label}`} value={item.modality} onChange={e => update(item.id,{modality:e.target.value as Evidence['modality']})}><option value="optical">Optical</option><option value="sar">SAR</option></select><input aria-label={`Date ${item.label}`} type="date" value={item.date} onChange={e => update(item.id,{date:e.target.value})}/></div>
          <small>{item.crs || (item.file ? 'No CRS declared' : 'Catalog reference · upload raster')}</small>
        </article>)}</div>
        <button className="studio-add" onClick={discover}><Search size={16}/>Discover imagery</button>
        {chosen.length === 2 && <button className="studio-add" onClick={() => {setSelected(v => [...v].reverse());setPlan(undefined);setAnswers([])}}>Swap earlier / later</button>}
      </aside>}
      </div>
      <main className="studio-evidence"><div className="studio-view-toolbar"><span><Layers3 size={16}/>{shown ? shown.date || 'Source observation' : 'Evidence canvas'}</span><div>{chosen.length === 2 && <button className={compare ? 'active' : ''} onClick={() => setCompare(v => !v)}>Compare</button>}{latest?.maskPng && <button className={overlay ? 'active' : ''} onClick={() => setOverlay(v => !v)}>Water overlay</button>}</div></div>
        {shown?.file && shown.modality === 'optical' && /\.tiff?$/i.test(shown.file.name) && <div className="studio-band-presets"><span>Band view</span>{[['rgb','True colour'],['false-color','False colour'],['ndvi','NDVI'],['ndwi','NDWI']].map(([id,label]) => <button key={id} disabled={!!busy} onClick={() => void renderPreset(id)}>{label}</button>)}<small>{rendered?.id === shown.id ? rendered.note : 'B02 / B03 / B04 / B08 required'}</small></div>}<div className="studio-canvas">{busy && /catalogue|GeoTIFF|raster metadata/i.test(busy) ? <div className="studio-raster-loading" role="status" aria-live="polite"><div className="studio-raster-skeleton" aria-hidden="true"><i/><i/><i/><i/></div><div className="studio-raster-loading-copy"><LoaderCircle size={22}/><span>{busy.includes('GeoTIFF') ? 'Attaching source imagery' : 'Preparing source imagery'}</span><small>{busy} · {elapsed}s</small><p>{busy.includes('GeoTIFF') ? 'Downloading the original raster files. Every preview and source record stays linked to its observation.' : 'Reading the prepared collection metadata and display previews.'}</p></div></div> : shown?.image ? <><img className="studio-raster" src={compare && chosen[1]?.image ? chosen[1].image : rendered?.id === shown.id ? rendered.image : shown.image} alt="Selected source evidence"/>{compare && chosen[0]?.image && <img className="studio-raster compare-image" style={{clipPath:`inset(0 ${100-split}% 0 0)`}} src={chosen[0].image} alt="Earlier observation"/>}{latest?.maskPng && latest.maskSourceId === shown.id && overlay && !compare && <img className="studio-raster studio-mask" src={latest.maskPng} alt="Computed water candidate mask"/>}<span className="studio-image-label">{compare ? `${chosen[0]?.date} ← → ${chosen[1]?.date}` : shown.label}</span></> : <div className="studio-empty"><div><Layers3 size={32}/></div><h2>Start with an observation.</h2><p>Upload GeoTIFF, TIFF, PNG or JPEG, then ask about your selected imagery.</p><button onClick={() => setInputsOpen(true)} disabled={!!busy}>Add observations<ArrowRight size={17}/></button></div>}</div>
        {compare && <label className="studio-slider">Earlier<input aria-label="Before after comparison" type="range" min="0" max="100" value={split} onChange={e => setSplit(+e.target.value)}/>Later</label>}
        <div className="studio-provenance"><ShieldCheck size={17}/><div><b>{shown?.source || 'Source-linked evidence'}</b><p>{shown?.processing || 'Original files stay in this session. Selected inputs are reused for every question.'}</p></div></div>
        <details className="studio-advanced"><summary><SlidersHorizontal size={15}/>Advanced water parameters</summary><div><label>Green band<input type="number" min="1" max="16" value={green} onChange={e => setGreen(+e.target.value)}/></label><label>NIR band<input type="number" min="1" max="16" value={nir} onChange={e => setNir(+e.target.value)}/></label><label>NDWI threshold<input type="number" min="-1" max="1" step=".05" value={threshold} onChange={e => setThreshold(+e.target.value)}/></label></div><p>These controls change the actual calculation. Use surface reflectance with the correct scale and offset.</p></details>
      </main>
      {reading && <button className="studio-reading-backdrop" aria-label="Return to imagery" onClick={() => setReading(false)}/>}
      <aside className={`studio-assistant ${reading ? 'studio-reading' : ''}`} aria-label="SatQuery conversation"><div className="studio-panel-title"><h2><Sparkles size={18}/>Ask SatQuery</h2><button className="studio-reading-toggle" onClick={() => setReading(v => !v)} aria-expanded={reading}>{reading ? 'Return to imagery' : 'Expand conversation'}{reading ? <X size={16}/> : <ArrowRight size={16}/>}</button></div>
        <div className="studio-conversation" ref={conversation} aria-live="polite">{!answers.length && <div className="studio-welcome"><Bot size={30}/><h2>What would you like to know?</h2><p>Ask in your own words. SatQuery chooses the workflow from your question and selected inputs.</p><div className="studio-suggestions">{prompts.map(prompt => <button key={prompt.text} onClick={() => {setQuery(prompt.text);preset(prompt.mode)}}><span><small>{prompt.tag}</small>{prompt.text}</span><ArrowRight size={14}/></button>)}</div></div>}
          {answers.map((answer,index) => <article className="studio-answer" key={index}><div className="studio-user-question">{answer.query}</div><span className="studio-answer-mode"><Check size={14}/>{answer.mode}{answer.elapsedSeconds ? ` · ${answer.elapsedSeconds}s` : ''}</span><h3 className="studio-result-heading">Answer</h3><ReadableAnswer text={answer.answer}/><div className="studio-confidence"><ShieldCheck size={16}/><span><b>Evidence quality</b>Review source dates, sensor compatibility and the limitations below. Accuracy requires reference labels; no per-answer percentage is inferred.</span></div>{answer.limitations?.length ? <details open><summary>Quality & limitations<ChevronDown size={14}/></summary><ul>{answer.limitations.map(line => <li key={line}>{line}</li>)}</ul></details> : null}<details><summary>Executed tools & parameters<ChevronDown size={14}/></summary><pre>{JSON.stringify(answer.trace,null,2)}</pre></details><button className="studio-report" onClick={() => createEvidenceReport(answer).save('satquery-evidence-report.pdf')}><Download size={14}/>Download PDF evidence report</button><button className="studio-report" onClick={() => download('satquery-execution.json',JSON.stringify(answer,null,2))}>Export execution JSON</button></article>)}
          {busy && <div className="studio-progress"><LoaderCircle size={17}/>{busy}<span>{elapsed}s elapsed</span></div>}
          {error && <div className="studio-error" role="alert">{error}</div>}
        </div>
        {plan && <details className="studio-plan"><summary><ShieldCheck size={15}/>{plan.task}<ChevronDown size={14}/></summary><ol>{plan.steps.map(step => <li key={step.tool}><b>{step.tool}</b><span>{step.detail}</span></li>)}</ol></details>}
        <form className="studio-composer" onSubmit={e => {e.preventDefault();void run()}}><label htmlFor="studio-query">Ask about your selected images</label>{chosen.length > 0 && <div className="studio-attached">{chosen.map((item,index) => <span key={item.id}><b>{index + 1}</b>{item.label}<small>{item.modality.toUpperCase()}{item.date ? ` · ${item.date}` : ''}</small></span>)}</div>}<textarea id="studio-query" value={query} onChange={e => setQuery(e.target.value)} placeholder={chosen.length === 2 ? 'Ask what changed, or how these sensors complement each other…' : 'Ask what is visible, or request a water mask…'} maxLength={4000} disabled={!!busy}/><div><span>{chosen.length ? `${chosen.length} source observation${chosen.length === 1 ? '' : 's'} attached` : 'Choose an input before analysing'}</span><button disabled={!!busy || !query.trim()} type="submit">{busy ? <LoaderCircle size={16}/> : <ArrowRight size={18}/>}Analyse</button></div></form>
      </aside>
    </div>
    {tour && <StudioWelcome architecture close={() => setTour(false)}/>}
  </div>
}
