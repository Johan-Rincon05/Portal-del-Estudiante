-- Índices para mejorar el rendimiento de búsquedas comunes

-- Índices para la tabla users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para la tabla profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_document_number ON profiles(document_number);

-- Índices para la tabla university_data
CREATE INDEX IF NOT EXISTS idx_university_data_user_id ON university_data(user_id);
CREATE INDEX IF NOT EXISTS idx_university_data_university_id ON university_data(university_id);
CREATE INDEX IF NOT EXISTS idx_university_data_program_id ON university_data(program_id);

-- Índices para la tabla payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Índices para la tabla installments
CREATE INDEX IF NOT EXISTS idx_installments_user_id ON installments(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_installment_number ON installments(installment_number);

-- Índices para la tabla documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Índices para la tabla requests
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);

-- Índices para la tabla programs
CREATE INDEX IF NOT EXISTS idx_programs_university_id ON programs(university_id);
CREATE INDEX IF NOT EXISTS idx_programs_is_convention ON programs(is_convention); 