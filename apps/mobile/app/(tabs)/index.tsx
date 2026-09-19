import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useWatchlist } from '../../src/presentation/watchlist/useWatchlist'
import type { WatchlistItemDTO } from '@radar/shared/application/watchlist'

// Same fixture used to seed apps/web's demo watchlist on first load
// (apps/web/src/app/[locale]/watchlist/WatchlistClient.tsx) — kept here as a
// literal instead of a shared export because it's demo-only bootstrap data,
// not part of the domain/application layers.
const SEED_ITEMS = [
  { watchType: 'issuer' as const, targetCik: '9990001', targetName: 'Solace Dynamics Inc.' },
  { watchType: 'issuer' as const, targetCik: '9990003', targetName: 'Halcyon Biosystems Ltd.' },
]

export default function WatchlistScreen() {
  const { items, current, limit, loading, addToWatchlist, removeFromWatchlist } = useWatchlist()
  const [cik, setCik] = useState('')
  const [name, setName] = useState('')
  const seeded = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (seeded.current || loading) return
    seeded.current = true
    if (items.length === 0) {
      SEED_ITEMS.forEach((item) => void addToWatchlist(item))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const handleAdd = useCallback(async () => {
    if (!cik.trim() || !name.trim()) return
    const result = await addToWatchlist({ watchType: 'issuer', targetCik: cik.trim(), targetName: name.trim() })
    if (result.success) {
      setCik('')
      setName('')
    }
  }, [cik, name, addToWatchlist])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator color="#f9fafb" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111827', padding: 16 }}>
      <Text style={{ color: '#9ca3af', marginBottom: 12 }}>
        {current}/{limit} watched
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Company name"
          placeholderTextColor="#6b7280"
          style={styles.input}
        />
        <TextInput
          value={cik}
          onChangeText={setCik}
          placeholder="CIK"
          placeholderTextColor="#6b7280"
          style={[styles.input, { flex: 0.5 }]}
        />
        <Pressable onPress={handleAdd} style={styles.addButton}>
          <Text style={{ color: '#111827', fontWeight: '600' }}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 32 }}>
            Your watchlist is empty. Add a company to start tracking it.
          </Text>
        }
        renderItem={({ item }) => (
          <WatchlistRow
            item={item}
            onRemove={removeFromWatchlist}
            onPress={() => router.push(`/company/${item.targetCik}`)}
          />
        )}
        contentContainerStyle={{ gap: 10 }}
      />
    </View>
  )
}

function WatchlistRow({
  item,
  onRemove,
  onPress,
}: {
  item: WatchlistItemDTO
  onRemove: (id: string) => Promise<{ success: boolean }>
  onPress: () => void
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <View style={styles.badge}>
            <Text style={{ color: '#d1d5db', fontSize: 12 }}>{item.watchType === 'issuer' ? 'Company' : 'Insider'}</Text>
          </View>
          <Text style={{ color: '#f9fafb', fontSize: 16, fontWeight: '600' }}>{item.targetName || 'Unknown'}</Text>
        </View>
        <Text style={{ color: '#9ca3af', fontSize: 13 }}>CIK: {item.targetCik}</Text>
      </Pressable>
      <Pressable onPress={() => onRemove(item.id)} style={styles.removeButton}>
        <Text style={{ color: '#e5e7eb' }}>Remove</Text>
      </Pressable>
    </View>
  )
}

const styles = {
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButton: {
    backgroundColor: '#34d399',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#374151',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#4b5563',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
} as const
