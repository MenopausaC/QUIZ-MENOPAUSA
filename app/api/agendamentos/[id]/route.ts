import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const id = params.id

    if (!status) {
      return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 })
    }

    // Atualizar o agendamento no Supabase
    const { data, error } = await supabase.from("agendamentos").update({ status }).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar agendamento:", error)
      return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    })
  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
