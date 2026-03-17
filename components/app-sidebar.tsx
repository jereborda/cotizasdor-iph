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
  Smartphone,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cotizador", href: "/cotizador", icon: Calculator },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Cuotas", href: "/cuotas", icon: CreditCard },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Configuración", href: "/configuracion", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <Smartphone className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Cotizador</span>
          <span className="text-xs text-muted-foreground">iPhone AR</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-sidebar-primary")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">JD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">Jeremías</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
