import WebhookTestDashboard from "@/components/webhook-test-dashboard"

export default function TestWebhooksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teste de Webhooks</h1>
          <p className="text-gray-600">Valide se todos os webhooks estão funcionando corretamente</p>
        </div>

        <WebhookTestDashboard />
      </div>
    </div>
  )
}
