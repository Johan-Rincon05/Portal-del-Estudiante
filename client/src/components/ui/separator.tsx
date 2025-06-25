/**
 * Componente Separator
 * Este archivo contiene el componente necesario para crear separadores visuales en el Portal del Estudiante,
 * implementado con Radix UI y estilizado con Tailwind CSS.
 */

"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Componente Separator
 * Línea divisoria con orientación configurable
 * @param className - Clases CSS adicionales
 * @param decorative - Si el separador es decorativo
 * @param orientation - Orientación del separador (horizontal, vertical)
 * @param props - Propiedades del componente Separator de Radix UI
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
