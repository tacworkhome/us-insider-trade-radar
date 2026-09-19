/**
 * GenerateCompanyReportUseCase
 *
 * Pure function — no database calls, no AI. Takes the transactions already
 * loaded on the company page and derives a few simple rule-based signals
 * plus a template summary.
 *
 * Signal rules:
 *   clusterBuying  — 2+ distinct insiders made open-market buys (code='P') within any 14-day window
 *   repeatBuyer    — same insider has >=2 open-market buys in the period
 *   buyingOnly     — no sell transactions (acquired_disposed_code='D') in the past 30 days
 *   increasingSize — most active buyer's purchase values have an increasing trend
 *
 * NOTE ON SCORING: the weight numbers in computeScore() below are illustrative
 * placeholders for this demo — they do NOT reflect the production system's
 * actual scoring weights, which are proprietary and intentionally not
 * reproduced here.
 */

import type { RawTransaction } from '../../../types/insider-trade'
import type { CompanyReportDTO, ReportSignals, ReportTransaction } from '../dtos/CompanyReportDTO'

const OPEN_MARKET_BUY = 'P'
const CLUSTER_WINDOW_DAYS = 14
const SELL_LOOKBACK_DAYS = 30

function parseDate(dateStr: string): Date {
  return new Date(dateStr.split('T')[0]!)
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs((a.getTime() - b.getTime()) / 86_400_000)
}

function isOpenMarketBuy(tx: RawTransaction): boolean {
  return tx.transaction_code === OPEN_MARKET_BUY && tx.acquired_disposed_code === 'A'
}

function isSell(tx: RawTransaction): boolean {
  return tx.acquired_disposed_code === 'D'
}

function detectSignals(transactions: RawTransaction[]): ReportSignals {
  const buys = transactions.filter(isOpenMarketBuy)

  // clusterBuying — slide a 14-day window over sorted buys, look for 2+ distinct owners
  const sortedBuys = [...buys].sort(
    (a, b) => parseDate(a.transaction_date).getTime() - parseDate(b.transaction_date).getTime()
  )
  let clusterBuying = false
  for (let i = 0; i < sortedBuys.length; i++) {
    const windowStart = parseDate(sortedBuys[i]!.transaction_date)
    const distinctOwners = new Set<string>()
    for (let j = i; j < sortedBuys.length; j++) {
      const txDate = parseDate(sortedBuys[j]!.transaction_date)
      if (daysBetween(windowStart, txDate) > CLUSTER_WINDOW_DAYS) break
      distinctOwners.add(sortedBuys[j]!.owner_cik)
      if (distinctOwners.size >= 2) {
        clusterBuying = true
        break
      }
    }
    if (clusterBuying) break
  }

  // repeatBuyer — same owner has 2+ open-market buys
  const buyCountByOwner = new Map<string, number>()
  buys.forEach((tx) => buyCountByOwner.set(tx.owner_cik, (buyCountByOwner.get(tx.owner_cik) ?? 0) + 1))
  const repeatBuyer = [...buyCountByOwner.values()].some((count) => count >= 2)

  // buyingOnly — at least one buy, and no sells within the lookback window of the most recent tx
  const mostRecentDate = transactions.reduce<Date | null>((latest, tx) => {
    const d = parseDate(tx.transaction_date)
    return latest === null || d > latest ? d : latest
  }, null)
  const hasAnyBuy = buys.length > 0
  const hasRecentSell =
    mostRecentDate != null &&
    transactions.some((tx) => isSell(tx) && daysBetween(parseDate(tx.transaction_date), mostRecentDate) <= SELL_LOOKBACK_DAYS)
  const buyingOnly = hasAnyBuy && !hasRecentSell

  // increasingSize — top buyer's purchase values trend up over time
  let increasingSize = false
  if (buys.length >= 2) {
    const topOwner = [...buyCountByOwner.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    if (topOwner) {
      const ownerBuys = buys
        .filter((tx) => tx.owner_cik === topOwner && tx.transaction_value != null)
        .sort((a, b) => parseDate(a.transaction_date).getTime() - parseDate(b.transaction_date).getTime())
      if (ownerBuys.length >= 2) {
        const first = ownerBuys[0]!.transaction_value ?? 0
        const last = ownerBuys[ownerBuys.length - 1]!.transaction_value ?? 0
        increasingSize = last > first
      }
    }
  }

  return { clusterBuying, repeatBuyer, buyingOnly, increasingSize }
}

/**
 * Demo scoring weights — simplified for illustration, not the production
 * algorithm. Real weight values are not reproduced in this repository.
 */
function computeScore(signals: ReportSignals): number {
  const DEMO_WEIGHTS = { clusterBuying: 25, repeatBuyer: 25, buyingOnly: 25, increasingSize: 25 }
  return Object.entries(signals).reduce(
    (score, [key, active]) => score + (active ? DEMO_WEIGHTS[key as keyof ReportSignals] : 0),
    0
  )
}

function buildSummary(
  ticker: string,
  signals: ReportSignals,
  activity: CompanyReportDTO['insiderActivity'],
  periodDays: number
): string {
  const parts: string[] = []
  const activeSignals = Object.values(signals).filter(Boolean).length

  if (activeSignals === 0) {
    return (
      `${ticker} shows no notable insider buying patterns in the past ${periodDays} days. ` +
      `${activity.totalBuys} purchase${activity.totalBuys !== 1 ? 's' : ''} and ` +
      `${activity.totalSells} sale${activity.totalSells !== 1 ? 's' : ''} were recorded.`
    )
  }

  parts.push(
    `${ticker} shows ${activeSignals} insider buying signal${activeSignals !== 1 ? 's' : ''} ` +
      `over the past ${periodDays} days, with ${activity.uniqueInsiders} insider${activity.uniqueInsiders !== 1 ? 's' : ''} active.`
  )

  if (signals.clusterBuying) {
    parts.push('Multiple insiders purchased shares within a 14-day window.')
  }
  if (signals.repeatBuyer) {
    parts.push('At least one insider made repeated open-market purchases during the period.')
  }
  if (signals.increasingSize) {
    parts.push('Purchase sizes increased over time.')
  }

  return parts.join(' ')
}

export function generateCompanyReport(
  ticker: string,
  companyName: string,
  transactions: RawTransaction[],
  periodDays = 90
): CompanyReportDTO {
  const buys = transactions.filter(isOpenMarketBuy)
  const sells = transactions.filter(isSell)

  const netShares =
    buys.reduce((s, tx) => s + (tx.shares_amount ?? 0), 0) - sells.reduce((s, tx) => s + (tx.shares_amount ?? 0), 0)
  const netValue =
    buys.reduce((s, tx) => s + (tx.transaction_value ?? 0), 0) -
    sells.reduce((s, tx) => s + (tx.transaction_value ?? 0), 0)

  const uniqueInsiders = new Set([...buys, ...sells].map((tx) => tx.owner_cik)).size

  const activity: CompanyReportDTO['insiderActivity'] = {
    totalBuys: buys.length,
    totalSells: sells.length,
    netShares,
    netValue,
    uniqueInsiders,
  }

  const signals = detectSignals(transactions)
  const confidenceScore = computeScore(signals)
  const summary = buildSummary(ticker, signals, activity, periodDays)

  const topTransactions: ReportTransaction[] = [...buys]
    .sort((a, b) => parseDate(b.transaction_date).getTime() - parseDate(a.transaction_date).getTime())
    .slice(0, 5)
    .map((tx) => ({
      ownerName: tx.owner_name,
      officerTitle: tx.officer_title ?? '',
      date: tx.transaction_date.split('T')[0]!,
      shares: tx.shares_amount,
      value: tx.transaction_value ?? 0,
      isBuy: true,
    }))

  return {
    ticker,
    companyName,
    generatedAt: new Date().toISOString(),
    periodDays,
    insiderActivity: activity,
    signals,
    confidenceScore,
    topTransactions,
    summary,
  }
}
