import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")

    // Buscar todos os agendamentos (que agora incluem leads e agendamentos)
    let query = supabase
      .from("agendamentos")
      .select("*")
      .order("created_at", { ascending: false })

    // Filtrar por tipo se especificado
    if (tipo) {
      query = query.eq("tipo_consulta", tipo.toUpperCase())
    }

    const { data: agendamentos, error: agendamentosError } = await query
    if (agendamentosError) throw agendamentosError

    // Separar leads e agendamentos reais
    const leads = agendamentos?.filter(item => item.status === 'LEAD') || []
    const agendamentosReais = agendamentos?.filter(item => item.status !== 'LEAD') || []

    // Transformar dados para compatibilidade com o frontend
    const leadsFormatados = agendamentos?.map(item => ({
      id: item.id,
      nome: item.nome_paciente,
      email: item.email_paciente,
      telefone: item.telefone_paciente,
      qualificacao: item.qualificacao_lead,
      created_at: item.created_at,
      tipo: item.tipo_consulta,
      agendamento: item.status !== 'LEAD' ? {
        id: item.id,
        data_agendamento: item.data_agendamento,
        horario_agendamento: item.horario_agendamento,
        status: item.status,
        tipo_consulta: item.tipo_consulta,
        observacoes: item.observacoes,
        nome_paciente: item.nome_paciente,
        email_paciente: item.email_paciente,
        telefone_paciente: item.telefone_paciente,
        valor_pago: item.valor_pago,
        payment_id: item.payment_id,
        payment_status: item.payment_status
      } : null
    })) || []

    // Se a requisição for para um tipo específico (ex: 'pago')
    if (tipo) {
      const leadsFiltrados = leadsFormatados.filter(l => l.tipo?.toLowerCase() === tipo.toLowerCase())
      const totalLeads = leadsFiltrados.length
      const leadsQualificados = leadsFiltrados.filter(l => l.qualificacao === "qualificado").length
      const leadsComAgendamento = leadsFiltrados.filter(l => l.agendamento).length
      const agendamentosRealizados = leadsFiltrados.filter(l => l.agendamento?.status?.toUpperCase() === "REALIZADO").length

      return NextResponse.json({
        totalLeads,
        leadsQualificados,
        leadsComAgendamento,
        agendamentosRealizados,
        taxaQualificacao: totalLeads > 0 ? (leadsQualificados / totalLeads) * 100 : 0,
        taxaAgendamento: leadsQualificados > 0 ? (leadsComAgendamento / leadsQualificados) * 100 : 0,
        leads: leadsFiltrados,
      })
    }

    // Resposta geral para o dashboard
    const hoje = new Date().toISOString().split('T')[0]
    const agendamentosHoje = agendamentosReais.filter(a => a.data_agendamento === hoje).length

    const proximaSemanaDatas = Array.from({ length: 7 }, (_, i) => {
      const data = new Date()
      data.setDate(data.getDate() + i)
      return data.toISOString().split('T')[0]
    })

    const proximosAgendamentos = agendamentosReais
      .filter(a => 
        proximaSemanaDatas.includes(a.data_agendamento) && 
        a.status?.toUpperCase() !== 'CANCELADO' && 
        a.status?.toUpperCase() !== 'REALIZADO'
      )
      .sort((a, b) => new Date(a.data_agendamento).getTime() - new Date(b.data_agendamento).getTime())
      .slice(0, 5)

    const totalLeadsGeral = agendamentos?.length || 0
    const leadsQualificadosGeral = agendamentos?.filter(l => l.qualificacao_lead === 'qualificado').length || 0
    const leadsComAgendamentoGeral = agendamentosReais.length
    const agendamentosRealizadosGeral = agendamentosReais.filter(a => a.status?.toUpperCase() === 'REALIZADO').length

    return NextResponse.json({
      totalQuestionarios: totalLeadsGeral,
      totalAgendamentos: leadsComAgendamentoGeral,
      agendamentosHoje,
      proximosAgendamentos,
      ultimosLeads: leadsFormatados.slice(0, 10),
      taxaConversao: {
        qualificacao: totalLeadsGeral > 0 ? (leadsQualificadosGeral / totalLeadsGeral) * 100 : 0,
        agendamento: leadsQualificadosGeral > 0 ? (leadsComAgendamentoGeral / leadsQualificadosGeral) * 100 : 0,
        realizacao: leadsComAgendamentoGeral > 0 ? (agendamentosRealizadosGeral / leadsComAgendamentoGeral) * 100 : 0,
      },
    })

  } catch (error: any) {
    console.error("Erro na API dashboard-data:", error)
    return NextResponse.json({ error: "Erro interno do servidor", details: error.message }, { status: 500 })
  }
}
