'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Calendar, Clock, User, Phone, MessageCircle, CreditCard } from 'lucide-react'

interface AgendamentoData {
  id: string
  nome_completo: string
  whatsapp: string
  data_agendamento: string
  horario_agendamento: string
  data_formatada: string
  valor_consulta: number
  status: string
  timestamp: string
}

export default function PagamentoConfirmadoPage() {
  const [agendamento, setAgendamento] = useState<AgendamentoData | null>(null)

  useEffect(() => {
    const savedData = localStorage.getItem('agendamentoData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setAgendamento(parsedData)
        console.log('📅 Dados do agendamento carregados:', parsedData)
      } catch (error) {
        console.error('❌ Erro ao carregar dados do agendamento:', error)
      }
    }
  }, [])

  const formatWhatsAppMessage = () => {
    if (!agendamento) return ''
    
    const message = `Olá! Acabei de fazer meu agendamento no site.

📅 *Dados do Agendamento:*
• Nome: ${agendamento.nome_completo}
• Data: ${agendamento.data_formatada}
• Horário: ${agendamento.horario_agendamento}
• Valor: R$ ${agendamento.valor_consulta.toFixed(2)}

Gostaria de confirmar meu agendamento e receber as informações de pagamento.`

    return encodeURIComponent(message)
  }

  if (!agendamento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados do agendamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header de Sucesso */}
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Agendamento Confirmado! 🎉
              </h1>
              <p className="text-xl text-gray-600">
                Olá, {agendamento.nome_completo}!
              </p>
              <p className="text-lg text-gray-600 mt-2">
                Seu agendamento foi realizado com sucesso!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do Agendamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
              <Calendar className="w-7 h-7 text-green-600" />
              Detalhes da sua Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações principais */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-green-900 mb-2">Data da Consulta</h3>
                <p className="text-green-800 text-lg font-semibold">
                  {agendamento.data_formatada}
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-blue-900 mb-2">Horário</h3>
                <p className="text-blue-800 text-lg font-semibold">
                  {agendamento.horario_agendamento}
                </p>
              </div>
            </div>

            {/* Dados pessoais */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 text-center">👤 Seus Dados</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-semibold">{agendamento.nome_completo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">WhatsApp</p>
                    <p className="font-semibold">{agendamento.whatsapp}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Valor */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg border border-green-200 text-center">
              <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-2">Valor da Consulta</h3>
              <p className="text-3xl font-bold text-green-600">
                R$ {agendamento.valor_consulta.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Consulta online de 30 minutos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Próximos Passos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              🚀 Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-3 text-center">
                📱 Você receberá via WhatsApp:
              </h3>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
                  Link para pagamento da consulta
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
                  Confirmação após o pagamento
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
                  Link da consulta online (Google Meet)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
                  Lembrete 1 dia antes da consulta
                </li>
              </ul>
            </div>

            {/* Botão WhatsApp */}
            <div className="text-center">
              <Button 
                asChild
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg"
              >
                <a 
                  href={`https://wa.me/5511999999999?text=${formatWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Confirmar no WhatsApp
                </a>
              </Button>
              <p className="text-sm text-gray-600 mt-3">
                Clique para confirmar seu agendamento e receber o link de pagamento
              </p>
            </div>

            {/* Informações importantes */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informações Importantes:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• A consulta será realizada via Google Meet</li>
                <li>• Você receberá o link 30 minutos antes do horário</li>
                <li>• Tenha um ambiente tranquilo e boa conexão de internet</li>
                <li>• Em caso de dúvidas, entre em contato via WhatsApp</li>
                <li>• Política de cancelamento: até 24h antes da consulta</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ID do Agendamento */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">
              <strong>ID do Agendamento:</strong> {agendamento.id}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Guarde este número para referência
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
