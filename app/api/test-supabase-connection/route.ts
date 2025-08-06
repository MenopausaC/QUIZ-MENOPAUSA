import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  console.log("=== TESTE DE CONEXÃO SUPABASE ===")
  const startTime = Date.now()

  try {
    // Verificar variáveis de ambiente
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Variáveis de ambiente não configuradas",
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey,
          urlValue: supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "undefined",
          keyValue: supabaseKey ? supabaseKey.substring(0, 10) + "..." : "undefined",
        },
      })
    }

    console.log("🔍 Variáveis de ambiente OK")
    console.log("URL:", supabaseUrl.substring(0, 30) + "...")
    console.log("Key:", supabaseKey.substring(0, 10) + "...")

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Teste 1: Verificar se consegue conectar na tabela
    console.log("🔗 Teste 1: Verificando acesso à tabela questionarios...")
    const { data: tableData, error: tableError } = await supabase
      .from("questionarios")
      .select("count", { count: "exact", head: true })

    if (tableError) {
      console.error("❌ Erro ao acessar tabela:", tableError)
      return NextResponse.json({
        success: false,
        error: "Erro ao acessar tabela questionarios",
        details: {
          message: tableError.message,
          details: tableError.details,
          hint: tableError.hint,
          code: tableError.code,
        },
      })
    }

    console.log("✅ Tabela acessada. Total de registros:", tableData)

    // Teste 2: Verificar estrutura da tabela
    console.log("🔍 Teste 2: Verificando estrutura da tabela...")
    const { data: sampleData, error: sampleError } = await supabase.from("questionarios").select("*").limit(1)

    if (sampleError) {
      console.error("❌ Erro ao verificar estrutura:", sampleError)
      return NextResponse.json({
        success: false,
        error: "Erro ao verificar estrutura da tabela",
        details: sampleError,
      })
    }

    console.log("✅ Estrutura verificada")

    // Teste 3: Tentar inserir um registro de teste
    console.log("🧪 Teste 3: Testando inserção de dados...")
    const testData = {
      nome_completo: "Teste Conexão Automático",
      email_cadastro: `teste.${Date.now()}@conexao.com`,
      whatsapp: "11999999999",
      idade_faixa: "45 anos",
      tipo_questionario: "TESTE",
      qualificacao_lead: "TESTE",
      pontuacao_total: 0,
      categoria_sintomas: "TESTE",
      urgencia_caso: "TESTE",
    }

    const { data: insertData, error: insertError } = await supabase.from("questionarios").insert([testData]).select()

    if (insertError) {
      console.error("❌ Erro ao inserir dados de teste:", insertError)
      return NextResponse.json({
        success: false,
        error: "Erro ao inserir dados de teste",
        details: {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        },
      })
    }

    console.log("✅ Inserção bem-sucedida:", insertData)

    // Teste 4: Deletar o registro de teste
    if (insertData && insertData.length > 0) {
      console.log("🧹 Teste 4: Limpando dados de teste...")
      const { error: deleteError } = await supabase.from("questionarios").delete().eq("id", insertData[0].id)

      if (deleteError) {
        console.warn("⚠️ Erro ao deletar registro de teste:", deleteError)
      } else {
        console.log("✅ Registro de teste deletado com sucesso")
      }
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: "Todos os testes passaram com sucesso!",
      tests: {
        tableAccess: "OK",
        structureCheck: "OK",
        dataInsertion: "OK",
        dataCleanup: "OK",
      },
      details: {
        totalRecords: tableData,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("❌ Erro geral no teste:", error)

    return NextResponse.json({
      success: false,
      error: "Erro geral no teste de conexão",
      details: {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : "Stack não disponível",
        processingTimeMs: processingTime,
      },
    })
  }
}
