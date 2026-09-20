import { useEffect, useRef, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import './studio-welcome.css'

const capabilities = [
  ['Understand','A scene becomes|a conversation.','What can you see around this lake?','Ask about water, vegetation and visible development. Keep the answer beside the imagery.'],
  ['Locate','Find the water.|See the evidence.','Highlight the water body.','Green and near-infrared bands produce a water-candidate mask. Inspect the threshold and source pixels.'],
  ['Compare','Two dates.|A clearer picture.','How has the water extent changed?','Compare corresponding observations and measure water-index change on a shared raster grid.'],
  ['Combine','Different sensors.|Shared context.','What does each sensor reveal?','Bring aligned optical and radar observations together for complementary visual interpretation.'],
]
const pipeline = [
  ['Acquire','Start with|the right evidence.','Sources, dates and sensors','Bring an observation or a corresponding pair. Source identities stay attached throughout analysis.'],
  ['Validate','Check the inputs.|Before the answer.','Format · dates · coverage','Check modality, acquisition order and georeferencing. Quantitative comparison requires compatible raster grids.'],
  ['Prepare','Reveal another|side of the scene.','RGB · false colour · NDVI · NDWI','Render source bands for the question. Keep display rendering separate from numerical measurement.'],
  ['Route','Your question|selects the workflow.','Question + observations → tools','The current rule-based controller selects single-image interpretation, paired analysis or spectral water tools.'],
  ['Execute','Turn pixels|into evidence.','Vision + raster calculations','Run connected vision interpretation or deterministic raster tools. Adapted specialists and learned fusion are the next development phase.'],
  ['Check','Make uncertainty|visible.','Sources · parameters · limitations','Retain inputs and execution records. Accuracy and calibrated confidence require held-out reference data.'],
  ['Explain','An answer you|can inspect.','Answer · spatial evidence · export','Inspect the visual evidence and take the source-linked execution report with you.'],
]
export default function StudioWelcome({close,architecture=false}:{close:()=>void;architecture?:boolean}) {
  const panel=useRef<HTMLDivElement>(null)
  const [step,setStep]=useState(0)
  const entries=architecture?pipeline:capabilities, current=entries[step]
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape') close()
      if(e.key==='Tab') {
        const buttons=panel.current?.querySelectorAll<HTMLButtonElement>('button')
        if(!buttons?.length) return
        if(e.shiftKey&&document.activeElement===buttons[0]) {e.preventDefault();buttons[buttons.length-1].focus()}
        else if(!e.shiftKey&&document.activeElement===buttons[buttons.length-1]) {e.preventDefault();buttons[0].focus()}
      }
    }
    window.addEventListener('keydown',key)
    return()=>{window.removeEventListener('keydown',key);previous?.focus()}
  },[close])
  return <div className="welcome-shade"><div ref={panel} className="studio-welcome-guide" role="dialog" aria-modal="true" aria-labelledby="guide-title">
    <button className="guide-close" onClick={close} aria-label={architecture?'Close architecture':'Close introduction'}><X size={20}/></button>
    <div className={'guide-art guide-art-'+step}>
      <img className="guide-terrain" src="/satquery-guide-terrain.png" alt="Illustrated river, farmland and settlement"/>
      <div className="guide-art-shade"/>
      <span className="guide-art-brand"><img src="/satquery-mark-light.svg" alt=""/>SATQUERY <span>/ FIELD OF VIEW</span></span>
      <div className="guide-scan"/><div className="guide-target"><span>{step===1?'Water candidates':'Selected area'}</span></div>
      {step===2&&<div className="guide-comparison-line"><span>Observation A</span><b>↔</b><span>Observation B</span></div>}
      <div className="guide-question" key={current[2]}><span>0{step+1} / {current[0]}</span><strong>{architecture?current[2]:'“'+current[2]+'”'}</strong><small>Question → workflow → evidence</small></div>
      <span className="guide-art-caption">AI-generated explanatory illustration · not analysis data</span>
    </div>
    <div className="guide-editorial">
      <span className="guide-kicker">{architecture?'HOW SATQUERY WORKS':'WELCOME TO SATQUERY'} <span>0{step+1} / 0{entries.length}</span></span>
      <div className="guide-copy" key={current[1]}><h2 id="guide-title">{current[1].split('|')[0]}<br/><em>{current[1].split('|')[1]}</em></h2><p>{current[3]}</p></div>
      <div className="guide-tabs" aria-label={architecture?'System layers':'Explore capabilities'}>{entries.map((entry,i)=><button key={entry[0]} aria-pressed={step===i} onClick={()=>setStep(i)}><span>0{i+1}</span>{entry[0]}</button>)}</div>
      <footer><small>{architecture?'Observable tools and outputs. Source-linked results.':'Add imagery. Ask naturally. Inspect the answer.'}</small><button onClick={close}>{architecture?'Back to the workspace':'Start exploring'}<ArrowRight size={18}/></button></footer>
    </div>
  </div></div>
}
