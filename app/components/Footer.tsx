'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import InnoleaseLogo from '@/app/components/InnoleaseLogo';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navigation');
  const { session, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLocale = pathname?.split('/')[1] || 'en';
    router.push(`/${currentLocale}/auth/sign-in`);
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Company Information */}
          <div>
            <InnoleaseLogo className="h-8 mb-4" />
            <p className="text-sm text-gray-600 mt-2">
              Innolease Oy
            </p>
            <p className="text-sm text-gray-600">
              Katuosoite 10<br />
              01150 Kaupunki
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Y-tunnus: 2661196-9
            </p>
          </div>
          
          {/* Column 2: Office Locations */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t('office_locations')}
            </h3>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/yhteystiedot?city=helsinki`} className="text-sm text-gray-600 hover:text-gray-900">Helsinki</Link></li>
              <li><Link href={`/${locale}/yhteystiedot?city=oulu`} className="text-sm text-gray-600 hover:text-gray-900">Oulu</Link></li>
              <li><Link href={`/${locale}/yhteystiedot?city=vantaa`} className="text-sm text-gray-600 hover:text-gray-900">Vantaa</Link></li>
              <li><Link href={`/${locale}/yhteystiedot?city=raisio`} className="text-sm text-gray-600 hover:text-gray-900">Raisio</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t('resources')}
            </h3>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/kalustoraportti`} className="text-sm text-gray-600 hover:text-gray-900">{t('fleet_reporting')}</Link></li>
              <li><Link href={`/${locale}/paastoraportti`} className="text-sm text-gray-600 hover:text-gray-900">{t('emissions_report')}</Link></li>
              <li><Link href={`/${locale}/sahkoinen-ajopaivakirja`} className="text-sm text-gray-600 hover:text-gray-900">{t('driving_log')}</Link></li>
              <li><Link href={`/${locale}/autoilijan-opas`} className="text-sm text-gray-600 hover:text-gray-900">{t('drivers_guide')}</Link></li>
              <li><Link href={`/${locale}/leasingauton-palautusohje`} className="text-sm text-gray-600 hover:text-gray-900">{t('leasing_car_return')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t('tools')}
            </h3>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/autopaattajan-tyokalut`} className="text-sm text-gray-600 hover:text-gray-900">{t('car_decision_tools')}</Link></li>
              <li><Link href={`/${locale}/autoetulaskuri`} className="text-sm text-gray-600 hover:text-gray-900">{t('car_benefit_calculator')}</Link></li>
              <li><Link href={`/${locale}/sahkoautojen-vertailu`} className="text-sm text-gray-600 hover:text-gray-900">{t('ev_comparison')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom section with social media, copyright, etc. */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            {/* Copyright info */}
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Innolease Oy. {t('rights')}
              </p>
              <div className="flex space-x-4">
                <Link href={`/${locale}/privacy`} className="text-xs text-gray-500 hover:text-gray-700">{t('privacy')}</Link>
                <Link href={`/${locale}/terms`} className="text-xs text-gray-500 hover:text-gray-700">{t('terms')}</Link>
                <Link href={`/${locale}/cookies`} className="text-xs text-gray-500 hover:text-gray-700">{t('cookies')}</Link>
              </div>
            </div>

            {/* Social media and Auth Links */}
            <div className="flex items-center space-x-4 justify-start md:justify-end text-xs">
              {/* Social links */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              
              {/* Vertical divider */}
              <span className="border-l border-gray-300 h-4 mx-2"></span>

              {/* Auth links - conditional rendering */}
              {loading ? (
                <div className="animate-pulse w-24 h-4 bg-gray-300 rounded"></div>
              ) : session ? (
                <>
                  <Link href="/account/settings" className="text-gray-500 hover:text-gray-700">
                    {tNav('account.title')}
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/blog" className="text-gray-500 hover:text-gray-700">
                      {tNav('admin_link')}
                    </Link>
                  )}
                  <Link href="/auth/sign-out" className="text-gray-500 hover:text-gray-700">
                    {tNav('signOut')}
                  </Link>
                </>
              ) : (
                <Link href="/auth/sign-in" className="text-gray-500 hover:text-gray-700">
                  {tNav('signIn')}
                </Link>
              )}
            </div>
          </div>
          
          {/* Newsletter signup */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <p className="text-sm text-gray-500 mb-4 md:mb-0">{t('newsletter.subscribe')}</p>
              <div className="flex max-w-md">
                <input 
                  type="email" 
                  placeholder={t('newsletter.email_placeholder')} 
                  className="min-w-0 flex-1 px-4 py-2 text-sm rounded-l-md border border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                />
                <button 
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-r-md"
                >
                  {t('newsletter.button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
