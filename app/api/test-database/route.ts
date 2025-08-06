import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Environment variables not configured",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
        },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test 1: Check if tables exist and are accessible
    const tableTests = {}
    const tablesToTest = ["questionarios", "leads_menopausa", "sintomas_identificados", "respostas_questionario"]

    for (const tableName of tablesToTest) {
      try {
        const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

        tableTests[tableName] = {
          accessible: !error,
          count: count || 0,
          error: error?.message,
        }
      } catch (err) {
        tableTests[tableName] = {
          accessible: false,
          count: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        }
      }
    }

    // Test 2: Try to fetch sample data from questionarios
    const { data: sampleQuestionarios, error: sampleError } = await supabase
      .from("questionarios")
      .select("id, nome_completo, email_cadastro, origem, qualificacao_lead, pontuacao_total, created_at")
      .order("created_at", { ascending: false })
      .limit(3)

    // Test 3: Test dashboard view
    const { data: dashboardData, error: dashboardError } = await supabase.from("dashboard_leads").select("*").limit(5)

    // Test 4: Test metrics view
    const { data: metricsData, error: metricsError } = await supabase.from("metricas_dashboard").select("*").single()

    // Test 5: Check if we can insert a test record
    const testRecord = {
      nome_completo: "Teste Conexão",
      email_cadastro: "teste.conexao@example.com",
      whatsapp: "11999999999",
      qualificacao_lead: "TESTE",
      pontuacao_total: 0,
      origem: "teste",
      tipo_questionario: "teste",
    }

    const { data: insertData, error: insertError } = await supabase.from("questionarios").insert(testRecord).select()

    // Clean up test record if it was inserted
    if (insertData && insertData.length > 0) {
      await supabase.from("questionarios").delete().eq("id", insertData[0].id)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        tableAccess: tableTests,
        dataRetrieval: {
          questionarios: {
            success: !sampleError,
            count: sampleQuestionarios?.length || 0,
            error: sampleError?.message,
            sampleData: sampleQuestionarios,
          },
          dashboard_view: {
            success: !dashboardError,
            count: dashboardData?.length || 0,
            error: dashboardError?.message,
          },
          metrics_view: {
            success: !metricsError,
            data: metricsData,
            error: metricsError?.message,
          },
        },
        writePermissions: {
          canInsert: !insertError,
          error: insertError?.message,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Unexpected error during database test",
      details: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}
