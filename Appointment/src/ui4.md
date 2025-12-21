import React, { useState, useEffect, useMemo } from "react";
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
Copy,
Terminal
} from "lucide-react";

// --- Configuration & Constants ---
const APP_ID = "healthsync-pro-v2";
const API_KEY = ""; // Provided by environment

const SPECIALTIES = [
"All Specialties",
"Cardiologist",
"Dermatologist",
"Neurologist",
"Pediatrician",
"General Physician",
"Psychiatrist"
];

const TIME_SLOTS = [
"09:00 AM", "10:00 AM", "11:00 AM",
"01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

const DEFAULT_DOCTORS = [
{
id: "d1",
name: "Dr. Sarah Mitchell",
specialty: "Cardiologist",
experience: "12 years",
rating: 4.9,
fee: 150,
about: "Specializing in preventive cardiology and heart health management. Dr. Mitchell has published over 30 research papers on cardiovascular health.",
availability: ["Monday", "Wednesday", "Friday"],
hasVideo: true,
image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200"
},
{
id: "d2",
name: "Dr. James Wilson",
specialty: "Dermatologist",
experience: "8 years",
rating: 4.7,
fee: 120,
about: "Expert in clinical dermatology and skin cancer screening. Former head of dermatology at Westside General Hospital.",
availability: ["Tuesday", "Thursday", "Saturday"],
hasVideo: false,
image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
}
];

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
isTelehealth: false
});

useEffect(() => {
localStorage.setItem(`${APP_ID}_doctors`, JSON.stringify(doctors));
}, [doctors]);

useEffect(() => {
localStorage.setItem(`${APP_ID}_appointments`, JSON.stringify(appointments));
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
parameters: { sampleCount: 1 }
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
const prompt = `Generate a professional and high-fidelity appointment confirmation email for HealthSync Medical Group.
Patient Name: ${details.patientName}. 
      Doctor: ${doctor.name} (${doctor.specialty}).
Date: ${details.date} at ${details.time}. 
      Type: ${details.isTelehealth ? "Virtual Video Consultation" : "In-Person Clinic Visit"}. 
      Location: HealthSync Plaza, Suite 402, Medical District.
      Payment: $${Number(doctor.fee) + 10} (Paid in full).

      Return as a JSON object with "subject" and "body" keys. The body should be multi-line and very professional.`;

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
                    body: { type: "STRING" }
                  },
                  required: ["subject", "body"]
                }
              }
            }),
          }
        );
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
      } catch (error) {
        if (retries < 3) {
          await new Promise(r => setTimeout(r, 1000));
          return fetchWithRetry(retries + 1);
        }
        return {
          subject: `Confirmed: Appointment with ${doctor.name}`,
          body: `Dear ${details.patientName},\n\nYour appointment with ${doctor.name} has been successfully scheduled for ${details.date} at ${details.time}.\n\nLocation: HealthSync Medical Plaza\nType: ${details.isTelehealth ? "Video Call" : "In-Person"}\n\nWe look forward to seeing you.`
        };
      }
    };

    const result = await fetchWithRetry();
    setEmailData(result);

};

const handleAddDoctor = async (newDoc) => {
setIsProcessing(true);
const portrait = await generateDoctorImage(newDoc.name, newDoc.specialty);
const docWithMeta = {
...newDoc,
id: `d-${Date.now()}`,
rating: 5.0,
image: portrait,
availability: newDoc.availability.split(",").map(s => s.trim())
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
createdAt: new Date().toISOString()
};
setAppointments([...appointments, newApt]);
await generateEmail(bookingDetails, selectedDoctor);
setBookingStep(4);
setIsProcessing(false);
};

return (
<div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
<nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
<div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
<Stethoscope size={24} />
</div>
<div>
<span className="text-xl font-black tracking-tight text-slate-800">HealthSync</span>
<span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Enterprise</span>
</div>
</div>

          <div className="flex bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
            <button
              onClick={() => { setView("patient"); setBookingStep(0); }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                view === "patient" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <User size={16} /> Patient
            </button>
            <button
              onClick={() => { setView("admin"); setBookingStep(0); }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                view === "admin" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
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
            onDelete={(id) => setDoctors(doctors.filter(d => d.id !== id))}
            onStatusChange={(id, status) => setAppointments(appointments.map(a => a.id === id ? {...a, status} : a))}
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

      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[200] flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <div className="text-center">
              <p className="font-bold text-lg">Syncing Services</p>
              <p className="text-sm text-slate-500">Communicating with AI Dispatch Server...</p>
            </div>
          </div>
        </div>
      )}
    </div>

);
}

// --- Component: Patient Portal ---
function PatientPortal({ doctors, step, setStep, selectedDoctor, setSelectedDoctor, details, setDetails, onConfirm, isProcessing, emailData }) {
const [search, setSearch] = useState("");
const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");
const [copyFeedback, setCopyFeedback] = useState(false);

const filteredDoctors = useMemo(() => {
return doctors.filter(doc => {
const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
doc.specialty.toLowerCase().includes(search.toLowerCase());
const matchesSpecialty = specialtyFilter === "All Specialties" || doc.specialty === specialtyFilter;
return matchesSearch && matchesSpecialty;
});
}, [doctors, search, specialtyFilter]);

const sendRealEmail = () => {
const subject = encodeURIComponent(emailData.subject);
const body = encodeURIComponent(emailData.body);
window.location.href = `mailto:${details.patientEmail}?subject=${subject}&body=${body}`;
};

const copyEmail = () => {
const text = `Subject: ${emailData.subject}\n\n${emailData.body}`;
const el = document.createElement('textarea');
el.value = text;
document.body.appendChild(el);
el.select();
document.execCommand('copy');
document.body.removeChild(el);
setCopyFeedback(true);
setTimeout(() => setCopyFeedback(false), 2000);
};

if (step === 0) return (
<div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
<div className="text-center max-w-3xl mx-auto space-y-4">
<h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
Expert care is <span className="text-blue-600">just a click</span> away.
</h1>
<p className="text-lg text-slate-500 font-medium">
The most advanced healthcare booking platform for premium medical services.
</p>
</div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search doctors, specialties..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none appearance-none font-bold text-sm cursor-pointer"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.map(doc => (
          <div key={doc.id} className="group bg-white rounded-[2.5rem] border border-slate-200 p-2 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 overflow-hidden hover:-translate-y-1">
            <div className="relative rounded-[2.1rem] overflow-hidden aspect-[4/3] mb-4">
              <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black shadow-sm">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                {doc.rating}
              </div>
            </div>
            <div className="px-6 pb-6 pt-2">
              <h3 className="text-xl font-black text-slate-800">{doc.name}</h3>
              <p className="text-sm font-bold text-blue-500 uppercase tracking-tighter mb-4">{doc.specialty}</p>
              <p className="text-sm text-slate-500 line-clamp-2 font-medium mb-6 leading-relaxed">{doc.about}</p>
              <button
                onClick={() => { setSelectedDoctor(doc); setStep(1); }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
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
<div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
<div className="flex items-center gap-4 mb-10">
<button onClick={() => setStep(step - 1)} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white transition-colors">
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
                <Calendar className="text-blue-600" /> Date & Time
              </h3>
              <div className="space-y-6">
                <input
                  type="date"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
                  value={details.date}
                  onChange={(e) => setDetails({...details, date: e.target.value})}
                />
                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      onClick={() => setDetails({...details, time: t})}
                      className={`p-4 rounded-2xl border-2 font-black text-xs transition-all ${
                        details.time === t ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                disabled={!details.date || !details.time}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all disabled:opacity-30"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 space-y-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                <UserPlus className="text-blue-600" /> Patient Information
              </h3>
              <div className="space-y-6">
                <Input label="Full Name" placeholder="John Doe" value={details.patientName} onChange={v => setDetails({...details, patientName: v})} />
                <Input label="Direct Email" placeholder="john@example.com" value={details.patientEmail} onChange={v => setDetails({...details, patientEmail: v})} />
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black">Enable Telehealth</p>
                    <p className="text-xs font-medium text-slate-500">Virtual video session</p>
                  </div>
                  <input type="checkbox" className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer" checked={details.isTelehealth} onChange={e => setDetails({...details, isTelehealth: e.target.checked})} />
                </div>
              </div>
              <button
                disabled={!details.patientName || !details.patientEmail}
                onClick={() => setStep(3)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all"
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 space-y-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                <CreditCard className="text-blue-600" /> Secure Checkout
              </h3>
              <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Consultation</span>
                  <span>${selectedDoctor.fee}</span>
                </div>
                <div className="border-t-2 border-slate-200 border-dashed pt-4 flex justify-between items-center">
                  <span className="text-lg font-black">Total Amount</span>
                  <span className="text-3xl font-black text-blue-600">${Number(selectedDoctor.fee) + 10}</span>
                </div>
              </div>
              <button
                onClick={onConfirm}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200"
              >
                Confirm & Dispatch Email
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 text-center space-y-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100 animate-bounce">
                <CheckCircle size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2">Booking Finalized</h3>
                <p className="text-slate-500 font-medium">We've generated the official confirmation. Send it to the patient now.</p>
              </div>

              <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                <div className="px-6 py-4 bg-slate-800 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-blue-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HealthSync SMTP Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-400 uppercase">System Ready</span>
                  </div>
                </div>

                <div className="p-8 text-left space-y-6">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="text-blue-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
                       <Mail size={14} /> {details.patientEmail}
                     </div>
                     <div className="flex gap-2">
                       <button
                          onClick={copyEmail}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 border border-slate-700"
                       >
                         {copyFeedback ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                         {copyFeedback ? "Copied" : "Copy Content"}
                       </button>
                       <button
                          onClick={sendRealEmail}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40"
                       >
                         <Send size={14} /> Send via Real Mail App
                       </button>
                     </div>
                   </div>

                   <div className="space-y-4 p-6 bg-slate-950/50 rounded-2xl border border-white/5">
                     <div className="text-white text-sm font-black border-b border-white/10 pb-2">
                       <span className="text-slate-500 mr-2">Subject:</span> {emailData.subject}
                     </div>
                     <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium h-48 overflow-y-auto custom-scrollbar">
                       {emailData.body}
                     </div>
                   </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => { setStep(0); setSelectedDoctor(null); }}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  Done & Exit
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 sticky top-28">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Live Itinerary</h4>
            <div className="flex gap-4 items-center mb-6">
              <img src={selectedDoctor.image} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt="" />
              <div>
                <p className="font-black text-sm leading-tight">{selectedDoctor.name}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase">{selectedDoctor.specialty}</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <Calendar size={14} className="text-blue-500" /> {details.date || "Pending..."}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <Clock size={14} className="text-blue-500" /> {details.time || "Pending..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

);
}

// --- Component: Admin Panel ---
function AdminPanel({ doctors, appointments, onAdd, onDelete, onStatusChange, isProcessing }) {
const [showAdd, setShowAdd] = useState(false);
const [newDoc, setNewDoc] = useState({ name: "", specialty: "General Physician", experience: "", fee: "", about: "", availability: "" });

return (
<div className="space-y-10 animate-in fade-in duration-500">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<h1 className="text-3xl font-black tracking-tight tracking-tighter">Admin Control Center</h1>
<p className="text-slate-500 font-medium">HealthSync Enterprise Edition</p>
</div>
<button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
<Plus size={20} /> Register Specialist
</button>
</div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/40">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-8 py-4">Patient & Specialist</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map(apt => (
              <tr key={apt.id}>
                <td className="px-8 py-6">
                  <p className="font-black text-sm">{apt.patientName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{apt.doctor.name}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    apt.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => onStatusChange(apt.id, "Completed")} className="p-2 bg-slate-100 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
              <XCircle size={22} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black">Register Specialist</h2>
              <p className="text-xs font-medium text-slate-500">Add a new medical professional to the system.</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); onAdd(newDoc); setShowAdd(false); }} className="space-y-4">
              <Input label="Professional Name" placeholder="e.g. Dr. John" value={newDoc.name} onChange={v => setNewDoc({...newDoc, name: v})} required />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Exp (Years)" placeholder="10" value={newDoc.experience} onChange={v => setNewDoc({...newDoc, experience: v})} />
                <Input label="Fee ($)" type="number" placeholder="150" value={newDoc.fee} onChange={v => setNewDoc({...newDoc, fee: v})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialty</label>
                <select
                  className="w-full p-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
                  value={newDoc.specialty}
                  onChange={(e) => setNewDoc({...newDoc, specialty: e.target.value})}
                >
                  {SPECIALTIES.filter(s => s !== "All Specialties").map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <Input label="Availability" placeholder="Mon, Wed, Fri" value={newDoc.availability} onChange={v => setNewDoc({...newDoc, availability: v})} />

              <div className="pt-4">
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                  Register & Generate AI Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

);
}

function Input({ label, value, onChange, placeholder, type = "text", required = false }) {
return (
<div className="space-y-1">
<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
<input
type={type} required={required} placeholder={placeholder}
className="w-full p-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all"
value={value} onChange={e => onChange(e.target.value)}
/>
</div>
);
}
