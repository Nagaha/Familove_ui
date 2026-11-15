import { useEffect, useRef, useState } from 'react'
import { del, patch } from '../api'
import { MEAL_TYPE_LABEL, STATUSES, STATUS_LABEL, formatTime, parseISODate, mealDay } from '../lib.js'
import Icon from './Icon.jsx'
import { Avatar } from './People.jsx'

export function StatusChip({ status }) {
  return <span className={`chip chip-${status}`}>{STATUS_LABEL[status]}</span>
}

export function MealCard({ meal, who, onOpen }) {
  const d = meal.mealDetails
  const [imgOk, setImgOk] = useState(true)
  const time = formatTime(d.scheduledTime)

  return (
    <button type="button" className={`meal-card type-${d.mealType}`} onClick={() => onOpen(meal.id)}>
      {d.imageUrl && imgOk ? (
        <img className="meal-card-img" src={d.imageUrl} alt="" onError={() => setImgOk(false)} />
      ) : (
        <span className="meal-card-img meal-card-blank">{MEAL_TYPE_LABEL[d.mealType]}</span>
      )}
      <span className="meal-card-name">{d.name}</span>
      <span className="meal-card-meta">
        {MEAL_TYPE_LABEL[d.mealType]}{time ? ` · ${time}` : ''}
      </span>
      <span className="meal-card-foot">
        <StatusChip status={d.status} />
        {who && <Avatar name={who.name} url={who.avatarUrl} size={22} />}
      </span>
    </button>
  )
}

export function MealDialog({ meal, byName, familyNames, canEdit, onClose, onChanged }) {
  const ref = useRef(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const d = meal.mealDetails

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const run = async (fn, closeAfter) => {
    setError('')
    setBusy(true)
    try {
      await fn()
      await onChanged()
      if (closeAfter) onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const day = parseISODate(mealDay(meal)).toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <div className="dialog-body">
        <button type="button" className="icon-btn dialog-x" onClick={onClose} aria-label="Close">
          <Icon name="x" />
        </button>

        {d.imageUrl && <img className="dialog-img" src={d.imageUrl} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />}

        <h2>{d.name}</h2>
        <p className="muted">
          {MEAL_TYPE_LABEL[d.mealType]} · {day}{d.scheduledTime ? ` · ${formatTime(d.scheduledTime)}` : ''}
        </p>
        {d.notes && <p className="dialog-notes">{d.notes}</p>}
        <p className="muted small">
          Added by {byName(meal.createdBy)}
          {familyNames.length > 0 && <> · visible to {familyNames.join(', ')}</>}
        </p>

        <h3>Status</h3>
        {canEdit ? (
          <div className="segmented" role="group" aria-label="Meal status">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={d.status === s ? 'on' : ''}
                aria-pressed={d.status === s}
                disabled={busy}
                onClick={() => d.status !== s && run(() => patch(`/meals/${meal.id}`, { mealDetails: { status: s } }))}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        ) : (
          <>
            <StatusChip status={d.status} />
            <p className="muted small">Only {byName(meal.createdBy)} can change this.</p>
          </>
        )}

        {error && <p className="error" role="alert">{error}</p>}

        {canEdit && (
          <button
            type="button"
            className="btn btn-quiet-danger"
            disabled={busy}
            onClick={() => window.confirm(`Delete “${d.name}” for every family?`) && run(() => del(`/meals/${meal.id}`), true)}
          >
            <Icon name="trash" size={16} /> Delete meal
          </button>
        )}
      </div>
    </dialog>
  )
}
