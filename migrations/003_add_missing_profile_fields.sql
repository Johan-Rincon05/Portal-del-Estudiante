-- Agregar campos faltantes a la tabla profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS personal_email TEXT,
ADD COLUMN IF NOT EXISTS icfes_ac TEXT; 