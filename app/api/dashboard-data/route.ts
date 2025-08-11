import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 [API] Buscando dados do dashboard...")

    // Buscar agendamentos
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from("agendamentos")
      .select("*")
      .order("created_at", { ascending: false })

    if (agendamentosError) {
      console.error("❌ [API] Erro ao buscar agendamentos:", agendamentosError)
      throw agendamentosError
    }

    console.log(`✅ [API] ${agendamentos?.length || 0} agendamentos encontrados`)

    // Buscar leads/questionários seria feito aqui se a tabela existisse

    // Calcular estatísticas
    const hoje = new Date().toISOString().split("T")[0]
    const agendamentosHoje = agendamentos?.filter((a) => a.data_agendamento === hoje) || []
    const agendamentosConfirmados = agendamentos?.filter((a) => ["CONFIRMADO", "PAGO"].includes(a.status)) || []
    const agendamentosRealizados = agendamentos?.filter((a) => a.status === "REALIZADO") || []

    // Calcular faturamento (apenas agendamentos pagos/realizados)
    const faturamento =
      agendamentos
        ?.filter((a) => ["PAGO", "REALIZADO"].includes(a.status))
        ?.reduce((total, a) => total + (a.valor_consulta || 0), 0) || 0

    // Atividades recentes (últimos 10 agendamentos)
    const atividadesRecentes =
      agendamentos?.slice(0, 10).map((a) => ({
        id: a.id,
        tipo: "agendamento",
        descricao: `Agendamento de ${a.nome_paciente}`,
        data: a.created_at,
        status: a.status,
      })) || []

    const dashboardData = {
      estatisticas: {
        totalAgendamentos: agendamentos?.length || 0,
        agendamentosHoje: agendamentosHoje.length,
        agendamentosConfirmados: agendamentosConfirmados.length,
        agendamentosRealizados: agendamentosRealizados.length,
        faturamentoMensal: faturamento,
      },
      agendamentosRecentes: agendamentos?.slice(0, 5) || [],
      atividadesRecentes,
      proximosAgendamentos:
        agendamentos
          ?.filter((a) => a.data_agendamento >= hoje)
          ?.sort((a, b) => a.data_agendamento.localeCompare(b.data_agendamento))
          ?.slice(0, 5) || [],
      totalLeads: 0, // Would come from questionarios table
      leadsPagos: 0,
      faturamentoMes: faturamento,
      agendamentos: agendamentos || [],
      stats: {
        total: agendamentos?.length || 0,
        agendados: agendamentos?.filter((a) => a.status === "AGENDADO").length || 0,
        confirmados: agendamentosConfirmados.length,
        realizados: agendamentosRealizados.length,
        cancelados: agendamentos?.filter((a) => a.status === "CANCELADO").length || 0,
      },
    }

    console.log("✅ [API] Dashboard data preparado:", {
      totalAgendamentos: dashboardData.estatisticas.totalAgendamentos,
      agendamentosHoje: dashboardData.estatisticas.agendamentosHoje,
      faturamento: dashboardData.estatisticas.faturamentoMensal,
    })

    return NextResponse.json({
      success: true,
      data: dashboardData,
      ...dashboardData,
    })
  } catch (error) {
    console.error("❌ [API] Erro ao buscar dados do dashboard:", error)
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
