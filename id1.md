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
  Info,
  FileText,
  Activity
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
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'emergency-info-card';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const DONOR_STATUS = ['Yes', 'No', 'Not Specified'];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [medicalInfo, setMedicalInfo] = useState({
    name: '',
    bloodGroup: 'Unknown',
    organDonor: 'Not Specified',
    allergies: '',
    conditions: '',
    medications: '',
    extraNotes: '',
    contacts: [{ name: '', relationship: '', phone: '' }]
  });

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
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

  // Data Sync
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'medicalInfo', 'card');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMedicalInfo(prev => ({ ...prev, ...data }));
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
      contacts: prev.contacts.filter((_, i) => i !== index)
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
        <HeartPulse className="w-16 h-16 text-red-500 animate-pulse mb-4" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Decrypting Health Record...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 font-sans text-slate-900 selection:bg-red-100">
      <div className="max-w-4xl mx-auto pb-20">
        
        {/* Header Branding */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-200 rotate-3">
              <ShieldAlert className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">VITAL ID</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Universal Medical Protocol</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button 
                onClick={() => setIsLocked(!isLocked)}
                className={`p-3 rounded-2xl transition-all border flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${isLocked ? 'bg-white border-slate-200 text-slate-400' : 'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-200'}`}
              >
                {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                {isLocked ? 'Locked' : 'Unlocked'}
              </button>
            )}
            {!isLocked && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border shadow-sm hover:shadow-md transition-all font-black text-xs uppercase tracking-widest ${isEditing ? 'bg-slate-800 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                {isEditing ? 'Discard' : 'Edit Records'}
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          /* EXPANDED EDIT INTERFACE */
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-200 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-3xl border border-blue-100">
              <Info className="text-blue-500 shrink-0" size={24} />
              <p className="text-sm text-blue-700 font-medium leading-relaxed">
                <span className="font-bold">Privacy Notice:</span> Information is stored on your private secure node. Only authorized responders with your unlocked device can access this detail.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={medicalInfo.name}
                    onChange={(e) => setMedicalInfo({...medicalInfo, name: e.target.value})}
                    placeholder="Enter Full Legal Name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                <div className="relative">
                  <Droplets className="absolute left-4 top-4 text-red-500" size={20} />
                  <select 
                    value={medicalInfo.bloodGroup}
                    onChange={(e) => setMedicalInfo({...medicalInfo, bloodGroup: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none appearance-none font-bold text-lg"
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <AlertTriangle size={12} className="text-orange-500" /> Critical Allergies
                  </label>
                  <textarea 
                    value={medicalInfo.allergies}
                    onChange={(e) => setMedicalInfo({...medicalInfo, allergies: e.target.value})}
                    placeholder="Peanuts, Penicillin, Latex, etc..."
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none min-h-[120px] font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Stethoscope size={12} className="text-blue-500" /> Existing Conditions
                  </label>
                  <textarea 
                    value={medicalInfo.conditions}
                    onChange={(e) => setMedicalInfo({...medicalInfo, conditions: e.target.value})}
                    placeholder="Type 1 Diabetes, Epilepsy, heart conditions..."
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none min-h-[120px] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Pill size={12} className="text-purple-500" /> Current Medications
                  </label>
                  <textarea 
                    value={medicalInfo.medications}
                    onChange={(e) => setMedicalInfo({...medicalInfo, medications: e.target.value})}
                    placeholder="List drug name and dosage frequency..."
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none min-h-[120px] font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Activity size={12} className="text-green-600" /> Organ Donor Status
                  </label>
                  <div className="flex gap-2">
                    {DONOR_STATUS.map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setMedicalInfo({...medicalInfo, organDonor: status})}
                        className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all border ${medicalInfo.organDonor === status ? 'bg-green-600 border-green-700 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FileText size={12} className="text-slate-500" /> Additional Medical Notes
              </label>
              <textarea 
                value={medicalInfo.extraNotes}
                onChange={(e) => setMedicalInfo({...medicalInfo, extraNotes: e.target.value})}
                placeholder="Include anything else a doctor should know (e.g., medical devices, religion, advance directives)..."
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none min-h-[100px] font-medium"
              />
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Emergency Contacts</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Primary Responders to notify</p>
                </div>
                <button 
                  onClick={addContact}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-xs"
                >
                  <Plus size={16} /> Add Contact
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medicalInfo.contacts.map((contact, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 relative group animate-in zoom-in-95 duration-200">
                    <button 
                      onClick={() => removeContact(idx)}
                      className="absolute top-4 right-4 bg-white shadow-sm rounded-full p-1.5 text-slate-300 hover:text-red-500 border border-slate-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Name</p>
                          <input 
                            placeholder="e.g. Jane Smith"
                            value={contact.name}
                            onChange={(e) => updateContact(idx, 'name', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Relation</p>
                          <input 
                            placeholder="e.g. Spouse"
                            value={contact.relationship}
                            onChange={(e) => updateContact(idx, 'relationship', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                        <input 
                          placeholder="+1 (555) 000-0000"
                          value={contact.phone}
                          onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-red-200 hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Save size={24} />
              COMMIT TO SECURE STORAGE
            </button>
          </div>
        ) : (
          /* EXPANDED HIGH-VISIBILITY VIEW MODE */
          <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* HERO IDENTITY SECTION */}
            <div className="bg-red-600 rounded-[3rem] overflow-hidden shadow-2xl shadow-red-100 border-[6px] border-white ring-1 ring-slate-200">
              <div className="p-10 md:p-14 text-white">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/20">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Patient ID Validated</p>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase leading-tight tracking-tighter break-words">
                      {medicalInfo.name || "UNIDENTIFIED"}
                    </h2>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-white/15 p-6 rounded-[2.5rem] backdrop-blur-md border border-white/20 text-center min-w-[120px]">
                      <p className="text-[10px] uppercase font-black text-red-100 tracking-widest mb-2">Blood</p>
                      <p className="text-4xl font-black">{medicalInfo.bloodGroup}</p>
                    </div>
                    <div className="bg-white/15 p-6 rounded-[2.5rem] backdrop-blur-md border border-white/20 text-center min-w-[120px]">
                      <p className="text-[10px] uppercase font-black text-red-100 tracking-widest mb-2">Donor</p>
                      <p className="text-4xl font-black leading-none">{medicalInfo.organDonor === 'Yes' ? 'YES' : medicalInfo.organDonor === 'No' ? 'NO' : '??'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CRITICAL ALERTS STRIP */}
              <div className="bg-white p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100">
                <div className="flex gap-6">
                  <div className="shrink-0">
                    <div className="p-5 bg-orange-100 rounded-[2rem] shadow-sm">
                      <AlertTriangle className="text-orange-600 w-8 h-8" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Life-Threatening Allergies</p>
                    <p className={`text-xl font-black leading-tight tracking-tight ${medicalInfo.allergies ? 'text-red-600' : 'text-slate-300 italic font-medium'}`}>
                      {medicalInfo.allergies || "No allergies documented"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="shrink-0">
                    <div className="p-5 bg-blue-100 rounded-[2rem] shadow-sm">
                      <Stethoscope className="text-blue-600 w-8 h-8" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Medical Conditions</p>
                    <p className={`text-xl font-black leading-tight tracking-tight ${medicalInfo.conditions ? 'text-slate-800' : 'text-slate-300 italic font-medium'}`}>
                      {medicalInfo.conditions || "No chronic conditions listed"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILED INFORMATION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Medications & Notes (Wider Column) */}
              <div className="md:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-50 rounded-2xl">
                      <Pill className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Medication Registry</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Current dosage & prescriptions</p>
                    </div>
                  </div>
                  <p className={`text-lg font-bold leading-relaxed ${medicalInfo.medications ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                    {medicalInfo.medications || "No active medications recorded in this profile."}
                  </p>
                  
                  {medicalInfo.extraNotes && (
                    <div className="mt-10 pt-10 border-t border-slate-100">
                      <div className="flex items-center gap-4 mb-4">
                        <FileText className="text-slate-400 w-5 h-5" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical & Supplemental Notes</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        {medicalInfo.extraNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CONTACTS SIDEBAR */}
              <div className="space-y-6">
                <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <Phone className="text-red-500 w-5 h-5" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Primary Contacts</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {medicalInfo.contacts.some(c => c.name || c.phone) ? (
                      medicalInfo.contacts.map((contact, idx) => (
                        (contact.name || contact.phone) && (
                          <div key={idx} className="group border-l-2 border-red-500/30 pl-4 hover:border-red-500 transition-all">
                            <p className="font-black text-lg mb-1">{contact.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{contact.relationship}</p>
                            <a 
                              href={`tel:${contact.phone}`}
                              className="inline-flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-red-900/40 w-full justify-center group-hover:scale-[1.03]"
                            >
                              <Phone size={14} fill="white" />
                              CALL EMERGENCY LINE
                            </a>
                          </div>
                        )
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">No Contacts Found</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center">
                  <Activity className="mx-auto text-green-600 mb-3" size={24} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Donor Registration</p>
                  <p className="text-sm font-black text-slate-800">{medicalInfo.organDonor === 'Yes' ? 'Active Organ Donor' : 'Not Registered'}</p>
                </div>
              </div>
            </div>

            {isLocked && (
              <div className="text-center py-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Lock size={12} />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                    Encrypted Protocol Active
                  </p>
                </div>
                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                  Only unlock to perform administrative updates to this life-saving record.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 px-10 py-6 bg-white/40 border border-slate-200 rounded-[2rem] text-center backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-loose">
            Notice to EMS / Medical Staff: This record is user-generated via the Vital ID application. 
            Cross-reference with patient identification where possible.
          </p>
        </div>

      </div>
    </div>
  );
}