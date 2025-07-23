-- Migración 0013: Expandir roles y agregar tabla de aliados
-- Fecha: 2025-01-XX
-- Descripción: Agrega nuevos roles, tabla de aliados y actualiza tipos de solicitud
-- Autor: Sistema de Mejoras BD

-- Paso 1: Crear tabla de aliados
CREATE TABLE IF NOT EXISTS allies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Paso 2: Agregar columna ally_id a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ally_id INTEGER REFERENCES allies(id);

-- Paso 3: Actualizar tipos de solicitud existentes antes de cambiar el enum
-- Convertir valores antiguos a nuevos valores válidos
UPDATE requests 
SET request_type = CASE 
  WHEN request_type = 'academica' THEN 'documental'
  WHEN request_type = 'documental_administrativa' THEN 'documental'
  WHEN request_type = 'datos_estudiante_administrativa' THEN 'documental'
  WHEN request_type = 'financiera' THEN 'financiera'
  ELSE 'documental' -- valor por defecto para cualquier otro caso
END;

-- Paso 4: Eliminar el enum antiguo y crear el nuevo
DROP TYPE IF EXISTS request_type CASCADE;

-- Crear el nuevo enum con solo los valores válidos
CREATE TYPE request_type AS ENUM (
  'documental',
  'financiera'
);

-- Paso 5: Actualizar la columna para usar el nuevo enum
ALTER TABLE requests 
ALTER COLUMN request_type TYPE request_type USING request_type::request_type,
ALTER COLUMN request_type SET DEFAULT 'documental'::request_type;

-- Paso 6: Insertar roles por defecto para los nuevos tipos
INSERT INTO roles (name, description, permissions)
VALUES 
  ('administrativo', 'Personal administrativo del sistema', '{
    "user:read": true,
    "document:read": true,
    "document:update": true,
    "admin:access": true
  }'::jsonb),
  ('cartera', 'Personal de cartera y finanzas', '{
    "user:read": true,
    "document:read": true,
    "admin:access": true
  }'::jsonb),
  ('aliado_administrativo', 'Aliado administrativo del sistema', '{
    "user:read": true,
    "document:read": true
  }'::jsonb),
  ('institucion_educativa', 'Institución educativa asociada', '{
    "user:read": true,
    "document:read": true
  }'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Paso 7: Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_ally_id ON users(ally_id);
CREATE INDEX IF NOT EXISTS idx_requests_request_type ON requests(request_type);

-- Paso 8: Agregar comentarios para documentación
COMMENT ON TABLE allies IS 'Tabla de aliados del sistema';
COMMENT ON COLUMN users.ally_id IS 'Referencia al aliado asociado al usuario';
COMMENT ON COLUMN requests.request_type IS 'Tipo de solicitud: documental o financiera'; 