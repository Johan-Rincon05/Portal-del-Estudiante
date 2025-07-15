-- Migración para eliminar campos de Google Drive de la tabla documents
-- Fecha: 2024-01-XX

-- Eliminar campos de Google Drive
ALTER TABLE documents 
DROP COLUMN IF EXISTS drive_file_id,
DROP COLUMN IF EXISTS drive_web_view_link;

-- Eliminar índice de Google Drive si existe
DROP INDEX IF EXISTS idx_documents_drive_file_id;

-- Comentarios para documentar los cambios
COMMENT ON COLUMN documents.path IS 'Ruta del archivo en almacenamiento local'; 