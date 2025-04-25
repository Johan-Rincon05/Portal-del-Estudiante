-- Agregar nuevos campos a la tabla profiles
ALTER TABLE profiles
ADD COLUMN neighborhood TEXT,
ADD COLUMN locality TEXT,
ADD COLUMN social_stratum TEXT,
ADD COLUMN blood_type TEXT,
ADD COLUMN conflict_victim BOOLEAN,
ADD COLUMN marital_status TEXT;

-- Crear tabla university_data
CREATE TABLE university_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    university_name TEXT NOT NULL,
    academic_program TEXT NOT NULL,
    academic_period TEXT,
    study_duration TEXT,
    methodology TEXT,
    degree_title TEXT,
    subscription_type TEXT,
    application_method TEXT,
    severance_payment_used BOOLEAN
);

-- Crear tabla payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    payment_date TIMESTAMP,
    payment_method TEXT,
    amount NUMERIC(10, 2),
    gift_received BOOLEAN,
    documents_status TEXT
);

-- Crear tabla installments
CREATE TABLE installments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    installment_number INTEGER CHECK (installment_number BETWEEN 1 AND 4),
    amount NUMERIC(10, 2),
    support TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Crear tabla installment_observations
CREATE TABLE installment_observations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    observation TEXT,
    created_at TIMESTAMP DEFAULT now()
); 