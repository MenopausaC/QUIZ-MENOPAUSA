import { NextResponse } from "next/server"

// Rota para testar e validar se os webhooks estão funcionando corretamente
export async function POST(request: Request) {
  try {
    console.log("🧪 Iniciando teste de validação de webhooks...")

    // Dados de teste simulando um lead real
    const dadosTeste = {
      // Dados pessoais
      nome: "Maria Silva Teste",
      telefone: "(11) 99999-9999",
      email: "maria.teste@exemplo.com",
      idade_faixa: "45 a 49",
      renda_mensal: "Ganho mais de 3 salários mínimos",
      estado_residencia: "Sudeste",
      estado_civil: "Sim",

      // Dados do questionário
      fase_menopausa: "Menopausa - Sem menstruação",
      principal_sintoma: "Calorões",
      intensidade_sintoma_principal: "Grave",
      outros_sintomas_incomodam: "Ansiedade ou Depressão",
      tempo_sintomas: "Á mais de 1 ano",
      impacto_sintomas_vida: "Extremamente - compromete muito minha qualidade de vida",
      urgencia_resolver: "É prioridade máxima",
      fez_reposicao_hormonal: "Ginecologista",
      impacto_sintomas_relacionamento: "Significativamente - afeta bastante nossa intimidade",

      // Dados de qualificação
      motivo_inscricao_evento: "Quero resolver meus sintomas",
      valor_disposto_pagar: "Sim, mais de R$3.000,00", // Nova opção
      compra_online_experiencia: "Sim, muitas vezes",
      ja_conhecia: "Sim, mais de 3 meses",

      // Dados calculados
      qualificacao_lead: "AAA",
      pontuacao_total: 45,
      categoria_sintomas: "Sintomas Graves",
      urgencia_caso: "alta",
      expectativa_melhora: "96% das mulheres melhoram muito",

      // Dados de tempo
      tempo_total_questionario_ms: 90000,
      tempo_total_questionario_segundos: 90,
      tempo_total_questionario_minutos: 1.5,
      tempo_medio_resposta_ms: 4500,
      tempo_medio_resposta_segundos: 4.5,

      // Metadados
      timestamp: new Date().toISOString(),
      data_envio: new Date().toISOString(),
      user_agent: "Mozilla/5.0 (Test Browser)",
      origem: "teste-webhook-validation",
      versao_questionario: "3.4",
      tipo_questionario: "TESTE",
      dispositivo: "desktop",

      // Tags para Active Campaign
      ac_tags: ["AAA", "TESTE", "URGENTE", "ALTA_RENDA"],

      // Dados detalhados das respostas
      respostas_detalhadas: [
        {
          pergunta_id: "valor_disposto_pagar",
          pergunta_texto: "Você estaria disposta a investir para resolver esse problema?",
          resposta_texto: "Sim, mais de R$3.000,00",
          pontos: 3,
          tempo_resposta_ms: 5000,
          ordem: 12,
        },
      ],
    }

    console.log("📦 Dados de teste preparados:", JSON.stringify(dadosTeste, null, 2))

    // Teste 1: Webhook do Make.com (Orgânico)
    console.log("\n🎯 Testando webhook Make.com (Orgânico)...")
    const makeOrganico = await testarWebhookMake("https://hook.us1.make.com/vyw4m59kgv3os7nsqvjcv710ladonf1m", {
      ...dadosTeste,
      tipo_questionario: "ORGANICO",
    })

    // Teste 2: Webhook do Make.com (Pago)
    console.log("\n🎯 Testando webhook Make.com (Pago)...")
    const makePago = await testarWebhookMake("https://hook.us1.make.com/dysdyauurc079jp9gguopskqhen6d1m4", {
      ...dadosTeste,
      tipo_questionario: "PAGO",
      fonte: "campanhas_pagas",
    })

    // Teste 3: Active Campaign (se configurado)
    console.log("\n🎯 Testando Active Campaign...")
    const activeCampaign = await testarActiveCampaign(dadosTeste)

    // Teste 4: Webhook interno da aplicação
    console.log("\n🎯 Testando webhook interno...")
    const webhookInterno = await testarWebhookInterno(dadosTeste)

    // Compilar resultados
    const resultados = {
      timestamp: new Date().toISOString(),
      testes: {
        make_organico: makeOrganico,
        make_pago: makePago,
        active_campaign: activeCampaign,
        webhook_interno: webhookInterno,
      },
      resumo: {
        total_testes: 4,
        sucessos: [makeOrganico, makePago, activeCampaign, webhookInterno].filter((r) => r.sucesso).length,
        falhas: [makeOrganico, makePago, activeCampaign, webhookInterno].filter((r) => !r.sucesso).length,
      },
      dados_teste: dadosTeste,
    }

    console.log("\n📊 Resultados finais:", JSON.stringify(resultados, null, 2))

    return NextResponse.json({
      success: true,
      message: "Teste de validação de webhooks concluído",
      resultados,
    })
  } catch (error) {
    console.error("❌ Erro no teste de validação:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro no teste de validação",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

async function testarWebhookMake(url: string, dados: any) {
  try {
    console.log(`📤 Enviando para: ${url}`)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lead_data: dados }),
    })

    const resultado = {
      sucesso: response.ok,
      status: response.status,
      url: url,
      tempo_resposta: Date.now(),
      dados_enviados: dados,
    }

    if (response.ok) {
      console.log(`✅ Make.com respondeu com sucesso (${response.status})`)
      try {
        const responseData = await response.text()
        resultado.resposta = responseData
      } catch (e) {
        resultado.resposta = "Resposta não pôde ser lida"
      }
    } else {
      console.log(`❌ Make.com falhou (${response.status})`)
      resultado.erro = await response.text()
    }

    return resultado
  } catch (error) {
    console.log(`💥 Erro ao conectar com Make.com: ${error.message}`)
    return {
      sucesso: false,
      erro: error.message,
      url: url,
    }
  }
}

async function testarActiveCampaign(dados: any) {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_ACTIVE_CAMPAIGN_WEBHOOK_URL

    if (!webhookUrl) {
      console.log("⚠️ Active Campaign não configurado (URL não encontrada)")
      return {
        sucesso: true,
        status: "não_configurado",
        mensagem: "Active Campaign webhook URL não configurada",
      }
    }

    console.log(`📤 Enviando para Active Campaign: ${webhookUrl}`)

    const acData = {
      contact: {
        email: dados.email,
        firstName: dados.nome?.split(" ")[0] || "",
        lastName: dados.nome?.split(" ").slice(1).join(" ") || "",
        phone: dados.telefone,
        fieldValues: [
          { field: "idade_faixa", value: dados.idade_faixa },
          { field: "renda_mensal", value: dados.renda_mensal },
          { field: "qualificacao", value: dados.qualificacao_lead },
          { field: "valor_disposto_pagar", value: dados.valor_disposto_pagar },
          { field: "urgencia_resolver", value: dados.urgencia_resolver },
        ],
      },
      tags: dados.ac_tags || [],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(acData),
    })

    const resultado = {
      sucesso: response.ok,
      status: response.status,
      url: webhookUrl,
      dados_enviados: acData,
    }

    if (response.ok) {
      console.log(`✅ Active Campaign respondeu com sucesso (${response.status})`)
      try {
        const responseData = await response.text()
        resultado.resposta = responseData
      } catch (e) {
        resultado.resposta = "Resposta não pôde ser lida"
      }
    } else {
      console.log(`❌ Active Campaign falhou (${response.status})`)
      resultado.erro = await response.text()
    }

    return resultado
  } catch (error) {
    console.log(`💥 Erro ao conectar com Active Campaign: ${error.message}`)
    return {
      sucesso: false,
      erro: error.message,
    }
  }
}

async function testarWebhookInterno(dados: any) {
  try {
    console.log("📤 Testando webhook interno da aplicação...")

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    })

    const resultado = {
      sucesso: response.ok,
      status: response.status,
      dados_enviados: dados,
    }

    if (response.ok) {
      console.log(`✅ Webhook interno respondeu com sucesso (${response.status})`)
      try {
        const responseData = await response.json()
        resultado.resposta = responseData
      } catch (e) {
        resultado.resposta = "Resposta não pôde ser lida"
      }
    } else {
      console.log(`❌ Webhook interno falhou (${response.status})`)
      resultado.erro = await response.text()
    }

    return resultado
  } catch (error) {
    console.log(`💥 Erro ao testar webhook interno: ${error.message}`)
    return {
      sucesso: false,
      erro: error.message,
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST para executar o teste de validação de webhooks",
    endpoints: {
      test: "POST /api/test-webhook-validation",
      example: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    },
  })
}
