/**
 * Componente Tooltip
 * Este archivo contiene los componentes necesarios para crear tooltips en el Portal del Estudiante,
 * implementados con Radix UI y estilizados con Tailwind CSS.
 */

"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * Componente TooltipProvider
 * Proveedor de contexto para los tooltips
 * @param props - Propiedades del componente TooltipProvider de Radix UI
 */
const TooltipProvider = TooltipPrimitive.Provider

/**
 * Componente Tooltip
 * Contenedor principal para tooltips
 * @param props - Propiedades del componente Tooltip de Radix UI
 */
const Tooltip = TooltipPrimitive.Root

/**
 * Componente TooltipTrigger
 * Elemento que activa el tooltip
 * @param props - Propiedades del componente TooltipTrigger de Radix UI
 */
const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * Componente TooltipContent
 * Contenido del tooltip
 * @param className - Clases CSS adicionales
 * @param sideOffset - Distancia desde el elemento activador
 * @param props - Propiedades del componente TooltipContent de Radix UI
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
