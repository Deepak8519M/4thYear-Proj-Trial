<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VitaCore AI - Healthcare Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: "Inter", sans-serif;
            background-color: #0a0a0c;
            color: #ffffff;
        }

        /* --- UI COMPONENTS --- */
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
        }

        .gradient-text {
            background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-link:hover {
            color: #ffffff;
            transition: color 0.3s ease;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #0a0a0c;
        }
        ::-webkit-scrollbar-thumb {
            background: #27272a;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #3f3f46;
        }

        .hero-glow {
            position: absolute;
            top: -10%;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 400px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
            z-index: -1;
            filter: blur(60px);
        }

        .view-hidden {
            display: none !important;
        }

        .accordion-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }
        .accordion-item.active .accordion-content {
            max-height: 200px;
        }
        .accordion-item.active .accordion-icon {
            transform: rotate(180deg);
        }

        /* --- DASHBOARD DARK THEME STYLES --- */
        #dashboard-view {
            background-color: #09090b;
        }

        .sidebar-item {
            cursor: pointer;
            transition: all 0.2s ease;
            color: #71717a;
        }

        .sidebar-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: #ffffff;
        }

        .sidebar-item.active {
            background-color: #6366f1;
            color: white;
        }

        .status-badge {
            padding: 2px 10px;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }

        .dash-section {
            display: none;
        }

        .dash-section.active {
            display: block;
        }

        .card-hover:hover {
            transform: translateY(-2px);
            border-color: rgba(99, 102, 241, 0.3);
            transition: all 0.2s ease;
        }
    </style>

</head>
<body class="overflow-x-hidden">

    <!-- LANDING PAGE VIEW -->
    <div id="landing-page">
        <div class="hero-glow"></div>

        <!-- Navigation -->
        <nav class="sticky top-0 z-40 bg-[#0a0a0c]/80 backdrop-blur-md flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-white/5">
            <div class="flex items-center gap-8">
                <a href="#" class="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-heartbeat text-sm"></i>
                    </div>
                    <span>VitaCore AI</span>
                </a>
                <div class="hidden lg:flex items-center gap-6 text-sm text-zinc-400 font-medium">
                    <a href="#solutions" class="nav-link">Solutions</a>
                    <a href="#diagnostics" class="nav-link">Diagnostics</a>
                    <a href="#pricing" class="nav-link">Pricing</a>
                    <a href="#research" class="nav-link">Research</a>
                    <a href="#faq" class="nav-link">FAQ</a>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <button onclick="toggleView('signin')" class="text-sm text-zinc-400 hover:text-white px-4 py-2 transition-all">Sign In</button>
                <button class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/20 transition-all">
                    Start Free Trial
                </button>
            </div>
        </nav>

        <!-- Hero Section -->
        <header id="home" class="max-w-4xl mx-auto pt-24 pb-16 px-6 text-center">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs font-medium text-zinc-400 mb-8">
                <span class="bg-indigo-500 w-1.5 h-1.5 rounded-full animate-pulse"></span>
                New: AI-Driven Predictive Care Analytics 3.0
            </div>
            <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
                <span class="gradient-text">Intelligent care</span><br />
                for every patient.
            </h1>
            <p class="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                The next-generation health platform to manage clinical workflows, patient data, and AI diagnostics in one secure interface.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button class="w-full sm:w-auto bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-zinc-200 transition-all text-sm">
                    Register Clinic
                </button>
                <button class="w-full sm:w-auto bg-zinc-900/50 border border-zinc-800 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-zinc-800 transition-all text-sm flex items-center justify-center gap-2">
                    <i class="fas fa-play text-[10px]"></i> Product Tour
                </button>
            </div>
        </header>

        <!-- Main Dashboard Preview -->
        <section class="max-w-6xl mx-auto px-6 mb-32 relative">
            <div class="relative rounded-2xl overflow-hidden glass-card p-2 md:p-4 shadow-2xl shadow-indigo-500/5 border border-white/10">
                <div class="flex bg-zinc-950 rounded-xl overflow-hidden min-h-[500px] md:min-h-[700px] border border-white/5">
                    <aside class="hidden md:flex w-64 bg-zinc-900/50 border-r border-white/5 flex-col p-6">
                        <div class="flex items-center gap-3 mb-10">
                            <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <i class="fas fa-hospital-user"></i>
                            </div>
                            <span class="font-semibold text-sm">Clinic Admin</span>
                        </div>
                        <nav class="space-y-4">
                            <div class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Medical</div>
                            <div class="flex items-center gap-3 text-white text-sm font-medium p-2 bg-zinc-800/50 rounded-lg">
                                <i class="fas fa-notes-medical text-zinc-400"></i> Patients
                            </div>
                            <div class="flex items-center gap-3 text-zinc-400 text-sm font-medium p-2 hover:bg-zinc-800/30 rounded-lg transition-all cursor-pointer">
                                <i class="fas fa-calendar-check"></i> Appointments
                            </div>
                        </nav>
                    </aside>
                    <main class="flex-1 p-6 md:p-10 overflow-y-auto">
                        <div class="flex items-center justify-between mb-10">
                            <h2 class="text-2xl font-bold text-white">Clinical Analytics</h2>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div class="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                                <p class="text-zinc-500 text-sm mb-2">Total Patients</p>
                                <h3 class="text-3xl font-bold">12,482</h3>
                            </div>
                            <div class="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                                <p class="text-zinc-500 text-sm mb-2">Wellness Index</p>
                                <h3 class="text-3xl font-bold">88.2%</h3>
                            </div>
                            <div class="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                                <p class="text-zinc-500 text-sm mb-2">Active Care Plans</p>
                                <h3 class="text-3xl font-bold">3,156</h3>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full z-[-1]"></div>
        </section>

        <!-- Trusted By Medical Institutions -->
        <section class="max-w-7xl mx-auto px-6 mb-32 text-center">
            <p class="text-zinc-500 text-sm font-semibold mb-10 tracking-widest uppercase">Adopted by Leading Medical Institutions</p>
            <div class="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div class="text-xl font-bold flex items-center gap-2"><i class="fas fa-clinic-medical"></i> Mayo Clinic</div>
                <div class="text-xl font-bold flex items-center gap-2"><i class="fas fa-heart"></i> NHS</div>
                <div class="text-xl font-bold flex items-center gap-2"><i class="fas fa-flask"></i> Pfizer</div>
                <div class="text-xl font-bold flex items-center gap-2"><i class="fas fa-hospital"></i> Kaiser</div>
                <div class="text-xl font-bold flex items-center gap-2"><i class="fas fa-user-md"></i> BlueCross</div>
            </div>
        </section>

        <!-- Healthcare Features -->
        <section id="features" class="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-32">
            <div class="p-8 rounded-3xl glass-card border-white/5 group transition-all hover:bg-white/5">
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                    <i class="fas fa-brain text-xl"></i>
                </div>
                <h4 class="text-xl font-bold mb-4">AI Diagnostics</h4>
                <p class="text-zinc-400 leading-relaxed text-sm">Advanced machine learning models to assist in early detection and diagnosis of chronic conditions.</p>
            </div>
            <div class="p-8 rounded-3xl glass-card border-white/5 group transition-all hover:bg-white/5">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                    <i class="fas fa-file-medical-alt text-xl"></i>
                </div>
                <h4 class="text-xl font-bold mb-4">Secure EMR</h4>
                <p class="text-zinc-400 leading-relaxed text-sm">Fully encrypted Electronic Medical Records ensuring patient privacy and HIPAA/GDPR compliance.</p>
            </div>
            <div class="p-8 rounded-3xl glass-card border-white/5 group transition-all hover:bg-white/5">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                    <i class="fas fa-laptop-medical text-xl"></i>
                </div>
                <h4 class="text-xl font-bold mb-4">Telehealth Suite</h4>
                <p class="text-zinc-400 leading-relaxed text-sm">Seamless video consultations integrated directly with patient charts and pharmacy workflows.</p>
            </div>
        </section>

        <!-- Solutions/Specialties Section -->
        <section id="solutions" class="max-w-7xl mx-auto px-6 mb-32">
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold mb-6 gradient-text">Clinical Solutions</h2>
                <p class="text-zinc-400 max-w-2xl mx-auto">Tailored AI modules designed for specialized medical departments, improving patient outcomes across the board.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="p-6 rounded-2xl glass-card border-white/5 hover:border-indigo-500/50 transition-colors">
                    <i class="fas fa-lungs text-indigo-400 text-3xl mb-4"></i>
                    <h5 class="font-bold text-lg mb-2">Pulmonology</h5>
                    <p class="text-zinc-500 text-sm">Automated lung scan analysis for early detection of respiratory ailments.</p>
                </div>
                <div class="p-6 rounded-2xl glass-card border-white/5 hover:border-indigo-500/50 transition-colors">
                    <i class="fas fa-microscope text-indigo-400 text-3xl mb-4"></i>
                    <h5 class="font-bold text-lg mb-2">Oncology</h5>
                    <p class="text-zinc-500 text-sm">Pattern recognition for tumor identification with 99.8% precision.</p>
                </div>
                <div class="p-6 rounded-2xl glass-card border-white/5 hover:border-indigo-500/50 transition-colors">
                    <i class="fas fa-heartbeat text-indigo-400 text-3xl mb-4"></i>
                    <h5 class="font-bold text-lg mb-2">Cardiology</h5>
                    <p class="text-zinc-500 text-sm">Real-time ECG monitoring and cardiac event prediction systems.</p>
                </div>
                <div class="p-6 rounded-2xl glass-card border-white/5 hover:border-indigo-500/50 transition-colors">
                    <i class="fas fa-bone text-indigo-400 text-3xl mb-4"></i>
                    <h5 class="font-bold text-lg mb-2">Orthopedics</h5>
                    <p class="text-zinc-500 text-sm">Advanced bone density analysis and fracture risk assessments.</p>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section id="pricing" class="max-w-7xl mx-auto px-6 mb-32">
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold mb-6 gradient-text">Scalable Pricing</h2>
                <p class="text-zinc-400">Choose the plan that fits your facility's specific needs.</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="p-8 rounded-3xl glass-card border-white/5 flex flex-col">
                    <h5 class="text-xl font-bold mb-4">Clinic Lite</h5>
                    <p class="text-4xl font-bold mb-6">$199<span class="text-sm font-normal text-zinc-500">/mo</span></p>
                    <button class="w-full py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors font-bold text-sm">Choose Plan</button>
                </div>
                <div class="p-8 rounded-3xl glass-card border-indigo-500/50 bg-indigo-500/5 flex flex-col relative">
                    <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase">Most Popular</div>
                    <h5 class="text-xl font-bold mb-4">Professional</h5>
                    <p class="text-4xl font-bold mb-6">$599<span class="text-sm font-normal text-zinc-500">/mo</span></p>
                    <button class="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors font-bold text-sm">Choose Plan</button>
                </div>
                <div class="p-8 rounded-3xl glass-card border-white/5 flex flex-col">
                    <h5 class="text-xl font-bold mb-4">Enterprise</h5>
                    <p class="text-4xl font-bold mb-6">Custom</p>
                    <button class="w-full py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors font-bold text-sm">Contact Sales</button>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section id="faq" class="max-w-3xl mx-auto px-6 mb-32">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-4">FAQ</h2>
            </div>
            <div class="space-y-4">
                <div class="accordion-item glass-card border-white/5 rounded-2xl overflow-hidden">
                    <button onclick="toggleAccordion(this)" class="w-full p-6 text-left flex justify-between items-center font-bold">
                        Is VitaCore AI HIPAA compliant?
                        <i class="fas fa-chevron-down accordion-icon transition-transform"></i>
                    </button>
                    <div class="accordion-content">
                        <div class="p-6 pt-0 text-zinc-400 text-sm">Yes, VitaCore AI is fully HIPAA, GDPR, and SOC2 compliant. We use enterprise-grade encryption.</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="border-t border-white/5 pt-20 pb-10">
            <div class="max-w-7xl mx-auto px-6 text-center text-zinc-500 text-xs">
                <p>&copy; 2024 VitaCore AI. All rights reserved.</p>
            </div>
        </footer>
    </div>

    <!-- --- DARK THEMED DASHBOARD VIEW (HIDDEN INITIALLY) --- -->
    <div id="dashboard-view" class="view-hidden flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-64 border-r border-white/5 bg-[#09090b] flex flex-col hidden lg:flex">
            <div class="p-6">
                <div class="flex items-center gap-2 mb-8">
                    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
                        <i class="fas fa-plus text-white text-sm"></i>
                    </div>
                    <span class="font-bold text-xl tracking-tight">Vita<span class="text-indigo-500">Core</span></span>
                </div>
                <nav class="space-y-1">
                    <p class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-3">Clinical Management</p>
                    <div onclick="switchDashView('overview')" id="nav-overview" class="sidebar-item active flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all">
                        <i class="fas fa-home text-lg"></i>
                        <span class="font-medium text-sm">Overview</span>
                    </div>
                    <div onclick="switchDashView('patients')" id="nav-patients" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all">
                        <i class="fas fa-user-injured text-lg"></i>
                        <span class="font-medium text-sm">Patients</span>
                    </div>
                    <div onclick="switchDashView('appointments')" id="nav-appointments" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all">
                        <i class="fas fa-calendar-alt text-lg"></i>
                        <span class="font-medium text-sm">Appointments</span>
                    </div>
                    <div onclick="switchDashView('diagnostics')" id="nav-diagnostics" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all">
                        <i class="fas fa-microscope text-lg"></i>
                        <span class="font-medium text-sm">Diagnostics</span>
                    </div>
                    <div onclick="switchDashView('billing')" id="nav-billing" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all">
                        <i class="fas fa-file-invoice-dollar text-lg"></i>
                        <span class="font-medium text-sm">Billing</span>
                    </div>
                </nav>
            </div>
            <div class="mt-auto p-6 border-t border-white/5">
                <div class="glass-card p-4 rounded-2xl border-white/10 bg-indigo-500/5">
                    <p class="text-xs font-bold text-indigo-400 mb-1">Support Active</p>
                    <p class="text-[10px] text-zinc-400 mb-3">On-call specialists ready</p>
                    <button class="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors">Emergency Desk</button>
                </div>
                <button onclick="logout()" class="w-full mt-4 text-zinc-500 text-xs font-bold hover:text-red-400 transition-colors"><i class="fas fa-sign-out-alt mr-2"></i>Sign Out</button>
            </div>
        </aside>

        <!-- Main Dashboard Content -->
        <main class="flex-1 flex flex-col max-h-screen overflow-y-auto">
            <header class="h-20 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 id="dash-header-title" class="text-xl font-bold text-white uppercase tracking-tight">Clinical Overview</h1>
                    <p id="dash-header-subtitle" class="text-zinc-500 text-xs">Welcome back, Dr. Sarah Johnson.</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 relative">
                        <i class="far fa-bell"></i>
                        <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-[#09090b]"></span>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="text-right hidden sm:block">
                            <p class="text-xs font-bold text-white">Dr. Sarah Johnson</p>
                            <p class="text-[10px] text-zinc-500">Chief Resident</p>
                        </div>
                        <img src="https://images.unsplash.com/photo-1559839734-2b71f1536783?w=100&h=100&fit=crop" class="w-10 h-10 rounded-xl border border-white/10 shadow-lg">
                    </div>
                </div>
            </header>

            <div class="p-8 space-y-8">
                <!-- OVERVIEW SECTION -->
                <div id="dash-overview" class="dash-section active space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="glass-card p-6 rounded-3xl border-white/5 card-hover">
                            <div class="flex justify-between mb-4">
                                <div class="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center"><i class="fas fa-users text-xl"></i></div>
                                <span class="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">+1.4%</span>
                            </div>
                            <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest">Active Patients</p>
                            <h3 class="text-3xl font-bold mt-1 text-white">1,284</h3>
                        </div>
                        <div class="glass-card p-6 rounded-3xl border-white/5 card-hover">
                            <div class="flex justify-between mb-4">
                                <div class="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center"><i class="fas fa-user-clock text-xl"></i></div>
                                <span class="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-lg">-4.2%</span>
                            </div>
                            <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest">Avg. Consultation</p>
                            <h3 class="text-3xl font-bold mt-1 text-white">18m 20s</h3>
                        </div>
                        <div class="glass-card p-6 rounded-3xl border-white/5 card-hover">
                            <div class="flex justify-between mb-4">
                                <div class="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center"><i class="fas fa-smile text-xl"></i></div>
                                <span class="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">98%</span>
                            </div>
                            <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest">Satisfaction</p>
                            <h3 class="text-3xl font-bold mt-1 text-white">4.9/5.0</h3>
                        </div>
                        <div class="glass-card p-6 rounded-3xl border-white/5 card-hover">
                            <div class="flex justify-between mb-4">
                                <div class="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center"><i class="fas fa-bed text-xl"></i></div>
                                <span class="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg">High</span>
                            </div>
                            <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest">Occupancy</p>
                            <h3 class="text-3xl font-bold mt-1 text-white">92.4%</h3>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2 glass-card p-8 rounded-3xl border-white/5">
                            <div class="flex justify-between items-center mb-8">
                                <h2 class="text-sm font-bold uppercase tracking-widest text-zinc-400">Patient Admission Trends</h2>
                            </div>
                            <div class="h-80 w-full"><canvas id="admissionChart"></canvas></div>
                        </div>
                        <div class="glass-card p-8 rounded-3xl border-white/5">
                            <h2 class="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-8">Referral Channels</h2>
                            <div class="space-y-6" id="referral-list"></div>
                        </div>
                    </div>
                </div>

                <!-- PATIENTS SECTION -->
                <div id="dash-patients" class="dash-section space-y-8">
                    <div class="glass-card p-8 rounded-3xl border-white/5">
                        <div class="flex justify-between items-center mb-8">
                            <h2 class="text-lg font-bold">Patient Directory</h2>
                            <button class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/40">+ Add New</button>
                        </div>
                        <div id="patients-table-container"></div>
                    </div>
                </div>

                <!-- DIAGNOSTICS SECTION -->
                <div id="dash-diagnostics" class="dash-section">
                    <div class="glass-card p-8 rounded-3xl border-white/5">
                        <h2 class="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-8 text-center">AI Analysis Queue</h2>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center"><i class="fas fa-microscope text-sm"></i></div>
                                    <div><p class="font-bold text-sm text-white">Blood Scan - E. Howard</p><p class="text-[10px] text-zinc-500">Ready for review</p></div>
                                </div>
                                <span class="status-badge bg-emerald-500/20 text-emerald-400">Complete</span>
                            </div>
                            <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center"><i class="fas fa-x-ray text-sm"></i></div>
                                    <div><p class="font-bold text-sm text-white">Thoracic X-Ray - R. Williams</p><p class="text-[10px] text-zinc-500">Processing pattern matching...</p></div>
                                </div>
                                <span class="status-badge bg-amber-500/20 text-amber-400">Processing</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Placeholder for other sections -->
                <div id="dash-appointments" class="dash-section"><div class="glass-card p-20 text-center rounded-3xl text-zinc-500">Appointments view integration...</div></div>
                <div id="dash-billing" class="dash-section"><div class="glass-card p-20 text-center rounded-3xl text-zinc-500">Financial records view integration...</div></div>
            </div>
        </main>
    </div>

    <!-- Auth Modal -->
    <div id="signin-view" class="view-hidden fixed inset-0 z-50 flex items-center justify-center p-6">
        <div onclick="toggleView('main')" class="absolute inset-0 bg-zinc-950/90 backdrop-blur-md cursor-pointer"></div>
        <div class="relative w-full max-w-md p-8 glass-card rounded-3xl border border-white/10 shadow-2xl">
            <button onclick="toggleView('main')" class="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><i class="fas fa-times text-lg"></i></button>
            <div class="flex items-center justify-center gap-2 font-bold text-2xl mb-8">
                <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center"><i class="fas fa-heartbeat text-lg"></i></div>
                <span>VitaCore AI</span>
            </div>
            <h2 class="text-2xl font-bold mb-2 text-center">Welcome back</h2>
            <p class="text-zinc-500 text-sm mb-8 text-center">Enter your medical credentials.</p>
            <form id="signin-form" class="space-y-5">
                <input type="email" required placeholder="Clinical Email" class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 transition-all outline-none text-white">
                <input type="password" required placeholder="Access Token" class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 transition-all outline-none text-white">
                <button type="submit" class="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all text-sm mt-4">Authenticate System</button>
            </form>
        </div>
    </div>

    <script>
        // VIEW TOGGLING
        function toggleView(view) {
            const signin = document.getElementById('signin-view');
            const landing = document.getElementById('landing-page');
            const dashboard = document.getElementById('dashboard-view');
            const body = document.body;

            if (view === 'signin') {
                signin.classList.remove('view-hidden');
                body.style.overflow = 'hidden';
            } else if (view === 'dashboard') {
                landing.classList.add('view-hidden');
                signin.classList.add('view-hidden');
                dashboard.classList.remove('view-hidden');
                body.style.overflow = 'auto';
                initCharts();
                populateDashLists();
            } else {
                signin.classList.add('view-hidden');
                body.style.overflow = 'auto';
            }
        }

        function logout() {
            document.getElementById('dashboard-view').classList.add('view-hidden');
            document.getElementById('landing-page').classList.remove('view-hidden');
            window.scrollTo(0,0);
        }

        // DASHBOARD NAVIGATION
        function switchDashView(viewId) {
            document.querySelectorAll(".dash-section").forEach(s => s.classList.remove("active"));
            const target = document.getElementById("dash-" + viewId);
            if(target) target.classList.add("active");

            document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
            document.getElementById("nav-" + viewId).classList.add("active");

            const titles = { overview: "Clinical Overview", patients: "Patient Directory", appointments: "Appointment Schedule", diagnostics: "Diagnostics Center", billing: "Billing & Invoices" };
            document.getElementById("dash-header-title").innerText = titles[viewId];
        }

        // DASHBOARD CONTENT POPULATION
        function populateDashLists() {
            const referrals = [
                { icon: "fa-stethoscope", label: "Direct GP", val: "642", color: "indigo" },
                { icon: "fa-ambulance", label: "Emergency", val: "214", color: "rose" },
                { icon: "fa-globe", label: "Online Portal", val: "482", color: "amber" }
            ];
            document.getElementById("referral-list").innerHTML = referrals.map(r => `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-${r.color}-500/10 text-${r.color}-400 rounded-xl flex items-center justify-center"><i class="fas ${r.icon} text-xs"></i></div>
                        <p class="text-xs font-medium text-white">${r.label}</p>
                    </div>
                    <p class="text-xs font-bold text-white">${r.val}</p>
                </div>
            `).join("");

            const patientData = [
                { name: "Esther Howard", id: "VC-2023-014", age: "42/F", visit: "Oct 24" },
                { name: "Robert Williams", id: "VC-2023-082", age: "61/M", visit: "Oct 23" },
                { name: "Darlene Robertson", id: "VC-2023-112", age: "54/F", visit: "Oct 22" }
            ];
            document.getElementById("patients-table-container").innerHTML = `
                <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="text-left border-b border-white/5">
                        <tr class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><th class="pb-4">Name</th><th class="pb-4">Patient ID</th><th class="pb-4">Age/Sex</th><th class="pb-4">Last Visit</th></tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        ${patientData.map(p => `<tr class="text-xs"><td class="py-4 font-bold text-white">${p.name}</td><td class="py-4 text-zinc-400">${p.id}</td><td class="py-4 text-zinc-400">${p.age}</td><td class="py-4 text-zinc-500">${p.visit}</td></tr>`).join("")}
                    </tbody>
                </table></div>`;
        }

        // CHART INITIALIZATION
        let admChart = null;
        function initCharts() {
            if(admChart) admChart.destroy();
            const ctx = document.getElementById('admissionChart').getContext('2d');

            // Set Chart Defaults for Dark Mode
            Chart.defaults.color = '#71717a';
            Chart.defaults.font.family = 'Inter';

            admChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [{
                        label: 'Inpatient',
                        data: [800, 1100, 950, 1200, 1150, 1400, 1300, 1250, 1600, 1840],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.05)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.03)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        function toggleAccordion(btn) {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        }

        // SIGN IN LOGIC
        document.getElementById('signin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerText;
            btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> Verifying System...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> System Authorized';
                btn.classList.add('bg-emerald-500', 'text-white');
                setTimeout(() => {
                    toggleView('dashboard');
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.classList.remove('bg-emerald-500', 'text-white');
                }, 800);
            }, 1500);
        });

        // Intersection Observer for scroll reveal
        document.addEventListener('DOMContentLoaded', () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('opacity-100', 'translate-y-0');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.glass-card, header, #features div, #solutions div').forEach(card => {
                card.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
                observer.observe(card);
            });
        });
    </script>

</body>
</html>
