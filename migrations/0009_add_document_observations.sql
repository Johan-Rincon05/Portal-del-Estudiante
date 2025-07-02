-- Agregar campo de observaciones a la tabla de documentos
-- Esta migración permite que los estudiantes agreguen observaciones al subir documentos

ALTER TABLE documents 
ADD COLUMN observations TEXT;

-- Comentario para documentar el nuevo campo
COMMENT ON COLUMN documents.observations IS 'Observaciones opcionales del estudiante al subir el documento'; 