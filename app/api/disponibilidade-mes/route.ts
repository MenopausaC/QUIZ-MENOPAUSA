import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isBefore, startOfDay, getDay } from "date-fns"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year") || new Date().getFullYear().toString()
    const month = searchParams.get("month") || (new Date().getMonth() + 1).toString()

    console.log(`🔄 [API] Buscando disponibilidade para ${month}/${year}`)

    // Buscar agendamentos do mês
    const inicioMes = `${year}-${month.padStart(2, "0")}-01`
    const ultimoDiaMes = new Date(Number.parseInt(year), Number.parseInt(month), 0).getDate()
    const fimMes = `${year}-${month.padStart(2, "0")}-${ultimoDiaMes}`

    const { data: agendamentos, error } = await supabase
      .from("agendamentos")
      .select("data_agendamento, horario_agendamento, status")
      .gte("data_agendamento", inicioMes)
      .lte("data_agendamento", fimMes)
      .neq("status", "CANCELADO")

    if (error) {
      console.error("❌ [API] Erro ao buscar agendamentos:", error)
      throw error
    }

    console.log(`✅ [API] ${agendamentos?.length || 0} agendamentos encontrados`)

    // Gerar todos os dias do mês
    const start = startOfMonth(new Date(Number.parseInt(year), Number.parseInt(month) - 1))
    const end = endOfMonth(new Date(Number.parseInt(year), Number.parseInt(month) - 1))
    const days = eachDayOfInterval({ start, end })

    // Filtrar dias disponíveis (dias úteis que não são passados)
    const availableDates = days
      .filter((day) => {
        const dayOfWeek = getDay(day)
        // Excluir domingos (0) e sábados (6)
        if (dayOfWeek === 0 || dayOfWeek === 6) return false

        // Excluir dias passados
        if (isBefore(day, startOfDay(new Date()))) return false

        return true
      })
      .map((day) => format(day, "yyyy-MM-dd"))

    console.log("✅ [API] Disponibilidade calculada:", availableDates.length, "dias disponíveis")

    return NextResponse.json({
      success: true,
      availableDates,
    })
  } catch (error) {
    console.error("❌ [API] Erro ao calcular disponibilidade:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
