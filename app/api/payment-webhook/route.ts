import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook de pagamento recebido')
    
    const body = await request.json()
    console.log('📝 Dados do webhook:', JSON.stringify(body, null, 2))

    // Verificar se é um pagamento aprovado
    if (body.status !== 'approved' && body.event_type !== 'payment.approved') {
      console.log('⚠️ Pagamento não aprovado, ignorando webhook')
      return NextResponse.json({ success: true, message: 'Webhook processado' })
    }

    // Extrair informações do pagamento
    const paymentValue = parseFloat(body.amount || body.value || '0')
    const paymentId = body.id || body.payment_id || body.transaction_id

    console.log('💰 Valor do pagamento:', paymentValue)
    console.log('🆔 ID do pagamento:', paymentId)

    // Buscar agendamento correspondente
    const { data: agendamentos, error: searchError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('valor_consulta', paymentValue)
      .eq('status', 'AGUARDANDO_PAGAMENTO')
      .order('created_at', { ascending: false })
      .limit(1)

    if (searchError) {
      console.error('❌ Erro ao buscar agendamento:', searchError)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar agendamento' },
        { status: 500 }
      )
    }

    if (!agendamentos || agendamentos.length === 0) {
      console.log('⚠️ Nenhum agendamento encontrado para este pagamento')
      return NextResponse.json(
        { success: true, message: 'Nenhum agendamento encontrado' }
      )
    }

    const agendamento = agendamentos[0]
    console.log('✅ Agendamento encontrado:', agendamento.id)

    // Atualizar status do agendamento
    const { data: updatedAgendamento, error: updateError } = await supabase
      .from('agendamentos')
      .update({
        status: 'CONFIRMADO',
        pagamento_confirmado: true,
        payment_id: paymentId,
        payment_status: 'approved',
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', agendamento.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar agendamento:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar agendamento' },
        { status: 500 }
      )
    }

    console.log('🎉 Agendamento confirmado com sucesso:', updatedAgendamento)

    return NextResponse.json({
      success: true,
      message: 'Pagamento processado com sucesso',
      agendamento: updatedAgendamento
    })

  } catch (error) {
    console.error('❌ Erro geral no webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
