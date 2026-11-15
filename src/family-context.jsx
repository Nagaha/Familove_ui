import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { get } from './api'
import { useAuth } from './auth.jsx'

const FamilyContext = createContext(null)

export const useFamilies = () => useContext(FamilyContext)

const KEY = 'familove.family'

const readSaved = () => {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function FamilyProvider({ children }) {
  const { user } = useAuth()
  const [families, setFamilies] = useState(null)
  const [currentId, setCurrentId] = useState(readSaved)

  const reload = useCallback(async () => {
    const data = await get('/families')
    setFamilies(data.families)
    return data.families
  }, [])

  useEffect(() => {
    if (!user) return
    reload().catch(() => setFamilies([]))
  }, [user, reload])

  const select = useCallback((id) => {
    setCurrentId(id)
    try { localStorage.setItem(KEY, id) } catch { /* private mode: selection just won't persist */ }
  }, [])

  // Falls back to the first family if the saved one is gone (left, deleted).
  const current = families?.find((f) => f.id === currentId) ?? families?.[0] ?? null

  return (
    <FamilyContext.Provider value={{ families, current, select, reload }}>
      {children}
    </FamilyContext.Provider>
  )
}
