import Navigation from '../components/Navigation';
import { ThemeProvider } from '../components/theme-provider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />

          <main className='container mx-auto p-4'>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
