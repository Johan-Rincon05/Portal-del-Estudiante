-- Migración 0006: Agregar validaciones de tipos de documentos
-- Fecha: 2025-01-27
-- Descripción: Crea enums para tipos y estados de documentos para mejorar la integridad de datos
-- Autor: Sistema de Mejoras BD

-- Paso 1: Crear enum para tipos de documentos
CREATE TYPE document_type AS ENUM (
    'cedula',
    'diploma', 
    'acta',
    'foto',
    'recibo',
    'formulario',
    'certificado',
    'otro'
);

-- Paso 2: Crear enum para estados de documentos
CREATE TYPE document_status AS ENUM (
    'pendiente',
    'aprobado',
    'rechazado',
    'en_revision'
);

-- Paso 3: Actualizar tabla documents con los nuevos tipos
-- Primero convertir los valores existentes
UPDATE documents 
SET type = CASE 
    WHEN type IN ('cedula', 'diploma', 'acta', 'foto', 'recibo', 'formulario', 'certificado') 
    THEN type 
    ELSE 'otro' 
END;

UPDATE documents 
SET status = CASE 
    WHEN status IN ('pendiente', 'aprobado', 'rechazado') 
    THEN status 
    ELSE 'pendiente' 
END;

-- Paso 4: Cambiar los tipos de columna
ALTER TABLE documents 
ALTER COLUMN type TYPE document_type USING type::document_type;

-- Cambiar el tipo de status y establecer el valor por defecto
ALTER TABLE documents 
ALTER COLUMN status TYPE document_status USING status::document_status,
ALTER COLUMN status SET DEFAULT 'pendiente'::document_status;

-- Paso 5: Agregar comentarios para documentación
COMMENT ON TYPE document_type IS 'Tipos de documentos permitidos en el sistema';
COMMENT ON TYPE document_status IS 'Estados posibles de un documento en el sistema';
COMMENT ON COLUMN documents.type IS 'Tipo de documento: cedula, diploma, acta, foto, recibo, formulario, certificado, otro';
COMMENT ON COLUMN documents.status IS 'Estado del documento: pendiente, aprobado, rechazado, en_revision';

-- Paso 6: Crear índices para mejorar rendimiento en consultas por tipo y estado
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON documents(type, status); 