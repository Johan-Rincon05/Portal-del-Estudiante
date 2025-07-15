/**
 * Componente de Paginación
 * Este archivo contiene los componentes necesarios para crear paginación en el Portal del Estudiante,
 * implementados con Radix UI y estilizados con Tailwind CSS.
 */

"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Componente Pagination
 * Contenedor principal para la paginación
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de nav
 */
const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

/**
 * Componente PaginationContent
 * Contenedor para los elementos de paginación
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de ul
 */
const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

/**
 * Componente PaginationItem
 * Elemento individual de paginación
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de li
 */
const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

/**
 * Tipo para las propiedades del botón de paginación
 */
type PaginationLinkProps = {
  isActive?: boolean
  href?: string
  size?: "default" | "sm" | "lg" | "icon"
} & React.ComponentProps<"a">

/**
 * Componente PaginationLink
 * Enlace de paginación
 * @param className - Clases CSS adicionales
 * @param isActive - Si es true, el enlace está activo
 * @param size - Tamaño del botón
 * @param props - Propiedades HTML estándar de a
 */
const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

/**
 * Componente PaginationPrevious
 * Botón para ir a la página anterior
 * @param className - Clases CSS adicionales
 * @param props - Propiedades del componente PaginationLink
 */
const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Ir a página anterior"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Anterior</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

/**
 * Componente PaginationNext
 * Botón para ir a la página siguiente
 * @param className - Clases CSS adicionales
 * @param props - Propiedades del componente PaginationLink
 */
const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Ir a página siguiente"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Siguiente</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

/**
 * Componente PaginationEllipsis
 * Indicador de páginas omitidas
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de span
 */
const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Más páginas</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
