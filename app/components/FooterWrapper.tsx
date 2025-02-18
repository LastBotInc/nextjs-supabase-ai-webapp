import React from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import Footer from './Footer';

export default function FooterWrapper() {
  const messages = useMessages();
  
  return (
    <NextIntlClientProvider messages={messages}>
      <Footer />
    </NextIntlClientProvider>
  );
} 