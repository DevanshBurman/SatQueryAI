import { useEffect, useState } from 'react'
import './styles.css'
import LandingExperience from './LandingExperience'
import './workspace-theme.css'
import AnalysisWorkspace from './AnalysisWorkspace'

export default function App(){const [view,setView]=useState<'landing'|'workspace'>('landing');useEffect(()=>{window.scrollTo(0,0)},[view]);return view==='landing'?<LandingExperience enter={()=>setView('workspace')}/>:<AnalysisWorkspace home={()=>setView('landing')}/>}
