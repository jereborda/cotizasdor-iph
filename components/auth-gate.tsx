"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Smartphone } from "lucide-react"

// Pages accessible by vendor role
const VENDOR_ROUTES = ["/vendedor"]
// Pages that don't require auth
const PUBLIC_ROUTES = ["/login"]

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    const isPublic = PUBLIC_ROUTES.includes(pathname)

    // Not logged in → login
    if (!user && !isPublic) {
      router.replace("/login")
      return
    }

    // Logged in but on login page → redirect to correct home
    if (user && isPublic) {
      if (profile?.role === "vendor") {
        router.replace("/vendedor")
      } else {
        router.replace("/")
      }
      return
    }

    // Vendor trying to access admin-only pages
    if (user && profile?.role === "vendor" && !VENDOR_ROUTES.includes(pathname)) {
      router.replace("/vendedor")
      return
    }
  }, [loading, user, profile, pathname, router])

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary animate-pulse">
            <Smartphone className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm">Cargando…</p>
        </div>
      </div>
    )
  }

  // On public route (login) — always render
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>
  }

  // Not authenticated
  if (!user) return null

  // Vendor on wrong page (redirect in progress)
  if (profile?.role === "vendor" && !VENDOR_ROUTES.includes(pathname)) return null

  return <>{children}</>
}
