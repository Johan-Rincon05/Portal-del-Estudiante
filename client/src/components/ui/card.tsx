/**
 * Componentes de tarjeta
 * Este archivo contiene los componentes necesarios para crear tarjetas
 * en el Portal del Estudiante, utilizando Tailwind CSS para el estilo.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Componente Card
 * Este archivo contiene los componentes necesarios para crear tarjetas en el Portal del Estudiante,
 * estilizados con Tailwind CSS.
 */

/**
 * Componente Card
 * Contenedor principal para tarjetas
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * Componente CardHeader
 * Encabezado de la tarjeta
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * Componente CardTitle
 * Título de la tarjeta
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de h3
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * Componente CardDescription
 * Descripción de la tarjeta
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de p
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * Componente CardContent
 * Contenido principal de la tarjeta
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * Componente CardFooter
 * Pie de la tarjeta
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
