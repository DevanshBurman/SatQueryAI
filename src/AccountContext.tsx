import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase, type Profile } from './supabase'

type AccountContextValue = {
  configured: boolean
  loading: boolean
  user: User | null
  profile: Profile | null
  sendMagicLink: (email: string) => Promise<void>
  saveProfile: (fullName: string, organization: string) => Promise<void>
  signOut: () => Promise<void>
}

const AccountContext = createContext<AccountContextValue | null>(null)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }
    let active = true
    supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
      if (active) setProfile(data as Profile | null)
    })
    return () => { active = false }
  }, [session?.user.id])

  const value = useMemo<AccountContextValue>(() => ({
    configured: isSupabaseConfigured,
    loading,
    user: session?.user ?? null,
    profile,
    sendMagicLink: async (email: string) => {
      if (!supabase) throw new Error('Supabase is not configured yet.')
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
    },
    saveProfile: async (fullName: string, organization: string) => {
      if (!supabase || !session?.user) throw new Error('Sign in before saving your profile.')
      const now = new Date().toISOString()
      const { data, error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: fullName.trim() || null,
        organization: organization.trim() || null,
        updated_at: now,
      }).select().single()
      if (error) throw error
      setProfile(data as Profile)
    },
    signOut: async () => {
      if (!supabase) return
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }), [loading, profile, session])

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const value = useContext(AccountContext)
  if (!value) throw new Error('useAccount must be used inside AccountProvider')
  return value
}
