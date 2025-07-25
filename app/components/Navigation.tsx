'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/i18n/navigation';
import { staticLocales as locales, Locale } from '@/app/i18n/config';
import { useAuth } from '@/components/auth/AuthProvider';
import LocaleSwitcher from './LocaleSwitcher';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Menu, X, ChevronRight, ChevronDown, User, FileText } from 'lucide-react';
import Image from 'next/image';
import LastBotSearch from '@/components/lastbot/LastBotSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Separate AdminSidebar component
function AdminSidebar({ links, pathname }: { links: Array<{ href: string; label: string; icon?: any; children?: Array<{ href: string; label: string }> }>, pathname?: string }) {
  // Initialize expanded items based on current path
  const getInitialExpandedItems = () => {
    const expanded: string[] = [];
    links.forEach(link => {
      if (link.children) {
        // Expand if the parent or any child is active
        if (pathname?.endsWith(link.href) || link.children.some(child => pathname?.endsWith(child.href))) {
          expanded.push(link.label);
        }
      }
    });
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpandedItems());

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isChildActive = (children?: Array<{ href: string; label: string }>) => {
    if (!children) return false;
    return children.some(child => pathname?.endsWith(child.href));
  };

  return (
    <div className="hidden sm:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
      <div className="w-full py-6">
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-white">Admin Dashboard</h2>
        </div>
        <nav className="space-y-1 px-2">
          {links.map(({ href, label, icon: Icon, children }) => {
            const isExpanded = expandedItems.includes(label) || isChildActive(children);
            const hasChildren = children && children.length > 0;
            
            return (
              <div key={href}>
                {hasChildren ? (
                  <>
                    <Link
                      href={href}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        pathname?.endsWith(href) || isChildActive(children)
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {Icon && <Icon className="mr-3 h-4 w-4" />}
                      {label}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpanded(label);
                        }}
                        className="ml-auto p-1 hover:bg-gray-700 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </Link>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                              pathname?.endsWith(child.href)
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      pathname?.endsWith(href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {Icon && <Icon className="mr-3 h-4 w-4" />}
                    {label}
                    <ChevronRight 
                      className={`ml-auto h-4 w-4 transition-transform ${
                        pathname?.endsWith(href) ? 'transform rotate-90' : ''
                      }`}
                    />
                  </Link>
                )}
              </div>
            );
          })}
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
    { 
      href: '/admin/cms', 
      label: t('admin.cms'),
      icon: FileText,
      children: [
        { href: '/admin/content-calendar', label: t('admin.contentCalendar') },
        { href: '/admin/blog', label: t('admin.blog') },
        { href: '/admin/seo', label: t('admin.seo') },
        { href: '/admin/media', label: t('admin.media') }
      ]
    },
    { href: '/admin/users', label: t('admin.users') },
    { href: '/admin/contacts', label: t('admin.contacts') },
    { href: '/admin/calendar', label: t('admin.calendar') },
    { href: '/admin/landing-pages', label: t('admin.landingPages') },
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
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors outline-none">
            <User className="h-4 w-4 mr-2" />
            {t('account.title')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/account/settings">{t('account.settings')}</Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">{t('admin_link')}</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth/sign-out">{t('signOut')}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          href="/auth/sign-in"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          {t('signIn')}
        </Link>
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

            <div className="flex items-center space-x-4">
              <LastBotSearch />
              <LocaleSwitcher />
              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center">
                {shouldShowLinks && renderAuthButtons()}
              </div>
            </div>

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
      </nav>

      {/* Admin Sidebar - Desktop only */}
      {(!loading && isAdmin && isAdminPath) && (
        <AdminSidebar links={adminLinks} pathname={pathname} />
      )}

      {/* Mobile menu */}
      <div
        className={`sm:hidden fixed top-0 left-0 h-full w-full bg-black bg-opacity-90 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <span className="text-white font-semibold text-lg">Menu</span>
            <button onClick={toggleMenu} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            {links.map(({ href, label, children }) => (
              <div key={href}>
                {children ? (
                  <div>
                    <div className="px-3 py-2 text-base font-medium text-gray-500">
                      {label}
                    </div>
                    <div className="ml-4 space-y-2">
                      {children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={href}
                    className="px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    {label}
                  </Link>
                )}
              </div>
            ))}
            <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
              <LocaleSwitcher />
              {renderAuthButtons()}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
