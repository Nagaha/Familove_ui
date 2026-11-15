import { useState } from 'react'

const KEY = 'familove.theme'

// index.html sets data-theme before first paint if the user chose one earlier.
// With no choice the CSS follows the system setting.
const current = () =>
  document.documentElement.dataset.theme ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export function useTheme() {
  const [theme, setTheme] = useState(current)

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem(KEY, next) } catch { /* private mode: the choice just won't persist */ }
    setTheme(next)
  }

  return { theme, toggle }
}
