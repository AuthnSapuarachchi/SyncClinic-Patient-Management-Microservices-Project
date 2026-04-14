import { useState } from 'react';
import api from '../api/axiosConfig';

export default function PatientDashboard() {
    // We get the email of the currently logged-in user
    const userEmail = localStorage.getItem('user_email');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        bloodGroup: '',
        medicalHistory: ''
    });
    
    const [status, setStatus] = useState({ loading: false, message: '', isError: false });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Axios uses your Interceptor to send the JWT automatically!
                const response = await api.get(`/api/patients/profile/${userEmail}`);
                
                // Update the state with the database data
                if (response.data) {
                    setFormData({
                        firstName: response.data.firstName || '',
                        lastName: response.data.lastName || '',
                        phone: response.data.phone || '',
                        dateOfBirth: response.data.dateOfBirth || '',
                        bloodGroup: response.data.bloodGroup || '',
                        medicalHistory: response.data.medicalHistory || ''
                    });
                }
            } catch (error) {
                console.error("Could not fetch profile data", error);
            }
        };

        // Call the function when the component loads
        if (userEmail) {
            fetchProfileData();
        }
    }, [userEmail]);

    // Handle input changes dynamically
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, message: '', isError: false });

        try {
            // Notice how clean this is! Axios attaches the JWT automatically.
            await api.put(`/api/patients/update/${userEmail}`, formData);
            
            setStatus({ 
                loading: false, 
                message: '✅ Profile updated successfully!', 
                isError: false 
            });
        } catch (error) {
            // If the Spring Boot Validation fails, we catch the 400 Bad Request here
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Failed to update profile';
            setStatus({ 
                loading: false, 
                message: `❌ Error: ${errorMsg}`, 
                isError: true 
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_email');
        window.location.reload(); // Quick way to reset the app state
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
            <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-400">Medical Profile</h2>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        Logout
                    </button>
                </div>

                <p className="text-gray-400 mb-6">Updating records for: <span className="text-white font-mono">{userEmail}</span></p>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">First Name</label>
                            <input type="text" name="firstName" onChange={handleChange} required
                                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                            <input type="text" name="lastName" onChange={handleChange} required
                                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Phone (10 digits)</label>
                            <input type="text" name="phone" onChange={handleChange} required
                                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Blood Group</label>
                            <select name="bloodGroup" onChange={handleChange} required
                                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none">
                                <option value="">Select...</option>
                                <option value="A+">A+</option>
                                <option value="O+">O+</option>
                                <option value="B+">B+</option>
                                <option value="AB+">AB+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                        <input type="date" name="dateOfBirth" onChange={handleChange} required
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Medical History (Optional)</label>
                        <textarea name="medicalHistory" onChange={handleChange} rows="3"
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={status.loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-6 transition disabled:opacity-50"
                    >
                        {status.loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>

                {status.message && (
                    <div className={`mt-6 p-4 rounded border ${status.isError ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-green-900/50 border-green-500 text-green-200'}`}>
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}