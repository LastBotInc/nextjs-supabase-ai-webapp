'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

export function ThemeProviderClient({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {mounted ? children : null}
    </NextThemeProvider>
  );
}
