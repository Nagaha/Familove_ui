import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { get, patch, post } from './api'

const NotificationContext = createContext(null)

export const useNotifications = () => useContext(NotificationContext)

const POLL_MS = 15000

// In-app notifications are fetched on a timer (and when the tab regains focus),
// so a new one shows up within a few seconds without a page reload.
export function NotificationProvider({ children }) {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const data = await get('/notifications?limit=30')
      setItems(data.notifications)
      setUnread(data.unreadCount)
      setLoaded(true)
    } catch {
      // Try again on the next poll; a failed check shouldn't interrupt the page.
    }
  }, [])

  useEffect(() => {
    refresh()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  // Shows the count in the browser tab, like "(2) Familove".
  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) Familove` : 'Familove'
    return () => { document.title = 'Familove' }
  }, [unread])

  const markRead = useCallback(async (id) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnread((count) => Math.max(0, count - 1))
    try {
      await patch(`/notifications/${id}/read`)
    } catch {
      refresh() // put the real state back if that failed
    }
  }, [refresh])

  const markAllRead = useCallback(async () => {
    await post('/notifications/read-all')
    await refresh()
  }, [refresh])

  return (
    <NotificationContext.Provider value={{ items, unread, loaded, refresh, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}
