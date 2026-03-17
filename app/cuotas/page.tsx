"use client"

import { useState, useMemo, useCallback } from "react"
import {
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  MessageSquare,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KPICard } from "@/components/kpi-card"
import { StatusBadge } from "@/components/status-badge"
import { type Installment } from "@/lib/mock-data"
import { useAppState } from "@/lib/app-state"
import { toast } from "sonner"

type InstallmentWithClient = Installment & { clientName: string; model: string }

export default function CuotasPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [markingPaid, setMarkingPaid] = useState<InstallmentWithClient | null>(null)
  const { sales, marcarCuotaCobrada, dollar } = useAppState()

  const [dollarRateForPayment, setDollarRateForPayment] = useState(dollar.blue)

  const allInstallments = useMemo((): InstallmentWithClient[] => {
    const result: InstallmentWithClient[] = []
    sales.forEach((sale) => {
      if (sale.installments) {
        sale.installments.forEach((inst) => {
          result.push({ ...inst, clientName: sale.clientName, model: sale.model })
        })
      }
    })
    return result
  }, [sales])

  // Calculate stats
  const stats = useMemo(() => {
    const pending = allInstallments.filter((i) => i.status === "pendiente")
    const overdue = allInstallments.filter((i) => i.status === "vencida")
    const paid = allInstallments.filter((i) => i.status === "cobrada")

    const today = new Date().toISOString().split("T")[0]
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()

    const paidThisMonth = paid.filter((i) => {
      if (!i.paidDate) return false
      const paidDate = new Date(i.paidDate)
      return paidDate.getMonth() === thisMonth && paidDate.getFullYear() === thisYear
    })

    return {
      pendingCount: pending.length,
      overdueCount: overdue.length,
      paidThisMonthCount: paidThisMonth.length,
      totalPendingUSD: pending.reduce((sum, i) => sum + i.amountUSD, 0),
      totalPendingARS: pending.reduce(
        (sum, i) => sum + i.amountUSD * dollar.blue,
        0
      ),
      totalOverdueUSD: overdue.reduce((sum, i) => sum + i.amountUSD, 0),
    }
  }, [allInstallments])

  // Filter installments
  const filteredInstallments = useMemo(() => {
    let filtered = [...allInstallments]

    if (filterStatus !== "all") {
      filtered = filtered.filter((i) => i.status === filterStatus)
    }

    // Sort by due date
    filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    return filtered
  }, [allInstallments, filterStatus])

  // Group installments by date for timeline view
  const groupedByDate = useMemo(() => {
    const groups: Record<string, InstallmentWithClient[]> = {}

    filteredInstallments.forEach((inst) => {
      const date = inst.dueDate
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(inst)
    })

    return Object.entries(groups).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    )
  }, [filteredInstallments])

  const handleMarkPaid = useCallback(() => {
    if (!markingPaid) return
    marcarCuotaCobrada(markingPaid.id, dollarRateForPayment)
    toast.success("Cuota marcada como cobrada", {
      description: `${markingPaid.clientName} — Cuota ${markingPaid.number}/3 · $${(markingPaid.amountUSD * dollarRateForPayment).toLocaleString("es-AR")} ARS`,
    })
    setMarkingPaid(null)
  }, [markingPaid, dollarRateForPayment, marcarCuotaCobrada])

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0]
    return dateStr === today
  }

  const isPast = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0]
    return dateStr < today
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Cuotas</h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento de cobros y cuotas pendientes
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Pendientes"
          value={stats.pendingCount}
          subtitle="cuotas por cobrar"
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Vencidas"
          value={stats.overdueCount}
          subtitle="requieren atención"
          icon={AlertCircle}
          variant="danger"
        />
        <KPICard
          title="Cobradas (Mes)"
          value={stats.paidThisMonthCount}
          subtitle="este mes"
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Total Pendiente"
          value={`$${stats.totalPendingUSD.toLocaleString()}`}
          subtitle="USD"
          icon={DollarSign}
        />
        <KPICard
          title="Estimado ARS"
          value={`$${(stats.totalPendingARS / 1000000).toFixed(2)}M`}
          subtitle="millones de pesos"
          icon={DollarSign}
          variant="info"
        />
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px] bg-secondary border-transparent">
                  <SelectValue placeholder="Filtrar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="vencida">Vencidas</SelectItem>
                  <SelectItem value="cobrada">Cobradas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              Dólar actual: ${dollar.blue.toLocaleString("es-AR")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Listado de Cuotas
              </CardTitle>
              <CardDescription>
                {filteredInstallments.length} cuotas encontradas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Cliente</TableHead>
                      <TableHead className="text-muted-foreground">Modelo</TableHead>
                      <TableHead className="text-muted-foreground">Cuota</TableHead>
                      <TableHead className="text-muted-foreground">Vencimiento</TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        USD
                      </TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        ARS Est.
                      </TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallments.map((inst) => (
                      <TableRow key={inst.id} className="border-border">
                        <TableCell className="font-medium">
                          {inst.clientName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[120px]">
                          {inst.model}
                        </TableCell>
                        <TableCell>{inst.number}/3</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span
                              className={
                                isToday(inst.dueDate)
                                  ? "text-warning font-medium"
                                  : isPast(inst.dueDate) && inst.status !== "cobrada"
                                  ? "text-destructive font-medium"
                                  : ""
                              }
                            >
                              {new Date(inst.dueDate).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                            {isToday(inst.dueDate) && (
                              <span className="text-xs text-warning">Hoy</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${inst.amountUSD.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {inst.status === "cobrada" && inst.amountARS
                            ? `$${inst.amountARS.toLocaleString("es-AR")}`
                            : `~$${(
                                inst.amountUSD * dollar.blue
                              ).toLocaleString("es-AR")}`}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={inst.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {inst.status !== "cobrada" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setMarkingPaid(inst)
                                  setDollarRateForPayment(dollar.blue)
                                }}
                              >
                                <Check className="w-4 h-4 text-primary" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Copiar mensaje de cobro"
                              onClick={() => {
                                const arsAmount = inst.status === "cobrada" && inst.amountARS
                                  ? inst.amountARS
                                  : inst.amountUSD * dollar.blue
                                const arsLabel = inst.status === "cobrada" && inst.amountARS
                                  ? `$${inst.amountARS.toLocaleString("es-AR")} ARS`
                                  : `~$${Math.round(inst.amountUSD * dollar.blue).toLocaleString("es-AR")} ARS (al dólar de hoy $${dollar.blue.toLocaleString("es-AR")})`
                                const dueFormatted = new Date(inst.dueDate).toLocaleDateString("es-AR", { day: "numeric", month: "long" })
                                const msg = `Hola ${inst.clientName}! 👋\n\nTe recuerdo que tenés la cuota ${inst.number}/3 de tu ${inst.model} con vencimiento el *${dueFormatted}*.\n\n💵 Monto: USD ${inst.amountUSD.toFixed(2)} → ${arsLabel}\n\nAvisame cuando puedas para coordinar el pago. ¡Gracias!`
                                navigator.clipboard.writeText(msg).then(() => {
                                  toast.success("Mensaje copiado", {
                                    description: `Cobro cuota ${inst.number}/3 — ${inst.clientName}`,
                                  })
                                })
                              }}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInstallments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No hay cuotas con este filtro
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Sidebar */}
        <div>
          <Card className="bg-card border-border sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Calendario de Vencimientos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {groupedByDate.map(([date, installments]) => {
                const dateObj = new Date(date)
                const isTodayDate = isToday(date)
                const isPastDate = isPast(date)

                return (
                  <div key={date} className="relative">
                    {/* Date Header */}
                    <div
                      className={`flex items-center gap-3 mb-2 ${
                        isTodayDate
                          ? "text-warning"
                          : isPastDate
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isTodayDate
                            ? "bg-warning"
                            : isPastDate
                            ? "bg-destructive"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {isTodayDate
                          ? "Hoy"
                          : dateObj.toLocaleDateString("es-AR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                      </span>
                    </div>

                    {/* Installments for this date */}
                    <div className="ml-5 space-y-2 border-l border-border pl-4">
                      {installments.map((inst) => (
                        <div
                          key={inst.id}
                          className={`p-3 rounded-lg ${
                            inst.status === "cobrada"
                              ? "bg-primary/10"
                              : inst.status === "vencida"
                              ? "bg-destructive/10"
                              : "bg-secondary"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate max-w-[100px]">
                              {inst.clientName}
                            </span>
                            <StatusBadge status={inst.status} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Cuota {inst.number}/3</span>
                            <span className="font-mono">
                              ${inst.amountUSD.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {groupedByDate.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay cuotas para mostrar
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mark as Paid Dialog */}
      <Dialog open={!!markingPaid} onOpenChange={() => setMarkingPaid(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Marcar Cuota como Cobrada</DialogTitle>
            <DialogDescription>
              {markingPaid &&
                `${markingPaid.clientName} - Cuota ${markingPaid.number}/3`}
            </DialogDescription>
          </DialogHeader>

          {markingPaid && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-secondary space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto USD</span>
                  <span className="font-mono font-medium">
                    ${markingPaid.amountUSD.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto ARS</span>
                  <span className="font-mono font-medium">
                    ${(markingPaid.amountUSD * dollarRateForPayment).toLocaleString(
                      "es-AR"
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dólar del día de cobro</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={dollarRateForPayment}
                    onChange={(e) => setDollarRateForPayment(Number(e.target.value))}
                    className="bg-secondary border-transparent font-mono"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setDollarRateForPayment(dollar.blue)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dólar actual: ${dollar.blue.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setMarkingPaid(null)}>
              Cancelar
            </Button>
            <Button onClick={handleMarkPaid}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar Cobro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
