/**
 * Componente Skeleton
 * Este archivo contiene el componente necesario para crear elementos de carga en el Portal del Estudiante,
 * estilizado con Tailwind CSS.
 */

import { cn } from "@/lib/utils"

/**
 * Componente Skeleton
 * Elemento de carga con animación de pulso
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
