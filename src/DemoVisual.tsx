import { Check, FileText, Layers, MapPin, MousePointer2 } from 'lucide-react'
import RiverScene from './RiverScene'

export default function DemoVisual({step}:{step:number}) {
  return <div className={`sq-tour-scene sq-tour-step-${step}`} key={step}>
    <RiverScene highlighted={step===1}/>
    <div className="sq-tour-location"><MapPin size={16}/> River corridor <span>Illustrative preview</span></div>
    {step===0 && <div className="sq-tour-catalog"><header><Layers size={18}/> Choose your imagery</header><div className="sq-tour-search"><MapPin size={15}/> Supaul, Bihar, India</div>{['Optical scene','Supporting radar','Your GeoTIFF'].map((scene,index)=><div className="sq-tour-scene-row" key={scene}><div className={'sq-tour-thumb thumb-'+index}/><span><b>{scene}</b><small>{['Visible + near-infrared','Complementary radar context','Upload a local raster'][index]}</small></span><Check size={15}/></div>)}</div>}
    {step===1&&<><div className="sq-tour-pin"><MousePointer2/> River channel selected</div><div className="sq-tour-question"><small>ASK ABOUT THE SELECTED REGION</small><p>“What is visible in this river corridor?”</p><span>River outline attached to your question</span></div></>}
    {step===2&&<><div className="sq-tour-reveal"><RiverScene highlighted/></div><div className="sq-tour-swipe"><b>‹ ›</b></div><div className="sq-tour-labels"><span>Source image</span><span>Selected water channel</span></div><div className="sq-tour-caption">Compare source imagery with the region overlay</div></>}
    {step===3&&<article className="sq-tour-report"><header><FileText size={21}/><span>Evidence brief<small>River corridor review</small></span></header><div className="sq-tour-report-map"><RiverScene/></div><h3>Visible surface water</h3><p>The outline follows the main river channel. Sandbars and adjacent land remain visible for review.</p><ul><li><Check/> Source image attached</li><li><Check/> Selected region included</li><li><Check/> Observation ready for review</li></ul><footer>Illustrative product walkthrough</footer></article>}
  </div>
}
