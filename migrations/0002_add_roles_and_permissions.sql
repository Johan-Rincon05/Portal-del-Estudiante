-- Agregar nuevos campos a la tabla users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    permissions JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles por defecto
INSERT INTO roles (name, description, permissions)
VALUES 
    ('estudiante', 'Usuario estudiante', '{"document:read": true}'::jsonb),
    ('admin', 'Administrador del sistema', '{
        "user:read": true,
        "user:create": true,
        "user:update": true,
        "document:read": true,
        "document:create": true,
        "document:update": true,
        "admin:dashboard": true
    }'::jsonb),
    ('superuser', 'Superusuario con todos los permisos', '{"superuser:all": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Actualizar usuarios existentes para asegurar que tengan un email
UPDATE users
SET email = username || '@example.com'
WHERE email IS NULL;

-- Asegurar que todos los usuarios tengan un rol válido
UPDATE users
SET role = 'estudiante'
WHERE role NOT IN ('estudiante', 'admin', 'superuser');

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active); 