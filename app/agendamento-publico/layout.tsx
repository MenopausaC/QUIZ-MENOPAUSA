import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agendamento de Consulta",
  description: "Agende sua consulta de forma rápida e fácil",
}

export default function AgendamentoPublicoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
