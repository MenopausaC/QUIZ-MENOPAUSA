"use client"

import { cn } from "@/lib/utils"

interface StepperProps {
  currentStep: "data" | "horario" | "dados"
  className?: string
}

export default function Stepper({ currentStep, className }: StepperProps) {
  const steps = [
    { id: "data", label: "Data", number: 1 },
    { id: "horario", label: "Horário", number: 2 },
    { id: "dados", label: "Dados", number: 3 },
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep)
  }

  const currentIndex = getCurrentStepIndex()

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                index <= currentIndex
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-gray-200 text-gray-500",
              )}
            >
              {step.number}
            </div>
            <span
              className={cn("text-xs mt-2 font-medium", index <= currentIndex ? "text-purple-600" : "text-gray-400")}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-16 h-0.5 mx-4 transition-all",
                index < currentIndex ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
