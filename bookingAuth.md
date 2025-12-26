import React, { useState, useEffect, useMemo, useRef } from "react";
import {
User,
UserPlus,
Calendar,
Clock,
CreditCard,
CheckCircle,
ChevronRight,
ChevronLeft,
Stethoscope,
Plus,
Search,
Settings,
ShieldCheck,
MapPin,
Star,
Mail,
Loader2,
Trash2,
Video,
Filter,
TrendingUp,
XCircle,
RefreshCw,
Send,
ExternalLink,
Lock,
Unlock,
AlertCircle,
Key,
Shield,
ArrowRight,
LogOut,
Activity,
Users
} from "lucide-react";

// --- Configuration & Constants ---
const APP_ID = "healthsync-pro-v1";
const API_KEY = "";

const SPECIALTIES = [
"All Specialties",
"Cardiologist",
"Dermatologist",
"Neurologist",
"Pediatrician",
"General Physician",
"Psychiatrist",
];

const GENDERS = ["Male", "Female", "Non-binary"];

const TIME_SLOTS = [
"09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
];

const DEFAULT_DOCTORS = [
{
id: "d1",
name: "Dr. Sarah Mitchell",
specialty: "Cardiologist",
gender: "Female",
experience: "12 years",
rating: 4.9,
fee: 150,
location: "Downtown Medical Center",
about: "Specializing in preventive cardiology and heart health management. Dr. Mitchell has published over 30 research papers on cardiovascular health.",
availability: ["Monday", "Wednesday", "Friday"],
hasVideo: true,
image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200",
},
{
id: "d2",
name: "Dr. James Wilson",
specialty: "Dermatologist",
gender: "Male",
experience: "8 years",
rating: 4.7,
fee: 120,
location: "Westside Skin Clinic",
about: "Expert in clinical dermatology and skin cancer screening. Former head of dermatology at Westside General Hospital.",
availability: ["Tuesday", "Thursday", "Saturday"],
hasVideo: false,
image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200",
},
];

// --- Confetti Celebration Component ---
function Confetti() {
const canvasRef = useRef(null);
useEffect(() => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");
let animationId;
let particles = [];
let active = true;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const colors = ["#3b82f6", "#60a5fa", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#ffffff", "#fbbf24"];
class Particle {
constructor() {
this.x = Math.random() _ canvas.width;
this.y = Math.random() _ canvas.height - canvas.height;
this.rotation = Math.random() _ 360;
this.color = colors[Math.floor(Math.random() _ colors.length)];
this.width = Math.random() _ 8 + 4;
this.height = Math.random() _ 12 + 6;
this.speed = Math.random() _ 5 + 3;
this.opacity = 1;
this.vx = Math.random() _ 2 - 1;
this.vy = this.speed;
this.oscillation = Math.random() _ 0.05;
this.oscOffset = Math.random() _ Math.PI _ 2;
}
update() {
this.y += this.vy;
this.x += this.vx + Math.sin(this.oscOffset) _ 1.5;
this.oscOffset += this.oscillation;
this.rotation += this.speed;
if (!active) this.opacity -= 0.005;
if (active && this.y > canvas.height) { this.y = -20; this.x = Math.random() _ canvas.width; }
}
draw() {
if (this.opacity <= 0) return;
ctx.save();
ctx.translate(this.x, this.y);
ctx.rotate((this.rotation _ Math.PI) / 180);
ctx.globalAlpha = this.opacity;
ctx.fillStyle = this.color;
ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
ctx.restore();
}
}
const init = () => { particles = Array.from({ length: 150 }, () => new Particle()); };
const animate = () => {
ctx.clearRect(0, 0, canvas.width, canvas.height);
let stillVisible = false;
particles.forEach((p) => { p.update(); p.draw(); if (p.opacity > 0 && p.y < canvas.height + 50) stillVisible = true; });
if (stillVisible) animationId = requestAnimationFrame(animate);
};
init(); animate();
const timeout = setTimeout(() => { active = false; }, 3000);
return () => { cancelAnimationFrame(animationId); clearTimeout(timeout); };
}, []);
return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[500]" />;
}

// --- Main Application ---
export default function App() {
const [user, setUser] = useState(null);
const [authView, setAuthView] = useState('landing');

// Local Database of accounts
const [accounts, setAccounts] = useState(() => {
const saved = localStorage.getItem(`${APP_ID}_accounts`);
// Seed with a default admin account if empty
return saved ? JSON.parse(saved) : [
{ name: "Global Admin", email: "admin@healthsync.com", password: "admin", role: "admin" }
];
});

const [doctors, setDoctors] = useState(() => {
const saved = localStorage.getItem(`${APP_ID}_doctors`);
return saved ? JSON.parse(saved) : DEFAULT_DOCTORS;
});
const [appointments, setAppointments] = useState(() => {
const saved = localStorage.getItem(`${APP_ID}_appointments`);
return saved ? JSON.parse(saved) : [];
});

const [bookingStep, setBookingStep] = useState(0);
const [selectedDoctor, setSelectedDoctor] = useState(null);
const [isProcessing, setIsProcessing] = useState(false);
const [emailData, setEmailData] = useState({ subject: "", body: "" });
const [bookingDetails, setBookingDetails] = useState({
date: "", time: "", patientName: "", patientEmail: "", isTelehealth: false,
});

useEffect(() => { localStorage.setItem(`${APP_ID}_doctors`, JSON.stringify(doctors)); }, [doctors]);
useEffect(() => { localStorage.setItem(`${APP_ID}_appointments`, JSON.stringify(appointments)); }, [appointments]);
useEffect(() => { localStorage.setItem(`${APP_ID}_accounts`, JSON.stringify(accounts)); }, [accounts]);

const generateDoctorImage = async (name, specialty, gender) => {
try {
const prompt = `Professional headshot of a friendly ${gender.toLowerCase()} doctor, named ${name}, ${specialty}. White coat, stethoscope. Solid background.`;
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`, {
method: "POST", headers: { "Content-Type": "application/json" },
body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } }),
});
const result = await response.json();
return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
} catch (err) { return "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"; }
};

const generateEmail = async (details, doctor) => {
const prompt = `Confirmation email. Patient: ${details.patientName}. Doctor: ${doctor.name}. Date: ${details.date} at ${details.time}. Return JSON with subject and body.`;
try {
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
method: "POST", headers: { "Content-Type": "application/json" },
body: JSON.stringify({
contents: [{ parts: [{ text: prompt }] }],
generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { subject: { type: "STRING" }, body: { type: "STRING" } }, required: ["subject", "body"] } },
}),
});
const data = await response.json();
setEmailData(JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text));
} catch (e) { setEmailData({ subject: "Appointment Confirmed", body: "Your appointment is confirmed." }); }
};

const handleAddDoctor = async (newDoc) => {
setIsProcessing(true);
const portrait = await generateDoctorImage(newDoc.name, newDoc.specialty, newDoc.gender);
setDoctors([...doctors, { ...newDoc, id: `d-${Date.now()}`, rating: 5.0, image: portrait, availability: newDoc.availability.split(",").map((s) => s.trim()) }]);
setIsProcessing(false);
};

const confirmBooking = async () => {
setIsProcessing(true);
const newApt = { id: `apt-${Date.now()}`, doctor: selectedDoctor, ...bookingDetails, status: "Upcoming", createdAt: new Date().toISOString() };
setTimeout(async () => {
setAppointments([...appointments, newApt]);
setBookingStep(4);
setIsProcessing(false);
await generateEmail(bookingDetails, selectedDoctor);
}, 1200);
};

const updateAptStatus = (id, newStatus) => {
setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
};

const handleLogout = () => {
setUser(null);
setAuthView('landing');
setBookingStep(0);
};

// --- Auth View Logic ---
if (!user) {
if (authView === 'landing') {
return (
<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-blue-900/30">
<div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
<div className="flex flex-col items-center gap-6">
<div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-900/40">
<Stethoscope size={48} />
</div>
<h1 className="text-6xl font-black tracking-tight leading-none">HealthSync <span className="text-blue-500">Pro.</span></h1>
<p className="text-slate-400 text-xl max-w-2xl font-medium">Connect with top specialists. Manage clinical workflows. Your unified platform for healthcare excellence.</p>
</div>
<div className="flex flex-col md:flex-row items-center justify-center gap-6">
<button onClick={() => setAuthView('login')} className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 flex items-center gap-3">
Get Started <ArrowRight size={20} />
</button>
<button onClick={() => setAuthView('login')} className="px-10 py-5 bg-slate-900 border border-slate-800 text-slate-300 rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all">
Staff Login
</button>
</div>
</div>
</div>
);
}

    return (
      <AuthPortal
        view={authView}
        accounts={accounts}
        onSwitch={() => setAuthView(authView === 'login' ? 'signup' : 'login')}
        onSignup={(newAcc) => setAccounts([...accounts, newAcc])}
        onLoginSuccess={(u) => setUser(u)}
        onBack={() => setAuthView('landing')}
      />
    );

}

// --- Main Render ---
return (
<div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-900/30">
<nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-[100]">
<div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Stethoscope size={24} /></div>
<div>
<span className="text-xl font-black tracking-tight">HealthSync</span>
<span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">{user.role} Access</span>
</div>
</div>
<div className="flex items-center gap-6">
<div className="hidden md:flex flex-col items-right text-right">
<span className="text-sm font-black text-slate-100 leading-none">{user.name}</span>
<span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Verified {user.role}</span>
</div>
<button onClick={handleLogout} className="p-3 text-slate-500 hover:text-red-500 transition-colors"><LogOut size={22} /></button>
</div>
</div>
</nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {user.role === "admin" ? (
          <AdminPanel
            doctors={doctors} appointments={appointments}
            onAdd={handleAddDoctor} onDelete={(id) => setDoctors(doctors.filter((d) => d.id !== id))}
            onStatusChange={updateAptStatus} isProcessing={isProcessing}
            onLogout={handleLogout}
          />
        ) : (
          <PatientPortal
            doctors={doctors} step={bookingStep} setStep={setBookingStep}
            selectedDoctor={selectedDoctor} setSelectedDoctor={setSelectedDoctor}
            details={bookingDetails} setDetails={setBookingDetails}
            onConfirm={confirmBooking} isProcessing={isProcessing} emailData={emailData}
          />
        )}
      </main>

      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[4px] z-[200] flex flex-col items-center justify-center">
          <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-800 flex flex-col items-center gap-6 animate-in zoom-in-95">
            <Loader2 className="animate-spin text-blue-500" size={56} />
            <div className="text-center"><p className="font-black text-xl text-slate-100">Working...</p><p className="text-sm text-slate-400">Processing secure healthcare transaction</p></div>
          </div>
        </div>
      )}
    </div>

);
}

// --- Component: Auth Portal (White Theme with Functional Auth) ---
function AuthPortal({ view, onSwitch, onSignup, onLoginSuccess, onBack, accounts }) {
const [role, setRole] = useState('patient');
const [form, setForm] = useState({ name: '', email: '', password: '' });
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleSubmit = (e) => {
e.preventDefault();
setLoading(true);
setError("");

    setTimeout(() => {
      if (view === 'signup') {
        // Validation for Signup
        const exists = accounts.find(a => a.email === form.email);
        if (exists) {
          setError("An account with this email already exists.");
          setLoading(false);
          return;
        }

        const newAcc = { name: form.name, email: form.email, password: form.password, role };
        onSignup(newAcc);
        onLoginSuccess(newAcc);
      } else {
        // Validation for Login
        const acc = accounts.find(a =>
          a.email === form.email &&
          a.password === form.password &&
          a.role === role
        );

        if (acc) {
          onLoginSuccess(acc);
        } else {
          setError("Invalid email, password, or account type.");
        }
      }
      setLoading(false);
    }, 1000);

};

return (
<div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans text-slate-900">
<div className="max-w-md w-full space-y-8 animate-in slide-in-from-bottom-10 duration-500">
<button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-all"><ChevronLeft size={20} /> Back to Homepage</button>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tight">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-500 font-medium mt-2">Log in to your HealthSync Pro account to proceed.</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button onClick={() => setRole('patient')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'patient' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Patient</button>
            <button onClick={() => setRole('admin')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'admin' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Admin</button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2 animate-in fade-in duration-300">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input required placeholder="John Doe" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
            )}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <input required type="email" placeholder="email@example.com" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <input required type="password" placeholder="••••••••" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : (view === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <button onClick={() => { onSwitch(); setError(""); }} className="w-full text-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
            {view === 'login' ? "Don't have an account? Sign up here" : "Already have an account? Log in here"}
          </button>
        </div>
      </div>
    </div>

);
}

// --- Component: Patient Portal (Preserved) ---
function PatientPortal({ doctors, step, setStep, selectedDoctor, setSelectedDoctor, details, setDetails, onConfirm, isProcessing, emailData }) {
const [search, setSearch] = useState("");
const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");
const [cardInfo, setCardInfo] = useState({ number: "", name: "", expiry: "", cvv: "" });

const filteredDoctors = useMemo(() => {
return doctors.filter((doc) => {
const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.specialty.toLowerCase().includes(search.toLowerCase());
const matchesSpecialty = specialtyFilter === "All Specialties" || doc.specialty === specialtyFilter;
return matchesSearch && matchesSpecialty;
});
}, [doctors, search, specialtyFilter]);

const isCardValid = cardInfo.number.length >= 16 && cardInfo.name && cardInfo.expiry.length >= 4 && cardInfo.cvv.length >= 3;

if (step === 0) return (
<div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
<div className="text-center max-w-3xl mx-auto space-y-4">
<h1 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">Book world-class <span className="text-blue-500">healthcare.</span></h1>
<p className="text-lg text-slate-400 font-medium">Access verified specialists for video or clinic visits instantly.</p>
</div>
<div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
<div className="relative flex-1 w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} /><input type="text" placeholder="Search specialists..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border-transparent focus:bg-slate-800 outline-none transition-all font-medium text-slate-100" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
<div className="relative flex-1 md:w-64"><Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><select className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-950 border-transparent outline-none appearance-none font-bold text-sm text-slate-100" value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>{SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{filteredDoctors.map((doc) => (
<div key={doc.id} className="group bg-slate-900 rounded-[2.5rem] border border-slate-800 p-2 hover:border-blue-500/40 transition-all duration-500 overflow-hidden">
<div className="relative rounded-[2.1rem] overflow-hidden aspect-[4/3] mb-4">
<img src={doc.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="" />
<div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black shadow-sm text-slate-100"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {doc.rating}</div>
{doc.hasVideo && <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-lg"><Video size={12} /> Video Call</div>}
</div>
<div className="px-6 pb-6 pt-2">
<div className="flex justify-between items-start mb-2"><div><h3 className="text-xl font-black text-slate-100 group-hover:text-blue-400 transition-colors">{doc.name}</h3><p className="text-sm font-bold text-blue-500 uppercase tracking-tighter">{doc.specialty}</p></div><div className="text-right"><span className="text-[10px] block text-slate-600 font-bold uppercase">Fee</span><span className="text-xl font-black text-slate-100">${doc.fee}</span></div></div>
<p className="text-sm text-slate-500 line-clamp-2 font-medium mb-6">{doc.about}</p>
<button onClick={() => { setSelectedDoctor(doc); setStep(1); }} className="w-full py-4 bg-slate-100 text-slate-950 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all shadow-xl">Schedule Session</button>
</div>
</div>
))}
</div>
</div>
);

return (
<div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500 relative">
<div className="flex items-center gap-4 mb-10"><button onClick={() => setStep(step - 1)} className="w-12 h-12 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-900 transition-colors"><ChevronLeft size={24} /></button><div><h2 className="text-2xl font-black text-slate-100">Booking Session</h2><p className="text-sm font-medium text-slate-500">Step {step} of 4</p></div></div>
<div className="grid lg:grid-cols-5 gap-10">
<div className="lg:col-span-3 space-y-8">
{step === 1 && (
<div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-8">
<h3 className="text-xl font-black flex items-center gap-3 text-slate-100"><Calendar className="text-blue-500" /> Choose Date & Time</h3>
<div className="space-y-6">
<div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Preferred Date</label><input type="date" className="w-full p-4 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-slate-100" style={{ colorScheme: 'dark' }} value={details.date} onChange={(e) => setDetails({ ...details, date: e.target.value })} /></div>
<div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Available Slots</label><div className="grid grid-cols-3 gap-3">{TIME_SLOTS.map((t) => (<button key={t} onClick={() => setDetails({ ...details, time: t })} className={`p-4 rounded-2xl border-2 font-black text-xs transition-all ${details.time === t ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-blue-900"}`}>{t}</button>))}</div></div>
</div>
<button disabled={!details.date || !details.time} onClick={() => setStep(2)} className="w-full py-4 bg-slate-100 text-slate-950 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20">Next Step</button>
</div>
)}
{step === 2 && (
<div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-8">
<h3 className="text-xl font-black flex items-center gap-3 text-slate-100"><UserPlus className="text-blue-500" /> Patient Info</h3>
<div className="grid md:grid-cols-2 gap-4">
<div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Full Name</label><input className="w-full p-4 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-slate-100" value={details.patientName} onChange={(e) => setDetails({ ...details, patientName: e.target.value })} /></div>
<div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Gmail Address</label><input className="w-full p-4 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-slate-100" value={details.patientEmail} onChange={(e) => setDetails({ ...details, patientEmail: e.target.value })} /></div>
</div>
<div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"><div className="flex items-center gap-3"><Video size={20} className="text-blue-400" /><div><p className="text-sm font-black text-slate-200">Request Telehealth</p><p className="text-xs font-medium text-slate-500">Secure video consult</p></div></div><input type="checkbox" className="w-6 h-6 rounded-lg accent-blue-600" checked={details.isTelehealth} onChange={(e) => setDetails({ ...details, isTelehealth: e.target.checked })} /></div>
<button disabled={!details.patientName || !details.patientEmail} onClick={() => setStep(3)} className="w-full py-4 bg-slate-100 text-slate-950 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20">Payment Checkout</button>
</div>
)}
{step === 3 && (
<div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-8">
<h3 className="text-xl font-black flex items-center gap-3 text-slate-100"><CreditCard className="text-blue-500" /> Secure Checkout</h3>
<VisualCard cardNumber={cardInfo.number} cardName={cardInfo.name} expiry={cardInfo.expiry} cvv={cardInfo.cvv} />
<div className="grid gap-4 mt-8">
<div><label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Card Number</label><input maxLength="16" className="w-full p-3 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm text-slate-100" value={cardInfo.number} onChange={(e) => setCardInfo({...cardInfo, number: e.target.value.replace(/\D/g, '')})} /></div>
<div><label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Cardholder Name</label><input className="w-full p-3 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm uppercase text-slate-100" value={cardInfo.name} onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})} /></div>
<div className="grid grid-cols-2 gap-4">
<div><label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Expiry</label><input placeholder="MM/YY" className="w-full p-3 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm text-slate-100" value={cardInfo.expiry} onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})} /></div>
<div><label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">CVV</label><input type="password" maxLength="3" className="w-full p-3 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm text-slate-100" value={cardInfo.cvv} onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})} /></div>
</div>
</div>
<div className="bg-slate-950 p-6 rounded-3xl border border-slate-800"><div className="flex justify-between items-center"><span className="text-lg font-black text-slate-100">Total Payable</span><span className="text-3xl font-black text-blue-500">${Number(selectedDoctor.fee) + 10}</span></div></div>
<button onClick={onConfirm} disabled={!isCardValid} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/20 disabled:opacity-20 flex items-center justify-center gap-3">Confirm & Book <ChevronRight /></button>
</div>
)}
{step === 4 && (
<div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-xl text-center space-y-8 animate-in zoom-in-90 duration-500">
<Confetti /><div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-900/30"><CheckCircle size={40} /></div>
<div><h3 className="text-3xl font-black mb-2 tracking-tight text-slate-100">Confirmed!</h3><p className="text-slate-400 font-medium">Schedule blocked. Record synchronized with cloud systems.</p></div>
<div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
<div className="px-6 py-3 bg-slate-900/50 flex items-center gap-2 justify-between border-b border-slate-800"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-900/50" /><div className="w-3 h-3 rounded-full bg-yellow-900/50" /><div className="w-3 h-3 rounded-full bg-green-900/50" /><span className="ml-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Dispatcher</span></div><span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><Send size={10} /> DISPATCHED</span></div>
<div className="p-8 text-left"><div className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Mail size={14} /> To: {details.patientEmail}</div><div className="text-white text-sm font-black mb-2 pb-2 border-b border-slate-800">Subject: {emailData.subject || "Generating..."}</div><div className="text-slate-400 text-sm h-32 overflow-y-auto whitespace-pre-wrap">{emailData.body || "Syncing clinician data..."}</div></div>
</div>
<button onClick={() => { setStep(0); setSelectedDoctor(null); }} className="w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-700">Return to Directory</button>
</div>
)}
</div>
<div className="lg:col-span-2">
{selectedDoctor && (
<div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 sticky top-28 shadow-xl">
<h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Summary</h4>
<div className="flex gap-4 items-center mb-6"><img src={selectedDoctor.image} className="w-20 h-20 rounded-2xl object-cover border border-slate-800 shadow-lg" alt="" /><div><p className="font-black text-lg text-slate-100">{selectedDoctor.name}</p><p className="text-xs font-bold text-blue-600 uppercase">{selectedDoctor.specialty}</p></div></div>
<div className="space-y-4 pt-4 border-t border-slate-800"><div className="flex items-center gap-3 text-sm text-slate-400 font-bold"><MapPin size={18} className="text-blue-500" /> {selectedDoctor.location}</div><div className="flex items-center gap-3 text-sm text-slate-400 font-bold"><Calendar size={18} className="text-blue-500" /> {details.date || "Not set"}</div><div className="flex items-center gap-3 text-sm text-slate-400 font-bold"><Clock size={18} className="text-blue-500" /> {details.time || "Not set"}</div></div>
</div>
)}
</div>
</div>
</div>
);
}

// --- Component: Admin Panel (Preserved Feature Set) ---
function AdminPanel({ doctors, appointments, onAdd, onDelete, onStatusChange, isProcessing }) {
const [showAdd, setShowAdd] = useState(false);
const [newDoc, setNewDoc] = useState({ name: "", specialty: "General Physician", gender: "Male", experience: "", fee: "", location: "", about: "", availability: "", });

const stats = useMemo(() => {
const totalRev = appointments.filter((a) => a.status !== "Cancelled").reduce((acc, curr) => acc + (Number(curr.doctor.fee) + 10), 0);
return { totalRev, completed: appointments.filter((a) => a.status === "Completed").length, pending: appointments.filter((a) => a.status === "Upcoming").length, doctorsCount: doctors.length };
}, [appointments, doctors]);

return (
<div className="space-y-10 animate-in fade-in duration-500">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div><h1 className="text-3xl font-black tracking-tight text-slate-100">Executive Dashboard</h1><p className="text-slate-500 font-medium tracking-tight">Cloud Analytics Monitoring</p></div>
<div className="flex items-center gap-3"><button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20"><Plus size={20} /> Add Professional</button></div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Revenue" value={`$${stats.totalRev}`} icon={<TrendingUp />} color="bg-green-900/20 text-green-500" />
        <StatCard label="Live Feed" value={stats.pending} icon={<Calendar />} color="bg-blue-900/20 text-blue-500" />
        <StatCard label="Sessions" value={stats.completed} icon={<CheckCircle />} color="bg-purple-900/20 text-purple-500" />
        <StatCard label="Staff" value={stats.doctorsCount} icon={<Users />} color="bg-orange-900/20 text-orange-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center"><h3 className="font-black text-lg text-slate-100">Clinical Traffic</h3><RefreshCw className="text-slate-600" size={18} /></div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-600"><tr><th className="px-8 py-4">Patient</th><th className="px-8 py-4">Specialist</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {appointments.length === 0 ? (<tr><td colSpan="4" className="px-8 py-20 text-center text-slate-600 font-bold italic">No active traffic detect.</td></tr>) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-8 py-6"><div><p className="font-black text-sm text-slate-200">{apt.patientName}</p><p className="text-xs text-slate-600 font-medium">{apt.patientEmail}</p></div></td>
                        <td className="px-8 py-6"><div className="flex items-center gap-3"><img src={apt.doctor.image} className="w-8 h-8 rounded-full border border-slate-700" alt="" /><p className="font-bold text-sm text-slate-300">{apt.doctor.name}</p></div></td>
                        <td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${apt.status === "Completed" ? "bg-green-900/30 text-green-500" : apt.status === "Cancelled" ? "bg-red-900/30 text-red-500" : "bg-blue-900/30 text-blue-500"}`}>{apt.status}</span></td>
                        <td className="px-8 py-6 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onStatusChange(apt.id, "Completed")} className="p-2 rounded-xl bg-slate-800 text-green-500 hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={14} /></button><button onClick={() => onStatusChange(apt.id, "Cancelled")} className="p-2 rounded-xl bg-slate-800 text-red-500 hover:bg-red-600 hover:text-white transition-all"><XCircle size={14} /></button></div></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-xl">
            <h3 className="font-black text-lg mb-6 text-slate-100">Cloud Registry</h3>
            <div className="space-y-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-800">
                  <div className="flex items-center gap-3"><img src={doc.image} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="" /><div><p className="font-bold text-sm text-slate-200 leading-none">{doc.name}</p><p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{doc.specialty}</p></div></div>
                  <button onClick={() => onDelete(doc.id)} className="p-2.5 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative border border-slate-800 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-5 right-5 text-slate-600 hover:text-slate-200"><XCircle size={24} /></button>
            <div className="mb-6"><h2 className="text-xl font-black text-slate-100">Add Professional</h2><p className="text-xs font-medium text-slate-500 tracking-tight">Onboard specialist to global directory.</p></div>
            <form onSubmit={(e) => { e.preventDefault(); onAdd(newDoc); setShowAdd(false); }} className="space-y-4">
              <Input label="Name" placeholder="Dr. Smith" value={newDoc.name} onChange={(v) => setNewDoc({ ...newDoc, name: v })} required />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Specialty</label><select className="w-full p-3 rounded-xl bg-slate-950 border-2 border-transparent focus:border-blue-500 text-slate-100 outline-none font-bold text-xs" value={newDoc.specialty} onChange={(e) => setNewDoc({ ...newDoc, specialty: e.target.value })}>{SPECIALTIES.filter(s => s !== "All Specialties").map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gender</label><select className="w-full p-3 rounded-xl bg-slate-950 border-2 border-transparent focus:border-blue-500 text-slate-100 outline-none font-bold text-xs" value={newDoc.gender} onChange={(e) => setNewDoc({ ...newDoc, gender: e.target.value })}>{GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3"><Input label="Exp" placeholder="10y" value={newDoc.experience} onChange={(v) => setNewDoc({ ...newDoc, experience: v })} /><Input label="Fee" value={newDoc.fee} onChange={(v) => setNewDoc({ ...newDoc, fee: v })} /></div>
              <Input label="Clinic" value={newDoc.location} onChange={(v) => setNewDoc({ ...newDoc, location: v })} /><Input label="Days" placeholder="Mon, Tue" value={newDoc.availability} onChange={(v) => setNewDoc({ ...newDoc, availability: v })} />
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bio</label><textarea className="w-full p-3 rounded-xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs h-20 resize-none text-slate-100" value={newDoc.about} onChange={(e) => setNewDoc({ ...newDoc, about: e.target.value })} /></div>
              <button type="submit" className="w-full py-4 bg-slate-100 text-slate-950 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all">Onboard specialist</button>
            </form>
          </div>
        </div>
      )}
    </div>

);
}

// --- Utility Components ---
function StatCard({ label, value, icon, color }) {
return (
<div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-4">
<div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>{React.cloneElement(icon, { size: 28 })}</div>
<div><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p><p className="text-2xl font-black text-slate-100">{value}</p></div>
</div>
);
}

function Input({ label, value, onChange, placeholder, type = "text", required = false }) {
return (
<div className="space-y-1.5 w-full">
<label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
<input type={type} required={required} placeholder={placeholder} className="w-full p-3 rounded-xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs transition-all text-slate-100 placeholder:text-slate-800" value={value} onChange={(e) => onChange(e.target.value)} />
</div>
);
}

function VisualCard({ cardNumber, cardName, expiry, cvv }) {
const formattedNumber = (cardNumber || "•••• •••• •••• ••••").padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();
return (
<div className="relative w-full aspect-[1.6/1] rounded-[1.5rem] bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 p-6 text-white shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col justify-between">
<div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" /><div className="flex justify-between items-start"><div className="w-12 h-10 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-lg" /><div className="font-black italic text-xl tracking-tighter opacity-30">VISA</div></div>
<div className="space-y-4"><div className="text-xl md:text-2xl font-mono tracking-widest text-slate-100">{formattedNumber}</div><div className="flex justify-between items-end"><div className="space-y-1"><span className="text-[8px] uppercase font-bold tracking-[0.2em] opacity-40">Holder</span><p className="text-sm font-bold uppercase truncate max-w-[150px] text-slate-200">{cardName || "YOUR NAME"}</p></div><div className="space-y-1 text-right"><span className="text-[8px] uppercase font-bold tracking-[0.2em] opacity-40">Expires</span><p className="text-sm font-bold text-slate-200">{expiry || "MM/YY"}</p></div></div></div>
</div>
);
}
