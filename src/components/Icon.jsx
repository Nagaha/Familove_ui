const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  users: 'M2.5 20c0-3.600 2.900-6 6.500-6s6.500 2.400 6.500 6M16 4.600a3.500 3.500 0 010 6.800M18 14.300c2.200.700 3.500 2.600 3.500 5.700',
  calendar: 'M3 10h18M8 3v4M16 3v4',
  meals: 'M7 3v8M4 3v5a3 3 0 006 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10',
  user: 'M4 21c0-4 3.600-6 8-6s8 2 8 6',
  plus: 'M12 5v14M5 12h14',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  copy: 'M5 15V5a2 2 0 012-2h8',
  share: 'M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M12 16V3M7 8l5-5 5 5',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5 9-10',
  bell: 'M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0',
  sun: 'M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400',
  moon: 'M21 12.800A9 9 0 1111.200 3a7 7 0 009.800 9.800z',
}

// Extra shapes some icons need besides the main path.
const EXTRA = {
  users: <circle cx="9" cy="8" r="3.500" />,
  calendar: <rect x="3" y="5" width="18" height="16" rx="2" />,
  user: <circle cx="12" cy="8" r="4" />,
  sun: <circle cx="12" cy="12" r="4" />,
  copy: <rect x="9" y="9" width="11" height="11" rx="2" />,
}

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {EXTRA[name]}
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#1b4d3a" />
      <path d="M12 38h40c0 9-9 16-20 16S12 47 12 38z" fill="#fbf8f1" />
      <path d="M32 38V25" stroke="#fbf8f1" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 29C32 21 26 15.500 17.500 15.500c0 8.500 5.500 13.500 14.500 13.500z" fill="#9cc5a6" />
      <path d="M32 25c0-7.500 5-12.500 13.500-12.500 0 8.500-5 12.500-13.500 12.500z" fill="#d7efdc" />
      <circle cx="45" cy="45" r="4" fill="#e8725c" />
    </svg>
  )
}
