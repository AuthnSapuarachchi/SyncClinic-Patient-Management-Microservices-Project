import { useState } from 'react';
import api from '../api/axiosConfig'; // The interceptor we built earlier!
import './AuthScreen.css';

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
        <div className="auth-shell">
            <div className="auth-background-orb auth-orb-one" aria-hidden="true" />
            <div className="auth-background-orb auth-orb-two" aria-hidden="true" />

            <section className="auth-layout">
                <aside className="auth-brand-panel" aria-label="SyncClinic highlights">
                    <p className="auth-badge">Patient Care Platform</p>
                    <h1>SyncClinic</h1>
                    <p className="auth-brand-copy">
                        Securely manage appointments, profiles, and medical updates in one place designed for patient-first care.
                    </p>

                    <div className="auth-brand-list">
                        <div className="auth-brand-item">Fast onboarding in under 60 seconds</div>
                        <div className="auth-brand-item">Encrypted access with JWT sessions</div>
                        <div className="auth-brand-item">Built for patient and doctor workflows</div>
                    </div>
                </aside>

                <section className="auth-form-card">
                    <div className="auth-card-header">
                        <h2>{mode === 'register' ? 'Create Patient Account' : 'Welcome Back'}</h2>
                        <p>
                            {mode === 'register'
                                ? 'Register to manage your profile and medical details.'
                                : 'Sign in to continue to your patient dashboard.'}
                        </p>
                    </div>

                    <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === 'login'}
                            className={`auth-toggle-btn ${mode === 'login' ? 'active' : ''}`}
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
                            className={`auth-toggle-btn ${mode === 'register' ? 'active' : ''}`}
                            onClick={() => {
                                setMode('register');
                                setMessage('');
                                setIsError(false);
                            }}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <label className="auth-field">
                            <span>Email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label className="auth-field">
                            <span>Password</span>
                            <div className="auth-password-wrap">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
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
                            className="auth-submit"
                        >
                            {loading ? 'Connecting...' : mode === 'register' ? 'Register as Patient' : 'Login to Dashboard'}
                        </button>
                    </form>

                    {message && (
                        <div className={`auth-message ${isError ? 'error' : 'success'}`} role="status" aria-live="polite">
                            {message}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}