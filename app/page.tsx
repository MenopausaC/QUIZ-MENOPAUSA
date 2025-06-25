import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/dashboard")
  // O redirect deve ser a primeira coisa na função,
  // mas para satisfazer o ESLint sobre retornar um componente:
  // return null; // Ou um componente de loading simples se preferir
}
