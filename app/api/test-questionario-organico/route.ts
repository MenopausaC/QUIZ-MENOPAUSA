import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  console.log("=== TESTANDO CONEXÃO COM SUPABASE ===")

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Testar conexão básica
    const { data: testConnection, error: connectionError } = await supabase
      .from("questionarios")
      .select("count")
      .limit(1)

    if (connectionError) {
      console.error("❌ Erro de conexão:", connectionError)
      return NextResponse.json({
        success: false,
        error: "Erro de conexão com Supabase",
        details: connectionError,
      })
    }

    // Testar inserção de dados de teste
    const dadosTeste = {
      nome_completo: "Teste API " + new Date().toISOString(),
      email_cadastro: "teste.api@email.com",
      whatsapp: "(11) 99999-9999",
      idade_faixa: "45 a 49",
      estado_residencia: "Sudeste",
      estado_civil: "Sim",
      renda_mensal: "Ganho de 2 a 3 salários mínimos",
      fase_menopausa: "Menopausa - Sem menstruação",
      principal_sintoma: "Calorões",
      intensidade_sintoma_principal: "Grave",
      outros_sintomas_incomodam: "Ansiedade ou Depressão",
      tempo_sintomas: "Á mais de 1 ano",
      impacto_sintomas_vida: "Extremamente - compromete muito minha qualidade de vida",
      urgencia_resolver: "É prioridade máxima",
      fez_reposicao_hormonal: "Ginecologista",
      motivo_inscricao_evento: "Quero resolver meus sintomas",
      valor_disposto_pagar: "Estou disposta a investir qualquer valor para ter minha saúde de volta",
      compra_online_experiencia: "Sim, poucas vezes",
      ja_conhecia: "Não conhecia",
      qualificacao_lead: "AAA",
      pontuacao_total: 25,
      categoria_sintomas: "Sintomas de alta urgência identificados",
      urgencia_caso: "alta",
      tipo_questionario: "ORGANICO",
      dispositivo: "desktop",
      origem: "teste-api",
      versao_questionario: "3.4",
      tempo_total_questionario_ms: 120000,
      tempo_total_questionario_segundos: 120,
      tempo_total_questionario_minutos: 2,
      tempo_medio_resposta_ms: 5000,
      tempo_medio_resposta_segundos: 5,
      total_perguntas: 19,
      perguntas_respondidas: 19,
      taxa_completude: 100,
      engajamento: "ALTO",
    }

    const { data: insertedData, error: insertError } = await supabase
      .from("questionarios")
      .insert([dadosTeste])
      .select()

    if (insertError) {
      console.error("❌ Erro ao inserir dados de teste:", insertError)
      return NextResponse.json({
        success: false,
        error: "Erro ao inserir dados de teste",
        details: insertError,
      })
    }

    console.log("✅ Dados de teste inseridos:", insertedData)

    // Testar leitura dos dados
    const { data: readData, error: readError } = await supabase
      .from("questionarios")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    if (readError) {
      console.error("❌ Erro ao ler dados:", readError)
      return NextResponse.json({
        success: false,
        error: "Erro ao ler dados",
        details: readError,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Teste completo realizado com sucesso!",
      data: {
        connectionTest: "✅ Conexão OK",
        insertTest: "✅ Inserção OK",
        readTest: "✅ Leitura OK",
        insertedRecord: insertedData[0],
        recentRecords: readData,
        totalRecords: readData.length,
      },
    })
  } catch (error) {
    console.error("❌ Erro geral no teste:", error)
    return NextResponse.json({
      success: false,
      error: "Erro geral no teste",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}

export async function POST() {
  return NextResponse.json({
    message: "Use GET para testar a conexão",
    endpoint: "/api/test-questionario-organico",
  })
}
