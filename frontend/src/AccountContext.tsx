import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase, type Profile, type QueryHistoryItem, type UserProject, type Workspace } from './supabase'

type AccountContextValue = {
  configured: boolean; loading: boolean; user: User | null; profile: Profile | null; workspace: Workspace | null
  projects: UserProject[]; queryHistory: QueryHistoryItem[]
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUpWithPassword: (email: string, password: string, fullName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  saveProfile: (fullName: string, organization: string) => Promise<void>
  createProject: (title: string, location?: string) => Promise<UserProject>
  saveQuery: (query: string, analysisType: string, projectId?: string | null) => Promise<void>
  signOut: () => Promise<void>
}
const AccountContext = createContext<AccountContextValue | null>(null)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null), [profile, setProfile] = useState<Profile | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null), [projects, setProjects] = useState<UserProject[]>([]), [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  useEffect(() => { if (!supabase) return; let active = true; supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false) } }); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setLoading(false) }); return () => { active = false; listener.subscription.unsubscribe() } }, [])
  useEffect(() => {
    if (!supabase || !session?.user) { setProfile(null); setWorkspace(null); setProjects([]); setQueryHistory([]); return }
    let active = true; const userId = session.user.id
    Promise.all([supabase.from('profiles').select('*').eq('id', userId).maybeSingle(), supabase.from('workspaces').select('*').eq('owner_id', userId).maybeSingle(), supabase.from('projects').select('*').eq('owner_id', userId).order('updated_at', { ascending: false }), supabase.from('query_history').select('*').eq('owner_id', userId).order('created_at', { ascending: false }).limit(25)]).then(([profileResult, workspaceResult, projectsResult, historyResult]) => { if (!active) return; setProfile(profileResult.data as Profile | null); setWorkspace(workspaceResult.data as Workspace | null); setProjects((projectsResult.data || []) as UserProject[]); setQueryHistory((historyResult.data || []) as QueryHistoryItem[]) })
    return () => { active = false }
  }, [session?.user.id])
  const value = useMemo<AccountContextValue>(() => ({
    configured: isSupabaseConfigured, loading, user: session?.user ?? null, profile, workspace, projects, queryHistory,
    signInWithPassword: async (email, password) => { if (!supabase) throw new Error('Supabase is not configured yet.'); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error },
    signUpWithPassword: async (email, password, fullName) => { if (!supabase) throw new Error('Supabase is not configured yet.'); const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() }, emailRedirectTo: window.location.origin } }); if (error) throw error },
    signInWithGoogle: async () => { if (!supabase) throw new Error('Supabase is not configured yet.'); const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); if (error) throw error },
    saveProfile: async (fullName, organization) => { if (!supabase || !session?.user) throw new Error('Sign in before saving your profile.'); const { data, error } = await supabase.from('profiles').upsert({ id: session.user.id, full_name: fullName.trim() || null, organization: organization.trim() || null, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; setProfile(data as Profile) },
    createProject: async (title, location = '') => { if (!supabase || !session?.user || !workspace) throw new Error('Sign in to create a project.'); const { data, error } = await supabase.from('projects').insert({ owner_id: session.user.id, workspace_id: workspace.id, title: title.trim(), location: location.trim() || null }).select().single(); if (error) throw error; const project = data as UserProject; setProjects(current => [project, ...current]); return project },
    saveQuery: async (query, analysisType, projectId = null) => { if (!supabase || !session?.user || !workspace || !query.trim()) return; const { data, error } = await supabase.from('query_history').insert({ owner_id: session.user.id, workspace_id: workspace.id, project_id: projectId, query: query.trim(), analysis_type: analysisType }).select().single(); if (error) throw error; setQueryHistory(current => [data as QueryHistoryItem, ...current].slice(0, 25)) },
    signOut: async () => { if (!supabase) return; const { error } = await supabase.auth.signOut(); if (error) throw error },
  }), [loading, session, profile, workspace, projects, queryHistory])
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}
export function useAccount() { const value = useContext(AccountContext); if (!value) throw new Error('useAccount must be used inside AccountProvider'); return value }
