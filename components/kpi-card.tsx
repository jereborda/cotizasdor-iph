import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

const variantStyles = {
  default: "bg-card border-border",
  success: "bg-card border-primary/30",
  warning: "bg-card border-warning/30",
  danger: "bg-card border-destructive/30",
  info: "bg-card border-accent/30",
}

const iconVariantStyles = {
  default: "bg-secondary text-muted-foreground",
  success: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-accent/10 text-accent",
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: KPICardProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-4 rounded-xl border transition-colors",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            iconVariantStyles[variant]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
