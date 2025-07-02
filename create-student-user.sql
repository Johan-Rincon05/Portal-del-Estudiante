-- Script para crear un usuario estudiante con datos de pagos y cuotas
-- Ejecutar este script en tu base de datos PostgreSQL

-- Insertar usuario estudiante
INSERT INTO users (id, username, email, password, role, is_active, permissions, created_at, updated_at)
VALUES (
    100, 
    'estudiante_demo', 
    'demo@correo.com', 
    '$2b$10$gJwprrMRLuDZhuxEcFp2k.Dncakvgfc/ZKcxKo8XLEgm72YBtsH2K', 
    'estudiante', 
    true, 
    '{}', 
    NOW(), 
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insertar pagos del estudiante
INSERT INTO payments (id, user_id, payment_date, payment_method, amount, gift_received, documents_status)
VALUES
    (100, 100, '2024-06-01 10:00:00', 'tarjeta', 1500000, false, 'Pago de matrícula'),
    (101, 100, '2024-07-01 14:30:00', 'efectivo', 500000, false, 'Pago de cuota'),
    (102, 100, '2024-08-01 09:15:00', 'transferencia', 500000, false, 'Pago de cuota')
ON CONFLICT (id) DO NOTHING;

-- Insertar cuotas del estudiante
INSERT INTO installments (id, user_id, installment_number, amount, support, status, due_date, paid_amount, payment_date, created_at)
VALUES
    (100, 100, 1, 1500000, NULL, 'pagada', '2024-06-01 00:00:00', 1500000, '2024-06-01 10:00:00', '2024-05-01 00:00:00'),
    (101, 100, 2, 500000, NULL, 'pagada', '2024-07-01 00:00:00', 500000, '2024-07-01 14:30:00', '2024-05-01 00:00:00'),
    (102, 100, 3, 500000, NULL, 'pagada', '2024-08-01 00:00:00', 500000, '2024-08-01 09:15:00', '2024-05-01 00:00:00'),
    (103, 100, 4, 500000, NULL, 'pendiente', '2024-09-01 00:00:00', 0, NULL, '2024-05-01 00:00:00'),
    (104, 100, 5, 500000, NULL, 'pendiente', '2024-10-01 00:00:00', 0, NULL, '2024-05-01 00:00:00'),
    (105, 100, 6, 500000, NULL, 'pendiente', '2024-11-01 00:00:00', 0, NULL, '2024-05-01 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Actualizar secuencias
SELECT setval('users_id_seq', GREATEST(100, (SELECT MAX(id) FROM users)), true);
SELECT setval('payments_id_seq', GREATEST(102, (SELECT MAX(id) FROM payments)), true);
SELECT setval('installments_id_seq', GREATEST(105, (SELECT MAX(id) FROM installments)), true);

-- Verificar que se insertaron correctamente
SELECT 'Usuario creado:' as info, username, role FROM users WHERE id = 100;
SELECT 'Pagos creados:' as info, COUNT(*) as total FROM payments WHERE user_id = 100;
SELECT 'Cuotas creadas:' as info, COUNT(*) as total FROM installments WHERE user_id = 100; 