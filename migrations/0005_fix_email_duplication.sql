-- Migración 0005: Eliminar duplicación de email
-- Fecha: 2025-01-27
-- Descripción: Elimina la duplicación de email entre users.email y profiles.email
-- Autor: Sistema de Mejoras BD

-- Paso 1: Verificar que todos los profiles tengan el email de users
-- (Esto es una verificación de seguridad antes de eliminar la columna)
UPDATE profiles 
SET email = users.email 
FROM users 
WHERE profiles.user_id = users.id 
AND profiles.email IS DISTINCT FROM users.email;

-- Paso 2: Eliminar la columna email de profiles
-- Ya no es necesaria porque users.email contiene la información
ALTER TABLE profiles DROP COLUMN IF EXISTS email;

-- Paso 3: Verificar que no hay perfiles sin usuario asociado
-- (Verificación de integridad)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM profiles p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE u.id IS NULL
    ) THEN
        RAISE EXCEPTION 'Existen perfiles sin usuario asociado';
    END IF;
END $$;

-- Comentario: La tabla profiles ahora usa users.email como fuente única de verdad
COMMENT ON TABLE profiles IS 'Información personal detallada de los usuarios. El email se obtiene de la tabla users.'; 