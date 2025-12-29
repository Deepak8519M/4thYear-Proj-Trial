<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clix Dashboard - Analytics</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F8FAFC;
            color: #1E293B;
        }

        .sidebar-item:hover {
            background-color: #F1F5F9;
        }

        .sidebar-item.active {
            background-color: #1E293B;
            color: white;
        }

        .sidebar-item.active i {
            color: white;
        }

        .custom-shadow {
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .status-badge {
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        .card-hover:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease;
        }
    </style>

</head>
<body class="flex min-h-screen">

    <!-- Sidebar -->
    <aside class="w-64 border-r border-slate-200 bg-white flex flex-col hidden lg:flex">
        <div class="p-6">
            <div class="flex items-center gap-2 mb-8">
                <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <i class="fas fa-bolt text-white text-sm"></i>
                </div>
                <span class="font-bold text-xl tracking-tight">Clix</span>
            </div>

            <nav class="space-y-1">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">General</p>
                <a href="#" class="sidebar-item active flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all">
                    <i class="fas fa-th-large text-lg"></i>
                    <span class="font-medium">Overview</span>
                </a>
                <a href="#" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 transition-all">
                    <i class="fas fa-chart-line text-lg"></i>
                    <span class="font-medium">Analytics</span>
                </a>
                <a href="#" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 transition-all">
                    <i class="fas fa-users text-lg"></i>
                    <span class="font-medium">Customers</span>
                </a>
                <a href="#" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 transition-all">
                    <i class="fas fa-wallet text-lg"></i>
                    <span class="font-medium">Transactions</span>
                </a>
                <a href="#" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 transition-all">
                    <i class="fas fa-cog text-lg"></i>
                    <span class="font-medium">Settings</span>
                </a>
            </nav>
        </div>

        <div class="mt-auto p-6 border-t border-slate-100">
            <div class="bg-slate-50 p-4 rounded-2xl">
                <p class="text-xs font-semibold text-slate-400 mb-2">PRO PLAN</p>
                <p class="text-sm font-bold mb-3">Upgrade to unlock more features</p>
                <button class="w-full bg-black text-white py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">Upgrade Now</button>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col max-h-screen overflow-y-auto">
        <!-- Header -->
        <header class="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
            <div>
                <h1 class="text-2xl font-bold">Analytics Overview</h1>
                <p class="text-slate-500 text-sm">Welcome back, check your store status today.</p>
            </div>

            <div class="flex items-center gap-4">
                <div class="relative hidden md:block">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" placeholder="Search..." class="bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-slate-200 w-64 outline-none">
                </div>
                <button class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                    <i class="far fa-bell"></i>
                </button>
                <div class="w-10 h-10 rounded-xl overflow-hidden cursor-pointer border-2 border-white shadow-sm">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="Avatar">
                </div>
            </div>
        </header>

        <!-- Content Area -->
        <div class="p-8 space-y-8">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Users -->
                <div class="bg-white p-6 rounded-3xl custom-shadow card-hover border border-slate-100">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-users text-xl"></i>
                        </div>
                        <span class="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12.5%</span>
                    </div>
                    <p class="text-slate-500 text-sm font-medium">Total Users</p>
                    <h3 class="text-2xl font-bold mt-1">48,294</h3>
                </div>

                <!-- Total Sessions -->
                <div class="bg-white p-6 rounded-3xl custom-shadow card-hover border border-slate-100">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-clock text-xl"></i>
                        </div>
                        <span class="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+8.2%</span>
                    </div>
                    <p class="text-slate-500 text-sm font-medium">Avg. Session Duration</p>
                    <h3 class="text-2xl font-bold mt-1">12m 45s</h3>
                </div>

                <!-- Bounce Rate -->
                <div class="bg-white p-6 rounded-3xl custom-shadow card-hover border border-slate-100">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-arrow-trend-down text-xl"></i>
                        </div>
                        <span class="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">-2.4%</span>
                    </div>
                    <p class="text-slate-500 text-sm font-medium">Bounce Rate</p>
                    <h3 class="text-2xl font-bold mt-1">42.18%</h3>
                </div>

                <!-- Conversions -->
                <div class="bg-white p-6 rounded-3xl custom-shadow card-hover border border-slate-100">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-bullseye text-xl"></i>
                        </div>
                        <span class="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+14.2%</span>
                    </div>
                    <p class="text-slate-500 text-sm font-medium">Conversions</p>
                    <h3 class="text-2xl font-bold mt-1">3,842</h3>
                </div>
            </div>

            <!-- Main Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Chart -->
                <div class="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 custom-shadow">
                    <div class="flex justify-between items-center mb-8">
                        <div>
                            <h2 class="text-lg font-bold">Store Activity</h2>
                            <p class="text-slate-400 text-sm">Real-time performance metrics</p>
                        </div>
                        <div class="flex gap-2">
                            <button class="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Weekly</button>
                            <button class="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold">Monthly</button>
                        </div>
                    </div>
                    <div class="h-80 w-full">
                        <canvas id="activityChart"></canvas>
                    </div>
                </div>

                <!-- Traffic Source -->
                <div class="bg-white p-8 rounded-3xl border border-slate-100 custom-shadow">
                    <h2 class="text-lg font-bold mb-1">Traffic Channels</h2>
                    <p class="text-slate-400 text-sm mb-8">Top performing sources</p>

                    <div class="space-y-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                    <i class="fab fa-facebook-f"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold">Facebook</p>
                                    <p class="text-xs text-slate-400">Social Media</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold">12,842</p>
                                <p class="text-xs text-green-500">+12%</p>
                            </div>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center">
                                    <i class="fab fa-google"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold">Google</p>
                                    <p class="text-xs text-slate-400">Search Engine</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold">8,432</p>
                                <p class="text-xs text-green-500">+5%</p>
                            </div>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
                                    <i class="fab fa-instagram"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold">Instagram</p>
                                    <p class="text-xs text-slate-400">Social Media</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold">5,102</p>
                                <p class="text-xs text-red-500">-2%</p>
                            </div>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                                    <i class="fab fa-youtube"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold">YouTube</p>
                                    <p class="text-xs text-slate-400">Video Content</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold">3,842</p>
                                <p class="text-xs text-green-500">+18%</p>
                            </div>
                        </div>
                    </div>

                    <button class="w-full mt-8 py-3 text-slate-400 text-sm font-semibold border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                        View Detailed Report
                    </button>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
                <!-- Recent Customers -->
                <div class="bg-white p-8 rounded-3xl border border-slate-100 custom-shadow">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-lg font-bold">Recent Signups</h2>
                        <button class="text-blue-600 text-sm font-bold">See all</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="text-left border-b border-slate-50">
                                    <th class="pb-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                                    <th class="pb-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                                    <th class="pb-4 text-xs font-bold text-slate-400 uppercase">Spent</th>
                                    <th class="pb-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                <tr>
                                    <td class="py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-slate-200"></div>
                                            <span class="text-sm font-bold">Alex Johnson</span>
                                        </div>
                                    </td>
                                    <td class="py-4">
                                        <span class="status-badge bg-green-100 text-green-600">Active</span>
                                    </td>
                                    <td class="py-4 text-sm font-bold">$1,240.00</td>
                                    <td class="py-4 text-sm text-slate-500">Oct 24, 2023</td>
                                </tr>
                                <tr>
                                    <td class="py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-slate-200"></div>
                                            <span class="text-sm font-bold">Sarah Williams</span>
                                        </div>
                                    </td>
                                    <td class="py-4">
                                        <span class="status-badge bg-blue-100 text-blue-600">Pending</span>
                                    </td>
                                    <td class="py-4 text-sm font-bold">$842.50</td>
                                    <td class="py-4 text-sm text-slate-500">Oct 23, 2023</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Goal Progress -->
                <div class="bg-white p-8 rounded-3xl border border-slate-100 custom-shadow flex flex-col">
                    <h2 class="text-lg font-bold mb-1">Monthly Goal</h2>
                    <p class="text-slate-400 text-sm mb-8">You are reaching your target!</p>

                    <div class="flex-1 flex flex-col justify-center items-center">
                        <div class="relative w-48 h-48">
                            <canvas id="goalChart"></canvas>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-4xl font-bold">84%</span>
                                <span class="text-xs text-slate-400 font-bold uppercase">Progress</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 w-full mt-8 gap-4">
                            <div class="bg-slate-50 p-4 rounded-2xl text-center">
                                <p class="text-xs text-slate-400 font-bold uppercase">Completed</p>
                                <p class="text-xl font-bold mt-1">$42.8k</p>
                            </div>
                            <div class="bg-slate-50 p-4 rounded-2xl text-center">
                                <p class="text-xs text-slate-400 font-bold uppercase">Target</p>
                                <p class="text-xl font-bold mt-1">$50.0k</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Main Activity Chart
        const ctx = document.getElementById('activityChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Sessions',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 42000, 38000, 45000, 48294],
                    borderColor: '#1E293B',
                    backgroundColor: 'rgba(30, 41, 59, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#1E293B',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1E293B',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        cornerRadius: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: (value) => value >= 1000 ? (value/1000) + 'k' : value
                        },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        border: { display: false }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                }
            }
        });

        // Goal Doughnut Chart
        const goalCtx = document.getElementById('goalChart').getContext('2d');
        new Chart(goalCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [84, 16],
                    backgroundColor: ['#1E293B', '#F1F5F9'],
                    borderWidth: 0,
                    circumference: 360,
                    rotation: 0,
                    cutout: '85%',
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                animation: { animateRotate: true, duration: 2000 }
            }
        });
    </script>

</body>
</html>
