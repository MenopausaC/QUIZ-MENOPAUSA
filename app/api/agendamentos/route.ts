import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🚀 API /api/agendamentos - POST iniciado')
  
  try {
    const body = await request.json()
    console.log('📥 Dados recebidos:', body)

    // Validar dados obrigatórios
    const { nome, whatsapp, data, horario } = body
    
    if (!nome || !whatsapp || !data || !horario) {
      console.log('❌ Dados obrigatórios faltando')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados obrigatórios: nome, whatsapp, data, horario' 
        },
        { status: 400 }
      )
    }

    // Preparar dados para o webhook
    const agendamentoData = {
      id: `agendamento_${Date.now()}`,
      timestamp: new Date().toISOString(),
      nome_paciente: nome,
      nome_completo: nome,
      whatsapp: whatsapp,
      telefone_paciente: whatsapp,
      data_agendamento: data,
      horario_agendamento: horario,
      data_formatada: new Date(data).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      status_compra: "AGUARDANDO_COMPRA",
      tipo_consulta: body.tipo_consulta || "CONSULTA_PAGA",
      valor_consulta: body.valor_consulta || 150.00,
      status: body.status || "AGENDADO",
      origem: body.origem || "site_agendamento",
      email_paciente: body.email || null,
      observacoes: body.observacoes || null
    }

    console.log('📤 Dados preparados para webhook:', agendamentoData)

    // Enviar para o webhook do Make
    const webhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL
    if (!webhookUrl) {
      console.log('❌ URL do webhook não configurada')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Webhook não configurado' 
        },
        { status: 500 }
      )
    }

    console.log('🔗 Enviando para webhook:', webhookUrl)

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agendamentoData),
    })

    console.log('📡 Resposta do webhook:', webhookResponse.status)

    if (!webhookResponse.ok) {
      console.log('❌ Erro no webhook:', webhookResponse.statusText)
      return NextResponse.json(
        { 
          success: false, 
          error: `Erro no webhook: ${webhookResponse.status}` 
        },
        { status: 500 }
      )
    }

    console.log('✅ Agendamento enviado com sucesso para o webhook')

    return NextResponse.json({
      success: true,
      message: 'Agendamento criado com sucesso',
      agendamento: {
        id: agendamentoData.id,
        nome: nome,
        whatsapp: whatsapp,
        data: data,
        horario: horario,
        status: 'AGENDADO'
      }
    })

  } catch (error) {
    console.error('❌ Erro na API de agendamentos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  console.log('🔍 API /api/agendamentos - GET iniciado')
  
  try {
    // Por enquanto, retornar array vazio já que os dados estão no Supabase via webhook
    // Em uma implementação futura, podemos buscar do Supabase aqui
    
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Agendamentos carregados (implementação via webhook)'
    })

  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar agendamentos' 
      },
      { status: 500 }
    )
  }
}
