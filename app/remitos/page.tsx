"use client"

import { useState } from "react"
import {
  FileText,
  Check,
  X,
  Clock,
  Smartphone,
  User,
  Phone,
  CreditCard,
  ShoppingCart,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppState } from "@/lib/app-state"
import type { Remito } from "@/lib/mock-data"
import { toast } from "sonner"

const statusConfig = {
  pendiente: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
  aceptado: { label: "Aceptado", variant: "default" as const, icon: Check },
  rechazado: { label: "Rechazado", variant: "destructive" as const, icon: X },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function RemitosPage() {
  const { remitos, remitosLoading, procesarRemito } = useAppState()
  const [selected, setSelected] = useState<Remito | null>(null)
  const [processing, setProcessing] = useState(false)

  const pendientes = remitos.filter((r) => r.status === "pendiente")
  const procesados = remitos.filter((r) => r.status !== "pendiente")

  const handleProcess = async (status: "aceptado" | "rechazado") => {
    if (!selected) return
    setProcessing(true)
    try {
      await procesarRemito(selected.id, status)
      toast.success(status === "aceptado" ? "Remito aceptado" : "Remito rechazado")
      setSelected(null)
    } catch {
      toast.error("Error al procesar remito")
    } finally {
      setProcessing(false)
    }
  }

  const RemitoCard = ({ remito }: { remito: Remito }) => {
    const cfg = statusConfig[remito.status]
    const Icon = cfg.icon
    return (
      <Card
        className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setSelected(remito)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{remito.model} {remito.capacity}</p>
              <p className="text-xs text-muted-foreground">{remito.condition} · {remito.color}</p>
            </div>
            <Badge variant={cfg.variant} className="flex items-center gap-1 shrink-0">
              <Icon className="w-3 h-3" />
              {cfg.label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {remito.client_name}
            </div>
            <div className="flex items-center gap-1">
              {remito.sale_type === "contado"
                ? <ShoppingCart className="w-3 h-3" />
                : <CreditCard className="w-3 h-3" />
              }
              {remito.sale_type === "contado" ? "Contado" : `Financiado ${remito.installments}c`}
            </div>
            {remito.price_usd !== null && (
              <div className="font-mono text-foreground font-medium">
                USD {remito.price_usd.toLocaleString()}
              </div>
            )}
            <div className="text-right">{remito.vendor_name}</div>
          </div>
          <p className="text-xs text-muted-foreground">{formatDate(remito.created_at)}</p>
          {remito.notes && (
            <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
              {remito.notes}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Remitos
        </h1>
        <p className="text-sm text-muted-foreground">
          Pedidos de ventas enviados por los vendedores
        </p>
      </div>

      {remitosLoading ? (
        <p className="text-sm text-muted-foreground">Cargando remitos…</p>
      ) : remitos.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            No hay remitos todavía
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendientes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pendientes ({pendientes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendientes.map((r) => <RemitoCard key={r.id} remito={r} />)}
              </div>
            </div>
          )}

          {procesados.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Procesados ({procesados.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {procesados.map((r) => <RemitoCard key={r.id} remito={r} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                {selected.model} {selected.capacity}
              </DialogTitle>
              <DialogDescription>
                {selected.condition} · {selected.color}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="w-3 h-3" /> {selected.client_name}
                  </p>
                </div>
                {selected.client_phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selected.client_phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Vendedor</p>
                  <p className="font-medium">{selected.vendor_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Forma de pago</p>
                  <p className="font-medium">
                    {selected.sale_type === "contado"
                      ? "Contado"
                      : `Financiado en ${selected.installments} cuotas`}
                  </p>
                </div>
                {selected.price_usd !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground">Precio</p>
                    <p className="font-mono font-semibold text-primary">
                      USD {selected.price_usd.toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDate(selected.created_at)}</p>
                </div>
              </div>

              {selected.notes && (
                <div className="p-3 rounded-lg bg-secondary text-sm">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Notas
                  </p>
                  <p>{selected.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Estado:</p>
                <Badge variant={statusConfig[selected.status].variant}>
                  {statusConfig[selected.status].label}
                </Badge>
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:flex-row flex-col">
              <Button
                variant="secondary"
                onClick={() => setSelected(null)}
                className="flex-1"
              >
                Cerrar
              </Button>
              {selected.status === "pendiente" && (
                <>
                  <Button
                    variant="destructive"
                    disabled={processing}
                    onClick={() => handleProcess("rechazado")}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rechazar
                  </Button>
                  <Button
                    disabled={processing}
                    onClick={() => handleProcess("aceptado")}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aceptar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
