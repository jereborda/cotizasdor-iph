// iPhone Models
export const iphoneModels = [
  { id: 'iphone-13', name: 'iPhone 13', generation: 13 },
  { id: 'iphone-13-mini', name: 'iPhone 13 mini', generation: 13 },
  { id: 'iphone-13-pro', name: 'iPhone 13 Pro', generation: 13 },
  { id: 'iphone-13-pro-max', name: 'iPhone 13 Pro Max', generation: 13 },
  { id: 'iphone-14', name: 'iPhone 14', generation: 14 },
  { id: 'iphone-14-plus', name: 'iPhone 14 Plus', generation: 14 },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', generation: 14 },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', generation: 14 },
  { id: 'iphone-15', name: 'iPhone 15', generation: 15 },
  { id: 'iphone-15-plus', name: 'iPhone 15 Plus', generation: 15 },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', generation: 15 },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', generation: 15 },
  { id: 'iphone-16', name: 'iPhone 16', generation: 16 },
  { id: 'iphone-16-plus', name: 'iPhone 16 Plus', generation: 16 },
  { id: 'iphone-16e', name: 'iPhone 16E', generation: 16 },
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro', generation: 16 },
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', generation: 16 },
  { id: 'iphone-17', name: 'iPhone 17', generation: 17 },
  { id: 'iphone-17-air', name: 'iPhone 17 Air', generation: 17 },
  { id: 'iphone-17-pro', name: 'iPhone 17 Pro', generation: 17 },
  { id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', generation: 17 },
]

export const capacities = ['128GB', '256GB', '512GB', '1TB', '2TB']

export const colors = [
  { id: 'negro', name: 'Negro', hex: '#1d1d1f' },
  { id: 'blanco', name: 'Blanco', hex: '#f5f5f7' },
  { id: 'azul', name: 'Azul', hex: '#0071e3' },
  { id: 'rosa', name: 'Rosa', hex: '#f5a5c0' },
  { id: 'titanio-natural', name: 'Titanio Natural', hex: '#9a9a9f' },
  { id: 'titanio-negro', name: 'Titanio Negro', hex: '#3d3d3f' },
  { id: 'titanio-blanco', name: 'Titanio Blanco', hex: '#e3e3e8' },
  { id: 'titanio-azul', name: 'Titanio Azul', hex: '#394c6d' },
]

export const conditions = [
  { id: 'nuevo', name: 'Nuevo Sellado' },
  { id: 'usado-premium', name: 'Usado Premium' },
]

// Partners (Socios)
export const partners = [
  { id: 'jeremias', name: 'Jeremías' },
  { id: 'socio-2', name: 'Santiago' },
]

// Vendors (Vendedores)
export const vendors = [
  { id: 'vendedor-interno', name: 'Vendedor Interno', commissionType: 'percentage', commissionValue: 5 },
  { id: 'vendedor-externo', name: 'Vendedor Externo', commissionType: 'fixed', commissionValue: 50 },
]

// Dollar types
export const dollarTypes = [
  { id: 'blue', name: 'Dólar Blue', rate: 1345 },
  { id: 'oficial', name: 'Dólar Oficial', rate: 1050 },
  { id: 'mep', name: 'Dólar MEP', rate: 1280 },
  { id: 'manual', name: 'Manual', rate: 1345 },
]

// Current dollar rate (mock)
export const currentDollarRate = {
  blue: 1345,
  oficial: 1050,
  mep: 1280,
  lastUpdate: new Date().toISOString(),
}

// Sample Sales
export type Sale = {
  id: string
  date: string
  clientName: string
  clientPhone: string
  model: string
  capacity: string
  color: string
  condition: string
  priceUSD: number
  priceARS: number
  dollarRateAtSale: number
  saleType: 'contado' | 'financiado'
  vendor: string | null
  commissionUSD: number
  status: 'pendiente' | 'cobrada' | 'vencida'
  nextDueDate: string | null
  partner1Investment: number
  partner2Investment: number
  partner1Profit: number
  partner2Profit: number
  totalProfit: number
  installments?: Installment[]
}

export type Installment = {
  id: string
  saleId: string
  number: number
  dueDate: string
  amountUSD: number
  dollarRateAtPayment: number | null
  amountARS: number | null
  status: 'pendiente' | 'cobrada' | 'vencida'
  paidDate: string | null
}

export const mockSales: Sale[] = [
  {
    id: 'V001',
    date: '2026-03-15',
    clientName: 'Juan Pérez',
    clientPhone: '+54 11 1234-5678',
    model: 'iPhone 15 Pro Max',
    capacity: '256GB',
    color: 'Titanio Natural',
    condition: 'Nuevo Sellado',
    priceUSD: 1450,
    priceARS: 1950250,
    dollarRateAtSale: 1345,
    saleType: 'contado',
    vendor: 'Vendedor Interno',
    commissionUSD: 72.5,
    status: 'cobrada',
    nextDueDate: null,
    partner1Investment: 650,
    partner2Investment: 650,
    partner1Profit: 63.75,
    partner2Profit: 63.75,
    totalProfit: 150,
  },
  {
    id: 'V002',
    date: '2026-03-14',
    clientName: 'María García',
    clientPhone: '+54 11 2345-6789',
    model: 'iPhone 16 Pro',
    capacity: '512GB',
    color: 'Titanio Negro',
    condition: 'Nuevo Sellado',
    priceUSD: 1595,
    priceARS: 2145275,
    dollarRateAtSale: 1345,
    saleType: 'financiado',
    vendor: null,
    commissionUSD: 0,
    status: 'pendiente',
    nextDueDate: '2026-03-17',
    partner1Investment: 700,
    partner2Investment: 700,
    partner1Profit: 97.5,
    partner2Profit: 97.5,
    totalProfit: 195,
    installments: [
      {
        id: 'C001-1',
        saleId: 'V002',
        number: 1,
        dueDate: '2026-03-17',
        amountUSD: 531.67,
        dollarRateAtPayment: null,
        amountARS: null,
        status: 'pendiente',
        paidDate: null,
      },
      {
        id: 'C001-2',
        saleId: 'V002',
        number: 2,
        dueDate: '2026-04-17',
        amountUSD: 531.67,
        dollarRateAtPayment: null,
        amountARS: null,
        status: 'pendiente',
        paidDate: null,
      },
      {
        id: 'C001-3',
        saleId: 'V002',
        number: 3,
        dueDate: '2026-05-17',
        amountUSD: 531.66,
        dollarRateAtPayment: null,
        amountARS: null,
        status: 'pendiente',
        paidDate: null,
      },
    ],
  },
  {
    id: 'V003',
    date: '2026-03-10',
    clientName: 'Carlos López',
    clientPhone: '+54 11 3456-7890',
    model: 'iPhone 14 Pro Max',
    capacity: '256GB',
    color: 'Negro',
    condition: 'Nuevo Sellado',
    priceUSD: 1320,
    priceARS: 1775400,
    dollarRateAtSale: 1345,
    saleType: 'financiado',
    vendor: 'Vendedor Externo',
    commissionUSD: 50,
    status: 'pendiente',
    nextDueDate: '2026-03-10',
    partner1Investment: 600,
    partner2Investment: 600,
    partner1Profit: 35,
    partner2Profit: 35,
    totalProfit: 120,
    installments: [
      {
        id: 'C002-1',
        saleId: 'V003',
        number: 1,
        dueDate: '2026-03-10',
        amountUSD: 440,
        dollarRateAtPayment: 1340,
        amountARS: 589600,
        status: 'cobrada',
        paidDate: '2026-03-10',
      },
      {
        id: 'C002-2',
        saleId: 'V003',
        number: 2,
        dueDate: '2026-04-10',
        amountUSD: 440,
        dollarRateAtPayment: null,
        amountARS: null,
        status: 'pendiente',
        paidDate: null,
      },
      {
        id: 'C002-3',
        saleId: 'V003',
        number: 3,
        dueDate: '2026-05-10',
        amountUSD: 440,
        dollarRateAtPayment: null,
        amountARS: null,
        status: 'pendiente',
        paidDate: null,
      },
    ],
  },
  {
    id: 'V004',
    date: '2026-02-28',
    clientName: 'Ana Martínez',
    clientPhone: '+54 11 4567-8901',
    model: 'iPhone 15',
    capacity: '128GB',
    color: 'Rosa',
    condition: 'Nuevo Sellado',
    priceUSD: 950,
    priceARS: 1277750,
    dollarRateAtSale: 1345,
    saleType: 'contado',
    vendor: null,
    commissionUSD: 0,
    status: 'cobrada',
    nextDueDate: null,
    partner1Investment: 450,
    partner2Investment: 400,
    partner1Profit: 58.82,
    partner2Profit: 41.18,
    totalProfit: 100,
  },
  {
    id: 'V005',
    date: '2026-02-20',
    clientName: 'Roberto Sánchez',
    clientPhone: '+54 11 5678-9012',
    model: 'iPhone 17 Pro Max',
    capacity: '1TB',
    color: 'Titanio Azul',
    condition: 'Nuevo Sellado',
    priceUSD: 1890,
    priceARS: 2542050,
    dollarRateAtSale: 1345,
    saleType: 'financiado',
    vendor: 'Vendedor Interno',
    commissionUSD: 94.5,
    status: 'vencida',
    nextDueDate: '2026-02-20',
    partner1Investment: 850,
    partner2Investment: 850,
    partner1Profit: 72.75,
    partner2Profit: 72.75,
    totalProfit: 240,
    installments: [
      {
        id: 'C003-1',
        saleId: 'V005',
        number: 1,
        dueDate: '2026-02-20',
        amountUSD: 630,
        dollarRateAtPayment: null,
        amountARS: null,
        status: 'vencida',
        paidDate: null,
      },
      {
        id: 'C003-2',
        saleId: 'V005',
        number: 2,
        dueDate: '2026-03-20',
        amountUSD: 630,
        dollarRateAtPayment: null,
        amountARS: null,
        status: 'pendiente',
        paidDate: null,
      },
      {
        id: 'C003-3',
        saleId: 'V005',
        number: 3,
        dueDate: '2026-04-20',
        amountUSD: 630,
        dollarRateAtPayment: null,
        amountARS: null,
        status: 'pendiente',
        paidDate: null,
      },
    ],
  },
]

// Get all installments from sales
export function getAllInstallments(): (Installment & { clientName: string; model: string })[] {
  const installments: (Installment & { clientName: string; model: string })[] = []
  mockSales.forEach(sale => {
    if (sale.installments) {
      sale.installments.forEach(inst => {
        installments.push({
          ...inst,
          clientName: sale.clientName,
          model: sale.model,
        })
      })
    }
  })
  return installments
}

// Dashboard stats
export function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const salesThisMonth = mockSales.filter(sale => {
    const saleDate = new Date(sale.date)
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
  })
  
  const allInstallments = getAllInstallments()
  
  const pendingInstallments = allInstallments.filter(i => i.status === 'pendiente')
  const overdueInstallments = allInstallments.filter(i => i.status === 'vencida')
  const dueTodayInstallments = allInstallments.filter(i => i.dueDate === today && i.status === 'pendiente')
  
  const totalProfitThisMonth = salesThisMonth.reduce((sum, sale) => sum + sale.totalProfit, 0)
  const partner1ProfitThisMonth = salesThisMonth.reduce((sum, sale) => sum + sale.partner1Profit, 0)
  const partner2ProfitThisMonth = salesThisMonth.reduce((sum, sale) => sum + sale.partner2Profit, 0)
  const pendingCommissions = salesThisMonth
    .filter(s => s.status === 'pendiente')
    .reduce((sum, sale) => sum + sale.commissionUSD, 0)
  
  return {
    dollarRate: currentDollarRate.blue,
    salesThisMonth: salesThisMonth.length,
    totalProfitThisMonth,
    partner1ProfitThisMonth,
    partner2ProfitThisMonth,
    dueTodayCount: dueTodayInstallments.length,
    overdueCount: overdueInstallments.length,
    pendingCommissions,
    pendingInstallmentsTotal: pendingInstallments.reduce((sum, i) => sum + i.amountUSD, 0),
  }
}

// Monthly sales data for charts
export const monthlySalesData = [
  { month: 'Oct', ventas: 8, ganancia: 1200 },
  { month: 'Nov', ventas: 12, ganancia: 1800 },
  { month: 'Dic', ventas: 15, ganancia: 2250 },
  { month: 'Ene', ventas: 10, ganancia: 1500 },
  { month: 'Feb', ventas: 14, ganancia: 2100 },
  { month: 'Mar', ventas: 5, ganancia: 705 },
]

// Partner profit data for charts
export const partnerProfitData = [
  { name: 'Jeremías', value: 328.07, fill: 'var(--chart-1)' },
  { name: 'Santiago', value: 310.43, fill: 'var(--chart-2)' },
]

// Settings defaults
export const defaultSettings = {
  dollar: {
    source: 'api',
    defaultType: 'blue',
    extraMargin: 0,
  },
  financing: {
    enabled: true,
    defaultSurcharge: 10,
    daysBetweenInstallments: 30,
    legalText: 'Las cuotas se abonan en pesos argentinos al valor del dólar venta del día de pago.',
  },
  partners: {
    partner1Name: 'Jeremías',
    partner2Name: 'Santiago',
    defaultSplitMode: '50/50',
    defaultPercentage: 50,
  },
  vendors: [
    { id: 'vendedor-interno', name: 'Vendedor Interno', commissionType: 'percentage', commissionValue: 5 },
    { id: 'vendedor-externo', name: 'Vendedor Externo', commissionType: 'fixed', commissionValue: 50 },
  ],
  messages: {
    shortTemplate: `¡Hola! Te paso la cotización:

{{modelo}} {{capacidad}} - {{color}}
Precio contado: USD {{precioContado}}
{{#financiado}}
Precio financiado en 3 cuotas: USD {{precioFinanciado}}

Las cuotas se abonan en pesos al valor del dólar venta del día de pago.
{{/financiado}}

Si querés, te lo reservo.`,
    longTemplate: `¡Hola! Te paso la cotización detallada:

{{modelo}} {{capacidad}} - {{color}}
Estado: {{estado}}

💵 Precio contado: USD {{precioContado}}
💵 Precio estimado en ARS: \${{precioARS}}

{{#financiado}}
📋 Financiación en 3 cuotas:
Precio total financiado: USD {{precioFinanciado}}
Recargo: {{recargoFinanciacion}}%

Cuota 1: USD {{cuota1}}
Cuota 2: USD {{cuota2}}
Cuota 3: USD {{cuota3}}

Las cuotas se abonan en pesos argentinos al valor del dólar venta del día de pago.
{{/financiado}}

Si tenés alguna consulta, estoy a disposición.`,
  },
}

// Reports data
export function getReportsData() {
  const totalSales = mockSales.length
  const totalProfitUSD = mockSales.reduce((sum, s) => sum + s.totalProfit, 0)
  const totalProfitPartner1 = mockSales.reduce((sum, s) => sum + s.partner1Profit, 0)
  const totalProfitPartner2 = mockSales.reduce((sum, s) => sum + s.partner2Profit, 0)
  const totalCommissions = mockSales.reduce((sum, s) => sum + s.commissionUSD, 0)
  const totalRevenueUSD = mockSales.reduce((sum, s) => sum + s.priceUSD, 0)
  const totalRevenueARS = mockSales.reduce((sum, s) => sum + s.priceARS, 0)
  
  const cashSales = mockSales.filter(s => s.saleType === 'contado').length
  const financedSales = mockSales.filter(s => s.saleType === 'financiado').length
  
  const modelCounts: Record<string, number> = {}
  mockSales.forEach(s => {
    modelCounts[s.model] = (modelCounts[s.model] || 0) + 1
  })
  
  const topModels = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([model, count]) => ({ model, count }))
  
  const vendorSales: Record<string, number> = {}
  mockSales.forEach(s => {
    if (s.vendor) {
      vendorSales[s.vendor] = (vendorSales[s.vendor] || 0) + 1
    }
  })
  
  const topVendors = Object.entries(vendorSales)
    .sort((a, b) => b[1] - a[1])
    .map(([vendor, count]) => ({ vendor, count }))
  
  return {
    totalSales,
    totalProfitUSD,
    totalProfitPartner1,
    totalProfitPartner2,
    totalCommissions,
    totalRevenueUSD,
    totalRevenueARS,
    cashSales,
    financedSales,
    avgProfitPerSale: totalProfitUSD / totalSales,
    topModels,
    topVendors,
  }
}
