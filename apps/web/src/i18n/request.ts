import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from './routing'

/**
 * Only one locale ships in this demo (English), but the app/[locale]
 * routing + next-intl plumbing is kept intact to show how a second
 * locale would be added: drop a new locales/<code>/*.json file and add
 * the code to `locales` above.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../../../locales/${locale}/common.json`)).default,
  }
})
