-- Migración para agregar tipos de solicitud
-- Crea el enum para los tipos de solicitud
CREATE TYPE request_type AS ENUM (
  'financiera',
  'academica', 
  'documental_administrativa',
  'datos_estudiante_administrativa'
);

-- Agrega el campo requestType a la tabla requests
ALTER TABLE requests 
ADD COLUMN request_type request_type NOT NULL DEFAULT 'academica';

-- Comentario para documentar el campo
COMMENT ON COLUMN requests.request_type IS 'Tipo de solicitud: financiera, academica, documental_administrativa, datos_estudiante_administrativa'; 