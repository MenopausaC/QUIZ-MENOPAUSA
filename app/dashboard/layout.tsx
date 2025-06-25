"use client" // Necessário para Tabs defaultValue funcionar corretamente com Link e rotas dinâmicas
import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  let currentTab = "geral"
  if (pathname.includes("/dashboard/lead-organico")) {
    currentTab = "lead-organico"
  } else if (pathname.includes("/dashboard/lead-pago")) {
    currentTab = "lead-pago"
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100 dark:bg-slate-900">
      <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b bg-white px-6 dark:bg-slate-800 shadow-sm">
        <LayoutDashboard className="h-8 w-8 text-purple-600" />
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Painel de Questionários</h1>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <Tabs defaultValue={currentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
            <TabsTrigger
              value="geral"
              asChild
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md data-[state=active]:text-purple-600"
            >
              <Link href="/dashboard">Visão Geral</Link>
            </TabsTrigger>
            <TabsTrigger
              value="lead-organico"
              asChild
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md data-[state=active]:text-purple-600"
            >
              <Link href="/dashboard/lead-organico">Lead Orgânico</Link>
            </TabsTrigger>
            <TabsTrigger
              value="lead-pago"
              asChild
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md data-[state=active]:text-purple-600"
            >
              <Link href="/dashboard/lead-pago">Lead Pago</Link>
            </TabsTrigger>
          </TabsList>
          <div className="mt-2">{children}</div>
        </Tabs>
      </main>
      <footer className="py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t bg-white dark:bg-slate-800">
        © {new Date().getFullYear()} Seu Painel de Questionários. Todos os direitos reservados.
      </footer>
    </div>
  )
}
