import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: agendamentos, error } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data_agendamento", { ascending: true })

    if (error) {
      console.error("Erro ao buscar agendamentos:", error)
      return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 })
    }

    return NextResponse.json({ agendamentos })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📅 Dados recebidos para agendamento:", body)

    const {
      nome_paciente,
      email_paciente,
      telefone_paciente,
      whatsapp,
      data_agendamento,
      horario_agendamento,
      observacoes,
      tipo_consulta = "CONSULTA_PUBLICA",
      status = "AGENDADO",
      origem = "agendamento_publico",
    } = body

    // Validações básicas
    if (!nome_paciente || !email_paciente || !data_agendamento || !horario_agendamento) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    // Verificar se já existe agendamento no mesmo horário
    const { data: existingAppointment } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("data_agendamento", data_agendamento)
      .eq("horario_agendamento", horario_agendamento)
      .eq("status", "AGENDADO")
      .single()

    if (existingAppointment) {
      return NextResponse.json({ error: "Já existe um agendamento para este horário" }, { status: 409 })
    }

    // Criar o agendamento
    const agendamentoData = {
      nome_paciente,
      email_paciente,
      telefone_paciente: telefone_paciente || whatsapp,
      whatsapp: whatsapp || telefone_paciente,
      data_agendamento,
      horario_agendamento,
      observacoes: observacoes || null,
      tipo_consulta,
      status,
      origem,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: agendamento, error } = await supabase.from("agendamentos").insert([agendamentoData]).select().single()

    if (error) {
      console.error("❌ Erro ao criar agendamento:", error)
      return NextResponse.json({ error: "Erro ao criar agendamento: " + error.message }, { status: 500 })
    }

    console.log("✅ Agendamento criado com sucesso:", agendamento)

    // Enviar webhook para o Make
    try {
      const webhookUrl = "https://hook.us1.make.com/ibvli2ncgm8ii128jc5cknc6k8eixb3k"

      const webhookData = {
        tipo_evento: "NOVO_AGENDAMENTO",
        agendamento: {
          id: agendamento.id,
          nome_paciente: agendamento.nome_paciente,
          email_paciente: agendamento.email_paciente,
          telefone_paciente: agendamento.telefone_paciente,
          whatsapp: agendamento.whatsapp,
          data_agendamento: agendamento.data_agendamento,
          horario_agendamento: agendamento.horario_agendamento,
          tipo_consulta: agendamento.tipo_consulta,
          status: agendamento.status,
          origem: agendamento.origem,
          observacoes: agendamento.observacoes,
        },
        timestamp: new Date().toISOString(),
        source: "sistema_agendamento",
      }

      console.log("📤 Enviando webhook para Make:", webhookData)

      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      if (webhookResponse.ok) {
        console.log("✅ Webhook enviado com sucesso para Make")
      } else {
        const errorText = await webhookResponse.text()
        console.error(`❌ Erro ao enviar webhook: ${webhookResponse.status} - ${errorText}`)
      }
    } catch (webhookError) {
      console.error("❌ Erro ao enviar webhook:", webhookError)
      // Não falha o agendamento se o webhook falhar
    }

    return NextResponse.json({
      success: true,
      message: "Agendamento criado com sucesso",
      agendamento,
    })
  } catch (error) {
    console.error("❌ Erro interno ao processar agendamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "ID do agendamento é obrigatório" }, { status: 400 })
    }

    const { data: agendamento, error } = await supabase
      .from("agendamentos")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar agendamento:", error)
      return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 })
    }

    // Enviar webhook para alteração de agendamento
    try {
      const webhookUrl = "https://hook.us1.make.com/ibvli2ncgm8ii128jc5cknc6k8eixb3k"

      const webhookData = {
        tipo_evento: "AGENDAMENTO_ATUALIZADO",
        agendamento: {
          id: agendamento.id,
          nome_paciente: agendamento.nome_paciente,
          email_paciente: agendamento.email_paciente,
          telefone_paciente: agendamento.telefone_paciente,
          whatsapp: agendamento.whatsapp,
          data_agendamento: agendamento.data_agendamento,
          horario_agendamento: agendamento.horario_agendamento,
          tipo_consulta: agendamento.tipo_consulta,
          status: agendamento.status,
          origem: agendamento.origem,
          observacoes: agendamento.observacoes,
        },
        alteracoes: updateData,
        timestamp: new Date().toISOString(),
        source: "sistema_agendamento",
      }

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      console.log("✅ Webhook de atualização enviado para Make")
    } catch (webhookError) {
      console.error("❌ Erro ao enviar webhook de atualização:", webhookError)
    }

    return NextResponse.json({
      success: true,
      message: "Agendamento atualizado com sucesso",
      agendamento,
    })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do agendamento é obrigatório" }, { status: 400 })
    }

    // Buscar dados do agendamento antes de deletar
    const { data: agendamentoParaDeletar } = await supabase.from("agendamentos").select("*").eq("id", id).single()

    const { error } = await supabase.from("agendamentos").delete().eq("id", id)

    if (error) {
      console.error("Erro ao deletar agendamento:", error)
      return NextResponse.json({ error: "Erro ao deletar agendamento" }, { status: 500 })
    }

    // Enviar webhook para cancelamento de agendamento
    if (agendamentoParaDeletar) {
      try {
        const webhookUrl = "https://hook.us1.make.com/ibvli2ncgm8ii128jc5cknc6k8eixb3k"

        const webhookData = {
          tipo_evento: "AGENDAMENTO_CANCELADO",
          agendamento: agendamentoParaDeletar,
          timestamp: new Date().toISOString(),
          source: "sistema_agendamento",
        }

        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        })

        console.log("✅ Webhook de cancelamento enviado para Make")
      } catch (webhookError) {
        console.error("❌ Erro ao enviar webhook de cancelamento:", webhookError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Agendamento deletado com sucesso",
    })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
