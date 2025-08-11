"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BarChart3, CreditCard, Calendar, LogOut, User } from 'lucide-react'
import { toast } from "sonner"

import GeralTabContent from "@/components/dashboard/geral-tab-content"
import LeadPagoTabContent from "@/components/dashboard/lead-pago-tab-content"
import AgendamentosTabContent from "@/components/dashboard/agendamentos-tab-content"

interface User {
  id: string
  username: string
  role: 'admin' | 'colaborador'
  name: string
}

const allTabs = [
  {
    id: "geral",
    label: "Geral",
    icon: BarChart3,
    component: GeralTabContent,
    roles: ["admin"]
  },
  {
    id: "pago",
    label: "Lead Pago",
    icon: CreditCard,
    component: LeadPagoTabContent,
    roles: ["admin", "colaborador"]
  },
  {
    id: "agendamentos",
    label: "Agendamentos",
    icon: Calendar,
    component: AgendamentosTabContent,
    roles: ["admin", "colaborador"]
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // Definir aba inicial baseada no role
        const availableTabs = allTabs.filter(tab => tab.roles.includes(data.user.role))
        if (availableTabs.length > 0) {
          setActiveTab(availableTabs[0].id)
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error) {
      console.error('Erro no logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Filtrar abas baseado no role do usuário
  const availableTabs = allTabs.filter(tab => tab.roles.includes(user.role))
  const ActiveComponent = availableTabs.find((tab) => tab.id === activeTab)?.component || availableTabs[0]?.component

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard - Menopausa Cancelada</h1>
            <p className="text-gray-600">Acompanhe os dados dos questionários e leads</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="flex border-b">
              {availableTabs.map((tab) => {
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
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  )
}
