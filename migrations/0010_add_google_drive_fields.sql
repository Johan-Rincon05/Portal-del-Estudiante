-- Migración para agregar campos de Google Drive a la tabla documents
-- Fecha: 2024-01-XX

-- Agregar campos para Google Drive
ALTER TABLE documents 
ADD COLUMN drive_file_id TEXT,
ADD COLUMN drive_web_view_link TEXT;

-- Crear índice para búsquedas por ID de archivo de Google Drive
CREATE INDEX idx_documents_drive_file_id ON documents(drive_file_id);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN documents.drive_file_id IS 'ID del archivo en Google Drive';
COMMENT ON COLUMN documents.drive_web_view_link IS 'Enlace de visualización del archivo en Google Drive'; 