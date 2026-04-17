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
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-teal-600/20 rounded-full blur-[120px]"></div>
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDAuNWg0MC41djQwLjVIMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl flex flex-col min-h-screen">
                {/* Header Navbar */}
                <header className="flex items-center justify-between py-6 animate-fade-in-down w-full">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-10 h-10 rounded-2xl bg-[#0099FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,153,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,153,255,0.6)] transition-all duration-300">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-100 transition-colors">SyncClinic</span>
                    </div>
                    
                    {/* Right Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#features" className="text-slate-300 hover:text-white transition-colors duration-200">Features</a>
                        <a href="#benefits" className="text-slate-300 hover:text-white transition-colors duration-200">Benefits</a>
                        <button onClick={handleGetStarted} className="text-white hover:text-[#0099FF] transition-colors font-semibold">
                            Sign In
                        </button>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="relative flex-1 flex flex-col items-center justify-center w-full min-h-[85vh] py-24 my-6">
                    {/* Background Image (Full Bleed) */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[100vw] z-0 overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=2000&auto=format&fit=crop&q=80" 
                            alt="Healthcare Professional" 
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Modern Dark Gradient Overlay for readability & aesthetics */}
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80 z-10"></div>
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-20 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto text-center mt-10">
                        {/* Modern Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-8 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                            Next-Gen Telehealth
                        </div>
                        
                        {/* Huge Modern Typography */}
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.15] tracking-tight mb-8 text-balance">
                            Healthcare that revolves <br className="hidden md:block"/>
                            around your entire well-being.
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                            Book appointments, manage health records, attend secure video consultations, and receive digital prescriptions—all in one seamlessly integrated platform.
                        </p>
                        
                        {/* Glowing Modern Call-To-Action */}
                        <div className="flex justify-center w-full">
                            <button
                                type="button"
                                onClick={handleGetStarted}
                                className="group relative px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-lg hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_50px_rgba(0,153,255,0.4)] ring-4 ring-white/10"
                            >
                                Get Started Now
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Features Grid */}
                <section id="features" className="py-20 border-t border-white/5 relative">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Feature 1 */}
                        <div className="group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Smart Scheduling</h3>
                            <p className="text-slate-400 leading-relaxed">Find specialists easily and book appointments instantly with real-time availability sync.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Telemedicine Ready</h3>
                            <p className="text-slate-400 leading-relaxed">Connect with doctors through secure, high-quality video consultations from anywhere.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6 text-teal-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Unified Health Records</h3>
                            <p className="text-slate-400 leading-relaxed">Access your medical history, test reports, and digital prescriptions in one secure place.</p>
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
