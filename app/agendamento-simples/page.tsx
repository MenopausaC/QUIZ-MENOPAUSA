"use client"

import SimpleScheduler from "@/components/agendamento/simple-scheduler"
import { useRouter } from "next/navigation"

export default function AgendamentoSimplesPage() {
  const router = useRouter()

  const handleConfirm = ({ date, time }: { date: string; time: string }) => {
    // Redireciona para a página de dados com os parâmetros
    router.push(`/agendamento-publico/dados?data=${date}&horario=${time}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agendar Consulta
          </h1>
          <p className="text-gray-600">
            Escolha o melhor dia e horário para sua consulta
          </p>
        </div>

        <SimpleScheduler onConfirm={handleConfirm} />
      </div>
    </div>
  )
}
