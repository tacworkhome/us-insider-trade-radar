'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { RawTransaction } from '@radar/shared/types/insider-trade'
import { formatCurrency } from '@radar/shared/utils/format'

interface Props {
  transactions: RawTransaction[]
}

interface MonthPoint {
  month: string
  sortKey: string
  buyValue: number
  sellValue: number
}

function aggregateByMonth(transactions: RawTransaction[]): MonthPoint[] {
  const map = new Map<string, MonthPoint>()

  for (const tx of transactions) {
    const raw = tx.transaction_date || tx.filing_date
    if (!raw) continue
    const d = new Date(raw)
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const month = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

    if (!map.has(sortKey)) map.set(sortKey, { month, sortKey, buyValue: 0, sellValue: 0 })
    const entry = map.get(sortKey)!

    const val = tx.transaction_value ?? 0
    if (tx.transaction_code === 'P' && tx.acquired_disposed_code === 'A') {
      entry.buyValue += val
    } else if (tx.acquired_disposed_code === 'D') {
      entry.sellValue += val
    }
  }

  return Array.from(map.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
}

function shortCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-300 font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function InsiderActivityChart({ transactions }: Props) {
  const data = useMemo(() => aggregateByMonth(transactions), [transactions])

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-6">No transaction data to display.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barGap={2} barCategoryGap="30%">
        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#374151' }} tickLine={false} />
        <YAxis tickFormatter={shortCurrency} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
        <Bar dataKey="buyValue" name="Buys" fill="#22c55e" radius={[2, 2, 0, 0]} />
        <Bar dataKey="sellValue" name="Sells" fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
