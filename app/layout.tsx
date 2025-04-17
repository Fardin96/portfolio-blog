import Navigation from '../components/Navigation';
import { ThemeProvider } from '../components/theme-provider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className='h-full'
      suppressHydrationWarning
      data-theme='dark'
    >
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
