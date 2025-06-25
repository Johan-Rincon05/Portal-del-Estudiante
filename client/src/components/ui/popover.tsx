/**
 * Componente Popover
 * Este archivo contiene los componentes necesarios para crear popovers en el Portal del Estudiante,
 * implementados con Radix UI y estilizados con Tailwind CSS.
 */

"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * Componente Popover
 * Contenedor principal para popovers
 * @param props - Propiedades del componente Popover de Radix UI
 */
const Popover = PopoverPrimitive.Root

/**
 * Componente PopoverTrigger
 * Elemento que activa el popover
 * @param props - Propiedades del componente PopoverTrigger de Radix UI
 */
const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * Componente PopoverContent
 * Contenido del popover
 * @param className - Clases CSS adicionales
 * @param align - Alineación del popover (start, center, end)
 * @param sideOffset - Distancia desde el elemento activador
 * @param props - Propiedades del componente PopoverContent de Radix UI
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
