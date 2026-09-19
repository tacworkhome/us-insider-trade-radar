import { abbreviateInsiderRole } from './format'

/** Short role code map for common titles, checked before the generic abbreviator. */
const ROLE_MAP: Array<[RegExp, string]> = [
  [/chief executive officer|^ceo$/i, 'CEO'],
  [/chief financial officer|^cfo$/i, 'CFO'],
  [/chief operating officer|^coo$/i, 'COO'],
  [/^director$/i, 'Director'],
  [/10% owner/i, '10% Owner'],
]

/** Abbreviate a raw title string to a short display role (e.g. "CEO", "Director"). */
export function abbreviateRole(title: string | null | undefined): string {
  if (!title) return ''
  for (const [pattern, abbr] of ROLE_MAP) {
    if (pattern.test(title)) return abbr
  }
  return abbreviateInsiderRole(title)
}

const ROLE_COLOR_CLASSES: Record<string, string> = {
  ceo: 'bg-purple-500/10 text-purple-300 ring-purple-500/30',
  cfo: 'bg-blue-500/10 text-blue-300 ring-blue-500/30',
  director: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  officer: 'bg-teal-500/10 text-teal-300 ring-teal-500/30',
  default: 'bg-gray-500/10 text-gray-300 ring-gray-500/30',
}

function getRoleKey(role: string | null | undefined): string {
  if (!role) return 'default'
  const r = role.toLowerCase()
  if (r === 'ceo') return 'ceo'
  if (r === 'cfo') return 'cfo'
  if (r.includes('director')) return 'director'
  if (r.includes('officer')) return 'officer'
  return 'default'
}

/** Tailwind ring/text/bg classes for a role badge, keyed by role label. */
export function getRoleColor(role: string | null | undefined): string {
  const key = getRoleKey(role)
  return ROLE_COLOR_CLASSES[key] ?? ROLE_COLOR_CLASSES.default!
}
