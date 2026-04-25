import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        localStorage.setItem('has_seen_landing', 'true');
        navigate('/auth');
    };

    return (
        <div className="relative min-h-screen bg-slate-950 font-sans text-slate-50 selection:bg-cyan-500/30 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-28 -right-32 w-96 h-96 bg-cyan-600/25 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite]"></div>
                <div className="absolute top-1/4 -left-36 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite]"></div>
                <div className="absolute -bottom-44 left-1/2 w-96 h-96 bg-teal-600/20 rounded-full blur-[120px] animate-[pulse_14s_ease-in-out_infinite]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.14),_transparent_28%)] mix-blend-screen"></div>
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDAuNWg0MC41djQwLjVIMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIvPjwvc3ZnPg==')] opacity-40 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl flex flex-col min-h-screen">
                {/* Header Navbar */}
                <header className="flex items-center justify-between py-6 animate-fade-in-down w-full">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.35)] transition-transform duration-300 group-hover:-translate-y-1">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm uppercase tracking-[0.36em] text-cyan-200">SyncClinic</p>
                            <span className="text-xl font-bold tracking-tight text-white">Enterprise Care Suite</span>
                        </div>
                    </div>
                    
                    {/* Right Nav */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
                        <a href="#features" className="hover:text-white transition-colors duration-200">Platform</a>
                        <a href="#benefits" className="hover:text-white transition-colors duration-200">Enterprise</a>
                        <a href="#trust" className="hover:text-white transition-colors duration-200">Trust</a>
                        <button onClick={handleGetStarted} className="px-6 py-3 rounded-full bg-white text-slate-950 font-semibold shadow-lg shadow-cyan-500/10 hover:bg-slate-100 transition-all duration-200">
                            Sign In
                        </button>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="relative flex-1 flex flex-col justify-center w-full min-h-[85vh] py-24 my-6">
                    {/* Background Image (Full Bleed) */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[100vw] z-0 overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=2000&auto=format&fit=crop&q=80" 
                            alt="Healthcare Professional" 
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Modern Dark Gradient Overlay for readability & aesthetics */}
                        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px] z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/85 z-10"></div>
                    </div>

                    <div className="relative z-20 grid gap-12 lg:grid-cols-[1.4fr_0.8fr] items-center">
                        <div className="space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-cyan-200 shadow-[0_20px_80px_rgba(34,211,238,0.12)]">
                                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.45)]"></span>
                                Trusted by leading healthcare enterprises
                            </div>

                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[0.95]">
                                Enterprise-grade healthcare,
                                <span className="block text-cyan-300">designed for billion-dollar teams.</span>
                            </h1>

                            <p className="max-w-2xl text-lg sm:text-xl text-slate-300 leading-relaxed">
                                Streamline appointments, secure telemedicine, frictionless patient workflows, and operational analytics in a single end-to-end suite built for scale, compliance, and reliability.
                            </p>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4">
                                <button
                                    type="button"
                                    onClick={handleGetStarted}
                                    className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-semibold text-slate-950 shadow-[0_18px_60px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
                                >
                                    Start Securely
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.open('mailto:sales@syncclinic.com?subject=SyncClinic Demo Request', '_blank')}
                                    className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900 px-10 py-4 text-lg text-cyan-300 transition duration-300 hover:border-cyan-300 hover:text-white"
                                >
                                    Request a Demo
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3 mt-10 text-left">
                                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
                                    <p className="text-3xl font-semibold text-white">99.99%</p>
                                    <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">Guaranteed uptime</p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
                                    <p className="text-3xl font-semibold text-white">5M+</p>
                                    <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">Appointments booked</p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
                                    <p className="text-3xl font-semibold text-white">120+</p>
                                    <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">Enterprise partners</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative px-6 py-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 shadow-[0_40px_120px_rgba(15,23,42,0.55)] overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.18),_transparent_28%)]"></div>
                            <div className="relative space-y-6">
                                <div className="animate-[float_8s_ease-in-out_infinite] rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl shadow-[0_25px_80px_rgba(15,23,42,0.4)]">
                                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Realtime insights</p>
                                    <p className="mt-4 text-4xl font-semibold text-white">Operational performance in a single pane.</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl shadow-[0_25px_70px_rgba(15,23,42,0.3)]">
                                        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Secure video</p>
                                        <p className="mt-3 text-xl font-semibold text-white">HIPAA-ready consultations</p>
                                    </div>
                                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl shadow-[0_25px_70px_rgba(15,23,42,0.3)]">
                                        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Smart automation</p>
                                        <p className="mt-3 text-xl font-semibold text-white">Auto triage and follow-up workflows</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Features Grid */}
                <section id="features" className="py-20 border-t border-white/5 relative">
                    <div className="text-center mb-12">
                        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">What makes us premium</p>
                        <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">Engineered for speed, security and scale.</h2>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="group relative p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.25)] hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 rounded-3xl bg-cyan-500/15 flex items-center justify-center mb-6 text-cyan-300 group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-3">Smart Scheduling</h3>
                            <p className="text-slate-400 leading-relaxed">Enterprise calendars, provider optimization, and SLA-aware scheduling for every care touchpoint.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.25)] hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 rounded-3xl bg-blue-500/15 flex items-center justify-center mb-6 text-blue-300 group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-3">Telemedicine Ready</h3>
                            <p className="text-slate-400 leading-relaxed">Secure, low-latency video sessions with enterprise-grade encryption and provider continuity.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.25)] hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 rounded-3xl bg-teal-500/15 flex items-center justify-center mb-6 text-teal-300 group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-3">Unified Health Records</h3>
                            <p className="text-slate-400 leading-relaxed">A secure single source of truth for patient history, prescriptions, diagnostics, and workflow data.</p>
                        </div>
                    </div>
                </section>

                <section id="benefits" className="py-20 border-t border-white/5">
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.2)]">
                            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Built for leaders</p>
                            <h3 className="mt-5 text-2xl font-semibold text-white">Compliance first</h3>
                            <p className="mt-4 text-slate-400 leading-relaxed">Designed to meet healthcare regulations with SOC 2, HIPAA, and enterprise data governance in every workflow.</p>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.2)]">
                            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Built for growth</p>
                            <h3 className="mt-5 text-2xl font-semibold text-white">Scales with you</h3>
                            <p className="mt-4 text-slate-400 leading-relaxed">From single clinics to multi-national hospitals, our platform scales without compromising speed or reliability.</p>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.2)]">
                            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Built for trust</p>
                            <h3 className="mt-5 text-2xl font-semibold text-white">Enterprise security</h3>
                            <p className="mt-4 text-slate-400 leading-relaxed">End-to-end encryption, role-based access, and audit logs keep your patient and provider data protected.</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 text-center border-t border-white/10 text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} SyncClinic Platform. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
