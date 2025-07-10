'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/i18n/navigation';
import { staticLocales as locales, Locale } from '@/app/i18n/config';
import { useAuth } from '@/components/auth/AuthProvider';
import LocaleSwitcher from './LocaleSwitcher';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Menu, X, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Separate AdminSidebar component
function AdminSidebar({ links, pathname }: { links: Array<{ href: string; label: string }>, pathname?: string }) {
  return (
    <div className="hidden sm:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
      <div className="w-full py-6">
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-white">Admin Dashboard</h2>
        </div>
        <nav className="space-y-1 px-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                pathname?.endsWith(href)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
              <ChevronRight 
                className={`ml-auto h-4 w-4 transition-transform ${
                  pathname?.endsWith(href) ? 'transform rotate-90' : ''
                }`}
              />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const { session, loading, isAdmin, error } = useAuth();
  const [enabledLocales, setEnabledLocales] = useState<string[]>(locales);
  const [showLoading, setShowLoading] = useState(true);
  const supabase = createClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch enabled locales
  const fetchEnabledLocales = useCallback(async () => {
    try {
      const response = await fetch('/api/languages');
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      
      // Filter enabled languages and map to locale codes
      const enabled = data
        .filter((lang: { enabled: boolean }) => lang.enabled)
        .map((lang: { code: string }) => lang.code);
      
      setEnabledLocales(enabled);
    } catch (err) {
      console.error('Error fetching enabled locales:', err);
      // Fall back to static locales
      setEnabledLocales(locales);
    }
  }, []);

  useEffect(() => {
    fetchEnabledLocales();

    // Subscribe to changes
    const channel = supabase
      .channel('languages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'languages'
        },
        () => {
          // Refetch enabled locales when any change occurs
          fetchEnabledLocales();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchEnabledLocales]);

  // Force loading to false after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Force ending loading state after timeout')
        setShowLoading(false)
      }
    }, 3000) // Reduced timeout to 3 seconds since we improved auth state handling

    // If we have definitive auth state or error, update immediately
    if (!loading || error) {
      console.log('Auth state resolved:', { loading, error, session })
      setShowLoading(false)
    }

    return () => clearTimeout(timer)
  }, [loading, error, session])

  // Don't render navigation links until we have definitive auth state or error
  const shouldShowLinks = !showLoading || error

  // Split path into parts and remove empty strings
  const pathParts = pathname?.split('/').filter(Boolean) || [];
  
  // Detect admin path - check after locale part (index 1 since locale is index 0)
  const isAdminPath = pathParts.length > 1 && pathParts[1] === 'admin';

  // Define admin links - only show if user is admin and auth is complete without errors
  const adminLinks = (!loading && isAdmin && !error) ? [
    { href: '/admin/analytics', label: t('admin.analytics') },
    { href: '/admin/blog', label: t('admin.blog') },
    { href: '/admin/seo', label: t('admin.seo') },
    { href: '/admin/users', label: t('admin.users') },
    { href: '/admin/contacts', label: t('admin.contacts') },
    { href: '/admin/calendar', label: t('admin.calendar') },
    { href: '/admin/landing-pages', label: t('admin.landingPages') },
    { href: '/admin/media', label: t('admin.media') },
    { href: '/admin/translations', label: t('admin.translations') }
  ] : [];

  // Define public links without locale prefix (Link component will add it)
  const publicLinks = [
    { href: '/', label: t('home') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
    { href: '/book/initial-consultation', label: t('book') },
  ];

  // Use admin links if in admin section and user is admin and auth is complete
  const links = (!loading && isAdminPath && isAdmin) 
    ? adminLinks 
    : publicLinks;

  // Desktop auth buttons section
  const renderAuthButtons = () => (
    <>
      {(!loading && isAdminPath && isAdmin) ? (
        <>
          <Link
            href="/"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            {t('backToSite')}
          </Link>
          <Link
            href="/auth/sign-out"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            {t('signOut')}
          </Link>
        </>
      ) : (
        <>
          {session ? (
            <>
              <Link
                href="/account/settings"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {t('account.title')}
              </Link>
              {(!loading && isAdmin && !isAdminPath) && (
                <Link
                  href="/admin/blog"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {t('admin_link')}
                </Link>
              )}
              <Link
                href="/auth/sign-out"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {t('signOut')}
              </Link>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {t('signIn')}
            </Link>
          )}
        </>
      )}
    </>
  );

  // Add menu toggle function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when path changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href={(!loading && isAdmin && isAdminPath) ? '/admin/blog' : '/'}
                className="flex items-center py-2"
              >
                <Image
                  src="/images/lastbot-logo-320x90.png"
                  alt="LastBot"
                  width={128}
                  height={36}
                  className="h-9 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation - Always show public links */}
            <div className="hidden sm:flex items-center space-x-1">
              {shouldShowLinks ? publicLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname?.endsWith(href)
                      ? 'text-white bg-gray-700'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {label}
                </Link>
              )) : (
                <div className="animate-pulse space-x-1">
                  {[1,2,3].map((i) => (
                    <div key={i} className="inline-block w-20 h-8 bg-gray-700 rounded-md" />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-5">
              <div className="min-w-[120px]">
                <LocaleSwitcher />
              </div>
              {showLoading ? (
                <div className="animate-pulse w-16 h-6 bg-gray-700 rounded" />
              ) : (
                <div className="hidden sm:flex items-center space-x-4">
                  {session ? (
                    <>
                      <Link
                        href="/account/settings"
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        {t('account.title')}
                      </Link>
                      {(!loading && isAdmin) && (
                        <Link
                          href="/admin/blog"
                          className={`text-sm font-medium transition-colors ${
                            isAdminPath 
                              ? 'text-white bg-gray-700 px-3 py-2 rounded-md'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {t('admin_link')}
                        </Link>
                      )}
                      <Link
                        href="/auth/sign-out"
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        {t('signOut')}
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/auth/sign-in"
                      className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      {t('signIn')}
                    </Link>
                  )}
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Sidebar - Desktop only */}
      {(!loading && isAdmin && isAdminPath) && (
        <AdminSidebar links={adminLinks} pathname={pathname} />
      )}

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } fixed inset-y-0 right-0 w-full sm:hidden bg-gray-900 transform transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="pt-20 pb-3 space-y-1 px-4">
          {/* Show admin or public links based on path */}
          {(!loading && isAdmin && isAdminPath) ? (
            <>
              {adminLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname?.endsWith(href)
                      ? 'text-white bg-gray-700'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/"
                className="block px-3 py-2 mt-4 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 border-t border-gray-700"
              >
                {t('backToSite')}
              </Link>
            </>
          ) : (
            publicLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname?.endsWith(href)
                    ? 'text-white bg-gray-700'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {label}
              </Link>
            ))
          )}

          {/* Mobile auth buttons */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between px-3 py-3">
              <LocaleSwitcher />
            </div>
            {!showLoading && (
              <>
                {session ? (
                  <>
                    <Link
                      href="/account/settings"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      {t('account.title')}
                    </Link>
                    {(!loading && isAdmin && !isAdminPath) && (
                      <Link
                        href="/admin/blog"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        {t('admin_link')}
                      </Link>
                    )}
                    <Link
                      href="/auth/sign-out"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      {t('signOut')}
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    {t('signIn')}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
