import { useCallback, useEffect, useState } from 'react'
import { del, get, post } from '../api'
import { useAuth } from '../auth.jsx'
import { useFamilies } from '../family-context.jsx'
import Icon from '../components/Icon.jsx'
import { Avatar } from '../components/People.jsx'
import FamilyStart from '../components/FamilyStart.jsx'
import { copyText } from '../lib.js'

export default function FamilyPage() {
  const { user } = useAuth()
  const { families, current, reload } = useFamilies()
  const [members, setMembers] = useState([])
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [showStart, setShowStart] = useState(false)

  const familyId = current?.id

  const loadMembers = useCallback(async () => {
    if (!familyId) return
    try {
      const data = await get(`/families/${familyId}/members`)
      setMembers(data.members)
    } catch (err) {
      setError(err.message)
    }
  }, [familyId])

  // Switching family clears any message from the previous one.
  useEffect(() => {
    loadMembers()
    setNote('')
    setError('')
  }, [loadMembers])

  useEffect(() => {
    setCode(current?.invitationCode ?? '')
  }, [current?.invitationCode])

  if (families === null) return <p className="muted">Loading…</p>

  if (!current) {
    return (
      <>
        <h1>Family</h1>
        <FamilyStart />
      </>
    )
  }

  const isOwner = current.ownerId === user.id

  const act = async (fn, message) => {
    setError('')
    setNote('')
    try {
      await fn()
      if (message) setNote(message)
    } catch (err) {
      setError(err.message)
    }
  }

  const copy = async () => setNote((await copyText(code)) ? 'Code copied' : 'Could not copy — select the code and copy it')

  const share = async () => {
    const text = `Join our family “${current.familyName}” on Familove. Invite code: ${code}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Join our family on Familove', text }) } catch { /* cancelled */ }
    } else {
      setNote((await copyText(text)) ? 'Invite message copied' : 'Could not copy the invite message')
    }
  }

  return (
    <>
      <h1>{current.familyName}</h1>
      {error && <p className="error" role="alert">{error}</p>}
      {note && <p className="note" role="status">{note}</p>}

      <section className="card invite">
        <h2>Invite someone</h2>
        <p className="muted">Share this code. Anyone who has it can join your family.</p>
        <div className="invite-row">
          <code className="invite-code">{code}</code>
          <button type="button" className="btn btn-outline btn-small" onClick={copy}><Icon name="copy" size={16} /> Copy</button>
          <button type="button" className="btn btn-small" onClick={share}><Icon name="share" size={16} /> Share</button>
        </div>
        {isOwner && (
          <button
            type="button"
            className="link-small"
            onClick={() => act(async () => {
              const data = await post(`/families/${familyId}/invitations`)
              setCode(data.invitationCode)
              await reload()
            }, 'New code created. The old one no longer works.')}
          >
            Make a new code
          </button>
        )}
      </section>

      <section className="card">
        <h2>Members</h2>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.userId}>
              <Avatar name={m.name} url={m.avatarUrl} size={42} />
              <span className="grow">
                <b>{m.name}{m.userId === user.id ? ' (you)' : ''}</b>
                <span className="muted small block">{m.role === 'OWNER' ? 'Owner' : m.email}</span>
              </span>
              {isOwner && m.role !== 'OWNER' && (
                <button
                  type="button"
                  className="btn btn-small btn-quiet-danger"
                  onClick={() => window.confirm(`Remove ${m.name} from the family?`) &&
                    act(async () => { await del(`/families/${familyId}/members/${m.userId}`); await loadMembers() }, `${m.name} was removed`)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>More families</h2>
        {showStart ? (
          <FamilyStart onDone={() => setShowStart(false)} />
        ) : (
          <>
            <p className="muted">You can belong to several families, for example your own and your parents’.</p>
            <button type="button" className="btn btn-outline" onClick={() => setShowStart(true)}>Start or join another</button>
          </>
        )}
      </section>

      <section className="card">
        <h2>{isOwner ? 'Delete this family' : 'Leave this family'}</h2>
        <p className="muted">
          {isOwner
            ? 'Everyone loses access to this family’s meals. This can’t be undone.'
            : 'You will stop seeing this family’s meals. You can rejoin with a code.'}
        </p>
        <button
          type="button"
          className="btn btn-quiet-danger"
          onClick={() => window.confirm(isOwner ? `Delete “${current.familyName}”?` : `Leave “${current.familyName}”?`) &&
            act(async () => {
              await del(isOwner ? `/families/${familyId}` : `/families/${familyId}/membership`)
              await reload()
            })}
        >
          {isOwner ? 'Delete family' : 'Leave family'}
        </button>
      </section>
    </>
  )
}
