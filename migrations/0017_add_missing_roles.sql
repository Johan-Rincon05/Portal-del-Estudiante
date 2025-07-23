-- Migración para agregar los roles faltantes en la tabla roles
-- Agregar: estudiante, SuperAdministrativos, superuser

-- Agregar rol estudiante
INSERT INTO roles (name, description, permissions, created_at, updated_at) 
VALUES (
  'estudiante',
  'Usuario básico del sistema',
  '{"document:read": true}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Agregar rol SuperAdministrativos
INSERT INTO roles (name, description, permissions, created_at, updated_at) 
VALUES (
  'SuperAdministrativos',
  'Super Administrador del sistema',
  '{"user:read": true, "user:update": true, "document:read": true, "document:update": true, "admin:access": true, "admin:manage_users": true}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Agregar rol superuser
INSERT INTO roles (name, description, permissions, created_at, updated_at) 
VALUES (
  'superuser',
  'Superusuario con acceso total',
  '{"user:create": true, "user:read": true, "user:update": true, "user:delete": true, "document:create": true, "document:read": true, "document:update": true, "document:delete": true, "admin:access": true, "admin:manage_users": true, "admin:manage_roles": true, "superuser:access": true}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Actualizar permisos del rol aliado_comercial para que coincida con el esquema
UPDATE roles 
SET permissions = '{"user:read": true, "user:update": true, "document:read": true, "document:update": true, "admin:access": true, "admin:manage_users": true}'::jsonb,
    updated_at = NOW()
WHERE name = 'aliado_comercial';

-- Verificar que todos los roles estén presentes
SELECT name, description FROM roles ORDER BY name; 