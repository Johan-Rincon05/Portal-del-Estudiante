/**
 * Componente ToggleGroup
 * Este archivo contiene los componentes necesarios para crear grupos de botones de alternancia en el Portal del Estudiante,
 * implementados con Radix UI y estilizados con Tailwind CSS.
 */

"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

/**
 * Componente ToggleGroup
 * Contenedor para un grupo de botones de alternancia
 * @param className - Clases CSS adicionales
 * @param variant - Variante visual de los botones
 * @param size - Tamaño de los botones
 * @param props - Propiedades del componente ToggleGroup de Radix UI
 */
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

/**
 * Componente ToggleGroup
 * Contenedor principal para grupos de botones de alternancia
 * @param className - Clases CSS adicionales
 * @param variant - Variante visual de los botones
 * @param size - Tamaño de los botones
 * @param props - Propiedades del componente ToggleGroup de Radix UI
 */
const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

/**
 * Componente ToggleGroupItem
 * Botón individual dentro del grupo
 * @param className - Clases CSS adicionales
 * @param children - Contenido del botón
 * @param variant - Variante visual del botón
 * @param size - Tamaño del botón
 * @param props - Propiedades del componente ToggleGroupItem de Radix UI
 */
const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: variant || context.variant,
          size: size || context.size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
