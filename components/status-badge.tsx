import { cn } from "@/lib/utils"

type Status = "pendiente" | "cobrada" | "vencida" | "contado" | "financiado"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  cobrada: {
    label: "Cobrada",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  vencida: {
    label: "Vencida",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  contado: {
    label: "Contado",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  financiado: {
    label: "Financiado",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
