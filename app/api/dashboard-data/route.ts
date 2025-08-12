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

    const hoje = new Date().toISOString().split("T")[0]
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

    const agendamentosHoje = agendamentos?.filter((a) => a.data_agendamento === hoje) || []
    const agendamentosMes = agendamentos?.filter((a) => a.data_agendamento >= inicioMes) || []
    const agendamentosPagos =
      agendamentos?.filter((a) => ["PAGO", "CONFIRMADO", "REALIZADO"].includes(a.status?.toUpperCase() || "")) || []

    // Calcular faturamento mensal
    const faturamentoMes =
      agendamentosMes
        ?.filter((a) => ["PAGO", "REALIZADO"].includes(a.status?.toUpperCase() || ""))
        ?.reduce((total, a) => total + (Number(a.valor_consulta) || 0), 0) || 0

    // Atividades recentes formatadas
    const recentActivities =
      agendamentos?.slice(0, 10).map((a, index) => ({
        id: `${a.id}-${index}`,
        type: "agendamento" as const,
        description: `${a.nome_paciente} agendou consulta para ${new Date(a.data_agendamento).toLocaleDateString("pt-BR")}`,
        time: new Date(a.created_at).toLocaleString("pt-BR"),
      })) || []

    // Leads por origem
    const leadsPorOrigem =
      agendamentos?.reduce(
        (acc, a) => {
          const origem = a.origem || "Não informado"
          acc[origem] = (acc[origem] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Agendamentos por status
    const agendamentosPorStatus =
      agendamentos?.reduce(
        (acc, a) => {
          const status = a.status || "Não informado"
          acc[status] = (acc[status] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    const dashboardData = {
      // Dados para aba Geral
      totalLeads: agendamentos?.length || 0,
      leadsPagos: agendamentosPagos.length,
      agendamentosHoje: agendamentosHoje.length,
      faturamentoMes: faturamentoMes,
      recentActivities,

      // Dados para aba Lead Pago
      leads:
        agendamentos?.map((a) => ({
          id: a.id,
          nome: a.nome_paciente,
          email: a.email_paciente,
          telefone: a.telefone_paciente,
          whatsapp: a.whatsapp,
          origem: a.origem,
          status: a.status,
          dataAgendamento: a.data_agendamento,
          horarioAgendamento: a.horario_agendamento,
          valorConsulta: a.valor_consulta,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        })) || [],

      // Estatísticas detalhadas
      estatisticas: {
        totalAgendamentos: agendamentos?.length || 0,
        agendamentosHoje: agendamentosHoje.length,
        agendamentosMes: agendamentosMes.length,
        agendamentosPagos: agendamentosPagos.length,
        faturamentoMensal: faturamentoMes,
        ticketMedio: agendamentosPagos.length > 0 ? faturamentoMes / agendamentosPagos.length : 0,
      },

      // Dados para gráficos e análises
      leadsPorOrigem,
      agendamentosPorStatus,
      taxaConversao: agendamentos?.length > 0 ? (agendamentosPagos.length / agendamentos.length) * 100 : 0,
      taxaQualificacao: agendamentos?.length > 0 ? (agendamentosHoje.length / agendamentos.length) * 100 : 0,
      taxaAgendamento: agendamentos?.length > 0 ? (agendamentosMes.length / agendamentos.length) * 100 : 0,

      // Agendamentos recentes para exibição
      agendamentosRecentes: agendamentos?.slice(0, 10) || [],
      proximosAgendamentos:
        agendamentos
          ?.filter((a) => a.data_agendamento >= hoje)
          ?.sort((a, b) => a.data_agendamento.localeCompare(b.data_agendamento))
          ?.slice(0, 5) || [],
    }

    console.log("✅ [API] Dashboard data preparado:", {
      totalAgendamentos: dashboardData.estatisticas.totalAgendamentos,
      agendamentosHoje: dashboardData.estatisticas.agendamentosHoje,
      faturamento: dashboardData.estatisticas.faturamentoMensal,
    })

    return NextResponse.json(dashboardData)
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
