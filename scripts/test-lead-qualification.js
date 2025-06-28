// Script para testar a lógica de qualificação de leads
// Execute este script para verificar se a qualificação está funcionando corretamente

function testLeadQualification() {
  console.log("🧪 Iniciando testes de qualificação de leads...\n")

  // Cenários de teste
  const testCases = [
    {
      name: "Lead AAA - Perfil Premium",
      respostas: {
        intensidade_sintoma_principal: { value: "Grave" },
        urgencia_resolver: { value: "É prioridade máxima" },
        fez_reposicao_hormonal: { value: "Ginecologista" },
        valor_disposto_pagar: { value: "Sim, mais de R$3.000,00" },
        tempo_sintomas: { value: "Á mais de 1 ano" },
        renda_mensal: { value: "Ganho mais de 3 salários mínimos" },
        ja_conhecia: { value: "Sim, mais de 3 meses" },
        compra_online_experiencia: { value: "Sim, muitas vezes" },
      },
      tempoQuestionario: 90000, // 1.5 minutos
      expectedQualification: "AAA",
    },
    {
      name: "Lead AA - Perfil Médio-Alto",
      respostas: {
        intensidade_sintoma_principal: { value: "Moderada" },
        urgencia_resolver: { value: "Quero resolver em breve" },
        fez_reposicao_hormonal: { value: "Nutricionista" },
        valor_disposto_pagar: { value: "Sim, entre R$2.000,00 e R$3.000,00" },
        tempo_sintomas: { value: "Entre 6 meses a 1 ano" },
        renda_mensal: { value: "Ganho de 2 a 3 salários mínimos" },
        ja_conhecia: { value: "Sim, de 6 meses a 1 ano" },
        compra_online_experiencia: { value: "Sim, poucas vezes" },
      },
      tempoQuestionario: 180000, // 3 minutos
      expectedQualification: "AA",
    },
    {
      name: "Lead A - Perfil Médio",
      respostas: {
        intensidade_sintoma_principal: { value: "Leve" },
        urgencia_resolver: { value: "Posso esperar mais um pouco" },
        fez_reposicao_hormonal: { value: "Nenhuma" },
        valor_disposto_pagar: { value: "Não, no momento não posso investir" },
        tempo_sintomas: { value: "Entre 3 a 6 meses" },
        renda_mensal: { value: "Ganho de 1 a 2 salários mínimos" },
        ja_conhecia: { value: "Não conhecia" },
        motivo_inscricao_evento: { value: "Fiquei curiosa e quero saber mais" },
      },
      tempoQuestionario: 300000, // 5 minutos
      expectedQualification: "A",
    },
    {
      name: "Lead B - Perfil Baixo",
      respostas: {
        fase_menopausa: { value: "Não sei / Tenho dúvidas" },
        intensidade_sintoma_principal: { value: "Leve" },
        urgencia_resolver: { value: "Posso esperar mais um pouco" },
        fez_reposicao_hormonal: { value: "Nenhuma" },
        valor_disposto_pagar: { value: "Não, no momento não posso investir" },
        renda_mensal: { value: "Ganho de 1 a 2 salários mínimos" },
        ja_conhecia: { value: "Não conhecia" },
      },
      tempoQuestionario: 420000, // 7 minutos
      expectedQualification: "B",
    },
    {
      name: "Lead C - Perfil Muito Baixo",
      respostas: {
        principal_sintoma: { value: "Nenhum desses" },
        outros_sintomas_incomodam: { value: "Nenhum desses" },
        compra_online_experiencia: { value: "Não" },
        renda_mensal: { value: "" },
      },
      tempoQuestionario: 30000, // 30 segundos
      expectedQualification: "C",
    },
  ]

  // Função de qualificação (copiada do componente)
  function calculateLeadQualification(respostas, tempoTotalQuestionario) {
    const principalSintoma = respostas.principal_sintoma?.value
    const outrosSintomasIncomodam = respostas.outros_sintomas_incomodam?.value || ""
    const intensidadeSintomaPrincipal = respostas.intensidade_sintoma_principal?.value
    const fezReposicao = respostas.fez_reposicao_hormonal?.value
    const valorDispostoPagar = respostas.valor_disposto_pagar?.value
    const tempoSintomas = respostas.tempo_sintomas?.value
    const rendaMensal = respostas.renda_mensal?.value
    const compraOnlineExperiencia = respostas.compra_online_experiencia?.value
    const faseMenopausa = respostas.fase_menopausa?.value
    const motivoInscricaoEvento = respostas.motivo_inscricao_evento?.value
    const jaConhecia = respostas.ja_conhecia?.value
    const urgenciaResolver = respostas.urgencia_resolver?.value
    const impactoSintomasRelacionamento = respostas.impacto_sintomas_relacionamento?.value

    const tempoMinutos = tempoTotalQuestionario / (1000 * 60)

    // Verificação AAA
    const isAAA =
      intensidadeSintomaPrincipal === "Grave" &&
      urgenciaResolver === "É prioridade máxima" &&
      fezReposicao &&
      fezReposicao !== "Nenhuma" &&
      valorDispostoPagar === "Sim, mais de R$3.000,00" &&
      tempoSintomas === "Á mais de 1 ano" &&
      rendaMensal === "Ganho mais de 3 salários mínimos" &&
      tempoMinutos < 2

    if (isAAA) return "AAA"

    // Verificação AA
    const isAA =
      intensidadeSintomaPrincipal === "Moderada" &&
      urgenciaResolver === "Quero resolver em breve" &&
      (fezReposicao === "Pesquisas na internet" ||
        fezReposicao === "Chás / manipulados / remédios caseiros" ||
        fezReposicao === "Nutricionista") &&
      valorDispostoPagar === "Sim, entre R$2.000,00 e R$3.000,00" &&
      (tempoSintomas === "Entre 6 meses a 1 ano" || tempoSintomas === "Á mais de 1 ano") &&
      (rendaMensal === "Ganho de 2 a 3 salários mínimos" || rendaMensal === "Ganho mais de 3 salários mínimos") &&
      tempoMinutos >= 2 &&
      tempoMinutos <= 4

    if (isAA) return "AA"

    // Verificação A
    const isA =
      intensidadeSintomaPrincipal === "Leve" &&
      urgenciaResolver === "Posso esperar mais um pouco" &&
      fezReposicao === "Nenhuma" &&
      (motivoInscricaoEvento === "Fiquei curiosa e quero saber mais" ||
        motivoInscricaoEvento === "Influência ou indicação de amiga/parentes.") &&
      valorDispostoPagar === "Não, no momento não posso investir" &&
      (tempoSintomas === "Menos de 3 meses" || tempoSintomas === "Entre 3 a 6 meses") &&
      rendaMensal === "Ganho de 1 a 2 salários mínimos" &&
      tempoMinutos >= 4 &&
      tempoMinutos <= 6

    if (isA) return "A"

    // Verificação B
    const isB =
      faseMenopausa === "Não sei / Tenho dúvidas" ||
      rendaMensal === "Ganho de 1 a 2 salários mínimos" ||
      valorDispostoPagar === "Não, no momento não posso investir" ||
      tempoMinutos > 6

    if (isB) return "B"

    // Verificação C
    const isC =
      (principalSintoma === "Nenhum desses" && outrosSintomasIncomodam.includes("Nenhum desses")) ||
      compraOnlineExperiencia === "Não" ||
      !rendaMensal ||
      tempoMinutos < 0.5 ||
      tempoMinutos > 15

    if (isC) return "C"

    // Sistema de pontuação como fallback
    let score = 0

    if (intensidadeSintomaPrincipal === "Grave") score += 5
    else if (intensidadeSintomaPrincipal === "Moderada") score += 3
    else if (intensidadeSintomaPrincipal === "Leve") score += 1

    if (urgenciaResolver === "É prioridade máxima") score += 3
    else if (urgenciaResolver === "Quero resolver em breve") score += 2
    else if (urgenciaResolver === "Posso esperar mais um pouco") score += 1

    if (fezReposicao && fezReposicao !== "Nenhuma") score += 2
    if (tempoSintomas === "Á mais de 1 ano") score += 2

    if (valorDispostoPagar === "Sim, mais de R$3.000,00") score += 3
    else if (valorDispostoPagar === "Sim, entre R$2.000,00 e R$3.000,00") score += 2

    if (rendaMensal === "Ganho mais de 3 salários mínimos") score += 2
    else if (rendaMensal === "Ganho de 2 a 3 salários mínimos") score += 1

    if (tempoMinutos <= 2) score += 1

    if (
      jaConhecia === "Sim, mais de 3 meses" ||
      jaConhecia === "Sim, de 6 meses a 1 ano" ||
      jaConhecia === "Sim, entre 2 a 3 anos"
    )
      score += 1

    if (rendaMensal === "Ganho de 1 a 2 salários mínimos" || rendaMensal === "Prefiro não informar") score -= 2

    if (
      impactoSintomasRelacionamento === "Significativamente - afeta bastante nossa intimidade" ||
      impactoSintomasRelacionamento === "Extremamente - está prejudicando muito o relacionamento"
    )
      score += 2

    if (score >= 12) return "AAA"
    if (score >= 9) return "AA"
    if (score >= 6) return "A"
    if (score >= 3) return "B"
    return "C"
  }

  // Executar testes
  let passedTests = 0
  const totalTests = testCases.length

  testCases.forEach((testCase, index) => {
    const result = calculateLeadQualification(testCase.respostas, testCase.tempoQuestionario)
    const passed = result === testCase.expectedQualification

    console.log(`${index + 1}. ${testCase.name}`)
    console.log(`   Esperado: ${testCase.expectedQualification}`)
    console.log(`   Resultado: ${result}`)
    console.log(`   Status: ${passed ? "✅ PASSOU" : "❌ FALHOU"}`)
    console.log("")

    if (passed) passedTests++
  })

  console.log(`\n📊 Resumo dos Testes:`)
  console.log(`✅ Testes Aprovados: ${passedTests}/${totalTests}`)
  console.log(`❌ Testes Falharam: ${totalTests - passedTests}/${totalTests}`)
  console.log(`📈 Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

  if (passedTests === totalTests) {
    console.log(`\n🎉 Todos os testes passaram! A lógica de qualificação está funcionando corretamente.`)
  } else {
    console.log(`\n⚠️ Alguns testes falharam. Verifique a lógica de qualificação.`)
  }
}

// Executar os testes
testLeadQualification()
