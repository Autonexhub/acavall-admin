-- Seed initial data for Acavall Harmony

-- Insert default admin user (password: password)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@fundacionacavall.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin'),
('coordinator@fundacionacavall.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Coordinador', 'coordinator');

-- Insert centers
INSERT INTO centers (name, address, responsible, schedule, frequency, color) VALUES
('Centro X (1)', 'Valencia', 'Por asignar', '8:15 - 14:30', 'Lunes y Martes', '#4F9EE9'),
('Centro Y (RyA)', 'Valencia', 'Por asignar', '17:30 - 19:30', 'Miércoles', '#7C3AED'),
('Centro XXX', 'Valencia', 'Por asignar', '10:00 - 11:30', 'Variable', '#10B981'),
('R. Hermanas', 'Valencia', 'Por asignar', '11:00 - 13:00', 'Sábados', '#F59E0B'),
('Nostra Casa', 'Valencia', NULL, 'Por definir', NULL, '#EC4899'),
('Monte Arse', 'Valencia', NULL, 'Por definir', NULL, '#6366F1'),
('Afav Valenc', 'Valencia', NULL, 'Por definir', NULL, '#14B8A6'),
('AmicGos Alfafar', 'Alfafar', NULL, 'Por definir', NULL, '#F97316'),
('AmicGos Burjassot', 'Burjassot', NULL, 'Por definir', NULL, '#8B5CF6'),
('Afav Elaia', 'Valencia', NULL, 'Por definir', NULL, '#06B6D4'),
('Centro Este', 'Valencia', NULL, 'Por definir', NULL, '#EAB308'),
('ASVAPT', 'Valencia', NULL, '16:00 - 18:00', NULL, '#D946EF');

-- Insert therapists
INSERT INTO therapists (name, specialty) VALUES
('Tales', 'Terapia Asistida con Animales'),
('Elia', 'Terapia Asistida con Animales'),
('Raúl', 'Terapia Asistida con Animales'),
('Alba', 'Terapia Asistida con Animales'),
('Ana', 'Terapia Asistida con Animales');

-- Insert therapist-center assignments
INSERT INTO center_therapist (center_id, therapist_id) VALUES
-- Tales
(1, 1), (3, 1), (4, 1), (7, 1), (10, 1), (11, 1),
-- Elia
(6, 2), (7, 2),
-- Raúl
(1, 3), (2, 3), (3, 3), (8, 3), (9, 3), (11, 3),
-- Alba
(2, 4), (9, 4), (12, 4),
-- Ana
(5, 5);

-- Insert programs
INSERT INTO programs (name, color) VALUES
('Programa 1', '#4F9EE9'),
('Programa 2', '#7C3AED'),
('Programa 3', '#10B981');

-- Insert residences
INSERT INTO residences (name, program_id, status, total_sessions, total_days) VALUES
('Residencia 1', 1, 'active', 34, 17),
('Residencia 2', 1, 'active', 36, 18),
('Residencia 3', 2, 'in-progress', 28, 14),
('Residencia 4', 2, 'active', 30, 15);

-- Insert residence session dates
INSERT INTO residence_session_dates (residence_id, month, session_date) VALUES
-- Residencia 1
(1, 'Enero', 8), (1, 'Enero', 15), (1, 'Enero', 29),
(1, 'Febrero', 5), (1, 'Febrero', 12), (1, 'Febrero', 19), (1, 'Febrero', 26),
(1, 'Marzo', 5), (1, 'Marzo', 12), (1, 'Marzo', 26),
(1, 'Abril', 2), (1, 'Abril', 9), (1, 'Abril', 16),
(1, 'Mayo', 7), (1, 'Mayo', 14), (1, 'Mayo', 21), (1, 'Mayo', 28),
-- Residencia 2
(2, 'Enero', 13), (2, 'Enero', 20), (2, 'Enero', 27),
(2, 'Febrero', 3), (2, 'Febrero', 10), (2, 'Febrero', 17), (2, 'Febrero', 24),
(2, 'Marzo', 3), (2, 'Marzo', 10), (2, 'Marzo', 17), (2, 'Marzo', 24), (2, 'Marzo', 31),
(2, 'Abril', 7), (2, 'Abril', 14),
(2, 'Junio', 4), (2, 'Junio', 11), (2, 'Junio', 18), (2, 'Junio', 25);

-- Insert sample sessions
INSERT INTO sessions (center_id, date, start_time, end_time, hours, participants, type) VALUES
(1, '2025-01-01', '08:15', '14:30', 6.25, 12, 'regular'),
(1, '2025-01-06', '08:15', '10:15', 2.00, 8, 'regular'),
(1, '2025-01-08', '08:15', '10:15', 2.00, 8, 'festivo'),
(2, '2025-01-09', '17:30', '19:30', 2.00, 10, 'regular'),
(3, '2025-01-14', '10:00', '11:30', 1.50, 6, 'regular'),
(1, '2025-01-15', '08:15', '12:15', 4.00, 10, 'regular'),
(4, '2025-01-18', '11:00', '13:00', 2.00, 8, 'special');

-- Insert session-therapist assignments
INSERT INTO session_therapist (session_id, therapist_id) VALUES
(1, 1), (1, 3),
(2, 1),
(3, 1),
(4, 4), (4, 3),
(5, 3), (5, 1),
(6, 1),
(7, 1);
