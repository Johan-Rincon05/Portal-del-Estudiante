-- Script para actualizar la contraseña del usuario estudiante_demo
-- Ejecutar este script en tu base de datos PostgreSQL

-- Actualizar la contraseña del usuario estudiante_demo a 'demo1234'
UPDATE users 
SET 
    password = '$2b$10$gJwprrMRLuDZhuxEcFp2k.Dncakvgfc/ZKcxKo8XLEgm72YBtsH2K',
    updated_at = NOW()
WHERE username = 'estudiante_demo';

-- Verificar que se actualizó correctamente
SELECT 'Contraseña actualizada para:' as info, username, role FROM users WHERE username = 'estudiante_demo';

-- Mostrar todos los usuarios activos
SELECT 'Usuarios disponibles:' as info;
SELECT id, username, email, role FROM users WHERE is_active = true ORDER BY id; 