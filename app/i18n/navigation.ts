import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { staticLocales, defaultLocale } from './config';

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales: staticLocales,
  defaultLocale
});

export type NavigationPath =
  | '/'
  | '/about'
  | '/services'
  | '/tech'
  | '/solutions'
  | '/blog'
  | '/admin'
  | '/admin/blog'
  | '/admin/contacts'
  | '/admin/analytics'
  | '/admin/translations'
  | '/admin/media'
  | '/admin/users'
  | '/domains/healthcare'; 