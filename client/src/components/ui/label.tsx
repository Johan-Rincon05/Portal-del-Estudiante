/**
 * Componente Label
 * Este archivo contiene el componente necesario para crear etiquetas en el Portal del Estudiante,
 * implementado con Radix UI y estilizado con Tailwind CSS.
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Definición de variantes de la etiqueta
 * @property variant - Variante visual de la etiqueta (default, error)
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Componente Label
 * Etiqueta con variantes predefinidas
 * @param className - Clases CSS adicionales
 * @param variant - Variante visual de la etiqueta
 * @param props - Propiedades del componente Label de Radix UI
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
