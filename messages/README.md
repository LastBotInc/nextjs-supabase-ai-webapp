# Localization Structure

This folder contains the application's localization files, organized by locale and namespace.

## Directory Structure

```
messages/
├── en/                  # English translations
│   ├── Index.json       # Each namespace has its own file
│   ├── Footer.json
│   ├── Auth.json
│   └── ...
├── fi/                  # Finnish translations
│   ├── Index.json
│   ├── Footer.json
│   └── ...
├── sv/                  # Swedish translations
│   ├── Index.json
│   ├── Footer.json
│   └── ...
├── backup/              # Backup of original monolithic files
│   ├── en.json.bak
│   ├── fi.json.bak
│   └── sv.json.bak
├── localization-report.md  # Report on namespace coverage across locales
└── README.md            # This file
```

## Managing Translations

### Adding New Translations

To add a new translation:

1. Identify the appropriate namespace file (e.g., `en/Blog.json` for blog-related English translations)
2. Add your new key-value pair to the JSON file
3. Repeat for all supported locales (en, fi, sv)

### Adding a New Namespace

To add a completely new namespace:

1. Create a new JSON file in each locale folder with the namespace name (e.g., `Products.json`)
2. Add your translations to each file
3. Run `npm run check-translations` to verify completeness

### Scripts

The project includes several scripts to help manage translations:

- `npm run split-locales`: Splits monolithic locale files into namespace-based files
- `npm run check-translations`: Checks for missing translations between locales
- `npm run import-translations:local`: Imports translations for local development
- `npm run import-translations:prod`: Imports translations for production

## Locale Files Backup

The original monolithic locale files are backed up in the `backup/` directory. If you need to revert to the original structure, you can copy these files back to the root of the `messages/` directory.

## Report

The `localization-report.md` file provides a comprehensive report on namespace coverage across all locales, helping identify any missing translations or namespaces. 