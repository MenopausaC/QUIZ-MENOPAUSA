'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, User, Phone, Mail, Calendar, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Perguntas do questionário
const questions = [
  {
    id: 1,
    question: "Qual é a sua idade?",
    type: "radio",
    options: [
      { value: "menos-35", label: "Menos de 35 anos", points: 0 },
      { value: "35-40", label: "35-40 anos", points: 1 },
      { value: "41-45", label: "41-45 anos", points: 2 },
      { value: "46-50", label: "46-50 anos", points: 3 },
      { value: "51-55", label: "51-55 anos", points: 4 },
      { value: "mais-55", label: "Mais de 55 anos", points: 5 }
    ]
  },
  {
    id: 2,
    question: "Como está o seu ciclo menstrual?",
    type: "radio",
    options: [
      { value: "regular", label: "Regular (a cada 21-35 dias)", points: 0 },
      { value: "irregular-leve", label: "Levemente irregular", points: 1 },
      { value: "irregular-moderado", label: "Moderadamente irregular", points: 2 },
      { value: "irregular-muito", label: "Muito irregular", points: 3 },
      { value: "ausente-3-6", label: "Ausente há 3-6 meses", points: 4 },
      { value: "ausente-mais-6", label: "Ausente há mais de 6 meses", points: 5 }
    ]
  },
  {
    id: 3,
    question: "Você tem ondas de calor (fogachos)?",
    type: "radio",
    options: [
      { value: "nunca", label: "Nunca", points: 0 },
      { value: "raramente", label: "Raramente", points: 1 },
      { value: "ocasionalmente", label: "Ocasionalmente", points: 2 },
      { value: "frequentemente", label: "Frequentemente", points: 3 },
      { value: "diariamente", label: "Diariamente", points: 4 },
      { value: "constantemente", label: "Constantemente", points: 5 }
    ]
  },
  {
    id: 4,
    question: "Como está a qualidade do seu sono?",
    type: "radio",
    options: [
      { value: "excelente", label: "Excelente", points: 0 },
      { value: "boa", label: "Boa", points: 1 },
      { value: "regular", label: "Regular", points: 2 },
      { value: "ruim", label: "Ruim", points: 3 },
      { value: "muito-ruim", label: "Muito ruim", points: 4 },
      { value: "insonia", label: "Insônia frequente", points: 5 }
    ]
  },
  {
    id: 5,
    question: "Como está o seu humor ultimamente?",
    type: "radio",
    options: [
      { value: "estavel", label: "Estável e positivo", points: 0 },
      { value: "leve-variacao", label: "Leves variações", points: 1 },
      { value: "moderada-variacao", label: "Variações moderadas", points: 2 },
      { value: "irritabilidade", label: "Irritabilidade frequente", points: 3 },
      { value: "ansiedade", label: "Ansiedade e tristeza", points: 4 },
      { value: "depressao", label: "Sintomas depressivos", points: 5 }
    ]
  },
  {
    id: 6,
    question: "Como está sua energia e disposição?",
    type: "radio",
    options: [
      { value: "alta", label: "Alta energia", points: 0 },
      { value: "boa", label: "Boa disposição", points: 1 },
      { value: "moderada", label: "Energia moderada", points: 2 },
      { value: "baixa", label: "Baixa energia", points: 3 },
      { value: "muito-baixa", label: "Muito baixa", points: 4 },
      { value: "exaustao", label: "Exaustão constante", points: 5 }
    ]
  },
  {
    id: 7,
    question: "Você tem ressecamento vaginal?",
    type: "radio",
    options: [
      { value: "nunca", label: "Nunca", points: 0 },
      { value: "raramente", label: "Raramente", points: 1 },
      { value: "ocasionalmente", label: "Ocasionalmente", points: 2 },
      { value: "frequentemente", label: "Frequentemente", points: 3 },
      { value: "sempre", label: "Sempre", points: 4 },
      { value: "severo", label: "Severo e desconfortável", points: 5 }
    ]
  },
  {
    id: 8,
    question: "Como está sua libido (desejo sexual)?",
    type: "radio",
    options: [
      { value: "normal", label: "Normal", points: 0 },
      { value: "leve-reducao", label: "Leve redução", points: 1 },
      { value: "moderada-reducao", label: "Redução moderada", points: 2 },
      { value: "baixa", label: "Baixa", points: 3 },
      { value: "muito-baixa", label: "Muito baixa", points: 4 },
      { value: "ausente", label: "Praticamente ausente", points: 5 }
    ]
  },
  {
    id: 9,
    question: "Você tem dores de cabeça frequentes?",
    type: "radio",
    options: [
      { value: "nunca", label: "Nunca", points: 0 },
      { value: "raramente", label: "Raramente", points: 1 },
      { value: "ocasionalmente", label: "Ocasionalmente", points: 2 },
      { value: "semanalmente", label: "Semanalmente", points: 3 },
      { value: "diariamente", label: "Diariamente", points: 4 },
      { value: "enxaquecas", label: "Enxaquecas severas", points: 5 }
    ]
  },
  {
    id: 10,
    question: "Como está seu peso corporal?",
    type: "radio",
    options: [
      { value: "estavel", label: "Estável", points: 0 },
      { value: "leve-aumento", label: "Leve aumento", points: 1 },
      { value: "aumento-moderado", label: "Aumento moderado", points: 2 },
      { value: "aumento-significativo", label: "Aumento significativo", points: 3 },
      { value: "dificuldade-perder", label: "Dificuldade para perder peso", points: 4 },
      { value: "ganho-rapido", label: "Ganho de peso rápido", points: 5 }
    ]
  },
  {
    id: 11,
    question: "Você tem problemas de concentração ou memória?",
    type: "radio",
    options: [
      { value: "nunca", label: "Nunca", points: 0 },
      { value: "raramente", label: "Raramente", points: 1 },
      { value: "ocasionalmente", label: "Ocasionalmente", points: 2 },
      { value: "frequentemente", label: "Frequentemente", points: 3 },
      { value: "diariamente", label: "Diariamente", points: 4 },
      { value: "severos", label: "Problemas severos", points: 5 }
    ]
  },
  {
    id: 12,
    question: "Qual é o seu principal objetivo em relação à menopausa?",
    type: "radio",
    options: [
      { value: "prevencao", label: "Prevenção e preparação", points: 1 },
      { value: "controle-sintomas", label: "Controlar sintomas atuais", points: 2 },
      { value: "tratamento-natural", label: "Buscar tratamentos naturais", points: 2 },
      { value: "orientacao-medica", label: "Orientação médica especializada", points: 3 },
      { value: "terapia-hormonal", label: "Avaliar terapia hormonal", points: 3 },
      { value: "melhoria-qualidade", label: "Melhorar qualidade de vida", points: 2 }
    ]
  }
]

// Função para formatar WhatsApp
const formatWhatsApp = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  const limited = numbers.slice(0, 11)
  
  if (limited.length <= 2) {
    return `(${limited}`
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }
}

export default function DiagnosticoPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showPersonalData, setShowPersonalData] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Dados pessoais
  const [personalData, setPersonalData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    idade: ''
  })

  const handleAnswer = (questionId: number, value: string) => {
    console.log(`Pergunta ${questionId}: ${value}`)
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setError('')
  }

  const handleNext = () => {
    const question = questions[currentQuestion]
    if (!answers[question.id]) {
      setError('Por favor, selecione uma resposta')
      return
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setError('')
    } else {
      setShowPersonalData(true)
      setError('')
    }
  }

  const handlePrevious = () => {
    if (showPersonalData) {
      setShowPersonalData(false)
    } else if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
    setError('')
  }

  const handlePersonalDataChange = (field: string, value: string) => {
    if (field === 'whatsapp') {
      setPersonalData(prev => ({ ...prev, [field]: formatWhatsApp(value) }))
    } else {
      setPersonalData(prev => ({ ...prev, [field]: value }))
    }
    setError('')
  }

  const calculateScore = () => {
    let totalScore = 0
    
    questions.forEach(question => {
      const answer = answers[question.id]
      if (answer) {
        const option = question.options.find(opt => opt.value === answer)
        if (option) {
          totalScore += option.points
        }
      }
    })

    return totalScore
  }

  const getCategory = (score: number) => {
    if (score <= 15) {
      return {
        category: "PRÉ-MENOPAUSA",
        description: "Você está na fase pré-menopausa com sintomas leves ou ausentes.",
        color: "bg-green-100 text-green-800 border-green-200"
      }
    } else if (score <= 30) {
      return {
        category: "PERIMENOPAUSA",
        description: "Você está na transição para a menopausa com sintomas moderados.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      }
    } else {
      return {
        category: "MENOPAUSA",
        description: "Você está na menopausa com sintomas significativos que requerem atenção.",
        color: "bg-red-100 text-red-800 border-red-200"
      }
    }
  }

  const validatePersonalData = () => {
    if (!personalData.nome.trim()) {
      setError('Nome é obrigatório')
      return false
    }

    if (!personalData.email.trim()) {
      setError('Email é obrigatório')
      return false
    }

    if (!personalData.email.includes('@')) {
      setError('Email inválido')
      return false
    }

    if (!personalData.whatsapp.trim()) {
      setError('WhatsApp é obrigatório')
      return false
    }

    const whatsappNumbers = personalData.whatsapp.replace(/\D/g, '')
    if (whatsappNumbers.length < 10) {
      setError('WhatsApp deve ter pelo menos 10 dígitos')
      return false
    }

    if (!personalData.idade.trim()) {
      setError('Idade é obrigatória')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    console.log('🚀 INICIANDO ENVIO DO QUESTIONÁRIO')
    
    if (!validatePersonalData()) {
      console.log('❌ Validação falhou:', error)
      return
    }

    setLoading(true)
    setError('')

    try {
      const score = calculateScore()
      const category = getCategory(score)
      const whatsappClean = personalData.whatsapp.replace(/\D/g, '')

      // Preparar respostas detalhadas
      const detailedAnswers = questions.map(question => {
        const answer = answers[question.id]
        const option = question.options.find(opt => opt.value === answer)
        return {
          pergunta_id: question.id,
          pergunta: question.question,
          resposta_valor: answer,
          resposta_texto: option?.label || '',
          pontos: option?.points || 0
        }
      })

      const questionarioData = {
        // Identificação
        id: `questionario_${Date.now()}`,
        timestamp: new Date().toISOString(),
        tipo_questionario: 'MENOPAUSA',
        
        // Dados pessoais
        nome_completo: personalData.nome.trim(),
        email: personalData.email.trim().toLowerCase(),
        whatsapp: whatsappClean,
        idade: parseInt(personalData.idade),
        
        // Resultados
        pontuacao_total: score,
        categoria: category.category,
        descricao_categoria: category.description,
        
        // Respostas detalhadas
        respostas: detailedAnswers,
        total_perguntas: questions.length,
        
        // Metadados
        user_agent: navigator.userAgent,
        url_origem: window.location.href,
        data_preenchimento: new Date().toISOString()
      }

      console.log('📤 Dados do questionário:', questionarioData)

      // Enviar para webhook
      const webhookUrl = 'https://hook.us1.make.com/ibvli2ncgm8ii128jc5cknc6k8eixb3k'
      console.log('🔗 Enviando para webhook:', webhookUrl)

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionarioData)
      })

      console.log('📡 Resposta do webhook:', response.status, response.statusText)

      if (response.ok) {
        console.log('✅ Questionário enviado com sucesso!')
        
        // Salvar resultado no localStorage
        const resultData = {
          ...questionarioData,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('questionarioResult', JSON.stringify(resultData))
        
        // Redirecionar para página de obrigado
        router.push('/obrigado')
      } else {
        const errorText = await response.text()
        console.error('❌ Erro no webhook:', errorText)
        throw new Error(`Erro no envio: ${response.status}`)
      }

    } catch (error) {
      console.error('❌ ERRO COMPLETO:', error)
      setError('Erro ao enviar questionário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const progress = showPersonalData ? 100 : ((currentQuestion + 1) / questions.length) * 100

  if (showPersonalData) {
    const score = calculateScore()
    const category = getCategory(score)

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Questionário Completo</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-pink-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                📋 Seus Dados Pessoais
              </CardTitle>
              <p className="text-center text-gray-600">
                Para finalizar e receber seu resultado personalizado
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resultado Prévio */}
              <div className={`p-4 rounded-lg border ${category.color}`}>
                <h3 className="font-bold text-lg mb-2">Seu Resultado Preliminar:</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {category.category}
                  </Badge>
                  <span className="font-semibold">Pontuação: {score}</span>
                </div>
                <p className="text-sm">{category.description}</p>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="nome"
                      value={personalData.nome}
                      onChange={(e) => handlePersonalDataChange('nome', e.target.value)}
                      placeholder="Seu nome completo"
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={personalData.email}
                      onChange={(e) => handlePersonalDataChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="whatsapp"
                      value={personalData.whatsapp}
                      onChange={(e) => handlePersonalDataChange('whatsapp', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                      maxLength={15}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="idade">Idade *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="idade"
                      type="number"
                      value={personalData.idade}
                      onChange={(e) => handlePersonalDataChange('idade', e.target.value)}
                      placeholder="Sua idade"
                      className="pl-10"
                      min="18"
                      max="100"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !personalData.nome || !personalData.email || !personalData.whatsapp || !personalData.idade}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finalizar e Ver Resultado
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-pink-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswer(question.id, value)}
            >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button
                onClick={handleNext}
                disabled={!answers[question.id]}
                className="bg-pink-500 hover:bg-pink-600 flex items-center gap-2"
              >
                {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
