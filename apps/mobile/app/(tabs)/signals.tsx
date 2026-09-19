/**
 * Signals screen — mobile counterpart of apps/web's /signals cluster-buy
 * table (apps/web/src/app/[locale]/signals/SignalsTable.tsx).
 *
 * No domain/application use case backs this slice on the web side either
 * (see README: "the signals ... slice[s] ... backed by deterministic mock
 * fixtures instead of a live pipeline") — so, like web, this screen reads
 * the fixture directly. What *is* shared and reused as-is here is the same
 * `mockClusterBuySignals` fixture, the `ClusterBuySignal` type, and the
 * `formatCompactUsd` formatter — all imported straight from
 * packages/shared, not re-typed for mobile.
 */
import { useMemo, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { mockClusterBuySignals } from '@radar/shared/mocks/signals'
import type { ClusterBuySignal } from '@radar/shared/types/signal'
import { formatCompactUsd } from '@radar/shared/utils/format'

function confidenceBadge(score: number) {
  if (score >= 85) return { label: 'Very High', color: '#86efac' }
  if (score >= 65) return { label: 'High', color: '#93c5fd' }
  if (score >= 45) return { label: 'Moderate', color: '#fde047' }
  return { label: 'Low', color: '#d1d5db' }
}

export default function SignalsScreen() {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<'confidence_score' | 'total_amount'>('confidence_score')

  const sorted = useMemo(
    () => [...mockClusterBuySignals].sort((a, b) => b[sortKey] - a[sortKey]),
    [sortKey]
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#111827', padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {(['confidence_score', 'total_amount'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setSortKey(key)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: sortKey === key ? '#34d399' : '#1f2937',
            }}
          >
            <Text style={{ color: sortKey === key ? '#111827' : '#d1d5db', fontSize: 13, fontWeight: '600' }}>
              {key === 'confidence_score' ? 'Confidence' : 'Total value'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.issuer_cik}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <SignalCard signal={item} onPress={() => router.push(`/company/${item.issuer_cik}`)} />
        )}
      />
    </View>
  )
}

function SignalCard({ signal, onPress }: { signal: ClusterBuySignal; onPress: () => void }) {
  const conf = confidenceBadge(signal.confidence_score)
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 16 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#34d399', fontWeight: '700', fontSize: 15 }}>{signal.symbol}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 2 }}>{signal.issuer_name}</Text>
        </View>
        <View style={{ borderWidth: 1, borderColor: conf.color, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' }}>
          <Text style={{ color: conf.color, fontSize: 13, fontWeight: '700' }}>{conf.label}</Text>
          <Text style={{ color: conf.color, fontSize: 11 }}>{signal.confidence_score}/100</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
        <Text style={{ color: '#f9fafb', fontWeight: '600', fontSize: 13 }}>
          {signal.buyer_count} insider{signal.buyer_count === 1 ? '' : 's'} buying
        </Text>
        <Text style={{ color: '#4ade80', fontWeight: '600', fontSize: 13 }}>{formatCompactUsd(signal.total_amount)}</Text>
        {signal.has_price_drop && signal.price_drop_pct != null && (
          <Text style={{ color: '#fdba74', fontSize: 12 }}>{Math.abs(signal.price_drop_pct).toFixed(1)}% drop</Text>
        )}
      </View>
    </Pressable>
  )
}
