-- Crear tabla temporal para almacenar los datos existentes
CREATE TABLE temp_university_data AS 
SELECT * FROM university_data;

-- Eliminar la tabla original
DROP TABLE university_data;

-- Crear la nueva tabla university_data con las relaciones correctas
CREATE TABLE university_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
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

-- Migrar los datos existentes
INSERT INTO university_data (
    user_id,
    university_id,
    program_id,
    academic_period,
    study_duration,
    methodology,
    degree_title,
    subscription_type,
    application_method,
    severance_payment_used
)
SELECT 
    t.user_id,
    u.id as university_id,
    p.id as program_id,
    t.academic_period,
    t.study_duration,
    t.methodology,
    t.degree_title,
    t.subscription_type,
    t.application_method,
    t.severance_payment_used
FROM temp_university_data t
JOIN universities u ON u.name = t.university_name
JOIN programs p ON p.university_id = u.id AND p.name = t.academic_program;

-- Eliminar la tabla temporal
DROP TABLE temp_university_data; 