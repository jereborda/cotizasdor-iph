"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { AuthGate } from "@/components/auth-gate"

const NO_SHELL_ROUTES = ["/login"]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showShell = !NO_SHELL_ROUTES.includes(pathname)

  if (!showShell) {
    return (
      <AuthGate>
        {children}
      </AuthGate>
    )
  }

  return (
    <AuthGate>
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
    </AuthGate>
  )
}
