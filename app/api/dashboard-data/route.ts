import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const typeFilter = searchParams.get("type")?.toUpperCase() // "ORGANICO" | "PAGO" | undefined

    // Base query (without selecting a non-existent column)
    let query = supabase.from("leads_menopausa").select("*")

    // Filter by `origem` instead of the missing `tipo_questionario` column
    if (typeFilter === "ORGANICO") {
      query = query.eq("origem", "questionario-menopausa-web")
    } else if (typeFilter === "PAGO") {
      query = query.eq("origem", "questionario-lead-pago")
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar dados do Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Inject a virtual `tipo_questionario` field so o frontend continua funcionando
    const enriched = (data ?? []).map((row) => ({
      ...row,
      tipo_questionario:
        row.origem === "questionario-menopausa-web"
          ? "ORGANICO"
          : row.origem === "questionario-lead-pago"
            ? "PAGO"
            : null,
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("Erro inesperado na API de dashboard:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
