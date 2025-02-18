'use client';

import { useCallback } from 'react';
import Turnstile from 'react-turnstile';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  className?: string;
}

export function TurnstileWidget({ onVerify, onError, onExpire, className = '' }: TurnstileProps) {
  const handleVerify = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  const handleError = useCallback((error: any) => {
    console.error('Turnstile error:', error);
    onError?.(error);
  }, [onError]);

  const handleExpire = useCallback(() => {
    console.log('Turnstile token expired');
    onExpire?.();
  }, [onExpire]);

  return (
    <div className={className}>
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        theme="auto"
      />
    </div>
  );
} 