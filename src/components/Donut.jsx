import { Avatar } from './People.jsx'

const R = 40
const C = 2 * Math.PI * R

// A ring split by group size, with a legend that names the members in each group.
// groups: [{ key, label, members: [{ userId, name, avatarUrl }] }]
export default function Donut({ groups, centerNumber, centerCaption }) {
  const total = groups.reduce((sum, g) => sum + g.members.length, 0)
  let offset = 0

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut" role="img" aria-label={`${centerNumber} ${centerCaption}`}>
        <circle cx="50" cy="50" r={R} className="donut-track" />
        {total > 0 && groups.map((g) => {
          const len = (g.members.length / total) * C
          const el = g.members.length > 0 && (
            <circle
              key={g.key}
              cx="50" cy="50" r={R}
              className={`donut-seg seg-${g.key}`}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          )
          offset += len
          return el
        })}
        <text x="50" y="50" textAnchor="middle" className="donut-num">{centerNumber}</text>
        <text x="50" y="63" textAnchor="middle" className="donut-cap">{centerCaption}</text>
      </svg>

      <ul className="legend">
        {groups.map((g) => (
          <li key={g.key}>
            <span className="legend-title">
              <span className={`dot dot-${g.key}`} />
              {g.label}
              <b>{g.members.length}</b>
            </span>
            {g.members.length > 0 ? (
              <span className="legend-people">
                {g.members.map((m) => (
                  <span key={m.userId} className="legend-person">
                    <Avatar name={m.name} url={m.avatarUrl} size={20} />
                    {m.name.split(' ')[0]}
                  </span>
                ))}
              </span>
            ) : (
              <span className="muted small legend-none">Nobody</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
