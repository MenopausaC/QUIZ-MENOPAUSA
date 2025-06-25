export interface RespostaQuestionario {
  id: string
  timestamp: Date
  [key: string]: any // Para outras respostas específicas
}

export interface QuestionarioMenopausaResposta extends RespostaQuestionario {
  fase_menopausa: "Menopausa - Sem menstruação" | "Climatério - Menstruando as vezes" | "Não sei / Tenho dúvidas"
  principal_sintoma:
    | "Calorões"
    | "Falta de Libido/Ressecamento"
    | "Dores articulares"
    | "Insônia"
    | "Dificuldade para Emagrecer"
    | "Outros"
  intensidade_sintoma_principal: "Grave" | "Moderada" | "Leve"
  urgencia_resolver: "É prioridade máxima" | "Quero resolver em breve" | "Posso esperar mais um pouco"
  idade_faixa: "70+" | "65 a 69" | "60 a 64" | "55 a 59" | "50 a 54" | "45 a 49" | "35 a 44" | "Menos de 35"
}

export interface NovoQuestionarioResposta extends RespostaQuestionario {
  satisfacao_produto: "Muito Satisfeito" | "Satisfeito" | "Neutro" | "Insatisfeito" | "Muito Insatisfeito"
  recomendaria_servico: "Sim" | "Não" | "Talvez"
  frequencia_uso: "Diariamente" | "Semanalmente" | "Mensalmente" | "Raramente"
}

export const mockMenopausaData: QuestionarioMenopausaResposta[] = [
  {
    id: "m1",
    fase_menopausa: "Menopausa - Sem menstruação",
    principal_sintoma: "Calorões",
    intensidade_sintoma_principal: "Grave",
    urgencia_resolver: "É prioridade máxima",
    idade_faixa: "50 a 54",
    timestamp: new Date("2024-05-01T10:00:00Z"),
  },
  {
    id: "m2",
    fase_menopausa: "Climatério - Menstruando as vezes",
    principal_sintoma: "Insônia",
    intensidade_sintoma_principal: "Moderada",
    urgencia_resolver: "Quero resolver em breve",
    idade_faixa: "45 a 49",
    timestamp: new Date("2024-05-02T11:30:00Z"),
  },
  {
    id: "m3",
    fase_menopausa: "Não sei / Tenho dúvidas",
    principal_sintoma: "Falta de Libido/Ressecamento",
    intensidade_sintoma_principal: "Leve",
    urgencia_resolver: "Posso esperar mais um pouco",
    idade_faixa: "55 a 59",
    timestamp: new Date("2024-05-03T09:15:00Z"),
  },
  {
    id: "m4",
    fase_menopausa: "Menopausa - Sem menstruação",
    principal_sintoma: "Calorões",
    intensidade_sintoma_principal: "Grave",
    urgencia_resolver: "É prioridade máxima",
    idade_faixa: "50 a 54",
    timestamp: new Date("2024-05-04T14:00:00Z"),
  },
  {
    id: "m5",
    fase_menopausa: "Climatério - Menstruando as vezes",
    principal_sintoma: "Dores articulares",
    intensidade_sintoma_principal: "Moderada",
    urgencia_resolver: "Quero resolver em breve",
    idade_faixa: "60 a 64",
    timestamp: new Date("2024-05-05T16:45:00Z"),
  },
]

export const mockNovoQuestionarioData: NovoQuestionarioResposta[] = [
  {
    id: "n1",
    satisfacao_produto: "Muito Satisfeito",
    recomendaria_servico: "Sim",
    frequencia_uso: "Diariamente",
    timestamp: new Date("2024-05-10T08:00:00Z"),
  },
  {
    id: "n2",
    satisfacao_produto: "Satisfeito",
    recomendaria_servico: "Sim",
    frequencia_uso: "Semanalmente",
    timestamp: new Date("2024-05-11T12:20:00Z"),
  },
  {
    id: "n3",
    satisfacao_produto: "Neutro",
    recomendaria_servico: "Talvez",
    frequencia_uso: "Mensalmente",
    timestamp: new Date("2024-05-12T15:00:00Z"),
  },
  {
    id: "n4",
    satisfacao_produto: "Insatisfeito",
    recomendaria_servico: "Não",
    frequencia_uso: "Raramente",
    timestamp: new Date("2024-05-13T10:50:00Z"),
  },
]

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
