import { useState } from 'react'
import { post } from '../api'
import { useFamilies } from '../family-context.jsx'

// Create-or-join forms. Used for first-time users and for adding another family.
export default function FamilyStart({ onDone }) {
  const { reload, select } = useFamilies()
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const finish = async (family) => {
    await reload()
    select(family.id)
    onDone?.(family)
  }

  const submit = (fn) => async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="start-grid">
        <form className="card stack" onSubmit={submit(async () => finish((await post('/families', { familyName })).family))}>
          <h2>Start a family</h2>
          <p className="muted">Give it a name, then share the invite code with the others.</p>
          <label>
            Family name
            <input value={familyName} onChange={(e) => setFamilyName(e.target.value)} required maxLength={100} placeholder="The Sharmas" />
          </label>
          <button type="submit" className="btn" disabled={busy}>Create family</button>
        </form>

        <form className="card stack" onSubmit={submit(async () => finish((await post('/families/join', { inviteCode })).family))}>
          <h2>Join with a code</h2>
          <p className="muted">Ask the person who started the family for their invite code.</p>
          <label>
            Invite code
            <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required minLength={6} className="code-input" placeholder="A1B2C3D4E5F6" />
          </label>
          <button type="submit" className="btn btn-outline" disabled={busy}>Join family</button>
        </form>
      </div>
    </>
  )
}
