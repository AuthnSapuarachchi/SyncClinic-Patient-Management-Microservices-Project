import { useState } from 'react';
import api from '../api/axiosConfig'; // The interceptor we built earlier!

export default function AuthScreen() {
    const [mode, setMode] = useState('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const saveSessionAndRedirect = (token) => {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_email', email);
        window.location.href = '/patientDashboard';
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Stops the browser from reloading the page
        setLoading(true);
        setMessage('');

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">SyncClinic Portal</h2>

                <div className="grid grid-cols-2 gap-2 bg-gray-900 p-1 rounded mb-4 border border-gray-700">
                    <button
                        type="button"
                        className={`py-2 rounded text-sm font-semibold transition ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        onClick={() => {
                            setMode('login');
                            setMessage('');
                        }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={`py-2 rounded text-sm font-semibold transition ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        onClick={() => {
                            setMode('register');
                            setMessage('');
                        }}
                    >
                        Register
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded transition duration-200 mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Connecting...' : mode === 'register' ? 'Register as Patient' : 'Login'}
                    </button>
                </form>

                {/* Smooth asynchronous status messages */}
                {message && (
                    <div className="mt-4 text-center text-sm p-2 bg-gray-900 rounded border border-gray-700">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}