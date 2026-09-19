/**
 * Company report screen — mobile counterpart of apps/web's
 * /company/[cik]/report page (apps/web/src/app/[locale]/company/[cik]/report/page.tsx).
 *
 * Reuses, unchanged, from packages/shared:
 *  - `getCompanyMock` (packages/shared/mocks/company) — same fixture data
 *    apps/web renders (price history + insider transactions), now imported
 *    from the shared package instead of duplicated.
 *  - `generateCompanyReport` (application/company/use-cases) — the same
 *    use case that computes the confidence score / signals / summary.
 *  - `convertToInsiderTrades`, `formatCurrency`, `formatNumber` (utils).
 *
 * The chart rendering itself is reimplemented for React Native (Recharts +
 * lightweight-charts are web-only) using `react-native-gifted-charts`, a
 * pure-JS/SVG library that works in Expo Go — no pixel-perfect parity with
 * the web charts is attempted, per the demo's scope.
 */
import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { LineChart, BarChart } from 'react-native-gifted-charts'
import { getCompanyMock } from '@radar/shared/mocks/company'
import { generateCompanyReport } from '@radar/shared/application/company/use-cases/GenerateCompanyReportUseCase'
import { formatCurrency, formatNumber } from '@radar/shared/utils/format'
import type { RawTransaction } from '@radar/shared/types/insider-trade'

const SIGNAL_LABELS: Record<string, string> = {
  clusterBuying: 'Cluster Buying',
  repeatBuyer: 'Repeat Buyer',
  buyingOnly: 'Buying Only',
  increasingSize: 'Increasing Size',
}

interface MonthPoint {
  month: string
  sortKey: string
  buyValue: number
  sellValue: number
}

/** Same monthly buy/sell aggregation apps/web's InsiderActivityChart uses. */
function aggregateByMonth(transactions: RawTransaction[]): MonthPoint[] {
  const map = new Map<string, MonthPoint>()
  for (const tx of transactions) {
    const raw = tx.transaction_date || tx.filing_date
    if (!raw) continue
    const d = new Date(raw)
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    if (!map.has(sortKey)) map.set(sortKey, { month, sortKey, buyValue: 0, sellValue: 0 })
    const entry = map.get(sortKey)!
    const val = tx.transaction_value ?? 0
    if (tx.transaction_code === 'P' && tx.acquired_disposed_code === 'A') entry.buyValue += val
    else if (tx.acquired_disposed_code === 'D') entry.sellValue += val
  }
  return Array.from(map.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
}

export default function CompanyReportScreen() {
  const { cik } = useLocalSearchParams<{ cik: string }>()
  const mock = useMemo(() => getCompanyMock(cik ?? ''), [cik])

  if (!mock) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#9ca3af' }}>No company found for CIK {cik}</Text>
      </View>
    )
  }

  const { profile, history, transactions } = mock
  const report = generateCompanyReport(profile.symbol, profile.name, transactions, 240)

  // Downsample ~240 daily points to ~48 for a legible mobile line chart.
  const step = Math.max(1, Math.floor(history.length / 48))
  const sampled = history.filter((_, i) => i % step === 0)
  const priceData = sampled.map((p, i) => ({
    value: p.close,
    label: i % 8 === 0 ? p.date.slice(5) : '',
    dataPointColor: '#3b82f6',
  }))

  const monthly = aggregateByMonth(transactions)
  const barData = monthly.flatMap((m) => [
    { value: m.buyValue, frontColor: '#22c55e', label: m.month, spacing: 2 },
    { value: m.sellValue, frontColor: '#ef4444', spacing: 14 },
  ])

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#111827' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: '#6b7280', fontSize: 12 }}>CIK {profile.cik}</Text>
      <Text style={{ color: '#f9fafb', fontSize: 22, fontWeight: '700', marginTop: 2 }}>
        {profile.name} <Text style={{ color: '#34d399' }}>({profile.symbol})</Text>
      </Text>

      <View style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 12, marginTop: 16 }}>
        <Text style={{ color: '#d1d5db', fontWeight: '600', marginBottom: 8 }}>Price (close)</Text>
        <LineChart
          data={priceData}
          height={180}
          thickness={2}
          color="#3b82f6"
          areaChart
          startFillColor="#3b82f6"
          endFillColor="#3b82f6"
          startOpacity={0.25}
          endOpacity={0.02}
          hideDataPoints
          curved
          hideRules
          yAxisTextStyle={{ color: '#6b7280', fontSize: 9 }}
          xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 9 }}
          xAxisColor="#374151"
          yAxisColor="#374151"
          initialSpacing={8}
          endSpacing={8}
          adjustToWidth
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <View style={{ flex: 1, backgroundColor: '#1f2937', borderRadius: 12, padding: 14 }}>
          <Text style={{ color: '#d1d5db', fontWeight: '600', marginBottom: 8 }}>Net insider activity</Text>
          <StatRow label="Total buys" value={String(report.insiderActivity.totalBuys)} color="#4ade80" />
          <StatRow label="Total sells" value={String(report.insiderActivity.totalSells)} color="#f87171" />
          <StatRow label="Unique insiders" value={String(report.insiderActivity.uniqueInsiders)} />
          <StatRow label="Net shares" value={formatNumber(report.insiderActivity.netShares)} />
          <StatRow label="Net value" value={formatCurrency(report.insiderActivity.netValue)} />
        </View>

        <View style={{ flex: 1, backgroundColor: '#1f2937', borderRadius: 12, padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#d1d5db', fontWeight: '600' }}>Confidence</Text>
            <Text style={{ color: '#34d399', fontWeight: '700' }}>{report.confidenceScore}/100</Text>
          </View>
          {Object.entries(report.signals).map(([key, active]) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: active ? '#4ade80' : '#4b5563' }} />
              <Text style={{ color: active ? '#f9fafb' : '#6b7280', fontSize: 12 }}>{SIGNAL_LABELS[key] ?? key}</Text>
            </View>
          ))}
          <Text style={{ color: '#6b7280', fontSize: 10, marginTop: 6 }}>
            Demo weights — simplified for illustration, not the production scoring model.
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 12, marginTop: 16 }}>
        <Text style={{ color: '#d1d5db', fontWeight: '600', marginBottom: 8 }}>Monthly buy/sell value</Text>
        <BarChart
          data={barData}
          height={160}
          barWidth={10}
          hideRules
          yAxisTextStyle={{ color: '#6b7280', fontSize: 9 }}
          xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 9 }}
          xAxisColor="#374151"
          yAxisColor="#374151"
          noOfSections={3}
        />
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
          <Legend color="#22c55e" label="Buys" />
          <Legend color="#ef4444" label="Sells" />
        </View>
      </View>

      <View style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 14, marginTop: 16, marginBottom: 24 }}>
        <Text style={{ color: '#d1d5db', fontWeight: '600', marginBottom: 10 }}>Recent open-market buys</Text>
        {report.topTransactions.slice(0, 6).map((tx, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 8,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: '#374151',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#f9fafb', fontSize: 13 }}>{tx.ownerName}</Text>
              <Text style={{ color: '#6b7280', fontSize: 11 }}>{tx.officerTitle || tx.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#4ade80', fontSize: 13, fontWeight: '600' }}>{formatCurrency(tx.value)}</Text>
              <Text style={{ color: '#6b7280', fontSize: 11 }}>{formatNumber(tx.shares)} sh</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={{ color: '#9ca3af', fontSize: 12, fontStyle: 'italic', marginBottom: 32 }}>{report.summary}</Text>
    </ScrollView>
  )
}

function StatRow({ label, value, color = '#f9fafb' }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
      <Text style={{ color: '#9ca3af', fontSize: 12 }}>{label}</Text>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{value}</Text>
    </View>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
      <Text style={{ color: '#9ca3af', fontSize: 11 }}>{label}</Text>
    </View>
  )
}
