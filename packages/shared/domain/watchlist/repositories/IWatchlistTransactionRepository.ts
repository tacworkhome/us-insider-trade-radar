export interface WatchlistLatestTransactionRaw {
  watchlist_id: string
  watchlist_name: string
  id: string
  filing_date: string | null
  transaction_date: string | null
  issuer_cik: string
  issuer_name: string
  issuer_trading_symbol: string
  owner_cik: string
  owner_name: string
  officer_title: string | null
  is_director: number
  is_officer: number
  is_ten_percent_owner: number
  is_other: number
  transaction_code: string | null
  acquired_disposed_code: string
  shares_amount: number
  price_per_share: number
  transaction_value: number | null
}

export interface IWatchlistTransactionRepository {
  getLatestTransactions(watchType: string): Promise<WatchlistLatestTransactionRaw[]>
}
