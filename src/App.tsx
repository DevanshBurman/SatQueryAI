import { lazy, Suspense, useEffect, useState } from 'react'
import './styles.css'
import LandingExperience from './LandingExperience'
import './workspace-theme.css'
const AnalysisWorkspace = lazy(() => import('./AnalysisWorkspace'))
import LegalPage from './LegalPage'

export default function App(){
  const path=window.location.pathname.replace(/\/$/,'')||'/'
  const [view,setView]=useState<'landing'|'workspace'>('landing')
  useEffect(()=>{window.scrollTo(0,0)},[view])
  if(path==='/privacy') return <LegalPage kind="privacy"/>
  if(path==='/terms') return <LegalPage kind="terms"/>
  return view==='landing'?<LandingExperience enter={()=>setView('workspace')}/>:<Suspense fallback={<div style={{padding:40,color:'#b9e9ee',background:'#102c3c',minHeight:'100vh'}}>Opening your workspace…</div>}><AnalysisWorkspace home={()=>setView('landing')}/></Suspense>
}
