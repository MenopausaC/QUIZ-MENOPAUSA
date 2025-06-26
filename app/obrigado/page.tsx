import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, BookOpen } from "lucide-react"
import Link from "next/link"

export default function ObrigadoPage() {
  return (
    <div className="min-h-screen bg-lilac-soft flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Card className="shadow-lg border-0 bg-white rounded-2xl">
          <CardHeader className="text-center pb-4 px-6">
            <CardTitle className="text-3xl font-poppins text-purple-primary mb-2 tracking-tight">
              Obrigado por Participar!
            </CardTitle>
            <p className="text-base font-poppins font-medium text-dark-purple-text">
              Sua avaliação foi concluída com sucesso.
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <BookOpen className="w-20 h-20 text-purple-primary mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-dark-purple-text mb-3">
                Seus E-books Exclusivos Estão Prontos!
              </h3>
              <p className="text-dark-purple-text text-sm leading-relaxed font-poppins">
                Como agradecimento pela sua participação, preparamos 3 e-books especiais para você. Clique nos botões
                abaixo para <span className="whitespace-nowrap">baixá-los:</span>
              </p>
            </div>

            <div className="space-y-4">
              <Button
                asChild
                className="w-full bg-purple-primary text-white hover:bg-purple-primary/90 py-4 text-lg font-poppins font-medium shadow-md rounded-xl flex items-center justify-center"
              >
                <Link
                  href="https://drive.google.com/file/d/1M_jLMydUEwghNTxD-N1syan32K8kXQBB/view"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-5 h-5 mr-2" />
                  E-book 1: Chás Naturais
                </Link>
              </Button>
              <Button
                asChild
                className="w-full bg-purple-medium text-white hover:bg-purple-medium/90 py-4 text-lg font-poppins font-medium shadow-md rounded-xl flex items-center justify-center"
              >
                <Link
                  href="https://drive.google.com/file/d/1Q-RPF_sn-V7-9VTjpz6SaXimVr1aO4Ks/view"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-5 h-5 mr-2" />
                  E-book 2: Shots para Imunidade
                </Link>
              </Button>
              <Button
                asChild
                className="w-full bg-rose-wine text-white hover:bg-rose-wine/90 py-4 text-lg font-poppins font-medium shadow-md rounded-xl flex items-center justify-center"
              >
                <Link
                  href="https://drive.google.com/file/d/1vXUEKppHB_c4wTsffwkechWdctrf4_kR/view"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-5 h-5 mr-2" />
                  E-book 3: Receitas de Inverno
                </Link>
              </Button>
            </div>

            <div className="mt-6 text-center text-xs text-dark-purple-text font-poppins">
              <span className="font-poppins font-medium">Aproveite seu conteúdo!</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
