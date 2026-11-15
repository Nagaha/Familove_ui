import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { Logo } from '../components/Icon.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Login({ mode }) {
  const { login, register } = useAuth()
  const isRegister = mode === 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isRegister) await register(name, email, password)
      else await login(email, password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo size={56} />
        <h1>Familove</h1>
        <p>Plan the week’s meals together and see at a glance who has eaten.</p>
        <ul>
          <li>One shared table for the whole family</li>
          <li>Plan breakfast, lunch and dinner</li>
          <li>Share meals with more than one family</li>
        </ul>
      </aside>

      <div className="auth-form">
        <ThemeToggle className="auth-theme" />
        <form onSubmit={submit} className="stack">
          <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          {isRegister && (
            <label>
              Your name
              <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            {isRegister && <span className="muted small">At least 8 characters.</span>}
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'One moment…' : isRegister ? 'Create account' : 'Log in'}
          </button>
          <p className="muted">
            {isRegister ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New to Familove? <Link to="/register">Create an account</Link></>}
          </p>
        </form>
      </div>
    </div>
  )
}
