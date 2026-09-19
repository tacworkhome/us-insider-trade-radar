'use client'

import { useState } from 'react'
import type { CreateWatchlistItemDTO } from '@radar/shared/application/watchlist'

interface Props {
  onAdd: (input: CreateWatchlistItemDTO) => Promise<{ success: boolean; error?: string; limitReached?: boolean }>
}

export function AddToWatchlistForm({ onAdd }: Props) {
  const [watchType, setWatchType] = useState<'issuer' | 'owner'>('issuer')
  const [targetCik, setTargetCik] = useState('')
  const [targetName, setTargetName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await onAdd({ watchType, targetCik: targetCik.trim(), targetName: targetName.trim() || targetCik.trim() })
    setSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Failed to add item')
      return
    }
    setTargetCik('')
    setTargetName('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Type</label>
        <select
          value={watchType}
          onChange={(e) => setWatchType(e.target.value as 'issuer' | 'owner')}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
        >
          <option value="issuer">Company</option>
          <option value="owner">Insider</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">CIK (digits only)</label>
        <input
          value={targetCik}
          onChange={(e) => setTargetCik(e.target.value)}
          required
          placeholder="e.g. 9990001"
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm w-40"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Display name</label>
        <input
          value={targetName}
          onChange={(e) => setTargetName(e.target.value)}
          placeholder="e.g. Solace Dynamics Inc."
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm w-56"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add to watchlist'}
      </button>
      {error && <p className="text-sm text-red-400 w-full">{error}</p>}
    </form>
  )
}
