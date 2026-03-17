"use client"

import { Search, DollarSign, RefreshCw, Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import { useAppState } from "@/lib/app-state"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cotizador", href: "/cotizador", icon: Calculator },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Cuotas", href: "/cuotas", icon: CreditCard },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Configuración", href: "/configuracion", icon: Settings },
]

export function AppHeader() {
  const pathname = usePathname()
  const { dollar, refreshDollar } = useAppState()

  const lastUpdate = new Date(dollar.lastUpdate).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 lg:px-6 bg-card border-b border-border">
      {/* Mobile menu */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <div className="flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <Smartphone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">Cotizador</span>
                <span className="text-xs text-muted-foreground">iPhone AR</span>
              </div>
            </div>
            <nav className="px-3 py-4 space-y-1">
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
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Smartphone className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Cotizador AR</span>
        </div>
      </div>

      {/* Desktop title area */}
      <div className="hidden lg:block" />

      {/* Dollar rate display */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary transition-opacity",
        dollar.loading && "opacity-60"
      )}>
        <DollarSign className={cn("w-4 h-4", dollar.error ? "text-destructive" : "text-primary")} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {dollar.loading ? "..." : `$${dollar.blue.toLocaleString("es-AR")}`}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block" suppressHydrationWarning>
            {dollar.error ? "Error · usando fallback" : `Blue · ${lastUpdate}`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 ml-1"
          onClick={refreshDollar}
          disabled={dollar.loading}
          title="Actualizar dólar"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", dollar.loading && "animate-spin")} />
          <span className="sr-only">Actualizar dólar</span>
        </Button>
      </div>

      {/* Search and actions */}
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-48 lg:w-64 pl-9 h-9 bg-secondary border-transparent focus:border-primary"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        <div className="hidden lg:flex items-center gap-2 ml-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">JD</span>
          </div>
        </div>
      </div>
    </header>
  )
}
