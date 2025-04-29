## 2024-07-29
- Updated Finnish, Swedish, and English translations (`messages/fi.json`, `messages/sv.json`, `messages/en.json`) for navigation and footer sections, standardizing terms like "Mini-Leasing" and refining various service descriptions.
- Refactored authentication links: Moved Sign In/Account/Admin/Sign Out links from `Navigation.tsx` to `Footer.tsx` and made `LocaleSwitcher` in navigation more compact.
- Improved `LocaleSwitcher` component to be more space-efficient by showing language codes (EN, FI, SV) instead of full native names. 