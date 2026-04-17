import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        localStorage.setItem('has_seen_landing', 'true');
        navigate('/auth');
    };

    const handleDoctorPortal = () => {
        localStorage.setItem('has_seen_landing', 'true');
        navigate('/doctor-auth');
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />

            <main className="relative z-10 mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
                <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur sm:p-10">
                    <p className="inline-block rounded-full border border-cyan-200/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                        Smart Telehealth Platform
                    </p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        SyncClinic
                    </h1>
                    <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
                        Book appointments, manage health profiles, upload reports, attend video consultations, and receive digital prescriptions in one secure platform.
                    </p>

                    <div className="mt-6 grid gap-3 text-sm text-slate-200">
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Find doctors by specialty and book quickly.</div>
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Track appointments, prescriptions, and updates in one dashboard.</div>
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Built for patients, doctors, and admins with secure access.</div>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleGetStarted}
                            className="rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:from-cyan-700 hover:to-teal-700"
                        >
                            Patient Login / Register
                        </button>
                        <button
                            type="button"
                            onClick={handleDoctorPortal}
                            className="rounded-xl border border-cyan-300/40 bg-white/10 px-6 py-3 text-sm font-bold text-cyan-100 transition hover:bg-white/20"
                        >
                            Doctor Login / Register
                        </button>
                    </div>
                </section>

                <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-7 shadow-2xl sm:p-10">
                    <h2 className="text-2xl font-extrabold text-cyan-300 sm:text-3xl">Why Patients Choose SyncClinic</h2>
                    <ul className="mt-6 space-y-4 text-sm text-slate-300 sm:text-base">
                        <li className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">Unified profile with medical details and report uploads.</li>
                        <li className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">Real-time appointment tracking and doctor availability.</li>
                        <li className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">Telemedicine-ready with secure online consultations.</li>
                        <li className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">Notification and payment-ready workflow for full care journey.</li>
                    </ul>

                    <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                        First time here? Start with quick account setup in the next step.
                    </div>
                </section>
            </main>
        </div>
    );
}
