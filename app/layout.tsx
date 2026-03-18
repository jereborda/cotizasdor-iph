import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AppStateProvider } from '@/lib/app-state'
import { AuthProvider } from '@/lib/auth-context'
import { AppShell } from '@/components/app-shell'
import { Toaster } from 'sonner'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Cotizador iPhone AR',
  description: 'Sistema de cotización y gestión de ventas de iPhones',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className="font-sans antialiased">
        <AuthProvider>
          <AppStateProvider>
            <AppShell>
              {children}
            </AppShell>
          </AppStateProvider>
        </AuthProvider>
        <Toaster theme="dark" richColors position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}
