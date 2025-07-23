-- Agregar columnas faltantes a la tabla documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS size INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP; 