import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const normalizeListResponse = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.content)) return responseData.content;
    return [];
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('user_email') || 'admin@syncclinic.com';

    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data generator for testing
    const generateMockPayments = () => {
        return [
            {
                id: 'TXN-2024-001',
                patientEmail: 'patient1@example.com',
                patientId: 'P001',
                doctorName: 'Dr. Rajesh Kumar',
                amount: 2500,
                currency: 'lkr',
                status: 'COMPLETED',
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'TXN-2024-002',
                patientEmail: 'patient2@example.com',
                patientId: 'P002',
                doctorName: 'Dr. Priya Singh',
                amount: 3000,
                currency: 'lkr',
                status: 'SUCCESS',
                createdAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 'TXN-2024-003',
                patientEmail: 'patient3@example.com',
                patientId: 'P003',
                doctorName: 'Dr. Anil Patel',
                amount: 1500,
                currency: 'lkr',
                status: 'COMPLETED',
                createdAt: new Date(Date.now() - 259200000).toISOString()
            },
            {
                id: 'TXN-2024-004',
                patientEmail: 'patient4@example.com',
                patientId: 'P004',
                doctorName: 'Dr. Meera Sharma',
                amount: 2800,
                currency: 'lkr',
                status: 'SUCCESS',
                createdAt: new Date(Date.now() - 345600000).toISOString()
            },
            {
                id: 'TXN-2024-005',
                patientEmail: 'patient5@example.com',
                patientId: 'P005',
                doctorName: 'Dr. Vikram Desai',
                amount: 3500,
                currency: 'lkr',
                status: 'COMPLETED',
                createdAt: new Date(Date.now() - 432000000).toISOString()
            }
        ];
    };

    const fetchAdminData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setPaymentError('');
        try {
            const doctorsRes = await api.get('/api/doctors');
            setDoctors(normalizeListResponse(doctorsRes.data));

            try {
                // Fetch patients if endpoint exists
                const patientsRes = await api.get('/api/patients/all');
                setPatients(normalizeListResponse(patientsRes.data));
            } catch (pErr) {
                console.warn('Patients fetch failed, might not be fully implemented yet', pErr);
                setPatients([]); // Fallback to empty if endpoint fails
            }

            try {
                const paymentsRes = await api.get('/api/payments/admin/all');
                setPayments(normalizeListResponse(paymentsRes.data));
            } catch (payErr) {
                console.error('Payments fetch failed:', payErr);
                setPaymentError('Unable to load financial transactions. The payments endpoint may not be fully implemented yet.');
                setPayments([]);
            }
        } catch (err) {
            console.error('Failed to load admin data', err);
            setError('Unable to load some admin data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const handleDoctorAction = async (doctor, action) => {
        try {
            const newStatus = action === 'verify' ? 'VERIFIED' : 'REJECTED';
            await api.put(`/api/doctors/${doctor.id}`, {
                ...doctor,
                status: newStatus
            });
            alert(`Doctor ${doctor.fullName} has been ${newStatus.toLowerCase()}.`);
            fetchAdminData();
        } catch (err) {
            console.error('Failed to update doctor status', err);
            alert(`Failed to ${action} doctor. Please try again.`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        window.location.reload();
    };

    const pendingDoctors = useMemo(() => doctors.filter(d => !d.status || d.status === 'PENDING'), [doctors]);
    const verifiedDoctors = useMemo(() => doctors.filter(d => d.status === 'VERIFIED'), [doctors]);

    const totalRevenue = useMemo(() => {
        return payments
            .filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS')
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }, [payments]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {isLoading && <p className="mb-4 text-sm text-cyan-200">Loading admin dashboard...</p>}
                {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
                
                <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-teal-700/30 via-slate-800/70 to-indigo-700/30 p-6 shadow-xl backdrop-blur">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">Admin Dashboard</p>
                            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Management Console</h1>
                            <p className="mt-2 text-sm text-slate-200">Signed in as <span className="font-semibold text-white">{userEmail}</span></p>
                        </div>
                        <div className="grid grid-cols-1 sm:flex gap-2">
                            <button onClick={fetchAdminData} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                                Refresh Data
                            </button>
                            <button onClick={handleLogout} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-indigo-200">Total Users</p>
                            <p className="mt-1 text-2xl font-bold">{patients.length}</p>
                        </div>
                        <div className="rounded-xl border border-teal-400/20 bg-teal-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-teal-200">Verified Doctors</p>
                            <p className="mt-1 text-2xl font-bold">{verifiedDoctors.length}</p>
                        </div>
                        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-amber-200">Pending Registrations</p>
                            <p className="mt-1 text-2xl font-bold text-amber-300">{pendingDoctors.length}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-emerald-200">Total Revenue</p>
                            <p className="mt-1 text-2xl font-bold text-emerald-300">LKR {totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </section>

                <div className="mb-6 flex space-x-2 border-b border-slate-700">
                    {['overview', 'doctors', 'users', 'financials'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-semibold capitalize transition-all ${
                                activeTab === tab ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                            <h2 className="text-lg font-bold text-amber-300">Pending Doctor Registrations ({pendingDoctors.length})</h2>
                            <p className="mt-1 text-sm text-slate-300 mb-4">Review and verify doctors applying to join the SyncClinic platform.</p>
                            <div className="space-y-3">
                                {pendingDoctors.length === 0 ? (
                                    <p className="text-sm text-slate-400">All caught up! No pending registrations.</p>
                                ) : pendingDoctors.map(doc => (
                                    <div key={doc.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-100">{doc.fullName}</p>
                                            <p className="text-sm text-slate-300">{doc.specialty} • {doc.hospital}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleDoctorAction(doc, 'verify')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">Approve</button>
                                            <button onClick={() => handleDoctorAction(doc, 'reject')} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700">Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                            <h2 className="text-lg font-bold text-cyan-300">Recent Financials</h2>
                            <p className="mt-1 text-sm text-slate-300 mb-4">A snapshot of the latest transactions on the platform.</p>
                            <div className="space-y-3">
                                {payments.length === 0 ? (
                                    <p className="text-sm text-slate-400">No transactions recorded yet.</p>
                                ) : payments.slice().reverse().slice(0, 5).map((pay, i) => (
                                    <div key={pay.id || i} className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-slate-100">{pay.patientEmail || pay.patientId}</p>
                                            <p className="text-xs text-slate-400">To: {pay.doctorName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-300">{pay.currency?.toUpperCase() || 'LKR'} {pay.amount}</p>
                                            <p className="text-xs text-slate-400">{pay.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'doctors' && (
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-bold text-cyan-300">Doctor Directory</h2>
                            <button
                                type="button"
                                onClick={() => navigate('/doctor-management')}
                                className="rounded-lg border border-cyan-500/50 bg-cyan-900/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-800/40"
                            >
                                Manage Doctors
                            </button>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {doctors.map(doc => (
                                <div key={doc.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                    <p className="font-bold text-slate-100">{doc.fullName}</p>
                                    <p className="text-sm text-slate-300">{doc.email}</p>
                                    <p className="mt-2 text-sm text-cyan-200">{doc.specialty} ({doc.experienceYears}y exp)</p>
                                    <div className="mt-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${doc.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' : doc.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                            {doc.status || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'users' && (
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <h2 className="text-lg font-bold text-cyan-300">Registered Patients</h2>
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-800/80 text-xs uppercase text-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">ID</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3 rounded-tr-lg">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.filter(p => !p.role || p.role === 'ROLE_PATIENT' || p.role === 'PATIENT').length > 0 ? patients.filter(p => !p.role || p.role === 'ROLE_PATIENT' || p.role === 'PATIENT').map(p => (
                                        <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                            <td className="px-4 py-3">{p.id}</td>
                                            <td className="px-4 py-3 font-medium text-slate-100">{p.firstName} {p.lastName}</td>
                                            <td className="px-4 py-3">{p.email}</td>
                                            <td className="px-4 py-3">{p.phone}</td>
                                            <td className="px-4 py-3">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-4 text-center text-slate-500">No patients loaded or endpoint unavailable.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'financials' && (
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-bold text-cyan-300">Detailed Financial Transactions</h2>
                            <button 
                                onClick={fetchAdminData} 
                                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                Retry Load
                            </button>
                        </div>
                        
                        {paymentError && (
                            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
                                <p className="text-sm text-rose-300">{paymentError}</p>
                                <p className="mt-2 text-xs text-rose-200">Make sure the payments API endpoint <code className="bg-rose-900/30 px-2 py-1 rounded">/api/payments/admin/all</code> is properly implemented and running.</p>
                            </div>
                        )}
                        
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-800/80 text-xs uppercase text-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Trans. ID</th>
                                        <th className="px-4 py-3">Patient Email</th>
                                        <th className="px-4 py-3">Doctor</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 rounded-tr-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length > 0 ? payments.map(pay => (
                                        <tr key={pay.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                            <td className="px-4 py-3 font-mono text-xs text-slate-400">{pay.id}</td>
                                            <td className="px-4 py-3">{pay.patientEmail || pay.patientId || '-'}</td>
                                            <td className="px-4 py-3">{pay.doctorName || '-'}</td>
                                            <td className="px-4 py-3 font-semibold text-emerald-300">{pay.currency?.toUpperCase() || 'LKR'} {pay.amount || 0}</td>
                                            <td className="px-4 py-3">{pay.createdAt ? new Date(pay.createdAt).toLocaleDateString() : '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${pay.status === 'SUCCESS' || pay.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                                    {pay.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center text-slate-500">
                                                {isLoading ? 'Loading transactions...' : 'No transactions recorded.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
