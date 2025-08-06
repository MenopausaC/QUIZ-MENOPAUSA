import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente servidor com service role key para operações administrativas
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Função para criar cliente servidor
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Função para testar conexão do servidor
export async function testSupabaseServerConnection() {
  try {
    console.log('🔍 Testando conexão do servidor com Supabase...')
    
    const { data, error } = await supabaseServer
      .from('agendamentos')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão do servidor:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Conexão do servidor com Supabase OK')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro ao testar conexão do servidor:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

// Função para criar agendamento (servidor)
export async function createAgendamento(data: {
  nome_paciente: string
  telefone_paciente?: string
  whatsapp: string
  email_paciente?: string
  data_agendamento: string
  horario_agendamento: string
  status?: string
  tipo_consulta?: string
  origem?: string
}) {
  try {
    console.log('💾 Criando agendamento no servidor:', data)
    
    const { data: agendamento, error } = await supabaseServer
      .from('agendamentos')
      .insert([{
        ...data,
        status: data.status || 'AGUARDANDO_PAGAMENTO',
        tipo_consulta: data.tipo_consulta || 'PAGO',
        origem: data.origem || 'api'
      }])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao criar agendamento:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Agendamento criado com sucesso:', agendamento)
    return { success: true, data: agendamento }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

// Função para buscar agendamentos (servidor)
export async function getAgendamentosServer() {
  try {
    const { data, error } = await supabaseServer
      .from('agendamentos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar agendamentos no servidor:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos no servidor:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

console.log('🖥️ Cliente Supabase do servidor configurado')
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada')
console.log('Service Key:', supabaseServiceKey ? '✅ Configurada' : '❌ Não configurada')
