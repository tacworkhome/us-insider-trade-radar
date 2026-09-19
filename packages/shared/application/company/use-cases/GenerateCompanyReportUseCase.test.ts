import { describe, it, expect } from 'vitest'
import { generateCompanyReport } from './GenerateCompanyReportUseCase'
import type { RawTransaction } from '../../../types/insider-trade'

function buy(overrides: Partial<RawTransaction>): RawTransaction {
  return {
    id: 'tx',
    filing_date: '2026-01-10',
    transaction_date: '2026-01-10',
    owner_cik: 'owner-1',
    owner_name: 'Test Insider',
    officer_title: 'Chief Executive Officer',
    is_director: 0,
    is_officer: 1,
    is_ten_percent_owner: 0,
    is_other: 0,
    acquired_disposed_code: 'A',
    transaction_code: 'P',
    shares_amount: 1000,
    price_per_share: 10,
    transaction_value: 10000,
    ...overrides,
  }
}

describe('generateCompanyReport', () => {
  it('reports no signals for a single isolated buy', () => {
    const report = generateCompanyReport('TST', 'Test Co.', [buy({})])
    expect(report.signals.clusterBuying).toBe(false)
    expect(report.signals.repeatBuyer).toBe(false)
    expect(report.confidenceScore).toBeGreaterThan(0) // buyingOnly should still fire
  })

  it('detects clusterBuying when 2 distinct owners buy within 14 days', () => {
    const report = generateCompanyReport('TST', 'Test Co.', [
      buy({ id: 'a', owner_cik: 'owner-1', transaction_date: '2026-01-01' }),
      buy({ id: 'b', owner_cik: 'owner-2', transaction_date: '2026-01-05' }),
    ])
    expect(report.signals.clusterBuying).toBe(true)
  })

  it('does not detect clusterBuying outside the 14-day window', () => {
    const report = generateCompanyReport('TST', 'Test Co.', [
      buy({ id: 'a', owner_cik: 'owner-1', transaction_date: '2026-01-01' }),
      buy({ id: 'b', owner_cik: 'owner-2', transaction_date: '2026-02-01' }),
    ])
    expect(report.signals.clusterBuying).toBe(false)
  })

  it('detects repeatBuyer when the same owner buys twice', () => {
    const report = generateCompanyReport('TST', 'Test Co.', [
      buy({ id: 'a', owner_cik: 'owner-1', transaction_date: '2026-01-01', transaction_value: 5000 }),
      buy({ id: 'b', owner_cik: 'owner-1', transaction_date: '2026-03-01', transaction_value: 20000 }),
    ])
    expect(report.signals.repeatBuyer).toBe(true)
    expect(report.signals.increasingSize).toBe(true)
  })

  it('turns off buyingOnly when a recent sell exists', () => {
    const report = generateCompanyReport('TST', 'Test Co.', [
      buy({ id: 'a', transaction_date: '2026-01-01' }),
      buy({ id: 'b', transaction_date: '2026-01-15', acquired_disposed_code: 'D', transaction_code: 'S' }),
    ])
    expect(report.signals.buyingOnly).toBe(false)
  })

  it('computes net shares/value and unique insiders', () => {
    const report = generateCompanyReport('TST', 'Test Co.', [
      buy({ id: 'a', owner_cik: 'owner-1', shares_amount: 1000, transaction_value: 10000 }),
      buy({ id: 'b', owner_cik: 'owner-2', shares_amount: 500, transaction_value: 5000, acquired_disposed_code: 'D', transaction_code: 'S' }),
    ])
    expect(report.insiderActivity.uniqueInsiders).toBe(2)
    expect(report.insiderActivity.netShares).toBe(500)
    expect(report.insiderActivity.netValue).toBe(5000)
  })
})
