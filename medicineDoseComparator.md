import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  Trash2, 
  Info, 
  Activity, 
  Search, 
  User, 
  ChevronRight,
  Loader2,
  X,
  RefreshCw,
  Clock
} from 'lucide-react';

// --- Configuration & API Utilities ---
const apiKey = ""; // Provided by environment
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

const apiCall = async (payload) => {
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      if (i === 4) throw e;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// --- Main Application Component ---
export default function App() {
  const [meds, setMeds] = useState([]);
  const [userProfile, setUserProfile] = useState({ age: '', allergies: '' });
  const [analysis, setAnalysis] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // --- Core Logic: Camera & OCR ---
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const captureImage = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    stopCamera();
    processMedicineImage(base64Image);
  };

  const processMedicineImage = async (base64Data) => {
    setIsScanning(true);
    setError(null);
    try {
      const prompt = `Analyze this medicine packaging image. Extract the following information into a valid JSON object:
      {
        "name": "Brand Name",
        "salts": ["Active Ingredient 1", "Active Ingredient 2"],
        "strength": "e.g. 500mg",
        "category": "e.g. NSAID, Antibiotic, Antihistamine",
        "form": "Tablet/Syrup/etc"
      }
      Be as accurate as possible. If text is unclear, provide best guess. Respond ONLY with the JSON block.`;

      const result = await apiCall({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(result.candidates[0].content.parts[0].text);
      addMedication({
        ...data,
        id: crypto.randomUUID(),
        dosePerDay: 1,
        source: 'camera'
      });
    } catch (err) {
      setError("Failed to recognize medicine. Please try manual entry.");
    } finally {
      setIsScanning(false);
    }
  };

  // --- Core Logic: Analysis ---
  const performSafetyAnalysis = async () => {
    if (meds.length === 0) return;
    setIsAnalyzing(true);
    try {
      const prompt = `You are a medical safety system. Analyze these medications for a ${userProfile.age || 'unknown age'} year old user with allergies: [${userProfile.allergies}].
      
      Medications: ${JSON.stringify(meds)}

      Identify:
      1. Salt Overlaps: Any active ingredients appearing in more than one medication.
      2. Therapeutic Overlaps: Multiple medicines from the same class (e.g., 2 different NSAIDs).
      3. Allergy Risks: Ingredients that might trigger the user's reported allergies.
      4. Dosage Alerts: If total daily salt intake seems unusually high.
      
      Return a JSON object:
      {
        "riskLevel": "Low/Moderate/High",
        "summary": "Brief overall safety statement",
        "alerts": [{ "type": "Salt Overlap/Allergy/Therapeutic", "severity": "High/Med/Low", "message": "Details", "recommendation": "Next steps" }],
        "saltStats": [{ "salt": "Name", "totalDailyMeds": 2, "totalDoseEstimate": "1000mg" }]
      }
      DISCLAIMER: This is for educational safety awareness only. Respond ONLY with JSON.`;

      const result = await apiCall({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const analysisData = JSON.parse(result.candidates[0].content.parts[0].text);
      setAnalysis(analysisData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (meds.length > 0) {
      performSafetyAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [meds, userProfile]);

  const addMedication = (newMed) => {
    setMeds(prev => [...prev, newMed]);
    setShowManualForm(false);
  };

  const removeMed = (id) => {
    setMeds(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* --- Persistent Header --- */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">MedSafe</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            SAFETY AWARENESS MODE
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* --- Global Disclaimer --- */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold uppercase block mb-1">Medical Disclaimer</span>
            This system is for educational purposes only. It is not a medical device and does not provide diagnosis or treatment. 
            <strong> Do not stop or modify medication without consulting a doctor.</strong>
          </div>
        </div>

        {/* --- User Profile Section --- */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold">User Health Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Age (Optional)</label>
              <input 
                type="number" 
                placeholder="Years"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={userProfile.age}
                onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Known Allergies</label>
              <input 
                type="text" 
                placeholder="e.g. Penicillin, Peanuts, Sulfa"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={userProfile.allergies}
                onChange={(e) => setUserProfile({...userProfile, allergies: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* --- Analysis Dashboard --- */}
        {analysis && meds.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              analysis.riskLevel === 'High' ? 'bg-red-50 border-red-200' : 
              analysis.riskLevel === 'Moderate' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                   analysis.riskLevel === 'High' ? 'bg-red-500' : 
                   analysis.riskLevel === 'Moderate' ? 'bg-orange-500' : 'bg-green-500'
                }`}>
                  <AlertTriangle className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Overall Risk: {analysis.riskLevel}</h3>
                  <p className="text-sm opacity-80">{analysis.summary}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold border border-current opacity-60">
                  {meds.length} Medicines Checked
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.alerts.map((alert, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {alert.type}
                    </span>
                    <AlertTriangle className={`w-4 h-4 ${alert.severity === 'High' ? 'text-red-500' : 'text-orange-500'}`} />
                  </div>
                  <p className="text-sm font-semibold">{alert.message}</p>
                  <p className="text-xs text-slate-500 italic">{alert.recommendation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Medication Cabinet --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Medication Cabinet
            </h2>
            <div className="flex gap-2">
               <button 
                onClick={startCamera}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Scan Pack
              </button>
              <button 
                onClick={() => setShowManualForm(true)}
                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Manual
              </button>
            </div>
          </div>

          {isScanning && (
             <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <div>
                  <h3 className="font-bold text-slate-700">Analyzing Image...</h3>
                  <p className="text-sm text-slate-500">Our AI is extracting ingredients and brand details</p>
                </div>
             </div>
          )}

          {meds.length === 0 && !isScanning && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-600">Cabinet is Empty</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">Scan your medicine strips or enter them manually to check for safety overlaps.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meds.map((med) => (
              <div key={med.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-blue-300 transition-colors">
                <div className="p-4 flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-blue-600 capitalize">{med.name}</h3>
                    <p className="text-xs font-medium text-slate-500">{med.strength} • {med.form}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {med.salts.map((salt, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {salt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeMed(med.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 px-4 py-2 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.category}</span>
                   <div className="text-[10px] bg-white px-2 py-0.5 border border-slate-200 rounded text-slate-500">
                      {med.dosePerDay} dose / day
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isAnalyzing && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl z-50">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-xs font-bold">Re-analyzing Safety Overlaps...</span>
          </div>
        )}
      </main>

      {/* --- Camera Modal --- */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
          <button 
            onClick={stopCamera}
            className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Viewfinder overlays */}
            <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none" />
            <div className="absolute bottom-10 left-0 right-0 text-center text-white/70 text-xs px-12">
              Center the medicine strip or bottle label inside the frame
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <button 
              onClick={captureImage}
              className="w-20 h-20 rounded-full bg-white border-8 border-white/20 flex items-center justify-center active:scale-90 transition-transform"
            >
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
                <Camera className="text-white w-8 h-8" />
              </div>
            </button>
            <span className="text-white font-bold tracking-widest text-sm">SCAN MEDICINE</span>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* --- Manual Entry Modal --- */}
      {showManualForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Add Medication Manually</h3>
              <button onClick={() => setShowManualForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              addMedication({
                id: crypto.randomUUID(),
                name: form.brandName.value,
                salts: form.salts.value.split(',').map(s => s.trim()),
                strength: form.strength.value,
                form: form.form.value,
                category: "User Input",
                dosePerDay: form.dose.value
              });
            }}>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Brand Name</label>
                <input name="brandName" required placeholder="e.g. Calpol" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Active Salts (Comma Separated)</label>
                <input name="salts" required placeholder="e.g. Paracetamol" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Strength</label>
                  <input name="strength" placeholder="e.g. 500mg" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Doses/Day</label>
                  <input name="dose" type="number" defaultValue="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Dosage Form</label>
                <select name="form" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option>Tablet</option>
                  <option>Syrup</option>
                  <option>Capsule</option>
                  <option>Inhaler</option>
                  <option>Injection</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                Add to Cabinet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Error Toast --- */}
      {error && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-80 bg-red-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-left-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* --- Navigation Help --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around md:hidden">
        <button className="flex flex-col items-center gap-1 text-blue-600">
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-bold">Analysis</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400" onClick={startCamera}>
          <div className="bg-slate-100 p-2 rounded-full -mt-8 border-4 border-white">
            <Camera className="w-6 h-6 text-slate-600" />
          </div>
          <span className="text-[10px] font-bold">Scan</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}