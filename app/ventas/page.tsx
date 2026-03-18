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
  Save,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type SheetMode = "view" | "edit"

export default function VentasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterModel, setFilterModel] = useState<string>("all")
  const [filterVendor, setFilterVendor] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [sheetMode, setSheetMode] = useState<SheetMode>("view")

  // Edit state
  const [editClientName, setEditClientName] = useState("")
  const [editClientPhone, setEditClientPhone] = useState("")
  const [editStatus, setEditStatus] = useState<Sale["status"]>("pendiente")
  const [editVendor, setEditVendor] = useState<string>("")
  const [editSaving, setEditSaving] = useState(false)

  const { sales, editarVenta } = useAppState()

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
    searchTerm || filterModel !== "all" || filterVendor !== "all" ||
    filterStatus !== "all" || filterType !== "all"

  const openView = (sale: Sale) => {
    setSelectedSale(sale)
    setSheetMode("view")
  }

  const openEdit = (sale: Sale) => {
    setSelectedSale(sale)
    setEditClientName(sale.clientName)
    setEditClientPhone(sale.clientPhone)
    setEditStatus(sale.status)
    setEditVendor(sale.vendor ?? "")
    setSheetMode("edit")
  }

  const handleSaveEdit = async () => {
    if (!selectedSale) return
    setEditSaving(true)
    try {
      await editarVenta(selectedSale.id, {
        clientName: editClientName,
        clientPhone: editClientPhone,
        status: editStatus,
        vendor: editVendor || null,
      })
      setSelectedSale((prev) =>
        prev
          ? { ...prev, clientName: editClientName, clientPhone: editClientPhone, status: editStatus, vendor: editVendor || null }
          : null
      )
      setSheetMode("view")
      toast.success("Venta actualizada")
    } catch {
      toast.error("Error al guardar")
    } finally {
      setEditSaving(false)
    }
  }

  const buildWhatsAppMessage = (sale: Sale) => {
    const lines = [`Hola! Te recuerdo que tenés una cuota pendiente:`, `${sale.model} ${sale.capacity}`, `Cliente: ${sale.clientName}`]
    if (sale.installments) {
      sale.installments
        .filter((i) => i.status !== "cobrada")
        .forEach((i) => {
          lines.push(`Cuota ${i.number}: USD ${i.amountUSD.toFixed(2)} — vence ${new Date(i.dueDate).toLocaleDateString("es-AR")}`)
        })
    }
    lines.push(`Se abona en pesos al valor del dólar del día.`)
    return lines.join("\n")
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ventas</h1>
          <p className="text-sm text-muted-foreground">Gestiona todas las ventas registradas</p>
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, modelo o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterModel} onValueChange={setFilterModel}>
                <SelectTrigger className="w-[140px] bg-secondary border-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los modelos</SelectItem>
                  {iphoneModels.slice(-8).map((model) => (
                    <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
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
                    <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
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
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
                  <TableHead className="text-muted-foreground text-right">Precio USD</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Vendedor</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className="border-border cursor-pointer hover:bg-secondary/50"
                    onClick={() => openView(sale)}
                  >
                    <TableCell className="font-mono text-sm">{sale.id}</TableCell>
                    <TableCell>
                      {new Date(sale.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{sale.clientName}</span>
                        <span className="text-xs text-muted-foreground">{sale.clientPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[140px]">{sale.model}</span>
                        <span className="text-xs text-muted-foreground">{sale.capacity} · {sale.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">${sale.priceUSD.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={sale.saleType} /></TableCell>
                    <TableCell>
                      {sale.vendor
                        ? <span className="text-sm">{sale.vendor}</span>
                        : <span className="text-sm text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell><StatusBadge status={sale.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openView(sale) }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(sale) }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {sale.saleType === "financiado" && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openView(sale) }}>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Ver cuotas
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(buildWhatsAppMessage(sale))
                            toast.success("Mensaje copiado")
                          }}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Copiar mensaje
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
                          <Button variant="link" onClick={clearFilters}>Limpiar filtros</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredSales.length} de {sales.length} ventas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Side Sheet */}
      <Sheet open={!!selectedSale} onOpenChange={(open) => { if (!open) setSelectedSale(null) }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card">

          {/* ── VIEW MODE ── */}
          {selectedSale && sheetMode === "view" && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Venta {selectedSale.id}
                </SheetTitle>
                <SheetDescription>
                  {new Date(selectedSale.date).toLocaleDateString("es-AR", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Client */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Cliente
                  </h3>
                  <div className="p-4 rounded-lg bg-secondary space-y-1">
                    <p className="font-medium">{selectedSale.clientName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3 h-3" /> {selectedSale.clientPhone}
                    </p>
                  </div>
                </div>

                {/* Device */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Equipo
                  </h3>
                  <div className="p-4 rounded-lg bg-secondary space-y-1">
                    <p className="font-medium">{selectedSale.model}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSale.capacity} · {selectedSale.color} · {selectedSale.condition}
                    </p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Precio
                  </h3>
                  <div className="p-4 rounded-lg bg-secondary space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio USD</span>
                      <span className="font-mono font-medium">${selectedSale.priceUSD.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio ARS</span>
                      <span className="font-mono">${selectedSale.priceARS.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dólar usado</span>
                      <span className="font-mono">${selectedSale.dollarRateAtSale.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tipo de venta</span>
                      <StatusBadge status={selectedSale.saleType} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estado</span>
                      <StatusBadge status={selectedSale.status} />
                    </div>
                  </div>
                </div>

                {/* Partner profits */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Rentabilidad</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-sm text-muted-foreground mb-1">{partners[0].name}</p>
                      <p className="font-mono font-semibold text-primary">${selectedSale.partner1Profit.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Inv: ${selectedSale.partner1Investment}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10 text-center">
                      <p className="text-sm text-muted-foreground mb-1">{partners[1].name}</p>
                      <p className="font-mono font-semibold text-accent">${selectedSale.partner2Profit.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Inv: ${selectedSale.partner2Investment}</p>
                    </div>
                  </div>
                </div>

                {/* Commission */}
                {selectedSale.vendor && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Comisión</h3>
                    <div className="p-4 rounded-lg bg-secondary flex justify-between">
                      <span className="text-muted-foreground">{selectedSale.vendor}</span>
                      <span className="font-mono">${selectedSale.commissionUSD.toFixed(2)} USD</span>
                    </div>
                  </div>
                )}

                {/* Installments */}
                {selectedSale.installments && selectedSale.installments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Plan de Cuotas
                    </h3>
                    <div className="space-y-2">
                      {selectedSale.installments.map((inst) => (
                        <div key={inst.id} className="p-3 rounded-lg bg-secondary flex items-center justify-between">
                          <div>
                            <p className="font-medium">Cuota {inst.number}/{selectedSale.installments!.length}</p>
                            <p className="text-xs text-muted-foreground">
                              Vence: {new Date(inst.dueDate).toLocaleDateString("es-AR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm">${inst.amountUSD.toFixed(2)} USD</p>
                            <StatusBadge status={inst.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => openEdit(selectedSale)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => {
                    navigator.clipboard.writeText(buildWhatsAppMessage(selectedSale))
                    toast.success("Mensaje copiado")
                  }}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mensaje
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ── EDIT MODE ── */}
          {selectedSale && sheetMode === "edit" && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-primary" />
                  Editar Venta {selectedSale.id}
                </SheetTitle>
                <SheetDescription>Modificá los datos de la venta</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label>Nombre del cliente</Label>
                  <Input
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="bg-secondary border-transparent"
                    placeholder="Nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={editClientPhone}
                    onChange={(e) => setEditClientPhone(e.target.value)}
                    className="bg-secondary border-transparent"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado de la venta</Label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Sale["status"])}>
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="cobrada">Cobrada</SelectItem>
                      <SelectItem value="vencida">Vencida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vendedor asignado</Label>
                  <Select value={editVendor || "none"} onValueChange={(v) => setEditVendor(v === "none" ? "" : v)}>
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin vendedor</SelectItem>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/50">
                  El modelo, precio, cuotas y datos financieros no se pueden modificar desde aquí.
                </p>

                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setSheetMode("view")} disabled={editSaving}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleSaveEdit} disabled={editSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {editSaving ? "Guardando…" : "Guardar"}
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
