import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { generateCompanyReport } from '@radar/shared/application/company/use-cases/GenerateCompanyReportUseCase'
import { convertToInsiderTrades } from '@radar/shared/utils/insider-trade'
import { formatCurrency, formatNumber } from '@radar/shared/utils/format'
import { getCompanyMock } from '@/mocks/company'
import { StockLineChart } from '@/components/charts/StockLineChart'
import { InsiderActivityChart } from '@/components/charts/InsiderActivityChart'

export default async function CompanyReportPage({ params }: { params: { cik: string } }) {
  const mock = getCompanyMock(params.cik)
  if (!mock) notFound()

  const t = await getTranslations('company.report')
  const { profile, history, transactions } = mock
  const report = generateCompanyReport(profile.symbol, profile.name, transactions, 240)
  const insiderTrades = convertToInsiderTrades(transactions, 400)
  const currentPrice = history[history.length - 1]?.close ?? null

  const signalLabels: Record<keyof typeof report.signals, string> = {
    clusterBuying: 'Cluster Buying',
    repeatBuyer: 'Repeat Buyer',
    buyingOnly: 'Buying Only',
    increasingSize: 'Increasing Size',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <p className="text-sm text-gray-500">CIK {profile.cik}</p>
        <h1 className="text-3xl font-bold text-white">
          {profile.name} <span className="text-primary-400">({profile.symbol})</span>
        </h1>
        <p className="text-gray-400 mt-2">{t('title')}</p>
      </div>

      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 sm:p-6 mb-8">
        <StockLineChart history={history} insiderTrades={insiderTrades} currentPrice={currentPrice} height={340} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">{t('netActivity')}</h2>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-gray-400">Total buys</dt>
            <dd className="text-right text-green-400 font-medium">{report.insiderActivity.totalBuys}</dd>
            <dt className="text-gray-400">Total sells</dt>
            <dd className="text-right text-red-400 font-medium">{report.insiderActivity.totalSells}</dd>
            <dt className="text-gray-400">Unique insiders</dt>
            <dd className="text-right text-white font-medium">{report.insiderActivity.uniqueInsiders}</dd>
            <dt className="text-gray-400">Net shares</dt>
            <dd className="text-right text-white font-medium">{formatNumber(report.insiderActivity.netShares)}</dd>
            <dt className="text-gray-400">Net value</dt>
            <dd className="text-right text-white font-medium">{formatCurrency(report.insiderActivity.netValue)}</dd>
          </dl>
        </div>

        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">{t('confidenceScore')}</h2>
            <span className="text-2xl font-bold text-primary-400">{report.confidenceScore}/100</span>
          </div>
          <ul className="space-y-2 text-sm">
            {Object.entries(report.signals).map(([key, active]) => (
              <li key={key} className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${active ? 'bg-green-400' : 'bg-gray-600'}`} />
                <span className={active ? 'text-white' : 'text-gray-500'}>
                  {signalLabels[key as keyof typeof signalLabels]}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-4">{t('weightsDisclaimer')}</p>
        </div>
      </div>

      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-2">Monthly buy/sell value</h2>
        <InsiderActivityChart transactions={transactions} />
      </div>

      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">{t('topTransactions')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 pr-4">Insider</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4 text-right">Shares</th>
                <th className="py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {report.topTransactions.map((tx, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 text-white">{tx.ownerName}</td>
                  <td className="py-2 pr-4 text-gray-400">{tx.officerTitle || '-'}</td>
                  <td className="py-2 pr-4 text-gray-400">{tx.date}</td>
                  <td className="py-2 pr-4 text-right text-green-400">{formatNumber(tx.shares)}</td>
                  <td className="py-2 text-right text-green-400">{formatCurrency(tx.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-8 italic">{report.summary}</p>
    </div>
  )
}
