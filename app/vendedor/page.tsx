"use client"

import { useState, useMemo } from "react"
import {
  Smartphone,
  Copy,
  Check,
  MessageSquare,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  Tag,
  FileText,
  Phone,
  User,
  SendHorizonal,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  iphoneModels,
  capacities,
  colors,
  conditions,
  defaultSettings,
  vendorPriceKey,
} from "@/lib/mock-data"
import { useAppState } from "@/lib/app-state"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

function processTemplate(
  template: string,
  vars: Record<string, string>,
  isFinanced: boolean
): string {
  let result = template

  // Handle {{#financiado}}...{{/financiado}} blocks
  if (isFinanced) {
    result = result.replace(/\{\{#financiado\}\}([\s\S]*?)\{\{\/financiado\}\}/g, "$1")
  } else {
    result = result.replace(/\{\{#financiado\}\}[\s\S]*?\{\{\/financiado\}\}/g, "")
  }

  // Replace variables
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value)
  }

  return result.trim()
}

export default function VendedorPage() {
  const { dollar, vendorPrices, crearRemito } = useAppState()
  const { profile } = useAuth()

  const [selectedModel, setSelectedModel] = useState("")
  const [selectedCapacity, setSelectedCapacity] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedCondition, setSelectedCondition] = useState("")
  const [saleType, setSaleType] = useState<"contado" | "financiado">("contado")
  const [installments, setInstallments] = useState(3)
  const [copiedShort, setCopiedShort] = useState(false)
  const [copiedLong, setCopiedLong] = useState(false)
  const [remitoClientName, setRemitoClientName] = useState("")
  const [remitoClientPhone, setRemitoClientPhone] = useState("")
  const [remitoNotes, setRemitoNotes] = useState("")
  const [remitoSending, setRemitoSending] = useState(false)

  const modelObj = iphoneModels.find((m) => m.id === selectedModel)
  const colorObj = colors.find((c) => c.id === selectedColor)
  const conditionObj = conditions.find((c) => c.id === selectedCondition)

  // Filter available options based on configured prices
  const availableModels = iphoneModels.filter((m) =>
    Object.keys(vendorPrices).some((k) => k.startsWith(`${m.id}_`))
  )
  const availableCapacities = selectedModel
    ? capacities.filter((cap) =>
        Object.keys(vendorPrices).some((k) => k.startsWith(`${selectedModel}_${cap}_`))
      )
    : []
  const availableConditions = selectedModel && selectedCapacity
    ? conditions.filter((cond) =>
        vendorPrices[vendorPriceKey(selectedModel, selectedCapacity, cond.id)] !== undefined
      )
    : []

  // Get the price configured by admin
  const priceKey = selectedModel && selectedCapacity && selectedCondition
    ? vendorPriceKey(selectedModel, selectedCapacity, selectedCondition)
    : null

  const priceUSD = priceKey ? (vendorPrices[priceKey] ?? null) : null

  const surcharge = defaultSettings.financing.defaultSurcharge / 100
  const financedTotal = priceUSD !== null ? priceUSD * (1 + surcharge) : null
  const installmentAmount = financedTotal !== null ? financedTotal / installments : null

  const displayPrice = saleType === "contado" ? priceUSD : financedTotal
  const priceARS = displayPrice !== null ? displayPrice * dollar.blue : null

  const isReady =
    selectedModel &&
    selectedCapacity &&
    selectedColor &&
    selectedCondition &&
    priceUSD !== null

  // Build message variables
  const messageVars = useMemo(() => {
    if (!isReady || priceUSD === null) return {}

    const vars: Record<string, string> = {
      modelo: modelObj?.name ?? "",
      capacidad: selectedCapacity,
      color: colorObj?.name ?? "",
      estado: conditionObj?.name ?? "",
      precioContado: priceUSD.toFixed(0),
      precioARS: priceARS !== null
        ? new Intl.NumberFormat("es-AR").format(Math.round(priceARS))
        : "",
      precioFinanciado: financedTotal !== null ? financedTotal.toFixed(0) : "",
      recargoFinanciacion: defaultSettings.financing.defaultSurcharge.toString(),
    }

    // Per-installment amounts
    for (let i = 1; i <= installments; i++) {
      vars[`cuota${i}`] = installmentAmount !== null ? installmentAmount.toFixed(2) : ""
    }
    // Fill unused cuota slots (template may have cuota1/2/3 hardcoded)
    for (let i = installments + 1; i <= 3; i++) {
      vars[`cuota${i}`] = ""
    }

    return vars
  }, [isReady, priceUSD, modelObj, selectedCapacity, colorObj, conditionObj, priceARS, financedTotal, installmentAmount, installments])

  const shortMessage = useMemo(() => {
    if (!isReady) return ""
    return processTemplate(defaultSettings.messages.shortTemplate, messageVars, saleType === "financiado")
  }, [isReady, messageVars, saleType])

  const longMessage = useMemo(() => {
    if (!isReady) return ""
    return processTemplate(defaultSettings.messages.longTemplate, messageVars, saleType === "financiado")
  }, [isReady, messageVars, saleType])

  const handleCrearRemito = async () => {
    if (!profile || !selectedModel || !selectedCapacity || !selectedCondition || !remitoClientName) return
    setRemitoSending(true)
    try {
      await crearRemito({
        id: crypto.randomUUID(),
        vendor_id: profile.id,
        vendor_name: profile.name,
        client_name: remitoClientName,
        client_phone: remitoClientPhone,
        model: modelObj?.name ?? selectedModel,
        model_id: selectedModel,
        capacity: selectedCapacity,
        color: colorObj?.name ?? selectedColor,
        condition: selectedCondition,
        sale_type: saleType,
        installments,
        price_usd: priceUSD,
        notes: remitoNotes || null,
        status: "pendiente",
      })
      toast.success("Remito enviado al admin")
      setRemitoClientName("")
      setRemitoClientPhone("")
      setRemitoNotes("")
    } catch {
      toast.error("Error al crear remito")
    } finally {
      setRemitoSending(false)
    }
  }

  const handleCopy = (text: string, type: "short" | "long") => {
    navigator.clipboard.writeText(text)
    if (type === "short") {
      setCopiedShort(true)
      setTimeout(() => setCopiedShort(false), 2000)
    } else {
      setCopiedLong(true)
      setTimeout(() => setCopiedLong(false), 2000)
    }
    toast.success("Mensaje copiado")
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary" />
          Panel Vendedor
        </h1>
        <p className="text-sm text-muted-foreground">
          Generá cotizaciones para enviar al cliente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Selector */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="w-4 h-4 text-primary" />
                Elegí el equipo
              </CardTitle>
              <CardDescription>Seleccioná el modelo que te pidió el cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model */}
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select value={selectedModel} onValueChange={(v) => { setSelectedModel(v); setSelectedCapacity(""); setSelectedCondition(""); }}>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Elegí el modelo…" />
                  </SelectTrigger>
                  <SelectContent>
                    {[13, 14, 15, 16, 17].map((gen) => {
                      const genModels = availableModels.filter((m) => m.generation === gen)
                      if (genModels.length === 0) return null
                      return (
                        <div key={gen}>
                          <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                            iPhone {gen}
                          </div>
                          {genModels.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </div>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label>Capacidad</Label>
                <Select value={selectedCapacity} onValueChange={(v) => { setSelectedCapacity(v); setSelectedCondition(""); }} disabled={!selectedModel || availableCapacities.length === 0}>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Elegí la capacidad…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCapacities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition} disabled={!selectedCapacity || availableConditions.length === 0}>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Elegí el estado…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConditions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor} disabled={!selectedModel}>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Elegí el color…" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment type */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4 text-primary" />
                Forma de pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSaleType("contado")}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    saleType === "contado"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mx-auto mb-1" />
                  Contado
                </button>
                <button
                  onClick={() => setSaleType("financiado")}
                  disabled={!defaultSettings.financing.enabled}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    saleType === "financiado"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  Financiado
                </button>
              </div>

              {saleType === "financiado" && (
                <div className="space-y-2">
                  <Label>Cantidad de cuotas</Label>
                  <Select value={String(installments)} onValueChange={(v) => setInstallments(Number(v))}>
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 cuotas</SelectItem>
                      <SelectItem value="3">3 cuotas</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Recargo por financiación: {defaultSettings.financing.defaultSurcharge}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Price + Message */}
        <div className="space-y-4">
          {/* Price display */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                Precio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedModel || !selectedCapacity || !selectedCondition ? (
                <p className="text-sm text-muted-foreground">
                  Completá el equipo para ver el precio
                </p>
              ) : priceUSD === null ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Precio no configurado</p>
                    <p className="text-xs mt-0.5">
                      El admin todavía no cargó el precio para este modelo/capacidad/estado.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Contado */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div>
                      <p className="text-xs text-muted-foreground">Contado</p>
                      <p className="text-xl font-bold font-mono text-foreground">
                        USD {priceUSD.toLocaleString("es-AR")}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        ≈ ${(priceUSD * dollar.blue).toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS
                      </p>
                    </div>
                    {saleType === "contado" && (
                      <Badge variant="secondary" className="text-primary border-primary/30">Seleccionado</Badge>
                    )}
                  </div>

                  {/* Financiado */}
                  {defaultSettings.financing.enabled && financedTotal !== null && (
                    <div className={`flex items-center justify-between p-3 rounded-lg ${saleType === "financiado" ? "bg-primary/10" : "bg-secondary"}`}>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Financiado en {installments} cuotas (+{defaultSettings.financing.defaultSurcharge}%)
                        </p>
                        <p className="text-xl font-bold font-mono text-foreground">
                          USD {financedTotal.toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {installments}x USD {installmentAmount!.toFixed(2)} c/u
                        </p>
                      </div>
                      {saleType === "financiado" && (
                        <Badge variant="secondary" className="text-primary border-primary/30">Seleccionado</Badge>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Dólar Blue: ${dollar.blue.toLocaleString("es-AR")}
                  </p>

                  {/* Comisión del vendedor */}
                  {profile && profile.commission_value > 0 && (() => {
                    const base = saleType === "financiado" && financedTotal !== null ? financedTotal : priceUSD!
                    const comision = profile.commission_type === "percentage"
                      ? base * (profile.commission_value / 100)
                      : profile.commission_value
                    return (
                      <div className="mt-1 pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Tu comisión</p>
                          <p className="text-sm font-semibold font-mono text-green-500">
                            USD {comision.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profile.commission_type === "percentage"
                              ? `${profile.commission_value}% sobre precio ${saleType}`
                              : `Fijo`}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          ≈ ${(comision * dollar.blue).toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS
                        </p>
                      </div>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crear Remito */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-primary" />
                Crear Remito
              </CardTitle>
              <CardDescription>
                Enviá la venta al admin para que la confirme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedModel || !selectedCapacity || !selectedCondition ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-muted-foreground text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Primero completá el equipo y la forma de pago
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Nombre del cliente *
                    </Label>
                    <Input
                      value={remitoClientName}
                      onChange={(e) => setRemitoClientName(e.target.value)}
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
                      value={remitoClientPhone}
                      onChange={(e) => setRemitoClientPhone(e.target.value)}
                      placeholder="Ej: +54 11 1234-5678"
                      className="bg-secondary border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notas (opcional)</Label>
                    <Textarea
                      value={remitoNotes}
                      onChange={(e) => setRemitoNotes(e.target.value)}
                      placeholder="Alguna aclaración para el admin…"
                      className="bg-secondary border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!remitoClientName || remitoSending}
                    onClick={handleCrearRemito}
                  >
                    <SendHorizonal className="w-4 h-4 mr-2" />
                    {remitoSending ? "Enviando…" : "Enviar remito al admin"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="w-4 h-4 text-primary" />
                Mensaje para enviar
              </CardTitle>
              <CardDescription>
                {isReady
                  ? "Copiá el mensaje y enviáselo al cliente"
                  : "Completá todos los campos para generar el mensaje"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isReady ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-muted-foreground text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Completá modelo, capacidad, estado, color y que haya precio configurado
                </div>
              ) : (
                <Tabs defaultValue="corto">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="corto">Mensaje corto</TabsTrigger>
                    <TabsTrigger value="largo">Mensaje largo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="corto" className="mt-3 space-y-2">
                    <Textarea
                      value={shortMessage}
                      readOnly
                      className="bg-secondary border-transparent resize-none font-mono text-sm"
                      rows={8}
                    />
                    <Button
                      className="w-full"
                      onClick={() => handleCopy(shortMessage, "short")}
                    >
                      {copiedShort ? (
                        <><Check className="w-4 h-4 mr-2" /> Copiado!</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" /> Copiar mensaje</>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="largo" className="mt-3 space-y-2">
                    <Textarea
                      value={longMessage}
                      readOnly
                      className="bg-secondary border-transparent resize-none font-mono text-sm"
                      rows={12}
                    />
                    <Button
                      className="w-full"
                      onClick={() => handleCopy(longMessage, "long")}
                    >
                      {copiedLong ? (
                        <><Check className="w-4 h-4 mr-2" /> Copiado!</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" /> Copiar mensaje</>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
