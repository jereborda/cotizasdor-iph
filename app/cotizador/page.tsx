"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Smartphone,
  DollarSign,
  Users,
  Copy,
  Check,
  ShoppingCart,
  CreditCard,
  Calculator,
  Percent,
  MessageSquare,
  Phone,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  iphoneModels,
  capacities,
  colors,
  conditions,
  dollarTypes,
  currentDollarRate,
  vendors,
  partners,
  type Sale,
  type Installment,
} from "@/lib/mock-data"
import { modelCostKey } from "@/lib/supabase"
import { useAppState } from "@/lib/app-state"
import { toast } from "sonner"

interface QuotationData {
  model: string
  capacity: string
  color: string
  condition: string
  costUSD: number
  profitUSD: number
  profitType: "fixed" | "percentage"
  dollarType: string
  dollarRate: number
  hasVendor: boolean
  vendor: string
  commissionType: "fixed" | "percentage"
  commissionValue: number
  partner1Investment: number
  partner2Investment: number
  splitMode: "50/50" | "proportional"
  hasFinancing: boolean
  financingSurcharge: number
  notes: string
}

const defaultQuotation: QuotationData = {
  model: "",
  capacity: "256GB",
  color: "",
  condition: "nuevo",
  costUSD: 1300,
  profitUSD: 150,
  profitType: "fixed",
  dollarType: "blue",
  dollarRate: currentDollarRate.blue,
  hasVendor: false,
  vendor: "",
  commissionType: "percentage",
  commissionValue: 5,
  partner1Investment: 650,
  partner2Investment: 650,
  splitMode: "50/50",
  hasFinancing: true,
  financingSurcharge: 10,
  notes: "",
}

export default function CotizadorPage() {
  const [quotation, setQuotation] = useState<QuotationData>(defaultQuotation)
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null)
  const [showSaleDialog, setShowSaleDialog] = useState(false)
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")

  const { agregarVenta, dollar, modelCosts, saveModelCost } = useAppState()
  const router = useRouter()
  const costSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync dollarRate when live blue rate loads/refreshes
  useEffect(() => {
    if (!dollar.loading && quotation.dollarType === "blue") {
      setQuotation((prev) => ({ ...prev, dollarRate: dollar.blue }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dollar.blue, dollar.loading])

  // Auto-fill cost when model or capacity changes (from saved costs)
  useEffect(() => {
    if (quotation.model && quotation.capacity) {
      const key = modelCostKey(quotation.model, quotation.capacity)
      if (modelCosts[key] !== undefined) {
        setQuotation((prev) => ({ ...prev, costUSD: modelCosts[key] }))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation.model, quotation.capacity, modelCosts])

  // Calculate all derived values
  const calculations = useMemo(() => {
    const costTotal = quotation.costUSD
    const profit = quotation.profitType === "fixed"
      ? quotation.profitUSD
      : (costTotal * quotation.profitUSD) / 100

    const priceContadoUSD = costTotal + profit
    const priceContadoARS = priceContadoUSD * quotation.dollarRate

    // Financing calculations
    const financingSurchargeAmount = (priceContadoUSD * quotation.financingSurcharge) / 100
    const priceFinanciadoUSD = priceContadoUSD + financingSurchargeAmount
    const priceFinanciadoARS = priceFinanciadoUSD * quotation.dollarRate
    
    const installmentUSD = priceFinanciadoUSD / 3
    const installmentARS = installmentUSD * quotation.dollarRate

    // Commission calculation
    let commissionUSD = 0
    if (quotation.hasVendor) {
      commissionUSD = quotation.commissionType === "fixed"
        ? quotation.commissionValue
        : (priceContadoUSD * quotation.commissionValue) / 100
    }

    // Net profit after commission
    const netProfitUSD = profit - commissionUSD

    // Partner split
    let partner1Profit = 0
    let partner2Profit = 0
    
    if (quotation.splitMode === "50/50") {
      partner1Profit = netProfitUSD / 2
      partner2Profit = netProfitUSD / 2
    } else {
      const totalInvestment = quotation.partner1Investment + quotation.partner2Investment
      if (totalInvestment > 0) {
        partner1Profit = (netProfitUSD * quotation.partner1Investment) / totalInvestment
        partner2Profit = (netProfitUSD * quotation.partner2Investment) / totalInvestment
      }
    }

    // ROI calculation
    const partner1ROI = quotation.partner1Investment > 0
      ? ((partner1Profit / quotation.partner1Investment) * 100).toFixed(1)
      : "0"
    const partner2ROI = quotation.partner2Investment > 0
      ? ((partner2Profit / quotation.partner2Investment) * 100).toFixed(1)
      : "0"

    return {
      costTotal,
      profit,
      priceContadoUSD,
      priceContadoARS,
      financingSurchargeAmount,
      priceFinanciadoUSD,
      priceFinanciadoARS,
      installmentUSD,
      installmentARS,
      commissionUSD,
      netProfitUSD,
      partner1Profit,
      partner2Profit,
      partner1ROI,
      partner2ROI,
    }
  }, [quotation])

  const selectedModel = iphoneModels.find((m) => m.id === quotation.model)
  const selectedColor = colors.find((c) => c.id === quotation.color)

  // Helpers for ARS formatting
  const ars = (usd: number) => `$${Math.round(usd * quotation.dollarRate).toLocaleString("es-AR")}`
  const inst3 = calculations.priceFinanciadoUSD - calculations.installmentUSD * 2

  // Generate messages
  const shortMessage = useMemo(() => {
    if (!selectedModel) return ""

    let msg = `Hola! Te paso la cotización:\n\n`
    msg += `${selectedModel.name} ${quotation.capacity}${selectedColor ? ` - ${selectedColor.name}` : ""}\n\n`
    msg += `💵 Precio contado: USD ${calculations.priceContadoUSD.toLocaleString("es-AR")} (${ars(calculations.priceContadoUSD)} ARS)\n`

    if (quotation.hasFinancing) {
      msg += `\n💳 Financiado en 3 cuotas:\n`
      msg += `Total: USD ${calculations.priceFinanciadoUSD.toLocaleString("es-AR")} (${ars(calculations.priceFinanciadoUSD)} ARS)\n\n`
      msg += `Cuota 1: USD ${calculations.installmentUSD.toFixed(2)} (~${ars(calculations.installmentUSD)} ARS al dólar de hoy)\n`
      msg += `Cuota 2: USD ${calculations.installmentUSD.toFixed(2)}\n`
      msg += `Cuota 3: USD ${inst3.toFixed(2)}\n\n`
      msg += `*Las cuotas 2 y 3 se abonan en pesos al dólar del día de pago.*\n`
    }

    msg += `\nSi querés, te lo reservo.`

    return msg
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, selectedColor, quotation, calculations])

  const detailedMessage = useMemo(() => {
    if (!selectedModel) return ""

    const condition = conditions.find((c) => c.id === quotation.condition)

    let msg = `Hola! Te paso la cotización detallada:\n\n`
    msg += `📱 ${selectedModel.name} ${quotation.capacity}${selectedColor ? ` - ${selectedColor.name}` : ""}\n`
    msg += `Estado: ${condition?.name || "Nuevo Sellado"}\n\n`
    msg += `💵 Precio contado: USD ${calculations.priceContadoUSD.toLocaleString("es-AR")}\n`
    msg += `   → En ARS hoy: $${Math.round(calculations.priceContadoARS).toLocaleString("es-AR")}\n`

    if (quotation.hasFinancing) {
      msg += `\n💳 Financiación en 3 cuotas (recargo ${quotation.financingSurcharge}%):\n`
      msg += `Total financiado: USD ${calculations.priceFinanciadoUSD.toLocaleString("es-AR")}\n`
      msg += `   → En ARS hoy: $${Math.round(calculations.priceFinanciadoARS).toLocaleString("es-AR")}\n\n`
      msg += `Cuota 1: USD ${calculations.installmentUSD.toFixed(2)} → $${Math.round(calculations.installmentARS).toLocaleString("es-AR")} ARS (al dólar de hoy $${quotation.dollarRate.toLocaleString("es-AR")})\n`
      msg += `Cuota 2: USD ${calculations.installmentUSD.toFixed(2)} (se abona al dólar del día)\n`
      msg += `Cuota 3: USD ${inst3.toFixed(2)} (se abona al dólar del día)\n\n`
      msg += `*Solo la primera cuota tiene precio en ARS confirmado. Las siguientes se cobran al tipo de cambio del momento del pago.*\n`
    }

    msg += `\nSi tenés alguna consulta, estoy a disposición.`

    return msg
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, selectedColor, quotation, calculations])

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedMessage(type)
    setTimeout(() => setCopiedMessage(null), 2000)
  }

  const updateQuotation = (updates: Partial<QuotationData>) => {
    setQuotation((prev) => ({ ...prev, ...updates }))
  }

  const handleConfirmSale = async () => {
    if (!selectedModel) return

    const today = new Date().toISOString().split("T")[0]
    const saleId = `V${Date.now().toString().slice(-5)}`

    // Build installments if financed
    const installments: Installment[] = quotation.hasFinancing
      ? [1, 2, 3].map((num) => {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 30 * num)
          const amount = num < 3
            ? calculations.installmentUSD
            : calculations.priceFinanciadoUSD - calculations.installmentUSD * 2
          return {
            id: `${saleId}-${num}`,
            saleId,
            number: num,
            dueDate: dueDate.toISOString().split("T")[0],
            amountUSD: parseFloat(amount.toFixed(2)),
            dollarRateAtPayment: null,
            amountARS: null,
            status: "pendiente",
            paidDate: null,
          }
        })
      : []

    const firstDue = installments[0]?.dueDate ?? null
    const vendorEntry = vendors.find((v) => v.id === quotation.vendor)

    const newSale: Sale = {
      id: saleId,
      date: today,
      clientName: clientName.trim() || "Cliente sin nombre",
      clientPhone: clientPhone.trim() || "-",
      model: selectedModel.name,
      capacity: quotation.capacity,
      color: selectedColor?.name ?? quotation.color,
      condition: conditions.find((c) => c.id === quotation.condition)?.name ?? "Nuevo Sellado",
      priceUSD: quotation.hasFinancing
        ? calculations.priceFinanciadoUSD
        : calculations.priceContadoUSD,
      priceARS: quotation.hasFinancing
        ? calculations.priceFinanciadoARS
        : calculations.priceContadoARS,
      dollarRateAtSale: quotation.dollarRate,
      saleType: quotation.hasFinancing ? "financiado" : "contado",
      vendor: vendorEntry?.name ?? null,
      commissionUSD: calculations.commissionUSD,
      status: "pendiente",
      nextDueDate: firstDue,
      partner1Investment: quotation.partner1Investment,
      partner2Investment: quotation.partner2Investment,
      partner1Profit: calculations.partner1Profit,
      partner2Profit: calculations.partner2Profit,
      totalProfit: calculations.netProfitUSD,
      installments: installments.length > 0 ? installments : undefined,
    }

    try {
      await agregarVenta(newSale)
      setShowSaleDialog(false)
      setClientName("")
      setClientPhone("")
      toast.success("Venta registrada correctamente", {
        description: `${selectedModel.name} ${quotation.capacity} — ${saleId}`,
        action: {
          label: "Ver en Ventas",
          onClick: () => router.push("/ventas"),
        },
      })
    } catch (err) {
      toast.error("Error al guardar la venta", {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Cotizador</h1>
        <p className="text-sm text-muted-foreground">
          Genera cotizaciones de iPhones al instante
        </p>
      </div>

      {/* Quick Model Selection */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            Selección Rápida
          </CardTitle>
          <CardDescription>Elige un modelo para comenzar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {iphoneModels.filter((m) => m.generation >= 15).map((model) => (
              <button
                key={model.id}
                onClick={() => updateQuotation({ model: model.id })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quotation.model === model.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {model.name.replace("iPhone ", "")}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-4">
          {/* Device Details */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Detalles del Equipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select
                    value={quotation.model}
                    onValueChange={(v) => updateQuotation({ model: v })}
                  >
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue placeholder="Seleccionar modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {iphoneModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Capacidad</Label>
                  <Select
                    value={quotation.capacity}
                    onValueChange={(v) => updateQuotation({ capacity: v })}
                  >
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {capacities.map((cap) => (
                        <SelectItem key={cap} value={cap}>
                          {cap}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select
                    value={quotation.color}
                    onValueChange={(v) => updateQuotation({ color: v })}
                  >
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue placeholder="Seleccionar color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full border border-border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={quotation.condition}
                    onValueChange={(v) => updateQuotation({ condition: v })}
                  >
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond.id} value={cond.id}>
                          {cond.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Precios y Márgenes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Costo Base (USD)</Label>
                  <Input
                    type="number"
                    value={quotation.costUSD}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const cost = Number(e.target.value)
                      updateQuotation({ costUSD: cost })
                      if (quotation.model && quotation.capacity) {
                        if (costSaveTimer.current) clearTimeout(costSaveTimer.current)
                        costSaveTimer.current = setTimeout(
                          () => saveModelCost(modelCostKey(quotation.model, quotation.capacity), cost),
                          1000
                        )
                      }
                    }}
                    className="bg-secondary border-transparent font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Ganancia
                    {quotation.profitType === "fixed" && quotation.costUSD > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground font-normal">
                        ({((quotation.profitUSD / quotation.costUSD) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={quotation.profitUSD}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateQuotation({ profitUSD: Number(e.target.value) })}
                      className="bg-secondary border-transparent font-mono flex-1"
                    />
                    <Select
                      value={quotation.profitType}
                      onValueChange={(v: "fixed" | "percentage") =>
                        updateQuotation({ profitType: v })
                      }
                    >
                      <SelectTrigger className="w-20 bg-secondary border-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">USD</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Precio de Venta (USD)
                    {quotation.costUSD > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground font-normal">
                        → {((calculations.profit / quotation.costUSD) * 100).toFixed(1)}% margen
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={calculations.priceContadoUSD}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const price = Number(e.target.value)
                      updateQuotation({ profitUSD: price - quotation.costUSD, profitType: "fixed" })
                    }}
                    className="bg-secondary border-transparent font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Dólar</Label>
                  <Select
                    value={quotation.dollarType}
                    onValueChange={(v) => {
                      const dollarInfo = dollarTypes.find((d) => d.id === v)
                      const rate = v === "blue" ? dollar.blue : (dollarInfo?.rate || currentDollarRate.blue)
                      updateQuotation({
                        dollarType: v,
                        dollarRate: rate,
                      })
                    }}
                  >
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dollarTypes.map((dt) => (
                        <SelectItem key={dt.id} value={dt.id}>
                          {dt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cotización (ARS)</Label>
                  <Input
                    type="number"
                    value={quotation.dollarRate}
                    onChange={(e) => updateQuotation({ dollarRate: Number(e.target.value) })}
                    className="bg-secondary border-transparent font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Commission */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary" />
                  Comisión Vendedor
                </CardTitle>
                <Switch
                  checked={quotation.hasVendor}
                  onCheckedChange={(v) => updateQuotation({ hasVendor: v })}
                />
              </div>
            </CardHeader>
            {quotation.hasVendor && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vendedor</Label>
                    <Select
                      value={quotation.vendor}
                      onValueChange={(v) => {
                        const vendorInfo = vendors.find((vd) => vd.id === v)
                        updateQuotation({
                          vendor: v,
                          commissionType: vendorInfo?.commissionType as "fixed" | "percentage" || "percentage",
                          commissionValue: vendorInfo?.commissionValue || 5,
                        })
                      }}
                    >
                      <SelectTrigger className="bg-secondary border-transparent">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vd) => (
                          <SelectItem key={vd.id} value={vd.id}>
                            {vd.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Comisión</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={quotation.commissionValue}
                        onChange={(e) =>
                          updateQuotation({ commissionValue: Number(e.target.value) })
                        }
                        className="bg-secondary border-transparent font-mono flex-1"
                      />
                      <Select
                        value={quotation.commissionType}
                        onValueChange={(v: "fixed" | "percentage") =>
                          updateQuotation({ commissionType: v })
                        }
                      >
                        <SelectTrigger className="w-20 bg-secondary border-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">USD</SelectItem>
                          <SelectItem value="percentage">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Partner Investment */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Inversión de Socios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{partners[0].name} (USD)</Label>
                  <Input
                    type="number"
                    value={quotation.partner1Investment}
                    onChange={(e) =>
                      updateQuotation({ partner1Investment: Number(e.target.value) })
                    }
                    className="bg-secondary border-transparent font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{partners[1].name} (USD)</Label>
                  <Input
                    type="number"
                    value={quotation.partner2Investment}
                    onChange={(e) =>
                      updateQuotation({ partner2Investment: Number(e.target.value) })
                    }
                    className="bg-secondary border-transparent font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Modo de Reparto</Label>
                <Select
                  value={quotation.splitMode}
                  onValueChange={(v: "50/50" | "proportional") =>
                    updateQuotation({ splitMode: v })
                  }
                >
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50/50">50/50 - Partes iguales</SelectItem>
                    <SelectItem value="proportional">Proporcional a inversión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Financing */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Financiación en 3 Cuotas
                </CardTitle>
                <Switch
                  checked={quotation.hasFinancing}
                  onCheckedChange={(v) => updateQuotation({ hasFinancing: v })}
                />
              </div>
            </CardHeader>
            {quotation.hasFinancing && (
              <CardContent>
                <div className="space-y-2">
                  <Label>Recargo por Financiación (%)</Label>
                  <Input
                    type="number"
                    value={quotation.financingSurcharge}
                    onChange={(e) =>
                      updateQuotation({ financingSurcharge: Number(e.target.value) })
                    }
                    className="bg-secondary border-transparent font-mono w-32"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Notes */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notas adicionales..."
                value={quotation.notes}
                onChange={(e) => updateQuotation({ notes: e.target.value })}
                className="bg-secondary border-transparent resize-none"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-4">
          {/* Quotation Summary */}
          <Card className="bg-card border-border sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                Resumen de Cotización
              </CardTitle>
              {selectedModel && (
                <CardDescription>
                  {selectedModel.name} {quotation.capacity}
                  {selectedColor && ` - ${selectedColor.name}`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing Summary */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Costo Total</span>
                  <span className="font-mono">USD {calculations.costTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Ganancia Bruta</span>
                  <span className="font-mono text-primary">
                    +USD {calculations.profit.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Precio Contado</span>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-lg">
                      USD {calculations.priceContadoUSD.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      ~${calculations.priceContadoARS.toLocaleString("es-AR")} ARS
                    </div>
                  </div>
                </div>
              </div>

              {/* Financing Section */}
              {quotation.hasFinancing && (
                <div className="space-y-3 p-4 rounded-lg bg-secondary/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Recargo ({quotation.financingSurcharge}%)
                    </span>
                    <span className="font-mono">
                      +USD {calculations.financingSurchargeAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Precio Financiado</span>
                    <div className="text-right">
                      <div className="font-mono font-semibold">
                        USD {calculations.priceFinanciadoUSD.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        ~${calculations.priceFinanciadoARS.toLocaleString("es-AR")} ARS
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Cada Cuota</span>
                    <div className="text-right">
                      <span className="font-mono">
                        USD {calculations.installmentUSD.toFixed(2)}
                      </span>
                      <div className="text-xs text-muted-foreground font-mono">
                        ~${calculations.installmentARS.toLocaleString("es-AR")} ARS
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Commission */}
              {quotation.hasVendor && (
                <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-destructive/10">
                  <span className="text-muted-foreground">Comisión Vendedor</span>
                  <span className="font-mono text-destructive">
                    -USD {calculations.commissionUSD.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Net Profit */}
              <div className="space-y-3 p-4 rounded-lg bg-primary/10">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Ganancia Neta</span>
                  <span className="font-mono font-semibold text-primary text-lg">
                    USD {calculations.netProfitUSD.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-primary/20" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">{partners[0].name}</div>
                    <div className="font-mono font-medium">
                      USD {calculations.partner1Profit.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ROI: {calculations.partner1ROI}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{partners[1].name}</div>
                    <div className="font-mono font-medium">
                      USD {calculations.partner2Profit.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ROI: {calculations.partner2ROI}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!selectedModel}
                  onClick={() => setShowSaleDialog(true)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Generar Venta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Mensaje para Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="short">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="short">Corto</TabsTrigger>
                  <TabsTrigger value="detailed">Detallado</TabsTrigger>
                </TabsList>
                <TabsContent value="short" className="space-y-3">
                  <div className="p-4 rounded-lg bg-secondary text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                    {shortMessage || "Selecciona un modelo para generar el mensaje"}
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => copyToClipboard(shortMessage, "short")}
                    disabled={!shortMessage}
                  >
                    {copiedMessage === "short" ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Mensaje
                      </>
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="detailed" className="space-y-3">
                  <div className="p-4 rounded-lg bg-secondary text-sm whitespace-pre-wrap font-mono text-muted-foreground max-h-64 overflow-y-auto">
                    {detailedMessage || "Selecciona un modelo para generar el mensaje"}
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => copyToClipboard(detailedMessage, "detailed")}
                    disabled={!detailedMessage}
                  >
                    {copiedMessage === "detailed" ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Mensaje
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Sale Dialog */}
      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Registrar Venta</DialogTitle>
            <DialogDescription>
              {selectedModel && `${selectedModel.name} ${quotation.capacity}${selectedColor ? ` - ${selectedColor.name}` : ""}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-4 rounded-lg bg-secondary space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de venta</span>
                <span className="font-medium">{quotation.hasFinancing ? "Financiado en 3 cuotas" : "Contado"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-mono font-medium">
                  USD {(quotation.hasFinancing ? calculations.priceFinanciadoUSD : calculations.priceContadoUSD).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ganancia neta</span>
                <span className="font-mono text-primary">USD {calculations.netProfitUSD.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Nombre del cliente
              </Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="bg-secondary border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Teléfono
              </Label>
              <Input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
                className="bg-secondary border-transparent"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowSaleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSale}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Confirmar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
