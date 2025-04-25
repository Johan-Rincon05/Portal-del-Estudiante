-- Crear tabla de universidades
CREATE TABLE universities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Crear tabla de programas
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    university_id INTEGER NOT NULL REFERENCES universities(id),
    name TEXT NOT NULL,
    is_convention BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- Insertar universidades
INSERT INTO universities (name) VALUES
    ('San Camilo'),
    ('INCCA'),
    ('FIT'),
    ('Corporación Universitaria Americana'),
    ('Corporación Universitaria CENDA');

-- Insertar programas de San Camilo
INSERT INTO programs (university_id, name, is_convention) VALUES
    (1, 'Atención a la Primera Infancia', true),
    (1, 'Auxiliar Contable y Financiero', false),
    (1, 'Recursos Humanos', false),
    (1, 'Mantenimiento de Computadores', false),
    (1, 'Animación, Recreación y Deportes', true),
    (1, 'Trabajo Social y Comunitario', true),
    (1, 'Sistemas Informáticos y Software', true),
    (1, 'Comercio Exterior', true);

-- Insertar programas de INCCA
INSERT INTO programs (university_id, name, is_convention) VALUES
    (2, 'Administración de Empresas', false),
    (2, 'Biología', false),
    (2, 'Cultura Física y Deporte', false),
    (2, 'Derecho', false),
    (2, 'Ingeniería de Alimentos', false),
    (2, 'Ingeniería de Sistemas', false),
    (2, 'Ingeniería Electrónica', false),
    (2, 'Ingeniería Industrial', false),
    (2, 'Ingeniería Mecánica', false),
    (2, 'Licenciatura en Educación Infantil', false),
    (2, 'Licenciatura en Español e Inglés', false);

-- Insertar programas de FIT
INSERT INTO programs (university_id, name, is_convention) VALUES
    (3, 'Mecánica Automotriz', false),
    (3, 'Mecánica de Motos', false),
    (3, 'Administrativos Empresariales', false),
    (3, 'Seguridad y Salud en el Trabajo', false),
    (3, 'Manejo Ambiental', false),
    (3, 'Procesos Judiciales', false),
    (3, 'Avalúos Inmobiliarios Urbanos y Rurales', false),
    (3, 'Administrativos en Salud', false);

-- Insertar programas de Corporación Universitaria Americana
INSERT INTO programs (university_id, name, is_convention) VALUES
    (4, 'Contaduría Pública', false),
    (4, 'Administración de Empresas', false),
    (4, 'Administración Turística y Hotelera', false),
    (4, 'Ingeniería Industrial', false),
    (4, 'Derecho', false),
    (4, 'Ingeniería de Sistemas', false),
    (4, 'Licenciatura en Educación Infantil', false),
    (4, 'Negocios Internacionales', false),
    (4, 'Psicología', false),
    (4, 'Comunicaciones y Marketing', false),
    (4, 'Administración Pública', false),
    (4, 'Derecho Penal', false),
    (4, 'Derecho Administrativo', false),
    (4, 'Gerencia de Proyectos', false),
    (4, 'Maestría en Administración (MBA)', false);

-- Insertar programas de Corporación Universitaria CENDA
INSERT INTO programs (university_id, name, is_convention) VALUES
    (5, 'Licenciatura en Educación Física, Recreación y Deportes', false),
    (5, 'Ingeniería Administrativa', false),
    (5, 'Marketing y Negocios Internacionales', false),
    (5, 'Trabajo Social', false); 