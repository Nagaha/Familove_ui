import { colorFor } from '../lib.js'

export function Avatar({ name = '?', url, size = 36 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 }
  if (url) {
    return <img className="avatar" style={style} src={url} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
  }
  return (
    <span className="avatar" style={{ ...style, background: colorFor(name) }} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

export function AvatarStack({ people, size = 24 }) {
  return (
    <span className="avatar-stack">
      {people.map((p) => (
        <Avatar key={p.id} name={p.name} url={p.avatarUrl} size={size} />
      ))}
    </span>
  )
}
