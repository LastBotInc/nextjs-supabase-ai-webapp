'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TurnstileWidget } from '@/components/ui/turnstile';

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const router = useRouter();
  const { locale } = useParams();
  const supabase = createClientComponentClient();
  const t = useTranslations('Auth');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!turnstileToken) {
      setError(t('error.captcha'));
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const company = formData.get('company') as string;
    const newsletter = formData.get('newsletter') === 'on';
    const marketing = formData.get('marketing') === 'on';

    try {
      // Validate turnstile token first
      const validateResponse = await fetch('/api/auth/validate-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: turnstileToken }),
      });

      if (!validateResponse.ok) {
        throw new Error(t('error.captchaValidation'));
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/${locale}`,
          data: {
            username: email.split('@')[0],
            full_name: name,
            company,
            newsletter_subscription: newsletter,
            marketing_consent: marketing,
          },
        },
      });

      if (signUpError) throw signUpError;

      // If email confirmation is not required (based on Supabase settings)
      // data.session will be available and user will be automatically signed in
      if (data?.session) {
        // Check if user is admin (they won't be, but keeping the check for consistency)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user!.id)
          .single();

        // Redirect admin to admin panel, others to home
        router.push(profile?.is_admin ? `/${locale}/admin` : `/${locale}`);
        router.refresh();
      } else {
        // Email confirmation is required, redirect to check-email page
        router.push(`/${locale}/auth/check-email`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : t('error.register'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fullName')}
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('email')}
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('password')}
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('company')}
        </label>
        <input
          type="text"
          name="company"
          id="company"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="newsletter"
            id="newsletter"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
          />
          <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {t('newsletter')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="marketing"
            id="marketing"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
          />
          <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {t('marketing')}
          </label>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('privacyNotice')}
        </p>
      </div>

      <TurnstileWidget
        onVerify={setTurnstileToken}
        onError={() => setError(t('error.captcha'))}
        onExpire={() => setTurnstileToken(null)}
        className="mt-4"
      />

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !turnstileToken}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
      >
        {loading ? t('creatingAccount') : t('register')}
      </button>
    </form>
  );
} 