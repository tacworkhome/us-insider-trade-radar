/**
 * Insider trade utilities — converts raw (snake_case) transaction rows into
 * chart-ready InsiderTrade objects, and sizes chart markers by insider role.
 */
import type { InsiderTrade, RawTransaction } from '../types/insider-trade'
import { getTopRole } from './format'
import { abbreviateRole } from './role'

export function getRangeDays(range: string): number {
  switch (range) {
    case '1w': return 7
    case '1m': return 30
    case '3m': return 90
    case '6m': return 180
    case '1y': return 365
    default: return 90
  }
}

/** Convert raw rows to InsiderTrade objects, filtered by date range, sorted ascending. */
export function convertToInsiderTrades(transactions: RawTransaction[], days: number): InsiderTrade[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return transactions
    .filter((tx) => new Date(tx.transaction_date) >= cutoffDate)
    .map((tx) => ({
      id: tx.id,
      date: new Date(tx.transaction_date).toISOString().split('T')[0]!,
      ownerName: tx.owner_name,
      ownerTitle: tx.officer_title || '',
      ownerCik: tx.owner_cik,
      displayRole: abbreviateRole(getTopRole({
        isOfficer: tx.is_officer,
        isDirector: tx.is_director,
        isTenPercentOwner: tx.is_ten_percent_owner,
        officerTitle: tx.officer_title,
      })),
      type: (tx.acquired_disposed_code === 'A' ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
      transactionCode: tx.transaction_code ?? tx.acquired_disposed_code,
      shares: tx.shares_amount,
      pricePerShare: tx.price_per_share,
      totalValue: tx.transaction_value || tx.shares_amount * tx.price_per_share,
      isTenPercentOwner: tx.is_ten_percent_owner === 1,
      isDirector: tx.is_director === 1,
      isOfficer: tx.is_officer === 1,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Marker sizes indexed by insider role priority. */
export const INSIDER_ROLE_MARKER_SIZES = {
  tenPercentOwner: 1.8,
  director: 1.8,
  officer: 1.8,
  other: 1.8,
} as const

/** Priority: 10% Owner > Director > Officer > Other */
export function getInsiderMarkerSize(marker: {
  isTenPercentOwner?: boolean
  isDirector?: boolean
  isOfficer?: boolean
}): number {
  if (marker.isTenPercentOwner) return INSIDER_ROLE_MARKER_SIZES.tenPercentOwner
  if (marker.isDirector) return INSIDER_ROLE_MARKER_SIZES.director
  if (marker.isOfficer) return INSIDER_ROLE_MARKER_SIZES.officer
  return INSIDER_ROLE_MARKER_SIZES.other
}
