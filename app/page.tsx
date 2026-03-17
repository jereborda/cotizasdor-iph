"use client"

import { useMemo } from "react"
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  CreditCard,
  AlertCircle,
  Percent,
  Calendar,
} from "lucide-react"
import { KPICard } from "@/components/kpi-card"
import { StatusBadge } from "@/components/status-badge"
import { partners } from "@/lib/mock-data"
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
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { useAppState } from "@/lib/app-state"

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export default function DashboardPage() {
  const { sales, dollar } = useAppState()

  const monthlySalesData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const monthSales = sales.filter((s) => {
        const sd = new Date(s.date)
        return sd.getMonth() === m && sd.getFullYear() === y
      })
      return {
        month: MONTHS[m],
        ventas: monthSales.length,
        ganancia: monthSales.reduce((acc, s) => acc + s.totalProfit, 0),
      }
    })
  }, [sales])

  const partnerProfitData = useMemo(() => [
    { name: partners[0].name, value: sales.reduce((a, s) => a + s.partner1Profit, 0), fill: "var(--chart-1)" },
    { name: partners[1].name, value: sales.reduce((a, s) => a + s.partner2Profit, 0), fill: "var(--chart-2)" },
  ], [sales])

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const salesThisMonth = sales.filter((s) => {
      const d = new Date(s.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const allInstallments = sales.flatMap((s) =>
      (s.installments ?? []).map((i) => ({ ...i, clientName: s.clientName, model: s.model }))
    )

    const pendingInstallments = allInstallments.filter((i) => i.status === "pendiente")
    const overdueInstallments = allInstallments.filter((i) => i.status === "vencida")
    const dueTodayInstallments = allInstallments.filter(
      (i) => i.dueDate === today && i.status === "pendiente"
    )

    return {
      salesThisMonth: salesThisMonth.length,
      totalProfitThisMonth: salesThisMonth.reduce((s, v) => s + v.totalProfit, 0),
      partner1ProfitThisMonth: salesThisMonth.reduce((s, v) => s + v.partner1Profit, 0),
      partner2ProfitThisMonth: salesThisMonth.reduce((s, v) => s + v.partner2Profit, 0),
      dueTodayCount: dueTodayInstallments.length,
      overdueCount: overdueInstallments.length,
      pendingCommissions: salesThisMonth
        .filter((s) => s.status === "pendiente")
        .reduce((sum, s) => sum + s.commissionUSD, 0),
      upcomingInstallments: pendingInstallments
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5),
    }
  }, [sales])

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [sales]
  )

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de tu negocio de iPhones
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Dólar Blue"
          value={dollar.loading ? "..." : `$${dollar.blue.toLocaleString("es-AR")}`}
          subtitle={dollar.error ? "fallback" : "ARS"}
          icon={DollarSign}
          variant="success"
        />
        <KPICard
          title="Ventas del Mes"
          value={stats.salesThisMonth}
          subtitle="equipos vendidos"
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Ganancia Total"
          value={`$${stats.totalProfitThisMonth.toFixed(0)}`}
          subtitle="USD este mes"
          icon={TrendingUp}
          variant="success"
        />
        <KPICard
          title={partners[0].name}
          value={`$${stats.partner1ProfitThisMonth.toFixed(0)}`}
          subtitle="USD ganancia"
          icon={Users}
          variant="info"
        />
        <KPICard
          title={partners[1].name}
          value={`$${stats.partner2ProfitThisMonth.toFixed(0)}`}
          subtitle="USD ganancia"
          icon={Users}
          variant="info"
        />
        <KPICard
          title="Cuotas Hoy"
          value={stats.dueTodayCount}
          subtitle="vencen hoy"
          icon={Calendar}
          variant="warning"
        />
        <KPICard
          title="Cuotas Vencidas"
          value={stats.overdueCount}
          subtitle="sin cobrar"
          icon={AlertCircle}
          variant="danger"
        />
        <KPICard
          title="Comisiones Pend."
          value={`$${stats.pendingCommissions.toFixed(0)}`}
          subtitle="USD"
          icon={Percent}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Ventas por Mes</CardTitle>
            <CardDescription>Cantidad de ventas mensuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySalesData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="ventas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Ganancias por Socio</CardTitle>
            <CardDescription>Distribución de ganancias totales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={partnerProfitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                    labelLine={false}
                  >
                    {partnerProfitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)} USD`, "Ganancia"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Próximas Cuotas
            </CardTitle>
            <CardDescription>Cuotas pendientes de cobro</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Cuota</TableHead>
                  <TableHead className="text-muted-foreground">Vence</TableHead>
                  <TableHead className="text-muted-foreground text-right">USD</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.upcomingInstallments.map((inst) => (
                  <TableRow key={inst.id} className="border-border">
                    <TableCell className="font-medium">{inst.clientName}</TableCell>
                    <TableCell>{inst.number}/3</TableCell>
                    <TableCell>
                      {new Date(inst.dueDate).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${inst.amountUSD.toFixed(0)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inst.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {stats.upcomingInstallments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay cuotas pendientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Últimas Ventas
            </CardTitle>
            <CardDescription>Ventas más recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Modelo</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground text-right">USD</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id} className="border-border">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[120px]">{sale.model}</span>
                        <span className="text-xs text-muted-foreground">{sale.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{sale.clientName}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${sale.priceUSD.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sale.saleType} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sale.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
