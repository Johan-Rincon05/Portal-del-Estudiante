/**
 * Componente de Casilla de Verificación
 * Este archivo contiene el componente de casilla de verificación utilizado en el Portal del Estudiante,
 * implementado con Radix UI y estilizado con Tailwind CSS.
 */

"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Componente Checkbox
 * Este archivo contiene el componente necesario para crear casillas de verificación en el Portal del Estudiante,
 * implementado con Radix UI y estilizado con Tailwind CSS.
 */

/**
 * Componente Checkbox
 * Casilla de verificación con estados y animaciones
 * @param className - Clases CSS adicionales
 * @param props - Propiedades del componente Checkbox de Radix UI
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
