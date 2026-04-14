import { useState } from 'react';
import api from '../api/axiosConfig'; // The interceptor we built earlier!

export default function AuthScreen() {
    const [mode, setMode] = useState('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const saveSessionAndRedirect = (token) => {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_email', email);
        window.location.href = '/patientDashboard';
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Stops the browser from reloading the page
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            if (mode === 'register') {
                const response = await api.post('/auth/register', {
                    email: email,
                    password: password,
                    role: 'ROLE_PATIENT'
                });

                const jwtToken = response.data.token;
                setMessage('Registration successful. Redirecting...');
                saveSessionAndRedirect(jwtToken);
            } else {
                const response = await api.post('/auth/login', {
                    email: email,
                    password: password
                });

                const jwtToken = response.data.token;
                setMessage('Login successful. Redirecting...');
                saveSessionAndRedirect(jwtToken);
            }

        } catch (error) {
            const fallbackMessage = mode === 'register' ? 'Registration failed' : 'Login failed';
            setMessage('Error: ' + (error.response?.data?.message || fallbackMessage));
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-8 sm:px-6 lg:px-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

            <section className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl lg:grid-cols-2">
                <aside className="bg-gradient-to-br from-blue-900 to-sky-900 p-8 text-blue-50 sm:p-10" aria-label="SyncClinic highlights">
                    <p className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        Patient Care Platform
                    </p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">SyncClinic</h1>
                    <p className="mt-3 max-w-md text-sm leading-7 text-blue-100 sm:text-base">
                        Securely manage appointments, profiles, and medical updates in one place designed for patient-first care.
                    </p>

                    <div className="mt-8 grid gap-3">
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">Fast onboarding in under 60 seconds</div>
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">Encrypted access with JWT sessions</div>
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">Built for patient and doctor workflows</div>
                    </div>
                </aside>

                <section className="bg-slate-50 p-6 text-slate-900 sm:p-8 lg:p-10">
                    <div>
                        <h2 className="text-2xl font-extrabold sm:text-3xl">{mode === 'register' ? 'Create Patient Account' : 'Welcome Back'}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {mode === 'register'
                                ? 'Register to manage your profile and medical details.'
                                : 'Sign in to continue to your patient dashboard.'}
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-200 p-1" role="tablist" aria-label="Authentication mode">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === 'login'}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => {
                                setMode('login');
                                setMessage('');
                                setIsError(false);
                            }}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === 'register'}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => {
                                setMode('register');
                                setMessage('');
                                setIsError(false);
                            }}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
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
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
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
                            className="w-full rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 px-4 py-3 font-bold text-white transition hover:from-teal-800 hover:to-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Connecting...' : mode === 'register' ? 'Register as Patient' : 'Login to Dashboard'}
                        </button>
                    </form>

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