import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function PatientMainDashboard() {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('user_email') || 'patient@syncclinic.com';

    const [patientId, setPatientId] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        specialty: '',
        query: ''
    });

    const specialties = useMemo(() => {
        return [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))];
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        return doctors.filter((doctor) => {
            const specialtyMatch = !filters.specialty || doctor.specialty === filters.specialty;
            const query = filters.query.trim().toLowerCase();
            const textMatch =
                !query ||
                (doctor.fullName || '').toLowerCase().includes(query) ||
                (doctor.hospital || '').toLowerCase().includes(query) ||
                (doctor.specialty || '').toLowerCase().includes(query);

            return specialtyMatch && textMatch;
        });
    }, [doctors, filters]);

    const normalizeListResponse = (responseData) => {
        if (Array.isArray(responseData)) {
            return responseData;
        }

        if (Array.isArray(responseData?.data)) {
            return responseData.data;
        }

        if (Array.isArray(responseData?.content)) {
            return responseData.content;
        }

        return [];
    };

    const fetchAppointments = async (activePatientId) => {
        if (!activePatientId) {
            setAppointments([]);
            return;
        }

        const appointmentsResponse = await api.get(`/api/appointments/patient/${activePatientId}`);
        const appointmentData = normalizeListResponse(appointmentsResponse.data);
        setAppointments(appointmentData);
    };

    const doctorNameById = useMemo(() => {
        return doctors.reduce((acc, doctor) => {
            if (doctor.id) {
                acc[doctor.id] = doctor.fullName;
            }
            return acc;
        }, {});
    }, [doctors]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError('');

            try {
                const patientResponse = await api.get(`/api/patients/profile/${userEmail}`);
                const resolvedPatientId = patientResponse.data?.id;

                if (!resolvedPatientId) {
                    throw new Error('Patient ID not found for logged-in user');
                }

                setPatientId(resolvedPatientId);

                const [doctorsResponse, appointmentsResponse, prescriptionsResponse] = await Promise.all([
                    api.get('/api/doctors'),
                    api.get(`/api/appointments/patient/${resolvedPatientId}`),
                    api.get(`/api/prescriptions/patient/${resolvedPatientId}`)
                ]);

                const doctorsData = normalizeListResponse(doctorsResponse.data);
                setDoctors(doctorsData.filter((doctor) => doctor.status === 'VERIFIED'));
                setAppointments(normalizeListResponse(appointmentsResponse.data));
                setPrescriptions(normalizeListResponse(prescriptionsResponse.data));
            } catch (fetchError) {
                console.error('Failed to fetch patient dashboard data', fetchError);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [userEmail]);

    const handleBookAppointment = async (doctorId, feeLkr) => {
        void feeLkr;

        if (!patientId || !doctorId) {
            setError('Unable to create appointment due to missing patient or doctor information.');
            return;
        }

        const now = new Date();
        const appointmentDate = now.toISOString().slice(0, 10);
        const appointmentTime = now.toTimeString().slice(0, 5);

        try {
            await api.post('/api/appointments', {
                patientId,
                doctorId,
                appointmentDate,
                appointmentTime,
                reason: 'Consultation request from patient dashboard',
                status: 'PENDING'
            });

            alert('Appointment Requested');
            await fetchAppointments(patientId);
        } catch (bookingError) {
            console.error('Failed to book appointment', bookingError);
            setError('Failed to book appointment. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {isLoading && <p className="mb-4 text-sm text-cyan-200">Loading dashboard...</p>}
                {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
                <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-r from-cyan-700/30 via-slate-800/70 to-teal-700/30 p-6 shadow-xl backdrop-blur">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Patient Main Dashboard</p>
                            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Welcome to SyncClinic</h1>
                            <p className="mt-2 text-sm text-slate-200">Signed in as <span className="font-semibold text-white">{userEmail}</span></p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex">
                            <button
                                onClick={() => navigate('/patient/profile')}
                                type="button"
                                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                Manage Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                type="button"
                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-cyan-200">Upcoming Appointments</p>
                            <p className="mt-1 text-2xl font-bold">{appointments.length}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-emerald-200">Available Doctors</p>
                            <p className="mt-1 text-2xl font-bold">{doctors.length}</p>
                        </div>
                        <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-violet-200">Prescriptions</p>
                            <p className="mt-1 text-2xl font-bold">{prescriptions.length}</p>
                        </div>
                        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-amber-200">Reports</p>
                            <p className="mt-1 text-2xl font-bold">Upload Ready</p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-cyan-300">Find Doctors</h2>
                                <p className="mt-1 text-sm text-slate-300">Search by specialty and quickly book consultations.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFilters({ specialty: '', query: '' })}
                                className="rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-700"
                            >
                                Clear Filters
                            </button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <input
                                type="text"
                                value={filters.query}
                                onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
                                placeholder="Search doctor, clinic, or specialty"
                                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                            />

                            <select
                                value={filters.specialty}
                                onChange={(event) => setFilters((prev) => ({ ...prev, specialty: event.target.value }))}
                                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                            >
                                <option value="">All Specialties</option>
                                {specialties.map((specialty) => (
                                    <option key={specialty} value={specialty}>{specialty}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4 space-y-3">
                            {filteredDoctors.length === 0 ? (
                                <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-slate-300">
                                    No doctors found for the selected filters.
                                </div>
                            ) : (
                                filteredDoctors.map((doctor) => (
                                    <article key={doctor.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-100">{doctor.fullName}</h3>
                                                <p className="text-sm text-cyan-300">{doctor.specialty}</p>
                                                <p className="text-sm text-slate-300">{doctor.hospital}</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-sm text-slate-300">Available: {doctor.status}</p>
                                                <p className="text-sm font-semibold text-emerald-300">LKR {0..toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleBookAppointment(doctor.id, 0)}
                                                className="rounded-lg bg-linear-to-r from-cyan-600 to-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:from-cyan-700 hover:to-teal-700"
                                            >
                                                Book Appointment
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-lg border border-slate-500 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-700"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                            <h2 className="text-lg font-bold text-cyan-300">Appointments</h2>
                            <div className="mt-4 space-y-3 text-sm">
                                {appointments.map((appointment) => (
                                    <div key={appointment.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                                        <p className="font-semibold text-slate-100">{doctorNameById[appointment.doctorId] || `Doctor #${appointment.doctorId}`}</p>
                                        <p className="text-slate-300">Doctor ID: {appointment.doctorId}</p>
                                        <p className="text-slate-300">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                                        <p className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold {(appointment.status || '') === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                            {appointment.status} • {appointment.reason || 'Consultation'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                            <h2 className="text-lg font-bold text-cyan-300">Telemedicine</h2>
                            <p className="mt-2 text-sm text-slate-300">Join secure video consultations from your browser.</p>
                            <button
                                type="button"
                                className="mt-3 w-full rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                            >
                                Join Next Video Session
                            </button>
                        </section>
                    </aside>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <h2 className="text-lg font-bold text-cyan-300">Medical History and Prescriptions</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            {prescriptions.map((prescription) => (
                                <article key={prescription.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                                    <p className="font-semibold text-slate-100">{prescription.id} • {prescription.doctor?.fullName || `Doctor #${prescription.doctor?.id || '-'}`}</p>
                                    <p className="text-slate-300">Diagnosis: {prescription.diagnosis || '-'}</p>
                                    <p className="text-slate-200">{prescription.medicines || prescription.notes || 'No notes available.'}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <h2 className="text-lg font-bold text-cyan-300">Reports, Notifications, and Payments</h2>
                        <ul className="mt-4 space-y-3 text-sm text-slate-300">
                            <li className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">Upload reports and test results from your profile page.</li>
                            <li className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">Receive appointment confirmations through SMS and email notifications.</li>
                            <li className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">Pay consultation fees securely with integrated gateways (sandbox mode).</li>
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => navigate('/patient/profile')}
                                className="rounded-lg bg-linear-to-r from-cyan-600 to-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:from-cyan-700 hover:to-teal-700"
                            >
                                Go to Profile and Uploads
                            </button>
                            <button
                                type="button"
                                className="rounded-lg border border-slate-500 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-700"
                            >
                                View Billing History
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
