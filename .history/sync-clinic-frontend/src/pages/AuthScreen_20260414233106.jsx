import { useState } from 'react';
import api from '../api/axiosConfig'; // The interceptor we built earlier!

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // THIS is the Asynchronous function your rubric requires
    const handleRegister = async (e) => {
        e.preventDefault(); // Stops the browser from reloading the page
        setLoading(true);
        setMessage('');

        try {
            // Asynchronously wait for the API Gateway to respond
            const response = await api.post('/auth/register', {
                email: email,
                password: password,
                role: 'ROLE_PATIENT'
            });

            // 1. Grab the JWT from the backend
            const jwtToken = response.data.token; 
            
            // 2. Save the VIP Pass to the browser
            localStorage.setItem('jwt_token', jwtToken); 
            
            setMessage("✅ Registration Successful! Token Saved.");
            
            // (Later, we will redirect to the Dashboard here)

        } catch (error) {
            // If the Gateway throws a 400 or 403, we catch it smoothly here
            setMessage("❌ Error: " + (error.response?.data?.message || "Registration failed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">SyncClinic Portal</h2>
                
                <form onSubmit={handleRegister} className="space-y-4">
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
                        {loading ? 'Connecting...' : 'Register as Patient'}
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