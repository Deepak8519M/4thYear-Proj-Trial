import React, { useState, useEffect } from 'react';
import {
Plus,
User,
Droplets,
AlertTriangle,
Stethoscope,
Pill,
Phone,
Edit2,
Save,
X,
ShieldAlert,
Lock,
Unlock,
HeartPulse,
Info
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
getFirestore,
doc,
setDoc,
onSnapshot
} from 'firebase/firestore';
import {
getAuth,
signInAnonymously,
signInWithCustomToken,
onAuthStateChanged
} from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = JSON.parse(**firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof **app_id !== 'undefined' ? \_\_app_id : 'emergency-info-card';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export default function App() {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [isEditing, setIsEditing] = useState(false);
const [isLocked, setIsLocked] = useState(true);
const [medicalInfo, setMedicalInfo] = useState({
name: '',
bloodGroup: 'Unknown',
allergies: '',
conditions: '',
medications: '',
contacts: [{ name: '', relationship: '', phone: '' }]
});

// Auth Initialization
useEffect(() => {
const initAuth = async () => {
try {
if (typeof **initial_auth_token !== 'undefined' && **initial_auth_token) {
await signInWithCustomToken(auth, \_\_initial_auth_token);
} else {
await signInAnonymously(auth);
}
} catch (error) {
console.error("Auth error:", error);
}
};
initAuth();
const unsubscribe = onAuthStateChanged(auth, (u) => {
setUser(u);
if (!u) setLoading(false);
});
return () => unsubscribe();
}, []);

// Data Sync (RULE 1: Private user path)
useEffect(() => {
if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'medicalInfo', 'card');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMedicalInfo(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();

}, [user]);

const handleSave = async () => {
if (!user) return;
try {
const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'medicalInfo', 'card');
await setDoc(docRef, medicalInfo);
setIsEditing(false);
setIsLocked(true);
} catch (error) {
console.error("Save error:", error);
}
};

const addContact = () => {
setMedicalInfo(prev => ({
...prev,
contacts: [...prev.contacts, { name: '', relationship: '', phone: '' }]
}));
};

const removeContact = (index) => {
setMedicalInfo(prev => ({
...prev,
contacts: prev.contacts.filter((\_, i) => i !== index)
}));
};

const updateContact = (index, field, value) => {
const newContacts = [...medicalInfo.contacts];
newContacts[index][field] = value;
setMedicalInfo(prev => ({ ...prev, contacts: newContacts }));
};

if (loading) {
return (
<div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
<HeartPulse className="w-12 h-12 text-red-500 animate-pulse mb-4" />
<p className="text-slate-500 font-medium">Securing access...</p>
</div>
);
}

return (
<div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans text-slate-900">
<div className="max-w-xl mx-auto pb-10">

        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg shadow-md shadow-red-200">
              <ShieldAlert className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800">EMERGENCY ID</h1>
          </div>

          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`p-2 rounded-full transition-all border ${isLocked ? 'bg-white border-slate-200 text-slate-400' : 'bg-orange-100 border-orange-200 text-orange-600'}`}
                title={isLocked ? "Unlock to Edit" : "Lock to prevent accidental edits"}
              >
                {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
              </button>
            )}
            {!isLocked && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 font-bold text-sm"
              >
                {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                {isEditing ? 'Cancel' : 'Edit Info'}
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          /* Secure Edit Interface */
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 border border-slate-100">
              <Info className="text-blue-500 shrink-0" size={20} />
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide accurate information. This data is used by medical staff during emergencies.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={medicalInfo.name}
                      onChange={(e) => setMedicalInfo({...medicalInfo, name: e.target.value})}
                      placeholder="Enter Full Name"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Type</label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-3 text-red-500" size={18} />
                    <select
                      value={medicalInfo.bloodGroup}
                      onChange={(e) => setMedicalInfo({...medicalInfo, bloodGroup: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none font-bold"
                    >
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severe Allergies</label>
                <textarea
                  value={medicalInfo.allergies}
                  onChange={(e) => setMedicalInfo({...medicalInfo, allergies: e.target.value})}
                  placeholder="List all life-threatening allergies..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none min-h-[80px] font-medium text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chronic Conditions</label>
                <textarea
                  value={medicalInfo.conditions}
                  onChange={(e) => setMedicalInfo({...medicalInfo, conditions: e.target.value})}
                  placeholder="Diabetes, Epilepsy, Asthma, etc."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none min-h-[80px] font-medium text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Medications</label>
                <textarea
                  value={medicalInfo.medications}
                  onChange={(e) => setMedicalInfo({...medicalInfo, medications: e.target.value})}
                  placeholder="Name and dosage of daily meds..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none min-h-[80px] font-medium text-sm"
                />
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">Emergency Contacts</h3>
                  <button
                    onClick={addContact}
                    className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  {medicalInfo.contacts.map((contact, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                      {medicalInfo.contacts.length > 1 && (
                        <button
                          onClick={() => removeContact(idx)}
                          className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-slate-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            placeholder="Name"
                            value={contact.name}
                            onChange={(e) => updateContact(idx, 'name', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                          <input
                            placeholder="Relation"
                            value={contact.relationship}
                            onChange={(e) => updateContact(idx, 'relationship', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <input
                          placeholder="Phone Number"
                          value={contact.phone}
                          onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Save size={18} />
              SYNC SECURE MEDICAL ID
            </button>
          </div>
        ) : (
          /* Emergency Card - High Visibility View Mode */
          <div className="space-y-4">

            {/* Main Identification Header */}
            <div className="bg-red-600 rounded-[2rem] overflow-hidden shadow-2xl shadow-red-200 border-4 border-white transition-all">
              <div className="p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Medical Identity Card</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-white text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-1">
                      <p className="text-xl font-black">{medicalInfo.bloodGroup.replace(/[^A-B]/g, '') || medicalInfo.bloodGroup}</p>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-tighter">{medicalInfo.bloodGroup}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-4xl font-black uppercase leading-none break-words">
                    {medicalInfo.name || "UNREGISTERED"}
                  </h2>
                  <p className="text-red-100/70 text-sm font-bold tracking-widest">
                    {medicalInfo.name ? "Verified Patient Profile" : "Please update profile"}
                  </p>
                </div>
              </div>

              {/* Quick Summary Strip */}
              <div className="bg-white p-6 grid grid-cols-2 gap-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <AlertTriangle className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Allergies</p>
                    <p className={`text-sm font-black leading-tight ${medicalInfo.allergies ? 'text-red-600' : 'text-slate-300'}`}>
                      {medicalInfo.allergies ? medicalInfo.allergies.split(',')[0] + (medicalInfo.allergies.includes(',') ? '...' : '') : 'NONE'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Stethoscope className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Conditions</p>
                    <p className={`text-sm font-black leading-tight ${medicalInfo.conditions ? 'text-slate-800' : 'text-slate-300'}`}>
                      {medicalInfo.conditions ? medicalInfo.conditions.split(',')[0] + (medicalInfo.conditions.includes(',') ? '...' : '') : 'NONE'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Medical Information Panels */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200 space-y-8">

              {/* Detailed Allergies */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-orange-500 w-4 h-4" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Full Allergy Report</h3>
                </div>
                <div className={`p-4 rounded-2xl ${medicalInfo.allergies ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'}`}>
                  <p className={`text-base font-bold leading-relaxed ${medicalInfo.allergies ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                    {medicalInfo.allergies || "No life-threatening allergies recorded."}
                  </p>
                </div>
              </section>

              {/* Medications & Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="text-blue-500 w-4 h-4" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Conditions</h3>
                  </div>
                  <p className={`text-sm font-bold ${medicalInfo.conditions ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                    {medicalInfo.conditions || "None listed"}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Pill className="text-purple-500 w-4 h-4" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Medications</h3>
                  </div>
                  <p className={`text-sm font-bold ${medicalInfo.medications ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                    {medicalInfo.medications || "None listed"}
                  </p>
                </div>
              </div>

              {/* Contacts List */}
              <section className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="text-red-600 w-4 h-4" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Emergency Contacts</h3>
                </div>
                <div className="space-y-3">
                  {medicalInfo.contacts.some(c => c.name || c.phone) ? (
                    medicalInfo.contacts.map((contact, idx) => (
                      (contact.name || contact.phone) && (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <div>
                            <p className="font-black text-slate-900 text-sm leading-none mb-1">{contact.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{contact.relationship}</p>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                          >
                            <Phone size={12} fill="white" />
                            CALL NOW
                          </a>
                        </div>
                      )
                    ))
                  ) : (
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <p className="text-slate-400 text-xs font-bold italic tracking-tight">NO EMERGENCY CONTACTS SAVED</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Locked State Warning */}
            {isLocked && (
              <div className="text-center py-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
                  Card Locked for Safe Viewing
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 px-6 py-4 bg-slate-200/50 rounded-2xl text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
            Emergency Responders: This information is provided by the device owner to assist in treatment during an emergency.
          </p>
        </div>

      </div>
    </div>

);
}
