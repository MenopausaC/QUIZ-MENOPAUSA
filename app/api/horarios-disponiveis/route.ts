import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get("data")

    if (!data) {
      return NextResponse.json({ error: "Parâmetro data é obrigatório" }, { status: 400 })
    }

    console.log(`🔄 [API] Buscando horários disponíveis para ${data}`)

    // Buscar agendamentos do dia
    const { data: agendamentos, error } = await supabase
      .from("agendamentos")
      .select("horario_agendamento, status")
      .eq("data_agendamento", data)
      .neq("status", "CANCELADO")

    if (error) {
      console.error("❌ [API] Erro ao buscar agendamentos:", error)
      throw error
    }

    console.log(`✅ [API] ${agendamentos?.length || 0} agendamentos encontrados para ${data}`)

    // Horários disponíveis padrão (de 30 em 30 minutos)
    const horariosDisponiveis = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
    ]

    // Horários ocupados neste dia
    const horariosOcupados = agendamentos?.map((a) => a.horario_agendamento) || []

    // Horários disponíveis = todos os horários - ocupados
    const horariosDisponiveisFinais = horariosDisponiveis.filter((horario) => !horariosOcupados.includes(horario))

    console.log(`✅ [API] ${horariosDisponiveisFinais.length} horários disponíveis para ${data}`)

    return NextResponse.json({
      success: true,
      horarios: horariosDisponiveisFinais,
    })
  } catch (error) {
    console.error("❌ [API] Erro ao buscar horários disponíveis:", error)
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
