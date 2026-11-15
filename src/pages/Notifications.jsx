import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamilies } from '../family-context.jsx'
import { useNotifications } from '../notifications-context.jsx'
import { Avatar } from '../components/People.jsx'
import { MEAL_TYPE_LABEL, parseISODate, timeAgo } from '../lib.js'

export default function Notifications() {
  const navigate = useNavigate()
  const { families, select } = useFamilies()
  const { items, unread, loaded, markRead, markAllRead } = useNotifications()
  const [error, setError] = useState('')

  // Opens the dashboard on the day and meal the notification is about.
  const open = (n) => {
    if (!n.read) markRead(n.id)
    const family = families?.find((f) => n.familyIds.includes(f.id))
    if (family) select(family.id)
    navigate(`/?date=${n.mealDate}&type=${n.mealType}`)
  }

  const readAll = async () => {
    setError('')
    try {
      await markAllRead()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <p className="lead">{unread > 0 ? `${unread} new` : 'You’re all caught up.'}</p>
        </div>
        <button type="button" className="btn btn-outline" disabled={unread === 0} onClick={readAll}>
          Mark all as read
        </button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {!loaded ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card">
          <p>Nothing yet.</p>
          <p className="muted">When someone in your family adds a meal, you’ll see it here.</p>
        </div>
      ) : (
        <ul className="notes">
          {items.map((n) => (
            <li key={n.id}>
              <button type="button" className={`note-item${n.read ? '' : ' unread'}`} onClick={() => open(n)}>
                <Avatar name={n.actor.name} size={40} />
                <span className="note-body">
                  <span className="note-text">
                    <b>{n.actor.name}</b> added their {MEAL_TYPE_LABEL[n.mealType].toLowerCase()}: {n.mealName}
                  </span>
                  <span className="muted small">
                    For {parseISODate(n.mealDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · {timeAgo(n.createdAt)}
                  </span>
                </span>
                {!n.read && <span className="unread-dot" aria-label="Unread" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
