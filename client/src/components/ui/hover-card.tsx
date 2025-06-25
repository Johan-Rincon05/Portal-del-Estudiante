/**
 * Componente HoverCard
 * Este archivo contiene los componentes necesarios para crear tarjetas que aparecen al pasar el mouse en el Portal del Estudiante,
 * implementados con Radix UI y estilizados con Tailwind CSS.
 */

"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

/**
 * Componente HoverCard
 * Contenedor principal para tarjetas hover
 * @param props - Propiedades del componente HoverCard de Radix UI
 */
const HoverCard = HoverCardPrimitive.Root

/**
 * Componente HoverCardTrigger
 * Elemento que activa la tarjeta al pasar el mouse
 * @param props - Propiedades del componente HoverCardTrigger de Radix UI
 */
const HoverCardTrigger = HoverCardPrimitive.Trigger

/**
 * Componente HoverCardContent
 * Contenido de la tarjeta hover
 * @param className - Clases CSS adicionales
 * @param align - Alineación de la tarjeta
 * @param sideOffset - Desplazamiento desde el lado del trigger
 * @param props - Propiedades del componente HoverCardContent de Radix UI
 */
const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
