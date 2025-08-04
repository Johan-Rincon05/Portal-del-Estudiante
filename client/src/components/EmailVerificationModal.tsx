import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerificationSuccess: () => void;
}

export function EmailVerificationModal({ 
  isOpen, 
  onClose, 
  email, 
  onVerificationSuccess 
}: EmailVerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [step, setStep] = useState<'code' | 'success' | 'error'>('code');
  const { user } = useAuth();

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      toast.error('Por favor ingresa el código de verificación');
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: Implementar llamada a la API
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      if (response.ok) {
        setStep('success');
        toast.success('¡Email verificado exitosamente!');
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Código de verificación inválido');
        setStep('error');
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
      toast.error('Error al verificar el email. Intenta nuevamente.');
      setStep('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // TODO: Implementar llamada a la API
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Código de verificación reenviado');
        setStep('code');
        setVerificationCode('');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al reenviar el código');
      }
    } catch (error) {
      console.error('Error al reenviar código:', error);
      toast.error('Error al reenviar el código. Intenta nuevamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerifyEmail();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Verificar tu Email
          </DialogTitle>
        </DialogHeader>

        {step === 'code' && (
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Hemos enviado un código de verificación a <strong>{email}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Código de Verificación</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Ingresa el código de 6 dígitos"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleVerifyEmail} 
                disabled={isVerifying || !verificationCode.trim()}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar Email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={handleResendCode}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  'Reenviar Código'
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>¿No recibiste el código?</p>
              <p>Revisa tu carpeta de spam o solicita un nuevo código</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">
                ¡Email Verificado!
              </h3>
              <p className="text-muted-foreground">
                Tu cuenta ha sido verificada exitosamente. Serás redirigido automáticamente.
              </p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">
                Error de Verificación
              </h3>
              <p className="text-muted-foreground">
                El código ingresado no es válido. Intenta nuevamente.
              </p>
            </div>
            <Button onClick={() => setStep('code')} className="w-full">
              Intentar Nuevamente
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 