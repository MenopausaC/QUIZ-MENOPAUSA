'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, MessageCircle, Calendar, Star, Heart, Award } from 'lucide-react'
import Link from 'next/link'

interface QuestionarioResult {
  nome_completo: string
  email: string
  whatsapp: string
  idade: number
  pontuacao_total: number
  categoria: string
  descricao_categoria: string
  respostas: Array<{
    pergunta: string
    resposta_texto: string
    pontos: number
  }>
  timestamp: string
}

export default function ObrigadoPage() {
  const [result, setResult] = useState<QuestionarioResult | null>(null)

  useEffect(() => {
    const savedResult = localStorage.getItem('questionarioResult')
    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult)
        setResult(parsedResult)
        console.log('📊 Resultado carregado:', parsedResult)
      } catch (error) {
        console.error('❌ Erro ao carregar resultado:', error)
      }
    }
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PRÉ-MENOPAUSA':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PERIMENOPAUSA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'MENOPAUSA':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PRÉ-MENOPAUSA':
        return <Heart className="w-6 h-6 text-green-600" />
      case 'PERIMENOPAUSA':
        return <Star className="w-6 h-6 text-yellow-600" />
      case 'MENOPAUSA':
        return <Award className="w-6 h-6 text-red-600" />
      default:
        return <CheckCircle className="w-6 h-6 text-gray-600" />
    }
  }

  const getRecommendations = (category: string, score: number) => {
    switch (category) {
      case 'PRÉ-MENOPAUSA':
        return [
          "Continue mantendo hábitos saudáveis",
          "Pratique exercícios regulares",
          "Mantenha uma alimentação equilibrada",
          "Monitore mudanças no seu ciclo",
          "Considere suplementação preventiva"
        ]
      case 'PERIMENOPAUSA':
        return [
          "Busque acompanhamento médico especializado",
          "Considere terapias naturais",
          "Ajuste sua alimentação para esta fase",
          "Pratique técnicas de relaxamento",
          "Monitore sintomas regularmente"
        ]
      case 'MENOPAUSA':
        return [
          "Consulte um especialista em menopausa",
          "Avalie opções de tratamento hormonal",
          "Implemente mudanças no estilo de vida",
          "Considere suporte psicológico",
          "Monitore saúde óssea e cardiovascular"
        ]
      default:
        return ["Busque orientação médica especializada"]
    }
  }

  const formatWhatsAppMessage = () => {
    if (!result) return ''
    
    const message = `Olá! Acabei de fazer o questionário de menopausa no site e gostaria de mais informações.

📊 *Meu Resultado:*
• Nome: ${result.nome_completo}
• Categoria: ${result.categoria}
• Pontuação: ${result.pontuacao_total}

Gostaria de agendar uma consulta para conversar sobre meus sintomas e opções de tratamento.`

    return encodeURIComponent(message)
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seu resultado...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const categoryColor = getCategoryColor(result.categoria)
  const categoryIcon = getCategoryIcon(result.categoria)
  const recommendations = getRecommendations(result.categoria, result.pontuacao_total)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header de Sucesso */}
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Obrigada, {result.nome_completo}! 🎉
              </h1>
              <p className="text-lg text-gray-600">
                Seu questionário foi enviado com sucesso!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resultado Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
              {categoryIcon}
              Seu Resultado Personalizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categoria e Pontuação */}
            <div className={`p-6 rounded-lg border ${categoryColor} text-center`}>
              <Badge variant="secondary" className="text-xl px-4 py-2 mb-4">
                {result.categoria}
              </Badge>
              <div className="text-lg font-semibold mb-2">
                Pontuação: {result.pontuacao_total} pontos
              </div>
              <p className="text-base">
                {result.descricao_categoria}
              </p>
            </div>

            {/* Recomendações */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">
                📋 Recomendações Personalizadas:
              </h3>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-800">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Próximos Passos */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg border border-pink-200">
              <h3 className="font-bold text-gray-800 mb-4 text-lg text-center">
                🚀 Próximos Passos Recomendados
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">Fale Conosco</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Tire suas dúvidas via WhatsApp
                  </p>
                  <Button 
                    asChild
                    className="bg-green-500 hover:bg-green-600 w-full"
                  >
                    <a 
                      href={`https://wa.me/5511999999999?text=${formatWhatsAppMessage()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chamar no WhatsApp
                    </a>
                  </Button>
                </div>

                <div className="bg-white p-4 rounded-lg text-center">
                  <Calendar className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">Agendar Consulta</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Consulta especializada - R$ 150
                  </p>
                  <Button 
                    asChild
                    className="bg-pink-500 hover:bg-pink-600 w-full"
                  >
                    <Link href="/agendamento">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Consulta
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Informações Importantes */}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-3">⚠️ Importante:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Este questionário é apenas uma avaliação inicial</li>
                <li>• Não substitui consulta médica especializada</li>
                <li>• Para diagnóstico preciso, consulte um profissional</li>
                <li>• Seus dados estão seguros e protegidos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Resumo dos Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Resumo dos Seus Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Nome:</strong> {result.nome_completo}
              </div>
              <div>
                <strong>Idade:</strong> {result.idade} anos
              </div>
              <div>
                <strong>Email:</strong> {result.email}
              </div>
              <div>
                <strong>WhatsApp:</strong> {result.whatsapp}
              </div>
              <div>
                <strong>Data:</strong> {new Date(result.timestamp).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <strong>Categoria:</strong> {result.categoria}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
