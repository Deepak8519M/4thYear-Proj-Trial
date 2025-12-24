import React, { useState, useEffect } from 'react';
import {
Activity,
AlertCircle,
ChevronRight,
ChevronLeft,
Clipboard,
Info,
ShieldAlert,
CheckCircle2,
Stethoscope,
Clock,
ArrowRight,
User,
Heart,
Search,
RefreshCcw,
BookOpen,
Download,
Loader2,
Plus,
X,
Save
} from 'lucide-react';

/\*\*

- VitalSense: AI Health Assessment System
- Updated:
- - Font changed to Poppins for a premium, modern aesthetic.
- - Browser LocalStorage for persistent data.
- - Premium dark theme with wide layout.
    \*/

// --- Sub-components ---

const ProgressBar = ({ step }) => (

  <div className="w-full h-1.5 bg-zinc-900 rounded-full mb-6 overflow-hidden">
    <div 
      className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
      style={{ width: `${(step / 4) * 100}%` }}
    />
  </div>
);

const Step0Disclaimer = ({ onNext }) => (

  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start gap-3">
      <ShieldAlert className="text-amber-500 shrink-0 w-5 h-5" />
      <div>
        <h3 className="font-semibold text-amber-200 text-sm">Important Medical Disclaimer</h3>
        <p className="text-xs text-amber-100/60 leading-relaxed">
          This tool is for informational purposes only. It is <strong>not a medical diagnosis</strong>. 
        </p>
      </div>
    </div>
    
    <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-3">Welcome to VitalSense AI</h2>
      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        Provide your symptoms to receive a structured analysis designed to help you communicate more effectively with your doctor.
      </p>
      
      <div className="space-y-3 mb-6">
        {[
          "Secure and private assessment",
          "Symptom-to-Summary analysis",
          "Lifestyle and screening recommendations"
        ].map((text, i) => (
          <div key={i} className="flex items-center gap-2.5 text-zinc-300 text-sm">
            <CheckCircle2 className="text-blue-500 w-4 h-4" />
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group"
      >
        Start Assessment
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-center">
      <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">Emergency Notice</p>
      <p className="text-xs text-red-100/60">If you have chest pain or trouble breathing, call 911 immediately.</p>
    </div>

  </div>
);

const Step1Profile = ({ formData, setFormData, commonConditions, toggleMedicalHistory, customInput, setCustomInput, addCustomCondition, onNext, onBack }) => (

  <div className="animate-in fade-in duration-500">
    <h2 className="text-xl font-bold text-white mb-1">Tell us about yourself</h2>
    <p className="text-zinc-500 text-sm mb-6">Basic information helps tailor the assessment.</p>
    
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Age</label>
          <input 
            type="number" 
            placeholder="e.g. 35"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="w-full p-3.5 bg-[#0a0a0a] border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gender</label>
          <select 
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
            className="w-full p-3.5 bg-[#0a0a0a] border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          >
            <option value="" className="bg-[#0a0a0a]">Select</option>
            <option value="Male" className="bg-[#0a0a0a]">Male</option>
            <option value="Female" className="bg-[#0a0a0a]">Female</option>
            <option value="Other" className="bg-[#0a0a0a]">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Medical History</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonConditions.map(condition => (
            <button
              key={condition}
              onClick={() => toggleMedicalHistory(condition)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.medicalHistory.includes(condition)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-[#0a0a0a] border-zinc-800 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>

        <form onSubmit={addCustomCondition} className="flex gap-2">
          <input
            type="text"
            placeholder="Add other condition..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 p-2.5 bg-[#0a0a0a] border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium placeholder:text-zinc-700"
          />
          <button
            type="submit"
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 p-2.5 rounded-xl transition-all border border-zinc-800"
            title="Add Condition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {formData.medicalHistory.filter(c => !commonConditions.includes(c)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.medicalHistory.filter(c => !commonConditions.includes(c)).map(custom => (
              <div key={custom} className="flex items-center gap-2 bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-zinc-800">
                {custom}
                <button onClick={() => toggleMedicalHistory(custom)} className="hover:text-red-500">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    <div className="flex gap-3 mt-10">
      <button onClick={onBack} className="flex-1 py-3.5 text-zinc-500 font-bold rounded-xl border border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all text-sm">Back</button>
      <button
        onClick={onNext}
        disabled={!formData.age || !formData.gender}
        className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-20 transition-all shadow-lg shadow-blue-900/20 text-sm"
      >
        Next
      </button>
    </div>

  </div>
);

const Step2Symptoms = ({ formData, setFormData, durations, onNext, onBack }) => (

  <div className="animate-in fade-in duration-500">
    <h2 className="text-xl font-bold text-white mb-1">Describe your symptoms</h2>
    <p className="text-zinc-500 text-sm mb-6">Enter as much detail as possible. Be descriptive.</p>
    
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Symptom Details</label>
        <textarea 
          placeholder="Describe what you are feeling, e.g., 'Sharp pain in lower back that started yesterday...'"
          value={formData.symptoms}
          onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
          className="w-full h-40 p-4 bg-[#0a0a0a] border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y font-medium text-sm leading-relaxed placeholder:text-zinc-700"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Duration</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {durations.map(d => (
            <button
              key={d}
              onClick={() => setFormData({...formData, duration: d})}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                formData.duration === d
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-[#0a0a0a] border-zinc-800 text-zinc-600 hover:border-zinc-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="flex gap-3 mt-10">
      <button onClick={onBack} className="flex-1 py-3.5 text-zinc-500 font-bold rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-all text-sm">Back</button>
      <button
        onClick={onNext}
        disabled={formData.symptoms.trim().length < 5}
        className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-20 shadow-lg shadow-blue-900/20 text-sm"
      >
        Next
      </button>
    </div>

  </div>
);

const Step3Severity = ({ formData, setFormData, onBack, onAnalyze, isAnalyzing, error }) => (

  <div className="animate-in fade-in duration-500">
    <h2 className="text-xl font-bold text-white mb-1">Severity Level</h2>
    <p className="text-zinc-500 text-sm mb-10">On a scale of 1 to 10, how much is this affecting your day?</p>
    
    <div className="space-y-10 mb-10">
      <div className="relative pt-1 px-4">
        <div className="flex justify-between text-[10px] font-bold text-zinc-600 mb-3 uppercase tracking-wider">
          <span>Mild</span>
          <span>Intense</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={formData.severity}
          onChange={(e) => setFormData({...formData, severity: parseInt(e.target.value)})}
          className="w-full h-3 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between mt-5">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button 
              key={n} 
              onClick={() => setFormData({...formData, severity: n})}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                formData.severity === n ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-900/40' : 'text-zinc-700 hover:text-zinc-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-zinc-800 shadow-2xl flex gap-4 items-center">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg ${
          formData.severity > 7 ? 'bg-red-600 shadow-red-900/20' : formData.severity > 4 ? 'bg-amber-600 shadow-amber-900/20' : 'bg-emerald-600 shadow-emerald-900/20'
        }`}>
          {formData.severity}
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Current Rating: {formData.severity}/10</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {formData.severity > 7 ? 'High impact. Urgent consultation recommended if persistent.' : 'Moderate impact. Monitor closely over the next 48 hours.'}
          </p>
        </div>
      </div>
    </div>

    {error && (
      <div className="mb-6 p-3 bg-red-950/20 text-red-500 text-xs font-medium rounded-xl border border-red-900/40 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    )}

    <div className="flex gap-3 mt-8">
      <button onClick={onBack} className="flex-1 py-3.5 text-zinc-500 font-bold rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-all text-sm">Back</button>
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-20 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 text-sm"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Analysis...
          </>
        ) : 'Generate Health Summary'}
      </button>
    </div>

  </div>
);

const ResultsDashboard = ({ result, onRestart, onDownload, isDownloading }) => (

  <div className="animate-in fade-in zoom-in-95 duration-700 pb-10">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-bold text-white">Health Analysis Summary</h2>
        <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-widest">VitalSense AI Report • {new Date().toLocaleDateString()}</p>
      </div>
      <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest self-start ${
        result.riskLevel === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : result.riskLevel === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
      }`}>
        Risk Level: {result.riskLevel}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2 bg-[#0a0a0a] border border-zinc-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
        <div className="flex items-center gap-3 mb-3">
          <Activity className="text-blue-500 w-4 h-4" />
          <h3 className="font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Medical Context Overview</h3>
        </div>
        <p className="text-zinc-100 leading-relaxed font-medium italic pl-4 text-sm">
          "{result.summary}"
        </p>
      </div>

      <div className="bg-blue-950/10 p-5 rounded-3xl border border-blue-900/20">
        <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-sm">
          <Heart className="w-4 h-4" /> Lifestyle Advice
        </h4>
        <ul className="space-y-2">
          {result.lifestyleAdvice.map((item, idx) => (
            <li key={idx} className="text-xs font-medium text-slate-300 flex gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-indigo-950/10 p-5 rounded-3xl border border-indigo-900/20">
        <h4 className="font-bold text-indigo-400 mb-3 flex items-center gap-2 text-sm">
          <Stethoscope className="w-4 h-4" /> Suggested Screening
        </h4>
        <ul className="space-y-2">
          {result.medicalTests.map((item, idx) => (
            <li key={idx} className="text-xs font-medium text-slate-300 flex gap-2">
              <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-2 bg-[#0a0a0a] p-5 rounded-3xl border border-zinc-800 shadow-xl">
        <h4 className="font-bold text-zinc-600 mb-3 text-[10px] uppercase tracking-widest">Key Areas for Clinical Discussion</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.concerns.map((item, idx) => (
            <div key={idx} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 flex items-center gap-2 shadow-sm hover:border-zinc-600 transition-colors">
              <Search className="w-3.5 h-3.5 text-blue-500" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 p-5 bg-white text-black rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-black tracking-tight text-base">Clinical Summary Aid</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Official AI Assessment Export</p>
          </div>
        </div>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full sm:w-auto bg-black hover:bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center gap-2 text-sm"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? 'Processing...' : 'Download Report'}
        </button>
      </div>

      <button
        onClick={onRestart}
        className="lg:col-span-2 text-zinc-600 hover:text-zinc-300 text-[10px] font-black mx-auto flex items-center gap-2 mt-4 transition-colors uppercase tracking-widest"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        Restart Assessment
      </button>
    </div>

  </div>
);

// --- Main App Component ---

const VitalSense = () => {
const [step, setStep] = useState(0);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [result, setResult] = useState(null);
const [error, setError] = useState(null);
const [isDownloading, setIsDownloading] = useState(false);
const [customInput, setCustomInput] = useState('');

const [formData, setFormData] = useState({
age: '',
gender: '',
symptoms: '',
duration: '1-3 days',
severity: 5,
medicalHistory: []
});

const apiKey = ""; // Use the Gemini API key here
const commonConditions = ["Diabetes", "Hypertension", "Asthma", "High Cholesterol", "Heart Disease"];
const durations = ["< 24h", "1-3 days", "1 week", "2+ weeks", "Chronic"];

// --- LOCAL STORAGE PERSISTENCE ---
const STORAGE_KEY = 'vitalsense_assessment_data';

// Load Progress from Local Storage on Mount
useEffect(() => {
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
try {
const parsed = JSON.parse(saved);
if (parsed.formData) setFormData(parsed.formData);
if (parsed.result) setResult(parsed.result);
if (parsed.step) setStep(parsed.step);
} catch (e) {
console.error("Failed to parse local storage data");
}
}
}, []);

// Save Progress to Local Storage whenever state changes
useEffect(() => {
const dataToSave = {
formData,
result,
step,
lastUpdated: new Date().toISOString()
};
localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}, [formData, result, step]);

const handleNext = () => setStep((prev) => prev + 1);
const handleBack = () => setStep((prev) => prev - 1);

const toggleMedicalHistory = (item) => {
setFormData(prev => ({
...prev,
medicalHistory: prev.medicalHistory.includes(item)
? prev.medicalHistory.filter(i => i !== item)
: [...prev.medicalHistory, item]
}));
};

const addCustomCondition = (e) => {
if (e) e.preventDefault();
const trimmed = customInput.trim();
if (trimmed && !formData.medicalHistory.includes(trimmed)) {
setFormData(prev => ({
...prev,
medicalHistory: [...prev.medicalHistory, trimmed]
}));
setCustomInput('');
}
};

const analyzeHealth = async () => {
setIsAnalyzing(true);
setError(null);

    const systemPrompt = `You are a professional AI Health Assistant. Analyze user symptoms and provide a structured JSON response.
    IMPORTANT: You are NOT a doctor. Do NOT provide diagnoses or prescriptions. Provide awareness and guidance.

    Response Schema:
    {
      "summary": "Professional overview of reported symptoms",
      "riskLevel": "Low | Moderate | High",
      "concerns": ["Area 1", "Area 2"],
      "lifestyleAdvice": ["Advice 1", "Advice 2"],
      "medicalTests": ["Suggested test 1", "Suggested test 2"]
    }`;

    const userQuery = `
      User Profile: ${formData.age} year old ${formData.gender}.
      Symptoms: ${formData.symptoms}
      Duration: ${formData.duration}
      Reported Severity: ${formData.severity}/10
      Medical History: ${formData.medicalHistory.join(', ') || 'None reported'}
    `;

    const fetchWithRetry = async (retries = 5, delay = 1000) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return JSON.parse(textResponse);
      } catch (err) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
        throw err;
      }
    };

    try {
      const aiResponse = await fetchWithRetry();
      setResult(aiResponse);
      setStep(4);
    } catch (err) {
      setError("Analysis unavailable. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }

};

const downloadReport = () => {
setIsDownloading(true);
try {
const reportContent = `
VITALSENSE HEALTH ASSESSMENT REPORT
Generated on: ${new Date().toLocaleString()}

---

USER PROFILE:
Age: ${formData.age}
Gender: ${formData.gender}
Medical History: ${formData.medicalHistory.join(', ') || 'None'}

SYMPTOMS:
Description: ${formData.symptoms}
Duration: ${formData.duration}
Severity Score: ${formData.severity}/10

AI ANALYSIS:
Risk Level: ${result.riskLevel}
Summary: ${result.summary}

POTENTIAL CONCERNS:
${result.concerns.map(c => `- ${c}`).join('\n')}

LIFESTYLE ADVICE:
${result.lifestyleAdvice.map(a => `- ${a}`).join('\n')}

RECOMMENDED TESTS TO DISCUSS WITH DOCTOR:
${result.medicalTests.map(t => `- ${t}`).join('\n')}

---

DISCLAIMER: This report is generated by AI for informational purposes only.
It is NOT a medical diagnosis. Please consult a healthcare professional.
`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VitalSense_Report_${formData.age}_${formData.gender}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }

};

const handleRestart = () => {
localStorage.removeItem(STORAGE_KEY);
setFormData({
age: '',
gender: '',
symptoms: '',
duration: '1-3 days',
severity: 5,
medicalHistory: []
});
setResult(null);
setStep(0);
};

return (
<div className="min-h-screen bg-black p-4 sm:p-6 font-['Poppins'] antialiased text-white selection:bg-blue-500/40 flex flex-col items-center">
<style>{`        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
     `}</style>
<div className="w-full max-w-6xl py-4 pb-12">
<div className="flex items-center gap-4 mb-8">
<div className="bg-blue-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-4 ring-blue-600/10">
<Activity className="text-white w-6 h-6" />
</div>
<div>
<h1 className="text-2xl font-black text-white tracking-tight leading-none">VitalSense</h1>
<div className="flex items-center gap-2 mt-1.5">
<div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
<p className="text-[9px] uppercase tracking-[0.3em] font-black text-blue-500">AI Assessment Core</p>
</div>
</div>
</div>

        <main className="relative mx-auto max-w-4xl">
          {step > 0 && step < 4 && <ProgressBar step={step} />}

          <div className="relative">
            {step === 0 && <Step0Disclaimer onNext={handleNext} />}

            {step === 1 && (
              <Step1Profile
                formData={formData}
                setFormData={setFormData}
                commonConditions={commonConditions}
                toggleMedicalHistory={toggleMedicalHistory}
                customInput={customInput}
                setCustomInput={setCustomInput}
                addCustomCondition={addCustomCondition}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {step === 2 && (
              <Step2Symptoms
                formData={formData}
                setFormData={setFormData}
                durations={durations}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {step === 3 && (
              <Step3Severity
                formData={formData}
                setFormData={setFormData}
                onBack={handleBack}
                onAnalyze={analyzeHealth}
                isAnalyzing={isAnalyzing}
                error={error}
              />
            )}

            {step === 4 && result && (
              <ResultsDashboard
                result={result}
                onRestart={handleRestart}
                onDownload={downloadReport}
                isDownloading={isDownloading}
              />
            )}
          </div>
        </main>

        {step < 4 && (
          <footer className="mt-12 pt-6 border-t border-zinc-900">
            <div className="flex items-center gap-4 text-zinc-700">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full border-4 border-black bg-zinc-900 flex items-center justify-center"><User className="w-5 h-5 text-zinc-800" /></div>
                <div className="w-9 h-9 rounded-full border-4 border-black bg-blue-600 flex items-center justify-center text-white font-black text-[9px] shadow-lg">AI</div>
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest text-zinc-600">
                  Local Sync Active
                </p>
                <p className="text-[9px] text-zinc-800 font-medium">Progress is automatically saved to your browser's local storage.</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>

);
};

export default VitalSense;
