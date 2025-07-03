-- Script para crear datos de ejemplo para el Portal del Estudiante
-- Este script agrega perfiles, documentos y pagos de ejemplo

-- Insertar perfiles de ejemplo para los usuarios existentes
INSERT INTO profiles (user_id, full_name, email, document_type, document_number, birth_date, birth_place, personal_email, icfes_ac, phone, city, address, neighborhood, locality, social_stratum, blood_type, conflict_victim, marital_status, created_at, enrollment_stage) VALUES
(10, 'Juan Carlos Pérez González', 'estudiante1@example.com', 'CC', '1234567890', '2000-05-15', 'Bogotá', 'juan.perez@email.com', 'A123456789', '3001234567', 'Bogotá', 'Calle 123 #45-67', 'Chapinero', 'Chapinero', 3, 'O+', false, 'Soltero', NOW(), 'documentacion_completa'),
(9, 'María Alejandra Rodríguez', 'admin1@example.com', 'CC', '9876543210', '1985-03-20', 'Medellín', 'maria.rodriguez@email.com', 'B987654321', '3009876543', 'Medellín', 'Carrera 78 #90-12', 'El Poblado', 'El Poblado', 4, 'A+', false, 'Casado', NOW(), 'documentacion_completa'),
(8, 'Carlos Eduardo Silva', 'superuser1@example.com', 'CC', '1122334455', '1980-08-10', 'Cali', 'carlos.silva@email.com', 'C112233445', '3001122334', 'Cali', 'Avenida 4N #5-67', 'Granada', 'Granada', 5, 'B+', false, 'Casado', NOW(), 'documentacion_completa');

-- Insertar más usuarios estudiantes de ejemplo
INSERT INTO users (username, password, role, email, is_active, permissions, created_at, updated_at) VALUES
('estudiante2', '$2b$10$.RVBwcMc4JUpcvKCe64lTuaeNCxea3w630rT7yi/9Y5yxGjhh3UCq', 'estudiante', 'estudiante2@example.com', true, '{"document:read": true}', NOW(), NOW()),
('estudiante3', '$2b$10$.RVBwcMc4JUpcvKCe64lTuaeNCxea3w630rT7yi/9Y5yxGjhh3UCq', 'estudiante', 'estudiante3@example.com', true, '{"document:read": true}', NOW(), NOW()),
('estudiante4', '$2b$10$.RVBwcMc4JUpcvKCe64lTuaeNCxea3w630rT7yi/9Y5yxGjhh3UCq', 'estudiante', 'estudiante4@example.com', true, '{"document:read": true}', NOW(), NOW()),
('estudiante5', '$2b$10$.RVBwcMc4JUpcvKCe64lTuaeNCxea3w630rT7yi/9Y5yxGjhh3UCq', 'estudiante', 'estudiante5@example.com', true, '{"document:read": true}', NOW(), NOW());

-- Insertar perfiles para los nuevos estudiantes
INSERT INTO profiles (user_id, full_name, email, document_type, document_number, birth_date, birth_place, personal_email, icfes_ac, phone, city, address, neighborhood, locality, social_stratum, blood_type, conflict_victim, marital_status, created_at, enrollment_stage) VALUES
(11, 'Ana Sofía Martínez López', 'estudiante2@example.com', 'CC', '2345678901', '2001-07-22', 'Barranquilla', 'ana.martinez@email.com', 'D234567890', '3002345678', 'Barranquilla', 'Calle 45 #67-89', 'Riomar', 'Riomar', 4, 'AB+', false, 'Soltero', NOW(), 'documentacion_pendiente'),
(12, 'Luis Fernando Herrera', 'estudiante3@example.com', 'CC', '3456789012', '1999-11-08', 'Cartagena', 'luis.herrera@email.com', 'E345678901', '3003456789', 'Cartagena', 'Carrera 12 #34-56', 'Getsemaní', 'Getsemaní', 3, 'O-', false, 'Soltero', NOW(), 'matricula_completa'),
(13, 'Valentina Ramírez Castro', 'estudiante4@example.com', 'CC', '4567890123', '2002-02-14', 'Bucaramanga', 'valentina.ramirez@email.com', 'F456789012', '3004567890', 'Bucaramanga', 'Avenida 7 #89-12', 'Cabecera', 'Cabecera', 5, 'A-', false, 'Soltero', NOW(), 'documentacion_completa'),
(14, 'Diego Alejandro Torres', 'estudiante5@example.com', 'CC', '5678901234', '2000-09-30', 'Pereira', 'diego.torres@email.com', 'G567890123', '3005678901', 'Pereira', 'Calle 90 #12-34', 'Centro', 'Centro', 2, 'B-', false, 'Soltero', NOW(), 'documentacion_pendiente');

-- Insertar documentos de ejemplo
INSERT INTO documents (user_id, type, name, path, uploaded_at, status, rejection_reason, reviewed_by, reviewed_at) VALUES
(10, 'cedula', 'Cédula de Ciudadanía - Juan Pérez.pdf', 'cedula_juan_perez.pdf', NOW() - INTERVAL '5 days', 'aprobado', NULL, 9, NOW() - INTERVAL '3 days'),
(10, 'diploma', 'Diploma de Bachiller - Juan Pérez.pdf', 'diploma_juan_perez.pdf', NOW() - INTERVAL '4 days', 'aprobado', NULL, 9, NOW() - INTERVAL '2 days'),
(10, 'acta', 'Acta de Grado - Juan Pérez.pdf', 'acta_juan_perez.pdf', NOW() - INTERVAL '3 days', 'pendiente', NULL, NULL, NULL),
(11, 'cedula', 'Cédula de Ciudadanía - Ana Martínez.pdf', 'cedula_ana_martinez.pdf', NOW() - INTERVAL '6 days', 'aprobado', NULL, 9, NOW() - INTERVAL '4 days'),
(11, 'diploma', 'Diploma de Bachiller - Ana Martínez.pdf', 'diploma_ana_martinez.pdf', NOW() - INTERVAL '5 days', 'rechazado', 'Documento ilegible, favor escanear nuevamente', 9, NOW() - INTERVAL '3 days'),
(12, 'cedula', 'Cédula de Ciudadanía - Luis Herrera.pdf', 'cedula_luis_herrera.pdf', NOW() - INTERVAL '7 days', 'aprobado', NULL, 9, NOW() - INTERVAL '5 days'),
(12, 'diploma', 'Diploma de Bachiller - Luis Herrera.pdf', 'diploma_luis_herrera.pdf', NOW() - INTERVAL '6 days', 'aprobado', NULL, 9, NOW() - INTERVAL '4 days'),
(12, 'acta', 'Acta de Grado - Luis Herrera.pdf', 'acta_luis_herrera.pdf', NOW() - INTERVAL '5 days', 'aprobado', NULL, 9, NOW() - INTERVAL '3 days'),
(13, 'cedula', 'Cédula de Ciudadanía - Valentina Ramírez.pdf', 'cedula_valentina_ramirez.pdf', NOW() - INTERVAL '8 days', 'aprobado', NULL, 9, NOW() - INTERVAL '6 days'),
(13, 'diploma', 'Diploma de Bachiller - Valentina Ramírez.pdf', 'diploma_valentina_ramirez.pdf', NOW() - INTERVAL '7 days', 'pendiente', NULL, NULL, NULL),
(14, 'cedula', 'Cédula de Ciudadanía - Diego Torres.pdf', 'cedula_diego_torres.pdf', NOW() - INTERVAL '9 days', 'pendiente', NULL, NULL, NULL);

-- Insertar pagos de ejemplo
INSERT INTO payments (user_id, payment_date, payment_method, amount, gift_received, documents_status) VALUES
(10, NOW() - INTERVAL '10 days', 'transferencia', 1500000, false, 'Pago de matrícula'),
(10, NOW() - INTERVAL '5 days', 'efectivo', 500000, false, 'Pago de cuota'),
(11, NOW() - INTERVAL '12 days', 'tarjeta', 1200000, false, 'Pago de matrícula'),
(11, NOW() - INTERVAL '7 days', 'transferencia', 400000, false, 'Pago de cuota'),
(12, NOW() - INTERVAL '15 days', 'efectivo', 1800000, false, 'Pago de matrícula'),
(12, NOW() - INTERVAL '10 days', 'tarjeta', 600000, false, 'Pago de cuota'),
(13, NOW() - INTERVAL '18 days', 'transferencia', 2000000, false, 'Pago de matrícula'),
(13, NOW() - INTERVAL '13 days', 'efectivo', 700000, false, 'Pago de cuota'),
(14, NOW() - INTERVAL '20 days', 'tarjeta', 1600000, false, 'Pago de matrícula');

-- Insertar solicitudes de ejemplo
INSERT INTO requests (user_id, subject, message, status, response, created_at, updated_at, responded_at, responded_by) VALUES
(10, 'Consulta sobre horarios', 'Buenos días, quisiera consultar los horarios disponibles para el programa de Sistemas Informáticos.', 'pendiente', NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NULL, NULL),
(11, 'Solicitud de certificado', 'Necesito un certificado de matrícula para trámites bancarios.', 'en_proceso', 'Su solicitud está siendo procesada, el certificado estará listo en 2 días hábiles.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 9),
(12, 'Cambio de programa', 'Me gustaría cambiar del programa de Administración al de Ingeniería de Sistemas.', 'pendiente', NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NULL, NULL),
(13, 'Problema con documentos', 'He subido mis documentos pero no aparecen como recibidos en el sistema.', 'resuelto', 'Hemos verificado y sus documentos han sido recibidos correctamente. El estado se actualizará pronto.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 9),
(14, 'Información sobre becas', '¿Hay algún programa de becas disponible para estudiantes de bajos recursos?', 'pendiente', NULL, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NULL, NULL);

-- Actualizar las secuencias
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('profiles_id_seq', (SELECT MAX(id) FROM profiles));
SELECT setval('documents_id_seq', (SELECT MAX(id) FROM documents));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('requests_id_seq', (SELECT MAX(id) FROM requests)); 