import { pick } from 'lodash'
import { useMessages } from 'next-intl'
import { NextIntlClientProvider } from 'next-intl'
import { CookieConsent } from './cookie-consent'

export function CookieConsentWrapper() {
  const messages = useMessages()
  
  return (
    <NextIntlClientProvider messages={pick(messages, ['CookieConsent'])}>
      <CookieConsent />
    </NextIntlClientProvider>
  )
} 