import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    console.log("🔍 Testando conexão com tabela agendamentos...")

    // 1. Testar conexão básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from("agendamentos")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      console.error("❌ Erro de conexão:", connectionError)
      return NextResponse.json({
        success: false,
        error: "Erro de conexão com a tabela agendamentos",
        details: connectionError
      }, { status: 500 })
    }

    console.log("✅ Conexão estabelecida. Total de registros:", connectionTest)

    // 2. Testar inserção
    const testData = {
      nome_paciente: "Teste API",
      email_paciente: "teste.api@email.com",
      telefone_paciente: "(11) 98765-4321",
      data_agendamento: new Date().toISOString().split('T')[0],
      horario_agendamento: "14:30",
      tipo_consulta: "consulta_inicial",
      status: "agendado",
      observacoes: "Teste de inserção via API"
    }

    const { data: insertData, error: insertError } = await supabase
      .from("agendamentos")
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      console.error("❌ Erro ao inserir:", insertError)
      return NextResponse.json({
        success: false,
        error: "Erro ao inserir dados de teste",
        details: insertError
      }, { status: 500 })
    }

    console.log("✅ Inserção realizada com sucesso:", insertData)

    // 3. Testar busca
    const { data: selectData, error: selectError } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("email_paciente", "teste.api@email.com")
      .order("created_at", { ascending: false })
      .limit(5)

    if (selectError) {
      console.error("❌ Erro ao buscar:", selectError)
      return NextResponse.json({
        success: false,
        error: "Erro ao buscar dados",
        details: selectError
      }, { status: 500 })
    }

    console.log("✅ Busca realizada com sucesso:", selectData)

    // 4. Testar atualização
    const { data: updateData, error: updateError } = await supabase
      .from("agendamentos")
      .update({ 
        status: "confirmado",
        observacoes: "Teste de atualização via API - " + new Date().toISOString()
      })
      .eq("id", insertData.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Erro ao atualizar:", updateError)
      return NextResponse.json({
        success: false,
        error: "Erro ao atualizar dados",
        details: updateError
      }, { status: 500 })
    }

    console.log("✅ Atualização realizada com sucesso:", updateData)

    // 5. Estatísticas gerais
    const { data: stats, error: statsError } = await supabase
      .from("agendamentos")
      .select("status, tipo_consulta")

    let statusCount = {}
    let typeCount = {}

    if (!statsError && stats) {
      stats.forEach(item => {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1
        typeCount[item.tipo_consulta] = (typeCount[item.tipo_consulta] || 0) + 1
      })
    }

    return NextResponse.json({
      success: true,
      message: "Todos os testes passaram com sucesso!",
      tests: {
        connection: "✅ Conectado",
        insert: "✅ Inserção funcionando",
        select: "✅ Busca funcionando", 
        update: "✅ Atualização funcionando"
      },
      data: {
        totalRecords: connectionTest,
        insertedRecord: insertData,
        selectedRecords: selectData,
        updatedRecord: updateData,
        statistics: {
          byStatus: statusCount,
          byType: typeCount
        }
      }
    })

  } catch (error) {
    console.error("💥 Erro geral:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor",
      details: error
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Limpar dados de teste
    const { error: deleteError } = await supabase
      .from("agendamentos")
      .delete()
      .eq("email_paciente", "teste.api@email.com")

    if (deleteError) {
      console.error("❌ Erro ao limpar dados de teste:", deleteError)
      return NextResponse.json({
        success: false,
        error: "Erro ao limpar dados de teste",
        details: deleteError
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Dados de teste limpos com sucesso!"
    })

  } catch (error) {
    console.error("💥 Erro ao limpar:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor",
      details: error
    }, { status: 500 })
  }
}
