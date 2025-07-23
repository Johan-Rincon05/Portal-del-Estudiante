-- Migración segura para actualizar roles según los nuevos requerimientos
-- Solo actualiza roles, no modifica estructura de tablas existentes

-- Actualizar rol aliado_administrativo a aliado_comercial
UPDATE users SET role = 'aliado_comercial' WHERE role = 'aliado_administrativo';

-- Actualizar rol admin a SuperAdministrativos
UPDATE users SET role = 'SuperAdministrativos' WHERE role = 'admin';

-- Actualizar la tabla de roles si existe
UPDATE roles SET name = 'aliado_comercial', description = 'Aliado comercial del sistema' WHERE name = 'aliado_administrativo';
UPDATE roles SET name = 'SuperAdministrativos', description = 'Super Administrador del sistema' WHERE name = 'admin';

-- Agregar permisos de solicitudes a institucion_educativa
UPDATE roles 
SET permissions = permissions || '{"request:read": true}'::jsonb
WHERE name = 'institucion_educativa';

-- Actualizar usuarios con rol institucion_educativa para incluir el nuevo permiso
UPDATE users 
SET permissions = permissions || '{"request:read": true}'::jsonb
WHERE role = 'institucion_educativa';

-- Log de la migración
INSERT INTO migration_log (migration_name, applied_at, description) 
VALUES ('0016_safe_roles_update', NOW(), 'Actualización segura de roles: aliado_administrativo -> aliado_comercial, admin -> SuperAdministrativos, agregado permiso request:read a institucion_educativa'); 