import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { MobileNav } from '@/components/mobile-nav'
import { AppStateProvider } from '@/lib/app-state'
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
        <AppStateProvider>
          <div className="min-h-screen bg-background">
            <AppSidebar />
            <div className="lg:pl-64">
              <AppHeader />
              <main className="pb-20 lg:pb-0">
                {children}
              </main>
            </div>
            <MobileNav />
          </div>
        </AppStateProvider>
        <Toaster theme="dark" richColors position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}
