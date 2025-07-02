-- Migración 0007: Mejorar relación entre pagos y cuotas
-- Fecha: 2025-01-27
-- Descripción: Agrega relación directa entre pagos y cuotas específicas, y mejora el tracking de estados
-- Autor: Sistema de Mejoras BD

-- Paso 1: Agregar campo installment_id a payments para relacionar con cuotas específicas
ALTER TABLE payments 
ADD COLUMN installment_id INTEGER REFERENCES installments(id);

-- Paso 2: Agregar campos de estado y tracking a installments
ALTER TABLE installments 
ADD COLUMN status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagada', 'vencida', 'parcial')),
ADD COLUMN due_date DATE,
ADD COLUMN paid_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN payment_date DATE;

-- Paso 3: Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_payments_installment_id ON payments(installment_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_user_status ON installments(user_id, status);

-- Paso 4: Crear función para actualizar automáticamente el estado de las cuotas
CREATE OR REPLACE FUNCTION update_installment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se paga el monto completo, marcar como pagada
    IF NEW.paid_amount >= NEW.amount THEN
        NEW.status = 'pagada';
        NEW.payment_date = CURRENT_DATE;
    -- Si se paga parcialmente
    ELSIF NEW.paid_amount > 0 THEN
        NEW.status = 'parcial';
    -- Si está vencida y aún pendiente
    ELSIF NEW.due_date < CURRENT_DATE AND NEW.status = 'pendiente' THEN
        NEW.status = 'vencida';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 5: Crear trigger para actualizar estados automáticamente
CREATE TRIGGER trigger_update_installment_status
    BEFORE UPDATE ON installments
    FOR EACH ROW
    EXECUTE FUNCTION update_installment_status();

-- Paso 6: Agregar comentarios para documentación
COMMENT ON COLUMN payments.installment_id IS 'ID de la cuota específica a la que corresponde este pago';
COMMENT ON COLUMN installments.status IS 'Estado de la cuota: pendiente, pagada, vencida, parcial';
COMMENT ON COLUMN installments.due_date IS 'Fecha de vencimiento de la cuota';
COMMENT ON COLUMN installments.paid_amount IS 'Monto pagado de la cuota';
COMMENT ON COLUMN installments.payment_date IS 'Fecha en que se pagó la cuota';

-- Paso 7: Crear vista para facilitar consultas de pagos con información de cuotas
CREATE OR REPLACE VIEW payment_installment_summary AS
SELECT 
    p.id as payment_id,
    p.user_id,
    p.payment_date,
    p.payment_method,
    p.amount as payment_amount,
    p.installment_id,
    i.installment_number,
    i.amount as installment_amount,
    i.status as installment_status,
    i.due_date,
    i.paid_amount,
    CASE 
        WHEN p.installment_id IS NOT NULL THEN 'Cuota específica'
        ELSE 'Pago general'
    END as payment_type
FROM payments p
LEFT JOIN installments i ON p.installment_id = i.id
ORDER BY p.payment_date DESC;

COMMENT ON VIEW payment_installment_summary IS 'Vista que combina información de pagos y cuotas para facilitar consultas'; 