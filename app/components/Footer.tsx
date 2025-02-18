'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('Footer');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';
  const router = useRouter();

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLocale = pathname?.split('/')[1] || 'en';
    router.push(`/${currentLocale}/auth/sign-in`);
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-gray-700 dark:text-gray-200 text-sm">
            © {new Date().getFullYear()} LastBot Inc. {t('rights')}
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <Link
              href={`/${locale}/presentations`}
              className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('presentations')}
            </Link>
            <Link
              href={`/${locale}/privacy`}
              className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('privacy')}
            </Link>
            <Link
              href={`/${locale}/auth/sign-in`}
              className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={handleSignIn}
            >
              {t('adminLogin')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
