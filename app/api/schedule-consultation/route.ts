import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔧 Configuração Supabase:')
console.log('URL:', supabaseUrl ? 'Configurada' : 'FALTANDO')
console.log('Service Key:', supabaseServiceKey ? 'Configurada' : 'FALTANDO')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 === INICIANDO AGENDAMENTO DE CONSULTA ===')
    
    const body = await request.json()
    console.log('📝 Dados recebidos do frontend:', JSON.stringify(body, null, 2))

    // Validar campos obrigatórios
    const requiredFields = ['nome', 'email', 'whatsapp', 'data', 'horario']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('❌ Campos obrigatórios faltando:', missingFields)
      return NextResponse.json(
        { 
          success: false, 
          error: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      )
    }

    // Preparar dados para inserção
    const agendamentoData = {
      nome_paciente: body.nome,
      email_paciente: body.email,
      whatsapp: body.whatsapp,
      telefone_paciente: body.whatsapp,
      data_agendamento: body.data,
      horario_agendamento: body.horario,
      status: 'AGUARDANDO_PAGAMENTO',
      tipo_consulta: 'PAGO',
      origem: 'site-agendamento',
      valor_consulta: 150.00,
      observacoes: body.observacoes || null,
      pagamento_confirmado: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Dados preparados para inserção no Supabase:', JSON.stringify(agendamentoData, null, 2))

    // Verificar se já existe agendamento no mesmo horário
    console.log('🔍 Verificando conflitos de horário...')
    const { data: existingAppointment, error: checkError } = await supabase
      .from('agendamentos')
      .select('id, nome_paciente')
      .eq('data_agendamento', body.data)
      .eq('horario_agendamento', body.horario)
      .neq('status', 'CANCELADO')
      .maybeSingle()

    if (checkError) {
      console.error('❌ Erro ao verificar conflito de horário:', checkError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao verificar disponibilidade do horário',
          details: checkError.message 
        },
        { status: 500 }
      )
    }

    if (existingAppointment) {
      console.log('⚠️ Horário já ocupado por:', existingAppointment.nome_paciente)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Este horário já está ocupado. Por favor, escolha outro horário.' 
        },
        { status: 409 }
      )
    }

    console.log('✅ Horário disponível, prosseguindo com inserção...')

    // Inserir agendamento
    console.log('💾 Inserindo agendamento no Supabase...')
    const { data: newAppointment, error: insertError } = await supabase
      .from('agendamentos')
      .insert([agendamentoData])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir agendamento:', insertError)
      console.error('❌ Detalhes do erro:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao salvar agendamento no banco de dados',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    console.log('🎉 Agendamento criado com sucesso!')
    console.log('📋 Dados do agendamento criado:', JSON.stringify(newAppointment, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Agendamento criado com sucesso!',
      appointment: newAppointment
    })

  } catch (error) {
    console.error('❌ ERRO GERAL NA API:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace')
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// GET para testar a API
export async function GET() {
  console.log('🧪 Testando conexão com Supabase...')
  
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.error('❌ Erro na conexão:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro na conexão com Supabase',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Conexão com Supabase OK')
    return NextResponse.json({
      success: true,
      message: 'API de agendamento funcionando',
      timestamp: new Date().toISOString(),
      supabase_connection: 'OK'
    })

  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro no teste da API',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
