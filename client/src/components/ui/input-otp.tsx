/**
 * Componente InputOTP
 * Este archivo contiene los componentes necesarios para crear campos de entrada de códigos OTP en el Portal del Estudiante,
 * implementados con Radix UI y estilizados con Tailwind CSS.
 */

"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Componente InputOTP
 * Campo de entrada para códigos OTP
 * @param className - Clases CSS adicionales
 * @param containerClassName - Clases CSS para el contenedor
 * @param props - Propiedades del componente OTPInput
 */
const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

/**
 * Componente InputOTPGroup
 * Grupo de campos OTP
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

/**
 * Componente InputOTPSlot
 * Campo individual de OTP
 * @param index - Índice del campo
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const InputOTPSlot = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      className={cn(
        "relative h-10 w-10 text-center [&_input]:absolute [&_input]:left-0 [&_input]:right-0 [&_input]:top-0 [&_input]:bottom-0 [&_input]:h-full [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:bg-transparent [&_input]:text-center [&_input]:text-base [&_input]:transition-colors [&_input]:placeholder:text-muted-foreground [&_input]:focus-visible:outline-none [&_input]:focus-visible:ring-1 [&_input]:focus-visible:ring-ring [&_input]:disabled:cursor-not-allowed [&_input]:disabled:opacity-50",
        isActive && "z-10 ring-1 ring-ring",
        className
      )}
    >
      <input ref={ref} {...props} />
      {char && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
          {char}
        </div>
      )}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center animate-caret-blink">
          <div className="h-4 w-px bg-foreground duration-150" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

/**
 * Componente InputOTPSeparator
 * Separador entre campos OTP
 * @param className - Clases CSS adicionales
 * @param props - Propiedades HTML estándar de div
 */
const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
