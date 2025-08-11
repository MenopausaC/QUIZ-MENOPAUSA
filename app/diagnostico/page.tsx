'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, ChevronLeft, User, Mail, Phone, Calendar, CheckCircle2, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Perguntas do questionário
const questions = [
  {
    id: 1,
    question: "Qual é a sua idade?",
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
  const [currentStep, setCurrentStep] = useState(0) // 0 = questions, 1 = personal data
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
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
      setCurrentStep(1) // Ir para dados pessoais
      setError('')
    }
  }

  const handlePrevious = () => {
    if (currentStep === 1) {
      setCurrentStep(0)
      setCurrentQuestion(questions.length - 1)
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
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      }
    } else if (score <= 30) {
      return {
        category: "PERIMENOPAUSA", 
        description: "Você está na transição para a menopausa com sintomas moderados.",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      }
    } else {
      return {
        category: "MENOPAUSA",
        description: "Você está na menopausa com sintomas significativos que requerem atenção.",
        color: "text-red-600",
        bgColor: "bg-red-50", 
        borderColor: "border-red-200"
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
    if (!validatePersonalData()) {
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
        nome_completo: personalData.nome.trim(),
        email_paciente: personalData.email.trim().toLowerCase(),
        whatsapp: whatsappClean,
        idade: parseInt(personalData.idade),
        pontuacao_total: score,
        categoria_risco: category.category,
        respostas: detailedAnswers,
        tipo_questionario: 'MENOPAUSA_DIAGNOSTICO',
        origem: 'site_diagnostico',
        user_agent: navigator.userAgent,
        ip_address: 'unknown'
      }

      const response = await fetch('/api/save-questionario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionarioData)
      })

      if (response.ok) {
        // Salvar resultado no localStorage
        const resultData = {
          ...questionarioData,
          descricao_categoria: category.description,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('questionarioResult', JSON.stringify(resultData))
        
        // Redirecionar para página de obrigado
        router.push('/obrigado')
      } else {
        throw new Error(`Erro no envio: ${response.status}`)
      }

    } catch (error) {
      console.error('Erro:', error)
      setError('Erro ao enviar questionário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const totalQuestions = questions.length
  const progress = currentStep === 0 
    ? ((currentQuestion + 1) / totalQuestions) * 80 
    : 100

  // Tela de dados pessoais
  if (currentStep === 1) {
    const score = calculateScore()
    const category = getCategory(score)

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Quase pronto! 🎉
              </h1>
              <p className="text-gray-600">
                Agora precisamos dos seus dados para personalizar o resultado
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Finalizando questionário</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                {/* Resultado Prévio */}
                <div className={`p-6 rounded-xl border-2 ${category.bgColor} ${category.borderColor} mb-8`}>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Seu Resultado Preliminar
                    </h3>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${category.color} bg-white border`}>
                      {category.category}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-800">
                      {score} pontos
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Formulário */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="nome" className="text-sm font-medium text-gray-700 mb-2 block">
                      Nome Completo *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="nome"
                        value={personalData.nome}
                        onChange={(e) => handlePersonalDataChange('nome', e.target.value)}
                        placeholder="Seu nome completo"
                        className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        value={personalData.email}
                        onChange={(e) => handlePersonalDataChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 mb-2 block">
                      WhatsApp *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="whatsapp"
                        value={personalData.whatsapp}
                        onChange={(e) => handlePersonalDataChange('whatsapp', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        maxLength={15}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="idade" className="text-sm font-medium text-gray-700 mb-2 block">
                      Idade *
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="idade"
                        type="number"
                        value={personalData.idade}
                        onChange={(e) => handlePersonalDataChange('idade', e.target.value)}
                        placeholder="Sua idade"
                        className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        min="18"
                        max="100"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-8">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={loading}
                    className="flex items-center gap-2 h-12 px-6"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !personalData.nome || !personalData.email || !personalData.whatsapp || !personalData.idade}
                    className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Finalizar e Ver Resultado
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Tela das perguntas
  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Diagnóstico de Menopausa
            </h1>
            <p className="text-gray-600">
              Responda às perguntas para descobrir em que fase você está
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Pergunta {currentQuestion + 1} de {totalQuestions}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
                  {question.question}
                </h2>

                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswer(question.id, value)}
                  className="space-y-3"
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="relative">
                      <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all cursor-pointer">
                        <RadioGroupItem 
                          value={option.value} 
                          id={option.value}
                          className="border-2 border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <Label 
                          htmlFor={option.value} 
                          className="flex-1 cursor-pointer text-gray-700 font-medium"
                        >
                          {option.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 h-12 px-6"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!answers[question.id]}
                  className="h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2"
                >
                  {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
