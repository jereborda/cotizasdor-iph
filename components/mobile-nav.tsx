"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calculator,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cotizador", href: "/cotizador", icon: Calculator },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Cuotas", href: "/cuotas", icon: CreditCard },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Config", href: "/configuracion", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

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
