import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { get, patch } from '../api'
import { useAuth } from '../auth.jsx'
import { useFamilies } from '../family-context.jsx'
import Icon from '../components/Icon.jsx'
import { Avatar } from '../components/People.jsx'
import Donut from '../components/Donut.jsx'
import FamilyStart from '../components/FamilyStart.jsx'
import { MealDialog, StatusChip } from '../components/MealParts.jsx'
import {
  MEAL_TYPES, MEAL_TYPE_LABEL, addDays, defaultMealType, firstName, formatTime,
  greeting, parseISODate, sortMeals, toISODate,
} from '../lib.js'

const GROUP_LABEL = { eaten: 'Eaten', pending: 'Not eaten yet', none: 'Not added yet' }

// What a member has for one meal: nothing added, added but not all eaten, or all eaten.
const stateOf = (meals) =>
  meals.length === 0 ? 'none' : meals.every((m) => m.mealDetails.status === 'finished') ? 'eaten' : 'pending'

function Welcome() {
  return (
    <>
      <h1>Welcome to Familove</h1>
      <p className="lead">Start by creating your family, or join one that already exists.</p>
      <FamilyStart />
    </>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { families, current } = useFamilies()

  // After adding a meal we come back here showing the day and meal it was added to.
  const [params] = useSearchParams()
  const todayKey = toISODate(new Date())
  const [day, setDay] = useState(() => (/^\d{4}-\d{2}-\d{2}$/.test(params.get('date') ?? '') ? params.get('date') : todayKey))
  const [type, setType] = useState(() => (MEAL_TYPES.includes(params.get('type')) ? params.get('type') : defaultMealType()))
  const [meals, setMeals] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)
  const latest = useRef(0)

  const familyId = current?.id

  // Only the newest request may write state, so quick day changes can't show stale data.
  const load = useCallback(async () => {
    if (!familyId) return
    const id = ++latest.current
    try {
      const [m, ml] = await Promise.all([
        get(`/families/${familyId}/members`),
        get(`/meals?familyId=${familyId}&from=${day}&to=${day}`),
      ])
      if (id !== latest.current) return
      setMembers(m.members)
      setMeals(ml.meals)
      setError('')
    } catch (err) {
      if (id === latest.current) setError(err.message)
    } finally {
      if (id === latest.current) setLoading(false)
    }
  }, [familyId, day])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  // Everyone's meal for each type on the selected day. You are listed first.
  const board = useMemo(() => {
    const ordered = [...members].sort((a, b) =>
      (b.userId === user.id) - (a.userId === user.id) || a.name.localeCompare(b.name))
    const result = {}
    for (const t of MEAL_TYPES) {
      result[t] = ordered.map((member) => {
        const own = meals
          .filter((m) => m.createdBy === member.userId && m.mealDetails.mealType === t)
          .sort(sortMeals)
        return { member, meals: own, state: stateOf(own) }
      })
    }
    return result
  }, [members, meals, user.id])

  if (families === null) return <p className="muted">Loading…</p>
  if (!current) return <Welcome />

  const rows = board[type]
  const groups = ['eaten', 'pending', 'none'].map((key) => ({
    key,
    label: GROUP_LABEL[key],
    members: rows.filter((r) => r.state === key).map((r) => r.member),
  }))
  const eatenCount = (t) => board[t].filter((r) => r.state === 'eaten').length

  const isToday = day === todayKey
  const dayDate = parseISODate(day)
  const open = meals.find((m) => m.id === openId)
  const nameOf = (id) => (id === user.id ? 'you' : members.find((m) => m.userId === id)?.name ?? 'a family member')

  const markEaten = async (meal) => {
    try {
      await patch(`/meals/${meal.id}`, { mealDetails: { status: 'finished' } })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{greeting()}, {firstName(user.name)}</h1>
          <p className="lead">Who has eaten at the {current.familyName} table.</p>
        </div>
        <Link to={`/meals/new?date=${day}&type=${type}`} className="btn"><Icon name="plus" size={18} /> Add a meal</Link>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="tabs" role="tablist" aria-label="Meal">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={type === t}
            className={`tab${type === t ? ' on' : ''}`}
            onClick={() => setType(t)}
          >
            <span className="tab-name">{MEAL_TYPE_LABEL[t]}</span>
            <span className="tab-count">{eatenCount(t)} of {members.length} eaten</span>
          </button>
        ))}
      </div>

      <div className="daybar">
        <button type="button" className="icon-btn" aria-label="Previous day" onClick={() => setDay(toISODate(addDays(dayDate, -1)))}>
          <Icon name="left" />
        </button>
        <div className="daybar-date">
          <b>{dayDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</b>
          <span className="muted small">{isToday ? 'Today' : dayDate.getFullYear()}</span>
        </div>
        <button type="button" className="icon-btn" aria-label="Next day" onClick={() => setDay(toISODate(addDays(dayDate, 1)))}>
          <Icon name="right" />
        </button>
        <button type="button" className="btn btn-small btn-outline" disabled={isToday} onClick={() => setDay(todayKey)}>
          Today
        </button>
      </div>

      <div className="two-up">
        <section className={`card board${loading ? ' is-loading' : ''}`} aria-label={`${MEAL_TYPE_LABEL[type]} for each member`}>
          <h2>{MEAL_TYPE_LABEL[type]}</h2>
          <ul className="member-meals">
            {rows.map(({ member, meals: own, state }) => {
              const mine = member.userId === user.id
              return (
                <li key={member.userId} className={`member-row state-${state}`}>
                  <Avatar name={member.name} url={member.avatarUrl} size={40} />
                  <div className="member-row-main">
                    <b>{mine ? 'You' : member.name}</b>
                    {state === 'none' ? (
                      <span className="not-added">Not yet added</span>
                    ) : (
                      own.map((m) => (
                        <button key={m.id} type="button" className="dish" onClick={() => setOpenId(m.id)}>
                          <span className="dish-name">{m.mealDetails.name}</span>
                          {m.mealDetails.scheduledTime && <span className="muted small">{formatTime(m.mealDetails.scheduledTime)}</span>}
                          <StatusChip status={m.mealDetails.status} />
                        </button>
                      ))
                    )}
                  </div>
                  {mine && state === 'none' && (
                    <Link to={`/meals/new?date=${day}&type=${type}`} className="btn btn-small">Add</Link>
                  )}
                  {mine && state === 'pending' && (
                    <button type="button" className="btn btn-small" onClick={() => markEaten(own.find((m) => m.mealDetails.status !== 'finished'))}>
                      Mark eaten
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="card">
          <h2>Who has eaten</h2>
          <p className="muted small">{MEAL_TYPE_LABEL[type]} · {isToday ? 'today' : dayDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
          <Donut groups={groups} centerNumber={`${groups[0].members.length}/${members.length}`} centerCaption="eaten" />
        </section>
      </div>

      {open && (
        <MealDialog
          meal={open}
          byName={nameOf}
          familyNames={open.familyIds.map((id) => families.find((f) => f.id === id)?.familyName).filter(Boolean)}
          canEdit={open.createdBy === user.id}
          onClose={() => setOpenId(null)}
          onChanged={load}
        />
      )}
    </>
  )
}

