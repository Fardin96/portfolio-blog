'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>): React.ReactElement<
  typeof NextThemesProvider
> {
  return (
    <NextThemesProvider attribute='class' {...props}>
      {children}
    </NextThemesProvider>
  );
}
