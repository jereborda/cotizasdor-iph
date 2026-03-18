import { createClient } from '@supabase/supabase-js'
import type { Sale, Installment, Remito } from './mock-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function fetchSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*, installments(*)')
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as Sale[]
}

export async function insertSale(sale: Sale): Promise<void> {
  const { installments, ...saleData } = sale

  const { error: saleError } = await supabase.from('sales').insert(saleData)
  if (saleError) throw new Error(saleError.message)

  if (installments && installments.length > 0) {
    const { error: instError } = await supabase.from('installments').insert(installments)
    if (instError) throw new Error(instError.message)
  }
}

// ─── Installments ─────────────────────────────────────────────────────────────

export async function updateInstallment(
  id: string,
  patch: Partial<Installment>
): Promise<void> {
  const { error } = await supabase.from('installments').update(patch).eq('id', id)
  if (error) throw error
}

export async function updateSaleStatus(
  saleId: string,
  patch: Partial<Sale>
): Promise<void> {
  const { error } = await supabase.from('sales').update(patch).eq('id', saleId)
  if (error) throw error
}

export async function updateSale(
  saleId: string,
  patch: Partial<Omit<Sale, 'installments'>>
): Promise<void> {
  const { error } = await supabase.from('sales').update(patch).eq('id', saleId)
  if (error) throw error
}

// ─── Model Costs ──────────────────────────────────────────────────────────────

// Key format: "modelId_capacity" e.g. "iphone-16_256GB"
export function modelCostKey(modelId: string, capacity: string) {
  return `${modelId}_${capacity}`
}

export async function fetchModelCosts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('model_costs').select('model_id, cost_usd')
  if (error) throw error
  const map: Record<string, number> = {}
  for (const row of data ?? []) map[row.model_id] = row.cost_usd
  return map
}

export async function upsertModelCost(key: string, costUsd: number): Promise<void> {
  const { error } = await supabase.from('model_costs').upsert(
    { model_id: key, cost_usd: costUsd, updated_at: new Date().toISOString() },
    { onConflict: 'model_id' }
  )
  if (error) throw error
}

// ─── Vendor Prices ────────────────────────────────────────────────────────────
// Key format: "modelId_capacity_condition" e.g. "iphone-16-pro_256GB_nuevo"

export async function fetchVendorPrices(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('vendor_prices').select('price_key, price_usd')
  if (error) throw error
  const map: Record<string, number> = {}
  for (const row of data ?? []) map[row.price_key] = row.price_usd
  return map
}

export async function upsertVendorPrice(key: string, priceUsd: number): Promise<void> {
  const { error } = await supabase.from('vendor_prices').upsert(
    { price_key: key, price_usd: priceUsd, updated_at: new Date().toISOString() },
    { onConflict: 'price_key' }
  )
  if (error) throw error
}

// ─── Remitos ──────────────────────────────────────────────────────────────────

export async function fetchRemitos(): Promise<Remito[]> {
  const { data, error } = await supabase
    .from('remitos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Remito[]
}

export async function insertRemito(remito: Omit<Remito, 'created_at'>): Promise<void> {
  const { error } = await supabase.from('remitos').insert(remito)
  if (error) throw error
}

export async function updateRemitoStatus(
  id: string,
  status: 'aceptado' | 'rechazado'
): Promise<void> {
  const { error } = await supabase.from('remitos').update({ status }).eq('id', id)
  if (error) throw error
}
