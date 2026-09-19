import { getTranslations } from 'next-intl/server'
import { mockClusterBuySignals } from '@radar/shared/mocks/signals'
import { SignalsTable } from './SignalsTable'

export default async function SignalsPage() {
  const t = await getTranslations('signals')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('page.title')}</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">{t('page.description')}</p>
      </div>

      <SignalsTable signals={mockClusterBuySignals} />
    </div>
  )
}
