import { createClient } from '@supabase/supabase-js'
import type { Sale, Installment } from './mock-data'

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
