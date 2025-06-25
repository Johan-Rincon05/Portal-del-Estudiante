/**
 * Componente Input
 * Este archivo contiene el componente necesario para crear campos de entrada en el Portal del Estudiante,
 * estilizado con Tailwind CSS.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Componente Input
 * Campo de entrada de texto con estilos predefinidos
 * @param className - Clases CSS adicionales
 * @param type - Tipo de entrada (text, password, email, etc.)
 * @param props - Propiedades HTML estándar de input
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
