import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AgendamentosTabContent from "@/components/dashboard/agendamentos-tab-content" // Importação padrão
import LeadPagoTabContent from "@/components/dashboard/lead-pago-tab-content" // Importação padrão
import GeralTabContent from "@/components/dashboard/geral-tab-content" // Importação padrão

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="agendamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          <TabsTrigger value="lead-pago">Lead Pago</TabsTrigger>
          <TabsTrigger value="geral">Geral</TabsTrigger>
        </TabsList>
        <TabsContent value="agendamentos" className="space-y-4">
          <AgendamentosTabContent />
        </TabsContent>
        <TabsContent value="lead-pago" className="space-y-4">
          <LeadPagoTabContent />
        </TabsContent>
        <TabsContent value="geral" className="space-y-4">
          <GeralTabContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}
