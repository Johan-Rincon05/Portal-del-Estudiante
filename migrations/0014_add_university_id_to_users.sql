-- Migración 0014: Agregar university_id a la tabla users
-- Fecha: 2025-01-XX
-- Descripción: Agrega campo university_id para instituciones educativas
-- Autor: Sistema de Mejoras BD

-- Agregar columna university_id a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS university_id INTEGER REFERENCES universities(id);

-- Crear índice para mejorar el rendimiento de consultas por universidad
CREATE INDEX IF NOT EXISTS idx_users_university_id ON users(university_id);

-- Crear índice compuesto para consultas por aliado y universidad
CREATE INDEX IF NOT EXISTS idx_users_ally_university ON users(ally_id, university_id); 