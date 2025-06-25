/**
 * Componentes de cajón deslizante
 * Este archivo contiene los componentes necesarios para crear cajones deslizantes
 * en el Portal del Estudiante, utilizando Radix UI para la funcionalidad y
 * Tailwind CSS para el estilo.
 */

"use client"

import * as React from "react"
import * as DrawerPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Componente Drawer
 * Contenedor principal para cajones deslizantes
 * @param props - Propiedades del componente Drawer de Radix UI
 */
const Drawer = DrawerPrimitive.Root

/**
 * Componente DrawerTrigger
 * Botón que activa el cajón deslizante
 * @param props - Propiedades del componente DrawerTrigger de Radix UI
 */
const DrawerTrigger = DrawerPrimitive.Trigger

/**
 * Componente DrawerClose
 * Botón para cerrar el cajón deslizante
 * @param props - Propiedades del componente DrawerClose de Radix UI
 */
const DrawerClose = DrawerPrimitive.Close

/**
 * Componente DrawerPortal
 * Portal para renderizar el cajón deslizante
 * @param props - Propiedades del componente DrawerPortal de Radix UI
 */
const DrawerPortal = DrawerPrimitive.Portal

/**
 * Componente DrawerOverlay
 * Capa de superposición del cajón deslizante
 * @param className - Clases CSS adicionales
 * @param props - Propiedades del componente DrawerOverlay de Radix UI
 */
const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

/**
 * Variantes de estilo para el cajón deslizante
 * @property side - Lado desde donde se desliza el cajón (top, right, bottom, left)
 */
const drawerVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

/**
 * Componente DrawerContent
 * Contenido del cajón deslizante
 * @param className - Clases CSS adicionales
 * @param side - Lado desde donde se desliza el cajón
 * @param props - Propiedades del componente DrawerContent de Radix UI
 */
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> &
    VariantProps<typeof drawerVariants>
>(({ side = "right", className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(drawerVariants({ side }), className)}
      {...props}
    >
      {children}
      <DrawerPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </DrawerPrimitive.Close>
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = DrawerPrimitive.Content.displayName

/**
 * Componente DrawerHeader
 * Encabezado del cajón deslizante
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

/**
 * Componente DrawerFooter
 * Pie del cajón deslizante
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

/**
 * Componente DrawerTitle
 * Título del cajón deslizante
 * @param className - Clases CSS adicionales
 * @param props - Propiedades del componente DrawerTitle de Radix UI
 */
const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

/**
 * Componente DrawerDescription
 * Descripción del cajón deslizante
 * @param className - Clases CSS adicionales
 * @param props - Propiedades del componente DrawerDescription de Radix UI
 */
const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
