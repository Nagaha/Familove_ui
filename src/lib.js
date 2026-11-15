export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']
export const MEAL_TYPE_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }
const TYPE_ORDER = { breakfast: 0, lunch: 1, dinner: 2 }

// API status values and the words families actually use for them.
export const STATUSES = ['planned', 'prepared', 'finished']
export const STATUS_LABEL = { planned: 'Planned', prepared: 'Cooked', finished: 'Eaten' }

const pad = (n) => String(n).padStart(2, '0')

// Dates are handled as local "YYYY-MM-DD" strings. The API stores them as UTC
// midnight, so a meal's day is simply the first 10 characters of its date.
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parseISODate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d, n) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() + n)
  return x
}

export const startOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7)) // Monday

export const mealDay = (meal) => meal.mealDetails.date.slice(0, 10)

export const formatTime = (hhmm) => {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
}

export const sortMeals = (a, b) =>
  TYPE_ORDER[a.mealDetails.mealType] - TYPE_ORDER[b.mealDetails.mealType] ||
  (a.mealDetails.scheduledTime ?? '').localeCompare(b.mealDetails.scheduledTime ?? '')

export const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

// The meal people are most likely thinking about right now.
export const defaultMealType = () => {
  const h = new Date().getHours()
  return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : 'dinner'
}

export const timeAgo = (iso) => {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return days < 7 ? `${days} d ago` : new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export const firstName = (name) => (name || '').trim().split(/\s+/)[0]

const AVATAR_COLORS = ['#3f8a5f', '#e8725c', '#c99a2e', '#5a7fa3', '#8b6bb0', '#2f7f7a']

export const colorFor = (seed = '') => {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
