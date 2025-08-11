import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🎯 Webhook recebeu uma requisição")
    console.log("🕐 Timestamp:", new Date().toISOString())

    // Obter os dados do corpo da requisição
    const dados = await request.json()

    console.log("📦 Dados brutos recebidos:", JSON.stringify(dados, null, 2))

    // Verificar qual formato de dados foi recebido
    // Pode ser o formato antigo (dados.dadosContato) ou o novo (dados.lead_data)
    const leadData = dados.lead_data || dados
    const dadosContato = leadData.dadosContato || leadData

    console.log("🔍 Lead data extraído:", JSON.stringify(leadData, null, 2))
    console.log("🔍 Dados contato extraído:", JSON.stringify(dadosContato, null, 2))

    // Verificar se temos os dados necessários
    if (!dadosContato || (!dadosContato.nome && !leadData.nome)) {
      console.error("❌ Dados de contato inválidos:", dadosContato)
      return NextResponse.json(
        {
          success: false,
          message: "Dados de contato inválidos ou ausentes",
          error: "missing_contact_data",
          received_data: dados,
        },
        { status: 400 },
      )
    }

    // Extrair dados com fallbacks para diferentes estruturas
    const nome = dadosContato.nome || leadData.nome
    const email = dadosContato.email || leadData.email
    const telefone = dadosContato.telefone || leadData.telefone
    const idade = dadosContato.idade || leadData.idade

    console.log("✅ Dados extraídos com sucesso:", { nome, email, telefone, idade })

    // Extrair análise e respostas com fallbacks
    const analise = leadData.analise || dados.analise || {}
    const respostas = leadData.respostas || dados.respostas || leadData.respostas_detalhadas || {}
    const qualificacaoLead = leadData.qualificacaoLead || dados.qualificacaoLead || {}

    // Verificar se temos as novas opções da pergunta 12
    const valorDispostoPagar = leadData.valor_disposto_pagar || dados.valor_disposto_pagar
    console.log("💰 Valor disposto a pagar:", valorDispostoPagar)

    // Validar se é uma das novas opções
    const novasOpcoes = [
      "Sim, mais de R$3.000,00",
      "Sim, entre R$2.000,00 e R$3.000,00",
      "Sim, entre R$1.000,00 e R$2.000,00",
      "Não, no momento não posso investir",
    ]

    if (valorDispostoPagar && !novasOpcoes.includes(valorDispostoPagar)) {
      console.log("⚠️ Valor disposto não está nas novas opções:", valorDispostoPagar)
    } else {
      console.log("✅ Valor disposto validado:", valorDispostoPagar)
    }

    // Registrar os dados em um log estruturado
    const logData = {
      timestamp: new Date().toISOString(),
      dados_processados: {
        nome,
        email,
        telefone,
        idade,
        categoria: analise?.categoria || leadData.categoria_sintomas || "N/A",
        qualificacao: qualificacaoLead?.categoria || leadData.categoria_lead || leadData.qualificacao_lead || "N/A",
        valor_disposto_pagar: valorDispostoPagar || "N/A",
        tipo_questionario: leadData.tipo_questionario || "N/A",
        origem: leadData.origem || "N/A",
      },
      metadados: {
        user_agent: request.headers.get("user-agent"),
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        content_length: request.headers.get("content-length"),
      },
    }

    console.log("📊 Log estruturado:", JSON.stringify(logData, null, 2))

    // URL do webhook do Make
    const webhookUrl = "https://hook.us1.make.com/ibvli2ncgm8ii128jc5cknc6k8eixb3k"

    try {
      // Preparar dados para o Make
      const makeData = {
        tipo_evento: "QUESTIONARIO_RESPONDIDO",
        dados_contato: {
          nome,
          email,
          telefone,
          idade,
        },
        analise: {
          categoria: analise?.categoria || leadData.categoria_sintomas,
          pontuacao_total: analise?.pontuacaoTotal || leadData.pontuacao_total,
          sintomas: analise?.sintomas
            ? analise.sintomas.map((s: any) => s.nome).join(", ")
            : leadData.sintomas_identificados
              ? leadData.sintomas_identificados.map((s: any) => s.nome).join(", ")
              : "",
        },
        qualificacao: {
          categoria: qualificacaoLead?.categoria || leadData.categoria_lead || leadData.qualificacao_lead,
          prioridade: qualificacaoLead?.prioridade || leadData.prioridade,
          valor_disposto_pagar: valorDispostoPagar,
        },
        respostas: respostas,
        metadados: {
          timestamp: dados.timestamp || new Date().toISOString(),
          origem: leadData.origem || "questionario-menopausa",
          tipo_questionario: leadData.tipo_questionario || "ORGANICO",
          versao_questionario: leadData.versao_questionario || "3.4",
          user_agent: request.headers.get("user-agent"),
          ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        },
      }

      console.log("📤 Enviando dados para Make:", JSON.stringify(makeData, null, 2))

      // Enviar dados para o Make com retry logic
      let makeResponse
      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts) {
        try {
          makeResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(makeData),
          })

          if (makeResponse.ok) {
            console.log("✅ Dados enviados com sucesso para Make")
            break
          } else {
            throw new Error(`HTTP ${makeResponse.status}: ${await makeResponse.text()}`)
          }
        } catch (error) {
          attempts++
          console.error(`❌ Tentativa ${attempts} falhou:`, error)

          if (attempts >= maxAttempts) {
            console.error("❌ Todas as tentativas de envio para Make falharam")
            // Ainda retornamos sucesso para o cliente, mas logamos o erro
          } else {
            // Aguardar antes da próxima tentativa
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
          }
        }
      }
    } catch (error) {
      console.error("❌ Erro na integração com Make:", error)
      // Ainda retornamos sucesso para o cliente, mas logamos o erro
    }

    // Simular processamento bem-sucedido
    console.log("🎉 Webhook processado com sucesso!")

    // Retornar uma resposta de sucesso
    return NextResponse.json({
      success: true,
      message: "Dados recebidos e processados com sucesso",
      timestamp: new Date().toISOString(),
      processed_data: {
        nome,
        email,
        telefone,
        idade,
        categoria: analise?.categoria,
        qualificacao: qualificacaoLead?.categoria || leadData.qualificacao_lead,
        valor_disposto_pagar: valorDispostoPagar,
        tipo_questionario: leadData.tipo_questionario,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error)

    // Log detalhado do erro
    console.error("❌ Stack trace:", (error as Error).stack)
    console.error("❌ Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      timestamp: new Date().toISOString(),
    })

    // Retornar uma resposta de erro
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar os dados",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        error_type: (error as Error).name,
      },
      { status: 500 },
    )
  }
}
