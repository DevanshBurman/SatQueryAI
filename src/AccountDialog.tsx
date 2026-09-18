import { useEffect, useState, type FormEvent } from 'react'
import { Check, Database, LogOut, Mail, Save, User, X } from 'lucide-react'
import { useAccount } from './AccountContext'

export default function AccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { configured, loading, user, profile, sendMagicLink, saveProfile, signOut } = useAccount()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [organization, setOrganization] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? user?.user_metadata.full_name ?? '')
    setOrganization(profile?.organization ?? '')
  }, [profile, user])

  if (!open) return null

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setStatus('')
    try {
      await sendMagicLink(email)
      setStatus('Check your inbox for the secure sign-in link.')
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not send the sign-in link.') }
    finally { setBusy(false) }
  }

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setStatus('')
    try {
      await saveProfile(fullName, organization)
      setStatus('Profile saved to Supabase.')
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not save your profile.') }
    finally { setBusy(false) }
  }

  return <div className="account-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <button className="account-close" onClick={onClose} aria-label="Close account panel"><X /></button>
      <div className="account-heading"><span><Database /></span><div><small>SUPABASE ACCOUNT</small><h2 id="account-title">Your SatQuery profile</h2><p>Sign in securely and keep your user details available across sessions.</p></div></div>
      {!configured ? <div className="account-setup"><Database /><div><b>Connect your Supabase project</b><p>Copy <code>.env.example</code> to <code>.env.local</code>, add your project URL and publishable key, then run the included SQL migration.</p></div></div>
      : loading ? <div className="account-loading">Checking your session…</div>
      : user ? <form className="account-form" onSubmit={submitProfile}>
          <div className="account-user"><span><User /></span><div><b>{profile?.full_name || user.email}</b><small>{user.email}</small></div><i><Check /> Signed in</i></div>
          <label>Full name<input value={fullName} onChange={event => setFullName(event.target.value)} maxLength={100} placeholder="Your name" /></label>
          <label>Organisation<input value={organization} onChange={event => setOrganization(event.target.value)} maxLength={160} placeholder="Department or organisation" /></label>
          {status && <p className="account-status">{status}</p>}
          <div className="account-actions"><button type="button" className="secondary-button" onClick={() => void signOut()}><LogOut />Sign out</button><button className="primary-button" disabled={busy}><Save />{busy ? 'Saving…' : 'Save profile'}</button></div>
        </form>
      : <form className="account-form" onSubmit={submitEmail}>
          <label>Email address<div className="account-email"><Mail /><input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
          <p className="account-note">We’ll email you a one-time sign-in link. No password is stored by SatQuery.</p>
          {status && <p className="account-status">{status}</p>}
          <button className="primary-button account-submit" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
        </form>}
    </section>
  </div>
}
