import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function DoctorRegister() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const normalizeRole = (role) => {
        if (typeof role !== 'string' || !role.trim()) {
            return null;
        }

        return role.startsWith('ROLE_') ? role : `ROLE_${role.toUpperCase()}`;
    };

    const getTokenFromResponse = (responseData) => {
        return responseData?.token || responseData?.jwt || responseData?.accessToken || null;
    };

    const getRoleFromResponse = (responseData) => {
        return normalizeRole(responseData?.role) || 'ROLE_DOCTOR';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await api.post('/auth/register', {
                email,
                password,
                role: 'ROLE_DOCTOR'
            });

            const jwtToken = getTokenFromResponse(response.data);
            if (!jwtToken) {
                throw new Error('Token not found in register response');
            }

            localStorage.setItem('jwt_token', jwtToken);
            localStorage.setItem('user_email', email);
            localStorage.setItem('user_role', getRoleFromResponse(response.data));

            setMessage('Doctor registration successful. Redirecting...');
            window.location.href = '/';
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || error.message || 'Doctor registration failed'));
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-4 sm:px-6 lg:px-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

            <section className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl lg:grid-cols-2">
                <aside className="bg-linear-to-br from-blue-900 to-sky-900 p-8 text-blue-50 sm:p-10" aria-label="SyncClinic doctor registration highlights">
                    <p className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        Doctor Care Platform
                    </p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">SyncClinic</h1>
                    <p className="mt-3 max-w-md text-sm leading-7 text-blue-100 sm:text-base">
                        Register your doctor account to manage availability, appointments, and digital prescriptions.
                    </p>

                    <div className="mt-8 grid gap-3">
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">Create a doctor account with secure JWT access</div>
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">Continue to the doctor dashboard after registration</div>
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">Use the shared login page after your account is created</div>
                    </div>
                </aside>

                <section className="bg-slate-50 p-6 text-slate-900 sm:p-8 lg:p-10">
                    <div>
                        <h2 className="text-2xl font-extrabold sm:text-3xl">Create Doctor Account</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Register as a doctor to access your clinical and scheduling workspace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Doctor Email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="doctor@example.com"
                                autoComplete="email"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-200"
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="new-password"
                                    minLength={6}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-200"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-linear-to-r from-teal-700 to-cyan-700 px-4 py-3 font-bold text-white transition hover:from-teal-800 hover:to-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Connecting...' : 'Register as Doctor'}
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm text-slate-600">
                        Already registered?{' '}
                        <Link to="/auth" className="font-bold text-teal-700 hover:text-teal-900">
                            Login from the main page
                        </Link>
                    </p>

                    {message && (
                        <div
                            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
                            role="status"
                            aria-live="polite"
                        >
                            {message}
                        </div>
                    )}
                </section>
            </section>
        </div>
    );
}
