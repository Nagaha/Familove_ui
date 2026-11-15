import { useState } from 'react'
import { patch, post } from '../api'
import { useAuth } from '../auth.jsx'
import { Avatar } from '../components/People.jsx'

export default function Profile() {
  const { user, reloadUser, logout } = useAuth()
  const [name, setName] = useState(user.name)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '')
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setNote('')
    try {
      await patch('/users/me', { name, avatarUrl })
      await reloadUser()
      setNote('Saved')
    } catch (err) {
      setError(err.message)
    }
  }

  const logoutEverywhere = async () => {
    try {
      await post('/auth/logout-all')
    } finally {
      await logout()
    }
  }

  return (
    <>
      <h1>Profile</h1>
      <section className="card profile-head">
        <Avatar name={user.name} url={user.avatarUrl} size={72} />
        <div>
          <b className="big">{user.name}</b>
          <span className="muted block">{user.email}</span>
        </div>
      </section>

      <form onSubmit={save} className="card stack form-card">
        <h2>Your details</h2>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
        </label>
        <label>
          <span>Picture link <span className="muted">(optional)</span></span>
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        {note && <p className="note" role="status">{note}</p>}
        <div className="actions">
          <button type="submit" className="btn">Save</button>
        </div>
      </form>

      <section className="card">
        <h2>Sign out</h2>
        <div className="actions">
          <button type="button" className="btn btn-outline" onClick={logout}>Log out</button>
          <button type="button" className="btn btn-quiet-danger" onClick={logoutEverywhere}>Log out of all devices</button>
        </div>
      </section>
    </>
  )
}
