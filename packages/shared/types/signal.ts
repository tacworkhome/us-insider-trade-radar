/**
 * Signal types shown on the /signals page. These are display-layer shapes
 * for a rule-based "cluster buy" signal — the real product's actual
 * weighting/ranking algorithm is intentionally not reproduced here; see
 * CompanyReport signal scoring for the "demo weights" disclaimer.
 */

export enum SignalType {
  CLUSTER_BUY = 'CLUSTER_BUY',
}

export interface ClusterBuySignal {
  signal_type: SignalType.CLUSTER_BUY
  issuer_cik: string
  issuer_name: string
  symbol: string
  buyer_count: number
  total_amount: number
  last_filing_date: string
  confidence_score: number
  c_suite_count?: number
  avg_days_spread?: number
  has_price_drop?: boolean
  price_drop_pct?: number
}
