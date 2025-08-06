import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const results = {
      config: {
        url: supabaseUrl ? "OK" : "ERRO - URL não configurada",
        key: supabaseKey ? "OK" : "ERRO - Key não configurada",
      },
      tests: [],
    }

    // Teste 1: Verificar conexão
    try {
      const { data, error } = await supabase.from("questionarios").select("count", { count: "exact", head: true })

      if (error) throw error

      results.tests.push({
        test: "Conexão com Supabase",
        status: "OK",
        details: `Tabela acessível. Total de registros: ${data || 0}`,
      })
    } catch (error: any) {
      results.tests.push({
        test: "Conexão com Supabase",
        status: "ERRO",
        details: error.message,
      })
    }

    // Teste 2: Verificar estrutura da tabela
    try {
      const { data, error } = await supabase.from("questionarios").select("*").limit(1)

      if (error) throw error

      results.tests.push({
        test: "Estrutura da tabela",
        status: "OK",
        details: "Tabela questionarios acessível",
      })
    } catch (error: any) {
      results.tests.push({
        test: "Estrutura da tabela",
        status: "ERRO",
        details: error.message,
      })
    }

    // Teste 3: Testar inserção
    try {
      const testData = {
        nome_completo: "Teste API Final",
        email_cadastro: `teste.final.${Date.now()}@exemplo.com`,
        whatsapp: "11999999999",
        idade_faixa: "45-50 anos",
        pontuacao_total: 85,
        qualificacao_lead: "ALTA",
        tipo_questionario: "TESTE",
        categoria_sintomas: "MODERADOS",
        urgencia_caso: "ALTA",
        principal_sintoma: "Ondas de calor",
        fase_menopausa: "Perimenopausa",
      }

      const { data, error } = await supabase.from("questionarios").insert(testData).select()

      if (error) throw error

      results.tests.push({
        test: "Inserção de dados",
        status: "OK",
        details: `Registro inserido com ID: ${data[0]?.id}`,
      })
    } catch (error: any) {
      results.tests.push({
        test: "Inserção de dados",
        status: "ERRO",
        details: error.message,
      })
    }

    // Teste 4: Verificar views do dashboard
    try {
      const { data: metrics, error: metricsError } = await supabase.from("dashboard_metrics").select("*").single()

      if (metricsError) throw metricsError

      results.tests.push({
        test: "View dashboard_metrics",
        status: "OK",
        details: `Total leads: ${metrics.total_leads}, Leads quentes: ${metrics.leads_quentes}`,
      })
    } catch (error: any) {
      results.tests.push({
        test: "View dashboard_metrics",
        status: "ERRO",
        details: error.message,
      })
    }

    // Teste 5: Verificar view dashboard_questionarios
    try {
      const { data, error } = await supabase.from("dashboard_questionarios").select("*").limit(5)

      if (error) throw error

      results.tests.push({
        test: "View dashboard_questionarios",
        status: "OK",
        details: `${data.length} registros encontrados`,
      })
    } catch (error: any) {
      results.tests.push({
        test: "View dashboard_questionarios",
        status: "ERRO",
        details: error.message,
      })
    }

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Erro geral no teste",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Simular dados de um questionário real
    const webhookData = {
      nome_completo: "Maria Silva Teste",
      email_cadastro: `maria.teste.${Date.now()}@exemplo.com`,
      whatsapp: "11987654321",
      idade_faixa: "45-50 anos",
      estado_residencia: "São Paulo",
      estado_civil: "Casada",
      renda_mensal: "R$ 5.000 - R$ 10.000",
      fase_menopausa: "Perimenopausa",
      principal_sintoma: "Ondas de calor intensas",
      intensidade_sintoma_principal: "Muito intensa",
      outros_sintomas_incomodam: "Insônia, irritabilidade",
      tempo_sintomas: "Mais de 1 ano",
      impacto_sintomas_vida: "Impacto significativo",
      impacto_sintomas_relacionamento: "Afeta relacionamento",
      urgencia_resolver: "Muito urgente",
      fez_reposicao_hormonal: "Não, mas tenho interesse",
      motivo_inscricao_evento: "Buscar soluções naturais",
      valor_disposto_pagar: "R$ 500 - R$ 1.000",
      compra_online_experiencia: "Sim, compro frequentemente",
      ja_conhecia: "Não",
      pontuacao_total: 92,
      qualificacao_lead: "ALTA",
      categoria_sintomas: "SEVEROS",
      urgencia_caso: "ALTA",
      tipo_questionario: "PAGO",
      origem: "webhook-test",
      dispositivo: "desktop",
    }

    const { data, error } = await supabase.from("questionarios").insert(webhookData).select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Webhook simulado com sucesso",
      data: data[0],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao simular webhook",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
