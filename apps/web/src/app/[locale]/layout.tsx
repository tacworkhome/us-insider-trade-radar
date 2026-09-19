import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Link from 'next/link'
import '../globals.css'

export const metadata: Metadata = {
  title: 'US Insider Trade Radar (demo)',
  description:
    'Architecture showcase extracted from a real production insider-trading signal product. All data is mock/fixture data.',
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-900 text-gray-100">
        <NextIntlClientProvider messages={messages}>
          <header className="border-b border-gray-800">
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-6">
              <Link href="/" className="font-bold text-white">
                US Insider Trade Radar <span className="text-primary-400 text-sm font-normal">demo</span>
              </Link>
              <div className="flex gap-4 text-sm text-gray-300">
                <Link href="/signals" className="hover:text-white transition">Signals</Link>
                <Link href="/company/0009990001/report" className="hover:text-white transition">Company Report</Link>
                <Link href="/watchlist" className="hover:text-white transition">Watchlist</Link>
              </div>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-xs text-gray-500">
            Demo project. All companies, insiders, and transactions shown are fictional fixture data.
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
