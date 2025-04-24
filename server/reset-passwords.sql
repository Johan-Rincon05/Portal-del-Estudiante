-- Actualizar contraseña para el usuario estudiante
UPDATE users 
SET password = '$2b$10$8K1p/a0dL1LXMIZoIqPK6.QxX.0X3HX5X5X5X5X5X5X5X5X5X' 
WHERE username = 'estudiante';

-- Actualizar contraseña para el usuario admin
UPDATE users 
SET password = '$2b$10$8K1p/a0dL1LXMIZoIqPK6.QxX.0X3HX5X5X5X5X5X5X5X5X5X' 
WHERE username = 'admin';

-- Actualizar contraseña para el usuario superadmin
UPDATE users 
SET password = '$2b$10$8K1p/a0dL1LXMIZoIqPK6.QxX.0X3HX5X5X5X5X5X5X5X5X5X' 
WHERE username = 'superadmin'; 