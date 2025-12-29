<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Management App - Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0a0a0c;
            color: #ffffff;
        }

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
    </style>

</head>
<body class="overflow-x-hidden">

    <div class="hero-glow"></div>

    <!-- Navigation -->
    <nav class="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-white/5">
        <div class="flex items-center gap-8">
            <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
                <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <i class="fas fa-layer-group text-sm"></i>
                </div>
                <span>Management</span>
            </div>
            <div class="hidden md:flex items-center gap-6 text-sm text-zinc-400 font-medium">
                <a href="#" class="nav-link">Product</a>
                <a href="#" class="nav-link">Solutions</a>
                <a href="#" class="nav-link">Marketplace</a>
                <a href="#" class="nav-link">Pricing</a>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <button class="text-sm text-zinc-400 hover:text-white px-4 py-2 transition-all">Sign In</button>
            <button class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/20 transition-all">
                Get Started
            </button>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="max-w-4xl mx-auto pt-24 pb-16 px-6 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs font-medium text-zinc-400 mb-8">
            <span class="bg-indigo-500 w-1.5 h-1.5 rounded-full animate-pulse"></span>
            New: Enhanced Analytics Dashboard 2.0
        </div>
        <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
            <span class="gradient-text">Modern management</span><br/>
            for modern teams.
        </h1>
        <p class="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform to streamline your workflow, track progress in real-time, and scale your business with confidence.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button class="w-full sm:w-auto bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-zinc-200 transition-all text-sm">
                Start for free
            </button>
            <button class="w-full sm:w-auto bg-zinc-900/50 border border-zinc-800 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-zinc-800 transition-all text-sm flex items-center justify-center gap-2">
                <i class="fas fa-play text-[10px]"></i> Watch Demo
            </button>
        </div>
    </header>

    <!-- Main Dashboard Preview -->
    <section class="max-w-6xl mx-auto px-6 mb-32 relative">
        <div class="relative rounded-2xl overflow-hidden glass-card p-2 md:p-4 shadow-2xl shadow-indigo-500/5 border border-white/10">
            <!-- Mockup Sidebar + Content -->
            <div class="flex bg-zinc-950 rounded-xl overflow-hidden min-h-[500px] md:min-h-[700px] border border-white/5">
                <!-- Sidebar -->
                <aside class="hidden md:flex w-64 bg-zinc-900/50 border-r border-white/5 flex-col p-6">
                    <div class="flex items-center gap-3 mb-10">
                        <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <span class="font-semibold text-sm">Dashboard</span>
                    </div>
                    <nav class="space-y-4">
                        <div class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">General</div>
                        <div class="flex items-center gap-3 text-white text-sm font-medium p-2 bg-zinc-800/50 rounded-lg">
                            <i class="fas fa-th-large text-zinc-400"></i> Overview
                        </div>
                        <div class="flex items-center gap-3 text-zinc-400 text-sm font-medium p-2 hover:bg-zinc-800/30 rounded-lg transition-all cursor-pointer">
                            <i class="fas fa-chart-line"></i> Analytics
                        </div>
                        <div class="flex items-center gap-3 text-zinc-400 text-sm font-medium p-2 hover:bg-zinc-800/30 rounded-lg transition-all cursor-pointer">
                            <i class="fas fa-users"></i> Customers
                        </div>
                        <div class="mt-8 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Account</div>
                        <div class="flex items-center gap-3 text-zinc-400 text-sm font-medium p-2 hover:bg-zinc-800/30 rounded-lg transition-all cursor-pointer">
                            <i class="fas fa-cog"></i> Settings
                        </div>
                    </nav>
                </aside>

                <!-- Dashboard Content -->
                <main class="flex-1 p-6 md:p-10 overflow-y-auto">
                    <div class="flex items-center justify-between mb-10">
                        <div>
                            <h2 class="text-2xl font-bold text-white">Project Overview</h2>
                            <p class="text-zinc-500 text-sm">Welcome back, check your daily stats.</p>
                        </div>
                        <div class="flex gap-3">
                            <button class="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400"><i class="fas fa-search"></i></button>
                            <button class="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 relative">
                                <i class="fas fa-bell"></i>
                                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div class="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                            <p class="text-zinc-500 text-sm mb-2">Total Revenue</p>
                            <h3 class="text-3xl font-bold mb-4">$48,294</h3>
                            <div class="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                <i class="fas fa-arrow-up"></i> +12.5% <span class="text-zinc-500 font-normal ml-1">vs last month</span>
                            </div>
                        </div>
                        <div class="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                            <p class="text-zinc-500 text-sm mb-2">Active Projects</p>
                            <h3 class="text-3xl font-bold mb-4">156</h3>
                            <div class="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                <i class="fas fa-arrow-up"></i> +4.2% <span class="text-zinc-500 font-normal ml-1">vs last month</span>
                            </div>
                        </div>
                        <div class="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                            <p class="text-zinc-500 text-sm mb-2">Completion Rate</p>
                            <h3 class="text-3xl font-bold mb-4">94.8%</h3>
                            <div class="w-full bg-zinc-800 h-1.5 rounded-full mt-2">
                                <div class="bg-indigo-500 h-full w-[94.8%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Chart Mockup -->
                    <div class="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 h-64 flex flex-col justify-end gap-2">
                        <div class="flex justify-between items-end h-40 gap-2 px-4">
                            <div class="w-full bg-indigo-500/20 rounded-t-lg h-24 hover:bg-indigo-500/40 transition-all cursor-pointer"></div>
                            <div class="w-full bg-indigo-500/20 rounded-t-lg h-32 hover:bg-indigo-500/40 transition-all cursor-pointer"></div>
                            <div class="w-full bg-indigo-500/40 rounded-t-lg h-16 hover:bg-indigo-500/60 transition-all cursor-pointer"></div>
                            <div class="w-full bg-indigo-500/60 rounded-t-lg h-40 hover:bg-indigo-500/80 transition-all cursor-pointer shadow-lg shadow-indigo-500/20"></div>
                            <div class="w-full bg-indigo-500/30 rounded-t-lg h-28 hover:bg-indigo-500/50 transition-all cursor-pointer"></div>
                            <div class="w-full bg-indigo-500/20 rounded-t-lg h-20 hover:bg-indigo-500/40 transition-all cursor-pointer"></div>
                            <div class="w-full bg-indigo-500/40 rounded-t-lg h-36 hover:bg-indigo-500/60 transition-all cursor-pointer"></div>
                        </div>
                        <div class="flex justify-between text-[10px] text-zinc-500 px-4 mt-2">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Background decorative blur -->
        <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full z-[-1]"></div>
    </section>

    <!-- Trusted By Section -->
    <section class="max-w-7xl mx-auto px-6 mb-32 text-center">
        <p class="text-zinc-500 text-sm font-semibold mb-10 tracking-widest uppercase">Trusted by forward-thinking companies</p>
        <div class="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div class="text-xl font-bold flex items-center gap-2"><i class="fab fa-apple"></i> Apple</div>
            <div class="text-xl font-bold flex items-center gap-2"><i class="fab fa-google"></i> Google</div>
            <div class="text-xl font-bold flex items-center gap-2"><i class="fab fa-slack"></i> Slack</div>
            <div class="text-xl font-bold flex items-center gap-2"><i class="fab fa-spotify"></i> Spotify</div>
            <div class="text-xl font-bold flex items-center gap-2"><i class="fab fa-dropbox"></i> Dropbox</div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-32">
        <div class="p-8 rounded-3xl glass-card border-white/5 group hover:border-indigo-500/30 transition-all">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <i class="fas fa-bolt text-xl"></i>
            </div>
            <h4 class="text-xl font-bold mb-4">Ultra Fast Speed</h4>
            <p class="text-zinc-400 leading-relaxed text-sm">Experience real-time updates and lightning-fast response times for all your management tasks.</p>
        </div>
        <div class="p-8 rounded-3xl glass-card border-white/5 group hover:border-emerald-500/30 transition-all">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <i class="fas fa-shield-alt text-xl"></i>
            </div>
            <h4 class="text-xl font-bold mb-4">Enterprise Security</h4>
            <p class="text-zinc-400 leading-relaxed text-sm">Your data is protected with military-grade encryption and advanced security protocols.</p>
        </div>
        <div class="p-8 rounded-3xl glass-card border-white/5 group hover:border-amber-500/30 transition-all">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <i class="fas fa-magic text-xl"></i>
            </div>
            <h4 class="text-xl font-bold mb-4">Smart Automation</h4>
            <p class="text-zinc-400 leading-relaxed text-sm">Automate repetitive workflows and focus on what really matters for your team growth.</p>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/5 pt-20 pb-10">
        <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div class="col-span-2 lg:col-span-1">
                <div class="flex items-center gap-2 font-bold text-lg mb-6">
                    <div class="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                        <i class="fas fa-layer-group text-[10px]"></i>
                    </div>
                    <span>Management</span>
                </div>
                <p class="text-zinc-500 text-sm leading-relaxed mb-6">
                    Building the future of modern team collaboration and management.
                </p>
                <div class="flex gap-4 text-zinc-500">
                    <a href="#" class="hover:text-white"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="hover:text-white"><i class="fab fa-linkedin"></i></a>
                    <a href="#" class="hover:text-white"><i class="fab fa-github"></i></a>
                </div>
            </div>
            <div>
                <h5 class="font-bold text-sm mb-6 uppercase tracking-widest text-zinc-300">Product</h5>
                <ul class="space-y-4 text-zinc-500 text-sm">
                    <li><a href="#" class="hover:text-white">Features</a></li>
                    <li><a href="#" class="hover:text-white">Integrations</a></li>
                    <li><a href="#" class="hover:text-white">Pricing</a></li>
                    <li><a href="#" class="hover:text-white">Changelog</a></li>
                </ul>
            </div>
            <div>
                <h5 class="font-bold text-sm mb-6 uppercase tracking-widest text-zinc-300">Company</h5>
                <ul class="space-y-4 text-zinc-500 text-sm">
                    <li><a href="#" class="hover:text-white">About Us</a></li>
                    <li><a href="#" class="hover:text-white">Careers</a></li>
                    <li><a href="#" class="hover:text-white">Blog</a></li>
                    <li><a href="#" class="hover:text-white">Contact</a></li>
                </ul>
            </div>
            <div>
                <h5 class="font-bold text-sm mb-6 uppercase tracking-widest text-zinc-300">Legal</h5>
                <ul class="space-y-4 text-zinc-500 text-sm">
                    <li><a href="#" class="hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" class="hover:text-white">Terms of Service</a></li>
                    <li><a href="#" class="hover:text-white">Cookie Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-6 border-t border-white/5 pt-10 text-zinc-500 text-xs">
            <p>&copy; 2024 Management Inc. All rights reserved.</p>
            <div class="flex gap-6">
                <a href="#" class="hover:text-white">Security</a>
                <a href="#" class="hover:text-white">Status</a>
                <a href="#" class="hover:text-white">Privacy</a>
            </div>
        </div>
    </footer>

    <script>
        // Simple scroll reveal effect for cards
        document.addEventListener('DOMContentLoaded', () => {
            const observerOptions = {
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('opacity-100');
                        entry.target.classList.remove('translate-y-10');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.glass-card').forEach(card => {
                card.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
                observer.observe(card);
            });
        });
    </script>

</body>
</html>
