import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { getCsrfToken } from '@/lib/security';

export const metadata: Metadata = {
  title: 'Motorcycle Ride Journal',
  description: 'A luxury motorcycle ride blogging platform.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const csrf = getCsrfToken();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <input type="hidden" id="csrf-token" value={csrf} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
