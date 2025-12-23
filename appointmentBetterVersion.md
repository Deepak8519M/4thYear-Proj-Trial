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
Shield
} from "lucide-react";

// --- Configuration & Constants ---
const APP_ID = "healthsync-pro-v1";
const API_KEY = ""; // Environment provides this

// Default Fallbacks
const DEFAULT_ADMIN_PASSCODE = "12345678";
const DEFAULT_ADMIN_PHRASE = "ADMIN_SECURE";

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
"09:00 AM",
"10:00 AM",
"11:00 AM",
"01:00 PM",
"02:00 PM",
"03:00 PM",
"04:00 PM",
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
about:
"Specializing in preventive cardiology and heart health management. Dr. Mitchell has published over 30 research papers on cardiovascular health.",
availability: ["Monday", "Wednesday", "Friday"],
hasVideo: true,
image:
"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200",
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
about:
"Expert in clinical dermatology and skin cancer screening. Former head of dermatology at Westside General Hospital.",
availability: ["Tuesday", "Thursday", "Saturday"],
hasVideo: false,
image:
"https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200",
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

    const colors = [
      "#3b82f6", "#60a5fa", "#f59e0b", "#ec4899",
      "#8b5cf6", "#10b981", "#ffffff", "#fbbf24"
    ];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.rotation = Math.random() * 360;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.width = Math.random() * 8 + 4;
        this.height = Math.random() * 12 + 6;
        this.speed = Math.random() * 5 + 3;
        this.opacity = 1;
        this.vx = Math.random() * 2 - 1;
        this.vy = this.speed;
        this.oscillation = Math.random() * 0.05;
        this.oscOffset = Math.random() * Math.PI * 2;
      }

      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.oscOffset) * 1.5;
        this.oscOffset += this.oscillation;
        this.rotation += this.speed;

        if (!active) {
          this.opacity -= 0.005;
        }

        if (active && this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
      }
    }

    const init = () => {
      particles = Array.from({ length: 150 }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let stillVisible = false;

      particles.forEach((p) => {
        p.update();
        p.draw();
        if (p.opacity > 0 && p.y < canvas.height + 50) stillVisible = true;
      });

      if (stillVisible) {
        animationId = requestAnimationFrame(animate);
      }
    };

    init();
    animate();

    const timeout = setTimeout(() => {
        active = false;
    }, 3000);

    return () => {
        cancelAnimationFrame(animationId);
        clearTimeout(timeout);
    };

}, []);

return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[500]" />;
}

// --- Main Application ---
export default function App() {
const [view, setView] = useState("patient");
const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

// Persistent Security State
const [adminPin, setAdminPin] = useState(() =>
localStorage.getItem(`${APP_ID}_admin_pin`) || DEFAULT_ADMIN_PASSCODE
);
const [adminPhrase, setAdminPhrase] = useState(() =>
localStorage.getItem(`${APP_ID}_admin_phrase`) || DEFAULT_ADMIN_PHRASE
);

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
date: "",
time: "",
patientName: "",
patientEmail: "",
isTelehealth: false,
});

// Sync to LocalStorage
useEffect(() => {
localStorage.setItem(`${APP_ID}_doctors`, JSON.stringify(doctors));
}, [doctors]);

useEffect(() => {
localStorage.setItem(
`${APP_ID}_appointments`,
JSON.stringify(appointments)
);
}, [appointments]);

// Sync Security Settings
const handleUpdateSecurity = (newPin, newPhrase) => {
setAdminPin(newPin);
setAdminPhrase(newPhrase);
localStorage.setItem(`${APP_ID}_admin_pin`, newPin);
localStorage.setItem(`${APP_ID}_admin_phrase`, newPhrase);
};

// --- AI Integrations ---

const generateDoctorImage = async (name, specialty, gender) => {
const traits = ["approachable", "friendly", "experienced", "kind-hearted", "professional", "warm"];
const lightning = ["soft studio lighting", "bright professional lighting", "clean natural daylight", "cinematic soft focus"];
const demographics = ["diverse ethnicity", "unique facial features", "distinguished looking"];

    const randomTrait = traits[Math.floor(Math.random() * traits.length)];
    const randomLight = lightning[Math.floor(Math.random() * lightning.length)];
    const randomDemo = demographics[Math.floor(Math.random() * demographics.length)];

    try {
      const prompt = `Professional high-end studio headshot of a ${randomTrait} ${gender.toLowerCase()} medical doctor, ${randomDemo}, named ${name}, who is a ${specialty}. ${randomLight}, crisp focus, ultra-realistic, wearing a pristine white doctor's coat and a stethoscope. Solid off-white studio background. High resolution, high quality.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1 },
          }),
        }
      );

      const result = await response.json();
      return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
    } catch (err) {
      return "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200";
    }

};

const generateEmail = async (details, doctor) => {
const prompt = `Generate a professional and friendly appointment confirmation email. 
      Patient: ${details.patientName}. Doctor: ${doctor.name} (${
      doctor.specialty
    }). 
      Date: ${details.date} at ${details.time}. 
      Type: ${details.isTelehealth ? "Video Consultation" : "In-Person Visit"}. 
      Total Paid: $${Number(doctor.fee) + 10}.
      Return a subject line and the email body.`;

    const fetchWithRetry = async (retries = 0) => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "OBJECT",
                  properties: {
                    subject: { type: "STRING" },
                    body: { type: "STRING" },
                  },
                  required: ["subject", "body"],
                },
              },
            }),
          }
        );
        const data = await response.json();
        const content = JSON.parse(
          data.candidates?.[0]?.content?.parts?.[0]?.text
        );
        return content;
      } catch (error) {
        if (retries < 5) {
          await new Promise((r) => setTimeout(r, Math.pow(2, retries) * 1000));
          return fetchWithRetry(retries + 1);
        }
        return {
          subject: "Appointment Confirmation - HealthSync",
          body: `Hi ${details.patientName},\n\nYour appointment with ${doctor.name} is confirmed for ${details.date} at ${details.time}.`,
        };
      }
    };

    const result = await fetchWithRetry();
    setEmailData(result);

};

// --- Handlers ---
const handleAddDoctor = async (newDoc) => {
setIsProcessing(true);
const portrait = await generateDoctorImage(newDoc.name, newDoc.specialty, newDoc.gender);
const docWithMeta = {
...newDoc,
id: `d-${Date.now()}`,
rating: 5.0,
image: portrait,
availability: newDoc.availability.split(",").map((s) => s.trim()),
};
setDoctors([...doctors, docWithMeta]);
setIsProcessing(false);
};

const confirmBooking = async () => {
setIsProcessing(true);

    const newApt = {
      id: `apt-${Date.now()}`,
      doctor: selectedDoctor,
      ...bookingDetails,
      status: "Upcoming",
      createdAt: new Date().toISOString(),
    };

    setTimeout(async () => {
        setAppointments([...appointments, newApt]);
        setBookingStep(4);
        setIsProcessing(false);
        await generateEmail(bookingDetails, selectedDoctor);
    }, 1200);

};

const updateAptStatus = (id, newStatus) => {
setAppointments(
appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
);
};

return (
<div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-900/30">
{/_ Navigation _/}
<nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-[100]">
<div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
<Stethoscope size={24} />
</div>
<div>
<span className="text-xl font-black tracking-tight text-slate-100">
HealthSync
</span>
<span className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">
Pro Edition
</span>
</div>
</div>

          <div className="flex bg-slate-800 rounded-2xl p-1.5 border border-slate-700">
            <button
              onClick={() => {
                setView("patient");
                setBookingStep(0);
              }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                view === "patient"
                  ? "bg-slate-700 shadow-sm text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User size={16} /> Patient
            </button>
            <button
              onClick={() => {
                setView("admin");
                setBookingStep(0);
              }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                view === "admin"
                  ? "bg-slate-700 shadow-sm text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {view === "admin" ? (
          isAdminAuthenticated ? (
            <AdminPanel
              doctors={doctors}
              appointments={appointments}
              onAdd={handleAddDoctor}
              onDelete={(id) => setDoctors(doctors.filter((d) => d.id !== id))}
              onStatusChange={updateAptStatus}
              isProcessing={isProcessing}
              onLogout={() => setIsAdminAuthenticated(false)}
              adminPin={adminPin}
              adminPhrase={adminPhrase}
              onUpdateSecurity={handleUpdateSecurity}
            />
          ) : (
            <AdminLockScreen
              onAuthenticated={() => setIsAdminAuthenticated(true)}
              adminPin={adminPin}
              adminPhrase={adminPhrase}
            />
          )
        ) : (
          <PatientPortal
            doctors={doctors}
            step={bookingStep}
            setStep={setBookingStep}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
            details={bookingDetails}
            setDetails={setBookingDetails}
            onConfirm={confirmBooking}
            isProcessing={isProcessing}
            emailData={emailData}
          />
        )}
      </main>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[4px] z-[200] flex flex-col items-center justify-center">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 flex flex-col items-center gap-4 animate-in zoom-in-95">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <div className="text-center">
              <p className="font-bold text-lg text-slate-100">Processing Transaction</p>
              <p className="text-sm text-slate-400">
                Securing your health records...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>

);
}

// --- Component: Admin Lock Screen with Tier 2 Security ---
function AdminLockScreen({ onAuthenticated, adminPin, adminPhrase }) {
const [authStep, setAuthStep] = useState(1); // 1: PIN, 2: Phrase
const [pin, setPin] = useState("");
const [phrase, setPhrase] = useState("");
const [error, setError] = useState(false);
const [isVerifying, setIsVerifying] = useState(false);

const handleInput = (val) => {
if (pin.length < 8 && !isNaN(val)) {
const newPin = pin + val;
setPin(newPin);
if (newPin.length === 8) {
verifyStep1(newPin);
}
}
};

const verifyStep1 = (submittedPin) => {
setIsVerifying(true);
setTimeout(() => {
if (submittedPin === adminPin) {
setAuthStep(2);
setError(false);
} else {
setError(true);
setPin("");
setTimeout(() => setError(false), 1000);
}
setIsVerifying(false);
}, 600);
};

const verifyStep2 = (e) => {
e.preventDefault();
setIsVerifying(true);
setTimeout(() => {
if (phrase.toUpperCase() === adminPhrase.toUpperCase()) {
onAuthenticated();
} else {
setError(true);
setPhrase("");
setTimeout(() => setError(false), 1000);
}
setIsVerifying(false);
}, 600);
};

return (
<div className="max-w-md mx-auto mt-20 animate-in fade-in zoom-in-95 duration-500">
<div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl text-center space-y-8 relative overflow-hidden">
<div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

        <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg ${error ? 'bg-red-900/30 text-red-500 shake' : 'bg-blue-600 text-white shadow-blue-900/20'}`}>
          {isVerifying ? <Loader2 size={32} className="animate-spin" /> : (authStep === 1 ? <Lock size={32} /> : <Key size={32} />)}
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100">
            {authStep === 1 ? "Security Access" : "Identity Verification"}
          </h2>
          <p className="text-sm font-medium text-slate-400 mt-2">
            {authStep === 1
              ? "Enter your 8-digit administrator PIN."
              : "Enter secondary alphanumeric phrase."}
          </p>
        </div>

        {authStep === 1 ? (
          <>
            <div className="flex justify-center gap-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    pin.length > i
                      ? 'bg-blue-600 border-blue-600 scale-110 shadow-md'
                      : 'bg-transparent border-slate-700'
                  } ${error ? 'border-red-500 bg-red-500' : ''}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((num, i) => (
                <button
                  key={i}
                  disabled={num === "" || isVerifying}
                  onClick={() => {
                    if (num === "back") setPin(pin.slice(0, -1));
                    else handleInput(num.toString());
                  }}
                  className={`h-16 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                    num === ""
                      ? "opacity-0 cursor-default"
                      : "bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 active:scale-95"
                  } ${num === "back" ? "text-slate-500" : "text-slate-100"}`}
                >
                  {num === "back" ? <XCircle size={24} /> : num}
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={verifyStep2} className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <input
              autoFocus
              type="password"
              placeholder="SECRET_PHRASE"
              className={`w-full p-5 rounded-2xl bg-slate-950 border-2 outline-none text-center font-black tracking-widest text-slate-100 transition-all ${error ? 'border-red-500' : 'border-slate-800 focus:border-blue-600'}`}
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
            />
            <button
              type="submit"
              disabled={isVerifying || !phrase}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-500 disabled:opacity-30 transition-all"
            >
              Verify Tier 2 Access
            </button>
            <button
                type="button"
                onClick={() => setAuthStep(1)}
                className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400"
            >
                Return to PIN Stage
            </button>
          </form>
        )}

        <div className="pt-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
            Default Pin: 12345678 | Phrase: ADMIN_SECURE
        </div>
      </div>

      <style>{`
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>

);
}

// --- Component: Credit Card Visual ---
function VisualCard({ cardNumber, cardName, expiry, cvv }) {
const formattedNumber = (cardNumber || "•••• •••• •••• ••••")
.padEnd(16, "•")
.replace(/(.{4})/g, "$1 ")
.trim();

return (
<div className="relative w-full aspect-[1.6/1] rounded-[1.5rem] bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 p-6 text-white shadow-2xl shadow-blue-950/40 overflow-hidden flex flex-col justify-between group transition-all duration-500 border border-slate-700/50">
<div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors" />
<div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-blue-500/20 transition-colors" />

      <div className="flex justify-between items-start">
        <div className="w-12 h-10 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-lg flex flex-col justify-center gap-1 p-2">
            <div className="h-[2px] w-full bg-slate-800/20" />
            <div className="h-[2px] w-full bg-slate-800/20" />
            <div className="h-[2px] w-full bg-slate-800/20" />
        </div>
        <div className="font-black italic text-xl tracking-tighter opacity-30">VISA</div>
      </div>

      <div className="space-y-4">
        <div className="text-xl md:text-2xl font-mono tracking-widest transition-all text-slate-100">
          {formattedNumber}
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[8px] uppercase font-bold tracking-[0.2em] opacity-40">Card Holder</span>
            <p className="text-sm font-bold uppercase truncate max-w-[150px] text-slate-200">
              {cardName || "YOUR NAME"}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[8px] uppercase font-bold tracking-[0.2em] opacity-40">Expires</span>
            <p className="text-sm font-bold text-slate-200">{expiry || "MM/YY"}</p>
          </div>
        </div>
      </div>
    </div>

);
}

// --- Component: Patient Portal ---
function PatientPortal({
doctors,
step,
setStep,
selectedDoctor,
setSelectedDoctor,
details,
setDetails,
onConfirm,
isProcessing,
emailData,
}) {
const [search, setSearch] = useState("");
const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");

const [cardInfo, setCardInfo] = useState({
number: "",
name: "",
expiry: "",
cvv: "",
});

const filteredDoctors = useMemo(() => {
return doctors.filter((doc) => {
const matchesSearch =
doc.name.toLowerCase().includes(search.toLowerCase()) ||
doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
(doc.location || "").toLowerCase().includes(search.toLowerCase());
const matchesSpecialty =
specialtyFilter === "All Specialties" ||
doc.specialty === specialtyFilter;
return matchesSearch && matchesSpecialty;
});
}, [doctors, search, specialtyFilter]);

const sendRealEmail = () => {
const subject = encodeURIComponent(emailData.subject);
const body = encodeURIComponent(emailData.body);
window.location.href = `mailto:${details.patientEmail}?subject=${subject}&body=${body}`;
};

const isCardValid = cardInfo.number.length >= 16 && cardInfo.name && cardInfo.expiry.length >= 4 && cardInfo.cvv.length >= 3;

if (step === 0)
return (
<div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
<div className="text-center max-w-3xl mx-auto space-y-4">
<h1 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
Find and book the{" "}
<span className="text-blue-500">best healthcare</span> providers.
</h1>
<p className="text-lg text-slate-400 font-medium">
Access world-class doctors for in-person or video consultations,
instantly.
</p>
</div>

        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by doctor, clinic, or condition..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border-transparent focus:bg-slate-800 focus:border-blue-500 outline-none transition-all font-medium text-slate-100 placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <select
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-950 border-transparent focus:bg-slate-800 focus:border-blue-500 outline-none appearance-none font-bold text-sm cursor-pointer text-slate-100"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="group bg-slate-900 rounded-[2.5rem] border border-slate-800 p-2 hover:border-blue-500/40 transition-all duration-500 overflow-hidden"
            >
              <div className="relative rounded-[2.1rem] overflow-hidden aspect-[4/3] mb-4">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black shadow-sm text-slate-100">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  {doc.rating}
                </div>
                {doc.hasVideo && (
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-lg">
                    <Video size={12} /> Video Call
                  </div>
                )}
                {/* Accessibility Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/10">
                   {doc.availability.length} Days / Wk
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-black text-slate-100 group-hover:text-blue-400 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-sm font-bold text-blue-500 uppercase tracking-tighter">
                      {doc.specialty}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] block text-slate-600 font-bold uppercase">
                      Consultation
                    </span>
                    <span className="text-xl font-black text-slate-100">
                      ${doc.fee}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-400">{doc.location || "Central Hospital"}</span>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 font-medium mb-6 leading-relaxed">
                  {doc.about}
                </p>

                <div className="flex items-center gap-6 mb-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-400" />{" "}
                    {doc.experience}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setStep(1);
                  }}
                  className="w-full py-4 bg-slate-100 text-slate-950 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

return (
<div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500 relative">
<div className="flex items-center gap-4 mb-10">
<button
onClick={() => setStep(step - 1)}
className="w-12 h-12 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-900 transition-colors" >
<ChevronLeft size={24} />
</button>
<div>
<h2 className="text-2xl font-black text-slate-100">Booking Appointment</h2>
<p className="text-sm font-medium text-slate-500">Step {step} of 4</p>
</div>
</div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {step === 1 && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-8">
              <h3 className="text-xl font-black flex items-center gap-3 text-slate-100">
                <Calendar className="text-blue-500" /> Choose Date & Time
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 focus:bg-slate-950 outline-none font-bold transition-all text-slate-100"
                    value={details.date}
                    onChange={(e) =>
                      setDetails({ ...details, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Available Slots
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setDetails({ ...details, time: t })}
                        className={`p-4 rounded-2xl border-2 font-black text-xs transition-all ${
                          details.time === t
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20"
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:border-blue-900"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                disabled={!details.date || !details.time}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-slate-100 text-slate-950 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-8">
              <h3 className="text-xl font-black flex items-center gap-3 text-slate-100">
                <UserPlus className="text-blue-500" /> Patient Details
              </h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full p-4 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 focus:bg-slate-950 outline-none font-bold transition-all text-slate-100 placeholder:text-slate-700"
                      value={details.patientName}
                      onChange={(e) =>
                        setDetails({ ...details, patientName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Gmail Address
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="w-full p-4 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 focus:bg-slate-950 outline-none font-bold transition-all text-slate-100 placeholder:text-slate-700"
                      value={details.patientEmail}
                      onChange={(e) =>
                        setDetails({ ...details, patientEmail: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center">
                      <Video size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-200">Request Telehealth</p>
                      <p className="text-xs font-medium text-slate-500">
                        Secure video consultation
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer bg-slate-800 border-slate-700"
                    checked={details.isTelehealth}
                    onChange={(e) =>
                      setDetails({ ...details, isTelehealth: e.target.checked })
                    }
                  />
                </div>
              </div>
              <button
                disabled={!details.patientName || !details.patientEmail}
                onClick={() => setStep(3)}
                className="w-full py-4 bg-slate-100 text-slate-950 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20"
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3 text-slate-100">
                  <CreditCard className="text-blue-500" /> Secure Checkout
                </h3>

                <div className="perspective-[1000px]">
                    <VisualCard
                        cardNumber={cardInfo.number}
                        cardName={cardInfo.name}
                        expiry={cardInfo.expiry}
                        cvv={cardInfo.cvv}
                    />
                </div>

                <div className="grid gap-4 mt-8">
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Card Number</label>
                        <input
                            type="text"
                            maxLength="16"
                            placeholder="0000 0000 0000 0000"
                            className="w-full p-3 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 focus:bg-slate-950 outline-none font-bold transition-all text-sm text-slate-100"
                            value={cardInfo.number}
                            onChange={(e) => setCardInfo({...cardInfo, number: e.target.value.replace(/\D/g, '')})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Cardholder Name</label>
                        <input
                            type="text"
                            placeholder="FULL NAME"
                            className="w-full p-3 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 focus:bg-slate-950 outline-none font-bold transition-all text-sm uppercase text-slate-100"
                            value={cardInfo.name}
                            onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Expiry Date</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                maxLength="5"
                                className="w-full p-3 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 focus:bg-slate-950 outline-none font-bold transition-all text-sm text-slate-100"
                                value={cardInfo.expiry}
                                onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">CVV</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="•••"
                                    maxLength="3"
                                    className="w-full p-3 rounded-2xl bg-slate-950 border-2 border-transparent focus:border-blue-500 focus:bg-slate-950 outline-none font-bold transition-all text-sm text-slate-100"
                                    value={cardInfo.cvv}
                                    onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                                />
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-3xl space-y-4 border border-slate-800">
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Consultation Fee</span>
                    <span className="text-slate-300">${selectedDoctor.fee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Platform Service Fee</span>
                    <span className="text-slate-300">$10.00</span>
                  </div>
                  <div className="border-t border-slate-800 border-dashed pt-4 flex justify-between items-center">
                    <span className="text-lg font-black text-slate-100">Total Payable</span>
                    <span className="text-3xl font-black text-blue-500">
                      ${Number(selectedDoctor.fee) + 10}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onConfirm}
                  disabled={!isCardValid}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/20 disabled:opacity-20 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                >
                  Confirm & Pay <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="relative z-[310] bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-xl text-center space-y-8 animate-in zoom-in-90 duration-500">
              <Confetti />
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-900/30">
                <CheckCircle size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 tracking-tight text-slate-100">Schedule Blocked!</h3>
                <p className="text-slate-400 font-medium">
                  Your appointment is confirmed and added to our cloud systems.
                </p>
              </div>

              <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                <div className="px-6 py-3 bg-slate-900/50 flex items-center gap-2 justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-900/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-900/50" />
                    <div className="w-3 h-3 rounded-full bg-green-900/50" />
                    <span className="ml-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      HealthSync Cloud Dispatcher
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                    <Send size={10} /> DISPATCHED
                  </span>
                </div>
                <div className="p-8 text-left">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-blue-500 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      <Mail size={14} /> To: {details.patientEmail}
                    </div>
                    <button
                      onClick={sendRealEmail}
                      className="text-[10px] font-black text-slate-500 hover:text-slate-300 flex items-center gap-1 border border-slate-800 px-2 py-1 rounded-lg transition-colors"
                    >
                      <ExternalLink size={10} /> Open in Mail App
                    </button>
                  </div>
                  <div className="text-white text-sm font-black mb-2 pb-2 border-b border-slate-800">
                    Subject: {emailData.subject || "Generating confirmation..."}
                  </div>
                  <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap font-medium h-32 overflow-y-auto custom-scrollbar">
                    {emailData.body || "AI engine is finalizing your clinical documentation..."}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep(0);
                  setSelectedDoctor(null);
                }}
                className="w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-700 transition-all"
              >
                Return to Directory
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 sticky top-28 shadow-xl">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">
              Doctor Summary
            </h4>
            {selectedDoctor && (
                <div className="flex gap-4 items-center mb-6">
                <img
                    src={selectedDoctor.image}
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-slate-800"
                    alt=""
                />
                <div>
                    <p className="font-black text-lg leading-tight text-slate-100">
                    {selectedDoctor.name}
                    </p>
                    <p className="text-xs font-bold text-blue-600 uppercase">
                    {selectedDoctor.specialty}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black text-slate-600">
                        {selectedDoctor.rating} (50+ reviews)
                    </span>
                    </div>
                </div>
                </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-800">
               <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                <MapPin size={18} className="text-blue-500" />
                {selectedDoctor?.location || "Practice Location"}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                <Calendar size={18} className="text-blue-500" />
                {details.date || "Not selected"}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                <Clock size={18} className="text-blue-500" />
                {details.time || "Not selected"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

);
}

// --- Component: Admin Panel ---
function AdminPanel({
doctors,
appointments,
onAdd,
onDelete,
onStatusChange,
isProcessing,
onLogout,
adminPin,
adminPhrase,
onUpdateSecurity
}) {
const [showAdd, setShowAdd] = useState(false);
const [showSecurity, setShowSecurity] = useState(false);
const [newDoc, setNewDoc] = useState({
name: "",
specialty: "General Physician",
gender: "Male",
experience: "",
fee: "",
location: "",
about: "",
availability: "",
});

const [secForm, setSecForm] = useState({ pin: adminPin, phrase: adminPhrase });

const stats = useMemo(() => {
const totalRev = appointments
.filter((a) => a.status !== "Cancelled")
.reduce((acc, curr) => acc + (Number(curr.doctor.fee) + 10), 0);
const completed = appointments.filter(
(a) => a.status === "Completed"
).length;
return {
totalRev,
completed,
pending: appointments.filter((a) => a.status === "Upcoming").length,
};
}, [appointments]);

return (
<div className="space-y-10 animate-in fade-in duration-500">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<h1 className="text-3xl font-black tracking-tight text-slate-100">
Executive Dashboard
</h1>
<p className="text-slate-500 font-medium">
Cloud Registry Monitoring
</p>
</div>
<div className="flex items-center gap-3">
<button
onClick={() => setShowSecurity(true)}
className="px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all" >
<Settings size={16} /> Security Settings
</button>
<button
                onClick={onLogout}
                className="px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all"
            >
<Lock size={16} /> Lock Session
</button>
<button
onClick={() => setShowAdd(true)}
className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20" >
<Plus size={20} /> Add Professional
</button>
</div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRev}`}
          icon={<TrendingUp />}
          color="bg-green-900/20 text-green-500"
        />
        <StatCard
          label="Live Appointments"
          value={stats.pending}
          icon={<Calendar />}
          color="bg-blue-900/20 text-blue-500"
        />
        <StatCard
          label="Completed Sessions"
          value={stats.completed}
          icon={<CheckCircle />}
          color="bg-purple-900/20 text-purple-500"
        />
        <StatCard
          label="Total Specialists"
          value={doctors.length}
          icon={<User />}
          color="bg-orange-900/20 text-orange-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-100">Live Traffic Feed</h3>
              <RefreshCw
                className="text-slate-600 cursor-pointer hover:rotate-180 transition-transform duration-500"
                size={18}
              />
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <tr>
                    <th className="px-8 py-4">Patient</th>
                    <th className="px-8 py-4">Specialist</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-slate-600 font-bold italic">
                        No activity detected.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-black text-sm text-slate-200">{apt.patientName}</p>
                          <p className="text-xs text-slate-600 font-medium">{apt.patientEmail}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img src={apt.doctor.image} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
                            <p className="font-bold text-sm text-slate-300">{apt.doctor.name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              apt.status === "Completed" ? "bg-green-900/30 text-green-500" : apt.status === "Cancelled" ? "bg-red-900/30 text-red-500" : "bg-blue-900/30 text-blue-500"
                            }`}>{apt.status}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onStatusChange(apt.id, "Completed")} className="p-2 rounded-xl bg-slate-800 text-green-500 hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={14} /></button>
                            <button onClick={() => onStatusChange(apt.id, "Cancelled")} className="p-2 rounded-xl bg-slate-800 text-red-500 hover:bg-red-600 hover:text-white transition-all"><XCircle size={14} /></button>
                          </div>
                        </td>
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
            <h3 className="font-black text-lg mb-6 text-slate-100">Specialist Management</h3>
            <div className="space-y-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={doc.image} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <div>
                      <p className="font-bold text-sm text-slate-200 leading-none">{doc.name}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{doc.location || "Central Clinic"}</p>
                    </div>
                  </div>
                  <button onClick={() => onDelete(doc.id)} className="p-2.5 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[2rem] w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto border border-slate-800">
            <button onClick={() => setShowAdd(false)} className="absolute top-5 right-5 text-slate-600 hover:text-slate-200 transition-colors"><XCircle size={24} /></button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-100">Register Professional</h2>
              <p className="text-xs font-medium text-slate-500">Add a specialist to the encrypted cloud directory.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onAdd(newDoc); setShowAdd(false); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Doctor Name" placeholder="Dr. John Doe" value={newDoc.name} onChange={(v) => setNewDoc({ ...newDoc, name: v })} required />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Specialty</label>
                  <select
                    className="w-full p-3 rounded-xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs transition-all cursor-pointer h-[46px] text-slate-100"
                    value={newDoc.specialty}
                    onChange={(e) => setNewDoc({ ...newDoc, specialty: e.target.value })}
                  >
                    {SPECIALTIES.filter((s) => s !== "All Specialties").map((s) => (
                        <option key={s} value={s} className="bg-slate-900">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gender</label>
                  <select
                    className="w-full p-3 rounded-xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs transition-all cursor-pointer h-[46px] text-slate-100"
                    value={newDoc.gender}
                    onChange={(e) => setNewDoc({ ...newDoc, gender: e.target.value })}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g} className="bg-slate-900">{g}</option>
                    ))}
                  </select>
                </div>
                <Input label="Experience" placeholder="e.g. 10 years" value={newDoc.experience} onChange={(v) => setNewDoc({ ...newDoc, experience: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Consultation Fee" type="number" placeholder="150" value={newDoc.fee} onChange={(v) => setNewDoc({ ...newDoc, fee: v })} />
                <Input label="Clinic Location" placeholder="e.g. West End" value={newDoc.location} onChange={(v) => setNewDoc({ ...newDoc, location: v })} />
              </div>
              <Input label="Availability" placeholder="Mon, Wed, Fri" value={newDoc.availability} onChange={(v) => setNewDoc({ ...newDoc, availability: v })} />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Biography</label>
                <textarea
                  className="w-full p-3 rounded-xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs transition-all h-20 resize-none text-slate-100 placeholder:text-slate-700"
                  value={newDoc.about}
                  onChange={(e) => setNewDoc({ ...newDoc, about: e.target.value })}
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-900/20 text-blue-400 flex gap-2.5 text-[10px] font-bold leading-relaxed border border-blue-900/30">
                <ShieldCheck className="shrink-0" size={14} />
                HealthSync AI will generate a gender-accurate professional portrait.
              </div>

              <button type="submit" className="w-full py-3.5 bg-slate-100 text-slate-950 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                Onboard Specialist
              </button>
            </form>
          </div>
        </div>
      )}

      {showSecurity && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-md p-10 border border-slate-800 shadow-2xl animate-in zoom-in-95 relative border border-slate-800">
            <button onClick={() => setShowSecurity(false)} className="absolute top-6 right-6 text-slate-500 hover:text-slate-200 transition-colors"><XCircle size={24} /></button>
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-3">
                <Shield className="text-blue-500" /> Security Override
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-2">Update your administrative credentials.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">New 8-Digit PIN</label>
                        <input
                            type="password"
                            maxLength="8"
                            className="w-full p-4 rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-blue-600 outline-none text-slate-100 font-mono tracking-widest"
                            value={secForm.pin}
                            onChange={(e) => setSecForm({...secForm, pin: e.target.value.replace(/\D/g, '')})}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">New Secret Phrase</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-blue-600 outline-none text-slate-100 font-bold uppercase tracking-widest"
                            value={secForm.phrase}
                            onChange={(e) => setSecForm({...secForm, phrase: e.target.value.toUpperCase()})}
                        />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-yellow-900/10 border border-yellow-900/30 text-yellow-500/80 text-[10px] font-bold leading-relaxed">
                    <AlertCircle className="inline mr-2" size={14} />
                    Changing these codes will take effect immediately. Ensure you have memorized your new credentials before locking the session.
                </div>

                <button
                    onClick={() => {
                        if (secForm.pin.length === 8 && secForm.phrase) {
                            onUpdateSecurity(secForm.pin, secForm.phrase);
                            setShowSecurity(false);
                        }
                    }}
                    disabled={secForm.pin.length !== 8 || !secForm.phrase}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-500 shadow-xl shadow-blue-900/20 disabled:opacity-30"
                >
                    Save Encrypted Credentials
                </button>
            </div>
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
<div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
{React.cloneElement(icon, { size: 28 })}
</div>
<div>
<p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">
{label}
</p>
<p className="text-2xl font-black text-slate-100">{value}</p>
</div>
</div>
);
}

function Input({ label, value, onChange, placeholder, type = "text", required = false }) {
return (
<div className="space-y-1.5 w-full">
<label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
{label}
</label>
<input
type={type}
required={required}
placeholder={placeholder}
className="w-full p-3 rounded-xl bg-slate-950 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs transition-all text-slate-100 placeholder:text-slate-700"
value={value}
onChange={(e) => onChange(e.target.value)}
/>
</div>
);
}
