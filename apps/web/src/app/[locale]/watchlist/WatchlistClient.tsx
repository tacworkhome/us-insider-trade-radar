'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useWatchlistViewModel } from '@radar/shared/presentation/watchlist'
import { DEMO_USER_ID } from '@/lib/demo-user'
import { WatchlistCard } from '@/features/watchlist/components/WatchlistCard'
import { WatchlistTabs, type WatchlistView } from '@/features/watchlist/components/WatchlistTabs'
import { AddToWatchlistForm } from '@/features/watchlist/components/AddToWatchlistForm'

const SEED_ITEMS = [
  { watchType: 'issuer' as const, targetCik: '9990001', targetName: 'Solace Dynamics Inc.' },
  { watchType: 'issuer' as const, targetCik: '9990003', targetName: 'Halcyon Biosystems Ltd.' },
]

export function WatchlistClient() {
  const t = useTranslations('watchlist')
  const { items, current, limit, loading, addToWatchlist, removeFromWatchlist } = useWatchlistViewModel(DEMO_USER_ID)
  const [view, setView] = useState<WatchlistView>('companies')
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current || loading) return
    seeded.current = true
    if (items.length === 0) {
      SEED_ITEMS.forEach((item) => void addToWatchlist(item))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const visible = items.filter((item) => (view === 'companies' ? item.watchType === 'issuer' : item.watchType === 'owner'))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">{t('page.title')}</h1>

      <AddToWatchlistForm onAdd={addToWatchlist} />

      <WatchlistTabs currentView={view} onChange={setView} current={current} limit={limit} />

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          {view === 'companies' ? t('page.empty') : 'No insiders watched yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <WatchlistCard key={item.id} item={item} onRemove={removeFromWatchlist} />
          ))}
        </div>
      )}
    </div>
  )
}
