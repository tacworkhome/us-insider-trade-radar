'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { ClusterBuySignal } from '@radar/shared/types/signal'
import { formatCompactUsd } from '@radar/shared/utils/format'

interface Props {
  signals: ClusterBuySignal[]
}

type SortKey = 'confidence_score' | 'total_amount' | 'last_filing_date'

function confidenceBadge(score: number) {
  if (score >= 85) return { label: 'Very High', className: 'text-green-300 border-green-500/40' }
  if (score >= 65) return { label: 'High', className: 'text-blue-300 border-blue-500/40' }
  if (score >= 45) return { label: 'Moderate', className: 'text-yellow-300 border-yellow-500/40' }
  return { label: 'Low', className: 'text-gray-300 border-gray-500/40' }
}

export function SignalsTable({ signals }: Props) {
  const t = useTranslations('signals')
  const [minBuyers, setMinBuyers] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>('confidence_score')

  const filtered = useMemo(() => {
    return [...signals]
      .filter((s) => s.buyer_count >= minBuyers)
      .sort((a, b) => {
        if (sortKey === 'last_filing_date') return b.last_filing_date.localeCompare(a.last_filing_date)
        return (b[sortKey] ?? 0) - (a[sortKey] ?? 0)
      })
  }, [signals, minBuyers, sortKey])

  return (
    <section>
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <label className="flex items-center gap-2 text-gray-400">
          {t('filters.minBuyers')}
          <select
            value={minBuyers}
            onChange={(e) => setMinBuyers(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
          >
            {[0, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n === 0 ? t('filters.all') : `${n}+`}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-gray-400">
          {t('filters.sortBy')}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
          >
            <option value="confidence_score">{t('filters.confidence')}</option>
            <option value="total_amount">{t('filters.totalAmount')}</option>
          </select>
        </label>
        <span className="text-gray-500 ml-auto">{t('table.signalCount', { count: filtered.length })}</span>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">{t('table.buyers')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Total Value</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((signal, i) => {
                const conf = confidenceBadge(signal.confidence_score)
                return (
                  <tr key={signal.issuer_cik} className={i % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-700/30'}>
                    <td className="px-4 py-3">
                      <Link href={`/company/${signal.issuer_cik}/report`} className="text-primary-500 font-medium hover:underline">
                        {signal.symbol}
                      </Link>
                      <p className="text-gray-400 text-sm">{signal.issuer_name}</p>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {t('table.insidersCount', { count: signal.buyer_count })}
                      {signal.has_price_drop && signal.price_drop_pct != null && (
                        <span className="ml-2 text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-2 py-0.5">
                          {Math.abs(signal.price_drop_pct).toFixed(1)}% drop
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">
                      {formatCompactUsd(signal.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex flex-col items-center gap-0.5 rounded-lg border px-3 py-1.5 ${conf.className}`}>
                        <span className="text-sm font-bold">{conf.label}</span>
                        <span className="text-xs opacity-80">{signal.confidence_score}/100</span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-700">
          {filtered.map((signal, i) => {
            const conf = confidenceBadge(signal.confidence_score)
            return (
              <Link
                key={signal.issuer_cik}
                href={`/company/${signal.issuer_cik}/report`}
                className={`block px-4 py-4 ${i % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-700/30'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-primary-500 font-bold text-sm">{signal.symbol}</span>
                  <span className={`text-xs border rounded px-2 py-0.5 font-semibold ${conf.className}`}>
                    {conf.label} {signal.confidence_score}/100
                  </span>
                </div>
                <p className="text-gray-400 text-xs mb-2">{signal.issuer_name}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-white font-semibold">{t('table.insidersCount', { count: signal.buyer_count })}</span>
                  <span className="text-green-400 font-semibold">{formatCompactUsd(signal.total_amount)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
