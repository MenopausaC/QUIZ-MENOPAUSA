import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
        },
      })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test connection with a simple query
    const { data, error } = await supabase.from("leads_menopausa").select("count", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint,
        },
      })
    }

    return NextResponse.json({
      success: true,
      details: {
        connection: "OK",
        totalRecords: data,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}
