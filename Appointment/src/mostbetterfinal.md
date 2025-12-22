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
} from "lucide-react";

// --- Configuration & Constants ---
const APP_ID = "healthsync-pro-v1";
const API_KEY = ""; // Environment provides this

const SPECIALTIES = [
  "All Specialties",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "General Physician",
  "Psychiatrist",
];

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

  // --- AI Integrations ---

  const generateDoctorImage = async (name, specialty) => {
    try {
      const prompt = `Professional studio headshot of a friendly medical doctor named ${name}, who is a ${specialty}. High quality, white background, realistic, wearing a white coat and stethoscope, looking at camera.`;

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
    const portrait = await generateDoctorImage(newDoc.name, newDoc.specialty);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Stethoscope size={24} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-800">
                HealthSync
              </span>
              <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">
                Pro Edition
              </span>
            </div>
          </div>

          <div className="flex bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
            <button
              onClick={() => {
                setView("patient");
                setBookingStep(0);
              }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                view === "patient"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
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
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {view === "admin" ? (
          <AdminPanel
            doctors={doctors}
            appointments={appointments}
            onAdd={handleAddDoctor}
            onDelete={(id) => setDoctors(doctors.filter((d) => d.id !== id))}
            onStatusChange={updateAptStatus}
            isProcessing={isProcessing}
          />
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[200] flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <div className="text-center">
              <p className="font-bold text-lg">Processing Transaction</p>
              <p className="text-sm text-slate-500">
                Securing your health records...
              </p>
            </div>
          </div>
        </div>
      )}
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
    <div className="relative w-full aspect-[1.6/1] rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col justify-between group transition-all duration-500">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-blue-500/20 transition-colors" />
      
      <div className="flex justify-between items-start">
        <div className="w-12 h-10 bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-lg flex flex-col justify-center gap-1 p-2">
            <div className="h-[2px] w-full bg-slate-800/20" />
            <div className="h-[2px] w-full bg-slate-800/20" />
            <div className="h-[2px] w-full bg-slate-800/20" />
        </div>
        <div className="font-black italic text-xl tracking-tighter opacity-50">VISA</div>
      </div>

      <div className="space-y-4">
        <div className="text-xl md:text-2xl font-mono tracking-widest transition-all">
          {formattedNumber}
        </div>
        
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[8px] uppercase font-bold tracking-[0.2em] opacity-50">Card Holder</span>
            <p className="text-sm font-bold uppercase truncate max-w-[150px]">
              {cardName || "YOUR NAME"}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[8px] uppercase font-bold tracking-[0.2em] opacity-50">Expires</span>
            <p className="text-sm font-bold">{expiry || "MM/YY"}</p>
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
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Find and book the{" "}
            <span className="text-blue-600">best healthcare</span> providers.
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Access world-class doctors for in-person or video consultations,
            instantly.
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by doctor, clinic, or condition..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none appearance-none font-bold text-sm cursor-pointer"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
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
              className="group bg-white rounded-[2.5rem] border border-slate-200 p-2 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 overflow-hidden hover:-translate-y-1"
            >
              <div className="relative rounded-[2.1rem] overflow-hidden aspect-[4/3] mb-4">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black shadow-sm">
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
                    <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-sm font-bold text-blue-500 uppercase tracking-tighter">
                      {doc.specialty}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] block text-slate-400 font-bold uppercase">
                      Consultation
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      ${doc.fee}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-500">{doc.location || "Central Hospital"}</span>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 font-medium mb-6 leading-relaxed">
                  {doc.about}
                </p>

                <div className="flex items-center gap-6 mb-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
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
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 group-hover:shadow-blue-200"
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
          className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black">Booking Appointment</h2>
          <p className="text-sm font-medium text-slate-500">Step {step} of 4</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {step === 1 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 space-y-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                <Calendar className="text-blue-600" /> Choose Date & Time
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
                    value={details.date}
                    onChange={(e) =>
                      setDetails({ ...details, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                    Available Slots
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setDetails({ ...details, time: t })}
                        className={`p-4 rounded-2xl border-2 font-black text-xs transition-all ${
                          details.time === t
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                            : "bg-white border-slate-100 text-slate-500 hover:border-blue-400"
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
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all disabled:opacity-30"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 space-y-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                <UserPlus className="text-blue-600" /> Patient Details
              </h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
                      value={details.patientName}
                      onChange={(e) =>
                        setDetails({ ...details, patientName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Gmail Address
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
                      value={details.patientEmail}
                      onChange={(e) =>
                        setDetails({ ...details, patientEmail: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <Video size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black">Request Telehealth</p>
                      <p className="text-xs font-medium text-slate-500">
                        Secure video consultation
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer"
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
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all disabled:opacity-30"
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <CreditCard className="text-blue-600" /> Secure Checkout
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
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Card Number</label>
                        <input 
                            type="text"
                            maxLength="16"
                            placeholder="0000 0000 0000 0000"
                            className="w-full p-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all text-sm"
                            value={cardInfo.number}
                            onChange={(e) => setCardInfo({...cardInfo, number: e.target.value.replace(/\D/g, '')})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Cardholder Name</label>
                        <input 
                            type="text"
                            placeholder="FULL NAME"
                            className="w-full p-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all text-sm uppercase"
                            value={cardInfo.name}
                            onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Expiry Date</label>
                            <input 
                                type="text"
                                placeholder="MM/YY"
                                maxLength="5"
                                className="w-full p-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all text-sm"
                                value={cardInfo.expiry}
                                onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">CVV</label>
                            <div className="relative">
                                <input 
                                    type="password"
                                    placeholder="•••"
                                    maxLength="3"
                                    className="w-full p-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all text-sm"
                                    value={cardInfo.cvv}
                                    onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                                />
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Consultation Fee</span>
                    <span>${selectedDoctor.fee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Platform Service Fee</span>
                    <span>$10.00</span>
                  </div>
                  <div className="border-t-2 border-slate-200 border-dashed pt-4 flex justify-between items-center">
                    <span className="text-lg font-black">Total Payable</span>
                    <span className="text-3xl font-black text-blue-600">
                      ${Number(selectedDoctor.fee) + 10}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={onConfirm}
                  disabled={!isCardValid}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                >
                  Confirm & Pay <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="relative z-[310] bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 text-center space-y-8 animate-in zoom-in-90 duration-500">
              <Confetti />
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100">
                <CheckCircle size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 tracking-tight">Schedule Blocked!</h3>
                <p className="text-slate-500 font-medium">
                  Your appointment is confirmed and added to our systems.
                </p>
              </div>

              <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-3 bg-slate-800 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      HealthSync AI Dispatcher
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                    <Send size={10} /> DISPATCHED TO GMAIL
                  </span>
                </div>
                <div className="p-8 text-left">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-blue-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      <Mail size={14} /> To: {details.patientEmail}
                    </div>
                    <button
                      onClick={sendRealEmail}
                      className="text-[10px] font-black text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700 px-2 py-1 rounded-lg transition-colors"
                    >
                      <ExternalLink size={10} /> Open in Mail App
                    </button>
                  </div>
                  <div className="text-white text-sm font-black mb-2 pb-2 border-b border-slate-800">
                    Subject: {emailData.subject || "Generating confirmation..."}
                  </div>
                  <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium h-32 overflow-y-auto custom-scrollbar">
                    {emailData.body || "Please wait while our AI engine prepares your documentation..."}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep(0);
                  setSelectedDoctor(null);
                }}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Return to Directory
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 sticky top-28">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Doctor Summary
            </h4>
            {selectedDoctor && (
                <div className="flex gap-4 items-center mb-6">
                <img
                    src={selectedDoctor.image}
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                    alt=""
                />
                <div>
                    <p className="font-black text-lg leading-tight">
                    {selectedDoctor.name}
                    </p>
                    <p className="text-xs font-bold text-blue-600 uppercase">
                    {selectedDoctor.specialty}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black text-slate-400">
                        {selectedDoctor.rating} (50+ reviews)
                    </span>
                    </div>
                </div>
                </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-100">
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <MapPin size={18} className="text-blue-500" />
                {selectedDoctor?.location || "Practice Location"}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <Calendar size={18} className="text-blue-500" />
                {details.date || "Not selected"}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
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
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: "",
    specialty: "General Physician",
    experience: "",
    fee: "",
    location: "",
    about: "",
    availability: "",
  });

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
          <h1 className="text-3xl font-black tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-slate-500 font-medium">
            Monitoring HealthSync system activities
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
        >
          <Plus size={20} /> Add New Professional
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRev}`}
          icon={<TrendingUp />}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Live Appointments"
          value={stats.pending}
          icon={<Calendar />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Completed Sessions"
          value={stats.completed}
          icon={<CheckCircle />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Total Specialists"
          value={doctors.length}
          icon={<User />}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/40">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-lg">Appointment Flow</h3>
              <RefreshCw
                className="text-slate-400 cursor-pointer hover:rotate-180 transition-transform duration-500"
                size={18}
              />
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-8 py-4">Patient</th>
                    <th className="px-8 py-4">Specialist</th>
                    <th className="px-8 py-4">Location</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-20 text-center text-slate-400 font-bold italic"
                      >
                        No bookings recorded yet.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr
                        key={apt.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <p className="font-black text-sm">
                            {apt.patientName}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {apt.patientEmail}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={apt.doctor.image}
                              className="w-8 h-8 rounded-full"
                              alt=""
                            />
                            <p className="font-bold text-sm">
                              {apt.doctor.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <MapPin size={12} className="text-blue-500" />
                                {apt.doctor.location || "City Clinic"}
                            </div>
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              apt.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : apt.status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                onStatusChange(apt.id, "Completed")
                              }
                              className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() =>
                                onStatusChange(apt.id, "Cancelled")
                              }
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                            >
                              <XCircle size={14} />
                            </button>
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
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/40">
            <h3 className="font-black text-lg mb-6">Directory Management</h3>
            <div className="space-y-4">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.image}
                      className="w-12 h-12 rounded-xl object-cover"
                      alt=""
                    />
                    <div>
                      <p className="font-bold text-sm leading-none">
                        {doc.name}
                      </p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                        {doc.location || "No Location Set"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <XCircle size={24} />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black">Register Professional</h2>
              <p className="text-xs font-medium text-slate-500">
                Adding a new specialist to the cloud directory.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAdd(newDoc);
                setShowAdd(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Doctor Name"
                  placeholder="Dr. John Doe"
                  value={newDoc.name}
                  onChange={(v) => setNewDoc({ ...newDoc, name: v })}
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Specialty
                  </label>
                  <select
                    className="w-full p-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-xs transition-all cursor-pointer h-[46px]"
                    value={newDoc.specialty}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, specialty: e.target.value })
                    }
                  >
                    {SPECIALTIES.filter((s) => s !== "All Specialties").map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Experience"
                  placeholder="e.g. 10 years"
                  value={newDoc.experience}
                  onChange={(v) => setNewDoc({ ...newDoc, experience: v })}
                />
                <Input
                  label="Consultation Fee"
                  type="number"
                  placeholder="150"
                  value={newDoc.fee}
                  onChange={(v) => setNewDoc({ ...newDoc, fee: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Practice Location"
                    placeholder="e.g. City Hospital"
                    value={newDoc.location}
                    onChange={(v) => setNewDoc({ ...newDoc, location: v })}
                />
                <Input
                    label="Availability (Days)"
                    placeholder="Mon, Wed, Fri"
                    value={newDoc.availability}
                    onChange={(v) => setNewDoc({ ...newDoc, availability: v })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Biography
                </label>
                <textarea
                  className="w-full p-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-xs transition-all h-20 resize-none"
                  value={newDoc.about}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, about: e.target.value })
                  }
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 flex gap-2.5 text-[10px] font-bold leading-relaxed border border-blue-100">
                <ShieldCheck className="shrink-0" size={14} />
                The system will calculate weekly access and generate an AI portrait.
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
              >
                Onboard Specialist
              </button>
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
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/30 flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}
      >
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-xs transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}