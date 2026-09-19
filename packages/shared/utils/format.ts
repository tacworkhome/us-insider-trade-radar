/**
 * Formatting utilities shared across the app.
 */

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatCurrency(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return '-'
  }
}

/** Compact number formatter for table/card cells — e.g. 12500 -> "12.5K" */
export function formatCompactValue(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}${parseFloat((abs / 1_000_000).toFixed(2))}M`
  if (abs >= 1_000) return `${sign}${parseFloat((abs / 1_000).toFixed(2))}K`
  return `${value}`
}

/** Compact USD formatter for narrative copy — e.g. 12500000 -> "$12.5M" */
export function formatCompactUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

/**
 * Return the single most significant insider role label.
 * Priority: officer title > Director > Officer > 10% Owner > Other > ''
 * Accepts numeric flags (0/1, as they arrive from a raw DB row) or booleans.
 */
export function getTopRole(flags: {
  isOfficer?: boolean | number | null
  isDirector?: boolean | number | null
  isTenPercentOwner?: boolean | number | null
  isOther?: boolean | number | null
  officerTitle?: string | null
}): string {
  if (flags.isOfficer && flags.officerTitle) return abbreviateInsiderRole(flags.officerTitle)
  if (flags.isDirector) return 'Director'
  if (flags.isOfficer) return 'Officer'
  if (flags.isTenPercentOwner) return '10% Owner'
  if (flags.isOther) return 'Other'
  return ''
}

/**
 * Abbreviate long insider role titles to short forms
 * (e.g. "Chief Executive Officer" -> "CEO", "Senior Vice President" -> "SVP").
 */
export function abbreviateInsiderRole(title: string): string {
  const t = title.toLowerCase()

  const chiefMatch = t.match(/chief\s+(.+?)\s+officer/)
  if (chiefMatch) {
    const initials = chiefMatch[1]!.trim().split(/\s+/).map((w) => w[0]!.toUpperCase()).join('')
    return `C${initials}O`
  }

  const csuiteToken = t.match(/\b(ce[o]|cf[o]|co[o]|ct[o]|cm[o]|ci[o]|cl[o]|cr[o]|ca[o]|chro|cdo|cpo|cso|cco)\b/)
  if (csuiteToken) return csuiteToken[1]!.toUpperCase()

  if (t.includes('executive vice president')) return 'EVP'
  if (t.includes('senior vice president')) return 'SVP'
  if (t.includes('vice president')) return 'VP'
  if (/\bevp\b/.test(t)) return 'EVP'
  if (/\bsvp\b/.test(t)) return 'SVP'
  if (/\bvp\b/.test(t)) return 'VP'

  if (t.includes('chairman') || t.includes('chairwoman') || t.includes('chairperson')) return 'Chairman'
  if (t.includes('president')) return 'President'

  const chiefFallback = t.match(/\bchief\s+(\w+)/)
  if (chiefFallback) return 'C' + chiefFallback[1]![0]!.toUpperCase() + 'O'

  return title.replace(/-/g, '')
}

/** Transaction code -> { label, color } used by tables that show Buy/Sell badges */
export function getTransactionCodeInfo(code: string): { label: string; color: string } {
  switch (code) {
    case 'P':
      return { label: 'Buy', color: 'text-green-400' }
    case 'S':
      return { label: 'Sell', color: 'text-red-400' }
    case 'A':
      return { label: 'Award', color: 'text-blue-400' }
    case 'M':
      return { label: 'Option Exercise', color: 'text-purple-400' }
    default:
      return { label: code, color: 'text-gray-400' }
  }
}
