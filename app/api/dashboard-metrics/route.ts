import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: false, error: "Missing Supabase environment variables" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get metrics from the view
    const { data: metrics, error } = await supabase.from("metricas_dashboard").select("*").single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: `Database error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      totalLeads: metrics?.total_leads || 0,
      leadsQuentes: metrics?.leads_quentes || 0,
      leadsHoje: metrics?.leads_hoje || 0,
      leadsSemana: metrics?.leads_semana || 0,
      pontuacaoMedia: Math.round(metrics?.pontuacao_media || 0),
      leadsOrganicos: metrics?.leads_organicos || 0,
      leadsPagos: metrics?.leads_pagos || 0,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
