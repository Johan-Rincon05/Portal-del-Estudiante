/**
 * Componente Textarea
 * Este archivo contiene el componente necesario para crear áreas de texto en el Portal del Estudiante,
 * estilizado con Tailwind CSS.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Componente Textarea
 * Área de texto con estilos predefinidos
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de textarea
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
