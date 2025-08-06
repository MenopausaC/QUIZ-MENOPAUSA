import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  console.log('🚀 API /api/save-questionario - POST iniciado')
  
  try {
    const startTime = Date.now()
    const body = await request.json()
    console.log('📥 Dados recebidos:', JSON.stringify(body, null, 2))

    // Validar dados obrigatórios
    const { nome_completo, email_paciente, whatsapp, respostas, pontuacao_total } = body
    
    if (!nome_completo || !email_paciente || !whatsapp || !respostas || pontuacao_total === undefined) {
      console.log('❌ Dados obrigatórios faltando')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados obrigatórios: nome_completo, email_paciente, whatsapp, respostas, pontuacao_total' 
        },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    console.log('🔗 Conectando ao Supabase...')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Testar conexão
    const { data: testData, error: testError } = await supabase
      .from('agendamentos')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Erro de conexão com Supabase:', testError)
      throw new Error(`Erro de conexão: ${testError.message}`)
    }

    console.log('✅ Conexão com Supabase estabelecida')

    // Preparar dados para inserção
    const insertData = {
      // Dados pessoais
      nome_paciente: nome_completo,
      nome_completo: nome_completo,
      email_paciente: email_paciente,
      whatsapp: whatsapp,
      telefone_paciente: whatsapp,
      
      // Dados do questionário
      tipo_questionario: body.tipo_questionario || 'MENOPAUSA_DIAGNOSTICO',
      respostas_questionario: respostas,
      pontuacao_total: pontuacao_total,
      categoria_risco: body.categoria_risco || 'NAO_CALCULADO',
      
      // Status e origem
      status: 'QUESTIONARIO_COMPLETO',
      origem: body.origem || 'site_diagnostico',
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Metadados
      user_agent: body.user_agent || '',
      ip_address: body.ip_address || 'unknown'
    }

    console.log('💾 Inserindo dados no Supabase:', insertData)

    // Inserir no Supabase
    const { data: insertResult, error: insertError } = await supabase
      .from('agendamentos')
      .insert([insertData])
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir no Supabase:', insertError)
      throw new Error(`Erro ao salvar: ${insertError.message}`)
    }

    console.log('✅ Dados inseridos no Supabase:', insertResult)

    // Enviar para webhook do Make
    console.log('🔗 Enviando para webhook do Make...')
    const webhookUrl = 'https://hook.us1.make.com/ibvli2ncgm8ii128jc5cknc6k8eixb3k'
    
    const webhookData = {
      ...body,
      supabase_id: insertResult[0]?.id,
      database_saved: true,
      processing_time: Date.now() - startTime
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    })

    console.log('📡 Resposta do webhook:', webhookResponse.status)

    if (!webhookResponse.ok) {
      console.log('⚠️ Webhook falhou, mas dados foram salvos no Supabase')
    } else {
      console.log('✅ Webhook enviado com sucesso')
    }

    const totalTime = Date.now() - startTime
    console.log(`⏱️ Processamento completo em ${totalTime}ms`)

    return NextResponse.json({
      success: true,
      message: 'Questionário salvo com sucesso',
      data: {
        id: insertResult[0]?.id,
        supabase_saved: true,
        webhook_sent: webhookResponse.ok,
        processing_time: totalTime
      }
    })

  } catch (error) {
    console.error('❌ Erro na API de questionário:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  console.log('🔍 API /api/save-questionario - GET iniciado')
  
  return NextResponse.json({
    success: true,
    message: 'API de questionário ativa',
    endpoints: {
      POST: 'Salvar questionário completo',
      GET: 'Informações sobre a API'
    },
    webhook_url: 'https://hook.us1.make.com/ibvli2ncgm8ii128jc5cknc6k8eixb3k',
    timestamp: new Date().toISOString()
  })
}
