import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Building2, Check, ChevronRight, Crosshair, FileText, Layers, MapPin, MousePointer2, Play, Radar, Search, ShieldCheck, Users, Waves, X } from 'lucide-react'
import './landing.css'
import ProductSections from './ProductSections'
import RiverScene from './RiverScene'
import DemoVisual from './DemoVisual'
import './river-tour.css'

const chapters = [
  {title:'Start with a place.',copy:'Find your district. Bring in optical imagery, radar observations or your own GeoTIFFs. Every scene keeps its date, source and coordinates.',label:'Find your evidence', icon:Layers},
  {title:'Point. Ask. Understand.',copy:'Select the area that matters. Ask a question in your own words. Keep the answer connected to the exact place you are looking at.',label:'Ground your question', icon:Crosshair},
  {title:'See what changed.',copy:'Move between dates to reveal expanding water, changing vegetation and new development. Inspect the change before you act.',label:'Compare across time', icon:Waves},
  {title:'Take evidence with you.',copy:'Bring the observations, measurements and source imagery into one reviewable brief. Give the next person the context behind the decision.',label:'Review the result', icon:FileText},
]

function Identity(){return <span className="sq-identity"><svg viewBox="0 0 60 58" aria-hidden="true"><path fill="#ff9838" d="M5 26C10 4 37 20 53 4C53 25 23 13 5 26Z"/><path fill="#f5fcff" d="M4 39C12 16 40 33 54 17C53 38 22 26 4 39Z"/><path fill="#27bb87" d="M3 52C13 29 40 45 53 31C51 52 22 39 3 52Z"/></svg><span>SatQuery AI</span></span>}

function FloodShape({className=''}:{className?:string}){return <RiverScene className={'sq-boundary '+className}/>}

export default function LandingExperience({enter}:{enter:()=>void}){
  const root=useRef<HTMLElement>(null), story=useRef<HTMLElement>(null)
  const [chapter,setChapter]=useState(0), [playing,setPlaying]=useState(false), [tour,setTour]=useState(0)
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame=0
    const update=()=>{frame=0; if(!root.current||!story.current)return
      const rect=story.current.getBoundingClientRect(), distance=story.current.offsetHeight-window.innerHeight
      const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,distance)))
      setChapter(Math.min(3,Math.floor(progress*4)))
      root.current.style.setProperty('--story-progress',String(progress))
      root.current.style.setProperty('--hero-pan',media.matches?'0':String(Math.min(window.scrollY/window.innerHeight,1)))
    }
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)}
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);update()
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('sq-visible')}),{threshold:.16})
    root.current?.querySelectorAll('.sq-reveal').forEach(el=>observer.observe(el))
    return()=>{window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);cancelAnimationFrame(frame);observer.disconnect()}
  },[])
  useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setTour(v=>(v+1)%4),3500);return()=>clearInterval(timer)},[playing])
  useEffect(()=>{if(!playing)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setPlaying(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[playing])
  function jump(index:number){if(!story.current)return;const top=story.current.offsetTop+(story.current.offsetHeight-innerHeight)*(index/4+.025);window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
  return <main className="sq-site" ref={root}>
    <header className="sq-nav"><a href="#" aria-label="SatQuery AI home"><Identity/></a><nav aria-label="Main navigation"><a href="#product">Product</a><a href="#workflows">Workflows</a><a href="#evidence">Evidence</a><a href="#about">About</a></nav><button className="sq-search" aria-label="Explore imagery" onClick={enter}><Search/></button><button className="sq-outline" onClick={enter}>Open workspace <ArrowRight/></button></header>
    <section className="sq-hero" aria-labelledby="sq-title">
      <div className="sq-earth"><RiverScene/></div><div className="sq-hero-shade"/>
      <div className="sq-hero-content"><h1 id="sq-title">Ask Earth.<br/>Get evidence.</h1><p>Natural-language optical, SAR and temporal<br className="sq-wide-break"/> analysis for reviewable decisions.</p><div className="sq-actions"><button className="sq-primary" onClick={enter}>Open workspace <ArrowRight/></button><button className="sq-outline" onClick={()=>setPlaying(true)}><Play fill="currentColor"/> Watch demo</button></div><div className="sq-benefits"><span><Building2/>Multi-source<br/>analysis</span><span><ShieldCheck/>Evidence for<br/>public decision-making</span><span><Users/>Built for<br/>India’s priorities</span></div></div>
      <div className="sq-date-inset"><div><div className="sq-date-image sq-date-before"/><span>12 Aug 2023<small>(Before)</small></span></div><div><div className="sq-date-image"/><span>28 Aug 2023<small>(After)</small></span></div></div>
      <div className="sq-place"><MapPin/><span>Supaul<small>Bihar</small></span></div><div className="sq-area-tag"><MapPin/><span>Visible surface water<small>Main river channel</small></span></div><span className="sq-river-name">Kosi River ↗</span>
      <div className="sq-legend"><div><i/>Selected river channel</div><div><i/>Surrounding land unselected</div><div className="sq-scale"><span>0</span><span>2.5</span><span>5 km</span><b>↑<small>N</small></b></div><small>Concept imagery · not an observed flood product</small></div>
      <div className="sq-india"><svg viewBox="0 0 480 120" aria-hidden="true"><path d="M0 112V85H28V74H35V58L42 50 49 58V74H59V91H83V70H95V57H103V25H107V57H115V70H127V91H150V70H159V58H168V43Q174 21 195 16V8H201V16Q224 21 231 43V58H240V70H248V91H280V66H288V45L296 35 304 45V66H311V91H345V77H358V59L366 45 374 59V77H387V94H426V84H480V120H0Z"/></svg><div>Earth intelligence<br/>for a more resilient India<span><i/><i/><i/></span></div></div><a className="sq-scroll" href="#product">Explore the experience <ArrowDown/></a>
    </section>
    <section className="sq-intro sq-reveal" id="product"><p>From observation to understanding</p><h2>The whole picture.<br/>One conversation.</h2><span>Follow an officer’s question from a satellite scene to a reviewable answer.</span></section>
    <section className="sq-story" ref={story} id="workflows"><div className="sq-sticky"><div className="sq-story-copy"><div className="sq-step-label">0{chapter+1} / 04 <span>{chapters[chapter].label}</span></div><div key={chapter} className="sq-copy-enter"><h2>{chapters[chapter].title}</h2><p>{chapters[chapter].copy}</p></div><div className="sq-chapter-controls">{chapters.map((item,i)=><button key={item.title} onClick={()=>jump(i)} aria-label={item.label} aria-current={chapter===i?'step':undefined}><span style={{width:chapter>i?'100%':chapter===i?'65%':'0%'}}/></button>)}</div><button className="sq-text-link" onClick={enter}>Try it in the workspace <ArrowRight/></button></div>
      <div className={'sq-stage sq-stage-'+chapter}><div className="sq-stage-image"/><div className="sq-stage-top"><span><MapPin size={14}/> Supaul, Bihar</span><span>Optical · 10 m</span></div><FloodShape/>
        <div className="sq-floating sq-scene-picker"><div><Layers size={17}/><b>Available imagery</b><span>3 scenes</span></div>{['12 Aug 2023','28 Aug 2023','30 Aug 2023'].map((d,i)=><div className="sq-scene-row" key={d}><i style={{backgroundPosition:`${i*40}% center`}}/><span><b>{d}</b><small>{i===2?'Sentinel-1 · SAR':'Sentinel-2 · optical'}</small></span><Check size={15}/></div>)}</div>
        <div className="sq-floating sq-question"><span><MousePointer2 size={15}/> Selected floodplain</span><p>“What changed in this area after the flood?”</p><div><span>2 images attached</span><ArrowRight size={18}/></div></div>
        <div className="sq-compare-line"><span>Before</span><b>‹ ›</b><span>After</span></div>
        <div className="sq-floating sq-change"><Waves/><span>Water expansion detected<small>Inspect the boundary and compare dates</small></span><Check/></div>
        <div className="sq-floating sq-evidence-card"><span><ShieldCheck/> Evidence brief <Check/></span><h3>Floodplain change review</h3><div className="sq-report-thumb"/><p>New water is visible outside the reference river corridor.</p><ul><li><Check/>Source dates retained</li><li><Check/>Selected area attached</li><li><Check/>GIS execution trace included</li></ul><button onClick={enter}>Review in workspace <ArrowRight/></button></div>
        <span className="sq-stage-caption">Illustrated workflow preview</span>
      </div></div></section>
    <section className="sq-usecases" id="evidence"><div className="sq-section-heading sq-reveal"><span>Different questions. Shared evidence.</span><h2>Built around the people<br/>who need the answer.</h2></div><div className="sq-usecase-grid">{[{icon:Waves,title:'Disaster management',desc:'Review flood extent and identify areas for field verification.',type:'flood',tag:'Compare two dates'},{icon:Building2,title:'District planning',desc:'Examine land-use shifts and focus on changes around infrastructure.',type:'planning',tag:'Locate & compare'},{icon:Radar,title:'Remote-sensing teams',desc:'Bring optical and radar observations into the same review.',type:'radar',tag:'Cross-source context'}].map(({icon:Icon,title,desc,type,tag})=><button className={'sq-usecase sq-reveal '+type} key={title} onClick={enter}><div className="sq-usecase-image"><div className="sq-usecase-photo"/><div className="sq-usecase-overlay"/><span><Icon/>{tag}</span>{type==='planning'&&<div className="sq-buildings"><i/><i/><i/><i/></div>}{type==='radar'&&<div className="sq-radar-ring"/>}</div><div><h3>{title}<ArrowRight/></h3><p>{desc}</p></div></button>)}</div></section>
    <ProductSections enter={enter}/>
    <section className="sq-final sq-reveal" id="about"><div><ShieldCheck/><span>Evidence for public decision-making</span></div><h2>A clearer view.<br/>A better-informed next step.</h2><p>Explore SatQuery AI’s interactive prototype.</p><button className="sq-primary" onClick={enter}>Open workspace <ArrowRight/></button></section><footer className="sq-footer"><Identity/><span>Smart India Hackathon · SIH26167</span><a href="/docs" target="_blank" rel="noreferrer">API documentation ↗</a></footer>
    {playing&&<div className="sq-demo-backdrop" role="dialog" aria-modal="true" aria-label="Product demo"><div className="sq-demo"><button className="sq-demo-close" aria-label="Close demo" onClick={()=>setPlaying(false)}><X/></button><div className="sq-demo-visual"><DemoVisual step={tour}/></div><div className="sq-demo-copy"><span>Interactive product tour · {tour+1} / 4</span><h2>{chapters[tour].title}</h2><p>{chapters[tour].copy}</p><div>{chapters.map((c,i)=><button key={c.title} aria-label={c.label} className={tour===i?'active':''} onClick={()=>setTour(i)}/>)}</div><button className="sq-primary" onClick={enter}>Explore the prototype <ChevronRight/></button></div></div></div>}
  </main>
}
