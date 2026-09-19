/**
 * Insider trade types shared between chart and table components.
 */

/** A single insider trade for chart markers and lane cards */
export interface InsiderTrade {
  id?: string
  date: string // YYYY-MM-DD
  ownerName: string
  ownerTitle: string
  ownerCik: string
  displayRole: string
  type: 'Buy' | 'Sell'
  transactionCode?: string
  shares: number
  pricePerShare: number
  totalValue: number
  isTenPercentOwner?: boolean
  isDirector?: boolean
  isOfficer?: boolean
  isOther?: boolean
}

/** Raw transaction fields (snake_case), matching the mock data fixtures */
export interface RawTransaction {
  id: string
  filing_date: string
  owner_cik: string
  owner_name: string
  officer_title: string
  is_director: number
  is_officer: number
  is_ten_percent_owner: number
  is_other: number
  acquired_disposed_code: string
  transaction_code: string | null
  shares_amount: number
  price_per_share: number
  transaction_value: number | null
  transaction_date: string
  display_role?: string
}

/** One point of daily OHLCV stock history, used by the price chart */
export interface StockHistoryPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type HistoryRange = '1w' | '1m' | '3m' | '6m' | '1y'
