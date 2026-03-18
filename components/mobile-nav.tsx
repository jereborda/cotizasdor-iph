"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calculator,
  ShoppingCart,
  CreditCard,
  Settings,
  Tag,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const adminNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cotizador", href: "/cotizador", icon: Calculator },
  { name: "Vendedor", href: "/vendedor", icon: Tag },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Cuotas", href: "/cuotas", icon: CreditCard },
  { name: "Remitos", href: "/remitos", icon: FileText },
  { name: "Config", href: "/configuracion", icon: Settings },
]

const vendorNav = [
  { name: "Cotizaciones", href: "/vendedor", icon: Tag },
]

export function MobileNav() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const navigation = profile?.role === "vendor" ? vendorNav : adminNav

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-[52px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
