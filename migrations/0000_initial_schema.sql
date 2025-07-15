-- Migración inicial consolidada del Portal del Estudiante
-- Esta migración crea todas las tablas base necesarias para el sistema
-- Fecha: 2025-01-XX

-- Crear enums necesarios
CREATE TYPE enrollment_stage AS ENUM (
  'suscrito',
  'documentos_completos', 
  'registro_validado',
  'proceso_universitario',
  'matriculado',
  'inicio_clases',
  'estudiante_activo',
  'pagos_al_dia',
  'proceso_finalizado'
);

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

CREATE TYPE document_status AS ENUM (
  'pendiente',
  'aprobado',
  'rechazado',
  'en_revision'
);

CREATE TYPE request_type AS ENUM (
  'financiera',
  'academica', 
  'documental_administrativa',
  'datos_estudiante_administrativa'
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'estudiante',
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  permissions JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de universidades
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de programas
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  university_id INTEGER NOT NULL REFERENCES universities(id),
  name TEXT NOT NULL,
  is_convention BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  document_type TEXT,
  document_number TEXT,
  birth_date TIMESTAMP,
  birth_place TEXT,
  personal_email TEXT,
  icfes_ac TEXT,
  phone VARCHAR(20),
  city TEXT,
  address TEXT,
  neighborhood TEXT,
  locality TEXT,
  social_stratum TEXT,
  blood_type TEXT,
  conflict_victim BOOLEAN,
  marital_status TEXT,
  enrollment_stage enrollment_stage NOT NULL DEFAULT 'suscrito',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de datos universitarios
CREATE TABLE IF NOT EXISTS university_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id INTEGER NOT NULL REFERENCES universities(id),
  program_id INTEGER NOT NULL REFERENCES programs(id),
  academic_period TEXT,
  study_duration TEXT,
  methodology TEXT,
  degree_title TEXT,
  subscription_type TEXT,
  application_method TEXT,
  severance_payment_used BOOLEAN
);

-- Tabla de cuotas
CREATE TABLE IF NOT EXISTS installments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC(10,2),
  support TEXT,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagada', 'vencida', 'parcial')),
  due_date DATE,
  paid_amount NUMERIC(10,2) DEFAULT 0,
  payment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_date TIMESTAMP,
  payment_method TEXT,
  amount NUMERIC(10,2),
  gift_received BOOLEAN,
  documents_status TEXT,
  installment_id INTEGER REFERENCES installments(id)
);

-- Tabla de observaciones de cuotas
CREATE TABLE IF NOT EXISTS installment_observations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  observation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  status document_status NOT NULL DEFAULT 'pendiente',
  rejection_reason TEXT,
  observations TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de solicitudes
CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type request_type NOT NULL DEFAULT 'academica',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente',
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  responded_at TIMESTAMP,
  responded_by INTEGER REFERENCES users(id)
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de etapas de matrícula
CREATE TABLE IF NOT EXISTS enrollment_stage_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  previous_stage enrollment_stage NOT NULL,
  new_stage enrollment_stage NOT NULL,
  changed_by INTEGER NOT NULL REFERENCES users(id),
  comments TEXT,
  validation_status TEXT NOT NULL DEFAULT 'approved',
  validation_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_document_number ON profiles(document_number);

CREATE INDEX IF NOT EXISTS idx_university_data_user_id ON university_data(user_id);
CREATE INDEX IF NOT EXISTS idx_university_data_university_id ON university_data(university_id);
CREATE INDEX IF NOT EXISTS idx_university_data_program_id ON university_data(program_id);

CREATE INDEX IF NOT EXISTS idx_installments_user_id ON installments(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_installment_number ON installments(installment_number);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_user_status ON installments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_installment_id ON payments(installment_id);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON documents(type, status);

CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_enrollment_stage_history_user_id ON enrollment_stage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_stage_history_changed_by ON enrollment_stage_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_enrollment_stage_history_created_at ON enrollment_stage_history(created_at);
CREATE INDEX IF NOT EXISTS idx_enrollment_stage_history_user_created ON enrollment_stage_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_programs_university_id ON programs(university_id);
CREATE INDEX IF NOT EXISTS idx_programs_is_convention ON programs(is_convention);

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE profiles IS 'Información personal detallada de los usuarios';
COMMENT ON TABLE documents IS 'Documentos subidos por los estudiantes';
COMMENT ON TABLE requests IS 'Solicitudes creadas por los estudiantes';
COMMENT ON TABLE notifications IS 'Notificaciones del sistema para los usuarios';
COMMENT ON TABLE payments IS 'Registro de pagos realizados por los estudiantes';
COMMENT ON TABLE installments IS 'Cuotas del plan de pagos de los estudiantes';
COMMENT ON TABLE enrollment_stage_history IS 'Historial de cambios de etapas de matrícula'; 