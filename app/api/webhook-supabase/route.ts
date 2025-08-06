import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Verificar variáveis de ambiente na inicialização
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente do Supabase não configuradas")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!supabaseKey)
}

const supabase = createClient(supabaseUrl!, supabaseKey!)

interface WebhookData {
  nome: string
  email: string
  telefone: string
  idade: string
  pergunta1: string
  pergunta2: string
  pergunta3: string
  pergunta4: string
  pergunta5: string
  pergunta6: string
  pergunta7: string
  pergunta8: string
  pergunta9: string
  pergunta10: string
  pergunta11: string
  pergunta12: string
  pergunta13: string
  pergunta14: string
  pontuacao_total: number
  qualificacao_lead: string
  tipo_questionario: string
  data_submissao: string
  timestamp: number
}

export async function POST(request: NextRequest) {
  console.log("=== WEBHOOK SUPABASE INICIADO ===")
  const startTime = Date.now()

  try {
    // Verificar se as variáveis de ambiente estão disponíveis
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Variáveis de ambiente não configuradas")
      return NextResponse.json(
        {
          success: false,
          error: "Configuração do servidor incompleta",
          details: "Variáveis de ambiente do Supabase não encontradas",
        },
        { status: 500 },
      )
    }

    // Parse do body da requisição
    let body: WebhookData
    try {
      body = await request.json()
      console.log("📥 Dados recebidos:", JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: "Não foi possível processar os dados enviados",
        },
        { status: 400 },
      )
    }

    // Validações básicas
    const validationErrors: string[] = []

    if (!body.nome || typeof body.nome !== "string" || body.nome.trim().length === 0) {
      validationErrors.push("Nome é obrigatório")
    }

    if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) {
      validationErrors.push("Email válido é obrigatório")
    }

    if (!body.telefone || typeof body.telefone !== "string" || body.telefone.trim().length < 10) {
      validationErrors.push("Telefone válido é obrigatório")
    }

    if (!body.idade || isNaN(Number.parseInt(body.idade))) {
      validationErrors.push("Idade válida é obrigatória")
    }

    if (typeof body.pontuacao_total !== "number" || body.pontuacao_total < 0) {
      validationErrors.push("Pontuação total inválida")
    }

    if (!body.qualificacao_lead || !["BAIXA", "MEDIA", "ALTA"].includes(body.qualificacao_lead)) {
      validationErrors.push("Qualificação de lead inválida")
    }

    if (validationErrors.length > 0) {
      console.error("❌ Erros de validação:", validationErrors)
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    // Mapear dados para a estrutura da tabela Supabase
    const questionarioData = {
      nome_completo: body.nome.trim(),
      email_cadastro: body.email.trim().toLowerCase(),
      whatsapp: body.telefone.trim(),
      idade_faixa: `${body.idade} anos`,
      estado_residencia: null,
      estado_civil: null,
      renda_mensal: null,
      fase_menopausa: body.pergunta1 || null,
      principal_sintoma: body.pergunta2 || null,
      intensidade_sintoma_principal: body.pergunta3 || null,
      outros_sintomas_incomodam: body.pergunta4 || null,
      tempo_sintomas: body.pergunta5 || null,
      impacto_sintomas_vida: body.pergunta6 || null,
      impacto_sintomas_relacionamento: body.pergunta7 || null,
      urgencia_resolver: body.pergunta8 || null,
      fez_reposicao_hormonal: body.pergunta13 || null,
      motivo_inscricao_evento: body.pergunta14 || null,
      valor_disposto_pagar: null,
      compra_online_experiencia: null,
      ja_conhecia: null,
      pontuacao_total: body.pontuacao_total,
      qualificacao_lead: body.qualificacao_lead,
      categoria_sintomas:
        body.qualificacao_lead === "ALTA" ? "SEVEROS" : body.qualificacao_lead === "MEDIA" ? "MODERADOS" : "LEVES",
      urgencia_caso:
        body.qualificacao_lead === "ALTA" ? "ALTA" : body.qualificacao_lead === "MEDIA" ? "MEDIA" : "BAIXA",
      tipo_questionario: "PAGO",
      tempo_total_questionario_segundos: null,
      tempo_total_questionario_ms: body.timestamp ? Date.now() - body.timestamp : null,
      tempo_medio_resposta_ms: null,
      dispositivo: request.headers.get("user-agent")?.includes("Mobile") ? "Mobile" : "Desktop",
    }

    console.log("💾 Dados preparados para inserção:", JSON.stringify(questionarioData, null, 2))

    // Inserir no Supabase
    console.log("🔄 Inserindo dados no Supabase...")
    const { data, error } = await supabase.from("questionarios").insert([questionarioData]).select()

    if (error) {
      console.error("❌ Erro do Supabase:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao salvar no banco de dados",
          details: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          },
        },
        { status: 500 },
      )
    }

    console.log("✅ Dados inseridos com sucesso:", data)

    // Tentar enviar para Make se configurado
    const makeWebhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL
    if (makeWebhookUrl) {
      try {
        console.log("📤 Enviando para Make webhook...")
        const makeResponse = await fetch(makeWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lead_data: body,
            supabase_data: data,
            timestamp: new Date().toISOString(),
          }),
        })

        if (makeResponse.ok) {
          console.log("✅ Dados enviados para Make com sucesso")
        } else {
          console.log("⚠️ Falha ao enviar para Make (status:", makeResponse.status, "), mas dados salvos no Supabase")
        }
      } catch (makeError) {
        console.log("⚠️ Erro ao enviar para Make:", makeError)
      }
    }

    const processingTime = Date.now() - startTime
    console.log(`✅ Webhook processado com sucesso em ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      message: "Questionário salvo com sucesso",
      data: data,
      processing_time_ms: processingTime,
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("❌ Erro geral no webhook:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "N/A")

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: {
          message: error instanceof Error ? error.message : "Erro desconhecido",
          processing_time_ms: processingTime,
        },
      },
      { status: 500 },
    )
  }
}

// Método GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "Webhook Supabase está funcionando",
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasMakeWebhook: !!process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL,
    },
  })
}
