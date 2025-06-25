/**
 * Componente Collapsible
 * Este archivo contiene los componentes necesarios para crear elementos colapsables en el Portal del Estudiante,
 * implementados con Radix UI y estilizados con Tailwind CSS.
 */

"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * Componente Collapsible
 * Contenedor principal para elementos colapsables
 * @param props - Propiedades del componente Collapsible de Radix UI
 */
const Collapsible = CollapsiblePrimitive.Root

/**
 * Componente CollapsibleTrigger
 * Botón que activa el colapso/expansión
 * @param props - Propiedades del componente CollapsibleTrigger de Radix UI
 */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

/**
 * Componente CollapsibleContent
 * Contenido colapsable
 * @param props - Propiedades del componente CollapsibleContent de Radix UI
 */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
