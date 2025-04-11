'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import InnoleaseLogo from '@/app/components/InnoleaseLogo';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navigation');
  const { session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLocale = pathname?.split('/')[1] || 'en';
    router.push(`/${currentLocale}/auth/sign-in`);
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Innolease Info */}
          <div>
            <InnoleaseLogo className="h-8 mb-4" />
            <p className="text-sm text-gray-600">
              Osa Autolle.com-konsernia.
              <br />
              Ratamotie 24, 90630 Oulu.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Pikalinkit</h3>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/leasing-solutions`} className="text-sm text-gray-600 hover:text-gray-900">{tNav('solutions')}</Link></li>
              <li><Link href={`/${locale}/about`} className="text-sm text-gray-600 hover:text-gray-900">{tNav('about')}</Link></li>
              <li><Link href={`/${locale}/blog`} className="text-sm text-gray-600 hover:text-gray-900">{tNav('blog')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="text-sm text-gray-600 hover:text-gray-900">{tNav('contact')}</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Lakitiedot</h3>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/privacy`} className="text-sm text-gray-600 hover:text-gray-900">{t('privacy')}</Link></li>
              <li><Link href={`/${locale}/terms`} className="text-sm text-gray-600 hover:text-gray-900">{t('terms')}</Link></li>
              {/* <li><Link href={`/${locale}/presentations`} className="text-sm text-gray-600 hover:text-gray-900">{t('presentations')}</Link></li> */}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Innolease Oy. {t('rights')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Social links can be added here */}
            <Link href={`/${locale}/admin`} className="text-xs text-gray-500 hover:text-gray-700">{t('adminLogin')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
