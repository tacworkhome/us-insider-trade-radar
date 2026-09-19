'use client'

export type WatchlistView = 'companies' | 'insiders'

interface WatchlistTabsProps {
  currentView: WatchlistView
  onChange: (view: WatchlistView) => void
  current: number
  limit: number
}

export function WatchlistTabs({ currentView, onChange, current, limit }: WatchlistTabsProps) {
  const tabs: Array<{ value: WatchlistView; label: string; icon: string }> = [
    { value: 'companies', label: 'Companies', icon: '\u{1F3E2}' },
    { value: 'insiders', label: 'Insiders', icon: '\u{1F464}' },
  ]

  return (
    <div className="border-b border-gray-700 mb-6">
      <div className="flex items-end justify-between">
        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = currentView === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => onChange(tab.value)}
                className={`flex items-center gap-2 px-6 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
                  isActive
                    ? 'text-primary-500 border-primary-500'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="pb-3 text-right">
          <p className="text-sm">
            <span className={current >= limit ? 'text-red-400 font-medium' : 'text-white font-medium'}>{current}</span>
            <span className="text-gray-500"> / {limit} items</span>
          </p>
        </div>
      </div>
    </div>
  )
}
