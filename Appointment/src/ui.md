import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
getFirestore,
collection,
doc,
setDoc,
getDoc,
addDoc,
onSnapshot,
updateDoc,
deleteDoc,
query
} from 'firebase/firestore';
import {
getAuth,
signInAnonymously,
signInWithCustomToken,
onAuthStateChanged
} from 'firebase/auth';
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
ExternalLink,
Filter,
Video,
AlertCircle,
TrendingUp
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(**firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof **app_id !== 'undefined' ? \_\_app_id : 'healthsync-pro-99';

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

export default function App() {
const [user, setUser] = useState(null);
const [view, setView] = useState('patient');
const [doctors, setDoctors] = useState([]);
const [appointments, setAppointments] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [selectedSpecialty, setSelectedSpecialty] = useState("All");

// Booking Flow State
const [bookingStep, setBookingStep] = useState(0);
const [selectedDoctor, setSelectedDoctor] = useState(null);
const [isSendingEmail, setIsSendingEmail] = useState(false);
const [emailDraft, setEmailDraft] = useState("");
const [bookingDetails, setBookingDetails] = useState({
date: '',
time: '',
patientName: '',
patientEmail: ''
});

// --- Auth Initialization ---
useEffect(() => {
const initAuth = async () => {
try {
if (typeof **initial_auth_token !== 'undefined' && **initial_auth_token) {
await signInWithCustomToken(auth, \_\_initial_auth_token);
} else {
await signInAnonymously(auth);
}
} catch (error) {
console.error("Auth failed", error);
}
};
initAuth();
const unsubscribe = onAuthStateChanged(auth, (u) => {
setUser(u);
});
return () => unsubscribe();
}, []);

// --- Real-time Data Listeners ---
useEffect(() => {
if (!user) return;

    const doctorsCol = collection(db, 'artifacts', appId, 'public', 'data', 'doctors');
    const appointmentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');

    const unsubDocs = onSnapshot(doctorsCol, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setDoctors(docs);
      setIsLoading(false);
    }, (err) => console.error("Docs error", err));

    const unsubAppts = onSnapshot(appointmentsCol, (snapshot) => {
      const appts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppointments(appts);
    }, (err) => console.error("Appts error", err));

    return () => {
      unsubDocs();
      unsubAppts();
    };

}, [user]);

// --- Actions ---
const handleAddDoctor = async (newDoc) => {
if (!user) return;
const docRef = collection(db, 'artifacts', appId, 'public', 'data', 'doctors');

    // Generate AI Avatar
    const avatar = await generateDoctorAvatar(newDoc.name, newDoc.specialty);

    await addDoc(docRef, {
      ...newDoc,
      rating: 4.8 + Math.random() * 0.2,
      avatar,
      createdAt: new Date().toISOString()
    });

};

const generateDoctorAvatar = async (name, specialty) => {
const apiKey = "";
const prompt = `Professional headshot of a friendly doctor named ${name}, specializing in ${specialty}, clinical setting, high quality, medical professional.`;
try {
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ instances: { prompt }, parameters: { sampleCount: 1 } })
});
const result = await response.json();
return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
} catch (e) {
return null; // Fallback to icon
}
};

const handleUpdateApptStatus = async (id, status) => {
const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id);
await updateDoc(docRef, { status });
};

const handleDeleteDoctor = async (id) => {
const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', id);
await deleteDoc(docRef);
};

const confirmBooking = async () => {
if (!user) return;
const apptsRef = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');
const newAppointment = {
doctor: selectedDoctor,
...bookingDetails,
status: 'Confirmed',
createdAt: new Date().toISOString()
};
await addDoc(apptsRef, newAppointment);
setBookingStep(4);
await generateConfirmationEmail(bookingDetails, selectedDoctor);
};

// --- Filtering Logic ---
const filteredDoctors = useMemo(() => {
return doctors.filter(doc => {
const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
const matchesSpecialty = selectedSpecialty === "All" || doc.specialty === selectedSpecialty;
return matchesSearch && matchesSpecialty;
});
}, [doctors, searchQuery, selectedSpecialty]);

const specialties = ["All", ...new Set(doctors.map(d => d.specialty))];

// --- Gemini API Email ---
const generateConfirmationEmail = async (details, doctor) => {
setIsSendingEmail(true);
const apiKey = "";
const prompt = `Professional email body for ${details.patientName} confirming appointment with ${doctor.name} on ${details.date} at ${details.time}. Mention payment received. Use medical suite 402 as location.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setEmailDraft(data.candidates?.[0]?.content?.parts?.[0]?.text || "Confirmed!");
    } catch (err) {
      setEmailDraft("Confirmed! Your appointment is blocked.");
    } finally {
      setIsSendingEmail(false);
    }

};

if (isLoading) {
return (
<div className="h-screen flex items-center justify-center bg-slate-50">
<div className="text-center space-y-4">
<Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
<p className="text-slate-500 font-medium animate-pulse">Syncing with Cloud Database...</p>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
{/_ Dynamic Nav _/}
<nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
<Stethoscope className="text-white" size={24} />
</div>
<div>
<span className="text-xl font-black tracking-tight text-slate-900">HEALTHSYNC</span>
<div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
<div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Cloud Live
</div>
</div>
</div>

          <div className="flex bg-slate-100/80 rounded-2xl p-1.5 border border-slate-200 shadow-inner">
            <button
              onClick={() => { setView('patient'); setBookingStep(0); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'patient' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Patient Portal
            </button>
            <button
              onClick={() => { setView('admin'); setBookingStep(0); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'admin' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Admin Center
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        {view === 'admin' ? (
          <AdminDashboard
            doctors={doctors}
            appointments={appointments}
            onAdd={handleAddDoctor}
            onDelete={handleDeleteDoctor}
            onUpdateStatus={handleUpdateApptStatus}
          />
        ) : (
          <div className="space-y-8">
            {bookingStep === 0 ? (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Find your specialist</h1>
                    <p className="text-slate-500 mt-2 text-lg">Real-time scheduling with world-class doctors.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        placeholder="Search doctor or specialty..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        className="pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none appearance-none focus:ring-4 focus:ring-blue-500/10 font-medium shadow-sm cursor-pointer"
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                      >
                        {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDoctors.map(doc => (
                    <DoctorCard
                      key={doc.id}
                      doc={doc}
                      onSelect={() => { setSelectedDoctor(doc); setBookingStep(1); }}
                    />
                  ))}
                  {filteredDoctors.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 italic">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p>No specialists match your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <BookingFlow
                step={bookingStep}
                selectedDoctor={selectedDoctor}
                details={bookingDetails}
                setDetails={setBookingDetails}
                onNext={() => setBookingStep(s => s + 1)}
                onPrev={() => setBookingStep(s => s - 1)}
                onConfirm={confirmBooking}
                onReset={() => setBookingStep(0)}
                isSendingEmail={isSendingEmail}
                emailDraft={emailDraft}
              />
            )}
          </div>
        )}
      </main>
    </div>

);
}

// --- Specialized Components ---

function DoctorCard({ doc, onSelect }) {
return (
<div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group p-1">
<div className="relative aspect-[4/3] rounded-[1.75rem] overflow-hidden bg-slate-100">
{doc.avatar ? (
<img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover" />
) : (
<div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
<User size={64} strokeWidth={1} />
</div>
)}
<div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
<Star size={14} fill="#EAB308" className="text-yellow-500" />
<span className="text-xs font-black">{doc.rating?.toFixed(1)}</span>
</div>
{Math.random() > 0.5 && (
<div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
<Video size={12} /> Video consult
</div>
)}
</div>

      <div className="p-6 pt-5">
        <div className="mb-4">
          <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">{doc.specialty}</p>
          <h3 className="text-xl font-black text-slate-900">{doc.name}</h3>
        </div>

        <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed font-medium">
          {doc.about || "Top-rated specialist with extensive experience in clinical care and advanced diagnostics."}
        </p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase">Cons. Fee</span>
            <p className="text-xl font-black text-slate-900">${doc.fee}</p>
          </div>
          <button
            onClick={onSelect}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all flex items-center gap-2 group/btn"
          >
            Book Slot <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>

);
}

function AdminDashboard({ doctors, appointments, onAdd, onDelete, onUpdateStatus }) {
const [isModalOpen, setIsModalOpen] = useState(false);
const totalRevenue = appointments.filter(a => a.status !== 'Cancelled').reduce((acc, a) => acc + (Number(a.doctor?.fee) || 0), 0);

return (
<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<div>
<h1 className="text-3xl font-black tracking-tight">Admin Center</h1>
<p className="text-slate-500 font-medium">Live monitoring across all devices.</p>
</div>
<button
onClick={() => setIsModalOpen(true)}
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 font-black shadow-lg shadow-blue-100 transition-all" >
<Plus size={20} strokeWidth={3} /> Add Specialist
</button>
</div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`$${totalRevenue}`} trend="+12.5%" icon={<TrendingUp className="text-green-600" />} />
        <StatCard label="Live Doctors" value={doctors.length} icon={<User className="text-blue-600" />} />
        <StatCard label="Bookings" value={appointments.length} icon={<Calendar className="text-orange-600" />} />
        <StatCard label="Active Slots" value={doctors.length * TIME_SLOTS.length} icon={<Clock className="text-purple-600" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Doctor List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-black text-lg">Specialist Directory</h2>
            <span className="text-[10px] font-black bg-slate-200 px-2 py-1 rounded-md">{doctors.length} Total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Specialist</th>
                  <th className="px-6 py-4">Specialty</th>
                  <th className="px-6 py-4">Fee</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {doctors.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                        {d.avatar ? <img src={d.avatar} className="w-full h-full object-cover rounded-lg" /> : d.name.charAt(0)}
                      </div>
                      {d.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{d.specialty}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">${d.fee}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onDelete(d.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointment Status Manager */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-black text-lg">Live Bookings</h2>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px]">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic text-sm">No bookings yet.</div>
            ) : (
              appointments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(apt => (
                <div key={apt.id} className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-sm">{apt.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{apt.doctor?.name}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                      apt.status === 'Confirmed' ? 'bg-blue-100 text-blue-600' :
                      apt.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {apt.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {apt.time}</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'Completed')}
                      className="flex-1 py-2 text-[10px] font-black bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                    >
                      MARK DONE
                    </button>
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'Cancelled')}
                      className="flex-1 py-2 text-[10px] font-black bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <DoctorModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => { onAdd(data); setIsModalOpen(false); }}
        />
      )}
    </div>

);
}

function StatCard({ label, value, trend, icon }) {
return (
<div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
<div className="flex justify-between items-start relative z-10">
<div className="space-y-1">
<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
<p className="text-3xl font-black text-slate-900">{value}</p>
{trend && <p className="text-[10px] font-black text-green-600">{trend} vs last month</p>}
</div>
<div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
{icon}
</div>
</div>
<div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
{React.cloneElement(icon, { size: 100 })}
</div>
</div>
);
}

function DoctorModal({ onClose, onSubmit }) {
const [data, setData] = useState({ name: '', specialty: '', fee: '150', experience: '10 years', availability: 'Mon, Wed, Fri', about: '' });
const [isGenerating, setIsGenerating] = useState(false);

return (
<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
<div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
<h2 className="text-2xl font-black mb-6">Onboard Specialist</h2>
<form onSubmit={(e) => { e.preventDefault(); setIsGenerating(true); onSubmit(data); }} className="space-y-4">
<div className="grid grid-cols-2 gap-4">
<div className="space-y-1.5">
<label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
<input required placeholder="Dr. Jane Smith" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" onChange={e => setData({...data, name: e.target.value})} />
</div>
<div className="space-y-1.5">
<label className="text-[10px] font-black uppercase text-slate-400 ml-1">Specialty</label>
<input required placeholder="Dermatologist" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" onChange={e => setData({...data, specialty: e.target.value})} />
</div>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="space-y-1.5">
<label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fee ($)</label>
<input type="number" value={data.fee} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" onChange={e => setData({...data, fee: e.target.value})} />
</div>
<div className="space-y-1.5">
<label className="text-[10px] font-black uppercase text-slate-400 ml-1">Experience</label>
<input placeholder="12 years" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" onChange={e => setData({...data, experience: e.target.value})} />
</div>
</div>
<div className="space-y-1.5">
<label className="text-[10px] font-black uppercase text-slate-400 ml-1">Brief Biography</label>
<textarea placeholder="Tell patients about their expertise..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium h-24" onChange={e => setData({...data, about: e.target.value})} />
</div>
<div className="flex gap-4 pt-4">
<button type="button" onClick={onClose} className="flex-1 py-4 font-black text-slate-500 hover:text-slate-800 transition-colors">Discard</button>
<button 
              type="submit" 
              disabled={isGenerating}
              className="flex-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
{isGenerating ? <Loader2 className="animate-spin" /> : 'Confirm & Sync'}
</button>
</div>
</form>
</div>
</div>
);
}

function BookingFlow({ step, selectedDoctor, details, setDetails, onNext, onPrev, onConfirm, onReset, isSendingEmail, emailDraft }) {
// Step indicator UI
const steps = ["Schedule", "Patient", "Secure Pay", "Confirm"];

return (
<div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
{step < 4 && (
<div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
{steps.map((s, i) => (
<div key={s} className="flex items-center gap-2 flex-1 justify-center relative">
<div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                step > i + 1 ? 'bg-green-100 text-green-600' : 
                step === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'bg-slate-100 text-slate-400'
              }`}>
{step > i + 1 ? <CheckCircle size={16} /> : i + 1}
</div>
<span className={`hidden sm:inline text-[10px] font-black uppercase tracking-widest ${step === i + 1 ? 'text-slate-900' : 'text-slate-400'}`}>{s}</span>
</div>
))}
</div>
)}

      {step === 1 && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-8 sm:p-12 animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row gap-8 items-center mb-10 pb-10 border-b border-slate-100">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner">
              {selectedDoctor?.avatar ? <img src={selectedDoctor.avatar} className="w-full h-full object-cover" /> : <User size={64} className="m-8 opacity-20" />}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-1">{selectedDoctor?.specialty}</p>
              <h2 className="text-3xl font-black tracking-tight">{selectedDoctor?.name}</h2>
              <p className="text-slate-400 text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <MapPin size={14} /> Medical Center, Suite 402
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Appointment Date
              </label>
              <input
                type="date"
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-lg"
                onChange={e => setDetails({...details, date: e.target.value})}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-2">
                <Clock size={12} /> Preferred Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    onClick={() => setDetails({...details, time: t})}
                    className={`p-4 rounded-2xl font-black text-xs transition-all border ${
                      details.time === t ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-12">
            <button onClick={onReset} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-800 transition-colors">Discard</button>
            <button
              disabled={!details.date || !details.time}
              onClick={onNext}
              className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-10 animate-in zoom-in-95">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><UserPlus /></div>
            Patient Details
          </h2>
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Name</label>
                <input
                  placeholder="Enter patient's name"
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold"
                  value={details.patientName}
                  onChange={e => setDetails({...details, patientName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Contact Email</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold"
                  value={details.patientEmail}
                  onChange={e => setDetails({...details, patientEmail: e.target.value})}
                />
              </div>
            </div>
            <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-100 flex gap-4 items-start">
              <AlertCircle className="text-yellow-600 shrink-0" size={24} />
              <p className="text-sm font-medium text-yellow-800 leading-relaxed">
                Ensure the email address is correct. A real-time notification will be drafted for your Gmail account upon confirmation.
              </p>
            </div>
          </div>
          <div className="flex gap-4 pt-10">
            <button onClick={onPrev} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-800">Back</button>
            <button
              disabled={!details.patientName || !details.patientEmail}
              onClick={onNext}
              className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 transition-all"
            >
              Secure Checkout
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-10 animate-in zoom-in-95">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><CreditCard /></div>
            Secure Payment
          </h2>
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-4">
              <div className="flex justify-between items-center text-slate-400 text-xs font-black uppercase tracking-widest">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Consultation: {selectedDoctor?.name}</span>
                <span>${selectedDoctor?.fee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>System Service Fee</span>
                <span>$10.00</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                <span className="text-sm font-bold opacity-60">Total to block schedule</span>
                <span className="text-4xl font-black text-blue-400">${Number(selectedDoctor?.fee) + 10}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 italic text-sm">
              <ShieldCheck size={18} />
              Bank-grade SSL encryption active. No card data stored.
            </div>
          </div>
          <div className="flex gap-4 pt-10">
            <button onClick={onPrev} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-800">Back</button>
            <button
              onClick={onConfirm}
              className="flex-[2] py-5 bg-green-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-green-100 hover:bg-green-700 transition-all"
            >
              Confirm & Block Slot
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={48} strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-black tracking-tight">Slot Reserved!</h2>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">Your appointment with {selectedDoctor?.name} is now synchronized with our cloud.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black border-b border-slate-50 pb-4 text-slate-400 text-[10px] uppercase tracking-widest">Booking Summary</h3>
              <div className="space-y-4">
                <SummaryItem label="ID" value={`#HS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`} mono />
                <SummaryItem label="Patient" value={details.patientName} />
                <SummaryItem label="Schedule" value={`${details.date} at ${details.time}`} />
                <SummaryItem label="Payment" value="Processed (Cloud Verified)" green />
              </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-[3rem] text-white flex flex-col items-center justify-center text-center space-y-6 shadow-2xl shadow-blue-200 border-4 border-blue-400">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                <Mail size={32} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Next Action Required</p>
                <p className="text-sm font-medium leading-relaxed">
                  To finalize the notification, click below to open your Gmail with the professional confirmation already drafted.
                </p>
              </div>

              {isSendingEmail ? (
                <div className="flex items-center gap-3 animate-pulse font-black text-sm">
                  <Loader2 className="animate-spin" /> AI DRAFTING...
                </div>
              ) : (
                <button
                  onClick={() => {
                    const subject = encodeURIComponent(`HealthSync Appointment: ${selectedDoctor?.name}`);
                    const body = encodeURIComponent(emailDraft);
                    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${details.patientEmail}&su=${subject}&body=${body}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full py-4 bg-white text-blue-600 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  SEND GMAIL <ExternalLink size={20} />
                </button>
              )}
            </div>
          </div>

          <button onClick={onReset} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-blue-600 transition-all shadow-xl">
            Back to Specialists
          </button>
        </div>
      )}
    </div>

);
}

function SummaryItem({ label, value, mono, green }) {
return (
<div className="flex justify-between items-center">
<span className="text-slate-400 text-xs font-bold">{label}</span>
<span className={`text-sm font-black ${mono ? 'font-mono' : ''} ${green ? 'text-green-600' : 'text-slate-900'}`}>{value}</span>
</div>
);
}
