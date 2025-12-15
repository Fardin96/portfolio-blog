import { Metadata } from 'next';
import Navigation from '../components/Navigation';
import { ThemeProvider } from '../components/theme-provider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: "😴💭 Farabi's Portfolio-Blog",
  description:
    "Farabi's personal portfolio and blog — chill, code, and creativity.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps): React.ReactNode {
  return (
    <html lang='en' className='h-full' suppressHydrationWarning>
      <body className='h-full'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />

          <main className='h-full container mx-auto p-4'>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
