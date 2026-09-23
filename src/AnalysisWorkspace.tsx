import { ArrowRight, BarChart3, Bot, Check, ChevronRight, CircleHelp, Database, FileText, History, Home, Layers3, Map, MessageSquareText, MoreHorizontal, Plus, Search, Settings, Upload, User } from 'lucide-react'
import DataPage from './DiscoveryPage'
import 'maplibre-gl/dist/maplibre-gl.css'
import './analysis-workspace.css'
import './workspace-layout.css'
import { getServiceHealth, type CatalogScene, type ServiceHealth } from './api'
import AccountDialog from './AccountDialog'
import AnalysisStudio from './AnalysisStudio'
import { useAccount } from './AccountContext'
import type { QueryHistoryItem, UserProject } from './supabase'

type Section = 'projects' | 'data' | 'analysis' | 'results' | 'activity' | 'settings'

const PROJECTS = [
  { title: 'Wayanad flood assessment', meta: 'Edited 12 min ago', observations: 4, className: 'wayanad' },
  { title: 'Coastal change monitoring', meta: 'Edited 2 days ago', observations: 12, className: 'coast' },
  { title: 'Reservoir watch', meta: 'Edited 5 days ago', observations: 8, className: 'reservoir' },
]


function BrandMark() { return <span className="sq-brand-mark" aria-hidden="true"><img src="/satquery-mark.svg" alt="" /></span> }

function SideNavigation({ current, navigate, home, accountName, openAccount }: { current: Section; navigate: (section: Section) => void; home: () => void; accountName: string; openAccount: () => void }) {
  const items = [['projects', 'Home', Home], ['analysis', 'Analysis', BarChart3], ['data', 'Data', Database], ['results', 'Results', FileText], ['activity', 'History', History]] as const
  return <aside className="workspace-sidebar" aria-label="Workspace navigation">
    <div className="sidebar-brand"><button className="brand-button" onClick={home} aria-label="Return to landing page"><BrandMark /><span>SatQuery</span></button></div>
    <nav aria-label="Main workspace navigation">{items.map(([id, label, Icon]) => <button key={id} className={current === id ? 'active' : ''} onClick={() => navigate(id)}><Icon /><span>{label}</span></button>)}</nav>
    <div className="sidebar-bottom"><button onClick={() => navigate('analysis')}><CircleHelp /><span>Help</span></button><button className={current === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><Settings /><span>Settings</span></button><button className="profile" onClick={openAccount}><span>{accountName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</span><b>{accountName}</b><ChevronRight /></button></div><ChevronRight className="rail-peek" />
  </aside>
}

function ProjectHeader({ section, navigate, openAccount }: { section: Section; navigate: (section: Section) => void; openAccount: () => void }) {
  const insideProject = ['data', 'analysis', 'results'].includes(section)
  return <header className="workspace-header">
    <div className="project-identity"><BrandMark /><b>SatQuery</b>{insideProject && <><i /><span>Satellite investigation</span></>}</div>
    {insideProject ? <nav className="project-tabs" aria-label="Project steps">{(['data', 'analysis', 'results'] as const).map((id, index) => <span key={id}><button className={section === id ? 'active' : ''} onClick={() => navigate(id)}>{id[0].toUpperCase() + id.slice(1)}</button>{index < 2 && <i />}</span>)}</nav> : <div className="global-search"><Search /><input aria-label="Search projects" placeholder="Search projects, locations, or imagery…" /></div>}
    <div className="header-context">{insideProject && <span><Layers3 />Source-linked workspace</span>}<button className="header-avatar" onClick={openAccount} aria-label="Open account"><User /></button></div>
  </header>
}

function ProjectsPage({ openData, projects, signedIn, createProject }: { openData: () => void; projects: UserProject[]; signedIn: boolean; createProject: (title: string, location: string) => Promise<void> }) {
  const [creating, setCreating] = useState(false), [title, setTitle] = useState(''), [location, setLocation] = useState(''), [status, setStatus] = useState('')
  const submit = async (event: FormEvent) => { event.preventDefault(); try { await createProject(title, location); setTitle(''); setLocation(''); setCreating(false); openData() } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not create project.') } }
  const visibleProjects = signedIn ? projects.map((project, index) => ({ title: project.title, meta: new Date(project.updated_at).toLocaleDateString(), observations: 0, className: ['wayanad', 'coast', 'reservoir'][index % 3] })) : PROJECTS
  return <div className="projects-page page-scroll"><div className="page-title-row"><div><span className="crumb">Workspace / Projects</span><h1>{signedIn ? 'Your projects' : 'Projects'}</h1><p>{signedIn ? 'Projects in your private Supabase workspace.' : 'Sign in to save projects to your own workspace.'}</p></div><button className="primary-button" onClick={() => setCreating(value => !value)}><Plus />New project</button></div>
    {creating && <form className="project-create-form" onSubmit={submit}><input required value={title} onChange={event => setTitle(event.target.value)} placeholder="Project name" maxLength={160} /><input value={location} onChange={event => setLocation(event.target.value)} placeholder="Location (optional)" /><button className="primary-button">Create project</button>{status && <small>{status}</small>}</form>}
    <div className="projects-layout"><section className="project-list">{visibleProjects.length ? visibleProjects.map((project, index) => <article className={`project-card ${index === 0 ? 'featured' : ''}`} key={project.title}><div className={`project-cover ${project.className}`}><span>10 km</span></div><div className="project-card-copy"><span className="draft-label">Draft</span><h2>{project.title}</h2><div><span><Layers3 />{project.observations} observations</span><span><History />{project.meta}</span></div></div><button className="more-button" aria-label={`More actions for ${project.title}`}><MoreHorizontal /></button><button className="open-project" aria-label={index === 0 ? 'Open project' : `Open ${project.title}`} onClick={openData}>Open project<ArrowRight /></button></article>) : <div className="project-empty"><Database /><h2>No projects yet</h2><p>Create your first private project to begin.</p></div>}</section>
      <aside className="start-card"><div className="layer-illustration"><span /><span /><span /></div><h2>Start with data</h2><p>Find public imagery or bring your own GeoTIFF, PNG, or JPEG into a new investigation.</p><button className="primary-button wide" onClick={openData}><Search />Discover public imagery</button><label className="secondary-button wide"><Upload />Upload your own data<input type="file" hidden multiple accept="image/*,.tif,.tiff" /></label><small><Check /> Batch upload supported</small></aside></div>
  </div>
}


function ActivityPage({ history, signedIn }: { history: QueryHistoryItem[]; signedIn: boolean }) { return <div className="simple-page page-scroll"><div className="page-title-row"><div><span className="crumb">Workspace / History</span><h1>Query history</h1><p>{signedIn ? 'Private queries saved in your workspace.' : 'Sign in to save and review your query history.'}</p></div></div><section className="activity-table"><header><span>Query</span><span>Project</span><span>Type</span><span>Saved</span></header>{history.length ? history.map(item => <div key={item.id}><span><MessageSquareText /><b>{item.query}</b></span><span>{item.project_id ? 'Project' : 'Workspace'}</span><span><i />{item.analysis_type}</span><span>{new Date(item.created_at).toLocaleString()}<ChevronRight /></span></div>) : <div><span><FileText /><b>No saved queries yet</b></span><span>—</span><span>—</span><span>{signedIn ? 'Run an analysis to save a query.' : 'Sign in first.'}</span></div>}</section></div> }
function SettingsPage({ health, supabaseConnected, openAccount }: { health: ServiceHealth | null; supabaseConnected: boolean; openAccount: () => void }) { return <div className="simple-page page-scroll"><div className="page-title-row"><div><span className="crumb">Workspace / Settings</span><h1>Workspace settings</h1><p>Connections, map defaults, and prototype disclosures.</p></div></div><div className="settings-grid"><section><Database /><div><h2>Geospatial service</h2><p>{health ? `Connected · ${health.engine}` : 'Offline · start the local FastAPI service'}</p></div><span className={health ? 'online' : ''}>{health ? 'Online' : 'Offline'}</span></section><section><Database /><div><h2>Supabase user data</h2><p>{supabaseConnected ? 'Connected · authentication and protected profiles enabled' : 'Add the project URL and publishable key to .env.local'}</p></div><button className={supabaseConnected ? 'online' : ''} onClick={openAccount}>{supabaseConnected ? 'Manage' : 'Set up'}</button></section><section><Map /><div><h2>Basemap</h2><p>OpenStreetMap raster tiles · no Google key required</p></div><span>OpenStreetMap</span></section><section><Bot /><div><h2>SatQuery AI analysis</h2><p>{health?.visionConfigured ? 'Connected · visual reasoning is ready' : 'Connect the server-side analysis service to enable visual answers.'}</p></div><span>{health?.visionConfigured ? 'Configured' : 'Not connected'}</span></section></div></div> }

export default function AnalysisWorkspace({ home }: { home: () => void }) {
  const [section, setSection] = useState<Section>('analysis'), [health, setHealth] = useState<ServiceHealth | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const account = useAccount()
  const [projectScenes, setProjectScenes] = useState<CatalogScene[]>([])
  useEffect(() => { const controller = new AbortController(); getServiceHealth(controller.signal).then(setHealth).catch(() => setHealth(null)); return () => controller.abort() }, [])
  const navigate = (next: Section) => setSection(next)
  const content = useMemo(() => {
    if (section === 'projects') return <ProjectsPage openData={() => setSection('data')} projects={account.projects} signedIn={Boolean(account.user)} createProject={async (title, location) => { await account.createProject(title, location) }} />
    if (section === 'data') return <DataPage back={() => setSection('analysis')} proceed={scenes => { setProjectScenes(scenes); setSection('analysis') }} />



    if (section === 'activity') return <ActivityPage history={account.queryHistory} signedIn={Boolean(account.user)} />
    return <SettingsPage health={health} supabaseConnected={account.configured} openAccount={() => setAccountOpen(true)} />
  }, [section, health, projectScenes, account.configured, account.projects, account.queryHistory, account.user, account.createProject, account.saveQuery])
  const accountName = account.profile?.full_name || account.user?.email?.split('@')[0] || 'Sign in'
  return <main className="satquery-app"><SideNavigation current={section} navigate={navigate} home={home} accountName={accountName} openAccount={() => setAccountOpen(true)} /><ProjectHeader section={section} navigate={navigate} openAccount={() => setAccountOpen(true)} /><div className="workspace-content"><div style={{height:'100%',display:section === 'analysis' || section === 'results' ? 'block' : 'none'}}><AnalysisStudio scenes={projectScenes} discover={() => setSection('data')} saveQuery={account.saveQuery}/></div>{section !== 'analysis' && section !== 'results' && content}</div><AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} /></main>
}
import { useEffect, useMemo, useState, type FormEvent } from 'react'
