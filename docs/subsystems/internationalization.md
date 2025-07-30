# Internationalization (i18n) Subsystem

## Overview

The Internationalization subsystem provides comprehensive multi-language support throughout the application. Built on next-intl, it enables seamless language switching, localized routing, and dynamic content translation. The system supports three languages (English, Finnish, Swedish) with the ability to dynamically enable/disable languages through the database.

This subsystem goes beyond simple UI translation, providing localized URLs, SEO optimization for each language, and integration with AI services for content translation. It ensures that users experience the application fully in their preferred language while maintaining consistent functionality across all locales.

## Key Components

### Core i18n Configuration (`app/i18n/`)
- **config.ts**: Language configuration and type definitions
- **routing.ts**: Client-side locale detection
- **request-config.ts**: Server request configuration
- **server.ts**: Server-side i18n utilities
- **navigation.ts**: Localized navigation helpers

### Translation Files (`messages/`)
- **en/**: English translations organized by feature
- **fi/**: Finnish translations
- **sv/**: Swedish translations
- Each locale has 15+ JSON files for different features

### Locale Router (`app/[locale]/`)
- All user-facing routes are wrapped in locale segments
- Dynamic locale detection and routing
- Automatic locale prefixing for URLs

### Translation Management (`app/[locale]/admin/translations/`)
- **TranslationEditor.tsx**: Admin interface for managing translations
- **LanguageManager.tsx**: Enable/disable languages dynamically
- **JsonObjectEditor.tsx**: Edit translation JSON structures
- **JsonArrayEditor.tsx**: Manage translation arrays

## Dependencies

### External Dependencies
- `next-intl`: Core internationalization library
- Database tables: `languages`, `translations`

### Internal Dependencies
- Routing & Middleware: Locale detection and routing
- Database Layer: Dynamic language configuration
- All feature subsystems: Use translations for UI text

## Entry Points

### Translation Hooks
1. **`useTranslations()`**: Access translations in client components
2. **`getTranslations()`**: Server-side translation access
3. **`useLocale()`**: Get current locale
4. **`useRouter()`**: Localized navigation

### Configuration APIs
- Language configuration loaded from database
- Fallback to static configuration if database unavailable
- Real-time language updates via Supabase

## Data Flow

### Translation Loading
1. Middleware detects user's preferred locale
2. Locale is validated against enabled languages
3. Translation files are loaded for the locale
4. Messages are provided to components via context

### Dynamic Language Management
1. Admin enables/disables languages in database
2. Real-time updates propagate to all clients
3. Middleware redirects invalid locales to defaults
4. Navigation automatically adjusts available languages

### Content Translation Flow
1. Content created in primary language
2. AI translation services generate other languages
3. Translations stored in database or JSON files
4. Content served based on current locale

## Key Patterns

### Server Component Translation
```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('PageName');
  return <h1>{t('title')}</h1>;
}
```

### Client Component Translation
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('ComponentName');
  return <button>{t('action')}</button>;
}
```

### Localized Routing
```typescript
<Link href={`/${locale}/blog`}>{t('navigation.blog')}</Link>
```

### Dynamic Locale Detection
```typescript
// From Accept-Language header
const preferredLocale = request.headers
  .get('Accept-Language')
  ?.split(',')[0]
  .split('-')[0];
```

## File Inventory

### Core i18n Files
- `app/i18n.ts` - Main i18n configuration
- `app/i18n/config.ts` - Language definitions and types
- `app/i18n/routing.ts` - Client-side locale utilities
- `app/i18n/request-config.ts` - Request configuration
- `app/i18n/request.ts` - Server request helpers
- `app/i18n/server.ts` - Server-side utilities
- `app/i18n/server-utils.ts` - Additional server helpers
- `app/i18n/navigation.ts` - Navigation utilities
- `app/i18n/languages.ts` - Language configurations
- `app/i18n/generated/namespaces.ts` - Auto-generated namespaces

### Translation Files
- `messages/en/*.json` - English translations (15+ files)
- `messages/fi/*.json` - Finnish translations
- `messages/sv/*.json` - Swedish translations
- `messages/README.md` - Translation documentation
- `messages/localization-report.md` - Translation coverage report

### Admin Components
- `app/[locale]/admin/translations/page.tsx` - Translation manager page
- `app/[locale]/admin/translations/TranslationEditor.tsx` - Editor component
- `app/[locale]/admin/translations/LanguageManager.tsx` - Language toggle
- `app/[locale]/admin/translations/SearchFilter.tsx` - Translation search
- `app/[locale]/admin/translations/JsonObjectEditor.tsx` - Object editor
- `app/[locale]/admin/translations/JsonArrayEditor.tsx` - Array editor
- `app/[locale]/admin/translations/utils.ts` - Helper utilities

### Supporting Files
- `middleware.ts` - Locale detection and routing
- `components/LocaleSwitcher.tsx` - Language switcher component
- `utils/i18n-helpers.ts` - i18n utility functions
- `scripts/import-translations.ts` - Import translations to DB
- `scripts/check-translations.ts` - Translation validation
- `scripts/split-locales.js` - Locale file splitter
- `scripts/generate-namespace-manifest.mjs` - Namespace generator

### API Routes
- `app/api/i18n/route.ts` - i18n API endpoints
- `app/api/translations/route.ts` - Translation management API
- `app/api/languages/route.ts` - Language configuration API

### Type Definitions
- Translation message types in each JSON file
- Locale type: 'en' | 'fi' | 'sv'
- Database tables: `languages`, `translations`