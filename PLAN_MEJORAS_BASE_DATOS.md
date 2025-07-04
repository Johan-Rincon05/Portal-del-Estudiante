# Plan de Mejoras para la Base de Datos - Portal del Estudiante

## Resumen del Plan

Este documento presenta un plan estructurado para mejorar la base de datos del Portal del Estudiante, abordando los problemas identificados y preparando el sistema para el crecimiento futuro.

## Fase 1: Correcciones Críticas (Prioridad Alta)

### 1.1 Eliminar Duplicación de Email
**Problema**: Existe duplicación entre `users.email` y `profiles.email`

**Solución**:
```sql
-- Migración para eliminar duplicación
-- 1. Actualizar profiles.email con datos de users.email
UPDATE profiles 
SET email = users.email 
FROM users 
WHERE profiles.user_id = users.id;

-- 2. Eliminar columna email de profiles
ALTER TABLE profiles DROP COLUMN email;

-- 3. Actualizar esquema de Drizzle
-- En shared/schema.ts, eliminar email de profiles
```

**Archivos a modificar**:
- `shared/schema.ts` - Eliminar campo email de profiles
- `server/storage.ts` - Actualizar funciones que usen profiles.email
- `client/src/` - Actualizar componentes que usen profiles.email

### 1.2 Agregar Validaciones de Tipos de Documentos
**Problema**: No hay validación de tipos de documentos permitidos

**Solución**:
```sql
-- Crear enum para tipos de documentos
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

-- Crear enum para estados de documentos
CREATE TYPE document_status AS ENUM (
    'pendiente',
    'aprobado',
    'rechazado',
    'en_revision'
);

-- Actualizar tabla documents
ALTER TABLE documents 
ALTER COLUMN type TYPE document_type USING type::document_type,
ALTER COLUMN status TYPE document_status USING status::document_status;
```

### 1.3 Relacionar Pagos con Cuotas Específicas
**Problema**: No hay relación directa entre pagos y cuotas

**Solución**:
```sql
-- Agregar campo installment_id a payments
ALTER TABLE payments 
ADD COLUMN installment_id INTEGER REFERENCES installments(id);

-- Agregar campo status a installments
ALTER TABLE installments 
ADD COLUMN status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagada', 'vencida', 'parcial'));

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_payments_installment_id ON payments(installment_id);
CREATE INDEX idx_installments_status ON installments(status);
```

## Fase 2: Mejoras de Rendimiento (Prioridad Media)

### 2.1 Índices Adicionales
```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_profiles_document_number ON profiles(document_number);
CREATE INDEX idx_documents_user_status ON documents(user_id, status);
CREATE INDEX idx_requests_user_status ON requests(user_id, status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_payments_user_date ON payments(user_id, payment_date);
CREATE INDEX idx_university_data_user ON university_data(user_id);

-- Índices compuestos para consultas complejas
CREATE INDEX idx_profiles_enrollment_stage ON profiles(enrollment_stage, created_at);
CREATE INDEX idx_documents_type_status ON documents(type, status, uploaded_at);
```

### 2.2 Optimización de Consultas
```sql
-- View materializada para reportes de estudiantes
CREATE MATERIALIZED VIEW student_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    p.full_name,
    p.enrollment_stage,
    p.document_type,
    p.document_number,
    ud.university_id,
    ud.program_id,
    COUNT(d.id) as total_documents,
    COUNT(CASE WHEN d.status = 'aprobado' THEN 1 END) as approved_documents,
    COUNT(r.id) as total_requests,
    COUNT(CASE WHEN r.status = 'pendiente' THEN 1 END) as pending_requests
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN university_data ud ON u.id = ud.user_id
LEFT JOIN documents d ON u.id = d.user_id
LEFT JOIN requests r ON u.id = r.user_id
WHERE u.role = 'estudiante'
GROUP BY u.id, u.username, u.email, p.full_name, p.enrollment_stage, 
         p.document_type, p.document_number, ud.university_id, ud.program_id;

-- Índice para la view materializada
CREATE INDEX idx_student_summary_enrollment ON student_summary(enrollment_stage);
```

## Fase 3: Mejoras de Funcionalidad (Prioridad Media)

### 3.1 Categorización de Solicitudes
```sql
-- Crear enum para tipos de solicitudes
CREATE TYPE request_type AS ENUM (
    'documento',
    'pago',
    'academico',
    'tecnico',
    'general'
);

-- Crear enum para prioridades
CREATE TYPE request_priority AS ENUM (
    'baja',
    'media',
    'alta',
    'urgente'
);

-- Actualizar tabla requests
ALTER TABLE requests 
ADD COLUMN request_type request_type DEFAULT 'general',
ADD COLUMN priority request_priority DEFAULT 'media',
ADD COLUMN category TEXT;

-- Índices para nuevas columnas
CREATE INDEX idx_requests_type_priority ON requests(request_type, priority);
CREATE INDEX idx_requests_category ON requests(category);
```

### 3.2 Estados de Cuotas Mejorados
```sql
-- Crear enum para estados de cuotas
CREATE TYPE installment_status AS ENUM (
    'pendiente',
    'pagada',
    'vencida',
    'parcial',
    'cancelada'
);

-- Actualizar tabla installments
ALTER TABLE installments 
ALTER COLUMN status TYPE installment_status USING status::installment_status,
ADD COLUMN due_date DATE,
ADD COLUMN paid_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN payment_date DATE;

-- Triggers para actualizar estados automáticamente
CREATE OR REPLACE FUNCTION update_installment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se paga el monto completo, marcar como pagada
    IF NEW.paid_amount >= NEW.amount THEN
        NEW.status = 'pagada';
        NEW.payment_date = CURRENT_DATE;
    -- Si se paga parcialmente
    ELSIF NEW.paid_amount > 0 THEN
        NEW.status = 'parcial';
    -- Si está vencida
    ELSIF NEW.due_date < CURRENT_DATE AND NEW.status = 'pendiente' THEN
        NEW.status = 'vencida';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_installment_status
    BEFORE UPDATE ON installments
    FOR EACH ROW
    EXECUTE FUNCTION update_installment_status();
```

### 3.3 Validaciones Avanzadas
```sql
-- Función para validar email único
CREATE OR REPLACE FUNCTION validate_unique_email()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE email = NEW.email AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'El email ya está registrado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_unique_email
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_unique_email();

-- Función para validar documento único
CREATE OR REPLACE FUNCTION validate_unique_document()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.document_number IS NOT NULL AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE document_number = NEW.document_number 
        AND document_type = NEW.document_type
        AND user_id != NEW.user_id
    ) THEN
        RAISE EXCEPTION 'El documento ya está registrado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_unique_document
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_unique_document();
```

## Fase 4: Mejoras de Mantenimiento (Prioridad Baja)

### 4.1 Documentación de Tablas
```sql
-- Comentarios para tablas principales
COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema con información de autenticación';
COMMENT ON COLUMN users.role IS 'Rol del usuario: estudiante, admin, superuser';
COMMENT ON COLUMN users.permissions IS 'Permisos específicos del usuario en formato JSONB';

COMMENT ON TABLE profiles IS 'Información personal detallada de los usuarios';
COMMENT ON COLUMN profiles.enrollment_stage IS 'Etapa actual del proceso de matrícula del estudiante';
COMMENT ON COLUMN profiles.conflict_victim IS 'Indica si el estudiante es víctima del conflicto armado';

COMMENT ON TABLE documents IS 'Documentos subidos por los estudiantes';
COMMENT ON COLUMN documents.type IS 'Tipo de documento: cedula, diploma, acta, etc.';
COMMENT ON COLUMN documents.status IS 'Estado del documento: pendiente, aprobado, rechazado';

COMMENT ON TABLE enrollment_stage_history IS 'Historial de cambios de etapas de matrícula';
COMMENT ON COLUMN enrollment_stage_history.changed_by IS 'ID del administrador que realizó el cambio';
```

### 4.2 Consistencia de Nombres
```sql
-- Renombrar campos para consistencia (snake_case)
-- Nota: Esto requiere actualizar el código de la aplicación

-- Ejemplo de renombrado
ALTER TABLE profiles RENAME COLUMN full_name TO full_name;
ALTER TABLE profiles RENAME COLUMN document_type TO document_type;
-- ... continuar con otros campos
```

### 4.3 Migraciones Automatizadas
```sql
-- Crear tabla de control de migraciones
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64)
);

-- Insertar migraciones existentes
INSERT INTO schema_migrations (version, name) VALUES
('001', 'add_indexes'),
('002', 'add_roles_and_permissions'),
('003', 'create_notifications'),
('004', 'create_enrollment_stage_history')
ON CONFLICT (version) DO NOTHING;
```

## Cronograma de Implementación

### Semana 1-2: Fase 1 (Correcciones Críticas)
- [ ] Eliminar duplicación de email
- [ ] Agregar validaciones de tipos de documentos
- [ ] Relacionar pagos con cuotas

### Semana 3-4: Fase 2 (Rendimiento)
- [ ] Crear índices adicionales
- [ ] Implementar views materializadas
- [ ] Optimizar consultas frecuentes

### Semana 5-6: Fase 3 (Funcionalidad)
- [ ] Categorización de solicitudes
- [ ] Estados de cuotas mejorados
- [ ] Validaciones avanzadas

### Semana 7-8: Fase 4 (Mantenimiento)
- [ ] Documentación de tablas
- [ ] Consistencia de nombres
- [ ] Sistema de migraciones

## Archivos de Migración a Crear

### migrations/0005_fix_email_duplication.sql
```sql
-- Eliminar duplicación de email
UPDATE profiles 
SET email = users.email 
FROM users 
WHERE profiles.user_id = users.id;

ALTER TABLE profiles DROP COLUMN email;
```

### migrations/0006_add_document_validations.sql
```sql
-- Crear enums para documentos
CREATE TYPE document_type AS ENUM (
    'cedula', 'diploma', 'acta', 'foto', 'recibo', 'formulario', 'certificado', 'otro'
);

CREATE TYPE document_status AS ENUM (
    'pendiente', 'aprobado', 'rechazado', 'en_revision'
);

-- Actualizar tabla documents
ALTER TABLE documents 
ALTER COLUMN type TYPE document_type USING type::document_type,
ALTER COLUMN status TYPE document_status USING status::document_status;
```

### migrations/0007_improve_payments_installments.sql
```sql
-- Mejorar relación pagos-cuotas
ALTER TABLE payments ADD COLUMN installment_id INTEGER REFERENCES installments(id);

ALTER TABLE installments 
ADD COLUMN status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagada', 'vencida', 'parcial')),
ADD COLUMN due_date DATE,
ADD COLUMN paid_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN payment_date DATE;

-- Índices
CREATE INDEX idx_payments_installment_id ON payments(installment_id);
CREATE INDEX idx_installments_status ON installments(status);
```

## Consideraciones de Seguridad

1. **Backup antes de cada migración**
2. **Pruebas en entorno de desarrollo**
3. **Rollback plan para cada cambio**
4. **Validación de integridad de datos**
5. **Monitoreo de rendimiento post-migración**

## Métricas de Éxito

- **Rendimiento**: Reducción del 50% en tiempo de consultas
- **Integridad**: 0% de duplicación de datos
- **Mantenibilidad**: 100% de tablas documentadas
- **Funcionalidad**: 100% de validaciones implementadas

## Conclusión

Este plan de mejoras aborda sistemáticamente los problemas identificados en la base de datos, mejorando la funcionalidad, rendimiento y mantenibilidad del sistema. La implementación gradual permite minimizar el riesgo y mantener la estabilidad del sistema durante las mejoras.
