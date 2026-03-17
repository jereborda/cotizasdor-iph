"use client"

import { useMemo } from "react"
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Percent,
  CreditCard,
  Smartphone,
  BarChart3,
} from "lucide-react"
import { KPICard } from "@/components/kpi-card"
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
import { partners } from "@/lib/mock-data"
import { useAppState } from "@/lib/app-state"
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

// Dollar evolution is historical reference data — kept static
const dollarEvolution = [
  { month: "Oct", blue: 1150, oficial: 900 },
  { month: "Nov", blue: 1220, oficial: 920 },
  { month: "Dic", blue: 1280, oficial: 950 },
  { month: "Ene", blue: 1300, oficial: 980 },
  { month: "Feb", blue: 1320, oficial: 1020 },
  { month: "Mar", blue: 1345, oficial: 1050 },
]

export default function ReportesPage() {
  const { sales } = useAppState()

  const reports = useMemo(() => {
    const totalSales = sales.length
    const totalProfitUSD = sales.reduce((s, v) => s + v.totalProfit, 0)
    const totalProfitPartner1 = sales.reduce((s, v) => s + v.partner1Profit, 0)
    const totalProfitPartner2 = sales.reduce((s, v) => s + v.partner2Profit, 0)
    const totalCommissions = sales.reduce((s, v) => s + v.commissionUSD, 0)
    const totalRevenueUSD = sales.reduce((s, v) => s + v.priceUSD, 0)
    const totalRevenueARS = sales.reduce((s, v) => s + v.priceARS, 0)
    const cashSales = sales.filter((s) => s.saleType === "contado").length
    const financedSales = sales.filter((s) => s.saleType === "financiado").length
    const avgProfitPerSale = totalSales > 0 ? totalProfitUSD / totalSales : 0

    const modelCounts: Record<string, number> = {}
    sales.forEach((s) => { modelCounts[s.model] = (modelCounts[s.model] || 0) + 1 })
    const topModels = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([model, count]) => ({ model, count }))

    const vendorCounts: Record<string, number> = {}
    sales.forEach((s) => {
      if (s.vendor) vendorCounts[s.vendor] = (vendorCounts[s.vendor] || 0) + 1
    })
    const topVendors = Object.entries(vendorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([vendor, count]) => ({ vendor, count }))

    return {
      totalSales, totalProfitUSD, totalProfitPartner1, totalProfitPartner2,
      totalCommissions, totalRevenueUSD, totalRevenueARS,
      cashSales, financedSales, avgProfitPerSale, topModels, topVendors,
    }
  }, [sales])

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
        ganancia: Math.round(monthSales.reduce((acc, s) => acc + s.totalProfit, 0)),
      }
    })
  }, [sales])

  const salesTypeData = useMemo(() => [
    { name: "Contado", value: reports.cashSales, fill: "var(--chart-1)" },
    { name: "Financiado", value: reports.financedSales, fill: "var(--chart-2)" },
  ], [reports.cashSales, reports.financedSales])

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
        <p className="text-sm text-muted-foreground">Analítica y métricas del negocio</p>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Ventas Totales" value={reports.totalSales} subtitle="equipos vendidos" icon={ShoppingCart} variant="info" />
        <KPICard title="Ganancia Total" value={`$${reports.totalProfitUSD.toFixed(0)}`} subtitle="USD neto" icon={TrendingUp} variant="success" />
        <KPICard title="Facturación USD" value={`$${(reports.totalRevenueUSD / 1000).toFixed(1)}K`} subtitle="total vendido" icon={DollarSign} />
        <KPICard title="Facturación ARS" value={`$${(reports.totalRevenueARS / 1000000).toFixed(2)}M`} subtitle="millones de pesos" icon={DollarSign} variant="info" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={partners[0].name} value={`$${reports.totalProfitPartner1.toFixed(0)}`} subtitle="USD ganancia" icon={Users} variant="success" />
        <KPICard title={partners[1].name} value={`$${reports.totalProfitPartner2.toFixed(0)}`} subtitle="USD ganancia" icon={Users} variant="info" />
        <KPICard title="Comisiones" value={`$${reports.totalCommissions.toFixed(0)}`} subtitle="USD pagadas" icon={Percent} />
        <KPICard title="Rentabilidad Prom." value={`$${reports.avgProfitPerSale.toFixed(0)}`} subtitle="USD por equipo" icon={TrendingUp} variant="success" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Ganancias Mensuales
            </CardTitle>
            <CardDescription>Evolución de ganancias en USD</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySalesData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }}
                    formatter={(value: number) => [`$${value} USD`, "Ganancia"]}
                  />
                  <Bar dataKey="ganancia" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Distribución de Ventas
            </CardTitle>
            <CardDescription>Contado vs Financiado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesTypeData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                    {salesTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }}
                    formatter={(value: number, name: string) => [`${value} ventas`, name]}
                  />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: "var(--foreground)" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-2">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">{reports.cashSales}</p>
                <p className="text-sm text-muted-foreground">Contado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-accent">{reports.financedSales}</p>
                <p className="text-sm text-muted-foreground">Financiado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Evolución del Dólar
            </CardTitle>
            <CardDescription>Blue vs Oficial (últimos 6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dollarEvolution}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} domain={["dataMin - 50", "dataMax + 50"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }}
                    formatter={(value: number) => [`$${value} ARS`, ""]}
                  />
                  <Legend verticalAlign="top" height={36} formatter={(value) => <span style={{ color: "var(--foreground)" }}>{value === "blue" ? "Dólar Blue" : "Dólar Oficial"}</span>} />
                  <Line type="monotone" dataKey="blue" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)", strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="oficial" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: "var(--chart-2)", strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              Ventas por Modelo
            </CardTitle>
            <CardDescription>Top modelos más vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reports.topModels} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis dataKey="model" type="category" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={120} tickFormatter={(v: string) => v.replace("iPhone ", "").slice(0, 15)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }}
                    formatter={(value: number) => [`${value} unidades`, "Ventas"]}
                  />
                  <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Ranking de Modelos</CardTitle>
            <CardDescription>Modelos más vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">#</TableHead>
                  <TableHead className="text-muted-foreground">Modelo</TableHead>
                  <TableHead className="text-muted-foreground text-right">Ventas</TableHead>
                  <TableHead className="text-muted-foreground text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.topModels.map((item, index) => (
                  <TableRow key={item.model} className="border-border">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.model}</TableCell>
                    <TableCell className="text-right font-mono">{item.count}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {reports.totalSales > 0 ? ((item.count / reports.totalSales) * 100).toFixed(0) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
                {reports.topModels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Ranking de Vendedores</CardTitle>
            <CardDescription>Vendedores con más ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">#</TableHead>
                  <TableHead className="text-muted-foreground">Vendedor</TableHead>
                  <TableHead className="text-muted-foreground text-right">Ventas</TableHead>
                  <TableHead className="text-muted-foreground text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.topVendors.map((item, index) => (
                  <TableRow key={item.vendor} className="border-border">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.vendor}</TableCell>
                    <TableCell className="text-right font-mono">{item.count}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {reports.totalSales > 0 ? ((item.count / reports.totalSales) * 100).toFixed(0) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
                {reports.topVendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No hay ventas con vendedor asignado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{reports.totalSales}</p>
              <p className="text-sm text-muted-foreground mt-1">Equipos Vendidos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">${reports.totalProfitUSD.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground mt-1">Ganancia Total USD</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">${(reports.totalRevenueARS / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-muted-foreground mt-1">Facturación ARS</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">
                {reports.totalRevenueUSD > 0
                  ? ((reports.totalProfitUSD / reports.totalRevenueUSD) * 100).toFixed(1)
                  : "0.0"}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Margen Promedio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
