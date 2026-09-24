import { useEffect, useState } from 'react'
import './styles.css'
import LandingExperience from './LandingExperience'
import './workspace-theme.css'
import AnalysisWorkspace from './AnalysisWorkspace'
import LegalPage from './LegalPage'

export default function App(){
  const path=window.location.pathname.replace(/\/$/,'')||'/'
  const [view,setView]=useState<'landing'|'workspace'>('landing')
  useEffect(()=>{window.scrollTo(0,0)},[view])
  if(path==='/privacy') return <LegalPage kind="privacy"/>
  if(path==='/terms') return <LegalPage kind="terms"/>
  return view==='landing'?<LandingExperience enter={()=>setView('workspace')}/>:<AnalysisWorkspace home={()=>setView('landing')}/>
}
