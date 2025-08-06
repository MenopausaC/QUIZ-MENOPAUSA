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

export async function GET(request: NextRequest) {
  try {
    console.log('📅 Buscando agendamentos existentes...')

    const { data: appointments, error } = await supabase
      .from('agendamentos')
      .select('*')
      .order('data_agendamento', { ascending: true })
      .order('horario_agendamento', { ascending: true })

    if (error) {
      console.error('❌ Erro ao buscar agendamentos:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar agendamentos',
          details: error.message 
        },
        { status: 500 }
      )
    }

    console.log(`✅ ${appointments?.length || 0} agendamentos encontrados`)

    // Transformar dados para compatibilidade com o frontend
    const formattedAppointments = appointments?.map(appointment => ({
      id: appointment.id,
      nome_paciente: appointment.nome_paciente,
      email_paciente: appointment.email_paciente,
      telefone_paciente: appointment.telefone_paciente,
      whatsapp: appointment.whatsapp || appointment.telefone_paciente,
      data_agendamento: appointment.data_agendamento,
      horario_agendamento: appointment.horario_agendamento,
      status: appointment.status,
      tipo_consulta: appointment.tipo_consulta,
      observacoes: appointment.observacoes,
      valor_consulta: appointment.valor_consulta,
      payment_status: appointment.payment_status,
      created_at: appointment.created_at
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedAppointments,
      appointments: formattedAppointments // Para compatibilidade
    })

  } catch (error) {
    console.error('❌ Erro geral ao buscar agendamentos:', error)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Criando novo agendamento:', body)

    // Validar dados obrigatórios
    if (!body.nome_paciente || !body.data_agendamento || !body.horario_agendamento) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados obrigatórios faltando',
          details: 'nome_paciente, data_agendamento e horario_agendamento são obrigatórios'
        },
        { status: 400 }
      )
    }

    // Garantir que pelo menos um contato seja fornecido
    if (!body.telefone_paciente && !body.whatsapp && !body.email_paciente) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Informação de contato obrigatória',
          details: 'Pelo menos um: telefone_paciente, whatsapp ou email_paciente deve ser fornecido'
        },
        { status: 400 }
      )
    }

    const appointmentData = {
      nome_paciente: body.nome_paciente,
      telefone_paciente: body.telefone_paciente || null,
      whatsapp: body.whatsapp || body.telefone_paciente || null,
      email_paciente: body.email_paciente || null,
      data_agendamento: body.data_agendamento,
      horario_agendamento: body.horario_agendamento,
      status: body.status || 'AGENDADO',
      tipo_consulta: body.tipo_consulta || 'CONSULTA_PAGA',
      observacoes: body.observacoes || null,
      valor_consulta: body.valor_consulta || 150.00,
      payment_status: body.payment_status || 'AGUARDANDO_PAGAMENTO',
      origem: body.origem || 'dashboard'
    }

    const { data: newAppointment, error } = await supabase
      .from('agendamentos')
      .insert([appointmentData])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar agendamento:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao criar agendamento',
          details: error.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Agendamento criado:', newAppointment)

    return NextResponse.json({
      success: true,
      appointment: newAppointment,
      data: newAppointment
    })

  } catch (error) {
    console.error('❌ Erro geral ao criar agendamento:', error)
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    console.log('📝 Atualizando agendamento:', id, updateData)

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID do agendamento é obrigatório'
        },
        { status: 400 }
      )
    }

    const { data: updatedAppointment, error } = await supabase
      .from('agendamentos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar agendamento:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao atualizar agendamento',
          details: error.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Agendamento atualizado:', updatedAppointment)

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      data: updatedAppointment
    })

  } catch (error) {
    console.error('❌ Erro geral ao atualizar agendamento:', error)
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
