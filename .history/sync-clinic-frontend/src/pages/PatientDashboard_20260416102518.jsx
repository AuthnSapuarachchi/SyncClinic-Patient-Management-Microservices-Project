import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function PatientDashboard() {
    const navigate = useNavigate();
    // We get the email of the currently logged-in user
    const userEmail = localStorage.getItem('user_email');
    const draftKey = userEmail ? `patient_profile_draft_${userEmail}` : null;

    const getEmptyFormData = () => ({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        bloodGroup: '',
        medicalHistory: ''
    });

    const getInitialFormData = () => {
        if (!draftKey) {
            return getEmptyFormData();
        }

        try {
            const savedDraft = localStorage.getItem(draftKey);
            return savedDraft ? JSON.parse(savedDraft) : getEmptyFormData();
        } catch {
            return getEmptyFormData();
        }
    };

    const [formData, setFormData] = useState(getInitialFormData);
    
    const [status, setStatus] = useState({ loading: false, message: '', isError: false });

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState({ loading: false, message: '', isError: false });
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Keep unsaved form changes during refresh for this specific user.
        if (draftKey) {
            localStorage.setItem(draftKey, JSON.stringify(formData));
        }
    }, [draftKey, formData]);

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
            const hasSavedDraft = draftKey && localStorage.getItem(draftKey);
            if (hasSavedDraft) {
                return;
            }
            fetchProfileData();
        }
    }, [draftKey, userEmail]);

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

            navigate('/patientDashboard');
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

    const handleFileUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setUploadStatus({ loading: false, message: 'Please select a file first.', isError: true });
            return;
        }

        setUploadStatus({ loading: true, message: '', isError: false });

        const fileData = new FormData();
        fileData.append('file', selectedFile);

        try {
            const response = await api.post(`/api/patients/${userEmail}/report`, fileData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploadStatus({ loading: false, message: response.data.message || 'Report uploaded successfully!', isError: false });
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            setUploadStatus({
                loading: false,
                message: 'Upload failed: ' + (error.response?.data?.message || error.message),
                isError: true
            });
        }
    };

    const handleLogout = () => {
        if (draftKey) {
            localStorage.removeItem(draftKey);
        }
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_email');
        window.location.reload(); // Quick way to reset the app state
    };

    const handleResetDraft = () => {
        if (!draftKey) {
            return;
        }

        localStorage.removeItem(draftKey);
        setFormData(getEmptyFormData());
        setStatus({
            loading: false,
            message: 'Local draft cleared.',
            isError: false
        });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Patient Workspace</p>
                        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Medical Profile</h1>
                        <p className="mt-1 text-sm text-slate-300">Signed in as <span className="font-semibold text-slate-100">{userEmail || 'Unknown user'}</span></p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/patientDashboard')}
                            type="button"
                            className="rounded-lg border border-cyan-500/50 bg-cyan-900/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-800/40"
                        >
                            Main Dashboard
                        </button>
                        <button
                            onClick={handleResetDraft}
                            type="button"
                            className="rounded-lg border border-slate-500/60 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                        >
                            Clear Draft
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

                <div className="grid gap-6 lg:grid-cols-3">
                    <aside className="rounded-2xl border border-cyan-900/70 bg-slate-900/70 p-5 lg:col-span-1">
                        <h2 className="text-lg font-bold text-cyan-300">Care Tips</h2>
                        <ul className="mt-4 space-y-3 text-sm text-slate-300">
                            <li className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">Keep your phone number updated for appointment reminders.</li>
                            <li className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">Use medical history notes for allergies and long-term conditions.</li>
                            <li className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">Your profile draft is stored locally and survives refresh.</li>
                        </ul>
                    </aside>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2 sm:p-6">
                        <h2 className="text-xl font-bold text-cyan-300">Profile Details</h2>
                        <p className="mt-1 text-sm text-slate-300">Update your personal and medical information used by SyncClinic services.</p>

                        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-slate-200">First Name</span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-slate-200">Last Name</span>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                                    />
                                </label>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-slate-200">Phone (10 digits)</span>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-slate-200">Blood Group</span>
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                                    >
                                        <option value="">Select...</option>
                                        <option value="A+">A+</option>
                                        <option value="O+">O+</option>
                                        <option value="B+">B+</option>
                                        <option value="AB+">AB+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-semibold text-slate-200">Date of Birth</span>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-semibold text-slate-200">Medical History (Optional)</span>
                                <textarea
                                    name="medicalHistory"
                                    value={formData.medicalHistory}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={status.loading}
                                className="w-full rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:from-cyan-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {status.loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>

                        {status.message && (
                            <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${status.isError ? 'border-rose-400/40 bg-rose-500/10 text-rose-200' : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'}`}>
                                {status.message}
                            </div>
                        )}

                        <div className="mt-8 border-t border-slate-700 pt-6">
                            <h3 className="text-lg font-bold text-cyan-300">Upload Medical Report</h3>
                            <p className="mt-1 text-sm text-slate-300">Upload recent lab results or doctor notes (PDF or image).</p>

                            <form onSubmit={handleFileUpload} className="mt-4 space-y-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-slate-600"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                />

                                <button
                                    type="submit"
                                    disabled={uploadStatus.loading || !selectedFile}
                                    className="w-full rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {uploadStatus.loading ? 'Uploading...' : 'Upload File'}
                                </button>
                            </form>

                            {uploadStatus.message && (
                                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${uploadStatus.isError ? 'border-rose-400/40 bg-rose-500/10 text-rose-200' : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'}`}>
                                    {uploadStatus.message}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
}