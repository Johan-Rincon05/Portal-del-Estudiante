-- Crear tabla de historial de cambios de etapas de matrícula
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_enrollment_stage_history_user_id ON enrollment_stage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_stage_history_changed_by ON enrollment_stage_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_enrollment_stage_history_created_at ON enrollment_stage_history(created_at);

-- Crear índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_enrollment_stage_history_user_created ON enrollment_stage_history(user_id, created_at DESC); 