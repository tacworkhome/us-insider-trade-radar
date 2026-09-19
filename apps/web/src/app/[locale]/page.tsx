import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{t('title')}</h1>
      <p className="text-primary-400 font-medium mb-6">{t('subtitle')}</p>
      <p className="text-gray-400 max-w-2xl mx-auto mb-10">{t('tagline')}</p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/signals"
          className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition"
        >
          {t('cta.signals')}
        </Link>
        <Link
          href="/company/0009990001/report"
          className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition border border-gray-700"
        >
          {t('cta.company')}
        </Link>
        <Link
          href="/watchlist"
          className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition border border-gray-700"
        >
          {t('cta.watchlist')}
        </Link>
      </div>

      <div className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-1">Clean Architecture</h2>
          <p className="text-sm text-gray-400">UI → ViewModel → Repository → data, with the watchlist feature fully layered from domain to UI.</p>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-1">TDD</h2>
          <p className="text-sm text-gray-400">Domain, application, and infrastructure layers all ship with unit tests written before the implementation.</p>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-1">Strict TypeScript</h2>
          <p className="text-sm text-gray-400">No `any` in new code, repository-pattern boundaries, and dependency-injected ViewModels for testability.</p>
        </div>
      </div>
    </div>
  )
}
