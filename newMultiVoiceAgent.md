<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Medical Voice Specialist - Midnight</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #020617; /* Slate 950 */
            color: #f1f5f9;
            overflow-x: hidden;
        }

        .doctor-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(51, 65, 85, 0.5);
            backdrop-filter: blur(8px);
        }

        .doctor-card.active {
            background-color: #2563eb;
            color: white;
            border-color: #3b82f6;
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(37, 99, 235, 0.4);
        }

        .step-hidden {
            display: none !important;
        }

        .fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .status-glow-blue {
            box-shadow: 0 0 60px rgba(37, 99, 235, 0.2);
            border-color: #3b82f6 !important;
        }

        .status-glow-red {
            box-shadow: 0 0 60px rgba(239, 68, 68, 0.3);
            border-color: #ef4444 !important;
        }

        .neon-text-blue {
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        input::placeholder {
            color: #475569;
        }

        .pulse-active {
            animation: shadow-pulse 2s infinite ease-in-out;
        }

        @keyframes shadow-pulse {
            0% { box-shadow: 0 0 0 0px rgba(37, 99, 235, 0.4); }
            70% { box-shadow: 0 0 0 40px rgba(37, 99, 235, 0); }
            100% { box-shadow: 0 0 0 0px rgba(37, 99, 235, 0); }
        }

        .role-grid, .vault-list {
            max-height: 400px;
            overflow-y: auto;
            padding: 4px;
        }

        .role-grid::-webkit-scrollbar, .vault-list::-webkit-scrollbar {
            width: 4px;
        }
        .role-grid::-webkit-scrollbar-thumb, .vault-list::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 10px;
        }
    </style>

</head>
<body class="selection:bg-blue-500/30">

    <main class="min-h-screen">
        <!-- Setup Screen -->
        <section id="setup-screen" class="max-w-6xl mx-auto p-6 min-h-screen flex flex-col justify-center py-12 fade-in-up">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div class="space-y-8 text-center lg:text-left">
                    <div class="space-y-4">
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                            <i data-lucide="heart-pulse" class="w-3 h-3"></i> Midnight Multispecialty v9.0
                        </div>
                        <h1 class="text-7xl font-black text-white tracking-tighter leading-[0.9]">
                            Instant <br><span class="text-blue-600 neon-text-blue">Clinician.</span>
                        </h1>
                        <p class="text-slate-400 text-xl font-medium max-w-sm leading-relaxed">
                            Voice-activated medical assessment. High-speed neural consultations in dark mode.
                        </p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <div class="flex items-center gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-sm max-w-xs">
                            <div class="bg-blue-500/20 p-2.5 rounded-xl text-blue-400">
                                <i data-lucide="shield-check" class="w-5 h-5"></i>
                            </div>
                            <div class="text-left">
                                <p class="text-xs font-black text-slate-200 uppercase tracking-widest">Secure Core</p>
                                <p class="text-[11px] text-slate-500">HIPAA Compliant Session</p>
                            </div>
                        </div>
                        <button id="go-to-vault-btn" class="flex items-center gap-4 p-5 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl border border-slate-800 transition-all text-left">
                            <div class="bg-slate-700 p-2.5 rounded-xl text-slate-300">
                                <i data-lucide="database" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <p class="text-xs font-black text-slate-200 uppercase tracking-widest">Clinical Vault</p>
                                <p class="text-[11px] text-slate-500">View Patient History</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div class="bg-slate-900 rounded-[3rem] shadow-2xl p-10 border border-slate-800 space-y-8 relative overflow-hidden">
                    <div class="space-y-6">
                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Identity</label>
                            <div class="relative group">
                                <i data-lucide="user" class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
                                <input type="text" id="user-name" placeholder="Full Name" class="w-full pl-16 pr-6 py-6 bg-slate-950 border-2 border-slate-800 rounded-3xl focus:border-blue-500 outline-none transition-all text-2xl font-bold text-white">
                            </div>
                        </div>

                        <div class="space-y-4">
                            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Department</label>
                            <div class="grid grid-cols-3 gap-3 role-grid" id="doctor-selector">
                                <button data-role="GP" class="doctor-card active flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="stethoscope" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">General</span>
                                </button>
                                <button data-role="PEDIATRICIAN" class="doctor-card flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="baby" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">Pediatric</span>
                                </button>
                                <button data-role="DERMATOLOGIST" class="doctor-card flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="sparkles" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">Skin</span>
                                </button>
                                <button data-role="CARDIOLOGIST" class="doctor-card flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="heart" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">Heart</span>
                                </button>
                                <button data-role="NEUROLOGIST" class="doctor-card flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="brain" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">Brain</span>
                                </button>
                                <button data-role="PSYCHIATRIST" class="doctor-card flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="brain-circuit" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">Mental</span>
                                </button>
                                <button data-role="ORTHOPEDIC" class="doctor-card flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="bone" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">Bone</span>
                                </button>
                                <button data-role="GYNECOLOGIST" class="doctor-card flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="venus" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">Women</span>
                                </button>
                                <button data-role="OPHTHALMOLOGIST" class="doctor-card flex flex-col items-center p-4 rounded-3xl border-2 transition-all">
                                    <i data-lucide="eye" class="w-5 h-5 mb-2"></i>
                                    <span class="text-[9px] font-black uppercase tracking-tighter">Eye</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <p id="error-text" class="hidden p-4 bg-red-950/50 border border-red-900 rounded-2xl text-red-400 text-xs font-bold"></p>

                    <button id="start-btn" class="w-full bg-blue-600 text-white py-7 rounded-3xl font-black hover:bg-blue-500 transition-all flex items-center justify-center gap-4 text-2xl shadow-2xl active:scale-[0.97] group">
                        <i data-lucide="phone" class="w-7 h-7 fill-current group-hover:rotate-12 transition-transform"></i>
                        Establish Link
                    </button>
                </div>
            </div>
        </section>

        <!-- Vault Screen (New History Page) -->
        <section id="vault-screen" class="step-hidden max-w-4xl mx-auto p-10 min-h-screen py-24 fade-in-up">
            <div class="flex items-center justify-between mb-12">
                <div class="space-y-2">
                    <h1 class="text-6xl font-black text-white tracking-tighter leading-none">Clinical Vault</h1>
                    <p class="text-slate-500 font-bold tracking-[0.2em] text-[11px] uppercase">Personal Medical History Dashboard</p>
                </div>
                <button onclick="showView('setup')" class="px-8 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black hover:bg-slate-700 transition-all uppercase text-xs tracking-widest active:scale-95">
                    Back Home
                </button>
            </div>

            <div class="bg-slate-900 rounded-[3rem] border border-slate-800 p-8 shadow-2xl space-y-6">
                <div class="flex items-center justify-between px-4 border-b border-slate-800 pb-6">
                    <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                        <i data-lucide="history" class="w-4 h-4"></i> Recorded Sessions
                    </h3>
                    <button id="clear-vault-btn-full" class="text-xs text-red-500 hover:text-red-400 font-bold uppercase transition-colors">Wipe All Records</button>
                </div>
                <div id="vault-list-full" class="space-y-3 px-2">
                    <!-- History entries here -->
                </div>
            </div>
        </section>

        <!-- Consultation Screen -->
        <section id="consultation-screen" class="step-hidden max-w-4xl mx-auto h-screen flex flex-col justify-between py-24 fade-in-up">
            <div class="text-center space-y-10">
                <div class="flex justify-center">
                    <div class="px-8 py-3 bg-slate-900 rounded-full border border-slate-800 shadow-sm flex items-center gap-4">
                        <span class="flex h-3 w-3 relative">
                            <span id="status-ping" class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                            <span id="status-dot" class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <p id="status-label" class="text-[12px] font-black text-slate-300 uppercase tracking-widest">Active Call</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <h2 id="display-role" class="text-7xl font-black text-white tracking-tighter leading-none italic">Specialist</h2>
                    <p class="text-blue-500 font-bold uppercase tracking-[0.5em] text-[12px] opacity-80">High-Resolution Voice Stream</p>
                </div>
            </div>

            <div class="flex flex-col items-center justify-center space-y-16 my-10">
                <div id="main-avatar" class="relative z-10 w-72 h-72 rounded-[6rem] flex flex-col items-center justify-center border-[20px] border-slate-900 bg-slate-950 transition-all duration-500 shadow-[0_0_120px_rgba(0,0,0,0.9)] text-slate-700">
                    <div id="avatar-icon-container">
                        <i data-lucide="activity" class="w-16 h-16"></i>
                    </div>
                    <p id="avatar-label" class="text-[11px] font-black mt-8 uppercase tracking-[0.6em] opacity-40">Syncing</p>
                </div>

                <div class="max-w-3xl text-center min-h-[120px] flex items-center justify-center px-12">
                    <p id="transcript-text" class="text-slate-100 text-2xl font-bold leading-relaxed tracking-tight italic drop-shadow-lg text-center">Connecting neural link...</p>
                </div>
            </div>

            <div class="flex flex-col items-center gap-12 pb-10">
                <button id="end-btn" class="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-200 py-8 rounded-[3.5rem] font-black hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 group">
                    <i data-lucide="phone-off" class="w-7 h-7 text-red-500"></i>
                    End Consultation
                </button>
            </div>
        </section>

        <!-- Report Screen -->
        <section id="report-screen" class="step-hidden max-w-4xl mx-auto p-10 space-y-12 pb-32 fade-in-up">
            <div class="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-slate-800 gap-8 pb-10">
                <div class="space-y-3">
                    <h1 class="text-6xl font-black text-white tracking-tighter leading-none">Clinical Report</h1>
                    <p class="text-slate-500 font-bold tracking-[0.2em] text-[11px] uppercase">Official Assessment • Locally Stored</p>
                </div>
                <div class="flex gap-4">
                    <button id="download-btn" class="px-8 py-5 bg-slate-800 text-slate-300 rounded-2xl font-black hover:bg-slate-700 shadow-xl transition-all uppercase text-xs tracking-widest active:scale-95 flex items-center gap-2">
                        <i data-lucide="download" class="w-4 h-4"></i> Download
                    </button>
                    <button onclick="showView('setup')" class="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl transition-all uppercase text-xs tracking-widest active:scale-95">
                        Close Report
                    </button>
                </div>
            </div>

            <div class="bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-800 overflow-hidden">
                <div class="p-14 bg-slate-950/30 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-14 text-center md:text-left">
                    <div class="space-y-2">
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient</p>
                        <p id="report-name" class="text-2xl font-bold text-slate-100">-</p>
                    </div>
                    <div class="space-y-2">
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Provider</p>
                        <p id="report-role" class="text-2xl font-bold text-blue-400">-</p>
                    </div>
                    <div class="space-y-2">
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Case ID</p>
                        <p id="report-time" class="text-2xl font-bold text-slate-100">-</p>
                    </div>
                </div>

                <div class="p-14 space-y-20">
                    <section class="space-y-6">
                        <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                            <div class="w-8 h-[2px] bg-blue-600"></div> Case Presentation
                        </h3>
                        <p id="report-complaint" class="text-4xl text-white font-bold leading-tight tracking-tighter italic">-</p>
                    </section>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <section class="space-y-8">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                <i data-lucide="clipboard-list" class="w-5 h-5 text-blue-500"></i> Identified Markers
                            </h3>
                            <div id="report-symptoms" class="flex flex-wrap gap-2.5"></div>
                        </section>
                        <section class="space-y-8">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                <i data-lucide="clock" class="w-5 h-5 text-blue-500"></i> Progression Info
                            </h3>
                            <p id="report-duration" class="text-slate-300 font-bold text-xl leading-relaxed">-</p>
                        </section>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section class="bg-slate-950 p-12 rounded-[4rem] border border-slate-800 relative overflow-hidden group">
                            <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                            <div class="flex items-center gap-5 mb-8 relative z-10">
                                <i data-lucide="info" class="w-7 h-7 text-blue-400"></i>
                                <h3 class="text-xs font-black text-blue-400 uppercase tracking-[0.4em]">Professional Assessment</h3>
                            </div>
                            <p id="report-summary" class="text-slate-300 leading-relaxed font-medium text-xl relative z-10 italic">Summarizing...</p>
                        </section>

                        <section class="bg-blue-600/10 p-12 rounded-[4rem] border border-blue-500/30 relative overflow-hidden">
                            <div class="flex items-center gap-5 mb-8">
                                <i data-lucide="shield-alert" class="w-7 h-7 text-blue-400"></i>
                                <h3 class="text-xs font-black text-blue-400 uppercase tracking-[0.4em]">Recommended Action</h3>
                            </div>
                            <p id="report-recommendation" class="text-white font-bold text-2xl leading-tight">Analyzing...</p>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <script>
        const apiKey = "";
        const MODEL_CHAT = "gemini-2.5-flash-preview-09-2025";
        const MODEL_TTS = "gemini-2.5-flash-preview-tts";

        const DOCTOR_ROLES = {
            GP: { id: 'GP', title: 'General Physician', icon: 'stethoscope', voice: 'Kore', greeting: "Hello, I'm your doctor. What symptoms are you having today?", prompt: "Professional General Physician. Ask full, natural medical questions. Max 20 words. Focus on core symptoms, duration, and pain levels." },
            PEDIATRICIAN: { id: 'PEDIATRICIAN', title: 'Pediatrician', icon: 'baby', voice: 'Aoede', greeting: "Hi! How can I help your little one today? What are their symptoms?", prompt: "Gentle Pediatrician. Ask full medical questions about the child. Max 18 words." },
            DERMATOLOGIST: { id: 'DERMATOLOGIST', title: 'Dermatologist', icon: 'sparkles', voice: 'Zephyr', greeting: "Hello. REVIEWING SKIN CONCERNS. Where exactly is the issue located?", prompt: "Clinical Dermatologist. Ask about color, texture, itching, and spread. Max 20 words." },
            CARDIOLOGIST: { id: 'CARDIOLOGIST', title: 'Cardiologist', icon: 'heart', voice: 'Fenrir', greeting: "Cardiology department here. Are you feeling any chest pressure or palpitations?", prompt: "Expert Cardiologist. Ask about heart rate, pressure location, and breathing. Max 18 words." },
            NEUROLOGIST: { id: 'NEUROLOGIST', title: 'Neurologist', icon: 'brain', voice: 'Leda', greeting: "Hello. Are you experiencing any headaches, vision changes, or dizziness?", prompt: "Precise Neurologist. Ask about coordination, sensation, and headache patterns. Max 18 words." },
            PSYCHIATRIST: { id: 'PSYCHIATRIST', title: 'Psychiatrist', icon: 'brain-circuit', voice: 'Kore', greeting: "Hello. How has your emotional state or sleep been lately?", prompt: "Psychiatrist. Ask about mood, sleep, and well-being. Max 20 words." },
            ORTHOPEDIC: { id: 'ORTHOPEDIC', title: 'Orthopedic', icon: 'bone', voice: 'Fenrir', greeting: "Hello. Which joint or bone is causing you pain, and was there an injury?", prompt: "Specialist Orthopedic. Ask about movement range, swelling, and injury history. Max 18 words." },
            GYNECOLOGIST: { id: 'GYNECOLOGIST', title: 'Gynecologist', icon: 'venus', voice: 'Leda', greeting: "Hello. What reproductive health concerns can I help you with today?", prompt: "Clinical Gynecologist. Ask detailed, respectful medical questions about cycles or discomfort. Max 20 words." },
            OPHTHALMOLOGIST: { id: 'OPHTHALMOLOGIST', title: 'Ophthalmologist', icon: 'eye', voice: 'Zephyr', greeting: "Hello. Are you having blurred vision, eye pain, or any redness?", prompt: "Expert Ophthalmologist. Ask about visual acuity, light sensitivity, and pain. Max 18 words." }
        };

        let currentRole = DOCTOR_ROLES.GP;
        let pName = "";
        let transcript = [];
        let isListening = false;
        let isProcessing = false;
        let isPlaying = false;
        let sessionActive = false;
        let micRunning = false;
        let activeReportData = null;

        const views = { setup: document.getElementById('setup-screen'), vault: document.getElementById('vault-screen'), consultation: document.getElementById('consultation-screen'), report: document.getElementById('report-screen') };

        function showView(v) { Object.values(views).forEach(el => el.classList.add('step-hidden')); views[v].classList.remove('step-hidden'); window.scrollTo(0, 0); }

        // --- Storage Management ---
        function saveToVault(session) {
            let vault = JSON.parse(localStorage.getItem('clinical_vault_data') || '[]');
            vault.unshift(session);
            localStorage.setItem('clinical_vault_data', JSON.stringify(vault));
            renderVaultList();
        }

        function renderVaultList() {
            const list = document.getElementById('vault-list-full');
            const vault = JSON.parse(localStorage.getItem('clinical_vault_data') || '[]');
            if (vault.length === 0) {
                list.innerHTML = `<p class="text-slate-600 text-xs text-center py-12">No medical history found.</p>`;
                return;
            }
            list.innerHTML = vault.map((s, idx) => `
                <div class="flex items-center justify-between p-6 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 rounded-[2rem] transition-all group">
                    <div class="space-y-1">
                        <p class="text-slate-100 text-lg font-bold">${s.patient}</p>
                        <p class="text-blue-500 text-[10px] uppercase font-black tracking-widest">${s.department} • ${new Date(s.date).toLocaleString()}</p>
                    </div>
                    <button onclick="openVaultItem(${idx})" class="px-6 py-3 bg-slate-800 group-hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Open Report</button>
                </div>
            `).join('');
            lucide.createIcons();
        }

        window.openVaultItem = (idx) => {
            const vault = JSON.parse(localStorage.getItem('clinical_vault_data') || '[]');
            const s = vault[idx];
            populateReportView(s.patient, s.department, s.report, s.id);
            showView('report');
        };

        document.getElementById('clear-vault-btn-full').addEventListener('click', () => {
            if (confirm("Permanently wipe all clinical history from this device?")) {
                localStorage.removeItem('clinical_vault_data');
                renderVaultList();
            }
        });

        // --- Audio Context & Speech ---
        function pcmToWav(pcmData, sampleRate) {
            const buffer = new ArrayBuffer(44 + pcmData.length * 2);
            const view = new DataView(buffer);
            const writeString = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
            writeString(0, 'RIFF'); view.setUint32(4, 32 + pcmData.length * 2, true); writeString(8, 'WAVE'); writeString(12, 'fmt '); view.setUint32(16, 16, true);
            view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, pcmData.length * 2, true);
            for (let i = 0; i < pcmData.length; i++) view.setInt16(44 + i * 2, pcmData[i], true);
            return new Blob([buffer], { type: 'audio/wav' });
        }

        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let mic = null;
        if (Recognition) {
            mic = new Recognition(); mic.continuous = false; mic.interimResults = false; mic.lang = 'en-US';
            mic.onstart = () => { micRunning = true; isListening = true; updateUI(); };
            mic.onend = () => { micRunning = false; isListening = false; updateUI(); setTimeout(watchdog, 250); };
            mic.onresult = (e) => { const text = e.results[0][0].transcript; if (text && text.trim().length > 0) handleInput(text); };
        }

        function watchdog() { if (sessionActive && !isPlaying && !isProcessing && !isListening && !micRunning) { try { mic.start(); micRunning = true; } catch(err) {} } }
        setInterval(() => { if (sessionActive && !isPlaying && !isProcessing && !micRunning) watchdog(); }, 3000);

        async function api(url, body) {
            const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!r.ok) throw new Error("API Failure");
            return await r.json();
        }

        async function speak(text) {
            isPlaying = true; try { mic.stop(); micRunning = false; } catch(e) {}
            isListening = false; updateUI();
            try {
                const res = await api(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TTS}:generateContent?key=${apiKey}`, { contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: currentRole.voice } } } } });
                const raw = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                const type = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;
                if (raw) {
                    const bStr = window.atob(raw); const bytes = new Int16Array(bStr.length / 2);
                    for (let i = 0; i < bStr.length; i += 2) bytes[i / 2] = bStr.charCodeAt(i) | (bStr.charCodeAt(i + 1) << 8);
                    const audio = new Audio(URL.createObjectURL(pcmToWav(bytes, parseInt(type.match(/rate=(\d+)/)?.[1] || "24000"))));
                    await audio.play();
                    return new Promise(r => { audio.onended = () => { isPlaying = false; updateUI(); r(); setTimeout(watchdog, 150); }; });
                }
            } catch (e) { isPlaying = false; updateUI(); }
        }

        async function handleInput(text) {
            if (!sessionActive) return;
            isProcessing = true; updateUI();
            transcript.push({ role: 'user', text });
            document.getElementById('transcript-text').textContent = "...";
            try {
                const res = await api(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_CHAT}:generateContent?key=${apiKey}`, { contents: transcript.map(t => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.text }] })), systemInstruction: { parts: [{ text: currentRole.prompt }] } });
                const reply = res.candidates?.[0]?.content?.parts?.[0]?.text;
                isProcessing = false;
                if (reply && sessionActive) { transcript.push({ role: 'doctor', text: reply }); document.getElementById('transcript-text').textContent = `"${reply}"`; await speak(reply); }
            } catch (err) { isProcessing = false; updateUI(); }
        }

        function updateUI() {
            const avatar = document.getElementById('main-avatar'); const label = document.getElementById('avatar-label');
            const iconBox = document.getElementById('avatar-icon-container'); const sLabel = document.getElementById('status-label');
            if (isListening) {
                avatar.className = "relative z-10 w-72 h-72 rounded-[5.5rem] flex flex-col items-center justify-center border-[20px] border-red-900/20 bg-red-600 text-white scale-105 shadow-2xl transition-all duration-300 status-glow-red pulse-active";
                label.textContent = "LISTENING"; iconBox.innerHTML = `<i data-lucide="mic" class="w-16 h-16"></i>`; sLabel.textContent = "CAPTURING VOICE";
            } else if (isPlaying) {
                avatar.className = "relative z-10 w-72 h-72 rounded-[5.5rem] flex flex-col items-center justify-center border-[20px] border-blue-900/20 bg-blue-600 text-white shadow-2xl transition-all duration-300 status-glow-blue pulse-active";
                label.textContent = "SPEAKING"; iconBox.innerHTML = `<i data-lucide="volume-2" class="w-16 h-16"></i>`; sLabel.textContent = "STREAM ACTIVE";
            } else if (isProcessing) {
                label.textContent = "ROUTING"; iconBox.innerHTML = `<i data-lucide="loader-2" class="w-16 h-16 animate-spin"></i>`; sLabel.textContent = "PROCESSING DATA";
            } else {
                avatar.className = "relative z-10 w-72 h-72 rounded-[5.5rem] flex flex-col items-center justify-center border-[20px] border-slate-900 bg-slate-950 text-slate-700 shadow-xl transition-all duration-500";
                label.textContent = "STANDBY"; iconBox.innerHTML = `<i data-lucide="${currentRole.icon}" class="w-16 h-16"></i>`; sLabel.textContent = "LINK STABLE";
            }
            lucide.createIcons();
        }

        function populateReportView(name, department, report, id) {
            pName = name; activeReportData = report;
            document.getElementById('report-name').textContent = name;
            document.getElementById('report-role').textContent = department;
            document.getElementById('report-time').textContent = id;
            document.getElementById('report-complaint').textContent = report.chiefComplaint;
            document.getElementById('report-duration').textContent = report.durationAndSeverity;
            document.getElementById('report-summary').textContent = report.summary;
            document.getElementById('report-recommendation').textContent = report.recommendation;
            const sBox = document.getElementById('report-symptoms'); sBox.innerHTML = '';
            (report.reportedSymptoms || []).forEach(s => { const p = document.createElement('span'); p.className = "px-6 py-2.5 bg-blue-500/10 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-tighter border border-blue-500/20"; p.textContent = s; sBox.appendChild(p); });
            lucide.createIcons();
        }

        document.getElementById('go-to-vault-btn').addEventListener('click', () => { renderVaultList(); showView('vault'); });
        document.getElementById('doctor-selector').addEventListener('click', (e) => {
            const b = e.target.closest('.doctor-card'); if (!b) return;
            document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('active'));
            b.classList.add('active'); currentRole = DOCTOR_ROLES[b.dataset.role];
        });

        document.getElementById('start-btn').addEventListener('click', async () => {
            pName = document.getElementById('user-name').value.trim();
            if (!pName) { document.getElementById('error-text').textContent = "IDENTIFY PATIENT REQUIRED."; document.getElementById('error-text').classList.remove('hidden'); return; }
            showView('consultation'); document.getElementById('display-role').textContent = currentRole.title;
            sessionActive = true; transcript = [{ role: 'doctor', text: currentRole.greeting }];
            document.getElementById('transcript-text').textContent = `"${currentRole.greeting}"`;
            updateUI(); await speak(currentRole.greeting);
        });

        document.getElementById('end-btn').addEventListener('click', async () => {
            sessionActive = false; try { mic.stop(); micRunning = false; } catch(e) {}
            isProcessing = true; updateUI(); document.getElementById('transcript-text').textContent = "FINALIZING EHR REPORT...";
            try {
                const res = await api(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_CHAT}:generateContent?key=${apiKey}`, { contents: [{ role: 'user', parts: [{ text: `Generate JSON Report. Input: ${JSON.stringify(transcript)}. Keys: chiefComplaint, summary, reportedSymptoms (array), durationAndSeverity, recommendation.` }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { chiefComplaint: { type: "STRING" }, summary: { type: "STRING" }, reportedSymptoms: { type: "ARRAY", items: { type: "STRING" } }, durationAndSeverity: { type: "STRING" }, recommendation: { type: "STRING" } } } } });
                const r = JSON.parse(res.candidates[0].content.parts[0].text);
                const caseId = Math.random().toString(36).substr(2, 9).toUpperCase();
                saveToVault({ id: caseId, patient: pName, department: currentRole.title, transcript, report: r, date: new Date().toISOString() });
                populateReportView(pName, currentRole.title, r, caseId);
                showView('report');
            } catch (e) { location.reload(); }
        });

        document.getElementById('download-btn').addEventListener('click', () => {
            if (!activeReportData) return;
            const content = `MEDICAL CLINICAL REPORT\n=======================\nPatient: ${pName}\nDepartment: ${document.getElementById('report-role').textContent}\nCase ID: ${document.getElementById('report-time').textContent}\nDate: ${new Date().toLocaleDateString()}\n\nPRESENTATION:\n${activeReportData.chiefComplaint}\n\nSYMPTOMS:\n${activeReportData.reportedSymptoms.join(', ')}\n\nTIMELINE:\n${activeReportData.durationAndSeverity}\n\nASSESSMENT:\n${activeReportData.summary}\n\nACTION:\n${activeReportData.recommendation}\n\n-- AI Midnight Clinic --`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `Report_${pName.replace(/\s+/g, '_')}.txt`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        });

        lucide.createIcons();
    </script>

</body>
</html>
