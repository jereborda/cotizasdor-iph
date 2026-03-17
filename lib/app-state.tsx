"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { currentDollarRate, type Sale, type Installment } from "@/lib/mock-data"
import {
  fetchSales,
  insertSale,
  updateInstallment,
  updateSaleStatus,
  fetchModelCosts,
  upsertModelCost,
} from "@/lib/supabase"

interface DollarData {
  blue: number
  compra: number
  lastUpdate: string
  loading: boolean
  error: boolean
}

interface AppState {
  sales: Sale[]
  salesLoading: boolean
  dollar: DollarData
  modelCosts: Record<string, number>
  agregarVenta: (sale: Sale) => Promise<void>
  marcarCuotaCobrada: (installmentId: string, dollarRate: number) => Promise<void>
  refreshDollar: () => Promise<void>
  saveModelCost: (modelId: string, costUsd: number) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([])
  const [salesLoading, setSalesLoading] = useState(true)
  const [modelCosts, setModelCosts] = useState<Record<string, number>>({})
  const [dollar, setDollar] = useState<DollarData>({
    blue: currentDollarRate.blue,
    compra: 1330,
    lastUpdate: currentDollarRate.lastUpdate,
    loading: false,
    error: false,
  })

  // ─── Load data from Supabase on mount ───────────────────────────────────────
  useEffect(() => {
    fetchSales()
      .then((data) => setSales(data))
      .catch((err) => console.error("Error loading sales:", err))
      .finally(() => setSalesLoading(false))

    fetchModelCosts()
      .then((data) => setModelCosts(data))
      .catch(() => { /* model_costs table may not exist yet */ })
  }, [])

  // ─── Dollar rate ─────────────────────────────────────────────────────────────
  const fetchDollar = useCallback(async () => {
    setDollar((prev) => ({ ...prev, loading: true, error: false }))
    try {
      const res = await fetch("/api/dollar")
      if (!res.ok) throw new Error("fetch failed")
      const data = await res.json()
      setDollar({
        blue: data.blue,
        compra: data.compra,
        lastUpdate: data.lastUpdate,
        loading: false,
        error: false,
      })
    } catch {
      setDollar((prev) => ({ ...prev, loading: false, error: true }))
    }
  }, [])

  useEffect(() => {
    fetchDollar()
  }, [fetchDollar])

  const saveModelCost = useCallback((modelId: string, costUsd: number) => {
    setModelCosts((prev) => ({ ...prev, [modelId]: costUsd }))
    upsertModelCost(modelId, costUsd).catch(console.error)
  }, [])

  // ─── Actions ──────────────────────────────────────────────────────────────────
  const agregarVenta = useCallback(async (sale: Sale) => {
    await insertSale(sale)
    setSales((prev) => [sale, ...prev])
  }, [])

  const marcarCuotaCobrada = useCallback(async (installmentId: string, dollarRate: number) => {
    const paidDate = new Date().toISOString().split("T")[0]

    // Optimistic update
    setSales((prev) => {
      const updated = prev.map((sale) => {
        if (!sale.installments) return sale

        const updatedInstallments = sale.installments.map((inst): Installment => {
          if (inst.id !== installmentId) return inst
          return {
            ...inst,
            status: "cobrada",
            dollarRateAtPayment: dollarRate,
            amountARS: inst.amountUSD * dollarRate,
            paidDate,
          }
        })

        const hasThisInstallment = sale.installments.some((i) => i.id === installmentId)
        if (!hasThisInstallment) return sale

        const allCobradas = updatedInstallments.every((i) => i.status === "cobrada")
        const anyVencida = updatedInstallments.some(
          (i) => i.status === "vencida" || (i.status === "pendiente" && isPast(i.dueDate))
        )
        const newSaleStatus: Sale["status"] = allCobradas ? "cobrada" : anyVencida ? "vencida" : "pendiente"
        const nextPending = updatedInstallments
          .filter((i) => i.status !== "cobrada")
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

        return {
          ...sale,
          installments: updatedInstallments,
          status: newSaleStatus,
          nextDueDate: nextPending?.dueDate ?? null,
        }
      })

      // Persist sale status changes to Supabase
      const affectedSale = updated.find((s) => s.installments?.some((i) => i.id === installmentId))
      if (affectedSale) {
        updateSaleStatus(affectedSale.id, {
          status: affectedSale.status,
          nextDueDate: affectedSale.nextDueDate,
        }).catch(console.error)
      }

      return updated
    })

    // Persist installment to Supabase
    await updateInstallment(installmentId, {
      status: "cobrada",
      dollarRateAtPayment: dollarRate,
      amountARS: (() => {
        const inst = sales.flatMap((s) => s.installments ?? []).find((i) => i.id === installmentId)
        return inst ? inst.amountUSD * dollarRate : 0
      })(),
      paidDate,
    })
  }, [sales])

  return (
    <AppStateContext.Provider
      value={{ sales, salesLoading, dollar, modelCosts, agregarVenta, marcarCuotaCobrada, refreshDollar: fetchDollar, saveModelCost }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider")
  return ctx
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().split("T")[0]
}
