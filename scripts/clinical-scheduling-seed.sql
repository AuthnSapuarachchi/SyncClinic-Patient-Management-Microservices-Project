-- Clinical and Scheduling domain seed data.
-- Run with psql against the Docker Postgres container:
--   docker exec -i syncclinic-postgres psql -U postgres -f - < scripts/clinical-scheduling-seed.sql
--
-- This script seeds only the data needed to test doctor and appointment flows:
--   syncclinic_patients: minimal patient dependency rows
--   doctor_service_db: doctors, doctor_availability
--   appointment_service_db: appointments, appointment_status_history

\connect syncclinic_patients

BEGIN;

INSERT INTO patients (
    id,
    first_name,
    last_name,
    email,
    phone,
    date_of_birth,
    blood_group,
    medical_history
) VALUES
    (
        1,
        'Test',
        'Patient One',
        'patient.one@syncclinic.test',
        '+94770000001',
        '1994-02-14',
        'O+',
        'Hypertension history'
    ),
    (
        2,
        'Test',
        'Patient Two',
        'patient.two@syncclinic.test',
        '+94770000002',
        '1988-08-21',
        'A+',
        'Seasonal allergies'
    ),
    (
        3,
        'Test',
        'Patient Three',
        'patient.three@syncclinic.test',
        '+94770000003',
        '2018-11-03',
        'B+',
        'Routine child wellness testing'
    )
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    blood_group = EXCLUDED.blood_group,
    medical_history = EXCLUDED.medical_history;

SELECT setval(
    pg_get_serial_sequence('patients', 'id'),
    GREATEST((SELECT MAX(id) FROM patients), 1),
    true
);

COMMIT;

\connect doctor_service_db

BEGIN;

INSERT INTO doctors (
    id,
    full_name,
    email,
    phone,
    specialty,
    hospital,
    qualification,
    experience_years,
    bio,
    status
) VALUES
    (
        101,
        'Dr. Asha Perera',
        'asha.perera@syncclinic.test',
        '+94771234501',
        'Cardiologist',
        'SyncClinic Heart Centre',
        'MBBS, MD Cardiology',
        12,
        'Focuses on preventive heart care, hypertension, and long-term cardiac follow-up.',
        'VERIFIED'
    ),
    (
        102,
        'Dr. Nimal Fernando',
        'nimal.fernando@syncclinic.test',
        '+94771234502',
        'Dermatologist',
        'SyncClinic Skin Care',
        'MBBS, MD Dermatology',
        9,
        'Treats acne, eczema, allergies, and common skin conditions.',
        'VERIFIED'
    ),
    (
        103,
        'Dr. Kavindi Silva',
        'kavindi.silva@syncclinic.test',
        '+94771234503',
        'Pediatrician',
        'SyncClinic Children Hospital',
        'MBBS, DCH',
        7,
        'Provides child wellness checks, vaccinations, and pediatric consultations.',
        'PENDING'
    )
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    specialty = EXCLUDED.specialty,
    hospital = EXCLUDED.hospital,
    qualification = EXCLUDED.qualification,
    experience_years = EXCLUDED.experience_years,
    bio = EXCLUDED.bio,
    status = EXCLUDED.status;

INSERT INTO doctor_availability (
    doctor_id,
    day_of_week,
    start_time,
    end_time
)
SELECT seed.doctor_id, seed.day_of_week, seed.start_time::time, seed.end_time::time
FROM (
    VALUES
        (101, 'MONDAY', '09:00', '12:00'),
        (101, 'WEDNESDAY', '14:00', '17:00'),
        (101, 'FRIDAY', '10:00', '13:00'),
        (102, 'TUESDAY', '09:30', '12:30'),
        (102, 'THURSDAY', '13:00', '16:00'),
        (103, 'MONDAY', '08:30', '11:30'),
        (103, 'SATURDAY', '09:00', '12:00')
) AS seed(doctor_id, day_of_week, start_time, end_time)
WHERE NOT EXISTS (
    SELECT 1
    FROM doctor_availability existing
    WHERE existing.doctor_id = seed.doctor_id
      AND existing.day_of_week = seed.day_of_week
      AND existing.start_time = seed.start_time::time
      AND existing.end_time = seed.end_time::time
);

SELECT setval(
    pg_get_serial_sequence('doctors', 'id'),
    GREATEST((SELECT MAX(id) FROM doctors), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('doctor_availability', 'id'),
    GREATEST((SELECT MAX(id) FROM doctor_availability), 1),
    true
);

COMMIT;

\connect appointment_service_db

BEGIN;

INSERT INTO appointments (
    id,
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    reason,
    status
) VALUES
    (
        1001,
        1,
        101,
        '2026-04-18',
        '09:30',
        'Follow-up for blood pressure review',
        'PENDING'
    ),
    (
        1002,
        1,
        102,
        '2026-04-20',
        '10:00',
        'Skin rash consultation',
        'APPROVED'
    ),
    (
        1003,
        2,
        101,
        '2026-04-22',
        '14:30',
        'Chest discomfort and ECG review',
        'COMPLETED'
    ),
    (
        1004,
        3,
        103,
        '2026-04-25',
        '09:00',
        'Child wellness check',
        'REJECTED'
    ),
    (
        1005,
        2,
        102,
        '2026-04-27',
        '13:30',
        'Acne medication follow-up',
        'CANCELLED'
    )
ON CONFLICT (id) DO UPDATE SET
    patient_id = EXCLUDED.patient_id,
    doctor_id = EXCLUDED.doctor_id,
    appointment_date = EXCLUDED.appointment_date,
    appointment_time = EXCLUDED.appointment_time,
    reason = EXCLUDED.reason,
    status = EXCLUDED.status;

INSERT INTO appointment_status_history (
    id,
    appointment_id,
    old_status,
    new_status,
    changed_at
) VALUES
    (2001, 1002, 'PENDING', 'APPROVED', '2026-04-17 09:00:00'),
    (2002, 1003, 'PENDING', 'APPROVED', '2026-04-17 09:05:00'),
    (2003, 1003, 'APPROVED', 'COMPLETED', '2026-04-17 09:10:00'),
    (2004, 1004, 'PENDING', 'REJECTED', '2026-04-17 09:15:00'),
    (2005, 1005, 'PENDING', 'APPROVED', '2026-04-17 09:20:00'),
    (2006, 1005, 'APPROVED', 'CANCELLED', '2026-04-17 09:25:00')
ON CONFLICT (id) DO UPDATE SET
    appointment_id = EXCLUDED.appointment_id,
    old_status = EXCLUDED.old_status,
    new_status = EXCLUDED.new_status,
    changed_at = EXCLUDED.changed_at;

SELECT setval(
    pg_get_serial_sequence('appointments', 'id'),
    GREATEST((SELECT MAX(id) FROM appointments), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('appointment_status_history', 'id'),
    GREATEST((SELECT MAX(id) FROM appointment_status_history), 1),
    true
);

COMMIT;
