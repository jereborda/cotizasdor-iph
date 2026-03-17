"use client"

import { useState } from "react"
import {
  Settings,
  DollarSign,
  CreditCard,
  Users,
  UserCheck,
  MessageSquare,
  Save,
  Plus,
  Trash2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultSettings } from "@/lib/mock-data"
import { toast } from "sonner"

type VendorEntry = {
  id: string
  name: string
  commissionType: "percentage" | "fixed"
  commissionValue: number
}

export default function ConfiguracionPage() {
  // --- Dólar ---
  const [dollarSource, setDollarSource] = useState(defaultSettings.dollar.source)
  const [dollarDefaultType, setDollarDefaultType] = useState(defaultSettings.dollar.defaultType)
  const [dollarExtraMargin, setDollarExtraMargin] = useState(defaultSettings.dollar.extraMargin)

  // --- Financiación ---
  const [financingEnabled, setFinancingEnabled] = useState(defaultSettings.financing.enabled)
  const [financingSurcharge, setFinancingSurcharge] = useState(defaultSettings.financing.defaultSurcharge)
  const [daysBetween, setDaysBetween] = useState(defaultSettings.financing.daysBetweenInstallments)
  const [legalText, setLegalText] = useState(defaultSettings.financing.legalText)

  // --- Socios ---
  const [partner1Name, setPartner1Name] = useState(defaultSettings.partners.partner1Name)
  const [partner2Name, setPartner2Name] = useState(defaultSettings.partners.partner2Name)
  const [splitMode, setSplitMode] = useState(defaultSettings.partners.defaultSplitMode)
  const [defaultPercentage, setDefaultPercentage] = useState(defaultSettings.partners.defaultPercentage)

  // --- Vendedores ---
  const [vendorList, setVendorList] = useState<VendorEntry[]>(defaultSettings.vendors as VendorEntry[])

  // --- Mensajes ---
  const [shortTemplate, setShortTemplate] = useState(defaultSettings.messages.shortTemplate)
  const [longTemplate, setLongTemplate] = useState(defaultSettings.messages.longTemplate)

  const handleSave = (section: string) => {
    toast.success(`${section} guardado correctamente`)
  }

  const addVendor = () => {
    const newVendor: VendorEntry = {
      id: `vendedor-${Date.now()}`,
      name: "",
      commissionType: "percentage",
      commissionValue: 5,
    }
    setVendorList((prev) => [...prev, newVendor])
  }

  const removeVendor = (id: string) => {
    setVendorList((prev) => prev.filter((v) => v.id !== id))
  }

  const updateVendor = (id: string, updates: Partial<VendorEntry>) => {
    setVendorList((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)))
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground">
          Parámetros del sistema y del negocio
        </p>
      </div>

      <Tabs defaultValue="dollar">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="dollar" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <DollarSign className="w-3.5 h-3.5" />
            Dólar
          </TabsTrigger>
          <TabsTrigger value="financing" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <CreditCard className="w-3.5 h-3.5" />
            Financiación
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5" />
            Socios
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <UserCheck className="w-3.5 h-3.5" />
            Vendedores
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-1.5 text-xs sm:text-sm col-span-2 sm:col-span-1">
            <MessageSquare className="w-3.5 h-3.5" />
            Mensajes
          </TabsTrigger>
        </TabsList>

        {/* A. Dólar */}
        <TabsContent value="dollar" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Configuración del Dólar
              </CardTitle>
              <CardDescription>
                Fuente de cotización y tipo de cambio por defecto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fuente del Dólar</Label>
                  <Select value={dollarSource} onValueChange={setDollarSource}>
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API automática (mock)</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Próximamente conectado a API real de dólar blue
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Dólar por Defecto</Label>
                  <Select value={dollarDefaultType} onValueChange={setDollarDefaultType}>
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Dólar Blue</SelectItem>
                      <SelectItem value="oficial">Dólar Oficial</SelectItem>
                      <SelectItem value="mep">Dólar MEP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Margen Extra Opcional (%)</Label>
                  <Input
                    type="number"
                    value={dollarExtraMargin}
                    onChange={(e) => setDollarExtraMargin(Number(e.target.value))}
                    className="bg-secondary border-transparent font-mono"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se suma al tipo de cambio elegido. Dejar en 0 para no aplicar.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={() => handleSave("Configuración del dólar")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* B. Financiación */}
        <TabsContent value="financing" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Financiación en Cuotas
              </CardTitle>
              <CardDescription>
                Parámetros del plan de 3 cuotas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="font-medium">Activar financiación en 3 cuotas</p>
                  <p className="text-sm text-muted-foreground">
                    Muestra la opción de financiar en el cotizador
                  </p>
                </div>
                <Switch
                  checked={financingEnabled}
                  onCheckedChange={setFinancingEnabled}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Recargo por Financiación (%)</Label>
                  <Input
                    type="number"
                    value={financingSurcharge}
                    onChange={(e) => setFinancingSurcharge(Number(e.target.value))}
                    className="bg-secondary border-transparent font-mono"
                    disabled={!financingEnabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Porcentaje que se agrega al precio contado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Días entre cuotas</Label>
                  <Input
                    type="number"
                    value={daysBetween}
                    onChange={(e) => setDaysBetween(Number(e.target.value))}
                    className="bg-secondary border-transparent font-mono"
                    disabled={!financingEnabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Intervalo en días entre cada cuota (por defecto 30)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Texto Legal por Defecto</Label>
                <Textarea
                  value={legalText}
                  onChange={(e) => setLegalText(e.target.value)}
                  className="bg-secondary border-transparent resize-none"
                  rows={3}
                  disabled={!financingEnabled}
                />
                <p className="text-xs text-muted-foreground">
                  Se incluye automáticamente en los mensajes de cotización financiada
                </p>
              </div>

              <div className="pt-2">
                <Button onClick={() => handleSave("Configuración de financiación")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* C. Socios */}
        <TabsContent value="partners" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Socios
              </CardTitle>
              <CardDescription>
                Nombres y modo de reparto de ganancias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nombre Socio 1</Label>
                  <Input
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    className="bg-secondary border-transparent"
                    placeholder="Ej: Jeremías"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nombre Socio 2</Label>
                  <Input
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    className="bg-secondary border-transparent"
                    placeholder="Ej: Socio 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Modo de Reparto por Defecto</Label>
                  <Select value={splitMode} onValueChange={setSplitMode}>
                    <SelectTrigger className="bg-secondary border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50/50">50/50 — Partes iguales</SelectItem>
                      <SelectItem value="proportional">Proporcional a inversión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {splitMode === "proportional" && (
                  <div className="space-y-2">
                    <Label>Porcentaje Socio 1 (%)</Label>
                    <Input
                      type="number"
                      value={defaultPercentage}
                      onChange={(e) => setDefaultPercentage(Number(e.target.value))}
                      className="bg-secondary border-transparent font-mono"
                      min={0}
                      max={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      Socio 2 recibirá el {100 - defaultPercentage}% restante
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button onClick={() => handleSave("Configuración de socios")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* D. Vendedores */}
        <TabsContent value="vendors" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    Vendedores
                  </CardTitle>
                  <CardDescription>
                    Lista de vendedores y sus comisiones
                  </CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={addVendor}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendorList.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay vendedores registrados
                </div>
              )}

              {vendorList.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-4 rounded-lg bg-secondary space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Nombre</Label>
                      <Input
                        value={vendor.name}
                        onChange={(e) => updateVendor(vendor.id, { name: e.target.value })}
                        className="bg-background border-transparent"
                        placeholder="Nombre del vendedor"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Tipo de comisión</Label>
                      <Select
                        value={vendor.commissionType}
                        onValueChange={(v: "percentage" | "fixed") =>
                          updateVendor(vendor.id, { commissionType: v })
                        }
                      >
                        <SelectTrigger className="bg-background border-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          <SelectItem value="fixed">Fijo (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Comisión ({vendor.commissionType === "percentage" ? "%" : "USD"})
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={vendor.commissionValue}
                          onChange={(e) =>
                            updateVendor(vendor.id, { commissionValue: Number(e.target.value) })
                          }
                          className="bg-background border-transparent font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeVendor(vendor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Button onClick={() => handleSave("Lista de vendedores")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E. Mensajes */}
        <TabsContent value="messages" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Plantilla de Mensaje Corto
                </CardTitle>
                <CardDescription>
                  Mensaje breve para enviar por WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Plantilla</Label>
                  <Textarea
                    value={shortTemplate}
                    onChange={(e) => setShortTemplate(e.target.value)}
                    className="bg-secondary border-transparent resize-none font-mono text-sm"
                    rows={10}
                  />
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Variables disponibles:</p>
                  <p>{"{{modelo}}"} — nombre del modelo · {"{{capacidad}}"} — capacidad</p>
                  <p>{"{{color}}"} — color · {"{{precioContado}}"} — precio contado USD</p>
                  <p>{"{{precioFinanciado}}"} — precio financiado USD</p>
                  <p>{"{{cuota1}}"} {"{{cuota2}}"} {"{{cuota3}}"} — valor de cada cuota</p>
                  <p>{"{{#financiado}}"} ... {"{{/financiado}}"} — sección condicional</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Plantilla de Mensaje Detallado
                </CardTitle>
                <CardDescription>
                  Mensaje completo con detalle de financiación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Plantilla</Label>
                  <Textarea
                    value={longTemplate}
                    onChange={(e) => setLongTemplate(e.target.value)}
                    className="bg-secondary border-transparent resize-none font-mono text-sm"
                    rows={18}
                  />
                </div>
              </CardContent>
            </Card>

            <div>
              <Button onClick={() => handleSave("Plantillas de mensajes")}>
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
