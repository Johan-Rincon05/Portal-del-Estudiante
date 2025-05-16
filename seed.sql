-- Universidades
INSERT INTO universities (name) VALUES
  ('San Camilo'),
  ('INCCA'),
  ('FIT'),
  ('Corporación Universitaria Americana'),
  ('Corporación Universitaria CENDA');

-- Programas para San Camilo (ID 1)
INSERT INTO programs (university_id, name, is_convention) VALUES
  (1, 'Atención a la Primera Infancia', true),
  (1, 'Auxiliar Contable y Financiero', false),
  (1, 'Recursos Humanos', false),
  (1, 'Mantenimiento de Computadores', false),
  (1, 'Animación, Recreación y Deportes', true),
  (1, 'Trabajo Social y Comunitario', true),
  (1, 'Sistemas Informáticos y Software', true),
  (1, 'Comercio Exterior', true);

-- Programas para INCCA (ID 2)
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

-- Programas para FIT (ID 3)
INSERT INTO programs (university_id, name, is_convention) VALUES
  (3, 'Técnico Laboral en Auxiliar Administrativo', false),
  (3, 'Técnico Laboral en Auxiliar Contable', false),
  (3, 'Técnico Laboral en Sistemas', false),
  (3, 'Técnico Laboral en Recursos Humanos', false);

-- Programas para Corporación Universitaria Americana (ID 4)
INSERT INTO programs (university_id, name, is_convention) VALUES
  (4, 'Derecho', false),
  (4, 'Ingeniería de Sistemas', false),
  (4, 'Psicología', false),
  (4, 'Administración de Empresas', false);

-- Programas para Corporación Universitaria CENDA (ID 5)
INSERT INTO programs (university_id, name, is_convention) VALUES
  (5, 'Licenciatura en Educación Física', false),
  (5, 'Licenciatura en Educación Infantil', false),
  (5, 'Terapia Ocupacional', false);