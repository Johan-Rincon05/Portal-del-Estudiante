-- Migración para alinear IDs de perfiles con IDs de usuarios
-- Esto evita problemas de búsqueda y hace el sistema más consistente

-- Primero, actualizar los perfiles existentes para que tengan el mismo ID que su user_id
UPDATE profiles 
SET id = user_id 
WHERE id != user_id;

-- Crear una secuencia personalizada para la tabla profiles que use el mismo ID que users
-- Esto asegura que futuros perfiles tengan el mismo ID que su usuario correspondiente

-- Crear función para sincronizar IDs
CREATE OR REPLACE FUNCTION sync_profile_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el perfil se está creando, usar el user_id como id
    IF TG_OP = 'INSERT' THEN
        NEW.id := NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para aplicar la sincronización automáticamente
DROP TRIGGER IF EXISTS trigger_sync_profile_user_id ON profiles;
CREATE TRIGGER trigger_sync_profile_user_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_user_id();

-- Agregar comentario explicativo
COMMENT ON TABLE profiles IS 'Los IDs de perfiles deben coincidir con los IDs de usuarios para consistencia';
COMMENT ON COLUMN profiles.id IS 'Debe ser igual al user_id para mantener consistencia en el sistema'; 