'use client'

import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Register new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href={`/${locale}/auth/sign-in`} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            Sign in
          </Link>
        </p>
        <div className="mt-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/30">
          <p className="text-center text-sm text-blue-700 dark:text-blue-300">
            {t('accountUsage')}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
} 