/**
 * Componentes de barra de menú
 * Este archivo contiene los componentes necesarios para crear barras de menú
 * en el Portal del Estudiante, utilizando Radix UI para la funcionalidad y
 * Tailwind CSS para el estilo.
 * 
 * @example
 * ```tsx
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>Archivo</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>Nuevo</MenubarItem>
 *       <MenubarItem>Abrir</MenubarItem>
 *       <MenubarSeparator />
 *       <MenubarItem>Guardar</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con submenús
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>Editar</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>Deshacer</MenubarItem>
 *       <MenubarItem>Rehacer</MenubarItem>
 *       <MenubarSeparator />
 *       <MenubarSub>
 *         <MenubarSubTrigger>Copiar</MenubarSubTrigger>
 *         <MenubarSubContent>
 *           <MenubarItem>Texto</MenubarItem>
 *           <MenubarItem>Formato</MenubarItem>
 *         </MenubarSubContent>
 *       </MenubarSub>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con opciones de radio
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>Ver</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarRadioGroup value="lista">
 *         <MenubarRadioItem value="lista">Lista</MenubarRadioItem>
 *         <MenubarRadioItem value="cuadrícula">Cuadrícula</MenubarRadioItem>
 *       </MenubarRadioGroup>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con casillas de verificación
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>Opciones</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarCheckboxItem checked={true}>
 *         Mostrar barra de herramientas
 *       </MenubarCheckboxItem>
 *       <MenubarCheckboxItem checked={false}>
 *         Mostrar barra de estado
 *       </MenubarCheckboxItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con atajos de teclado
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>Archivo</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>
 *         Nuevo
 *         <MenubarShortcut>⌘N</MenubarShortcut>
 *       </MenubarItem>
 *       <MenubarItem>
 *         Abrir
 *         <MenubarShortcut>⌘O</MenubarShortcut>
 *       </MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con grupos y etiquetas
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>Herramientas</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarGroup>
 *         <MenubarLabel>Herramientas básicas</MenubarLabel>
 *         <MenubarItem>Lápiz</MenubarItem>
 *         <MenubarItem>Borrador</MenubarItem>
 *       </MenubarGroup>
 *       <MenubarSeparator />
 *       <MenubarGroup>
 *         <MenubarLabel>Herramientas avanzadas</MenubarLabel>
 *         <MenubarItem>Pincel</MenubarItem>
 *         <MenubarItem>Degradado</MenubarItem>
 *       </MenubarGroup>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con menú controlado
 * const [open, setOpen] = React.useState(false)
 * 
 * <Menubar>
 *   <MenubarMenu open={open} onOpenChange={setOpen}>
 *     <MenubarTrigger>Archivo</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>Nuevo</MenubarItem>
 *       <MenubarItem>Abrir</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con personalización de estilos
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger className="bg-primary text-primary-foreground">
 *       Archivo
 *     </MenubarTrigger>
 *     <MenubarContent className="bg-secondary text-secondary-foreground">
 *       <MenubarItem className="hover:bg-accent">
 *         Nuevo
 *       </MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con menú deshabilitado
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger disabled>Archivo</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem disabled>Nuevo</MenubarItem>
 *       <MenubarItem>Abrir</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con menú anidado
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>Archivo</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarSub>
 *         <MenubarSubTrigger>Exportar</MenubarSubTrigger>
 *         <MenubarSubContent>
 *           <MenubarSub>
 *             <MenubarSubTrigger>Como...</MenubarSubTrigger>
 *             <MenubarSubContent>
 *               <MenubarItem>PDF</MenubarItem>
 *               <MenubarItem>Imagen</MenubarItem>
 *             </MenubarSubContent>
 *           </MenubarSub>
 *         </MenubarSubContent>
 *       </MenubarSub>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @example
 * ```tsx
 * // Ejemplo con menú y portal
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>Archivo</MenubarTrigger>
 *     <MenubarPortal>
 *       <MenubarContent>
 *         <MenubarItem>Nuevo</MenubarItem>
 *         <MenubarItem>Abrir</MenubarItem>
 *       </MenubarContent>
 *     </MenubarPortal>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 * 
 * @see https://www.radix-ui.com/primitives/docs/components/menubar
 * @see https://www.radix-ui.com/primitives/docs/components/menubar#accessibility
 * @see https://www.radix-ui.com/primitives/docs/components/menubar#keyboard-interactions
 * @see https://www.radix-ui.com/primitives/docs/components/menubar#styling
 */

"use client"

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Componente Menubar
 * Contenedor principal para barras de menú que permite crear menús desplegables
 * con submenús, elementos de radio, casillas de verificación y más.
 * 
 * @param props - Propiedades del componente Menubar de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.children - Elementos hijos del menú
 * @param props.value - Valor actual del menú (para menús controlados)
 * @param props.onValueChange - Función llamada cuando cambia el valor del menú
 * @param props.dir - Dirección del texto (ltr, rtl)
 * @param props.loop - Si el menú debe ciclar al navegar con teclado
 */
const MenubarMenu = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn("z-50", className)}
    {...props}
  />
))
MenubarMenu.displayName = MenubarPrimitive.Root.displayName

/**
 * Componente MenubarTrigger
 * Elemento que activa el menú al hacer clic o al pasar el cursor.
 * 
 * @param props - Propiedades del componente MenubarTrigger de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.children - Contenido del trigger
 * @param props.disabled - Si el trigger está deshabilitado
 */
const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

/**
 * Componente MenubarGroup
 * Agrupa elementos relacionados del menú.
 * 
 * @param props - Propiedades del componente MenubarGroup de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.children - Elementos del grupo
 */
const MenubarGroup = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Group>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Group
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  />
))
MenubarGroup.displayName = MenubarPrimitive.Group.displayName

/**
 * Componente MenubarPortal
 * Portal para renderizar el menú fuera de su contenedor original.
 * Útil para evitar problemas de desbordamiento o z-index.
 * 
 * @param props - Propiedades del componente MenubarPortal de Radix UI
 * @param props.children - Contenido a renderizar en el portal
 * @param props.container - Elemento contenedor del portal
 */
const MenubarPortal = MenubarPrimitive.Portal

/**
 * Componente MenubarSub
 * Submenú que puede contener elementos adicionales.
 * 
 * @param props - Propiedades del componente MenubarSub de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.children - Elementos del submenú
 * @param props.open - Si el submenú está abierto (controlado)
 * @param props.defaultOpen - Si el submenú está abierto por defecto (no controlado)
 * @param props.onOpenChange - Función llamada cuando cambia el estado del submenú
 */
const MenubarSub = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn("z-50", className)}
    {...props}
  />
))
MenubarSub.displayName = MenubarPrimitive.Root.displayName

/**
 * Componente MenubarRadioGroup
 * Grupo de opciones de radio mutuamente excluyentes.
 * 
 * @param props - Propiedades del componente MenubarRadioGroup de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.value - Valor seleccionado
 * @param props.onValueChange - Función llamada cuando cambia el valor
 * @param props.children - Elementos de radio del grupo
 */
const MenubarRadioGroup = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioGroup>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioGroup>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.RadioGroup
    ref={ref}
    className={cn("z-50", className)}
    {...props}
  />
))
MenubarRadioGroup.displayName = MenubarPrimitive.RadioGroup.displayName

/**
 * Componente MenubarSubTrigger
 * Elemento que activa un submenú al hacer clic o al pasar el cursor.
 * 
 * @param props - Propiedades del componente MenubarSubTrigger de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.inset - Si el elemento debe tener sangría
 * @param props.children - Contenido del trigger
 * @param props.disabled - Si el trigger está deshabilitado
 */
const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

/**
 * Componente MenubarSubContent
 * Contenido de un submenú que se muestra cuando se activa el submenú.
 * 
 * @param props - Propiedades del componente MenubarSubContent de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.children - Contenido del submenú
 * @param props.sideOffset - Distancia desde el elemento activador
 * @param props.align - Alineación del submenú (start, center, end)
 */
const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

/**
 * Componente MenubarContent
 * Contenido principal del menú que se muestra cuando se activa el menú.
 * 
 * @param props - Propiedades del componente MenubarContent de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.children - Contenido del menú
 * @param props.align - Alineación del menú (start, center, end)
 * @param props.alignOffset - Desplazamiento de la alineación
 * @param props.sideOffset - Distancia desde el elemento activador
 */
const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

/**
 * Componente MenubarItem
 * Elemento individual del menú que puede ser activado.
 * 
 * @param props - Propiedades del componente MenubarItem de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.inset - Si el elemento debe tener sangría
 * @param props.children - Contenido del elemento
 * @param props.disabled - Si el elemento está deshabilitado
 * @param props.onSelect - Función llamada cuando se selecciona el elemento
 */
const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

/**
 * Componente MenubarCheckboxItem
 * Elemento de casilla de verificación del menú que puede estar marcado o desmarcado.
 * 
 * @param props - Propiedades del componente MenubarCheckboxItem de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.checked - Si el elemento está marcado
 * @param props.onCheckedChange - Función llamada cuando cambia el estado
 * @param props.children - Contenido del elemento
 * @param props.disabled - Si el elemento está deshabilitado
 */
const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

/**
 * Componente MenubarRadioItem
 * Elemento de radio del menú que puede ser seleccionado.
 * 
 * @param props - Propiedades del componente MenubarRadioItem de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.children - Contenido del elemento
 * @param props.value - Valor del elemento de radio
 * @param props.disabled - Si el elemento está deshabilitado
 */
const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

/**
 * Componente MenubarLabel
 * Etiqueta descriptiva para un grupo de elementos del menú.
 * 
 * @param props - Propiedades del componente MenubarLabel de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.inset - Si el elemento debe tener sangría
 * @param props.children - Contenido de la etiqueta
 */
const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

/**
 * Componente MenubarSeparator
 * Línea divisoria entre elementos del menú.
 * 
 * @param props - Propiedades del componente MenubarSeparator de Radix UI
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 */
const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

/**
 * Componente MenubarShortcut
 * Atajo de teclado para un elemento del menú.
 * 
 * @param props - Propiedades HTML estándar de span
 * @param props.className - Clases CSS adicionales para personalizar el estilo
 * @param props.children - Contenido del atajo
 */
const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayName = "MenubarShortcut"

export {
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarRadioGroup,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
