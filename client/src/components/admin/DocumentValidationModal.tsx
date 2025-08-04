import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface DocumentValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (status: 'aprobado' | 'rechazado', rejectionReason?: string) => void;
  isLoading: boolean;
}

export function DocumentValidationModal({ isOpen, onClose, onValidate, isLoading }: DocumentValidationModalProps) {
  const [status, setStatus] = useState<'aprobado' | 'rechazado'>('aprobado');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = () => {
    onValidate(status, status === 'rechazado' ? rejectionReason : undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validar Documento</DialogTitle>
          <DialogDescription>
            {status === 'aprobado' 
              ? 'Confirma que el documento cumple con los requisitos.'
              : 'Indica el motivo por el cual el documento no cumple con los requisitos.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={status === 'aprobado' ? 'default' : 'outline'}
              onClick={() => setStatus('aprobado')}
              className="flex-1"
            >
              Aprobar
            </Button>
            <Button
              type="button"
              variant={status === 'rechazado' ? 'default' : 'outline'}
              onClick={() => setStatus('rechazado')}
              className="flex-1"
            >
              Rechazar
            </Button>
          </div>

          {status === 'rechazado' && (
            <Textarea
              placeholder="Escribe el motivo del rechazo..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (status === 'rechazado' && !rejectionReason.trim())}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}