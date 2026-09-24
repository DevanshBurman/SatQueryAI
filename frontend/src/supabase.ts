import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export type Profile = {
  id: string
  full_name: string | null
  organization: string | null
  created_at: string
  updated_at: string
}

export type Workspace = { id: string; owner_id: string; name: string; created_at: string; updated_at: string }
export type UserProject = { id: string; owner_id: string; workspace_id: string; title: string; location: string | null; status: string; created_at: string; updated_at: string }
export type QueryHistoryItem = { id: string; owner_id: string; workspace_id: string; project_id: string | null; query: string; analysis_type: string; created_at: string }
