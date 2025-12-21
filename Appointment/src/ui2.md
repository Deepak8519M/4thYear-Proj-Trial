import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
getFirestore,
collection,
doc,
setDoc,
getDoc,
onSnapshot,
query,
addDoc,
updateDoc,
deleteDoc
} from 'firebase/firestore';
import {
getAuth,
signInAnonymously,
signInWithCustomToken,
onAuthStateChanged
} from 'firebase/auth';
import {
User,
Calendar,
Clock,
FileText,
Search,
Shield,
Activity,
Plus,
AlertCircle,
Loader2,
ChevronRight,
ChevronLeft,
CheckCircle,
Trash2,
Stethoscope,
Settings
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(**firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof **app_id !== 'undefined' ? \_\_app_id : 'healthcare-portal-v1';

/\*\*

- UTILITY: Safe Serialization
- Prevents Firestore "invalid nested entity" and size errors.
  \*/
  const safeSerialize = (data) => {
  const serialized = { ...data };
  for (const key in serialized) {
  if (typeof serialized[key] === 'object' && serialized[key] !== null) {
  serialized[key] = JSON.stringify(serialized[key]);
  }
  if (typeof serialized[key] === 'string' && serialized[key].length > 1000000) {
  serialized[key] = serialized[key].substring(0, 1000000);
  }
  }
  return serialized;
  };

const safeDeserialize = (data) => {
const deserialized = { ...data };
for (const key in deserialized) {
const val = deserialized[key];
if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
try {
deserialized[key] = JSON.parse(val);
} catch (e) {
// Not a JSON string
}
}
}
return deserialized;
};

export default function App() {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [appointments, setAppointments] = useState([]);
const [doctors, setDoctors] = useState([]);
const [profile, setProfile] = useState(null);
const [view, setView] = useState('dashboard'); // dashboard, book, profile, admin
const [statusMsg, setStatusMsg] = useState(null);

// Booking Flow State
const [bookingStep, setBookingStep] = useState(1);
const [selectedDoctor, setSelectedDoctor] = useState(null);
const [selectedSlot, setSelectedSlot] = useState(null);

// Admin Form State
const [adminDocName, setAdminDocName] = useState('');
const [adminDocSpecialty, setAdminDocSpecialty] = useState('');
const [adminDocSlots, setAdminDocSlots] = useState('09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM');

// 1. Authentication
useEffect(() => {
const initAuth = async () => {
try {
if (typeof **initial_auth_token !== 'undefined' && **initial_auth_token) {
await signInWithCustomToken(auth, \_\_initial_auth_token);
} else {
await signInAnonymously(auth);
}
} catch (err) {
console.error("Auth error:", err);
}
};
initAuth();
const unsubscribe = onAuthStateChanged(auth, (currUser) => {
setUser(currUser);
setLoading(false);
});
return () => unsubscribe();
}, []);

// 2. Data Fetching
useEffect(() => {
if (!user) return;

    // Fetch Public Doctors
    const doctorsRef = collection(db, 'artifacts', appId, 'public', 'data', 'doctors');
    const unsubDocs = onSnapshot(doctorsRef, (snapshot) => {
      const docsData = snapshot.docs.map(d => ({ id: d.id, ...safeDeserialize(d.data()) }));
      setDoctors(docsData.length > 0 ? docsData : mockDoctors);
    }, (err) => console.error("Docs fetch error:", err));

    // Fetch User Profile
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(safeDeserialize(docSnap.data()));
      } else {
        const defaultProfile = { name: "Patient Name", email: user.email || "No Email", avatar: "" };
        setProfile(defaultProfile);
        saveProfile(defaultProfile);
      }
    }, (err) => console.error("Profile fetch error:", err));

    // Fetch Appointments
    const appointmentsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'appointments');
    const unsubAppts = onSnapshot(appointmentsRef, (snapshot) => {
      const appts = snapshot.docs.map(d => ({ id: d.id, ...safeDeserialize(d.data()) }));
      setAppointments(appts);
    }, (err) => console.error("Appointments fetch error:", err));

    return () => {
      unsubDocs();
      unsubProfile();
      unsubAppts();
    };

}, [user]);

const saveProfile = async (data) => {
if (!user) return;
try {
const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
await setDoc(profileRef, safeSerialize(data));
setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
} catch (err) {
setStatusMsg({ type: 'error', text: 'Update failed: ' + err.message });
}
};

// --- Admin Logic ---
const addDoctor = async (e) => {
e.preventDefault();
if (!user) return;
try {
const doctorsRef = collection(db, 'artifacts', appId, 'public', 'data', 'doctors');
const newDoc = {
name: adminDocName,
specialty: adminDocSpecialty,
slots: adminDocSlots.split(',').map(s => s.trim()),
timestamp: Date.now()
};
await addDoc(doctorsRef, safeSerialize(newDoc));
setAdminDocName('');
setAdminDocSpecialty('');
setStatusMsg({ type: 'success', text: 'Specialist added to the registry!' });
} catch (err) {
setStatusMsg({ type: 'error', text: 'Failed to add doctor: ' + err.message });
}
};

const deleteDoctor = async (id) => {
try {
const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', id);
await deleteDoc(doctorRef);
setStatusMsg({ type: 'success', text: 'Specialist removed.' });
} catch (err) {
setStatusMsg({ type: 'error', text: 'Delete failed.' });
}
};

// --- Booking Logic ---
const finishBooking = async () => {
if (!user || !selectedDoctor || !selectedSlot) return;
try {
const apptsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'appointments');
const newAppt = {
doctor: selectedDoctor,
slot: selectedSlot,
status: 'scheduled',
timestamp: Date.now()
};
await addDoc(apptsRef, safeSerialize(newAppt));
setStatusMsg({ type: 'success', text: `Confirmed! Appointment with Dr. ${selectedDoctor.name}` });
setBookingStep(4);
} catch (err) {
setStatusMsg({ type: 'error', text: 'Booking failed: ' + err.message });
}
};

const resetBooking = () => {
setBookingStep(1);
setSelectedDoctor(null);
setSelectedSlot(null);
setView('dashboard');
};

if (loading) {
return (
<div className="flex items-center justify-center h-screen bg-slate-50">
<Loader2 className="w-10 h-10 animate-spin text-blue-600" />
</div>
);
}

return (
<div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0 md:pl-64">
{/_ Sidebar - Desktop _/}
<aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 z-10 shadow-sm">
<div className="flex items-center gap-3 mb-10 px-2">
<div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
<Stethoscope className="text-white w-6 h-6" />
</div>
<h1 className="font-black text-xl tracking-tight text-slate-800">HealthSync</h1>
</div>

        <nav className="space-y-1.5 flex-1">
          <SidebarLink icon={<Activity />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarLink icon={<Calendar />} label="Bookings" active={view === 'book'} onClick={() => { setView('book'); setBookingStep(1); }} />
          <SidebarLink icon={<User />} label="My Profile" active={view === 'profile'} onClick={() => setView('profile')} />
          <SidebarLink icon={<Settings />} label="Admin Portal" active={view === 'admin'} onClick={() => setView('admin')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {profile?.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <User className="text-blue-600 w-5 h-5" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-800">{profile?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-10 max-w-6xl mx-auto">
        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            <AlertCircle className="w-5 h-5" />
            <p className="flex-1 text-sm font-semibold">{statusMsg.text}</p>
            <button onClick={() => setStatusMsg(null)} className="text-current opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Health Dashboard</h2>
                <p className="text-slate-500 font-medium">Manage your wellness and upcoming consultations.</p>
              </div>
              <button
                onClick={() => { setView('book'); setBookingStep(1); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Book Appointment
              </button>
            </header>

            <section className="grid sm:grid-cols-3 gap-6">
              <StatCard icon={<Calendar className="text-blue-600" />} label="Visits" value={appointments.length} bg="bg-white" />
              <StatCard icon={<Activity className="text-orange-600" />} label="Specialists" value={doctors.length} bg="bg-white" />
              <StatCard icon={<Shield className="text-emerald-600" />} label="Records" value="Safe" bg="bg-white" />
            </section>

            <section>
              <h3 className="text-xl font-black mb-5 flex items-center gap-2 text-slate-800">
                Upcoming Schedule
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{appointments.filter(a => a.status === 'scheduled').length}</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
                  <div className="col-span-full bg-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No consultations on your horizon.</p>
                    <button onClick={() => setView('book')} className="text-blue-600 font-bold mt-2 hover:underline">Start your journey</button>
                  </div>
                ) : (
                  appointments.filter(a => a.status === 'scheduled').map(appt => (
                    <div key={appt.id} className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-5 hover:border-blue-300 hover:shadow-lg transition-all">
                      <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800">Dr. {appt.doctor?.name}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{appt.doctor?.specialty}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold text-slate-400">
                          <Clock size={12} /> {appt.slot}
                        </div>
                      </div>
                      <div className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase">Confirmed</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {view === 'book' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight">New Appointment</h2>
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Step {bookingStep} of 4</span>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${bookingStep >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ))}
            </div>

            {bookingStep === 1 && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <h3 className="text-2xl font-black">Choose your specialist</h3>
                  <p className="text-slate-500">Select a verified healthcare provider.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {doctors.map(dr => (
                    <button
                      key={dr.id}
                      onClick={() => { setSelectedDoctor(dr); setBookingStep(2); }}
                      className="bg-white border-2 border-transparent hover:border-blue-600 p-6 rounded-[2rem] text-left flex items-center gap-5 transition-all shadow-sm group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Stethoscope size={28} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800">Dr. {dr.name}</h4>
                        <p className="text-sm text-slate-500 font-medium">{dr.specialty}</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-12 shadow-sm animate-in zoom-in-95">
                <button onClick={() => setBookingStep(1)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 mb-8 font-bold text-sm">
                  <ChevronLeft size={16} /> Back
                </button>
                <h3 className="text-2xl font-black mb-2">Schedule with Dr. {selectedDoctor?.name}</h3>
                <p className="text-slate-500 mb-8">Choose an available slot for your consultation.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedDoctor?.slots?.map(slot => (
                    <button
                      key={slot}
                      onClick={() => { setSelectedSlot(slot); setBookingStep(3); }}
                      className="p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 text-sm font-black transition-all text-slate-700"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm animate-in zoom-in-95 text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={32} />
                </div>
                <h3 className="text-2xl font-black mb-2">Review & Confirm</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Please confirm the details of your appointment below.</p>

                <div className="bg-slate-50 rounded-3xl p-8 mb-8 text-left space-y-4 max-w-md mx-auto border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Patient</span>
                    <span className="font-bold text-slate-800">{profile?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Specialist</span>
                    <span className="font-bold text-slate-800">Dr. {selectedDoctor?.name}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Date/Time</span>
                    <span className="font-bold text-blue-600">{selectedSlot}</span>
                  </div>
                </div>

                <div className="flex gap-4 max-w-md mx-auto">
                  <button onClick={() => setBookingStep(2)} className="flex-1 py-4 font-black text-slate-400">Back</button>
                  <button onClick={finishBooking} className="flex-2 flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100">Confirm Booking</button>
                </div>
              </div>
            )}

            {bookingStep === 4 && (
              <div className="text-center py-20 animate-in zoom-in-90 duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle size={48} strokeWidth={3} />
                </div>
                <h3 className="text-4xl font-black tracking-tight mb-4">Confirmed!</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium">Your appointment is finalized and added to your dashboard.</p>
                <button onClick={resetBooking} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl">Go to Dashboard</button>
              </div>
            )}
          </div>
        )}

        {view === 'admin' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-black tracking-tight">Admin Portal</h2>
              <p className="text-slate-500 font-medium">Manage the clinic's medical registry and specialists.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <UserPlus className="text-blue-600" /> Onboard Specialist
                  </h3>
                  <form onSubmit={addDoctor} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-400 ml-1">Doctor Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Elena Fisher"
                        value={adminDocName}
                        onChange={e => setAdminDocName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-400 ml-1">Specialty</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Oncologist"
                        value={adminDocSpecialty}
                        onChange={e => setAdminDocSpecialty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-400 ml-1">Time Slots (CSV)</label>
                      <input
                        required
                        type="text"
                        value={adminDocSlots}
                        onChange={e => setAdminDocSlots(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                      />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-50 hover:bg-blue-700 transition-all">
                      Add to Registry
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-black text-lg">Current Registry</h3>
                    <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-md">{doctors.length} Doctors</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <tr>
                          <th className="px-6 py-4">Specialist</th>
                          <th className="px-6 py-4">Expertise</th>
                          <th className="px-6 py-4 text-right pr-10">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {doctors.map(dr => (
                          <tr key={dr.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-black text-slate-800">Dr. {dr.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">{dr.specialty}</span>
                            </td>
                            <td className="px-6 py-4 text-right pr-8">
                              <button onClick={() => deleteDoctor(dr.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-500 max-w-xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight">Account Settings</h2>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl shadow-slate-100">
                    {profile?.avatar ? (
                      <img src={profile.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-8 text-slate-300" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-2xl text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size < 800000) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const updated = { ...profile, avatar: reader.result };
                          setProfile(updated);
                          saveProfile(updated);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setStatusMsg({ type: 'error', text: 'Please use a smaller image (under 800KB).' });
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Email</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-400 cursor-not-allowed"
                    disabled
                  />
                </div>
                <button
                  onClick={() => saveProfile(profile)}
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-slate-100"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex md:hidden h-20 items-center justify-around z-20 px-2 shadow-2xl">
        <MobileNavLink icon={<Activity />} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        <MobileNavLink icon={<Calendar />} active={view === 'book'} onClick={() => { setView('book'); setBookingStep(1); }} />
        <MobileNavLink icon={<Settings />} active={view === 'admin'} onClick={() => setView('admin')} />
        <MobileNavLink icon={<User />} active={view === 'profile'} onClick={() => setView('profile')} />
      </nav>
    </div>

);
}

// --- Components ---

function SidebarLink({ icon, label, active, onClick }) {
return (
<button
onClick={onClick}
className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 font-bold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`} >
{React.cloneElement(icon, { size: 20, strokeWidth: active ? 3 : 2 })}
<span className="text-sm font-bold tracking-tight">{label}</span>
{!active && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />}
</button>
);
}

function MobileNavLink({ icon, active, onClick }) {
return (
<button
onClick={onClick}
className={`p-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110 -translate-y-2' : 'text-slate-400'}`} >
{React.cloneElement(icon, { size: 24, strokeWidth: active ? 3 : 2 })}
</button>
);
}

function StatCard({ icon, label, value, bg }) {
return (
<div className={`${bg} border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group`}>
<div className="mb-6 p-4 bg-slate-50 w-fit rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{icon}</div>
<p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
<p className="text-4xl font-black mt-2 text-slate-800">{value}</p>
</div>
);
}

function UserPlus(props) {
return <Plus {...props} />;
}

// --- Mock Data ---
const mockDoctors = [
{ id: 'dr1', name: "Sarah Jenkins", specialty: "Cardiologist", slots: ["09:00 AM", "11:30 AM", "03:00 PM"] },
{ id: 'dr2', name: "Michael Chen", specialty: "Dermatologist", slots: ["10:15 AM", "01:45 PM", "04:30 PM"] }
];
