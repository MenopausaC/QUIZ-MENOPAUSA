// Este arquivo atuará como o conteúdo da aba "Geral"
// O conteúdo real será gerenciado por `geral-tab-content.tsx`
// e renderizado pelo `layout.tsx` aninhado em `(tabs)`
import GeralTabContent from "@/components/dashboard/geral-tab-content"

export default function GeralPage() {
  return <GeralTabContent />
}
