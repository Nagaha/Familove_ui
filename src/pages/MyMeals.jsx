import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../api'
import { useAuth } from '../auth.jsx'
import { useFamilies } from '../family-context.jsx'
import { MealCard, MealDialog } from '../components/MealParts.jsx'
import { mealDay, parseISODate, sortMeals } from '../lib.js'

export default function MyMeals() {
  const { user } = useAuth()
  const { families } = useFamilies()
  const [meals, setMeals] = useState(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    try {
      setMeals((await get('/users/me/meals')).meals)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const days = new Map()
  for (const m of [...(meals ?? [])].sort(sortMeals)) {
    const key = mealDay(m)
    days.set(key, [...(days.get(key) ?? []), m])
  }
  const orderedDays = [...days.keys()].sort().reverse()
  const open = meals?.find((m) => m.id === openId)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My meals</h1>
          <p className="lead">Everything you’ve added, newest day first.</p>
        </div>
        <Link to="/meals/new" className="btn">Add a meal</Link>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {meals === null && !error && <p className="muted">Loading…</p>}
      {meals?.length === 0 && <p className="muted">You haven’t added any meals yet.</p>}

      {orderedDays.map((key) => (
        <section key={key} className="my-day">
          <h3>{parseISODate(key).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <div className="card-grid">
            {days.get(key).map((m) => <MealCard key={m.id} meal={m} who={user} onOpen={setOpenId} />)}
          </div>
        </section>
      ))}

      {open && (
        <MealDialog
          meal={open}
          byName={(id) => (id === user.id ? 'you' : 'a family member')}
          familyNames={open.familyIds.map((id) => families?.find((f) => f.id === id)?.familyName).filter(Boolean)}
          canEdit
          onClose={() => setOpenId(null)}
          onChanged={load}
        />
      )}
    </>
  )
}
