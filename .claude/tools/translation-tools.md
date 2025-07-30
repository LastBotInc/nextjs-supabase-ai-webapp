# Translation & Localization Tools

## Overview
Tools for managing translations across English, Finnish, and Swedish locales.

## Available Commands

### Check Translations
Compare translation files for completeness and missing keys.
```bash
npm run check-translations
```

### Import Translations
Import translations to the appropriate environment.
```bash
# Local development
npm run import-translations:local

# Production
npm run import-translations:prod
```

### Split Locale Files
Split monolithic locale files into namespace-based files.
```bash
npm run split-locales
```

## Translation Workflow

1. **Add New Translations**
   - Add keys to English file first (`messages/en/*.json`)
   - Use consistent naming: `namespace.section.key`
   - Keep descriptions clear and contextual

2. **Translate to Other Locales**
   - Copy structure to `fi/` and `sv/` directories
   - Translate naturally, not word-for-word
   - Consider UI space constraints

3. **Verify Completeness**
   ```bash
   npm run check-translations
   ```

4. **Import to Database**
   ```bash
   npm run import-translations:local
   ```

## Best Practices

### Key Naming
```json
{
  "auth": {
    "login": {
      "title": "Sign In",
      "button": "Sign In",
      "error": "Invalid credentials"
    }
  }
}
```

### Dynamic Values
```json
{
  "welcome": "Welcome, {name}!",
  "items": "{count, plural, =0 {no items} =1 {one item} other {# items}}"
}
```

### Rich Text
```json
{
  "terms": "By continuing, you agree to our <link>Terms of Service</link>"
}
```

## Common Issues

### Missing Translations
- Run `check-translations` regularly
- Fix missing keys before deployment
- Use fallback to English if needed

### Character Encoding
- Ensure files are UTF-8
- Test special characters (ä, ö, å)
- Verify in UI after import