'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export const dynamic = 'force-dynamic';

export default function SignOutPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { session } = useAuth();
  const t = useTranslations('Auth');

  useEffect(() => {
    const signOut = async () => {
      try {
        // Get the client
        const client = createClient();
        if (!session) {
          console.log('No active session, redirecting...');
          router.push(`/${locale}/auth/sign-in`);
          return;
        }

        // Sign out and clear all auth state
        await client.auth.signOut();
        
        // Clear any local storage
        window.localStorage.removeItem('sb-session');
        window.localStorage.removeItem('supabase.auth.token');
        
        // Redirect to home page
        router.push(`/${locale}`);
        router.refresh();
      } catch (error) {
        console.error('Error signing out:', error);
        // Still redirect on error to avoid getting stuck
        router.push(`/${locale}`);
      }
    };

    signOut();
  }, [router, session, locale]);

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#FFE5D4]">
          {t('signingOut')}
        </h2>
        <p className="mt-2 text-center text-sm text-[#FFE5D4]/80">
          {t('pleaseWait')}
        </p>
      </div>
    </div>
  );
} 