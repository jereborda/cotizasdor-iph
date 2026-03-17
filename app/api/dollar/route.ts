import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 300 }, // cache 5 min en el servidor
    })

    if (!res.ok) throw new Error(`dolarapi error: ${res.status}`)

    const data = await res.json()

    return NextResponse.json({
      blue: data.venta as number,
      compra: data.compra as number,
      lastUpdate: data.fechaActualizacion as string,
    })
  } catch {
    // Fallback al valor mock si la API falla
    return NextResponse.json(
      { blue: 1345, compra: 1330, lastUpdate: new Date().toISOString(), fallback: true },
      { status: 200 }
    )
  }
}
