"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Eye,
  Edit,
  CreditCard,
  MessageSquare,
  FileText,
  MoreHorizontal,
  Plus,
  DollarSign,
  User,
  Phone,
  Smartphone,
  Calendar,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StatusBadge } from "@/components/status-badge"
import { iphoneModels, vendors, partners, type Sale } from "@/lib/mock-data"
import { useAppState } from "@/lib/app-state"
import { toast } from "sonner"
import Link from "next/link"

export default function VentasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterModel, setFilterModel] = useState<string>("all")
  const [filterVendor, setFilterVendor] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const { sales } = useAppState()

  // Filter sales
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesModel = filterModel === "all" || sale.model.includes(filterModel)
    const matchesVendor =
      filterVendor === "all" ||
      (filterVendor === "none" && !sale.vendor) ||
      sale.vendor === filterVendor
    const matchesStatus = filterStatus === "all" || sale.status === filterStatus
    const matchesType = filterType === "all" || sale.saleType === filterType

    return matchesSearch && matchesModel && matchesVendor && matchesStatus && matchesType
  })

  const clearFilters = () => {
    setSearchTerm("")
    setFilterModel("all")
    setFilterVendor("all")
    setFilterStatus("all")
    setFilterType("all")
  }

  const hasActiveFilters =
    searchTerm ||
    filterModel !== "all" ||
    filterVendor !== "all" ||
    filterStatus !== "all" ||
    filterType !== "all"

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona todas las ventas registradas
          </p>
        </div>
        <Link href="/cotizador">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, modelo o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary border-transparent"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-2">
              <Select value={filterModel} onValueChange={setFilterModel}>
                <SelectTrigger className="w-[140px] bg-secondary border-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los modelos</SelectItem>
                  {iphoneModels.slice(-8).map((model) => (
                    <SelectItem key={model.id} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterVendor} onValueChange={setFilterVendor}>
                <SelectTrigger className="w-[140px] bg-secondary border-transparent">
                  <SelectValue placeholder="Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="none">Sin vendedor</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.name}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px] bg-secondary border-transparent">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cobrada">Cobrada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px] bg-secondary border-transparent">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="contado">Contado</SelectItem>
                  <SelectItem value="financiado">Financiado</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Modelo</TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Precio USD
                  </TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Vendedor</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className="border-border cursor-pointer hover:bg-secondary/50"
                    onClick={() => setSelectedSale(sale)}
                  >
                    <TableCell className="font-mono text-sm">{sale.id}</TableCell>
                    <TableCell>
                      {new Date(sale.date).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{sale.clientName}</span>
                        <span className="text-xs text-muted-foreground">
                          {sale.clientPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[140px]">
                          {sale.model}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {sale.capacity} · {sale.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${sale.priceUSD.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sale.saleType} />
                    </TableCell>
                    <TableCell>
                      {sale.vendor ? (
                        <span className="text-sm">{sale.vendor}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sale.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedSale(sale)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("Edición disponible próximamente") }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {sale.saleType === "financiado" && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedSale(sale) }}>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Ver cuotas
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("Reenvío disponible próximamente") }}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Reenviar mensaje
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("Impresión disponible próximamente") }}>
                            <FileText className="w-4 h-4 mr-2" />
                            Imprimir resumen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search className="w-8 h-8" />
                        <p>No se encontraron ventas</p>
                        {hasActiveFilters && (
                          <Button variant="link" onClick={clearFilters}>
                            Limpiar filtros
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination info */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredSales.length} de {sales.length} ventas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sale Detail Sheet */}
      <Sheet open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card">
          {selectedSale && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Venta {selectedSale.id}
                </SheetTitle>
                <SheetDescription>
                  {new Date(selectedSale.date).toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Client Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Cliente
                  </h3>
                  <Card className="bg-secondary border-transparent">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="font-medium">{selectedSale.clientName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {selectedSale.clientPhone}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Device Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Equipo
                  </h3>
                  <Card className="bg-secondary border-transparent">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="font-medium">{selectedSale.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedSale.capacity} · {selectedSale.color} ·{" "}
                          {selectedSale.condition}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pricing */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Precio
                  </h3>
                  <Card className="bg-secondary border-transparent">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precio USD</span>
                        <span className="font-mono font-medium">
                          ${selectedSale.priceUSD.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precio ARS</span>
                        <span className="font-mono">
                          ${selectedSale.priceARS.toLocaleString("es-AR")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dólar usado</span>
                        <span className="font-mono">
                          ${selectedSale.dollarRateAtSale.toLocaleString("es-AR")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tipo de venta</span>
                        <StatusBadge status={selectedSale.saleType} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Partner Investment & Profit */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Rentabilidad
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-primary/10 border-transparent">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                          {partners[0].name}
                        </p>
                        <p className="font-mono font-semibold text-primary">
                          ${selectedSale.partner1Profit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Inv: ${selectedSale.partner1Investment}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-accent/10 border-transparent">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                          {partners[1].name}
                        </p>
                        <p className="font-mono font-semibold text-accent">
                          ${selectedSale.partner2Profit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Inv: ${selectedSale.partner2Investment}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Commission */}
                {selectedSale.vendor && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Comisión
                    </h3>
                    <Card className="bg-secondary border-transparent">
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {selectedSale.vendor}
                          </span>
                          <span className="font-mono">
                            ${selectedSale.commissionUSD.toFixed(2)} USD
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Installments */}
                {selectedSale.installments && selectedSale.installments.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Plan de Cuotas
                    </h3>
                    <div className="space-y-2">
                      {selectedSale.installments.map((inst) => (
                        <Card
                          key={inst.id}
                          className="bg-secondary border-transparent"
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Cuota {inst.number}/3</p>
                                <p className="text-xs text-muted-foreground">
                                  Vence:{" "}
                                  {new Date(inst.dueDate).toLocaleDateString("es-AR")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono">
                                  ${inst.amountUSD.toFixed(2)} USD
                                </p>
                                <StatusBadge status={inst.status} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="secondary" className="flex-1" onClick={() => toast.info("Edición disponible próximamente")}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => toast.info("Reenvío disponible próximamente")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mensaje
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
