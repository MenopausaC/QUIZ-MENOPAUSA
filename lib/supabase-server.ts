import { createClient } from "@supabase/supabase-js"

// Crie um cliente Supabase para uso no servidor (API Routes, Server Components)
// Usamos NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
// pois são as variáveis de ambiente que já estão disponíveis e configuradas para o projeto.
// Para operações de leitura, a chave anon é suficiente se o RLS estiver configurado corretamente.
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
