'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export function CookieConsent() {
  const t = useTranslations('CookieConsent');
  const { toast } = useToast();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShowBanner(false);
    toast({
      description: t('accepted'),
      duration: 3000,
    });
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'false');
    setShowBanner(false);
    // Here you would typically disable non-essential cookies
    toast({
      description: t('declined'),
      duration: 3000,
    });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          {t('message')}
          <Link 
            href="/privacy" 
            className="underline ml-1 hover:text-foreground"
            aria-label={t('privacyPolicyAriaLabel')}
          >
            {t('privacyPolicy')}
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted"
          >
            {t('decline')}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
} 