import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Iniciando verificação de sincronização...")

    // 1. Verificar conexão básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from("questionarios")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      throw new Error(`Erro de conexão: ${connectionError.message}`)
    }

    // 2. Contar registros por tipo
    const { data: organicoCount, error: organicoError } = await supabase
      .from("questionarios")
      .select("*", { count: "exact", head: true })
      .eq("tipo_questionario", "ORGANICO")

    const { data: pagoCount, error: pagoError } = await supabase
      .from("questionarios")
      .select("*", { count: "exact", head: true })
      .eq("tipo_questionario", "PAGO")

    // 3. Verificar integridade dos dados
    const { data: recentRecords, error: recentError } = await supabase
      .from("questionarios")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (recentError) {
      throw new Error(`Erro ao buscar registros recentes: ${recentError.message}`)
    }

    // 4. Verificar campos obrigatórios
    const integrityIssues =
      recentRecords?.filter(
        (record) => !record.nome_completo || !record.email_cadastro || !record.whatsapp || !record.tipo_questionario,
      ) || []

    // 5. Calcular score de saúde
    const totalRecords = (connectionTest as any)?.count || 0
    const organicoTotal = (organicoCount as any)?.count || 0
    const pagoTotal = (pagoCount as any)?.count || 0
    const integrityScore = integrityIssues.length === 0 ? 100 : Math.max(0, 100 - integrityIssues.length * 10)

    let healthScore = 0
    if (totalRecords > 0) healthScore += 40
    if (organicoTotal > 0) healthScore += 20
    if (pagoTotal > 0) healthScore += 20
    if (integrityScore > 90) healthScore += 20

    // 6. Teste de inserção (opcional)
    const testRecord = {
      nome_completo: "Teste Sync",
      email_cadastro: "teste@sync.com",
      whatsapp: "11999999999",
      tipo_questionario: "TESTE",
      qualificacao_lead: "TESTE",
      pontuacao_total: 0,
      created_at: new Date().toISOString(),
    }

    const { data: insertTest, error: insertError } = await supabase.from("questionarios").insert([testRecord]).select()

    let insertSuccess = false
    if (!insertError && insertTest && insertTest.length > 0) {
      insertSuccess = true
      // Limpar registro de teste
      await supabase.from("questionarios").delete().eq("id", insertTest[0].id)
    }

    const syncReport = {
      success: true,
      timestamp: new Date().toISOString(),
      connection: {
        status: "OK",
        total_records: totalRecords,
      },
      distribution: {
        organico: organicoTotal,
        pago: pagoTotal,
        outros: totalRecords - organicoTotal - pagoTotal,
      },
      integrity: {
        score: integrityScore,
        issues: integrityIssues.length,
        recent_records: recentRecords?.length || 0,
      },
      tests: {
        insert_test: insertSuccess,
        connection_test: !connectionError,
        data_retrieval: !recentError,
      },
      health_score: healthScore,
      recommendations: [],
    }

    // Adicionar recomendações
    if (totalRecords === 0) {
      syncReport.recommendations.push("Nenhum registro encontrado. Teste os questionários.")
    }
    if (integrityIssues.length > 0) {
      syncReport.recommendations.push(`${integrityIssues.length} registros com dados incompletos.`)
    }
    if (!insertSuccess) {
      syncReport.recommendations.push("Falha no teste de inserção. Verificar permissões.")
    }

    console.log("✅ Verificação de sincronização concluída:", syncReport)

    return NextResponse.json(syncReport)
  } catch (error) {
    console.error("❌ Erro na verificação de sincronização:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
        health_score: 0,
      },
      { status: 500 },
    )
  }
}
