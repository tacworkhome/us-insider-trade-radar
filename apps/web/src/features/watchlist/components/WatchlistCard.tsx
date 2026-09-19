'use client'

import Link from 'next/link'
import type { WatchlistItemDTO } from '@radar/shared/application/watchlist'

interface WatchlistCardProps {
  item: WatchlistItemDTO
  onRemove: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function WatchlistCard({ item, onRemove }: WatchlistCardProps) {
  const detailUrl = item.watchType === 'issuer' ? `/company/${item.targetCik}/report` : `/insider/${item.targetCik}`

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-between hover:bg-gray-750 transition">
      <Link href={detailUrl} className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm bg-gray-700 px-2 py-1 rounded text-gray-300">
            {item.watchType === 'issuer' ? 'Company' : 'Insider'}
          </span>
          <h3 className="text-lg font-semibold text-white hover:text-primary-500 transition">
            {item.targetName || 'Unknown'}
          </h3>
        </div>
        <p className="text-gray-400 text-sm">CIK: {item.targetCik}</p>
        <p className="text-gray-500 text-xs mt-1">Added {new Date(item.createdAt).toLocaleDateString()}</p>
      </Link>
      <button
        onClick={() => onRemove(item.id)}
        className="px-4 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700 transition"
      >
        Remove
      </button>
    </div>
  )
}
