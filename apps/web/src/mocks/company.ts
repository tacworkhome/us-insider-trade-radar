import type { RawTransaction, StockHistoryPoint } from '@radar/shared/types/insider-trade'

export interface CompanyProfile {
  cik: string
  name: string
  symbol: string
}

export const mockCompanies: Record<string, CompanyProfile> = {
  '0009990001': { cik: '0009990001', name: 'Solace Dynamics Inc.', symbol: 'SDYN' },
  '0009990002': { cik: '0009990002', name: 'Northgate Materials Corp.', symbol: 'NGMT' },
  '0009990003': { cik: '0009990003', name: 'Halcyon Biosystems Ltd.', symbol: 'HALC' },
  '0009990004': { cik: '0009990004', name: 'Ferrovia Rail & Logistics', symbol: 'FRVL' },
  '0009990005': { cik: '0009990005', name: 'BrightAcre Foods Inc.', symbol: 'BRAC' },
  '0009990006': { cik: '0009990006', name: 'Pinegrove Semiconductor', symbol: 'PNGS' },
  '0009990007': { cik: '0009990007', name: 'Vantage Retail Holdings', symbol: 'VRTH' },
}

/** Deterministic pseudo-random generator so fixture data is stable across renders/builds. */
function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildStockHistory(days: number, startPrice: number, seed: number): StockHistoryPoint[] {
  const rand = mulberry32(seed)
  const points: StockHistoryPoint[] = []
  let price = startPrice
  const today = new Date('2026-09-18T00:00:00Z')

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() - i)
    const dow = date.getUTCDay()
    if (dow === 0 || dow === 6) continue // skip weekends

    const drift = (rand() - 0.48) * 0.03
    price = Math.max(5, price * (1 + drift))
    const open = price * (1 + (rand() - 0.5) * 0.01)
    const close = price
    const high = Math.max(open, close) * (1 + rand() * 0.01)
    const low = Math.min(open, close) * (1 - rand() * 0.01)
    const volume = Math.round(400_000 + rand() * 1_600_000)

    points.push({
      date: date.toISOString().split('T')[0]!,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    })
  }
  return points
}

const INSIDERS = [
  { cik: '0001110001', name: 'Marta Ionescu', title: 'Chief Executive Officer', isOfficer: 1, isDirector: 0, isTenPercentOwner: 0 },
  { cik: '0001110002', name: 'David Okafor', title: 'Chief Financial Officer', isOfficer: 1, isDirector: 0, isTenPercentOwner: 0 },
  { cik: '0001110003', name: 'Priya Raman', title: '', isOfficer: 0, isDirector: 1, isTenPercentOwner: 0 },
  { cik: '0001110004', name: 'Lucas Ferreira', title: 'Chief Operating Officer', isOfficer: 1, isDirector: 0, isTenPercentOwner: 0 },
]

function buildTransactions(history: StockHistoryPoint[], seed: number): RawTransaction[] {
  const rand = mulberry32(seed + 1)
  const txs: RawTransaction[] = []
  // Hand-picked trade dates so the chart shows a readable cluster-buy pattern
  const buyDates = [
    history[Math.floor(history.length * 0.2)]?.date,
    history[Math.floor(history.length * 0.21)]?.date,
    history[Math.floor(history.length * 0.5)]?.date,
    history[Math.floor(history.length * 0.72)]?.date,
    history[Math.floor(history.length * 0.73)]?.date,
    history[Math.floor(history.length * 0.74)]?.date,
    history[history.length - 4]?.date,
  ].filter((d): d is string => Boolean(d))

  const priceByDate = new Map(history.map((p) => [p.date, p.close]))

  buyDates.forEach((date, i) => {
    const insider = INSIDERS[i % INSIDERS.length]!
    const price = priceByDate.get(date) ?? 50
    const shares = Math.round(2_000 + rand() * 15_000)
    txs.push({
      id: `mock-buy-${i}`,
      filing_date: date,
      transaction_date: date,
      owner_cik: insider.cik,
      owner_name: insider.name,
      officer_title: insider.title,
      is_director: insider.isDirector,
      is_officer: insider.isOfficer,
      is_ten_percent_owner: insider.isTenPercentOwner,
      is_other: 0,
      acquired_disposed_code: 'A',
      transaction_code: 'P',
      shares_amount: shares,
      price_per_share: price,
      transaction_value: Number((shares * price).toFixed(2)),
    })
  })

  // A couple of routine sells so buyingOnly/increasingSize signals have contrast
  const sellDates = [history[Math.floor(history.length * 0.35)]?.date].filter((d): d is string => Boolean(d))
  sellDates.forEach((date, i) => {
    const insider = INSIDERS[2]!
    const price = priceByDate.get(date) ?? 50
    const shares = Math.round(1_000 + rand() * 3_000)
    txs.push({
      id: `mock-sell-${i}`,
      filing_date: date,
      transaction_date: date,
      owner_cik: insider.cik,
      owner_name: insider.name,
      officer_title: insider.title,
      is_director: insider.isDirector,
      is_officer: insider.isOfficer,
      is_ten_percent_owner: insider.isTenPercentOwner,
      is_other: 0,
      acquired_disposed_code: 'D',
      transaction_code: 'S',
      shares_amount: shares,
      price_per_share: price,
      transaction_value: Number((shares * price).toFixed(2)),
    })
  })

  return txs.sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))
}

export function getCompanyMock(cik: string) {
  const profile = mockCompanies[cik]
  if (!profile) return null
  const seed = Number(cik.slice(-4)) || 42
  const startPrice = 20 + (seed % 180)
  const history = buildStockHistory(240, startPrice, seed)
  const transactions = buildTransactions(history, seed)
  return { profile, history, transactions }
}
