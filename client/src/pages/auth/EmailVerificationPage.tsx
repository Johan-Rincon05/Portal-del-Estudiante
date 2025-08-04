import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Clock,
  Shield,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmailVerificationPage() {
  const [, setLocation] = useLocation();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [step, setStep] = useState<'code' | 'success' | 'error'>('code');
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');

  // Obtener email de los parámetros de URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  // Countdown para reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
          setLocation('/home');
        }, 3000);
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
        setCountdown(60); // 60 segundos de espera
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verificar tu Email</CardTitle>
            <CardDescription>
              Completa la verificación para acceder a tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'code' && (
              <>
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Hemos enviado un código de verificación a{' '}
                    <strong className="text-primary">{email}</strong>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verification-code" className="text-sm font-medium">
                      Código de Verificación
                    </Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="Ingresa el código de 6 dígitos"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      onKeyPress={handleKeyPress}
                      maxLength={6}
                      className="text-center text-xl font-mono tracking-widest h-12"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={handleVerifyEmail} 
                      disabled={isVerifying || !verificationCode.trim()}
                      className="w-full h-12"
                      size="lg"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          Verificar Email
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={handleResendCode}
                      disabled={isResending || countdown > 0}
                      className="w-full h-12"
                      size="lg"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Reenviando...
                        </>
                      ) : countdown > 0 ? (
                        <>
                          <Clock className="mr-2 h-5 w-5" />
                          Reenviar en {formatTime(countdown)}
                        </>
                      ) : (
                        'Reenviar Código'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Tu información está protegida</span>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground space-y-1">
                    <p>¿No recibiste el código?</p>
                    <p>Revisa tu carpeta de spam o solicita un nuevo código</p>
                  </div>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-green-600">
                    ¡Email Verificado!
                  </h3>
                  <p className="text-muted-foreground">
                    Tu cuenta ha sido verificada exitosamente. Serás redirigido automáticamente.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-sm">
                    Cuenta Verificada
                  </Badge>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-red-600">
                    Error de Verificación
                  </h3>
                  <p className="text-muted-foreground">
                    El código ingresado no es válido. Intenta nuevamente.
                  </p>
                </div>
                <Button 
                  onClick={() => setStep('code')} 
                  className="w-full h-12"
                  size="lg"
                >
                  Intentar Nuevamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/auth')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Volver al inicio de sesión
          </Button>
        </div>
      </div>
    </div>
  );
} 