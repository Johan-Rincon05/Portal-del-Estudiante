-- Migración para crear la tabla de notificaciones
-- Fecha: 2024-01-XX

-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Comentarios para documentar la tabla
COMMENT ON TABLE notifications IS 'Tabla para almacenar notificaciones de usuarios';
COMMENT ON COLUMN notifications.user_id IS 'ID del usuario que recibe la notificación';
COMMENT ON COLUMN notifications.title IS 'Título corto de la notificación';
COMMENT ON COLUMN notifications.body IS 'Contenido completo de la notificación';
COMMENT ON COLUMN notifications.link IS 'URL opcional para redirección';
COMMENT ON COLUMN notifications.is_read IS 'Indica si la notificación ha sido leída';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación: document, request, stage, general';
COMMENT ON COLUMN notifications.created_at IS 'Fecha y hora de creación de la notificación'; 