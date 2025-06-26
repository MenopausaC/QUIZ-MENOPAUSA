export interface RespostaQuestionario {
  id: string
  created_at: string // Mudado para string para corresponder ao formato do Supabase
  tipo_questionario: string
  [key: string]: any // Para outras respostas específicas
}

// A interface QuestionarioMenopausaResposta agora reflete a estrutura da tabela leads_menopausa
// e pode ser usada para ambos os tipos de questionário (orgânico e pago)
export interface LeadMenopausaData extends RespostaQuestionario {
  fase_menopausa: string
  principal_sintoma: string
  intensidade_sintoma_principal: string
  urgencia_resolver: string
  idade_faixa: string
  nome: string
  email: string
  telefone: string
  // Adicione outros campos da tabela leads_menopausa conforme necessário
  // Ex:
  // pontuacao_total: number;
  // categoria_lead: string;
  // tempo_total_questionario: number;
  // ...
}

// Funções de agregação de dados
export const countOccurrences = (data: RespostaQuestionario[], key: string) => {
  return data.reduce(
    (acc, curr) => {
      const value = curr[key] as string
      acc[value] = (acc[value] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}
