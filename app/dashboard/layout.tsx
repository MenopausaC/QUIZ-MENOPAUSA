"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BarChart3, CreditCard, Calendar } from "lucide-react"

import GeralTabContent from "@/components/dashboard/geral-tab-content"
import LeadPagoTabContent from "@/components/dashboard/lead-pago-tab-content"
import AgendamentosTabContent from "@/components/dashboard/agendamentos-tab-content"

const tabs = [
  {
    id: "geral",
    label: "Geral",
    icon: BarChart3,
    component: GeralTabContent,
  },
  {
    id: "pago",
    label: "Lead Pago",
    icon: CreditCard,
    component: LeadPagoTabContent,
  },
  {
    id: "agendamentos",
    label: "Agendamentos",
    icon: Calendar,
    component: AgendamentosTabContent,
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("geral")

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || GeralTabContent

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard - Menopausa Cancelada</h1>
          <p className="text-gray-600">Acompanhe os dados dos questionários e leads</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="flex border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    className={cn(
                      "flex-1 rounded-none border-b-2 border-transparent py-4 px-6 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-600 bg-purple-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
