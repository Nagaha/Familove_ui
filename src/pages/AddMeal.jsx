import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { post } from '../api'
import { useFamilies } from '../family-context.jsx'
import { MEAL_TYPES, MEAL_TYPE_LABEL, defaultMealType, toISODate } from '../lib.js'

export default function AddMeal() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { families, current } = useFamilies()

  const [name, setName] = useState('')
  const [mealType, setMealType] = useState(() => (MEAL_TYPES.includes(params.get('type')) ? params.get('type') : defaultMealType()))
  const [date, setDate] = useState(params.get('date') || toISODate(new Date()))
  const [time, setTime] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [shareWith, setShareWith] = useState(current ? [current.id] : [])
  const [imgOk, setImgOk] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (families === null) return <p className="muted">Loading…</p>
  if (!current) {
    return (
      <>
        <h1>Add a meal</h1>
        <p className="lead">You need a family first. <Link to="/">Start or join one</Link>.</p>
      </>
    )
  }

  const toggle = (id) => setShareWith((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (shareWith.length === 0) {
      setError('Choose at least one family to share with.')
      return
    }
    setBusy(true)
    try {
      const mealDetails = { name, mealType, date }
      if (time) mealDetails.scheduledTime = time
      if (imageUrl.trim()) mealDetails.imageUrl = imageUrl.trim()
      if (notes.trim()) mealDetails.notes = notes
      await post('/meals', { familyIds: shareWith, mealDetails })
      navigate(`/?date=${date}&type=${mealType}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <>
      <p className="crumb"><Link to="/">← Back</Link></p>
      <h1>Add a meal</h1>

      <form className="card stack form-card" onSubmit={submit}>
        <label>
          What’s on the menu?
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={150} placeholder="Vegetable pasta" autoFocus />
        </label>

        <fieldset>
          <legend>Which meal?</legend>
          <div className="segmented">
            {MEAL_TYPES.map((t) => (
              <label key={t} className={mealType === t ? 'on' : ''}>
                <input type="radio" name="mealType" value={t} checked={mealType === t} onChange={() => setMealType(t)} />
                {MEAL_TYPE_LABEL[t]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="inline">
          <label>
            Day
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            <span>Time <span className="muted">(optional)</span></span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>

        <label>
          <span>Photo link <span className="muted">(optional)</span></span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => { setImageUrl(e.target.value); setImgOk(true) }}
            placeholder="https://…"
          />
        </label>
        {imageUrl.trim() && imgOk && (
          <img className="preview" src={imageUrl.trim()} alt="Meal preview" onError={() => setImgOk(false)} />
        )}

        <label>
          <span>Notes <span className="muted">(optional)</span></span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} placeholder="Less spicy for the kids" />
        </label>

        {families.length > 1 && (
          <fieldset>
            <legend>Share with</legend>
            <div className="pick-row">
              {families.map((f) => (
                <label key={f.id} className={`pick${shareWith.includes(f.id) ? ' on' : ''}`}>
                  <input type="checkbox" checked={shareWith.includes(f.id)} onChange={() => toggle(f.id)} />
                  {f.familyName}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save meal'}</button>
          <Link to="/" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </>
  )
}
