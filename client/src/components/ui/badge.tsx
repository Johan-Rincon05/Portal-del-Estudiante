/**
 * Componente Badge
 * Este archivo contiene el componente necesario para crear insignias en el Portal del Estudiante,
 * estilizado con Tailwind CSS.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Definición de variantes de la insignia
 * @property variant - Variante visual de la insignia (default, secondary, destructive, outline)
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Componente Badge
 * Insignia con variantes predefinidas
 * @param className - Clases CSS adicionales
 * @param variant - Variante visual de la insignia
 * @param props - Propiedades HTML estándar de div
 */
function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
